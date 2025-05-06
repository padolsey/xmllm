const _PQueue = import('p-queue');
import { createHash } from 'crypto';
import { get as getCache, set as setCache, getConfig as getCacheConfig } from './mainCache.mjs';
import Logger from './Logger.mjs';
import ProviderManager from './ProviderManager.mjs';
import { getConfig } from './config.mjs';
import { ProviderRateLimitError, ProviderAuthenticationError, ProviderNetworkError, ProviderTimeoutError } from './errors/ProviderErrors.mjs';

const logger = new Logger('APIStream');

let queue;
const ongoingRequests = new Map();

const DEFAULT_CONCURRENCY = 2;
const DEFAULT_WAIT_MESSAGE = "";
const DEFAULT_WAIT_MESSAGE_DELAY = 10000; // 10 seconds
const DEFAULT_RETRY_MAX = 3;
const DEFAULT_RETRY_START_DELAY = 1000; // 1 second
const DEFAULT_RETRY_BACKOFF_MULTIPLIER = 2;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const CACHE_VERSION = '1.0';

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

  queue = queue || new PQueue({ concurrency: payload.forcedConcurrency || DEFAULT_CONCURRENCY });

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

    // Extract relevant parameters for cache key
    const cacheKeyParams = {
      _v: CACHE_VERSION,
      messages: payload.messages,
      model: payload.model,
      temperature: payload.temperature || 0,
      top_p: payload.top_p || 1,
      presence_penalty: payload.presence_penalty || 0,
      frequency_penalty: payload.frequency_penalty || 0,
      ...(payload.system && { system: payload.system }),
    };

    let hash = createHash('md5').update(JSON.stringify(cacheKeyParams)).digest('hex');

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

    let ongoingRequest = ongoingRequests.get(hash);
    if (ongoingRequest) {
      logger.log('Request currently ongoing: we are awaiting and tee\'ing the stream', hash);
      const ongoingRequestStream = await ongoingRequest;
      const [stream1, stream2] = ongoingRequestStream.tee();
      ongoingRequests.set(hash, stream2);
      return stream1;
    }

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
          controller.close();
        }
      }
    });
  });
}
