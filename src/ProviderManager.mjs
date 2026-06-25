import PROVIDERS, { createCustomModel } from './PROVIDERS.mjs';
import Provider from './Provider.mjs';
import Logger from './Logger.mjs';
import {
  ProviderAuthenticationError,
  ProviderTimeoutError
} from './errors/ProviderErrors.mjs';

const logger = new Logger('ProviderManager');

// A key is unusable if it is absent, empty, or the explicit NO_KEY sentinel.
const isUnusableKey = (k) => k == null || k === '' || k === 'NO_KEY';

// Default preferred providers list (only used if payload.model is not provided)
const DEFAULT_PREFERRED_PROVIDERS = [
  'anthropic:good',
  'openai:good',
  'anthropic:fast',
  'openai:fast'
];

/**
 * Orchestrates multiple Provider instances and handles provider selection.
 * 
 * 
 * ponsibilities:
 * - Manages provider pool and initialization
 * - Handles provider fallback logic
 * - Creates custom provider configurations
 * - Routes requests to appropriate providers
 * - Manages provider-level error handling
 * 
 * Acts as a facade for the Provider layer, abstracting provider complexity
 * from the Stream layer.
 * 
 * @example
 * const manager = new ProviderManager();
 * const stream = await manager.streamRequest({
 *   messages: [...],
 *   model: ['anthropic:fast', 'openai:fast']
 * });
 */
class ProviderManager {
  constructor(config = {}) {
    this.providers = {};
    this.fallbackConfig = {
      maxRetriesPerProvider: 3,
      baseRetryDelay: 1000,
      backoffMultiplier: 2,
      fatalErrorCodes: ['AUTH_ERROR'],
      maxRetries500: 1,
      skipProviderOn500: true
    };

    for (const [name, details] of Object.entries(PROVIDERS)) {
      // Priority: runtime/configured key > env var
      const key = config.keys?.[name] || 
                  process.env[`${name.toUpperCase()}_API_KEY`];
      
      this.providers[name] = new Provider(name, {
        ...details,
        key
      });
    }
  }

  getProviderByPreference(preference) {
    logger.log('getProviderByPreference', preference);
    if (typeof preference === 'object' && preference.inherit) {
      return this.createCustomProvider(preference);
    }

    // Split on the FIRST colon only: the model id itself may contain colons
    // (e.g. OpenRouter slugs like "vendor/model:free"/":nitro").
    const colonIndex = preference.indexOf(':');
    const providerName = colonIndex === -1 ? preference : preference.slice(0, colonIndex);
    const modelName = colonIndex === -1 ? undefined : preference.slice(colonIndex + 1);

    const provider = this.providers[providerName];
    if (!provider) {
      throw new Error(`Provider ${providerName} not found`);
    }

    // Add check for missing API key (consistent with createCustomProvider).
    if (isUnusableKey(provider.key)) {
      logger.error(
        `No API key found for provider "${providerName}". Add ${providerName.toUpperCase()}_API_KEY to your environment variables or pass it in your configuration.`
      );
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

    logger.log('Preferred providers:', preferredProviders); // Debug

    let lastError = null;
    const MAX_RETRIES_PER_PROVIDER = payload.retryMax !== undefined 
      ? payload.retryMax 
      : 3;
    const baseRetryDelay = process.env.NODE_ENV === 'test'
      ? 100  // Much shorter in tests
      : (payload.retryStartDelay || 1000);
    const backoffMultiplier = process.env.NODE_ENV === 'test'
      ? 1.5  // Slower growth in tests
      : (payload.retryBackoffMultiplier || 2);

    logger.log('Max retries:', MAX_RETRIES_PER_PROVIDER); // Debug

    for (const preference of preferredProviders) {
      try {
        const { provider, modelType } = this.getProviderByPreference(preference);
        logger.log('Trying provider', provider.name, 'with model', modelType);
        
        let consecutiveServerErrors = 0;
        // BUG-09: reset backoff per provider so a fallback provider starts from
        // the base delay rather than inheriting the previous provider's growth.
        let retryDelay = baseRetryDelay;
        const isOnlyProvider = preferredProviders.length === 1;
        
        for (let retry = 0; retry <= MAX_RETRIES_PER_PROVIDER; retry++) {
          try {
            logger.log(`Attempt ${retry + 1} for ${provider.name}`); // Debug
            const result = await action(provider, { ...payload, model: modelType });
            logger.log('Provider succeeded:', provider.name); // Debug
            return result;
          } catch (error) {
            logger.error(`Error from provider ${provider.name} (attempt ${retry + 1}):`, error);
            lastError = error;
            logger.log('Moving to next retry or provider'); // Debug

            // Don't retry auth errors regardless of fallback availability
            if (error instanceof ProviderAuthenticationError) {
              logger.warn(`Authentication error for ${provider.name}, skipping retries`);
              break;
            }

            // BUG-07: only retry transient failures. Permanent client errors
            // (404/400/429, etc.) should fail fast / fall through to the next
            // provider rather than consuming the entire retry budget. 5xx are
            // handled below; timeouts are explicitly kept retryable.
            const isTransient = provider.shouldRetry(error) || error instanceof ProviderTimeoutError;
            if (!isTransient) {
              logger.warn(`Non-retryable error from ${provider.name}; not retrying this provider`);
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

            if (retry < MAX_RETRIES_PER_PROVIDER) {
              const currentDelay = isOnlyProvider
                ? Math.min(retryDelay, 5000) // Cap delay at 5s if it's our only option
                : retryDelay;
                
              logger.log(`Retrying ${provider.name} in ${currentDelay}ms... (${isOnlyProvider ? 'no fallbacks available' : 'has fallbacks'})`);
              await new Promise(resolve => setTimeout(resolve, currentDelay));
              retryDelay *= backoffMultiplier;
            }
          }
        }
        
        logger.log('All retries failed for provider:', provider.name); // Debug
        
        if (isOnlyProvider) {
          logger.error(`All retries failed for ${provider.name} with no fallback options available`);
        } else {
          logger.warn(`All retries failed for provider ${provider.name}, moving to next provider`);
        }
      } catch (error) {
        logger.error(`Error picking preferred provider: ${error.message}`);
      }
    }

    logger.log('All providers failed'); // Debug
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

    // Warn only when there is NO usable key from either source. The effective
    // key is `config.key || baseProvider.key` (see createCustomModel), so a
    // warning is warranted only when both are unusable.
    if (isUnusableKey(key) && isUnusableKey(baseProvider.key)) {
      logger.error(
        `No API key found for provider "${inherit}". Add ${inherit.toUpperCase()}_API_KEY to your environment variables or pass it in your configuration.`
      );
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
