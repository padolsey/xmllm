import { jest } from '@jest/globals';
import Provider from '../src/Provider.mjs';
import ProviderManager from '../src/ProviderManager.mjs';
import {
  ProviderRateLimitError,
  ProviderAuthenticationError,
  ModelValidationError
} from '../src/errors/ProviderErrors.mjs';
import { 
  estimateTokens, 
  estimateMessageTokens 
} from '../src/utils/estimateTokens.mjs';
import { o1Payloader, standardPayloader, openaiPayloader } from '../src/PROVIDERS.mjs';

describe('Provider Error Handling', () => {
  let provider;
  let mockFetch;

  beforeEach(() => {
    jest.useFakeTimers();
    mockFetch = jest.fn();
    Provider.setGlobalFetch(mockFetch);
    provider = new Provider('test', {
      endpoint: 'https://test.api',
      key: 'test-key',
      models: { fast: { name: 'test-model' } },
      constraints: { rpmLimit: 10 }
    }, {
      circuitBreakerThreshold: 3,
      circuitBreakerResetTime: 100,
      REQUEST_TIMEOUT_MS: 100
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    Provider.setGlobalFetch(fetch);
  });

  test('handles rate limiting correctly', async () => {
    const retryAfter = '30';
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      headers: {
        get: (name) => name === 'Retry-After' ? retryAfter : null,
        entries: () => [['Retry-After', retryAfter]]
      },
      text: () => Promise.resolve('Rate limit exceeded')
    });

    try {
      await provider.makeRequest({
        messages: [{ role: 'user', content: 'test' }]
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ProviderRateLimitError);
      expect(error.code).toBe('RATE_LIMIT_ERROR');
      expect(error.provider).toBe('test');
      expect(error.resetInMs).toBeDefined();
      expect(error.limits).toBeDefined();
      expect(error.limits[0].resetInMs).toBe(parseInt(retryAfter) * 1000);  // Convert to ms
      expect(error.timestamp).toBeDefined();
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
      json: () => Promise.resolve('success')
    });

    Provider.setGlobalFetch(mockFetch);

    const provider = new Provider('test', {
      endpoint: 'test',
      key: 'test-key',
      models: { fast: { name: 'test-model' } },
      constraints: {
        rpmLimit: 2  // Allow only 2 requests per minute
      }
    });

    const payload = {
      messages: [{ role: 'user', content: 'test' }]
    };

    // First two requests should succeed
    await provider.makeRequest(payload);
    await provider.makeRequest(payload);

    // Third request should fail due to RPM limit
    await expect(provider.makeRequest(payload))
      .rejects.toThrow(ProviderRateLimitError);
  });

  test('resets RPM limit after timeout', async () => {
    jest.useFakeTimers();
    
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ choices: [{ message: { content: 'success' } }] })
    });

    Provider.setGlobalFetch(mockFetch);

    const provider = new Provider('test', {
      endpoint: 'test',
      key: 'test-key',
      models: { fast: { name: 'test-model' } },
      constraints: {
        rpmLimit: 2  // Allow only 2 requests per minute
      }
    });

    const payload = {
      messages: [{ role: 'user', content: 'test' }]
    };

    // First two requests should succeed
    await provider.makeRequest(payload);
    await provider.makeRequest(payload);

    // Third request should fail
    await expect(provider.makeRequest(payload))
      .rejects.toThrow(ProviderRateLimitError);

    // Advance time by 1 minute
    jest.advanceTimersByTime(60000);

    // Should work again after reset
    const result = await provider.makeRequest(payload);
    expect(result).toBeDefined();
  });
});

