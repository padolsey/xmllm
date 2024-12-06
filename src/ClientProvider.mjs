/**
 * Browser-compatible provider that routes requests through a proxy server.
 * 
 * Responsibilities:
 * - Provides browser-safe API access
 * - Handles SSE parsing from proxy
 * - Manages client-side streaming
 * - Transforms proxy responses to ReadableStream
 * 
 * Enables browser usage without exposing API keys by routing through
 * a server-side proxy.
 * 
 * @example
 * const client = new ClientProvider('http://localhost:3124/api/stream');
 * const stream = await client.createStream({
 *   messages: [...],
 *   model: 'claude:fast'
 * });
 */
export class ClientProvider {
  constructor(proxyEndpoint) {
    if (!proxyEndpoint) {
      throw new Error(
        'You must provide a proxy endpoint URL. This is required for browser usage ' +
        'to route requests through your server. Example: ' +
        'new ClientProvider("http://localhost:3124/api/stream")'
      );
    }

    this.endpoint = proxyEndpoint;
  }

  setLogger(logger) {
    this.logger = logger;
  }

  async createStream(payload) {
    if (this.logger) {
      this.logger.info('Client createStream payload', payload);
    }

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    return new ReadableStream({
      async start(controller) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              let data;

              try {
                data = JSON.parse(line.slice(6));
              } catch(e) {
                if (this.logger) {
                  this.logger.error('Invalid chunk/line', line);
                }
              }

              controller.enqueue(new TextEncoder().encode(data?.content || ''));
            }
          }
        }

        controller.close();
      }
    });
  }
} 