import { ProxyBase } from '../ProxyBase.mjs';
import Stream from '../Stream.mjs';

class DefaultProxy extends ProxyBase {
  async handleStreaming(data, res) {

    const {
      messages,
      model,
      max_tokens,
      maxTokens,
      temperature,
      top_p,
      topP,
      presence_penalty,
      presencePenalty,
      errorMessages,
      fakeDelay,
      stop,
      cache,
      stream
    } = data;

    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    const theStream = await Stream({
      messages,
      max_tokens: max_tokens || maxTokens,
      temperature,
      top_p: top_p || topP,
      presence_penalty: presence_penalty || presencePenalty,
      errorMessages: {
        ...(this.config.errorMessages || {}),
        ...(errorMessages || {})
      },
      stop,
      fakeDelay,
      model,
      cache,
      stream: stream == null ? true : stream
    });

    await this.streamManager.createStream(theStream, res);
  }
}

export default function createServer(config) {
  return new DefaultProxy(config).listen();
}
