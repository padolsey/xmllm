import { jest } from '@jest/globals';
import { stream, ClientProvider, simple } from '../src/xmllm-client.mjs';
import { configure, resetConfig, getConfig } from '../src/config.mjs';

const createMockReader = (responses) => {
  let index = 0;
  return {
    read: jest.fn(async () => {
      if (index >= responses.length) {
        return { done: true };
      }
      return {
        value: new TextEncoder().encode(responses[index++]),
        done: false
      };
    }),
    releaseLock: jest.fn()
  };
};

describe('Client Stream Interface', () => {
  let mockFetch;
  let clientProvider;

  beforeEach(() => {
    // Reset config before each test
    resetConfig();

    // Setup mock fetch
    mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      body: {
        getReader: () => createMockReader([
          'data: {"content":"<thinking><response>Test response</response></thinking>"}\n\n'
        ])
      }
    });
    global.fetch = mockFetch;

    clientProvider = new ClientProvider('http://test-endpoint.com');
  });

  describe('Stream Function Signatures', () => {
    it('should handle string prompt', async () => {
      await stream('Test query', {
        clientProvider
      }).last();

      const payload = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(payload).toMatchObject({
        messages: expect.arrayContaining([
          {
            role: 'user',
            content: 'Test query'
          }
        ]),
        max_tokens: 300,
        temperature: 0.72,
        top_p: 1,
        presence_penalty: 0,
        model: [
          'anthropic:good',
          'openai:good',
          'anthropic:fast',
          'openai:fast'
        ]
      });

      // Verify request structure
      expect(mockFetch).toHaveBeenCalledWith(
        'http://test-endpoint.com',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: expect.any(String)
        }
      );
    });

    it('should handle config object with prompt', async () => {
      await stream({
        prompt: 'Test query 666555',
        temperature: 0.8,
        system: 'BE FRIENDLY'
      }, {
        clientProvider
      }).last();

      const payload = JSON.parse(mockFetch.mock.calls[0][1].body);

      expect(payload).toMatchObject({
        messages: expect.arrayContaining([
          {
            role: 'system',
            content: expect.stringContaining('BE FRIENDLY')
          },
          {
            role: 'user',
            content: expect.stringContaining('Test query 666555')
          }
        ]),
        temperature: 0.8,
        max_tokens: 300,
        model: [
          'anthropic:good',
          'openai:good',
          'anthropic:fast',
          'openai:fast'
        ]
      });
    });

    it('should handle config object with messages array', async () => {
      await stream({
        messages: [
          {
            role: 'user',
            content: 'Previous message'
          },
          {
            role: 'assistant',
            content: 'Previous response'
          },
          {
            role: 'user',
            content: 'Test query'
          }
        ],
        system: 'You are a helpful assistant'
      }, {
        clientProvider
      }).last();

      const payload = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(payload).toMatchObject({
        messages: [
          {
            role: 'system',
            content: expect.stringContaining('You are a helpful assistant')
          },
          {
            role: 'user',
            content: 'Previous message'
          },
          {
            role: 'assistant',
            content: 'Previous response'
          },
          {
            role: 'user',
            content: expect.stringContaining('Test query')
          }
        ],
        max_tokens: 300,
        temperature: 0.72,
        model: [
          'anthropic:good',
          'openai:good',
          'anthropic:fast',
          'openai:fast'
        ]
      });
    });

    it('should throw error if no clientProvider', async () => {
      await expect(async () => {
        await stream('Test query').last();
      }).rejects.toThrow('clientProvider is required');
    });
  });

  describe('Config and Defaults', () => {
    it('should respect global defaults', async () => {
      configure({
        defaults: {
          temperature: 0.9,
          model: 'anthropic:fast',
          maxTokens: 2000
        }
      });

      await stream('Test query', {
        clientProvider
      }).last();

      const payload = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(payload).toMatchObject({
        temperature: 0.9,
        model: 'anthropic:fast',
        max_tokens: 2000
      });
    });

    it('should allow overriding defaults', async () => {
      await stream('Test query', {
        clientProvider,
        temperature: 0.5,
        model: 'openai:good'
      }).last();

      const payload = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(payload).toMatchObject({
        temperature: 0.5,
        model: 'openai:good'
      });
    });

    it('should handle both prompt and system in config', async () => {
      await stream({
        prompt: 'Test query',
        system: 'You are a test assistant'
      }, {
        clientProvider
      }).last();

      const payload = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(payload).toMatchObject({
        messages: [
          {
            role: 'system',
            content: expect.stringContaining('You are a test assistant')
          },
          {
            role: 'user',
            content: expect.stringContaining('Test query')
          }
        ],
        max_tokens: 300,
        temperature: 0.72,
        model: [
          'anthropic:good',
          'openai:good',
          'anthropic:fast',
          'openai:fast'
        ]
      });
    });

    it('should throw if both messages and prompt provided', async () => {
      await expect(async () => {
        await stream({
          messages: [{ role: 'user', content: 'Test' }],
          prompt: 'Test query'
        }, {
          clientProvider
        }).last()
      }).rejects.toThrow('Cannot provide both messages and (prompt or system)');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors as stream content', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const updates = [];
      const stream1 = stream('Test query', {
        clientProvider
      });

      for await (const update of stream1) {
        updates.push(update);
      }

      expect(updates).toEqual([
        getConfig().defaults.errorMessages.networkError
      ]);
    });

    it('should handle malformed server responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: {
          getReader: () => createMockReader([
            'data: {invalid json}\n\n'
          ])
        }
      });

      const results = [];
      for await (const chunk of stream('Test query', { clientProvider })) {
        results.push(chunk);
      }
      
      expect(results).toEqual(['']);
    });

    it('should handle HTTP errors as stream content', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429
      });

      const updates = [];
      const stream1 = stream('Test query', {
        clientProvider
      });

      for await (const update of stream1) {
        updates.push(update);
      }

      expect(updates).toEqual([
        getConfig().defaults.errorMessages.rateLimitExceeded
      ]);
    });
  });

  describe('Schema and Mode Parity', () => {
    it('should include schema scaffold in messages to proxy', async () => {
      await stream('List colors', {
        clientProvider,
        schema: {
          colors: {
            color: Array(String)
          }
        }
      }).last();

      const payload = JSON.parse(mockFetch.mock.calls[0][1].body);
      // Client transforms schema into scaffold in messages
      expect(payload.messages).toEqual([
        {
          role: 'system',
          content: expect.stringContaining('You are an AI that only outputs XML')
        },
        {
          role: 'user',
          content: expect.stringContaining('<colors>') && 
                   expect.stringContaining('<color>') &&
                   expect.stringContaining('List colors')
        }
      ]);
      // Schema is not sent to proxy
      expect(payload.schema).toBeUndefined();
    });

    it('should handle mode parameters', async () => {
      await stream('Test query', {
        clientProvider,
        schema: {
          response: String
        },
        mode: 'state_open'
      }).last();

      const payload = JSON.parse(mockFetch.mock.calls[0][1].body);
      console.log('Mode payload:', payload);  // Let's see what's actually being sent

      // The client doesn't pass mode params to proxy - it uses them locally for parsing
      expect(payload).toMatchObject({
        messages: expect.any(Array),
        // No mode params - they're used client-side for response parsing
      });
    });

    it('should validate mode parameter', async () => {
      await expect(async () => {
        await stream('Test query', {
          clientProvider,
          mode: 'invalid'
        }).last();
      }).rejects.toThrow('Invalid mode. Must be one of: state_open, state_closed, root_open, root_closed');
    });
  });

  describe('simple() Mode Behavior', () => {
    it('should demonstrate why state_closed is better than root_closed for simple()', async () => {
      // First test with root_closed mode
      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: {
          getReader: () => createMockReader([
            'data: {"content":"<root_value_a>A</root_value_a>"}\n\n',
            'data: {"content":"<root_value_b>B</root_value_b>"}\n\n',
            'data: {"content":"<root_value_c>C</root_value_c>"}\n\n'
          ])
        }
      });

      // Using root_closed mode (wrong approach)
      const rootClosedResult = await simple(
        'Get values',
        {
          schema: {
            root_value_a: String,
            root_value_b: String,
            root_value_c: String
          },
          clientProvider,
          mode: 'root_closed'
        }
      );

      // Reset mock for second test
      mockFetch.mockReset();

      // Setup mock for state_closed test
      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: {
          getReader: () => createMockReader([
            'data: {"content":"<root_value_a>A</root_value_a>"}\n\n',
            'data: {"content":"<root_value_b>B</root_value_b>"}\n\n',
            'data: {"content":"<root_value_c>C</root_value_c>"}\n\n'
          ])
        }
      });

      // Using state_closed mode (correct approach)
      const stateClosedResult = await simple(
        'Get values',
        {
          schema: {
            root_value_a: String,
            root_value_b: String,
            root_value_c: String
          },
          clientProvider,
          // DEFAULT mode: 'state_closed'
        }
      );

      // root_closed would miss the correction due to deduplication
      expect(rootClosedResult.root_value_a).toBeUndefined();
      expect(rootClosedResult.root_value_b).toBeUndefined();
      // Only the last is given to us:
      expect(rootClosedResult.root_value_c).toBeDefined();
      
      // state_closed captures the final state correctly
      expect(stateClosedResult.root_value_a).toEqual('A');
      expect(stateClosedResult.root_value_b).toEqual('B');
      expect(stateClosedResult.root_value_c).toEqual('C');

      // Verify the fetch calls were made correctly
      expect(mockFetch).toHaveBeenCalledWith(
        'http://test-endpoint.com',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: expect.any(String)
        })
      );
    });
  });

  describe('ClientProvider Configuration', () => {
    beforeEach(() => {
      // Reset config before each test
      resetConfig();
      mockFetch = jest.fn();
      global.fetch = mockFetch;
    });

    it('should allow setting clientProvider via configure()', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        body: {
          getReader: () => createMockReader([
            'data: {"content":"<response>Test</response>"}\n\n'
          ])
        }
      });
      global.fetch = mockFetch;

      const configuredProvider = new ClientProvider('http://configured-endpoint.com');
      
      // Set via configure
      configure({
        clientProvider: configuredProvider
      });

      // Should work without passing clientProvider directly
      await stream('Test query').last();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://configured-endpoint.com',
        expect.any(Object)
      );
    });

    it('should allow overriding configured clientProvider', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        body: {
          getReader: () => createMockReader([
            'data: {"content":"<response>Test</response>"}\n\n'
          ])
        }
      });
      global.fetch = mockFetch;

      // Set default provider
      configure({
        clientProvider: new ClientProvider('http://default-endpoint.com')
      });

      // Override with direct provider
      const directProvider = new ClientProvider('http://direct-endpoint.com');
      await stream('Test query', {
        clientProvider: directProvider
      }).last();

      // Should use the direct provider, not the configured one
      expect(mockFetch).toHaveBeenCalledWith(
        'http://direct-endpoint.com',
        expect.any(Object)
      );
    });

    it('should throw error if no clientProvider configured or provided', async () => {
      await expect(async () => stream('Test query').last())
        .rejects
        .toThrow('clientProvider is required - either pass it directly or set via configure()');
    });

    it('should work with string endpoint in configure', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        body: {
          getReader: () => createMockReader([
            'data: {"content":"<response>Test</response>"}\n\n'
          ])
        }
      });
      global.fetch = mockFetch;

      // Configure with string endpoint
      configure({
        clientProvider: 'http://string-endpoint.com'
      });

      await stream('Test query').last();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://string-endpoint.com',
        expect.any(Object)
      );
    });
  });

  describe('Error Message Handling', () => {
    beforeEach(() => {
      resetConfig();  // Reset to default config
      mockFetch = jest.fn();
      global.fetch = mockFetch;
    });

    it('should use default error messages', async () => {
      // Mock a rate limit error response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429
      });

      const clientProvider = new ClientProvider('http://test-endpoint.com');
      const streamResult = await clientProvider.createStream({});
      
      // Read the error message from the stream
      const reader = streamResult.getReader();
      const {value} = await reader.read();
      const message = new TextDecoder().decode(value);

      // Should match default config message
      expect(message).toBe(getConfig().defaults.errorMessages.rateLimitExceeded);
    });

    it('should allow overriding error messages via config', async () => {
      const customMessage = "Custom rate limit message";
      
      configure({
        defaults: {
          errorMessages: {
            rateLimitExceeded: customMessage
          }
        }
      });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429
      });

      const clientProvider = new ClientProvider('http://test-endpoint.com');
      const streamResult = await clientProvider.createStream({});
      
      const reader = streamResult.getReader();
      const {value} = await reader.read();
      const message = new TextDecoder().decode(value);

      expect(message).toBe(customMessage);
    });

    it('should allow overriding error messages per request', async () => {
      const customMessage = "Request-specific rate limit message";
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429
      });

      const clientProvider = new ClientProvider('http://test-endpoint.com');
      const streamResult = await clientProvider.createStream({
        errorMessages: {
          rateLimitExceeded: customMessage
        }
      });
      
      const reader = streamResult.getReader();
      const {value} = await reader.read();
      const message = new TextDecoder().decode(value);

      expect(message).toBe(customMessage);
    });

    it('should prioritize request-specific messages over config defaults', async () => {
      const configMessage = "Config rate limit message";
      const requestMessage = "Request-specific rate limit message";
      
      configure({
        defaults: {
          errorMessages: {
            rateLimitExceeded: configMessage
          }
        }
      });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429
      });

      const clientProvider = new ClientProvider('http://test-endpoint.com');
      const streamResult = await clientProvider.createStream({
        errorMessages: {
          rateLimitExceeded: requestMessage
        }
      });
      
      const reader = streamResult.getReader();
      const {value} = await reader.read();
      const message = new TextDecoder().decode(value);

      expect(message).toBe(requestMessage);
    });
  });

  describe('simple() function', () => {
    it('should handle string prompt with options', async () => {
      const result = await simple("What is 2+2?", {
        schema: { answer: Number },
        clientProvider,
        temperature: 0.7
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://test-endpoint.com',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"temperature":0.7')
        })
      );
    });

    it('should handle config object', async () => {
      const result = await simple({
        prompt: "What is 2+2?",
        schema: { answer: Number },
        temperature: 0.7
      }, {
        clientProvider
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://test-endpoint.com',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"temperature":0.7')
        })
      );
    });
  });
});