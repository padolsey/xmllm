import { jest } from '@jest/globals';

// Mock Stream module before other imports
const mockFactory = () => ({
  default: jest.fn().mockImplementation(() => Promise.resolve({
    getReader: () => ({
      read: () => Promise.resolve({ done: true }),
      releaseLock: jest.fn()
    })
  }))
});

// Set up the mock
jest.unstable_mockModule('./src/Stream.mjs', mockFactory);

// Now import the rest
import createServer from '../src/proxies/default.mjs';
import request from 'supertest';
import StreamManager from '../src/StreamManager.mjs';
import Provider from '../src/Provider.mjs';
import ProviderManager from '../src/ProviderManager.mjs';

const TEST_PORT = 3155;
const TEST_TIMEOUT = 10000;

describe('XMLLM Proxy Server', () => {
  const originalEnv = process.env;
  let server;

  beforeEach(() => {
    // Reset ProviderManager's static instance
    if ('_instance' in ProviderManager) {
      delete ProviderManager._instance;
    }

    // Mock Provider's fetch
    global.mockFetch = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ 
          content: [{ text: 'Mocked response' }]
        }),
        text: () => Promise.resolve('Mocked text response')
      });
    });
    Provider.setGlobalFetch(global.mockFetch);
  });

  afterEach(async () => {
    process.env = originalEnv;
    jest.resetAllMocks();
    Provider.setGlobalFetch(fetch);

    if (server) {
      await new Promise((resolve) => server.close(resolve));
      server = null;
    }
  });

  // Helper to create and start server
  const createAndStartServer = (config = {}) => {
    if (server) {
      server.close();
    }
    server = createServer({
      port: TEST_PORT,
      ...config
    });
    return server;
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
      expect(() => createServer({ globalRequestsPerMinute: 0 }))
        .toThrow('Invalid proxy configuration:\n- globalRequestsPerMinute must be >= 1, got: 0');

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
    beforeAll(() => {
      process.env.NODE_ENV = 'test'; // Ensure we're in test mode
    });

    beforeEach(() => {
      createAndStartServer({
        globalRequestsPerMinute: 2,
        globalTokensPerMinute: 1000
      });
    });

    test('enforces global rate limits', async () => {
      const validPayload = {
        messages: [{ role: 'user', content: 'Test message' }],
        model: 'anthropic:fast',
        // Add test-specific rate limiting config
        rateLimit: {
          windowMs: 1000,  // 1 second window in tests
          maxRequests: 5   // Allow 5 requests per window
        }
      };

      // Make requests in quick succession using supertest
      const requests = Array(6).fill().map(() => 
        request(server)
          .post('/api/stream')
          .send(validPayload)
      );

      const responses = await Promise.all(requests);
      expect(responses.some(r => r.status === 429)).toBe(true);
    }, 15000);

    test('enforces token limits', async () => {
      const largePayload = {
        messages: [{
          role: 'user',
          // Large message that would exceed token limit
          content: 'x'.repeat(4000)
        }],
        model: 'anthropic:fast'
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
        globalRequestsPerMinute: 10
      });
    });

    test('validates messages format', async () => {
      const invalidPayload = {
        messages: [{ 
          role: 'invalid',
          content: 'Test'
        }],
        model: 'anthropic:fast'
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
        model: 'anthropic:fast',
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
          model: 'anthropic:fast'
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
          model: 'anthropic:fast'
        });

      // Simulate client disconnection
      response.req.destroy();

      // Wait for cleanup
      await cleanupPromise;
      expect(cleanupCalled).toBe(true);
    }, TEST_TIMEOUT);
  });

  describe('Proxy Error Handling', () => {
    beforeEach(() => {
      createAndStartServer();
    });

    it('should return error messages as SSE events', async () => {
      const app = createServer({ listen: false });

      const response = await request(app)
        .post('/api/stream')
        .send({
          messages: [{ role: 'user', content: 'Test' }],
          model: 'anthropic:fast',
          errorMessages: {
            genericFailure: "Custom error message"
          }
        });

      expect(response.headers['content-type']).toBe('text/event-stream');

      console.log('Response:', response?.text);
      
      expect(response.text).toContain(`data: {"content":"Custom error message"}`);
    });

    it('should respect proxy-level error message configuration', async () => {
      const customMessage = "Proxy-level error message";
      const app = createServer({ 
        listen: false,
        errorMessages: {
          genericFailure: customMessage
        }
      });

      const response = await request(app)
        .post('/api/stream')
        .send({
          messages: [{ role: 'user', content: 'Test' }],
          model: 'anthropic:fast'
        });

      expect(response.text).toContain(`data: {"content":"${customMessage}"}`);
    });

    it('should prioritize request error messages over proxy config', async () => {
      const proxyMessage = "Proxy-level error message";
      const requestMessage = "Request-level error message";
      
      const app = createServer({ 
        listen: false,
        errorMessages: {
          genericFailure: proxyMessage
        }
      });

      const response = await request(app)
        .post('/api/stream')
        .send({
          messages: [{ role: 'user', content: 'Test' }],
          model: 'anthropic:fast',
          errorMessages: {
            genericFailure: requestMessage
          }
        });

      expect(response.text).toContain(`data: {"content":"${requestMessage}"}`);
    });

    it('should handle rate limit errors with specific messages', async () => {
      const app = createServer({ 
        listen: false,
        globalRequestsPerMinute: 1
      });

      // First request to trigger rate limit
      await request(app)
        .post('/api/stream')
        .send({
          messages: [{ role: 'user', content: 'Test123' }],
          model: 'anthropic:fast'
        });

      // Second request should be rate limited
      const response = await request(app)
        .post('/api/stream')
        .send({
          messages: [{ role: 'user', content: 'Test345' }],
          model: 'anthropic:fast',
          errorMessages: {
            rateLimitExceeded: "Custom rate limit message !!!"
          }
        });

      expect(response.status).toBe(429);
      expect(response.body).toMatchObject({
        error: 'Global rate limit exceeded',
        message: "Custom rate limit message !!!"
      });
    });
  });

  describe('Enhanced Error Handling', () => {
    beforeEach(() => {
      server = createAndStartServer({
        maxRequestSize: 1024 * 10 // 10KB for testing
      });
    });

    it('should handle request body size limits', async () => {
      const largePayload = {
        messages: [{ 
          role: 'user', 
          content: 'x'.repeat(1024 * 20) // 20KB
        }],
        model: 'anthropic:fast'
      };

      const response = await request(server)
        .post('/api/stream')
        .send(largePayload);

      expect(response.status).toBe(413);
      expect(response.body).toMatchObject({
        error: 'Request entity too large',
        code: 'PAYLOAD_TOO_LARGE',
        maxSize: 1024 * 10
      });
    });

    it('should handle malformed JSON gracefully', async () => {
      const response = await request(server)
        .post('/api/stream')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}');

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: 'Invalid JSON in request body',
        code: 'INVALID_JSON'
      });
    });

  });

  describe('Method Handling', () => {
    beforeEach(() => {
      createAndStartServer();
    });

    it('should reject invalid methods on /api/stream', async () => {
      const response = await request(server)
        .put('/api/stream')
        .send({});

      expect(response.status).toBe(405);
      expect(response.body).toMatchObject({
        error: 'Method not allowed',
        code: 'METHOD_NOT_ALLOWED'
      });
    });

    it('should reject invalid methods on /api/limits', async () => {
      const response = await request(server)
        .post('/api/limits');

      expect(response.status).toBe(405);
      expect(response.body).toMatchObject({
        error: 'Method not allowed',
        code: 'METHOD_NOT_ALLOWED'
      });
    });
  });

  describe('CORS Handling', () => {
    it('should handle specific origin with credentials', async () => {
      const testOrigin = 'http://example.com';
      server = createAndStartServer({
        corsOrigins: testOrigin
      });

      const response = await request(server)
        .options('/api/stream')
        .set('Origin', testOrigin);

      expect(response.headers['access-control-allow-origin']).toBe(testOrigin);
      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });

    it('should handle wildcard origin without credentials', async () => {
      server = createAndStartServer({
        corsOrigins: '*'
      });

      const response = await request(server)
        .options('/api/stream')
        .set('Origin', 'http://example.com');

      expect(response.headers['access-control-allow-origin']).toBe('http://example.com');
      expect(response.headers['access-control-allow-credentials']).toBe('false');
    });

    it('should reject disallowed origins', async () => {
      server = createAndStartServer({
        corsOrigins: ['http://allowed.com']
      });

      const response = await request(server)
        .options('/api/stream')
        .set('Origin', 'http://notallowed.com');

      expect(response.headers['access-control-allow-origin']).toBe('null');
      expect(response.headers['access-control-allow-credentials']).toBe('false');
    });
  });

  describe('Custom Paths', () => {
    it('should handle custom stream path', async () => {
      const app = createServer({ 
        listen: false,
        paths: {
          stream: '/custom/stream/path'
        }
      });

      const response = await request(app)
        .post('/custom/stream/path')
        .send({
          messages: [{ role: 'user', content: 'Test' }],
          model: 'anthropic:fast'
        });

      expect(response.headers['content-type']).toBe('text/event-stream');
    });

    it('should handle custom limits path', async () => {
      const app = createServer({ 
        listen: false,
        paths: {
          limits: '/custom/limits/path'
        }
      });

      const response = await request(app)
        .get('/custom/limits/path');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('allowed');
    });

    it('should reject requests to default paths when custom paths configured', async () => {
      const app = createServer({ 
        listen: false,
        paths: {
          stream: '/custom/stream',
          limits: '/custom/limits'
        }
      });

      const response = await request(app)
        .post('/api/stream')
        .send({
          messages: [{ role: 'user', content: 'Test' }],
          model: 'anthropic:fast'
        });

      expect(response.status).toBe(404);
    });
  });
});
