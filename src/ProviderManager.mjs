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
    logger.log('getProviderByPreference', preference);
    if (typeof preference === 'object' && preference.inherit) {
      return this.createCustomProvider(preference);
    }

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
    const MAX_RETRIES_PER_PROVIDER = payload.retryMax || 3;
    let retryDelay = payload.retryStartDelay || 1000;
    const backoffMultiplier = payload.retryBackoffMultiplier || 2;

    for (const preference of preferredProviders) {
      try {
        const { provider, modelType } = this.getProviderByPreference(preference);
        if (provider.getAvailable()) {
          logger.log('Trying provider', provider.name, 'with model', modelType);
          
          for (let retry = 0; retry < MAX_RETRIES_PER_PROVIDER; retry++) {
            try {
              return await action(provider, { ...payload, model: modelType });
            } catch (error) {
              logger.error(`Error from provider ${provider.name} (attempt ${retry + 1}): ${error.message}`);
              lastError = `${provider.name} failed: ${error.message}`;
              
              if (retry < MAX_RETRIES_PER_PROVIDER - 1) {
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                retryDelay *= backoffMultiplier;
              }
            }
          }
          
          logger.warn(`All retries failed for provider ${provider.name}, moving to next provider`);
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

  createCustomProvider(customConfig) {

    // Useful when wishing to 'inherit' from a traditional provider
    // E.g. using the OpenAI protocol

    const { inherit, name, endpoint, key } = customConfig;
    const baseProvider = this.providers[inherit];

    if (!baseProvider) {
      throw new Error(`Base provider ${inherit} not found for custom configuration`);
    }

    // Create a new provider instance with custom settings
    const customProvider = new Provider(
      `${inherit}_custom`,
      {
        ...baseProvider,
        endpoint: endpoint || baseProvider.endpoint,
        key: key || baseProvider.key,
        models: {
          custom: { name: name }
        },
        constraints: baseProvider.constraints
      }
    );

    return {
      provider: customProvider,
      modelType: 'custom'
    };
  }
}

export default ProviderManager;
