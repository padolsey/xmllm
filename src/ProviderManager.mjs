import PROVIDERS from './PROVIDERS.mjs';
import Provider from './Provider.mjs';
import Logger from './Logger.mjs';

const logger = new Logger('ProviderManager');
const DEFAULT_MODEL_TYPE = 'fast';

// Default preferred providers list (only used if payload.model is not provided)
const DEFAULT_PREFERRED_PROVIDERS = [
  'claude:good', 
  'openai:good', 
  'claude:fast', 
  'openai:fast'
];

class ProviderManager {
  constructor() {
    this.providers = {};
    for (const [name, details] of Object.entries(PROVIDERS)) {
      this.providers[name] = new Provider(name, details);
    }
  }

  getProviderByPreference(preference) {
    let [providerName, modelType] = preference.split(':');
    modelType = modelType || DEFAULT_MODEL_TYPE;
    
    const provider = this.providers[providerName];
    if (!provider) {
      throw new Error(`Provider ${providerName} not found`);
    }
    if (!provider.models[modelType]) {
      throw new Error(`Model ${modelType} not found for provider ${providerName}`);
    }
    return { provider, modelType };
  }

  async pickProviderWithFallback(payload, action) {
    const preferredProviders = payload.model
      ? Array.isArray(payload.model)
        ? payload.model
        : [payload.model]
      : DEFAULT_PREFERRED_PROVIDERS;

    let lastError = null;

    for (const preference of preferredProviders) {
      try {
        const { provider, modelType } = this.getProviderByPreference(preference);
        if (provider.getAvailable()) {
          logger.log('Trying provider', provider.name, 'with model', modelType);
          try {
            return await action(provider, { ...payload, model: modelType });
          } catch (error) {
            logger.error(`Error from provider ${provider.name}: ${error.message}`);
            lastError = `${provider.name} failed: ${error.message}`;
            if (preferredProviders.length === 1) {
              throw error;
            }
          }
        }
      } catch (error) {
        logger.error(`Error picking preferred provider: ${error.message}`);
      }
    }
    throw new Error(lastError || 'All providers failed to fulfill the request.');
  }

  async request(payload) {
    return this.pickProviderWithFallback(payload, (provider, updatedPayload) => 
      provider.makeRequest(updatedPayload)
    );
  }

  async streamRequest(payload) {
    return this.pickProviderWithFallback(payload, (provider, updatedPayload) => 
      provider.createStream(updatedPayload)
    );
  }
}

export default ProviderManager;
