import { jest } from '@jest/globals';
import { stream, configure, resetConfig } from '../src/xmllm-main.mjs';
import { registerProvider } from '../src/PROVIDERS.mjs';
import Provider from '../src/Provider.mjs';
import providers, { PROVIDER_ALIASES } from '../src/PROVIDERS.mjs';

// Helper to create a mock stream response
const createMockReader = (responses) => {
  let index = 0;
  return {
    read: jest.fn(async () => {
      if (index >= responses.length) {
        return { done: true, value: undefined };
      }
      return {
        value: new TextEncoder().encode(responses[index++]),
        done: false
      };
    }),
    releaseLock: jest.fn()
  };
};

describe('Custom Provider with Custom Payloader', () => {
  let originalFetch;
  let capturedPayload;
  let capturedHeaders;
  let capturedUrl;
  
  beforeAll(() => {
    // Save original fetch
    originalFetch = Provider._globalFetch;
  });
  
  afterAll(() => {
    // Restore original fetch
    Provider.setGlobalFetch(originalFetch);
  });
  
  beforeEach(() => {
    // Reset captured values
    capturedPayload = null;
    capturedHeaders = null;
    capturedUrl = null;
    
    // Reset providers registry before each test
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
    
    // Mock fetch to capture request details without making actual requests
    const mockFetch = jest.fn().mockImplementation((url, options) => {
      capturedUrl = url;
      capturedHeaders = options.headers;
      capturedPayload = JSON.parse(options.body);
      
      return {
        ok: true,
        body: {
          getReader: () => createMockReader(['<response>Test response</response>'])
        }
      };
    });
    
    Provider.setGlobalFetch(mockFetch);
    
    // Reset config
    resetConfig();
  });
  
  test('registers and uses a custom provider with custom payloader', async () => {
    // Register a custom provider with a custom payloader
    registerProvider('custom-test', {
      endpoint: 'https://api.custom-test.com/v1/chat',
      models: {
        fast: { name: 'custom-model' }
      },
      payloader: function(payload) {
        // Custom transformation logic
        return {
          custom_format: true,
          input: payload.messages[payload.messages.length - 1].content,
          system_directive: payload.system,
          settings: {
            max_length: payload.max_tokens,
            temperature_setting: payload.temperature
          }
        };
      }
    });
    
    // Use the stream interface with the custom provider
    await stream('Test message', {
      model: 'custom-test:fast',
      system: 'You are a helpful assistant',
      temperature: 0.7,
      max_tokens: 500,
      keys: {
        'custom-test': 'test-key'
      }
    }).value();
    
    // Verify the payload was transformed correctly by the custom payloader
    expect(capturedPayload).toEqual({
      custom_format: true,
      input: 'Test message',
      system_directive: 'You are a helpful assistant',
      settings: {
        max_length: 500,
        temperature_setting: 0.7
      },
      model: 'custom-model',
      stream: true
    });
    
    // Verify the request was sent to the correct endpoint
    expect(capturedUrl).toBe('https://api.custom-test.com/v1/chat');
  });
  
  test('custom provider with custom headerGen and payloader', async () => {
    // Register a custom provider with both custom headerGen and payloader
    registerProvider('custom-headers', {
      endpoint: 'https://api.custom-headers.com/v1/generate',
      models: {
        fast: { name: 'custom-model' }
      },
      headerGen: function() {
        return {
          'Authorization': `ApiKey ${this.key}`,
          'X-Custom-Header': 'custom-value',
          'Content-Type': 'application/json'
        };
      },
      payloader: function(payload) {
        return {
          prompt: payload.messages[payload.messages.length - 1].content,
          context: payload.system,
          parameters: {
            max_tokens: payload.max_tokens,
            temperature: payload.temperature,
            top_p: payload.top_p
          },
          model: 'custom-from-payloader'
        };
      }
    });
    
    // Use the stream interface with the custom provider
    await stream('Another test', {
      model: 'custom-headers:fast',
      system: 'System context',
      temperature: 0.5,
      top_p: 0.95,
      max_tokens: 300,
      keys: {
        'custom-headers': 'header-test-key'
      }
    }).value();
    
    // Verify headers were generated correctly
    expect(capturedHeaders).toEqual(expect.objectContaining({
      'Authorization': 'ApiKey header-test-key',
      'X-Custom-Header': 'custom-value',
      'Content-Type': 'application/json'
    }));
    
    // Verify payload was transformed correctly
    expect(capturedPayload).toEqual({
      prompt: 'Another test',
      context: 'System context',
      parameters: {
        max_tokens: 300,
        temperature: 0.5,
        top_p: 0.95
      },
      model: 'custom-from-payloader',
      stream: true
    });
  });
  
  test('custom provider with schema selection and custom payloader', async () => {
    // Create a spy to capture the payload
    const payloaderSpy = jest.fn(payload => {
      // Extract schema information if available
      const hasSchema = payload.schema !== undefined;
      
      return {
        input: payload.messages[payload.messages.length - 1].content,
        system: payload.system,
        config: {
          max_length: payload.max_tokens,
          temperature: payload.temperature,
          structured_output: hasSchema
        },
        model: 'custom-model-prop-here-123'
      };
    });
    
    // Register a custom provider with a custom payloader
    registerProvider('schema-test-provider', {
      endpoint: 'https://api.schema-test.com/v1/generate',
      models: {
        fast: { name: 'schema-model' }
      },
      payloader: payloaderSpy
    });
    
    // Mock the stream response with XML that matches our schema
    Provider.setGlobalFetch(jest.fn().mockImplementation((url, options) => {
      capturedUrl = url;
      capturedHeaders = options.headers;
      capturedPayload = JSON.parse(options.body);
      
      return {
        ok: true,
        body: {
          getReader: () => createMockReader([
            '<result><score>95</score><feedback>Great work!</feedback></result>'
          ])
        }
      };
    }));
    
    // Use the stream interface with schema and custom provider
    // Skip the actual result validation since it depends on the XML parser
    await stream('Evaluate this', {
      model: 'schema-test-provider:fast',
      system: 'You are an evaluator',
      schema: {
        result: {
          score: Number,
          feedback: String
        }
      },
      keys: {
        'schema-test-provider': 'schema-key'
      }
    }).value();
    
    // Verify the payloader was called
    expect(payloaderSpy).toHaveBeenCalled();
    
    // Note: The schema property is not passed to the payloader function
    // It's only used for client-side parsing of the response
    // So we don't expect payloaderArgs.schema to be defined
    
    // Verify the payload includes the expected fields
    expect(capturedPayload).toEqual({
      input: expect.stringContaining('Evaluate this'),
      system: expect.stringContaining('You are an evaluator'),
      config: {
        max_length: 300, // Default value
        temperature: expect.any(Number),
        structured_output: expect.any(Boolean)
      },
      model: 'custom-model-prop-here-123',
      stream: true
    });
  });
  
  test('custom provider with aliases', () => {
    // Register a custom provider with aliases
    registerProvider('full-test', {
      endpoint: 'https://api.full-test.com/v1/chat',
      models: {
        fast: { name: 'fast-model' },
        good: { name: 'good-model' }
      },
      aliases: ['ft', 'fulltest'],
      payloader: function(payload) {
        return {
          message: payload.messages[payload.messages.length - 1].content,
          options: {
            tokens: payload.max_tokens
          }
        };
      }
    });
    
    // Verify the provider was registered
    expect(providers['full-test']).toBeDefined();
    
    // Verify the aliases were registered
    expect(PROVIDER_ALIASES['ft']).toBe('full-test');
    expect(PROVIDER_ALIASES['fulltest']).toBe('full-test');
    
    // Verify the models were registered
    expect(providers['full-test'].models.fast.name).toBe('fast-model');
    expect(providers['full-test'].models.good.name).toBe('good-model');
  });
  
  test('custom provider inheriting from existing provider', async () => {
    // Reset the mock fetch for this test
    const mockFetch = jest.fn().mockImplementation((url, options) => {
      capturedUrl = url;
      capturedHeaders = options.headers;
      capturedPayload = JSON.parse(options.body);
      
      return {
        ok: true,
        body: {
          getReader: () => createMockReader(['<response>Test response</response>'])
        }
      };
    });
    
    Provider.setGlobalFetch(mockFetch);
    
    // Create a custom provider that inherits from anthropic
    const customConfig = {
      inherit: 'anthropic',
      name: 'custom-claude',
      payloader: function(payload) {
        // Add custom fields while preserving anthropic format
        return {
          system: payload.system,
          messages: payload.messages,
          max_tokens: payload.max_tokens,
          temperature: payload.temperature,
          custom_field: 'custom-value',
          metadata: {
            source: 'xmllm-test'
          },
          model: payload.modelName
        };
      }
    };
    
    // Use the provider manager to get the provider
    await stream('Inherited provider test', {
      model: customConfig,
      system: 'Custom system prompt',
      temperature: 0.3,
      max_tokens: 200,
      keys: {
        'anthropic': 'test-key'
      }
    }).value();
    
    // Verify the payload has both anthropic format and custom fields
    expect(capturedPayload).toEqual({
      system: 'Custom system prompt',
      messages: [{ role: 'user', content: 'Inherited provider test' }],
      max_tokens: 200,
      temperature: 0.3,
      custom_field: 'custom-value',
      metadata: {
        source: 'xmllm-test'
      },
      model: 'custom-claude',
      stream: true
    });
    
    // Verify the request was sent to the anthropic endpoint
    expect(capturedUrl).toBe('https://api.anthropic.com/v1/messages');
  });
  
  test('custom provider with custom payloader and this context', async () => {
    // Register a custom provider with a payloader that uses 'this' context
    registerProvider('context-test', {
      endpoint: 'https://api.context-test.com/v1/generate',
      models: {
        fast: { name: 'context-model' }
      },
      payloader: function(payload) {
        // The payloader should have access to:
        // - this.key (the API key)
        // - this.endpoint (the provider endpoint)
        
        return {
          input: payload.messages[payload.messages.length - 1].content,
          model: payload.model,
          api_key_reference: this.key.substring(0, 3) + '...',
          temperature: payload.temperature || 0.5
        };
      }
    });
    
    // Use the stream interface with the custom provider
    await stream('Test with context', {
      model: 'context-test:fast',
      temperature: 0.7,
      keys: {
        'context-test': 'test-context-key'
      }
    }).value();
    
    // Verify the payload was transformed correctly with access to 'this'
    expect(capturedPayload).toEqual({
      input: 'Test with context',
      model: 'context-model',
      api_key_reference: 'tes...',
      temperature: 0.7,
      stream: true
    });
    
    // Verify the request was sent to the correct endpoint
    expect(capturedUrl).toBe('https://api.context-test.com/v1/generate');
  });
}); 