describe('Provider API Key Configuration', () => {
  let mockFetch;

  beforeEach(() => {
    mockFetch = jest.fn();
    Provider.setGlobalFetch(mockFetch);
    process.env.ANTHROPIC_API_KEY = 'env-key';
    
    // Mock the Stream implementation
    global.fetch = mockFetch;
  });

  afterEach(() => {
    Provider.setGlobalFetch(fetch);
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
    const provider = new Provider('test', {
      endpoint: 'https://custom-endpoint.com',
      key: 'custom-key',
      constraints: {
        rpmLimit: 50
      }
    });

    expect(provider.endpoint).toBe('https://custom-endpoint.com');
    expect(provider.key).toBe('custom-key');
    expect(provider.constraints.rpmLimit).toBe(50);
  });

  test('inherits default properties when not specified', () => {
    const baseClaudeConfig = {
      endpoint: 'https://api.anthropic.com/v1/messages',
      models: {
        fast: {
          name: 'claude-3-haiku',
          maxContextSize: 100_000
        }
      },
      constraints: {
        rpmLimit: 200
      }
    };

    const provider = new Provider('claude', {
      ...baseClaudeConfig,
      models: {
        custom: {
          name: 'custom-model',
          maxContextSize: baseClaudeConfig.models.fast.maxContextSize
        }
      }
    });

    expect(provider.endpoint).toBe('https://api.anthropic.com/v1/messages');
    expect(provider.constraints.rpmLimit).toBe(200);
    expect(provider.models.custom.maxContextSize).toBe(100_000);
  });

  test('custom headerGen and payloader functions', () => {
    const customConfig = {
      inherit: 'anthropic',
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
        inherit: 'anthropic',
        // name missing
      });
    }).toThrow(ModelValidationError);
  });

  test('validates maxContextSize', () => {
    expect(() => {
      providerManager.getProviderByPreference({
        inherit: 'anthropic',
        name: 'test-model',
        maxContextSize: -1
      });
    }).toThrow('maxContextSize must be a positive number');

    expect(() => {
      providerManager.getProviderByPreference({
        inherit: 'anthropic',
        name: 'test-model',
        maxContextSize: 'invalid'
      });
    }).toThrow('maxContextSize must be a positive number');
  });

  test('validates constraints', () => {
    expect(() => {
      providerManager.getProviderByPreference({
        inherit: 'anthropic',
        name: 'test-model',
        constraints: {
          rpmLimit: -1
        }
      });
    }).toThrow('rpmLimit must be a positive number');

    expect(() => {
      providerManager.getProviderByPreference({
        inherit: 'anthropic',
        name: 'test-model',
        constraints: 'invalid'
      });
    }).toThrow('constraints must be an object');
  });

  test('validates endpoint URL', () => {
    expect(() => {
      providerManager.getProviderByPreference({
        inherit: 'anthropic',
        name: 'test-model',
        endpoint: 'not-a-url'
      });
    }).toThrow('Invalid endpoint URL');
  });

  test('validates function types', () => {
    expect(() => {
      providerManager.getProviderByPreference({
        inherit: 'anthropic',
        name: 'test-model',
        headerGen: 'not-a-function'
      });
    }).toThrow('headerGen must be a function');

    expect(() => {
      providerManager.getProviderByPreference({
        inherit: 'anthropic',
        name: 'test-model',
        payloader: 'not-a-function'
      });
    }).toThrow('payloader must be a function');
  });

  test('inherits resource limits when using custom models', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ choices: [{ message: { content: 'success' } }] })
    });

    Provider.setGlobalFetch(mockFetch);

    // Set up base provider with limits
    const baseConfig = {
      endpoint: 'https://api.base.com',
      key: 'test-key',
      models: { 
        fast: { name: 'base-model' }
      },
      constraints: {
        rpmLimit: 5,
        tokensPerMinute: 1000
      }
    };
    
    // Create custom model inheriting from base
    const customProvider = new Provider('custom', {
      ...baseConfig,    // Use the config object instead
      models: {
        fast: baseConfig.models.fast,  // Keep the base model
        custom: {
          name: 'custom-model'
        }
      }
    });
    
    // Verify inherited limits
    expect(customProvider.constraints.rpmLimit).toBe(5);
    expect(customProvider.constraints.tokensPerMinute).toBe(1000);
    
    // Test actual rate limiting behavior
    const payload = {
      messages: [{ role: 'user', content: 'test' }]
    };
    
    // Should allow 5 requests
    for (let i = 0; i < 5; i++) {
      await expect(customProvider.makeRequest(payload)).resolves.not.toThrow();
    }
    
    // 6th request should fail due to inherited RPM limit
    await expect(customProvider.makeRequest(payload))
      .rejects.toThrow(ProviderRateLimitError);
  });

  test('custom models can override inherited limits', async () => {
    const customProvider = new Provider('custom', {
      endpoint: 'https://api.custom.com',
      key: 'test-key',
      models: {
        custom: { name: 'custom-model' }
      },
      constraints: {
        rpmLimit: 10,  // Override base limit
        tokensPerMinute: 2000  // Override base limit
      }
    });
    
    expect(customProvider.constraints.rpmLimit).toBe(10);
    expect(customProvider.constraints.tokensPerMinute).toBe(2000);
  });
});

