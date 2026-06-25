const _PQueue = import('p-queue');
import { createHash } from 'crypto';
import { get as getCache, set as setCache, getConfig as getCacheConfig } from './mainCache.mjs';
import Logger from './Logger.mjs';
import ProviderManager from './ProviderManager.mjs';
import { getConfig } from './config.mjs';
import { ProviderRateLimitError, ProviderAuthenticationError, ProviderNetworkError, ProviderTimeoutError } from './errors/ProviderErrors.mjs';

const logger = new Logger('APIStream');

let queue;
// In-flight request coalescing: hash -> Promise<fullContent>. Lets concurrent
// identical requests share a single upstream call (BUG-23).
const ongoingRequests = new Map();

const DEFAULT_CONCURRENCY = 2;
const DEFAULT_WAIT_MESSAGE = "";
const DEFAULT_WAIT_MESSAGE_DELAY = 10000; // 10 seconds
const DEFAULT_RETRY_MAX = 3;
const DEFAULT_RETRY_START_DELAY = 1000; // 1 second
const DEFAULT_RETRY_BACKOFF_MULTIPLIER = 2;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const CACHE_VERSION = '1.1';

/**
 * Derive the cache key for a request payload. Exported for unit testing.
 * Any parameter that materially changes the model output must be included here.
 */
export function deriveCacheKey(payload) {
  const cacheKeyParams = {
    _v: CACHE_VERSION,
    messages: payload.messages,
    model: payload.model,
    temperature: payload.temperature || 0,
    top_p: payload.top_p || 1,
    presence_penalty: payload.presence_penalty || 0,
    frequency_penalty: payload.frequency_penalty || 0,
    // BUG-02: max_tokens and stop materially change the output, so they MUST be
    // part of the key (otherwise a larger request can be served a truncated
    // cached body, or a different stop config a wrongly-terminated one).
    max_tokens: payload.max_tokens ?? payload.maxTokens ?? null,
    // o-series models use max_completion_tokens as the response-length knob.
    max_completion_tokens: payload.max_completion_tokens ?? null,
    stop: payload.stop ?? payload.stop_sequences ?? null,
    ...(payload.system && { system: payload.system }),
  };
  return createHash('md5').update(JSON.stringify(cacheKeyParams)).digest('hex');
}

/**
 * Coordinates high-level stream operations and provider management.
 * 
 * Responsibilities:
 * - Request queueing and concurrency control
 * - Response caching
 * - Provider selection via ProviderManager
 * - Stream initialization and error handling
 * 
 * Sits between the client interface and provider layer, managing the flow
 * of requests and responses.
 * 
 * @example
 * const stream = await APIStream({
 *   messages: [{role: 'user', content: 'Hello'}],
 *   model: 'anthropic:fast'
 * });
 */
