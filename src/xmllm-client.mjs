import {xmllm} from './xmllm.mjs';
import ChainableStreamInterface from './ChainableStreamInterface.mjs';
import { ClientProvider } from './ClientProvider.mjs';
import { getConfig, configure } from './config.mjs';

function clientLlmStream(clientProvider) {
  const provider = typeof clientProvider === 'string' 
    ? new ClientProvider(clientProvider)
    : clientProvider;

  return async function(payload) {
    return provider.createStream(payload);
  };
}

function xmllmClient(pipelineFn, options = {}) {
  const llmStream = clientLlmStream(
    options.clientProvider || getConfig().clientProvider
  );
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

  // Use default clientProvider if none provided - now checking top-level config
  if (!streamConfig.clientProvider && !config.clientProvider) {
    throw new Error('clientProvider is required - either pass it directly or set via configure()');
  }

  const { 
    prompt, 
    schema, 
    messages,
    system,
    mode = 'state_open',
    onChunk,
    clientProvider = config.clientProvider,  // Use top-level config
    ...restOptions
  } = streamConfig;

  // Validate mode
  if (![
    'state_open', 
    'root_closed', 
    'state_closed', 
    'root_open'
  ].includes(mode)) {
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

  return new ChainableStreamInterface([
    ['req', {
      messages: _messages,
      system,
      schema,
      onChunk,
      ...modeParams,
      ...restOptions
    }]
  ], {
    llmStream: clientLlmStream(clientProvider)
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
