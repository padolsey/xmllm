import { xmllm } from './xmllm.mjs';
import ChainableStreamInterface from './ChainableStreamInterface.mjs';
import { ClientProvider } from './ClientProvider.mjs';
import { getConfig, configure, resetConfig } from './config.mjs';
import ValidationService from './ValidationService.mjs';
import { types } from './types.mjs';

function clientLlmStream(clientProvider) {
  const provider = typeof clientProvider === 'string' 
    ? new ClientProvider(clientProvider)
    : clientProvider;

  if (!provider) {
    throw new Error('clientProvider is required');
  }

  return async function(payload) {
    return provider.createStream(payload);
  };
}

function xmllmClient(pipelineFn, options = {}) {
  const llmStream = clientLlmStream(
    options.clientProvider || getConfig().clientProvider
  );
  const finalConfig = { ...options, llmStream };
  ValidationService.validateLLMPayload(finalConfig);
  return xmllm(pipelineFn, finalConfig);
}

// Enhanced stream function with mode support - sync with xmllm-main.mjs
function stream(promptOrConfig, options = {}) {
  let config = {};
  const globalConfig = getConfig();
  
  // Add security check for keys
  if (promptOrConfig?.keys || options?.keys) {
    console.error(`
⚠️ Security Warning: API keys detected in client-side code!
   
   Never expose API keys in client-side code as they can be stolen.
   Instead:
   1. Set up xmllm-proxy on your server
   2. Configure your API keys there
   3. Use clientProvider to connect to your proxy
   
   Example:
   import { stream } from 'xmllm/client';
   
   stream('prompt', {
     clientProvider: 'https://xmllm-proxy.your-server.com/api/stream'
   });
   
   See: https://github.com/padolsey/xmllm/blob/main/docs/providers.md
`);
    throw new Error('API keys are not supported in client-side code for security reasons. Use xmllm-proxy instead.');
  }

  if (typeof promptOrConfig === 'string') {
    ValidationService.validateLLMPayload(options);

    config = {
      ...globalConfig.defaults,
      ...options,
      messages: [{
        role: 'user',
        content: promptOrConfig
      }],
    };
  } else {
    const aggConfig = {
      ...promptOrConfig,
      ...options
    };

    ValidationService.validateLLMPayload(aggConfig);

    config = {
      ...globalConfig.defaults,
      ...aggConfig
    };
  }

  // Use default clientProvider if none provided - now checking top-level config
  if (!config.clientProvider && !globalConfig.clientProvider) {
    throw new Error('clientProvider is required - either pass it directly or set via configure()');
  }

  const { 
    prompt, 
    schema, 
    messages,
    system,
    mode = 'state_open',
    onChunk,
    clientProvider = globalConfig.clientProvider,  // Use top-level config
    ...restOptions
  } = config;

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
async function simple(promptOrConfig, options = {}) {
  // Default to state_closed mode for simple()
  if (typeof promptOrConfig === 'string') {
    options.mode = options.mode || 'state_closed';
  } else {
    promptOrConfig.mode = promptOrConfig.mode || 'state_closed';
  }
  
  return stream(promptOrConfig, options).last();
}

function clientRegisterProvider() {
  throw new Error(`
⚠️ registerProvider() is not available in the client build.

For security reasons, providers should only be registered server-side
where API keys can be kept private. Use xmllm-proxy instead:

1. Set up xmllm-proxy on your server
2. Register providers there
3. Use clientProvider to connect to your proxy

Example:
import { stream } from 'xmllm/client';

stream('prompt', {
  clientProvider: 'https://xmllm-proxy.your-server.com/api/stream'
});

See: https://github.com/padolsey/xmllm/blob/main/docs/providers.md
`);
}

// Export named exports
export {
  configure,
  xmllmClient as xmllm,
  ClientProvider,
  stream,
  xmllmClient as pipeline,
  simple,
  getConfig,
  resetConfig,
  types,
  clientRegisterProvider as registerProvider
};

// Attach utility functions to xmllmClient
xmllmClient.configure = configure;
xmllmClient.stream = stream;
xmllmClient.simple = simple;
xmllmClient.pipeline = xmllmClient;
xmllmClient.xmllm = xmllmClient;
xmllmClient.getConfig = getConfig;
xmllmClient.resetConfig = resetConfig;
xmllmClient.ClientProvider = ClientProvider;
xmllmClient.types = types;
xmllmClient.registerProvider = clientRegisterProvider;

// Export default
export default xmllmClient;