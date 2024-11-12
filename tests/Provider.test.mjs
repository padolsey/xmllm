import { jest } from '@jest/globals';
import Provider from '../src/Provider.mjs';
import xmllm from '../src/xmllm-main.mjs';
import { createProvidersWithKeys } from '../src/PROVIDERS.mjs';
import {
  ProviderRateLimitError,
  ProviderAuthenticationError,
  ProviderTimeoutError,
  ProviderNetworkError
} from '../src/errors/ProviderErrors.mjs';

describe('Provider Error Handling', () => {
  let provider;
  let mockFetch;

  beforeEach(() => {
    jest.useFakeTimers();
    mockFetch = jest.fn();
    provider = new Provider('test', {
      endpoint: 'https://test.api',
      key: 'test-key',
      models: { fast: { name: 'test-model' } },
      constraints: { rpmLimit: 10 }
    }, mockFetch, {
      circuitBreakerThreshold: 3,
      circuitBreakerResetTime: 100,
      REQUEST_TIMEOUT_MS: 100
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('handles rate limiting correctly', async () => {
    const retryAfter = '30';
    const mockResponse = {
      ok: false,
      status: 429,
      text: () => Promise.resolve('Rate limited'),
      headers: {
        get: (name) => name === 'Retry-After' ? retryAfter : null
      }
    };

    mockFetch.mockImplementation(() => Promise.resolve(mockResponse));

    try {
      await provider.makeRequest({
        messages: [{ role: 'user', content: 'test' }]
      });
      throw new Error('Expected error was not thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(ProviderRateLimitError);
      expect(error.code).toBe('RATE_LIMIT_ERROR');
      expect(error.provider).toBe('test');
      expect(error.retryAfter).toBe(retryAfter);
      expect(error.timestamp).toBeDefined();
      expect(new Date(error.timestamp)).toBeInstanceOf(Date); // Valid timestamp
    }
  });

  test('circuit breaker opens after multiple failures', async () => {
    mockFetch.mockRejectedValue(new Error('API Error'));

    // Fail three times to trigger circuit breaker
    for (let i = 0; i < 3; i++) {
      await expect(provider.makeRequest({
        messages: [{ role: 'user', content: 'test' }]
      })).rejects.toThrow();
    }

    // Fourth request should fail immediately with circuit breaker error
    await expect(provider.makeRequest({
      messages: [{ role: 'user', content: 'test' }]
    })).rejects.toThrow('Circuit breaker is open');
  });

  test('circuit breaker resets after cooldown', async () => {
    mockFetch.mockRejectedValue(new Error('API Error'));

    // Fail three times
    for (let i = 0; i < 3; i++) {
      await expect(provider.makeRequest({
        messages: [{ role: 'user', content: 'test' }]
      })).rejects.toThrow();
    }

    // Advance time by circuit breaker reset time
    jest.advanceTimersByTime(100);

    // Mock a successful response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ choices: [{ message: 'success' }] })
    });

    // Should work again after reset
    const result = await provider.makeRequest({
      messages: [{ role: 'user', content: 'test' }]
    });
    expect(result).toBeDefined();
  });

  test('retries with exponential backoff', async () => {
    process.env.NODE_ENV = 'test';
    
    mockFetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: false,
        status: 503,
        text: () => Promise.resolve('Service temporarily unavailable')
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: false,
        status: 503,
        text: () => Promise.resolve('Service temporarily unavailable')
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ 
            message: { content: 'success' } 
          }]
        })
      }));

    const result = await provider.makeRequest({
      messages: [{ role: 'user', content: 'test' }]
    });
    
    expect(result).toEqual({ content: 'success' });
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  test('handles authentication errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: () => Promise.resolve('Invalid API key')
    });

    await expect(provider.makeRequest({
      messages: [{ role: 'user', content: 'test' }]
    })).rejects.toThrow(ProviderAuthenticationError);
  });
});

