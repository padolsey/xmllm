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
 *   model: 'anthropic:fast'
 * });
 */

import { getConfig } from './config.mjs';

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

  createErrorStream(message) {
    return new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(message));
        controller.close();
      }
    });
  }

  async createStream(payload) {
    if (this.logger) {
      this.logger.log('Client createStream payload', payload);
    }

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const config = getConfig();
        let errorMessage;
        
        const errorMessages = {
          ...config.defaults.errorMessages,
          ...payload.errorMessages
        };
        
        switch (response.status) {
          case 429:
            errorMessage = errorMessages.rateLimitExceeded;
            break;
          case 400:
            errorMessage = errorMessages.invalidRequest;
            break;
          case 401:
          case 403:
            errorMessage = errorMessages.authenticationFailed;
            break;
          case 404:
            errorMessage = errorMessages.resourceNotFound;
            break;
          case 502:
          case 503:
          case 504:
            errorMessage = errorMessages.serviceUnavailable;
            break;
          default:
            errorMessage = errorMessages.unexpectedError;
        }

        // Try to get more detailed error from response if available
        try {
          const errorBody = await response.json();
          if (errorBody?.message) {
            errorMessage = errorBody.message;
          }
        } catch (e) {
          // Ignore JSON parsing errors
        }

        if (this.logger) {
          this.logger.log('Client createStream error', errorMessage);
        }

        return this.createErrorStream(errorMessage);
      }

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
    } catch (error) {
      const config = getConfig();
      const errorMessages = {
        ...config.defaults.errorMessages,
        ...payload.errorMessages
      };
      if (this.logger) {
        this.logger.log('Client createStream error', error, errorMessages.networkError);
      }
      return this.createErrorStream(errorMessages.networkError);
    }
  }
} 