describe('Configuration Parameter Passing', () => {
  let providerManager;
  let mockFetch;

  beforeEach(() => {
    mockFetch = jest.fn();
    Provider.setGlobalFetch(mockFetch);
    providerManager = new ProviderManager();
  });

  afterEach(() => {
    Provider.setGlobalFetch(fetch);
  });

  test('passes all configuration parameters through to provider payloader', async () => {
    // Create a custom provider that logs all received parameters
    const receivedParams = {};

    const customConfig = {
      inherit: 'anthropic',
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
      inherit: 'anthropic',
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
      inherit: 'anthropic',
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
    Provider.setGlobalFetch(mockFetch);
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
    });
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

describe('Context Size Management', () => {
  let provider;
  let mockFetch;

  beforeEach(() => {
    mockFetch = jest.fn();
    Provider.setGlobalFetch(mockFetch);
  });

  afterEach(() => {
    Provider.setGlobalFetch(fetch);
  });

  test('respects maxContextSize when preparing payload', async () => {
    provider = new Provider('test', {
      endpoint: 'https://test.api',
      key: 'test-key',
      models: { 
        fast: { 
          name: 'test-model',
          maxContextSize: 1000 // Small context size for testing
        } 
      }
    });

    const longMessages = Array(10).fill({
      role: 'user',
      content: 'A'.repeat(400) // Each message is ~133 tokens
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ choices: [{ message: 'success' }] })
    });

    await provider.makeRequest({
      messages: longMessages,
      system: 'Be helpful',
      max_tokens: 300
    });

    // Verify the payload sent to fetch
    const payload = JSON.parse(mockFetch.mock.calls[0][1].body);

    expect(payload.system).toBe('Be helpful');
    
    // Truncated user message
    // (this unit test is highly liable to truncation methodology but that's desirable)
    expect(payload.messages[0]).toEqual({
      role: 'user',
      content: 'AAAAAAAAAAAAA[...]AAAAAAAAAAAAA[...]AAAAAAAAAAAAA[...]AAAAAAAAAAAAA[...]AAAAAAAAAAAAA[...]AAAAAAAAAAAAA[...]AAAAAAAAAAAAA[...]AAAAAAAAAAAAA[...]AAAAAAAAAAAAA[...]AAAAAAAAAAAAA'
    });

    // Verify most recent messages are kept (from the end)
    const lastOriginalMessage = longMessages[longMessages.length - 1];
    const lastTruncatedMessage = payload.messages[payload.messages.length - 1];
    expect(lastTruncatedMessage).toEqual(lastOriginalMessage);
  });

  test('prioritizes recent messages when truncating', async () => {
    provider = new Provider('test', {
      endpoint: 'https://test.api',
      key: 'test-key',
      models: { 
        fast: { 
          name: 'test-model',
          maxContextSize: 1000
        } 
      }
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ choices: [{ message: 'success' }] })
    });

    const messages = [
      { role: 'user', content: 'First message' },
      { role: 'assistant', content: 'A'.repeat(400) }, // Long middle message
      { role: 'user', content: 'Last message' }  // Should be kept
    ];

    await provider.makeRequest({
      messages,
      system: 'Be helpful',
      max_tokens: 300
    });

    const payload = JSON.parse(mockFetch.mock.calls[0][1].body);
    
    // Verify last message is in-tact
    expect(payload.messages[payload.messages.length - 1].content).toEqual(messages[messages.length - 1].content);
  });
});

