import PROVIDERS from './PROVIDERS.mjs';
import Provider from './Provider.mjs';
import Logger from './Logger.mjs';

const logger = new Logger('ProviderManager');
const DEFAULT_MODEL_TYPE = 'fast';

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

  pickProvider(excludeProviders = [], payload) {
    const preferredProviders = Array.isArray(payload.model) ? payload.model : [payload.model];

    if (preferredProviders.length > 0) {
      for (const preference of preferredProviders) {
        try {
          const { provider, modelType } = this.getProviderByPreference(preference);
          if (provider.getAvailable() && !excludeProviders.includes(provider)) {
            console.log('PICKING provider', provider.name, 'with model', modelType);
            return { provider, modelType };
          }
        } catch (error) {
          logger.error(`Error picking preferred provider: ${error.message}`);
        }
      }
    }
    return { provider: undefined, modelType: undefined };
  }

  async request(payload) {
    let lastError = null;
    let providersTried = [];
    const preferredProviders = Array.isArray(payload.model) ? payload.model : [payload.model];
    const totalProviders = preferredProviders.length;

    while (providersTried.length < totalProviders) {
      const { provider, modelType } = this.pickProvider(providersTried, payload);
      if (!provider) {
        throw new Error(lastError || 'No available providers');
      }
      logger.log('Trying provider', provider.name);

      providersTried.push(provider);

      try {
        return await provider.makeRequest({ ...payload, model: modelType });
      } catch (error) {
        logger.error(`Error from provider ${provider.name}: ${error.message}`);
        lastError = `${provider.name} failed: ${error.message}`;
        if (preferredProviders.length === 1) {
          throw error;
        }
      }
    }
    throw new Error('All providers failed to fulfill the request.');
  }

  async streamRequest(payload) {
    let lastError = null;
    let providersTried = [];
    const preferredProviders = Array.isArray(payload.model) ? payload.model : [payload.model];
    const totalProviders = preferredProviders.length;

    while (providersTried.length < totalProviders) {
      const { provider, modelType } = this.pickProvider(providersTried, payload);
      if (!provider) {
        throw new Error(lastError || 'No available provider for streaming');
      }
      logger.log('Trying provider', provider.name, 'with model', modelType);
      providersTried.push(provider);

      try {
        return await provider.createStream({ ...payload, model: modelType });
      } catch (error) {
        logger.error(`Streaming error from provider ${provider.name}: ${error.message}`);
        lastError = `${provider.name} failed: ${error.message}`;
        if (preferredProviders.length === 1) {
          throw error;
        }
      }
    }
    throw new Error('All providers failed to fulfill the stream request.');
  }
}

export default ProviderManager;
