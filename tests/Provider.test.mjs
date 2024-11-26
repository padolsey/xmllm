import { jest } from '@jest/globals';
import Provider from '../src/Provider.mjs';
import ProviderManager from '../src/ProviderManager.mjs';
import xmllm from '../src/xmllm-main.mjs';
import { createProvidersWithKeys } from '../src/PROVIDERS.mjs';
import {
  ProviderRateLimitError,
  ProviderAuthenticationError,
  ProviderTimeoutError,
  ProviderNetworkError,
  ModelValidationError
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

describe('Custom Model Support', () => {
  let providerManager;
  
  beforeEach(() => {
    providerManager = new ProviderManager();
  });

  test('handles string-based custom model names', () => {
    const { provider, modelType } = providerManager.getProviderByPreference('claude:claude-3-omega-20240901');
    
    expect(provider.name).toBe('claude_custom');
    expect(modelType).toBe('custom');
    expect(provider.models.custom.name).toBe('claude-3-omega-20240901');
    // Should inherit base provider properties
    expect(provider.endpoint).toBe('https://api.anthropic.com/v1/messages');
  });

  test('handles object-based custom model configuration', () => {
    const customConfig = {
      inherit: 'claude',
      name: 'claude-3-custom',
      maxContextSize: 200_000,
      endpoint: 'https://custom-endpoint.com',
      key: 'custom-key',
      constraints: {
        rpmLimit: 50
      }
    };

    const { provider, modelType } = providerManager.getProviderByPreference(customConfig);
    
    expect(provider.name).toBe('claude_custom');
    expect(modelType).toBe('custom');
    expect(provider.models.custom.name).toBe('claude-3-custom');
    expect(provider.models.custom.maxContextSize).toBe(200_000);
    expect(provider.endpoint).toBe('https://custom-endpoint.com');
    expect(provider.key).toBe('custom-key');
    expect(provider.constraints.rpmLimit).toBe(50);
  });

  test('inherits default properties when not specified', () => {
    const { provider } = providerManager.getProviderByPreference({
      inherit: 'claude',
      name: 'claude-3-custom'
    });

    // Should inherit these from base claude provider
    expect(provider.endpoint).toBe('https://api.anthropic.com/v1/messages');
    expect(provider.constraints.rpmLimit).toBe(200);
    expect(provider.models.custom.maxContextSize).toBe(100_000); // Inherited from fast model
  });

  test('custom headerGen and payloader functions', () => {
    const customConfig = {
      inherit: 'claude',
      name: 'claude-3-custom',
      headerGen: function() {
        return {
          'x-custom-header': 'value',
          'x-api-key': this.key
        };
      },
      payloader: function(payload) {
        return {
          ...payload,
          custom_field: 'value'
        };
      }
    };

    const { provider } = providerManager.getProviderByPreference(customConfig);
    
    const headers = provider.headerGen();
    expect(headers['x-custom-header']).toBe('value');

    const payload = provider.payloader({ messages: [] });
    expect(payload.custom_field).toBe('value');
  });

  test('throws error for invalid base provider', () => {
    expect(() => {
      providerManager.getProviderByPreference({
        inherit: 'non-existent-provider',
        name: 'custom-model'
      });
    }).toThrow('Base provider non-existent-provider not found');
  });

  test('validates required model name', () => {
    expect(() => {
      providerManager.getProviderByPreference({
        inherit: 'claude',
        // name missing
      });
    }).toThrow(ModelValidationError);
  });

  test('validates maxContextSize', () => {
    expect(() => {
      providerManager.getProviderByPreference({
        inherit: 'claude',
        name: 'test-model',
        maxContextSize: -1
      });
    }).toThrow('maxContextSize must be a positive number');

    expect(() => {
      providerManager.getProviderByPreference({
        inherit: 'claude',
        name: 'test-model',
        maxContextSize: 'invalid'
      });
    }).toThrow('maxContextSize must be a positive number');
  });

  test('validates constraints', () => {
    expect(() => {
      providerManager.getProviderByPreference({
        inherit: 'claude',
        name: 'test-model',
        constraints: {
          rpmLimit: -1
        }
      });
    }).toThrow('rpmLimit must be a positive number');

    expect(() => {
      providerManager.getProviderByPreference({
        inherit: 'claude',
        name: 'test-model',
        constraints: 'invalid'
      });
    }).toThrow('constraints must be an object');
  });

  test('validates endpoint URL', () => {
    expect(() => {
      providerManager.getProviderByPreference({
        inherit: 'claude',
        name: 'test-model',
        endpoint: 'not-a-url'
      });
    }).toThrow('Invalid endpoint URL');
  });

  test('validates function types', () => {
    expect(() => {
      providerManager.getProviderByPreference({
        inherit: 'claude',
        name: 'test-model',
        headerGen: 'not-a-function'
      });
    }).toThrow('headerGen must be a function');

    expect(() => {
      providerManager.getProviderByPreference({
        inherit: 'claude',
        name: 'test-model',
        payloader: 'not-a-function'
      });
    }).toThrow('payloader must be a function');
  });
});

describe('Configuration Parameter Passing', () => {
  let providerManager;
  let mockFetch;

  beforeEach(() => {
    mockFetch = jest.fn();
    providerManager = new ProviderManager();
  });

  test('passes all configuration parameters through to provider payloader', async () => {
    // Create a custom provider that logs all received parameters
    const receivedParams = {};

    const customConfig = {
      inherit: 'claude',
      name: 'config-test-model',
      payloader: function(payload) {
        // Store received parameters for verification
        Object.assign(receivedParams, {
          max_tokens: payload.max_tokens,
          maxTokens: payload.maxTokens,
          temperature: payload.temperature,
          top_p: payload.top_p,
          topP: payload.topP,
          presence_penalty: payload.presence_penalty,
          presencePenalty: payload.presencePenalty,
          system: payload.system,
          messages: payload.messages,
          model: payload.model,
          stream: payload.stream
        });

        // Return standard payload
        return {
          messages: payload.messages,
          max_tokens: payload.max_tokens,
          temperature: payload.temperature
        };
      }
    };

    // Mock successful response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ 
        choices: [{ message: { content: 'test response' } }] 
      })
    });

    const { provider } = providerManager.getProviderByPreference(customConfig);
    provider.fetch = mockFetch;

    // Test with all possible parameters
    const testConfig = {
      messages: [{ role: 'user', content: 'test' }],
      max_tokens: 1000,
      maxTokens: 1000,  // Alias
      temperature: 0.7,
      top_p: 0.9,
      topP: 0.9,  // Alias
      presence_penalty: 0.5,
      presencePenalty: 0.5,  // Alias
      system: 'You are a test assistant',
      model: 'config-test-model',
      stream: true
    };

    await provider.makeRequest(testConfig);

    // Verify all parameters were received by payloader
    expect(receivedParams).toEqual(expect.objectContaining({
      max_tokens: 1000,
      maxTokens: 1000,
      temperature: 0.7,
      top_p: 0.9,
      topP: 0.9,
      presence_penalty: 0.5,
      presencePenalty: 0.5,
      system: 'You are a test assistant',
      model: 'config-test-model',
      stream: true
    }));

    // Verify fetch was called with transformed payload
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: expect.stringContaining('"max_tokens":1000'),
        body: expect.stringContaining('"temperature":0.7')
      })
    );
  });

  test('handles parameter aliases consistently', async () => {
    const receivedParams = {};

    const customConfig = {
      inherit: 'claude',
      name: 'alias-test-model',
      payloader: function(payload) {
        // Store only the parameters we want to verify
        const { 
          max_tokens, maxTokens,
          top_p, topP,
          presence_penalty, presencePenalty,
          temperature
        } = payload;
        
        Object.assign(receivedParams, {
          max_tokens, maxTokens,
          top_p, topP,
          presence_penalty, presencePenalty,
          temperature
        });
        return payload;
      }
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ 
        choices: [{ message: { content: 'test response' } }] 
      })
    });

    const { provider } = providerManager.getProviderByPreference(customConfig);
    provider.fetch = mockFetch;

    // Test with mixed alias usage
    await provider.makeRequest({
      messages: [{ role: 'user', content: 'test' }],
      maxTokens: 1000,      // Use alias
      temperature: 0.7,
      topP: 0.9,           // Use alias
      presencePenalty: 0.5  // Use alias
    });

    // Verify both original and alias parameters are present
    expect(receivedParams).toMatchObject({
      maxTokens: 1000,
      max_tokens: 1000,
      temperature: 0.7,
      topP: 0.9,
      presencePenalty: 0.5
    });
  });

  test('passes configuration through stream interface', async () => {
    const receivedParams = {};

    const customConfig = {
      inherit: 'claude',
      name: 'stream-test-model',
      payloader: function(payload) {
        // Store only the parameters we want to verify
        const { 
          max_tokens, maxTokens,
          temperature,
          top_p, topP,
          presence_penalty, presencePenalty,
          system,
          stream
        } = payload;
        
        Object.assign(receivedParams, {
          max_tokens, maxTokens,
          temperature,
          top_p, topP,
          presence_penalty, presencePenalty,
          system,
          stream
        });
        return payload;
      }
    };

    // Mock streaming response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: {
        getReader: () => ({
          read: jest.fn()
            .mockResolvedValueOnce({ 
              value: new TextEncoder().encode('test response'),
              done: false 
            })
            .mockResolvedValueOnce({ done: true }),
          releaseLock: jest.fn()
        })
      }
    });

    const { provider } = providerManager.getProviderByPreference(customConfig);
    provider.fetch = mockFetch;

    // Test streaming with configuration
    await provider.createStream({
      messages: [{ role: 'user', content: 'test' }],
      maxTokens: 1000,
      temperature: 0.7,
      topP: 0.9,
      presencePenalty: 0.5,
      system: 'You are a test assistant',
      stream: true
    });

    // Verify both original and alias parameters are present
    expect(receivedParams).toMatchObject({
      maxTokens: 1000,
      max_tokens: 1000,
      temperature: 0.7,
      topP: 0.9,
      presencePenalty: 0.5,
      system: 'You are a test assistant',
      stream: true
    });
  });
});

