import xmllmCore from './xmllm.mjs';
import Stream from './Stream.mjs';
import { createProvidersWithKeys } from './PROVIDERS.mjs';
import ProviderManager from './ProviderManager.mjs';

function xmllm(pipelineFn, options = {}) {
  let providerManager;
  
  if (options.apiKeys) {
    const providers = createProvidersWithKeys(options.apiKeys);
    providerManager = new ProviderManager(providers);
  }

  return xmllmCore(pipelineFn, { 
    ...options, 
    llmStream: options.Stream || Stream,
    providerManager
  });
}

export default xmllm;