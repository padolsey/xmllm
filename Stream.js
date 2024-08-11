const _PQueue = import('p-queue');
const { createHash } = require('crypto');
const { get: getCache, set: setCache } = require('./mainCache.js');
const Logger = require('./logger.js');
const ProviderManager = require('./ProviderManager.js');

const logger = new Logger('APIStream');
let queue;
const providerManager = new ProviderManager();  
const ongoingRequests = new Map();

module.exports = async function APIStream(payload) {

  const PQueue = (await _PQueue).default;

  queue = queue || new PQueue({ concurrency: 2 });


  // return queue.add(async () => {
  //   const encoder = new TextEncoder();

  //   payload.stream = true;
  //   let hash = createHash('md5').update(JSON.stringify(payload)).digest('hex');

  //   let cachedData = await getCache(hash);
  //   let ongoingRequest = ongoingRequests.get(hash);

  //   if (cachedData) {
  //     cachedData = cachedData.value;
  //     logger.log('OpenAIStream: cached', hash);
  //     return new ReadableStream({
  //       start(controller) {
  //         controller.enqueue(encoder.encode(cachedData));
  //         controller.close();
  //       },
  //     });
  //   } else if (ongoingRequest) {
  //     logger.log('Request currently ongoing: we are awaiting and tee\'ing the stream', hash);
  //     const ongoingRequestStream = await ongoingRequest;
  //     const [stream1, stream2] = ongoingRequestStream.tee();
  //     ongoingRequests.set(hash, stream2);
  //     return stream1;
  //   } else {
  //     let streamPromise = providerManager.streamRequest(payload);
  //     streamPromise = streamPromise.then(stream => {
  //       const [stream1, stream2] = stream.tee();
  //       ongoingRequests.set(hash, stream2);
  //       return stream1;
  //     });
  //     ongoingRequests.set(hash, streamPromise);
  //     return streamPromise;
  //   }
  return queue.add(async () => {
    const encoder = new TextEncoder();

    payload.stream = true;
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
      let streamPromise = providerManager.streamRequest(payload);
      streamPromise = streamPromise.then(stream => {
        const [stream1, stream2] = stream.tee();
        ongoingRequests.set(hash, stream2);
        return stream1;
      });
      ongoingRequests.set(hash, streamPromise);
      return streamPromise;
    }
  });
}
