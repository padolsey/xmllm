import { jest } from '@jest/globals';
import { ModelValidationError } from '../src/errors/ProviderErrors.mjs';
import { stream } from '../src/xmllm-main.mjs';
import providers, { registerProvider, PROVIDER_ALIASES } from '../src/PROVIDERS.mjs';

describe('Provider Registration', () => {
  beforeEach(() => {
    // Reset providers and aliases
    Object.keys(providers).forEach(key => {
      if (key !== 'anthropic' && key !== 'openai' && key !== 'claude') {
        delete providers[key];
      }
    });
    Object.keys(PROVIDER_ALIASES).forEach(key => {
      if (key !== 'claude') {
        delete PROVIDER_ALIASES[key];
      }
    });
  });

  afterEach(() => {
    // Clean up env vars
    delete process.env.TEST_PROVIDER_API_KEY;
  });

  test('registers a valid provider configuration', () => {
    const provider = registerProvider('test-provider', {
      endpoint: 'https://api.test.com/v1/chat',
      models: {
        fast: {
          name: 'test-model',
          maxContextSize: 32000
        }
      }
    });

    expect(provider).toBeDefined();
    expect(provider.endpoint).toBe('https://api.test.com/v1/chat');
    expect(provider.models.fast.name).toBe('test-model');
  });

  test('throws on missing required fields', () => {
    expect(() => registerProvider()).toThrow(ModelValidationError);
    expect(() => registerProvider('test')).toThrow(ModelValidationError);
    expect(() => registerProvider('test', {})).toThrow(ModelValidationError);
    expect(() => registerProvider('test', { endpoint: 'https://test.com' }))
      .toThrow(ModelValidationError);
  });

  test('validates endpoint URL', () => {
    expect(() => registerProvider('test', {
      endpoint: 'not-a-url',
      models: { fast: { name: 'test' } }
    })).toThrow(ModelValidationError);
  });

  test('validates model name is present', () => {
    expect(() => registerProvider('test', {
      endpoint: 'https://test.com',
      models: { 
        fast: {} // missing name
      }
    })).toThrow(ModelValidationError);
  });

  test('handles custom header generators', () => {
    const headerGen = function() {
      return {
        'Authorization': `Bearer ${this.key}`,
        'X-Custom': 'value'
      };
    };

    const provider = registerProvider('test', {
      endpoint: 'https://test.com',
      models: { fast: { name: 'test' } },
      headerGen
    });

    expect(provider.headerGen).toBe(headerGen);
  });

  test('handles custom payload transformers', () => {
    const payloader = (payload) => ({
      ...payload,
      custom_field: 'value'
    });

    const provider = registerProvider('test', {
      endpoint: 'https://test.com',
      models: { fast: { name: 'test' } },
      payloader
    });

    expect(provider.payloader).toBe(payloader);
  });

  test('registers provider aliases', async () => {
    const mockStream = async () => createMockStream();

    registerProvider('test-provider', {
      endpoint: 'https://test.com',
      models: { fast: { name: 'test' } },
      aliases: ['test', 'tst']
    });

    await stream('test message', {
      model: 'test:fast',
      keys: {
        'test-provider': 'test-key'
      },
      llmStream: mockStream
    }).value();

    // Verify provider registration
    const provider = providers['test-provider'];
    expect(provider).toBeDefined();
    expect(provider.models.fast.name).toBe('test');
    expect(PROVIDER_ALIASES['test']).toBe('test-provider');
    expect(PROVIDER_ALIASES['tst']).toBe('test-provider');
  });

  test('inherits default constraints', () => {
    const provider = registerProvider('test', {
      endpoint: 'https://test.com',
      models: { fast: { name: 'test' } }
    });

    expect(provider.constraints.rpmLimit).toBe(100); // Default RPM limit
  });

  test('allows overriding default constraints', () => {
    const provider = registerProvider('test', {
      endpoint: 'https://test.com',
      models: { fast: { name: 'test' } },
      constraints: {
        rpmLimit: 50,
        tokensPerMinute: 1000
      }
    });

    expect(provider.constraints.rpmLimit).toBe(50);
    expect(provider.constraints.tokensPerMinute).toBe(1000);
  });

  test('integrates with stream interface', async () => {
    const mockStream = async () => createMockStream();

    registerProvider('test-provider', {
      endpoint: 'https://test.com',
      models: { fast: { name: 'test-model' } }
    });

    await stream('test message', {
      model: 'test-provider:fast',
      keys: {
        'test-provider': 'test-key'
      },
      llmStream: mockStream
    }).value();

    // Verify provider configuration
    const provider = providers['test-provider'];
    expect(provider).toBeDefined();
    expect(provider.endpoint).toBe('https://test.com');
    expect(provider.models.fast.name).toBe('test-model');
  });

  test('handles environment variable API keys', () => {
    process.env.TEST_PROVIDER_API_KEY = 'env-key';

    const provider = registerProvider('test-provider', {
      endpoint: 'https://test.com',
      models: { fast: { name: 'test' } }
    });

    expect(provider.key).toBe('env-key');
    delete process.env.TEST_PROVIDER_API_KEY;
  });
});

// Helper to create a proper ReadableStream mock
function createMockStream(content = 'test response') {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(content));
      controller.close();
    }
  });
} 