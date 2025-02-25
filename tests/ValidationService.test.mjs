import { jest } from '@jest/globals';
import ValidationService from '../src/ValidationService.mjs';
import {
  MessageValidationError,
  ModelValidationError,
  PayloadValidationError
} from '../src/errors/ValidationErrors.mjs';

describe('ValidationService', () => {
  describe('validateMessages', () => {
    test('accepts valid messages array', () => {
      const messages = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there' }
      ];
      expect(() => ValidationService.validateMessages(messages)).not.toThrow();
    });

    test('rejects non-array messages', () => {
      expect(() => ValidationService.validateMessages('not an array'))
        .toThrow(MessageValidationError);
      
      try {
        ValidationService.validateMessages('not an array');
      } catch (error) {
        expect(error.details).toEqual({ received: 'string' });
      }
    });

    test('rejects messages without role', () => {
      const messages = [
        { content: 'Missing role' }
      ];
      
      try {
        ValidationService.validateMessages(messages);
      } catch (error) {
        expect(error).toBeInstanceOf(MessageValidationError);
        expect(error.details).toEqual({
          index: 0,
          message: { content: 'Missing role' }
        });
      }
    });

    test('rejects messages without content', () => {
      const messages = [
        { role: 'user' }
      ];
      
      try {
        ValidationService.validateMessages(messages);
      } catch (error) {
        expect(error).toBeInstanceOf(MessageValidationError);
        expect(error.details).toEqual({
          index: 0,
          message: { role: 'user' }
        });
      }
    });

    test('rejects invalid role', () => {
      const messages = [
        { role: 'invalid', content: 'test' }
      ];
      
      try {
        ValidationService.validateMessages(messages);
      } catch (error) {
        expect(error).toBeInstanceOf(MessageValidationError);
        expect(error.details).toEqual({
          index: 0,
          role: 'invalid',
          validRoles: ['user', 'assistant', 'developer']
        });
      }
    });

    test('rejects non-string content', () => {
      const messages = [
        { role: 'user', content: { some: 'object' } }
      ];
      
      try {
        ValidationService.validateMessages(messages);
      } catch (error) {
        expect(error).toBeInstanceOf(MessageValidationError);
        expect(error.details).toEqual({
          index: 0,
          contentType: 'object'
        });
      }
    });
  });

  describe('validateModel', () => {
    const availableModels = {
      openai: {
        models: {
          fast: { name: 'gpt-3.5-turbo' },
          good: { name: 'gpt-4' }
        }
      },
      anthropic: {
        models: {
          fast: { name: 'claude-instant' },
          good: { name: 'claude-2' }
        }
      }
    };

    test('accepts valid single model', () => {
      expect(() => 
        ValidationService.validateModel('openai:fast', availableModels)
      ).not.toThrow();
    });

    test('accepts valid model array', () => {
      expect(() => 
        ValidationService.validateModel(['openai:fast', 'anthropic:good'], availableModels)
      ).not.toThrow();
    });

    test('rejects invalid model format', () => {
      try {
        ValidationService.validateModel('invalid-format', availableModels);
      } catch (error) {
        expect(error).toBeInstanceOf(ModelValidationError);
        expect(error.details).toEqual({
          model: 'invalid-format',
          index: null,
          expectedFormat: 'provider:type'
        });
      }
    });

    test('rejects unknown provider', () => {
      try {
        ValidationService.validateModel('unknown:fast', availableModels);
      } catch (error) {
        expect(error).toBeInstanceOf(ModelValidationError);
        expect(error.details).toEqual({
          provider: 'unknown',
          index: null,
          availableProviders: ['openai', 'anthropic']
        });
      }
    });

    test('rejects unknown model type', () => {
      try {
        ValidationService.validateModel('openai:unknown', availableModels);
      } catch (error) {
        expect(error).toBeInstanceOf(ModelValidationError);
        expect(error.details).toEqual({
          provider: 'openai',
          type: 'unknown',
          index: null,
          availableTypes: ['fast', 'good']
        });
      }
    });
  });

  describe('validateParameters', () => {
    test('accepts valid parameters', () => {
      const params = {
        temperature: 0.7,
        max_tokens: 100,
        stream: true,
        cache: false
      };
      expect(() => ValidationService.validateLLMPayload(params)).not.toThrow();
    });

    test('accepts undefined optional parameters', () => {
      const params = {};
      expect(() => ValidationService.validateLLMPayload(params)).not.toThrow();
    });

    test('rejects invalid temperature', () => {
      const cases = [
        { temperature: -0.1 },
        { temperature: 1.1 },
        { temperature: 'warm' }
      ];

      cases.forEach(params => {
        try {
          ValidationService.validateLLMPayload(params);
        } catch (error) {
          expect(error).toBeInstanceOf(PayloadValidationError);
          expect(error.details).toEqual({ temperature: params.temperature });
        }
      });
    });

    test('rejects invalid max_tokens', () => {
      const cases = [
        { max_tokens: -1 },
        { max_tokens: 0 },
        { max_tokens: 1.5 },
        { max_tokens: 'hundred' }
      ];

      cases.forEach(params => {
        try {
          ValidationService.validateLLMPayload(params);
        } catch (error) {
          expect(error).toBeInstanceOf(PayloadValidationError);
          expect(error.details).toEqual({ max_tokens: params.max_tokens });
        }
      });
    });

    test('rejects invalid stream flag', () => {
      try {
        ValidationService.validateLLMPayload({ stream: 'yes' });
      } catch (error) {
        expect(error).toBeInstanceOf(PayloadValidationError);
        expect(error.details).toEqual({ stream: 'yes' });
      }
    });

    test('rejects invalid cache flag', () => {
      try {
        ValidationService.validateLLMPayload({ cache: 'yes' });
      } catch (error) {
        expect(error).toBeInstanceOf(PayloadValidationError);
        expect(error.details).toEqual({ cache: 'yes' });
      }
    });
  });

  describe('Legacy system message handling', () => {
    test('extracts system message from messages array', () => {
      const messages = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello' }
      ];

      const result = ValidationService.validateMessages(messages);
      expect(result.systemMessage).toBe('You are a helpful assistant.');
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].role).toBe('user');
    });

    test('handles messages without system message', () => {
      const messages = [
        { role: 'user', content: 'Hello' }
      ];

      const result = ValidationService.validateMessages(messages);
      expect(result.systemMessage).toBe('');
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].role).toBe('user');
    });

    test('validates system message content', () => {
      const messages = [
        { role: 'system', content: { invalid: 'type' } },
        { role: 'user', content: 'Hello' }
      ];

      expect(() => ValidationService.validateMessages(messages))
        .toThrow(MessageValidationError);
    });
  });

  describe('Constraint Validation', () => {
    test('accepts valid rpm limits', () => {
      expect(() => ValidationService.validateConstraints({ rpmLimit: 10 })).not.toThrow();
      expect(() => ValidationService.validateConstraints({ rpmLimit: 1 })).not.toThrow();
      expect(() => ValidationService.validateConstraints({ rpmLimit: 1000 })).not.toThrow();
    });

    test('rejects non-integer rpm limits', () => {
      expect(() => ValidationService.validateConstraints({ rpmLimit: 10.5 }))
        .toThrow(PayloadValidationError);
      
      try {
        ValidationService.validateConstraints({ rpmLimit: 10.5 });
      } catch (error) {
        expect(error.message).toBe('rpmLimit must be a whole number');
      }
    });

    test('rejects non-positive rpm limits', () => {
      const invalidValues = [0, -1, -10];
      
      invalidValues.forEach(value => {
        expect(() => ValidationService.validateConstraints({ rpmLimit: value }))
          .toThrow(PayloadValidationError);
        
        try {
          ValidationService.validateConstraints({ rpmLimit: value });
        } catch (error) {
          expect(error.message).toBe('rpmLimit must be positive');
        }
      });
    });

    test('rejects non-finite rpm limits', () => {
      const invalidValues = [Infinity, -Infinity];
      
      invalidValues.forEach(value => {
        expect(() => ValidationService.validateConstraints({ rpmLimit: value }))
          .toThrow(PayloadValidationError);
        
        try {
          ValidationService.validateConstraints({ rpmLimit: value });
        } catch (error) {
          expect(error.message).toBe('rpmLimit must be finite');
        }
      });
    });

    test('rejects non-numeric rpm limits', () => {
      const invalidValues = ['10', true, false, {}, []];
      
      invalidValues.forEach(value => {
        expect(() => ValidationService.validateConstraints({ rpmLimit: value }))
          .toThrow(PayloadValidationError);
        
        try {
          ValidationService.validateConstraints({ rpmLimit: value });
        } catch (error) {
          expect(error.message).toBe('rpmLimit must be a whole number');
        }
      });
    });
  });

  describe('Buffering Configuration', () => {
    test('accepts valid buffering options', () => {
      const validConfigs = [
        { enableBuffering: true, bufferTime: 50, maxBufferSize: 1024 },
        { enableBuffering: false },
        { bufferTime: 100 },
        { maxBufferSize: 2048 },
        {} // No buffering config is valid
      ];

      validConfigs.forEach(config => {
        expect(() => ValidationService.validateLLMPayload(config)).not.toThrow();
      });
    });

  });

  describe('Buffer Configuration', () => {
    test('accepts valid buffer configurations', () => {
      const validConfigs = [
        { buffer: true },
        { buffer: false },
        { buffer: { timeout: 50, maxSize: 1024 } },
        { buffer: { timeout: 0, maxSize: 0 } },
        { buffer: { timeout: 100 } }, // Just timeout
        { buffer: { maxSize: 2048 } }, // Just maxSize
        {} // No buffer config is valid
      ];

      validConfigs.forEach(config => {
        expect(() => ValidationService.validateLLMPayload(config)).not.toThrow();
      });
    });

    test('rejects invalid buffer values', () => {
      const invalidConfigs = [
        { buffer: 'yes' },
        { buffer: 1 },
        { buffer: [] },
        { buffer: null }
      ];

      invalidConfigs.forEach(config => {
        expect(() => ValidationService.validateLLMPayload(config))
          .toThrow(PayloadValidationError);
        
        try {
          ValidationService.validateLLMPayload(config);
        } catch (error) {
          expect(error.message).toBe('buffer must be a boolean or an object with timeout/maxSize properties');
        }
      });
    });

    test('rejects invalid timeout values', () => {
      const invalidConfigs = [
        { buffer: { timeout: -1 } },
        { buffer: { timeout: 1.5 } },
        { buffer: { timeout: '50' } },
        { buffer: { timeout: true } },
        { buffer: { timeout: Infinity } }
      ];

      invalidConfigs.forEach(config => {
        expect(() => ValidationService.validateLLMPayload(config))
          .toThrow(PayloadValidationError);
        
        try {
          ValidationService.validateLLMPayload(config);
        } catch (error) {
          expect(error.message).toBe('buffer.timeout must be a non-negative integer (milliseconds)');
        }
      });
    });

    test('rejects invalid maxSize values', () => {
      const invalidConfigs = [
        { buffer: { maxSize: -1024 } },
        { buffer: { maxSize: 1.5 } },
        { buffer: { maxSize: '1024' } },
        { buffer: { maxSize: true } },
        { buffer: { maxSize: Infinity } }
      ];

      invalidConfigs.forEach(config => {
        expect(() => ValidationService.validateLLMPayload(config))
          .toThrow(PayloadValidationError);
        
        try {
          ValidationService.validateLLMPayload(config);
        } catch (error) {
          expect(error.message).toBe('buffer.maxSize must be a non-negative integer (bytes)');
        }
      });
    });

    test('accepts partial buffer configurations', () => {
      const partialConfigs = [
        { buffer: { timeout: 100 } }, // Only timeout
        { buffer: { maxSize: 2048 } }, // Only maxSize
      ];

      partialConfigs.forEach(config => {
        expect(() => ValidationService.validateLLMPayload(config)).not.toThrow();
      });
    });

  });
}); 