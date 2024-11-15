import PROVIDERS, { createCustomModel } from './PROVIDERS.mjs';
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
    this.fallbackConfig = {
      maxRetriesPerProvider: 3,
      baseRetryDelay: 1000,
      backoffMultiplier: 2,
      fatalErrorCodes: ['AUTH_ERROR'],
      maxRetries500: 1, // Max retries for 500 errors
      skipProviderOn500: true // Whether to skip to next provider on 500
    };
    for (const [name, details] of Object.entries(PROVIDERS)) {
      this.providers[name] = new Provider(name, details);
    }
  }

  getProviderByPreference(preference) {
    logger.log('getProviderByPreference', preference);
    if (typeof preference === 'object' && preference.inherit) {
      return this.createCustomProvider(preference);
    }

    let [providerName, modelName] = preference.split(':');
    
    const provider = this.providers[providerName];
    if (!provider) {
      throw new Error(`Provider ${providerName} not found`);
    }

    // If it's a predefined model type (fast, good, etc)
    if (provider.models[modelName]) {
      return { provider, modelType: modelName };
    }
    
    // If it's a custom model name, create a custom provider
    return this.createCustomProvider({
      inherit: providerName,
      name: modelName
    });
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
        logger.log('Trying provider', provider.name, 'with model', modelType);
        
        let consecutiveServerErrors = 0;
        const isOnlyProvider = preferredProviders.length === 1;
        
        for (let retry = 0; retry < MAX_RETRIES_PER_PROVIDER; retry++) {
          try {
            return await action(provider, { ...payload, model: modelType });
          } catch (error) {
            logger.error(`Error from provider ${provider.name} (attempt ${retry + 1}):`, error);
            lastError = error;

            // Don't retry auth errors regardless of fallback availability
            if (error instanceof ProviderAuthenticationError) {
              logger.warn(`Authentication error for ${provider.name}, skipping retries`);
              break;
            }

            // Track consecutive 500 errors
            if (error.statusCode === 500) {
              consecutiveServerErrors++;
              
              // If this is our only provider option, be more persistent
              if (isOnlyProvider) {
                // Keep trying unless we've had many consecutive failures
                if (consecutiveServerErrors >= 5) {
                  logger.warn(`Provider ${provider.name} returned 5 consecutive 500 errors with no fallback available`);
                  break;
                }
              } else {
                // If we have fallbacks, move on after 2 consecutive 500s
                if (consecutiveServerErrors >= 2) {
                  logger.warn(`Provider ${provider.name} returned multiple 500 errors, trying next provider`);
                  break;
                }
              }
            } else {
              consecutiveServerErrors = 0; // Reset counter for non-500 errors
            }

            if (retry < MAX_RETRIES_PER_PROVIDER - 1) {
              const currentDelay = isOnlyProvider 
                ? Math.min(retryDelay, 5000) // Cap delay at 5s if it's our only option
                : retryDelay;
                
              logger.info(`Retrying ${provider.name} in ${currentDelay}ms... (${isOnlyProvider ? 'no fallbacks available' : 'has fallbacks'})`);
              await new Promise(resolve => setTimeout(resolve, currentDelay));
              retryDelay *= backoffMultiplier;
            }
          }
        }
        
        if (isOnlyProvider) {
          logger.error(`All retries failed for ${provider.name} with no fallback options available`);
        } else {
          logger.warn(`All retries failed for provider ${provider.name}, moving to next provider`);
        }
      } catch (error) {
        logger.error(`Error picking preferred provider: ${error.message}`);
      }
    }

    throw new Error(
      lastError?.message || 
      `All providers failed to fulfill the request${preferredProviders.length === 1 ? ' (no fallbacks were available)' : ''}`
    );
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
    const { 
      inherit,
      name,
      endpoint,
      key,
      maxContextSize,
      headerGen,
      payloader,
      constraints
    } = customConfig;
    
    const baseProvider = this.providers[inherit];
    
    if (!baseProvider) {
      throw new Error(`Base provider ${inherit} not found for custom configuration`);
    }

    // Create a new provider instance with custom settings
    const customProvider = new Provider(
      `${inherit}_custom`,
      createCustomModel(baseProvider, {
        name,
        endpoint,
        key,
        maxContextSize,
        headerGen,
        payloader,
        constraints
      })
    );

    return {
      provider: customProvider,
      modelType: 'custom'
    };
  }
}

export default ProviderManager;