export default async function APIStream(payload, injectedProviderManager) {
  const PQueue = (await _PQueue).default;
  const providerManager = injectedProviderManager || new ProviderManager();

  // BUG-12: the queue is a shared module singleton. Honor forcedConcurrency on
  // every call (p-queue supports live concurrency updates), not just the first.
  // Semantics: global, last-writer-wins. Ignore invalid values (a non-positive
  // or non-integer concurrency would otherwise make p-queue throw).
  const validConcurrency =
    Number.isInteger(payload.forcedConcurrency) && payload.forcedConcurrency > 0
      ? payload.forcedConcurrency
      : undefined;
  if (!queue) {
    queue = new PQueue({ concurrency: validConcurrency || DEFAULT_CONCURRENCY });
  } else if (validConcurrency) {
    queue.concurrency = validConcurrency;
  }

  return queue.add(async () => {
    const encoder = new TextEncoder();
    let content = '';

    payload.stream = true;

    if (typeof payload.model === 'string') {
      payload.model = [payload.model];
    }

    // Extract cache control parameters with more granular control
    const {
      cache,          // boolean | { read?: boolean, write?: boolean }
      cacheRead,      // boolean (alternative to cache.read)
      cacheWrite      // boolean (alternative to cache.write)
    } = payload;

    // Normalize cache settings
    const shouldReadCache = cache === true ? true : 
      (typeof cache === 'object' ? cache.read : cacheRead);

    const shouldWriteCache = cache === true ? true :
      (typeof cache === 'object' ? cache.write : cacheWrite);

    let hash = deriveCacheKey(payload);

    // Only check cache if cache reading is enabled
    if (shouldReadCache) {
      let cachedData = await getCache(hash);
      if (cachedData) {
        cachedData = cachedData.value;
        logger.log('Stream: cached', hash);
        return new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode(cachedData));
            controller.close();
          },
        });
      }
    }

    // BUG-23: if an identical request is already in flight, await its content
    // and replay the COMPLETE body (avoids a duplicate upstream call). We replay
    // as a single chunk because the content is whole by the time we join — this
    // is deliberately not a stream tee, which would truncate a late joiner.
    const inflight = ongoingRequests.get(hash);
    if (inflight) {
      try {
        const sharedContent = await inflight;
        logger.log('Stream: coalesced onto in-flight request', hash);
        return new ReadableStream({
          start(controller) {
            if (sharedContent) controller.enqueue(encoder.encode(sharedContent));
            controller.close();
          }
        });
      } catch (e) {
        // The in-flight request failed; fall through and make our own.
      }
    }

    // Register this request so concurrent identical ones can coalesce onto it.
    let resolveContent, rejectContent;
    const contentPromise = new Promise((res, rej) => { resolveContent = res; rejectContent = rej; });
    contentPromise.catch(() => {}); // no unhandled rejection if nobody joins
    ongoingRequests.set(hash, contentPromise);

    const waitMessageString = payload.waitMessageString || DEFAULT_WAIT_MESSAGE;
    const waitMessageDelay = payload.waitMessageDelay || DEFAULT_WAIT_MESSAGE_DELAY;
    const retryMax = payload.retryMax || DEFAULT_RETRY_MAX;
    const retryStartDelay = payload.retryStartDelay || DEFAULT_RETRY_START_DELAY;
    const retryBackoffMultiplier = payload.retryBackoffMultiplier || DEFAULT_RETRY_BACKOFF_MULTIPLIER;

    return new ReadableStream({
      async start(controller) {
        let waitMessageSent = false;
        let waitMessageTimer;

        if (waitMessageString && waitMessageDelay) {
          waitMessageTimer = setTimeout(async () => {
            if (!waitMessageSent) {
              waitMessageSent = true;
              controller.enqueue(encoder.encode(waitMessageString));
            }
          }, waitMessageDelay);
        }

        try {
          if (payload.fakeDelay) {
            await delay(payload.fakeDelay);
          }

          const stream = await providerManager.streamRequest({
            ...payload,
            retryMax,
            retryStartDelay,
            retryBackoffMultiplier
          });

          const reader = stream.getReader();

          if (waitMessageTimer) clearTimeout(waitMessageTimer);

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const decodedValue = new TextDecoder().decode(value);
            content += decodedValue; // Accumulate content
            controller.enqueue(value);
          }

          // BUG-23: content is complete — release it to any coalesced joiners.
          resolveContent(content);

          // Set cache if cache writing is enabled
          if (shouldWriteCache) {
            const contentSize = content.length;
            const cacheConfig = getCacheConfig();
            if (contentSize <= cacheConfig.maxEntrySize) {
              await setCache(hash, content);
            } else {
              logger.warn(`Content too large to cache (${contentSize} chars)`);
            }
          }
        } catch (error) {
          logger.error('Error in stream:', error);
          rejectContent(error); // signal coalesced joiners to make their own request
          if (waitMessageTimer) clearTimeout(waitMessageTimer);
          if (!waitMessageSent) {
            const config = getConfig();

            if (error instanceof ProviderRateLimitError) {
              const errorMessage = payload?.errorMessages?.rateLimitExceeded || 
                config.defaults.errorMessages.rateLimitExceeded;
              controller.enqueue(encoder.encode(errorMessage));
            } else if (error instanceof ProviderAuthenticationError) {
              const errorMessage = payload?.errorMessages?.authenticationFailed || 
                config.defaults.errorMessages.authenticationFailed;
              controller.enqueue(encoder.encode(errorMessage));
            } else if (error instanceof ProviderNetworkError) {
              const errorMessage = payload?.errorMessages?.networkError || 
                config.defaults.errorMessages.networkError;
              controller.enqueue(encoder.encode(errorMessage));
            } else if (error instanceof ProviderTimeoutError) {
              const errorMessage = payload?.errorMessages?.serviceUnavailable || 
                config.defaults.errorMessages.serviceUnavailable;
              controller.enqueue(encoder.encode(errorMessage));
            } else {
              const errorMessage = payload?.errorMessages?.genericFailure || 
                config.defaults.errorMessages.genericFailure;
              controller.enqueue(encoder.encode(errorMessage));
            }
          }
        } finally {
          // Backstop: ensure the coalescing promise always settles, even on an
          // abnormal exit (e.g. consumer cancel), so joiners can never hang.
          // No-op if already resolved/rejected above.
          rejectContent(new Error('stream closed before completion'));
          ongoingRequests.delete(hash); // stop coalescing onto a finished request
          controller.close();
        }
      }
    });
  });
}

// Test hooks (consistent with mainCache's _reset/_setModified helpers).
export function _resetStreamState() {
  queue = undefined;
  ongoingRequests.clear();
}

export function _getConcurrency() {
  return queue?.concurrency;
}
