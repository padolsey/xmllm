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
          openTagPrefix: '@',
          closeTagPrefix: '@',
          tagOpener: 'START(',
          tagCloser: 'END(',
          tagSuffix: ')'
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
            openTagPrefix: '',
            closeTagPrefix: '@',
            tagOpener: 'START(',
            tagCloser: 'END(',
            tagSuffix: ')'
          }
        });
      }).toThrow(/openTagPrefix must be a non-empty string/);

      expect(() => {
        configure({
          idioSymbols: {
            openTagPrefix: '@',
            closeTagPrefix: '',
            tagOpener: 'START(',
            tagCloser: 'END(',
            tagSuffix: ')'
          }
        });
      }).toThrow(/closeTagPrefix must be a non-empty string/);
    });

    it('should allow longer boundary forms (chaos but intentional snapshot)', async () => {
      configure({
        globalParser: 'idio',
        idioSymbols: {
          openTagPrefix: ['@', '!', '-'],
          closeTagPrefix: ['@', '!', '-'],
          tagOpener: [
            'START[',
            'BEGIN[',
            'START<',
            'BEGIN<',
            'START(',
            'BEGIN(',
            '%%(',
            '%%[',
            '%%<'
          ],
          tagCloser: [
            'END[',
            'END<',
            'END(',
            'CLOSE[',
            'CLOSE<',
            'CLOSE(',
            'x%[',
            'x%(',
            'x%<',
          ],
          tagSuffix: [
            '>', ')', ']'
          ]
        }
      });

      const TestStream = jest.fn().mockImplementation(() => ({
        getReader: () => createMockReader([
          `

              @START(world)green@END(world)

              -BEGIN(person) here !CLOSE(person)

              -%%(car)...ford...!x%(car)

              @START(greeting)hi there@END(greeting)
          `
        ])
      }));

      const result = await stream('Test prompt', {
        schema: {
          root: String,
          world: String ,
          person: String,
          car: String,
          greeting: String
        },
        llmStream: TestStream
      }).last();
      
      expect(result).toEqual({
        world: 'green',
        person: ' here ',
        car: '...ford...',
        greeting: 'hi there'
      });

    });

    it('should allow empty tagOpener and tagCloser', async () => {
      configure({
        idioSymbols: {
          openTagPrefix: '<',
          closeTagPrefix: '</',
          tagOpener: '',
          tagCloser: '',
          tagSuffix: '>'
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
            openTagPrefix: '@',
            tagOpener: '',
            tagCloser: '',
            closeTagPrefix: '@',
            tagSuffix: 546456
          }
        });
      }).toThrow(/tagSuffix must be a non-empty string/);
    });

    it('should allow partial updates to idio symbols', async () => {

      console.log('current config 1', getConfig());

      configure({
        globalParser: 'idio',
        idioSymbols: {
          openTagPrefix: ['@'], // just checking array-form works
          closeTagPrefix: '@'  // single string (will be normalized into array)
        }
      });

      console.log('current config 2', getConfig());

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

    test('should throw error when configuration lacks tag disambiguation', () => {
      expect(() => {
        configure({
          idioSymbols: {
            openTagPrefix: '@',
            closeTagPrefix: '@',
            tagOpener: 'START(',  // Same as default
            tagCloser: 'START(',  // Making this same as tagOpener
            tagSuffix: ')'
          }
        });
      }).toThrow('Configuration must provide way to distinguish opening from closing tags');

      // Should work when either prefixes or openers are different
      expect(() => {
        configure({
          idioSymbols: {
            openTagPrefix: '@',
            closeTagPrefix: '@',
            tagOpener: 'START(',
            tagCloser: 'END(',    // Different from tagOpener
            tagSuffix: ')'
          }
        });
      }).not.toThrow();

      expect(() => {
        configure({
          idioSymbols: {
            openTagPrefix: '@',  
            closeTagPrefix: '#', // Different from openTagPrefix
            tagOpener: 'START(',
            tagCloser: 'START(',  // Same as tagOpener
            tagSuffix: ')'
          }
        });
      }).not.toThrow();
    });
  });
}); 