const _PQueue = import('p-queue');
import { createHash } from 'crypto';
import { get as getCache, set as setCache } from './mainCache.mjs';
import Logger from './Logger.mjs';
import ProviderManager from './ProviderManager.mjs';

const logger = new Logger('APIStream');
let queue;
const providerManager = new ProviderManager();  
const ongoingRequests = new Map();

const DEFAULT_CONCURRENCY = 2;
const DEFAULT_WAIT_MESSAGE = "[still loading]";
const DEFAULT_WAIT_MESSAGE_DELAY = 10000; // 10 seconds
const DEFAULT_RETRY_MAX = 3;
const DEFAULT_RETRY_START_DELAY = 1000; // 1 second
const DEFAULT_RETRY_BACKOFF_MULTIPLIER = 2;
const FAILURE_MESSAGE = "It seems we have encountered issues responding, please try again later or get in touch with the website owner.";

// Add this line to create a delay function
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function* waitMessageGenerator() {
  yield "Apologies for the wait. Still waiting for the provider...";
}

export default async function APIStream(payload) {
  const PQueue = (await _PQueue).default;

  queue = queue || new PQueue({ concurrency: payload.forcedConcurrency || DEFAULT_CONCURRENCY });

  return queue.add(async () => {
    const encoder = new TextEncoder();

    payload.stream = true;

    if (typeof payload.model === 'string') {
      payload.model = [payload.model];
    }

    let hash = createHash('md5').update(JSON.stringify(payload)).digest('hex');

    let cachedData = await getCache(hash);
    let ongoingRequest = ongoingRequests.get(hash);

    if (cachedData) {
      cachedData = cachedData.value;
      logger.log('OpenAIStream: cached', hash);
      return new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(cachedData));
          controller.close();
        },
      });
    } else if (ongoingRequest) {
      logger.log('Request currently ongoing: we are awaiting and tee\'ing the stream', hash);
      const ongoingRequestStream = await ongoingRequest;
      const [stream1, stream2] = ongoingRequestStream.tee();
      ongoingRequests.set(hash, stream2);
      return stream1;
    } else {
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
              controller.enqueue(value);
            }
          } catch (error) {
            logger.error('Error in stream:', error);
            if (waitMessageTimer) clearTimeout(waitMessageTimer);
            if (!waitMessageSent) {
              controller.enqueue(encoder.encode(FAILURE_MESSAGE));
            }
          } finally {
            controller.close();
          }
        }
      });
    }
  });
}
