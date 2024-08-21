const PROVIDERS = require('./PROVIDERS.js');
const Provider = require('./Provider.js');

const Logger = require('./logger.js');

const logger = new Logger('ProviderManager');

class ProviderManager {
  constructor() {
    this.providers = Object.entries(PROVIDERS).map(([name, details]) => new Provider(name, details));
  }

  /**
   * Selects the best available provider based on current availability and cost,
   * excluding any providers that have already been tried.
   * @param {Array} excludeProviders - An array of providers that should be excluded from selection.
   */
  pickProvider(excludeProviders = []) {
    // Filter out providers that are not available or have been tried already.
    const availableProviders = this.providers.filter(provider => 
      provider.getAvailable() && !excludeProviders.includes(provider)
    );

    // Sort the available providers by cost, choosing the lowest cost option available.
    availableProviders.sort((a, b) => a.cost - b.cost);

    // Return the cheapest available provider or undefined if no providers are available.
    return availableProviders.length > 0 ? availableProviders[0] : undefined;
  }

  async request(payload) {
    let lastError = null;
    let providersTried = [];
    while (providersTried.length < this.providers.length) {
      const provider = this.pickProvider(providersTried);
      if (!provider) {
        throw new Error(lastError || 'No available providers');
      }
      logger.log('Trying provider', provider.name);

      providersTried.push(provider);

      try {
        return await provider.makeRequest(payload);
      } catch (error) {
        logger.error(`Error from provider ${provider.name}: ${error.message}`);
        lastError = `${provider.name} failed, trying next one`;
        // if (!error.message.includes('401')) {
        //   throw error;
        // }
        // lastError = `Authorization failed for ${provider.name}, trying next provider.`;
      }
    }
    throw new Error('All providers failed to fulfill the request.');
  }

  async streamRequest(payload) {
    let lastError = null;
    let providersTried = [];
    while (providersTried.length < this.providers.length) {
      const provider = this.pickProvider(providersTried);
      if (!provider) {
        throw new Error(lastError || 'No available provider for streaming');
      }
      logger.log('Trying provider', provider.name);
      providersTried.push(provider);

      try {
        return await provider.createStream(payload);
      } catch (error) {
        logger.error(`Streaming error from provider ${provider.name}: ${error.message}`);
        if (!error.message.includes('401')) {
          throw error;
        }
        lastError = `Authorization failed for ${provider.name}, trying next provider.`;
      }
    }
    throw new Error('All providers failed to fulfill the stream request.');
  }
}

module.exports = ProviderManager;
