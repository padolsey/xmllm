import { jest } from '@jest/globals';
import { configure, getConfig } from '../src/config.mjs';
import { stream } from '../src/xmllm-main.mjs';
import { stream as clientStream, ClientProvider } from '../src/xmllm-client.mjs';
import Logger from '../src/Logger.mjs';

describe('Logging Configuration', () => {
  let originalConsole;
  let mockConsole;
  let mockCustomLogger;

  beforeEach(() => {
    // Save original console
    originalConsole = global.console;
    
    // Mock console methods
    mockConsole = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      debug: jest.fn()
    };
    global.console = mockConsole;

    // Mock custom logger
    mockCustomLogger = jest.fn();

    // Reset configuration before each test
    configure({
      logging: {
        level: 'INFO',
        custom: null
      }
    });
  });

  afterEach(() => {
    // Restore original console
    global.console = originalConsole;
  });

  describe('Log Level Configuration', () => {
    test('should respect log level configuration', async () => {
      // First set up ERROR level
      configure({
        logging: { level: 'ERROR' }
      });

      // Reset any loggers that might have been created
      jest.clearAllMocks();
      
      // Clear any configuration logs before our actual test
      mockConsole.log.mockClear();
      mockCustomLogger.mockClear();

      const TestStream = jest.fn().mockImplementation(() => ({
        getReader: () => ({
          read: jest.fn()
            .mockResolvedValueOnce({ 
              value: new TextEncoder().encode('<item>test</item>'),
              done: false 
            })
            .mockResolvedValueOnce({ done: true }),
          releaseLock: jest.fn()
        })
      }));

      await stream('Test prompt', {
        llmStream: TestStream
      }).last();

      // Info logs should be suppressed
      expect(mockConsole.log).not.toHaveBeenCalled();
      
      // Force an error
      TestStream.mockImplementationOnce(() => {
        throw new Error('Test error');
      });

      try {
        await stream('Test prompt', {
          llmStream: TestStream
        }).last();
      } catch (e) {
        // Error logs should still appear
        expect(mockConsole.error).toHaveBeenCalled();
      }
    });

    test('should validate log levels', () => {
      configure({
        logging: { level: 'INVALID_LEVEL' }
      });
      
      const config = getConfig();
      expect(config.logging.level).toBe('INFO'); // Should fall back to INFO
    });
  });

  describe('Custom Logger', () => {
    test('should use custom logger when provided', async () => {
      configure({
        logging: {
          level: 'INFO',
          custom: mockCustomLogger
        }
      });

      const testLogger = new Logger('TestLogger');
      
      // Test different log levels
      testLogger.info('This is an info message');
      testLogger.debug('This should not appear');
      testLogger.error('This is an error');
      
      // Verify our custom logger was called correctly
      expect(mockCustomLogger).toHaveBeenCalledWith(
        'info',
        'TestLogger',
        'This is an info message'
      );
      
      expect(mockCustomLogger).toHaveBeenCalledWith(
        'error',
        'TestLogger',
        'This is an error'
      );
      
      // Debug shouldn't be called since we're at INFO level
      const debugCalls = mockCustomLogger.mock.calls.filter(
        call => call[0] === 'debug'
      );
      expect(debugCalls.length).toBe(0);
    });

    test('should reject invalid custom logger', () => {
      configure({
        logging: { 
          custom: 'not a function'  // Invalid logger
        }
      });
      
      const config = getConfig();
      expect(config.logging.customLogger).toBe(null);
    });

    test('should use custom logger when provided', async () => {
      configure({
        logging: {
          level: 'DEBUG',
          custom: mockCustomLogger
        }
      });

      // Should have logged the configuration change
      expect(mockCustomLogger).toHaveBeenCalledWith(
        'info',
        'Config',
        'Logging configuration updated:',
        'level=DEBUG',
        'customLogger=provided'
      );
    });
  });

  describe('Client Environment', () => {
    let mockFetch;

    beforeEach(() => {
      mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        body: {
          getReader: () => ({
            read: jest.fn().mockResolvedValue({ done: true }),
            releaseLock: jest.fn()
          })
        }
      });
      global.fetch = mockFetch;
    });

    test('should handle client-side logging', async () => {
      mockCustomLogger.mockClear();
      
      // First configure the logging
      configure({
        logging: { 
          level: 'INFO',
          custom: mockCustomLogger
        }
      });

      const client = new ClientProvider('http://test.com');
      
      // Manually set the logger on the client since we're not using configure() to create it
      const logger = new Logger('ClientProvider');
      client.setLogger(logger);

      const testPayload = {
        messages: [{
          role: 'user',
          content: 'Test prompt'
        }],
        model: 'anthropic:fast',
        temperature: 0.7,
        system: 'BE FRIENDLY'
      };

      await clientStream(testPayload, {
        clientProvider: client
      }).last();

      // Clear the configure() log message
      const payloadLog = mockCustomLogger.mock.calls.find(
        call => call[2] === 'Client createStream payload'
      );
      expect(payloadLog).toBeTruthy();
      expect(payloadLog).toEqual([
        'info',
        'ClientProvider',
        'Client createStream payload',
        {
          cache: undefined,
          fakeDelay: undefined,
          max_tokens: 300,
          messages: expect.arrayContaining([
            {
              content: expect.stringContaining('BE FRIENDLY'),
              role: 'system'
            },
            {
              content: expect.stringContaining('Test prompt'),
              role: 'user'
            }
          ]),
          model: 'anthropic:fast',
          keys: {},
          presence_penalty: 0,
          stop: undefined,
          temperature: 0.7,
          top_p: 1,
          errorMessages: getConfig().defaults.errorMessages
        }
      ]);
    });
  });

  describe('Configuration Immutability', () => {
    test('should return frozen config object', () => {
      const config = getConfig();
      
      // Store original values
      const originalLevel = config.logging.level;
      const originalLogger = config.logging.customLogger;
      
      // Verify objects are frozen
      expect(Object.isFrozen(config)).toBe(true);
      expect(Object.isFrozen(config.logging)).toBe(true);
      
      // Attempt modifications should throw in strict mode
      expect(() => {
        Object.defineProperty(config.logging, 'level', { value: 'DEBUG' });
      }).toThrow();
      
      // Verify values haven't changed
      expect(config.logging.level).toBe(originalLevel);
      expect(config.logging.customLogger).toBe(originalLogger);
    });
  });
}); 