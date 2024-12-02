import {xmllm} from './xmllm.mjs';
import XMLStream from './XMLStream.mjs';
import Logger from './Logger.mjs';

// Import configuration functions
// import { configure, getConfig } from './xmllm-main.mjs';
import { getConfig, configure } from './config.mjs';

const logger = new Logger('ClientProvider');

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
    logger.info('Client createStream payload', payload);

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
                logger.error('Invalid chunk/line', line);
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

// Enhanced stream function with mode support - sync with xmllm-main.mjs
function stream(promptOrConfig, options = {}) {
  const config = getConfig();
  let streamConfig = {};
  
  if (typeof promptOrConfig === 'string') {
    streamConfig = {
      ...config.defaults,  // Apply defaults first
      ...options,  // Allow overrides
      messages: [{
        role: 'user',
        content: promptOrConfig
      }],
    };
  } else {
    streamConfig = {
      ...config.defaults,  // Apply defaults first
      ...promptOrConfig,  // Config object overrides defaults
      ...options  // Explicit options override everything
    };
  }

  const { 
    prompt, 
    schema, 
    messages,
    system,
    mode = 'state_open',  // Default to state mode
    onChunk, 
    ...restOptions 
  } = streamConfig;

  // Validate mode
  if (!['state_open', 'root_closed', 'state_closed', 'root_open'].includes(mode)) {
    throw new Error('Invalid mode. Must be one of: state_open, state_closed, root_open, root_closed');
  }

  // Convert mode to low-level parameters
  const modeParams = schema && mode ? {
    // Shows growing state including partials
    state_open: {
      includeOpenTags: true,
      doDedupe: false
    },
    // Shows complete state at each point
    state_closed: {
      includeOpenTags: false,
      doDedupe: false
    },
    // Shows each root element's progress once
    root_open: {
      includeOpenTags: true,
      doDedupe: true
    },
    // Shows each complete root element once
    root_closed: {
      includeOpenTags: false,
      doDedupe: true
    }
  }[mode] : {};

  if (messages && prompt) {
    throw new Error('Cannot provide both messages and (prompt or system)');
  }

  const _messages = messages || [];

  if (prompt) {
    _messages.push({
      role: 'user',
      content: prompt
    });
  }

  if (!restOptions.clientProvider) {
    throw new Error('clientProvider is required');
  }

  return new XMLStream([
    ['req', {
      messages: _messages,
      system,
      schema,
      onChunk,
      ...modeParams,
      ...restOptions
    }]
  ], {
    llmStream: clientLlmStream(restOptions.clientProvider)
  });
}

// Simple function with mode support
export async function simple(prompt, schema, options = {}) {
  const { mode = 'state_closed', ...restOptions } = options;
  
  const result = await stream(prompt, {
    ...restOptions,
    schema,
    mode
  }).last();
  
  return result;
}

// Export configuration function for client-side use
export { configure, xmllmClient as xmllm, ClientProvider, stream };
export default { configure, ClientProvider, xmllm: xmllmClient, stream };
