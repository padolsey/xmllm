const _PQueue = import('p-queue');
import { createHash } from 'crypto';
import { get as getCache, set as setCache } from './mainCache.mjs';
import Logger from './Logger.mjs';
import ProviderManager from './ProviderManager.mjs';
import { DEFAULT_CONFIG } from './mainCache.mjs';
import { getConfig } from './config.mjs';
import { ProviderRateLimitError } from './errors/ProviderErrors.mjs';

const logger = new Logger('APIStream');
let queue;
const providerManager = new ProviderManager();  
const ongoingRequests = new Map();

const DEFAULT_CONCURRENCY = 2;
const DEFAULT_WAIT_MESSAGE = "";
const DEFAULT_WAIT_MESSAGE_DELAY = 10000; // 10 seconds
const DEFAULT_RETRY_MAX = 3;
const DEFAULT_RETRY_START_DELAY = 1000; // 1 second
const DEFAULT_RETRY_BACKOFF_MULTIPLIER = 2;

// Add this line to create a delay function
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
 *   model: 'claude:fast'
 * });
 */
export default async function APIStream(payload) {
  const PQueue = (await _PQueue).default;

  queue = queue || new PQueue({ concurrency: payload.forcedConcurrency || DEFAULT_CONCURRENCY });

  return queue.add(async () => {
    const encoder = new TextEncoder();
    let content = '';

    payload.stream = true;

    if (typeof payload.model === 'string') {
      payload.model = [payload.model];
    }

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

    // Only check cache if caching is explicitly enabled
    if (payload.cache === true) {
      let cachedData = await getCache(hash);
      if (cachedData) {
        cachedData = cachedData.value;
        logger.log('OpenAIStream: cached', hash);
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

          // Set cache if caching is enabled and content isn't too large
          if (payload.cache === true) {
            const contentSize = content.length;
            if (contentSize <= DEFAULT_CONFIG.maxEntrySize) {
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

            const errorMessage = error instanceof ProviderRateLimitError 
              ? (payload?.errorMessages?.rateLimitExceeded || config.defaults.errorMessages.rateLimitExceeded)
              : (payload?.errorMessages?.genericFailure || config.defaults.errorMessages.genericFailure);

              controller.enqueue(encoder.encode(errorMessage));
          }
        } finally {
          controller.close();
        }
      }
    });
  });
}
