import { xmllm, stream, simple, configure, resetConfig, getConfig } from '../src/xmllm-main.mjs';
import { jest } from '@jest/globals';

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

describe('Parser Configuration', () => {
  let TestStream;
  
  beforeEach(() => {
    resetConfig();
    TestStream = jest.fn().mockImplementation(() => ({
      getReader: () => createMockReader([
        '@START(test)hello@END(test)'
      ])
    }));
  });

  describe('Global Parser Configuration', () => {

    it('should use Idio parser when configured globally', async () => {
      configure({
        globalParser: 'idio'
      });

      const pipeline = xmllm(({ prompt }) => [
        prompt('Test prompt', {
          test: String
        })
      ], {
        llmStream: TestStream
      });

      const result = await pipeline.last();
      expect(result).toEqual({ test: 'hello' });
    });

    it('should throw error for invalid parser type in global config', async () => {
      expect(() => {
        configure({
          globalParser: 'invalid'
        });
      }).toThrow(/Invalid parser type/);
    });
  });

  describe('High-Level APIs with Global Parser', () => {
    beforeEach(() => {
      resetConfig();
      configure({
        globalParser: 'idio'
      });
    });

    it('should use global parser in stream function', async () => {
      const result = await stream('Test prompt', {
        schema: { test: String },
        llmStream: TestStream
      }).last();
      
      expect(result).toEqual({ test: 'hello' });
    });

    it('should use global parser in simple function', async () => {
      const result = await simple({
        prompt: 'Test prompt',
        schema: { test: String },
        llmStream: TestStream
      });
      
      expect(result).toEqual({ test: 'hello' });
    });
  });

  describe('Idio Symbol Configuration', () => {

    beforeEach(() => {
      resetConfig();
    });

    it('should allow configuring custom idio symbol', async () => {
      configure({
        globalParser: 'idio',
        idioSymbols: {
          tagPrefix: '@',
          closePrefix: '@',
          openBrace: 'START(',
          closeBrace: 'END(',
          braceSuffix: ')'
        }
      });

      const TestStream = jest.fn().mockImplementation(() => ({
        getReader: () => createMockReader([
          '@START(test)hello@END(test)'
        ])
      }));

      const result = await stream('Test prompt', {
        schema: { test: String },
        llmStream: TestStream
      }).last();
      
      expect(result).toEqual({ test: 'hello' });
    });

    it('should throw error for invalid idio symbols', () => {
      expect(() => {
        configure({
          idioSymbols: {
            tagPrefix: '',
            closePrefix: '@',
            openBrace: 'START(',
            closeBrace: 'END(',
            braceSuffix: ')'
          }
        });
      }).toThrow(/tagPrefix cannot be empty/);

      expect(() => {
        configure({
          idioSymbols: {
            tagPrefix: '@',
            closePrefix: null,
            openBrace: 'START(',
            closeBrace: 'END(',
            braceSuffix: ')'
          }
        });
      }).toThrow(/closePrefix must be a non-empty string/);
    });

    it('should allow empty openBrace and closeBrace', async () => {
      configure({
        idioSymbols: {
          tagPrefix: '<',
          closePrefix: '</',
          openBrace: '',
          closeBrace: '',
          braceSuffix: '>'
        }
      });

      const TestStream = jest.fn().mockImplementation(() => ({
        getReader: () => createMockReader([
          '<test>hello</test>'
        ])
      }));

      const result = await stream('Test prompt', {
        schema: { test: String },
        llmStream: TestStream
      }).last();
      
      expect(result).toEqual({ test: 'hello' });
    });

    it('should validate all required idio symbol properties', () => {
      expect(() => {
        configure({
          idioSymbols: {
            tagPrefix: '@',
            openBrace: '',
            closeBrace: '',
            closePrefix: '@',
            braceSuffix: 546456
          }
        });
      }).toThrow(/braceSuffix must be a non-empty string/);
    });

    it('should allow partial updates to idio symbols', async () => {

      configure({
        globalParser: 'idio',
        idioSymbols: {
          tagPrefix: '@',
          closePrefix: '@'
        }
      });

      const TestStream = jest.fn().mockImplementation(() => ({
        getReader: () => createMockReader([
          '@START(test222)hello@END(test222)'
        ])
      }));

      const result = await stream('Test prompt', {
        schema: { test222: String },
        llmStream: TestStream,
        debug: true
      }).last();
      
      expect(result).toEqual({ test222: 'hello' });
    });
  });
}); 