import xmllm from './xmllm.mjs';

class ClientProvider {
  constructor(endpoint = 'http://localhost:3000/api/stream') {
    this.endpoint = endpoint;
  }

  async createStream(payload) {
    console.log('createStream', payload);

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
              const data = JSON.parse(line.slice(6));
              controller.enqueue(new TextEncoder().encode(data.content));
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

  console.log('XMLLM Client', clientProvider, options)

  const llmStream = typeof clientProvider === 'string'
    ? clientLlmStream(new ClientProvider(clientProvider))
    : clientLlmStream(clientProvider);

  return xmllm(pipelineFn, { ...options, llmStream });
}

export { xmllmClient as xmllm, ClientProvider };
export default { ClientProvider, xmllm: xmllmClient };