describe('autoTruncateMessages', () => {
  let provider;
  let mockFetch;

  beforeEach(() => {
    mockFetch = jest.fn();
    Provider.setGlobalFetch(mockFetch);
  });

  test('throws when context size is too small for minimum requirements', async () => {
    provider = new Provider('test', {
      endpoint: 'https://test.api',
      key: 'test-key',
      models: { 
        fast: { 
          name: 'test-model',
          maxContextSize: 1000
        } 
      }
    });

    const longSystemMessage = 'S'.repeat(900); // ~300 tokens
    const longUserMessage = 'U'.repeat(900);   // ~300 tokens

    await expect(provider.makeRequest({
      messages: [{ role: 'user', content: longUserMessage }],
      system: longSystemMessage,
      max_tokens: 500,  // Would require 1100 tokens total
      autoTruncateMessages: 1000
    })).rejects.toThrow('Context size too small');
  });

  test('truncates history when autoTruncateMessages is true', async () => {
    provider = new Provider('test', {
      endpoint: 'https://test.api',
      key: 'test-key',
      models: { 
        fast: { 
          name: 'test-model',
          maxContextSize: 1000
        } 
      }
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ choices: [{ message: 'success' }] })
    });

    const messages = [
      { role: 'user', content: 'First' },
      { role: 'assistant', content: 'A'.repeat(400) },
      { role: 'user', content: 'Last message' }
    ];

    await provider.makeRequest({
      messages,
      system: 'Be helpful',
      max_tokens: 300,
      autoTruncateMessages: true
    });

    const payload = JSON.parse(mockFetch.mock.calls[0][1].body);
    
    // Should keep system + last message at minimum intact
    // Should maintain all messages in some fashion
    expect(payload.system).toBe('Be helpful');
    expect(payload.messages[0].content).toBe('First');
    expect(payload.messages[payload.messages.length - 1]).toEqual(messages[messages.length - 1]);
    
  });

  test('truncates to specific token count when autoTruncateMessages is number', async () => {
    provider = new Provider('test', {
      endpoint: 'https://test.api',
      key: 'test-key',
      models: { fast: { name: 'test-model' } }
    });
  
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ choices: [{ message: 'success' }] })
    });
  
    const messages = [];
    messages.push({
      role: 'user',
      content: 'A'.repeat(3000) // ~1000 tokens
    });
    messages.push({
      role: 'assistant',
      content: 'A'.repeat(3000) // ~1000 tokens
    });
    messages.push({
      role: 'user',
      content: 'A'.repeat(3000) // ~1000 tokens
    });
    messages.push({
      role: 'assistant',
      content: 'A'.repeat(3000) // ~1000 tokens
    });
    messages.push({
      role: 'user',
      content: 'A'.repeat(3000) // ~1000 tokens
    });
  
    await provider.makeRequest({
      messages,
      system: 'Be helpful',
      max_tokens: 100,
      autoTruncateMessages: 2000 // Should allow ~2000 tokens total for input
    });
  
    const payload = JSON.parse(mockFetch.mock.calls[0][1].body);
  
    // Verify total input tokens is under limit
    const totalInputTokens = payload.messages.reduce((sum, msg) =>
      sum + estimateTokens(msg.content),
    0);
    expect(totalInputTokens).toBeLessThanOrEqual(2000);
  
    // Verify that messages are truncated proportionally
    const historicalMessages = payload.messages.slice(1, -1); // Exclude system and latest message
    historicalMessages.forEach((msg, index) => {
      const originalTokens = estimateTokens(messages[index].content);
      const truncatedTokens = estimateTokens(msg.content);
      expect(truncatedTokens).toBeLessThan(originalTokens);
      expect(truncatedTokens).toBeGreaterThan(0);
      expect(msg.content.includes('[...]')).toBe(true);
    });
  
    // Verify that the latest message is not truncated
    expect(payload.messages[payload.messages.length - 1].content).toEqual(messages[messages.length - 1].content);
  });
});

describe('Provider Payload Preparation for o1 Models', () => {
  let provider;

  beforeEach(() => {
    provider = new Provider('openai', {
      endpoint: 'https://api.openai.com/v1/chat/completions',
      key: 'test-key',
      models: {
        fast: { name: 'o1-preview' },
        mini: { name: 'o1-mini' },
      },
      payloader: openaiPayloader,
    });
  });

  test('prepares payload correctly for o1 models with developer role', () => {
    const payload = provider.preparePayload({
      messages: [{ role: 'user', content: 'Test message' }],
      system: 'You are a vvvv helpful assistant',
      model: 'fast',
      reasoning_effort: 'high',
    });

    expect(payload).toEqual({
      messages: [
        { role: 'developer', content: 'You are a vvvv helpful assistant' },
        { role: 'user', content: 'Test message' },
      ],
      max_completion_tokens: 300,
      reasoning_effort: 'high',
      model: 'o1-preview',
      stream: false,
    });
  });

  test('prepares payload correctly for o1 models without developer role', () => {
    const payload = provider.preparePayload({
      messages: [{ role: 'user', content: 'Test message' }],
      system: 'You are a super helpful assistant',
      model: 'mini',
    });

    expect(payload).toEqual({
      messages: [
        { role: 'assistant', content: '<system>You are a super helpful assistant</system>' },
        { role: 'user', content: 'Test message' },
      ],
      max_completion_tokens: 300,
      model: 'o1-mini',
      stream: false,
    });
  });

  test('omits unsupported parameters for o1 models', () => {
    const payload = provider.preparePayload({
      messages: [{ role: 'user', content: 'Test message' }],
      temperature: 0.7,
      presence_penalty: 0.5,
      model: 'fast',
    });

    expect(payload).not.toHaveProperty('temperature');
    expect(payload).not.toHaveProperty('presence_penalty');
  });
}); 