describe('Provider Payloader Error Handling', () => {
  let provider;
  let mockFetch;

  beforeEach(() => {
    mockFetch = jest.fn();
    provider = new Provider('test', {
      endpoint: 'https://test.api',
      key: 'test-key',
      models: { 
        fast: { name: 'test-model' } 
      },
      // Payloader that throws
      payloader: () => {
        throw new Error('Payloader Error');
      }
    }, mockFetch);
  });

  test('makeRequest handles payloader errors without fetching', async () => {
    await expect(provider.makeRequest({
      messages: [{ role: 'user', content: 'test' }]
    })).rejects.toThrow('Payloader Error');

    // Verify fetch was never called
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test('createStream handles payloader errors without fetching', async () => {
    await expect(provider.createStream({
      messages: [{ role: 'user', content: 'test' }]
    })).rejects.toThrow('Payloader Error');

    // Verify fetch was never called
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test('cleans up resources when payloader throws', async () => {
    const mockReader = {
      releaseLock: jest.fn()
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: {
        getReader: () => mockReader
      }
    });

    await expect(provider.createStream({
      messages: [{ role: 'user', content: 'test' }]
    })).rejects.toThrow('Payloader Error');

    // Verify cleanup occurred
    expect(mockReader.releaseLock).not.toHaveBeenCalled(); // Should never get to this point
    expect(mockFetch).not.toHaveBeenCalled();
  });
}); 