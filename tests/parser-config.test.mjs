import { xmllm, stream, simple, configure, resetConfig } from '../src/xmllm-main.mjs';
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
        '⁂START(test)hello⁂END(test)'
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
    it('should allow configuring custom idio symbol', async () => {
      configure({
        globalParser: 'idio',
        idioSymbol: '@'
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

    it('should throw error for invalid idio symbol', () => {
      expect(() => {
        configure({
          idioSymbol: ''  // Empty string
        });
      }).toThrow(/idioSymbol must be a non-empty string/);

      expect(() => {
        configure({
          idioSymbol: null
        });
      }).toThrow(/idioSymbol must be a non-empty string/);
    });
  });
}); 