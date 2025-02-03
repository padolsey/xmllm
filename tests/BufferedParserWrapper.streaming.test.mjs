import { jest } from '@jest/globals';

import BufferedParserWrapper from '../src/parsers/BufferedParserWrapper.mjs';
import IncomingXMLParserSelectorEngine from '../src/parsers/IncomingXMLParserSelectorEngine.mjs';

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

describe('BufferedParserWrapper Streaming Tests', () => {
  let parser;
  
  beforeEach(() => {
    parser = new IncomingXMLParserSelectorEngine();
  });
  
  describe('Real-time buffering behavior', () => {
    it('should buffer and parse fragmented XML correctly', async () => {
      const parserCalls = [];
      
      // Track exact times parser.add is called
      const originalAdd = parser.add;
      parser.add = function(chunk) {
        parserCalls.push({ time: Date.now(), chunk });
        return originalAdd.call(this, chunk);
      };

      const bufferedParser = new BufferedParserWrapper(parser, {
        buffer: {
          timeout: 5,
          maxSize: 50
        }
      });

      const startTime = Date.now();

      // Simulate fragmented XML
      const reader = createMockReader([
        '<root><it',
        'em>First</i',
        'tem><item>Sec',
        'ond</item></root>'
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = new TextDecoder().decode(value);
        bufferedParser.add(chunk);
        await new Promise(resolve => setTimeout(resolve, 2));
      }

      await new Promise(resolve => setTimeout(resolve, 10));

      // Verify buffering worked by checking parser call times
      expect(parserCalls.length).toBeLessThan(4); // Should have combined some chunks
      
      // Verify timing of calls
      parserCalls.forEach(call => {
        const timeSinceStart = call.time - startTime;
        expect(timeSinceStart).toBeGreaterThanOrEqual(5); // Should respect buffer time
      });

      // Verify final result still correct
      const items = bufferedParser.select('item');
      expect(items).toHaveLength(2);
      expect(items[0].$$text).toBe('First');
      expect(items[1].$$text).toBe('Second');
    });

    it('should handle empty and invalid chunks correctly', async () => {
      const parserCalls = [];
      
      const originalAdd = parser.add;
      parser.add = function(chunk) {
        parserCalls.push(chunk);
        return originalAdd.call(this, chunk);
      };

      const bufferedParser = new BufferedParserWrapper(parser, {
        buffer: {
          timeout: 5,
          maxSize: 50
        }
      });

      // Add various problematic inputs
      bufferedParser.add('');
      bufferedParser.add(null);
      bufferedParser.add(undefined);
      bufferedParser.add('<root>');
      
      await new Promise(resolve => setTimeout(resolve, 10));

      // Should only get non-empty content
      expect(parserCalls).toEqual(['<root>']);
    });

    it('should maintain buffer state correctly across flushes', async () => {
      const parserCalls = [];
      
      const originalAdd = parser.add;
      parser.add = function(chunk) {
        parserCalls.push(chunk);
        return originalAdd.call(this, chunk);
      };

      const bufferedParser = new BufferedParserWrapper(parser, {
        buffer: {
          timeout: 5,
          maxSize: 20
        }
      });

      // Add content in chunks
      bufferedParser.add('<root><item>Long content</item>');
      await new Promise(resolve => setTimeout(resolve, 2));
      
      bufferedParser.add('<item>Short</item>');
      await new Promise(resolve => setTimeout(resolve, 2));
      
      bufferedParser.add('<item>More content</item></root>');
      
      // Wait for final flush
      await new Promise(resolve => setTimeout(resolve, 10));

      // Verify we got at least 2 flushes
      expect(parserCalls.length).toBeGreaterThanOrEqual(2);
      
      // Verify final parse result
      const items = bufferedParser.select('item');
      expect(items).toHaveLength(3);
    });

    it('should flush immediately when buffer size exceeded', async () => {
      const bufferedParser = new BufferedParserWrapper(parser, {
        buffer: {
          timeout: 50,
          maxSize: 20
        }
      });

      const results = [];
      const originalAdd = parser.add;
      parser.add = function(chunk) {
        results.push(chunk);
        return originalAdd.call(this, chunk);
      };

      const reader = createMockReader([
        '<root><item>This is a long item that will exceed buffer size</item>',
        '<item>Another long item that should trigger immediate flush</item></root>'
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = new TextDecoder().decode(value);
        bufferedParser.add(chunk);
        
        await new Promise(resolve => setTimeout(resolve, 2));
      }

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(results.length).toBeGreaterThan(1);
      
      const items = bufferedParser.select('item');
      expect(items).toHaveLength(2);
      expect(items[0].$$text).toBe('This is a long item that will exceed buffer size');
      expect(items[1].$$text).toBe('Another long item that should trigger immediate flush');
    });

    it('should handle rapid small updates efficiently', async () => {
      const bufferedParser = new BufferedParserWrapper(parser, {
        buffer: {
          timeout: 10,
          maxSize: 100
        }
      });

      const flushes = [];
      const originalAdd = parser.add;
      parser.add = function(chunk) {
        flushes.push(chunk);
        return originalAdd.call(this, chunk);
      };

      // Simulate rapid typing/updates
      const chunks = [
        '<r', 'oo', 't>', 
        '<i', 'tem', '>', 
        'He', 'll', 'o',
        '</i', 'tem>', 
        '</r', 'oo', 't>'
      ];

      for (const chunk of chunks) {
        bufferedParser.add(chunk);
        // Very small delay between chunks
        await new Promise(resolve => setTimeout(resolve, 1));
      }

      // Wait for final flush
      await new Promise(resolve => setTimeout(resolve, 15));

      // Should have combined multiple updates into fewer flushes
      expect(flushes.length).toBeLessThan(chunks.length);

      // Verify correct final result
      const items = bufferedParser.select('item');
      expect(items).toHaveLength(1);
      expect(items[0].$$text).toBe('Hello');
    });
  });

  // Move error test to separate describe block
  describe('Error handling', () => {
    let originalAdd;
    
    beforeEach(() => {
      parser = new IncomingXMLParserSelectorEngine();
      originalAdd = parser.add;
    });

    afterEach(() => {
      // Restore original parser.add
      parser.add = originalAdd;
    });

    it('should handle errors gracefully', async () => {
      const bufferedParser = new BufferedParserWrapper(parser, {
        buffer: {
          timeout: 5,
          maxSize: 50
        }
      });

      const parserCalls = [];

      // Setup error throwing mock
      parser.add = jest.fn().mockImplementation((chunk) => {
        if (chunk.includes('error')) {
          throw new Error('Parser error');
        }
        parserCalls.push(chunk);
      });

      // Add error content and expect flush to throw
      bufferedParser.add('<error>');
      expect(() => bufferedParser.flush()).toThrow('Parser error');

      // Next add should work since buffer was cleared
      bufferedParser.add('<item>New content</item>');
      bufferedParser.flush();

      expect(parserCalls).toEqual(['<item>New content</item>']);
    });
  });
}); 