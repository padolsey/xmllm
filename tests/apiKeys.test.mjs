import { jest } from '@jest/globals';

// Mock ProviderManager before other imports
let mockProvider; // Capture the provider for testing

const mockPickProviderWithFallback = jest.fn().mockImplementation(
  async (payload, action) => {
    // Call the action with our captured provider
    return action(mockProvider, payload);
  }
);

const mockStreamRequest = jest.fn().mockImplementation(async (payload) => {
  return mockPickProviderWithFallback(payload, (provider) => {
    return {
      getReader: () => ({
        read: jest.fn()
          .mockResolvedValueOnce({ 
            value: new TextEncoder().encode('<result>test</result>'),
            done: false 
          })
          .mockResolvedValueOnce({ done: true }),
        releaseLock: jest.fn()
      })
    };
  });
});

const mockFactory = () => {
  return {
    default: jest.fn().mockImplementation((config = {}) => {
      // Capture the provider that gets created with the env var
      mockProvider = {
        name: 'openai',
        key: config.keys?.openai || process.env.OPENAI_API_KEY,
        endpoint: 'https://mock.api',
        models: { fast: { name: 'mock-model' } }
      };

      return {
        pickProviderWithFallback: mockPickProviderWithFallback,
        streamRequest: mockStreamRequest
      };
    })
  };
};

// Set up the mock
jest.unstable_mockModule('./src/ProviderManager.mjs', mockFactory);

// Now import the rest
const {
  stream,
  configure,
  resetConfig
} = await import('../src/xmllm-main.mjs');

describe('Provider Keys Configuration', () => {
  beforeEach(() => {
    resetConfig();
    mockPickProviderWithFallback.mockClear();
  });

  afterEach(() => {
    resetConfig();
  });

  describe('stream() interface', () => {
    it('should accept provider keys in options', async () => {
      await stream('Test prompt', {
        keys: {
          openai: 'test-openai-key',
          anthropic: 'test-claude-key'
        }
      }).last();

      // Verify keys were passed to ProviderManager
      expect(mockPickProviderWithFallback).toHaveBeenCalledWith(
        expect.objectContaining({
          keys: {
            openai: 'test-openai-key',
            anthropic: 'test-claude-key'
          }
        }),
        expect.any(Function)
      );
    });
  });

  describe('configure() interface', () => {
    it('should set global provider keys', async () => {
      configure({
        keys: {
          openai: 'global-openai-key',
          anthropic: 'global-claude-key'
        }
      });

      await stream('Test prompt').last();

      // Verify global keys were used
      expect(mockPickProviderWithFallback).toHaveBeenCalledWith(
        expect.objectContaining({
          keys: {
            openai: 'global-openai-key',
            anthropic: 'global-claude-key'
          }
        }),
        expect.any(Function)
      );
    });

    it('should allow runtime keys to override global keys', async () => {
      configure({
        keys: {
          openai: 'global-openai-key',
          anthropic: 'global-claude-key'
        }
      });

      await stream('Test prompt', {
        keys: {
          openai: 'runtime-openai-key' // Should override global
        }
      }).last();

      expect(mockPickProviderWithFallback).toHaveBeenCalledWith(
        expect.objectContaining({
          keys: {
            openai: 'runtime-openai-key',
            anthropic: 'global-claude-key'
          }
        }),
        expect.any(Function)
      );
    });
  });
});

describe('Environment Variables', () => {
  beforeEach(() => {
    delete process.env.OPENAI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
  });

  it('should use environment variables when no keys provided', async () => {
    process.env.OPENAI_API_KEY = 'env-openai-key';
    
    await stream('Test prompt').last();

    expect(mockProvider.key).toBe('env-openai-key');
  });

  it('should prioritize runtime keys over environment variables', async () => {
    process.env.OPENAI_API_KEY = 'env-openai-key';
    
    await stream('Test prompt', {
      keys: {
        openai: 'runtime-openai-key'
      }
    }).last();

    expect(mockPickProviderWithFallback).toHaveBeenCalledWith(
      expect.objectContaining({
        keys: {
          openai: 'runtime-openai-key'
        }
      }),
      expect.any(Function)
    );
  });
});

describe('Validation', () => {

  it('should reject invalid provider names', async () => {
    await expect(async () => {
      await stream('Test prompt', {
        keys: {
          invalid_provider: 'some-key'
        }
      }).last()
    }).rejects.toThrow('Invalid provider name');
  });

  it('should reject non-string keys', async () => {
    await expect(async () => {
      await stream('Test prompt', {
        keys: {
          openai: 123
        }
      }).last()
    }).rejects.toThrow('must be a non-empty string');
  });
});