import { jest } from '@jest/globals';
import ProviderManager from '../src/ProviderManager.mjs';
import Provider from '../src/Provider.mjs';
import { ProviderAuthenticationError } from '../src/errors/ProviderErrors.mjs';
import { configure } from '../src/config.mjs';

configure({
  logging: {
    level: 'DEBUG'
  }
});

describe('ProviderManager', () => {
  let providerManager;

  beforeEach(() => {
    providerManager = new ProviderManager();
  });

  describe('Provider Selection', () => {
    test('selects provider by string preference', async () => {
      const { provider, modelType } = providerManager.getProviderByPreference('anthropic:fast');
      
      expect(provider.name).toBe('anthropic');
      expect(modelType).toBe('fast');
    });

    test('throws on invalid provider', () => {
      expect(() => 
        providerManager.getProviderByPreference('invalid:fast')
      ).toThrow('Provider invalid not found');
    });
  });

  describe('Custom Model Configuration', () => {
    test('creates custom provider with payloader', () => {
      const customPayloader = jest.fn(payload => ({
        custom_messages: payload.messages,
        custom_temp: payload.temperature
      }));

      const { provider } = providerManager.getProviderByPreference({
        inherit: 'anthropic',
        name: 'custom-model',
        payloader: customPayloader
      });

      expect(provider.payloader).toBe(customPayloader);
      expect(provider.models.custom.name).toBe('custom-model');
    });

    test('creates custom provider with headerGen', () => {
      const customHeaderGen = jest.fn(() => ({
        'X-Custom-Header': 'custom-value'
      }));

      const { provider } = providerManager.getProviderByPreference({
        inherit: 'anthropic',
        name: 'custom-model',
        headerGen: customHeaderGen
      });

      expect(provider.headerGen).toBe(customHeaderGen);
    });

    test('inherits base provider settings correctly', () => {
      const { provider } = providerManager.getProviderByPreference({
        inherit: 'anthropic',
        name: 'custom-model',
        endpoint: 'https://custom-endpoint.com'
      });

      expect(provider.endpoint).toBe('https://custom-endpoint.com');
      expect(provider.constraints).toEqual(
        expect.objectContaining(providerManager.providers.anthropic.constraints)
      );
    });

    test('validates custom model configuration', () => {
      expect(() => 
        providerManager.getProviderByPreference({
          inherit: 'anthropic',
          name: 'custom-model',
          endpoint: 'not-a-url'
        })
      ).toThrow('Invalid endpoint URL');
    });
  });

  describe('Provider Fallback', () => {
    beforeEach(() => {
      // Create providers with retries disabled
      providerManager = new ProviderManager();

      providerManager.providers.anthropic = new Provider('anthropic', {
        key: 'test-key',
        endpoint: 'https://test.anthropic.com',
        models: {
          fast: { name: 'claude-instant' }
        }
      });

      providerManager.providers.openai = new Provider('openai', {
        key: 'test-key',
        endpoint: 'https://test.openai.com',
        models: {
          fast: { name: 'gpt-3.5-turbo' }
        }
      });

      // Mock createStream after provider creation
      providerManager.providers.anthropic.createStream = jest.fn();
      providerManager.providers.openai.createStream = jest.fn();
    });

    test('tries fallback providers in order', async () => {
      const mockStream = { getReader: () => ({ read: jest.fn() }) };
      
      // Mock first provider to fail
      providerManager.providers.anthropic.createStream
        .mockRejectedValueOnce(new Error('((TEST)) First provider failed'));
      
      // Mock second provider to succeed
      providerManager.providers.openai.createStream
        .mockResolvedValueOnce(mockStream);

      const result = await providerManager.streamRequest({
        messages: [{ role: 'user', content: 'test' }],
        model: ['anthropic:fast', 'openai:fast'],
        // Disable retries in the payload
        retryMax: 0,
        retryStartDelay: 0,
        retryBackoffMultiplier: 1
      });

      expect(providerManager.providers.anthropic.createStream).toHaveBeenCalled();
      expect(providerManager.providers.openai.createStream).toHaveBeenCalled();
      expect(result).toBe(mockStream);
    });
  });
}); 