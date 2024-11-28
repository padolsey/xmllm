import {xmllm} from './xmllm.mjs';
import XMLStream from './XMLStream.mjs';

class ClientProvider {
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

  async createStream(payload) {
    console.log('Client createStream payload', payload);

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
                console.error('Invalid chunk/line', line);
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

function clientLlmStream(clientProvider) {
  return async function(payload) {
    return clientProvider.createStream(payload);
  };
}

function xmllmClient(pipelineFn, clientProvider, options = {}) {
  const llmStream = typeof clientProvider === 'string'
    ? clientLlmStream(new ClientProvider(clientProvider))
    : clientLlmStream(clientProvider);

  return xmllm(pipelineFn, { ...options, llmStream });
}

// Enhanced stream function with mode support
function stream(promptOrConfig, options = {}) {
  const { clientProvider, mode = 'state', ...restOptions } = options;

  if (!clientProvider) {
    throw new Error(
      'ClientProvider is required for browser usage. Example: ' +
      'stream("prompt", { clientProvider: new ClientProvider("http://your-proxy/api/stream") })'
    );
  }

  const llmStream = (
    typeof clientProvider === 'string'
      ? clientLlmStream(new ClientProvider(clientProvider))
      : clientLlmStream(clientProvider)
  );

  let config = {};
  
  if (typeof promptOrConfig === 'string') {
    config = {
      prompt: promptOrConfig,
      mode,  // Pass through mode
      ...restOptions
    };
  } else {
    config = {
      ...promptOrConfig,
      mode: promptOrConfig.mode || mode,  // Use provided mode or default
      ...restOptions
    };
  }

  const { prompt, schema, system, onChunk } = config;

  // If schema is provided, use schema-based config
  return new XMLStream([
    ['req', {
      messages: [{
        role: 'user',
        content: prompt
      }],
      schema,
      system,
      onChunk,
      ...config  // Pass all config including mode
    }]
  ], {
    ...restOptions,
    llmStream
  });
}

// Simple function with mode support
export async function simple(prompt, schema, options = {}) {
  const { mode = 'delta', ...restOptions } = options;
  
  const theStream = await stream(prompt, {
    ...restOptions,
    schema,
    mode  // Pass through mode
  });
  
  const result = await theStream.last();
  return result;
}

export { xmllmClient as xmllm, ClientProvider, stream };
export default { ClientProvider, xmllm: xmllmClient, stream };
