import {xmllm} from './xmllm.mjs';
import XMLStream from './XMLStream.mjs';

class ClientProvider {
  constructor(endpoint) {

    if (!endpoint) {
      throw new Error('You must provide an endpoint for the client provider');
    }

    this.endpoint = endpoint;
  }

  async createStream(payload) {

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

function stream(promptOrConfig, options = {}, clientProvider) {
  const llmStream = (
    typeof clientProvider === 'string'
      ? clientLlmStream(new ClientProvider(clientProvider))
      : clientLlmStream(clientProvider)
  );

  let config = {};
  
  // Handle different argument patterns
  if (typeof promptOrConfig === 'string') {
    config = {
      prompt: promptOrConfig,
      ...options
    };
  } else if (typeof promptOrConfig === 'object') {
    config = {
      ...promptOrConfig,
      ...options
    };
  }

  const { prompt, schema, system, ...restOptions } = config;

  // If schema is provided, use schema-style config
  if (schema) {
    return new XMLStream([
      ['req', {
        messages: [{
          role: 'user',
          content: prompt
        }],
        schema,
        system
      }]
    ], {
      ...restOptions,
      llmStream
    });
  }

  // Basic prompt
  return new XMLStream([
    ['req', prompt]
  ], {
    ...restOptions,
    llmStream
  });
}

export { xmllmClient as xmllm, ClientProvider, stream };
export default { ClientProvider, xmllm: xmllmClient, stream };
