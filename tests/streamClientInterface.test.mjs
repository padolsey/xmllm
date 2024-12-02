import { jest } from '@jest/globals';
import { stream, ClientProvider } from '../src/xmllm-client.mjs';
import { configure } from '../src/config.mjs';

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
    configure({
      defaults: {
        temperature: 0.72,
        maxTokens: 4000,
        model: 'claude:good'
      }
    });

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
        messages: [
          {
            role: 'system',
            content: ''
          },
          {
            role: 'user',
            content: 'Test query'
          }
        ],
        max_tokens: 4000,
        temperature: 0.72,
        top_p: 1,
        presence_penalty: 0,
        model: 'claude:good'
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
        prompt: 'Test query',
        temperature: 0.8
      }, {
        clientProvider
      }).last();

      const payload = JSON.parse(mockFetch.mock.calls[0][1].body);
      console.log('p>>>>', payload)
      expect(payload).toMatchObject({
        messages: [
          {
            role: 'system',
            content: ''
          },
          {
            role: 'user',
            content: 'Test query'
          }
        ],
        temperature: 0.8,
        max_tokens: 4000,
        model: 'claude:good'
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
            content: 'You are a helpful assistant'
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
            content: 'Test query'
          }
        ],
        max_tokens: 4000,
        temperature: 0.72,
        model: 'claude:good'
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
          model: 'claude:fast',
          maxTokens: 2000
        }
      });

      await stream('Test query', {
        clientProvider
      }).last();

      const payload = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(payload).toMatchObject({
        temperature: 0.9,
        model: 'claude:fast',
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
            content: 'You are a test assistant'
          },
          {
            role: 'user',
            content: 'Test query'
          }
        ],
        max_tokens: 4000,
        temperature: 0.72,
        model: 'claude:good'
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
    it('should handle fetch errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        stream('Test query', {
          clientProvider
        }).last()
      ).rejects.toThrow('Network error');
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
}); 