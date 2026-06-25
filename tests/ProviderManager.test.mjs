import { jest } from '@jest/globals';
import ProviderManager from '../src/ProviderManager.mjs';
import Provider from '../src/Provider.mjs';
import {
  ProviderAuthenticationError,
  ProviderNetworkError,
  ProviderTimeoutError,
  ProviderRateLimitError
} from '../src/errors/ProviderErrors.mjs';
import { configure, resetConfig } from '../src/config.mjs';

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

  describe('BUG-06: model ids containing ":" are preserved', () => {
    test('keeps the full model id after the first colon (e.g. ":free" suffix)', () => {
      // OpenRouter et al. use slugs like "vendor/model:free"; only the FIRST
      // colon separates provider from model id.
      const { provider, modelType } = providerManager.getProviderByPreference(
        'openrouter:vendor/model:free'
      );
      expect(modelType).toBe('custom');
      expect(provider.name).toBe('openrouter_custom');
      expect(provider.models.custom.name).toBe('vendor/model:free');
    });

    test('still splits ordinary provider:type on the first colon', () => {
      const { provider, modelType } = providerManager.getProviderByPreference('anthropic:fast');
      expect(provider.name).toBe('anthropic');
      expect(modelType).toBe('fast');
    });
  });

  describe('BUG-08: "No API key" warning fires only when the effective key is missing', () => {
    let customLogger;
    beforeEach(() => {
      customLogger = jest.fn();
      configure({ logging: { custom: customLogger } });
      // Base provider with NO key, so the only key source is the preference.
      providerManager.providers.anthropic = new Provider('anthropic', {
        endpoint: 'https://test.anthropic.com',
        models: { fast: { name: 'claude-instant' } }
      });
    });
    afterEach(() => {
      resetConfig();
      configure({ logging: { level: 'DEBUG' } });
    });

    const warnedNoKey = () => customLogger.mock.calls.some(
      args => args.some(a => typeof a === 'string' && a.includes('No API key found'))
    );

    test('warns when neither the custom key nor the inherited key is usable', () => {
      providerManager.getProviderByPreference({ inherit: 'anthropic', name: 'custom-model' });
      expect(warnedNoKey()).toBe(true);
    });

    test('does NOT warn when a valid custom key is provided', () => {
      providerManager.getProviderByPreference({ inherit: 'anthropic', name: 'custom-model', key: 'sk-valid' });
      expect(warnedNoKey()).toBe(false);
    });

    test('getProviderByPreference treats the NO_KEY sentinel as unusable (parity with custom path)', () => {
      providerManager.providers.anthropic.key = 'NO_KEY';
      providerManager.getProviderByPreference('anthropic:fast');
      expect(warnedNoKey()).toBe(true);
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

  describe('BUG-07/09/10: retry policy in pickProviderWithFallback', () => {
    const msg = { messages: [{ role: 'user', content: 'x' }] };

    test('BUG-07: does NOT retry non-transient client errors (404)', async () => {
      const action = jest.fn().mockRejectedValue(new ProviderNetworkError('anthropic', 404, 'not found'));
      await expect(providerManager.pickProviderWithFallback(
        { ...msg, model: 'anthropic:fast', retryMax: 3 }, action
      )).rejects.toThrow();
      expect(action).toHaveBeenCalledTimes(1);
    });

    test('BUG-07: still retries transient errors (503)', async () => {
      const action = jest.fn().mockRejectedValue(new ProviderNetworkError('anthropic', 503, 'unavailable'));
      await expect(providerManager.pickProviderWithFallback(
        { ...msg, model: 'anthropic:fast', retryMax: 2 }, action
      )).rejects.toThrow();
      expect(action).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
    });

    test('BUG-07: rate-limit (429) errors are not retried at the manager level', async () => {
      const action = jest.fn().mockRejectedValue(
        new ProviderRateLimitError('anthropic', 1000, [{ type: 'rpm', resetInMs: 1000 }])
      );
      await expect(providerManager.pickProviderWithFallback(
        { ...msg, model: 'anthropic:fast', retryMax: 3 }, action
      )).rejects.toThrow();
      expect(action).toHaveBeenCalledTimes(1);
    });

    test('BUG-07: still retries timeouts (no regression)', async () => {
      const action = jest.fn().mockRejectedValue(new ProviderTimeoutError('anthropic', 1000));
      await expect(providerManager.pickProviderWithFallback(
        { ...msg, model: 'anthropic:fast', retryMax: 2 }, action
      )).rejects.toThrow();
      expect(action).toHaveBeenCalledTimes(3);
    });

    test('BUG-10: delays before every retry including the final one', async () => {
      const spy = jest.spyOn(global, 'setTimeout');
      const action = jest.fn().mockRejectedValue(new ProviderNetworkError('anthropic', 503, 'unavailable'));
      await expect(providerManager.pickProviderWithFallback(
        { ...msg, model: 'anthropic:fast', retryMax: 3 }, action
      )).rejects.toThrow();
      const delays = spy.mock.calls.filter(c => typeof c[1] === 'number' && c[1] >= 100);
      spy.mockRestore();
      expect(action).toHaveBeenCalledTimes(4);   // 4 attempts
      expect(delays.length).toBe(3);             // 3 inter-attempt delays
    });

    test('BUG-09: backoff resets per provider on fallback', async () => {
      const spy = jest.spyOn(global, 'setTimeout');
      const action = jest.fn().mockRejectedValue(new ProviderNetworkError('p', 503, 'unavailable'));
      await expect(providerManager.pickProviderWithFallback(
        { ...msg, model: ['anthropic:fast', 'openai:fast'], retryMax: 2 }, action
      )).rejects.toThrow();
      const delays = spy.mock.calls.filter(c => typeof c[1] === 'number' && c[1] >= 100).map(c => c[1]);
      spy.mockRestore();
      // Each provider does 2 retries starting from the base delay (100),
      // so the base delay appears exactly once per provider.
      expect(delays.filter(d => d === 100).length).toBe(2);
    });
  });
}); 