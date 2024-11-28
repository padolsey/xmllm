import xmllmCore from './xmllm.mjs';
import Stream from './Stream.mjs';
import { createProvidersWithKeys } from './PROVIDERS.mjs';
import ProviderManager from './ProviderManager.mjs';
import XMLStream from './XMLStream.mjs';

function xmllm(pipelineFn, options = {}) {
  let providerManager;
  
  if (options.apiKeys) {
    const providers = createProvidersWithKeys(options.apiKeys);
    providerManager = new ProviderManager(providers);
  }

  return xmllmCore(pipelineFn, { 
    ...options, 
    llmStream: options.llmStream || Stream,
    providerManager
  });
}

// Enhanced stream function with mode support
export function stream(promptOrConfig, options = {}) {
  let config = {};
  
  if (typeof promptOrConfig === 'string') {
    config = {
      prompt: promptOrConfig,
      ...options
    };
  } else {
    config = {
      ...promptOrConfig,
      ...options
    };
  }

  const { 
    prompt, 
    schema, 
    system, 
    mode = 'state',  // Default to state mode
    onChunk, 
    ...restOptions 
  } = config;

  // Validate mode
  if (!['state', 'delta', 'snapshot', 'realtime'].includes(mode)) {
    throw new Error('Invalid mode. Must be one of: state, delta, snapshot, realtime');
  }

  // Convert mode to low-level parameters
  const modeParams = {
    // State mode: Show growing state including partials
    state: {
      includeOpenTags: true,
      doDedupe: false
    },
    // Delta mode: Only show new complete elements
    delta: {
      includeOpenTags: false,
      doDedupe: true
    },
    // Snapshot mode: Show current complete state
    snapshot: {
      includeOpenTags: false,
      doDedupe: false
    },
    // Realtime mode: Show everything including empty tags
    realtime: {
      includeOpenTags: true,
      doDedupe: false,
      includeEmpty: true
    }
  }[mode];

  // If schema is provided, use schema-based configuration
  if (schema) {
    return new XMLStream([
      ['req', {
        messages: [{
          role: 'user',
          content: prompt
        }],
        schema,
        system,
        onChunk,
        ...modeParams,  // Apply mode parameters
        ...restOptions
      }]
    ], {
      llmStream: restOptions.llmStream || Stream
    });
  }

  // Basic prompt without schema
  return new XMLStream([
    ['req', prompt]
  ], {
    ...restOptions,
    ...modeParams  // Apply mode parameters
  });
}

// Simple function also gets mode support
export async function simple(prompt, schema, options = {}) {
  const { mode = 'delta', ...restOptions } = options;

  const result = await stream(prompt, {
    ...restOptions,
    schema,
    mode
  }).last();

  return result;
}

export default xmllm;