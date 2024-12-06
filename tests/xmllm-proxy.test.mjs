import { jest } from '@jest/globals';
import createServer from '../src/xmllm-proxy.mjs';
import request from 'supertest';
import StreamManager from '../src/StreamManager.mjs';
import Provider from '../src/Provider.mjs';
import ProviderManager from '../src/ProviderManager.mjs';

const TEST_PORT = 3155;
const TEST_TIMEOUT = 5000;

describe('XMLLM Proxy Server', () => {
  const originalEnv = process.env;
  let server;
  let app;

  beforeEach(() => {
    // Reset ProviderManager's static instance
    if ('_instance' in ProviderManager) {
      delete ProviderManager._instance;
    }

    // Mock Provider's fetch
    const mockFetch = jest.fn().mockImplementation(() => {
      throw new Error('API Error');
    });
    Provider.setGlobalFetch(mockFetch);
  });

  afterEach((done) => {
    process.env = originalEnv;
    jest.resetAllMocks();
    Provider.setGlobalFetch(fetch);

    if (server) {
      server.close(done);
    } else {
      done();
    }
  });

  // Helper to create and start server
  const createAndStartServer = (config = {}) => {
    if (server) {
      server.close();
    }
    app = createServer({
      port: TEST_PORT,
      listen: false,
      ...config
    });
    server = app.listen(TEST_PORT);
    return { app, server };
  };

  describe('Configuration Validation', () => {
    // These don't need a running server since they just test createServer()
    test('validates port number', async () => {
      expect(() => createServer({ port: -1 }))
        .toThrow('Invalid proxy configuration:\n- port must be >= 1, got: -1');

      expect(() => createServer({ port: 70000 }))
        .toThrow('Invalid proxy configuration:\n- port must be <= 65535, got: 70000');
      
      expect(() => createServer({ port: 'abc' }))
        .toThrow('Invalid proxy configuration:\n- port must be a number, got: string');
    });

    test('validates rate limits', async () => {
      expect(() => createServer({ globalRateLimit: 0 }))
        .toThrow('Invalid proxy configuration:\n- globalRateLimit must be >= 1, got: 0');

      expect(() => createServer({ globalTokensPerMinute: -100 }))
        .toThrow('Invalid proxy configuration:\n- globalTokensPerMinute must be >= 1, got: -100');
      
      expect(() => createServer({ globalTokensPerHour: 'unlimited' }))
        .toThrow('Invalid proxy configuration:\n- globalTokensPerHour must be a number, got: string');
    });

    test('validates timeout', async () => {
      expect(() => createServer({ timeout: 50 }))
        .toThrow('Invalid proxy configuration:\n- timeout must be >= 100, got: 50');

      expect(() => createServer({ timeout: 400000 }))
        .toThrow('Invalid proxy configuration:\n- timeout must be <= 300000ms, got: 400000ms');
    });

    test('validates CORS origins', async () => {
      expect(() => createServer({ corsOrigins: 123 }))
        .toThrow('Invalid proxy configuration:\n- corsOrigins must be a string or array');

      // These should be valid
      expect(() => createServer({ corsOrigins: '*', listen: false })).not.toThrow();
      expect(() => createServer({ corsOrigins: ['http://localhost:3000'], listen: false })).not.toThrow();
    });

    test('detects unknown configuration keys', async () => {
      expect(() => createServer({ 
        unknownKey: 'value',
        listen: false,
        globalRateLimt: 100 // Typo
      }))
        .toThrow(/Unknown configuration key: "unknownKey".*Unknown configuration key: "globalRateLimt"/s);
    });
  });

  describe('Rate Limiting', () => {
    beforeEach(() => {
      createAndStartServer({
        globalRateLimit: 2,
        globalTokensPerMinute: 1000
      });
    });

    test('enforces global rate limits', async () => {
      const validPayload = {
        messages: [{ role: 'user', content: 'Test message' }],
        model: 'claude:fast'
      };

      // First request should succeed
      const response1 = await request(server) // Use server instead of app
        .post('/api/stream')
        .send(validPayload);
      expect(response1.status).toBe(200);

      // Second request should succeed
      const response2 = await request(server)
        .post('/api/stream')
        .send(validPayload);
      expect(response2.status).toBe(200);

      // Third request should be rate limited
      const response3 = await request(server)
        .post('/api/stream')
        .send(validPayload);
      expect(response3.status).toBe(429);
      expect(response3.body).toMatchObject({
        error: 'Global rate limit exceeded',
        code: 'GLOBAL_RATE_LIMIT'
      });
    }, TEST_TIMEOUT); // Add timeout

    test('enforces token limits', async () => {
      const largePayload = {
        messages: [{
          role: 'user',
          // Large message that would exceed token limit
          content: 'x'.repeat(4000)
        }],
        model: 'claude:fast'
      };

      const response = await request(server)
        .post('/api/stream')
        .send(largePayload);

      expect(response.status).toBe(429);
      expect(response.body).toMatchObject({
        error: 'Global rate limit exceeded',
        code: 'GLOBAL_RATE_LIMIT'
      });
    }, TEST_TIMEOUT);

    test('rate limit status endpoint', async () => {
      const response = await request(server)
        .get('/api/limits');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        allowed: true,
        limits: {
          rpm: {
            limit: 2,
            remaining: expect.any(Number),
            resetInMs: expect.any(Number)
          },
          tpm: {
            limit: 1000,
            remaining: expect.any(Number),
            resetInMs: expect.any(Number)
          }
        }
      });
    }, TEST_TIMEOUT);
  });

  describe('Request Validation', () => {
    beforeEach(() => {
      createAndStartServer({
        globalRateLimit: 10
      });
    });

    test('validates messages format', async () => {
      const invalidPayload = {
        messages: [{ 
          role: 'invalid',
          content: 'Test'
        }],
        model: 'claude:fast'
      };

      const response = await request(server)
        .post('/api/stream')
        .send(invalidPayload);

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: 'Invalid message role',
        code: expect.any(String)
      });
    }, TEST_TIMEOUT);

    test('validates model format', async () => {
      const invalidPayload = {
        messages: [{ 
          role: 'user',
          content: 'Test'
        }],
        model: 'invalid:model'
      };

      const response = await request(server)
        .post('/api/stream')
        .send(invalidPayload);

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: 'Provider not found',
        code: expect.any(String)
      });
    }, TEST_TIMEOUT);

    test('validates parameters', async () => {
      const invalidPayload = {
        messages: [{ 
          role: 'user',
          content: 'Test'
        }],
        model: 'claude:fast',
        temperature: 2.0  // Invalid temperature
      };

      const response = await request(server)
        .post('/api/stream')
        .send(invalidPayload);

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: 'Temperature must be between 0 and 1',
        code: expect.any(String)
      });
    }, TEST_TIMEOUT);
  });

  describe('Error Handling', () => {

    beforeEach(() => {
      createAndStartServer();
    });

    test('handles API errors by sending error event', async () => {
      const mockFetch = jest.fn().mockImplementation(() => {
        throw new Error('API Error');
      });
      Provider.setGlobalFetch(mockFetch);

      const response = await request(server)
        .post('/api/stream')
        .send({
          messages: [{ role: 'user', content: 'Test' }],
          model: 'claude:fast'
        });

      // Verify response headers for SSE
      expect(response.headers['content-type']).toBe('text/event-stream');
      
      // Parse SSE response
      const events = response.text
        .split('\n\n')
        .filter(e => e.trim())
        .map(event => {
          if (event.startsWith('data:')) {
            return {
              type: 'data',
              data: JSON.parse(event.replace('data:', '').trim())
            };
          }
          const [eventType, data] = event.split('\n');
          if (eventType === 'event: close') {
            return {
              type: 'close',
              data: data.replace('data: ', '')
            };
          }
          return {
            type: eventType.replace('event: ', ''),
            data: JSON.parse(data.replace('data: ', ''))
          };
        });

      // Should have error message and close event
      expect(events).toHaveLength(2);
      expect(events[0]).toMatchObject({
        type: 'data',
        data: {
          content: expect.stringContaining('encountered issues responding')
        }
      });
      expect(events[1]).toMatchObject({
        type: 'close',
        data: 'Stream ended'
      });
    });

    test('handles stream interruption gracefully', async () => {
      // Create a promise that resolves when cleanup is called
      let cleanupCalled = false;
      const cleanupPromise = new Promise(resolve => {
        const originalCleanup = StreamManager.prototype.cleanup;
        StreamManager.prototype.cleanup = function(...args) {
          cleanupCalled = true;
          originalCleanup.apply(this, args);
          resolve();
        };
      });

      const response = await request(server)
        .post('/api/stream')
        .send({
          messages: [{ role: 'user', content: 'Test' }],
          model: 'claude:fast'
        });

      // Simulate client disconnection
      response.req.destroy();

      // Wait for cleanup
      await cleanupPromise;
      expect(cleanupCalled).toBe(true);
    }, TEST_TIMEOUT);
  });
}); 