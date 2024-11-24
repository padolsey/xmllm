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

// Enhanced stream function with flexible config
export function stream(promptOrConfig, options = {}) {
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

  const { prompt, schema, system, closed, ...restOptions } = config;

  // If schema is provided, use promptComplex style config
  if (schema) {
    return new XMLStream([
      ['req', {
        messages: [{
          role: 'user',
          content: prompt
        }],
        schema,
        system,
        doMapSelectClosed: closed
      }]
    ], restOptions);
  }

  // Basic prompt
  return new XMLStream([
    ['req', prompt]
  ], {
    ...restOptions,
    doMapSelectClosed: closed
  });
}

export function simple(prompt, schema, options = {}) {
  return stream({
    prompt,
    schema,
    closed: true,
    ...options
  })
  .merge()
  .value();
}

export default xmllm;