describe('Provider Constraints', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('respects dynamic RPM limits', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ choices: [{ message: 'success' }] })
    });

    const provider = new Provider('test', {
      endpoint: 'https://test.api',
      key: 'test-key',
      models: { fast: { name: 'test-model' } },
      constraints: { rpmLimit: 60 } // Default 60 RPM
    }, mockFetch);

    // Force token bucket to be empty
    provider.tokens = 2;  // Only allow 2 requests
    provider.lastRefill = Date.now();  // Prevent auto-refill

    // Set a custom RPM limit for this request
    const payload = {
      messages: [{ role: 'user', content: 'test' }],
      constraints: { rpmLimit: 2 } // Set very low for testing
    };

    // First two requests should succeed
    await provider.makeRequest(payload);
    await provider.makeRequest(payload);

    // Third request should fail due to RPM limit
    await expect(provider.makeRequest(payload))
      .rejects.toThrow(ProviderRateLimitError);

    // Verify the number of fetch calls
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  test('resets RPM limit after timeout', async () => {
    jest.useFakeTimers();
    
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ choices: [{ message: 'success' }] })
    });

    const provider = new Provider('test', {
      endpoint: 'https://test.api',
      key: 'test-key',
      models: { fast: { name: 'test-model' } }
    }, mockFetch);

    // Force token bucket to be empty
    provider.tokens = 2;  // Only allow 2 requests
    provider.lastRefill = Date.now();  // Set initial refill time

    const payload = {
      messages: [{ role: 'user', content: 'test' }],
      constraints: { rpmLimit: 2 }
    };

    // Use up the RPM limit
    await provider.makeRequest(payload);
    await provider.makeRequest(payload);
    
    // Next request should fail
    await expect(provider.makeRequest(payload))
      .rejects.toThrow(ProviderRateLimitError);

    // Advance time by 1 minute
    const futureTime = Date.now() + 61000;  // 61 seconds later
    jest.setSystemTime(futureTime);
    
    // Force a token refill by accessing the tokens
    provider.refillTokens();
    
    // Should work again after reset
    await provider.makeRequest(payload);
    expect(mockFetch).toHaveBeenCalledTimes(3);

    jest.useRealTimers();
  });
});

describe('Provider API Key Configuration', () => {
  let mockFetch;

  beforeEach(() => {
    mockFetch = jest.fn();
    process.env.ANTHROPIC_API_KEY = 'env-key';
    
    // Mock the Stream implementation
    global.fetch = mockFetch;
  });

  afterEach(() => {
    delete process.env.ANTHROPIC_API_KEY;
    jest.resetAllMocks();
  });

  test('uses runtime API key over environment variable', async () => {
    const runtimeKey = 'runtime-key';
    const provider = new Provider('test', {
      endpoint: 'https://test.api',
      key: runtimeKey,  // Runtime key
      models: { fast: { name: 'test-model' } }
    }, mockFetch);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ choices: [{ message: 'success' }] })
    });

    await provider.makeRequest({
      messages: [{ role: 'user', content: 'test' }]
    });

    // Verify the runtime key was used
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': `Bearer ${runtimeKey}`
        })
      })
    );
  });

  test('createProvidersWithKeys overrides environment variables', async () => {
    const runtimeKeys = {
      ANTHROPIC_API_KEY: 'runtime-claude-key',
      OPENAI_API_KEY: 'runtime-openai-key'
    };

    // Create providers with runtime keys
    const providers = createProvidersWithKeys(runtimeKeys);
    
    // Create a provider instance with the runtime-configured provider
    const provider = new Provider('claude', providers.claude, mockFetch);

    // Mock successful response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ choices: [{ message: 'success' }] })
    });

    // Make a request
    await provider.makeRequest({
      messages: [{ role: 'user', content: 'test' }]
    });

    // Verify the runtime key was used
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('api.anthropic.com'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'x-api-key': runtimeKeys.ANTHROPIC_API_KEY
        })
      })
    );
  });

  test('falls back to environment variables when no runtime keys provided', async () => {
    const envKey = 'env-key';
    process.env.ANTHROPIC_API_KEY = envKey;

    const provider = new Provider('test', {
      endpoint: 'https://test.api',
      key: process.env.ANTHROPIC_API_KEY,
      models: { fast: { name: 'test-model' } }
    }, mockFetch);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ choices: [{ message: 'success' }] })
    });

    await provider.makeRequest({
      messages: [{ role: 'user', content: 'test' }]
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': `Bearer ${envKey}`
        })
      })
    );
  });
}); 