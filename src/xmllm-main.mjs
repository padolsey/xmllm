import {xmllm as xmllmCore} from './xmllm.mjs';
import Stream from './Stream.mjs';
import ProviderManager from './ProviderManager.mjs';
import ChainableStreamInterface from './ChainableStreamInterface.mjs';
import { configure, getConfig, resetConfig } from './config.mjs';
import ValidationService from './ValidationService.mjs';
import { types } from './types.mjs';
import { registerProvider } from './PROVIDERS.mjs';

function xmllm(pipelineFn, options = {}) {
  let providerManager;

  ValidationService.validateLLMPayload(options);

  return xmllmCore(pipelineFn, { 
    ...options, 
    llmStream: options.llmStream || Stream,
    providerManager
  });
}

// Rename export but keep xmllm for backwards compatibility
const pipeline = xmllm;

// Enhanced stream function with mode support
function stream(promptOrConfig, options = {}) {
  let config = {};
  const globalConfig = getConfig();
  
  if (typeof promptOrConfig === 'string') {
    ValidationService.validateLLMPayload(options);
    config = {
      ...globalConfig.defaults,
      prompt: promptOrConfig,
      ...options,
      keys: {
        ...(globalConfig.defaults.keys || {}),
        ...(options.keys || {})
      }
    };
  } else {
    const aggConfig = {
      ...promptOrConfig,
      ...options
    };
    ValidationService.validateLLMPayload(aggConfig);
    config = {
      ...globalConfig.defaults,
      ...aggConfig,
      keys: {
        ...(globalConfig.defaults.keys || {}),
        ...(aggConfig.keys || {})
      }
    };
  }

  const { 
    prompt, 
    schema,
    messages,
    system, 
    mode = 'state_open',
    onChunk, 
    strategy,
    keys,
    ...restOptions 
  } = config;

  // Create provider manager if keys provided
  const providerManager = Object.keys(
    keys || {}
  ).length > 0 ? new ProviderManager({ keys }) : undefined;

  // Validate mode
  if (!['state_open', 'state_closed', 'root_open', 'root_closed'].includes(mode)) {
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
      strategy,
      keys,
      ...modeParams,
      ...restOptions
    }]
  ], {
    llmStream: async (payload) => {
      if (restOptions.llmStream) {
        if (providerManager) {
          return restOptions.llmStream(payload, providerManager);
        } else {
          return restOptions.llmStream(payload);
        }
      }
      return Stream(payload, providerManager);
    }
  });
}

// Simple function also gets mode support
async function simple(promptOrConfig, options = {}) {
  let config = {};
  const globalConfig = getConfig();
  
  if (typeof promptOrConfig === 'string') {
    ValidationService.validateLLMPayload(options);
    config = {
      ...globalConfig.defaults,
      prompt: promptOrConfig,
      ...options
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

  // Default to state_closed mode for simple()
  config.mode = config.mode || 'state_closed';

  return stream(promptOrConfig, options).last();
}

// Attach utility functions to pipeline
pipeline.configure = configure;
pipeline.xmllm = xmllm;
pipeline.pipeline = xmllm;
pipeline.stream = stream;
pipeline.simple = simple;
pipeline.getConfig = getConfig;
pipeline.resetConfig = resetConfig;
pipeline.types = types;
pipeline.registerProvider = registerProvider;

// Export named exports
export {
  configure,
  pipeline,
  xmllm,
  stream,
  simple,
  getConfig,
  resetConfig,
  types,
  registerProvider
};

// Export pipeline as default for backward compatibility
export default pipeline;