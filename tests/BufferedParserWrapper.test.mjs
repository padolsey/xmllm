import { jest } from '@jest/globals';
import BufferedParserWrapper from '../src/parsers/BufferedParserWrapper.mjs';
import IncomingXMLParserSelectorEngine from '../src/parsers/IncomingXMLParserSelectorEngine.mjs';

describe('BufferedParserWrapper', () => {
  let mockParser;
  let bufferedParserWrapper;
  
  beforeEach(() => {
    jest.useFakeTimers();
    mockParser = new IncomingXMLParserSelectorEngine();
    jest.spyOn(mockParser, 'add');
    
    bufferedParserWrapper = new BufferedParserWrapper(mockParser, {
      buffer: {
        timeout: 50,
        maxSize: 100
      }
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Buffering Behavior', () => {
    it('should buffer content until timeout', () => {
      // Add multiple small chunks
      bufferedParserWrapper.add('<root>');
      bufferedParserWrapper.add('<item>1</item>');
      bufferedParserWrapper.add('<item>2</item>');
      
      // Nothing should be parsed yet
      expect(mockParser.add).not.toHaveBeenCalled();

      // Advance timers
      jest.advanceTimersByTime(50);

      // Should have flushed as one chunk
      expect(mockParser.add).toHaveBeenCalledTimes(1);
      expect(mockParser.add).toHaveBeenCalledWith(
        '<root><item>1</item><item>2</item>'
      );
    });

    it('should flush immediately when buffer size exceeded', () => {
      const largeChunk = 'x'.repeat(101); // Exceeds maxBufferSize
      
      bufferedParserWrapper.add(largeChunk);
      
      // Should flush immediately
      expect(mockParser.add).toHaveBeenCalledTimes(1);
      expect(mockParser.add).toHaveBeenCalledWith(largeChunk);
    });

    it('should reset timeout when new content arrives', () => {
      bufferedParserWrapper.add('<root>');
      
      // Advance part way
      jest.advanceTimersByTime(25);
      
      bufferedParserWrapper.add('<item>1</item>');
      
      // Advance past original timeout
      jest.advanceTimersByTime(25);
      
      // Should not have flushed yet
      expect(mockParser.add).not.toHaveBeenCalled();
      
      // Advance to new timeout
      jest.advanceTimersByTime(25);
      
      // Now should have flushed
      expect(mockParser.add).toHaveBeenCalledWith(
        '<root><item>1</item>'
      );
    });
  });

  describe('Integration Tests', () => {
    it('should correctly parse buffered XML', () => {
      // Add chunks that split XML elements
      bufferedParserWrapper.add('<root><item>First');
      bufferedParserWrapper.add(' item</item><item>');
      bufferedParserWrapper.add('Second item</item></root>');

      // Advance timers to flush
      jest.advanceTimersByTime(50);

      // Check parsed result
      const items = bufferedParserWrapper.select('item');
      expect(items).toHaveLength(2);
      expect(items[0].$$text).toBe('First item');
      expect(items[1].$$text).toBe('Second item');
    });

    it('should handle rapid small updates', () => {
      // Simulate rapid typing/updates
      const chars = '<root><item>Hello</item></root>'.split('');
      
      chars.forEach(char => {
        bufferedParserWrapper.add(char);
        jest.advanceTimersByTime(5); // 5ms between chars
      });

      // Advance remaining time
      jest.advanceTimersByTime(50);

      // Should have combined all updates
      expect(mockParser.add).toHaveBeenCalledTimes(1);
      
      // Check parsed result
      const items = bufferedParserWrapper.select('item');
      expect(items[0].$$text).toBe('Hello');
    });
  });

  describe('Method Delegation', () => {
    it('should delegate all parser methods', () => {
      const testSchema = { test: { value: String } };
      const testSelector = 'test > value';

      const methods = [
        ['select', [testSelector]],
        ['dedupeSelect', [testSelector]],
        ['mapSelect', [testSchema]],
        ['mapSelectClosed', [testSchema]],
        ['formatElement', [{ type: 'tag', name: 'test' }]],
        ['formatResults', [[{ type: 'tag', name: 'test' }]]],
        ['getTextContent', [{ type: 'tag', name: 'test' }]]
      ];

      methods.forEach(([method, args]) => {
        jest.spyOn(mockParser, method);
        bufferedParserWrapper[method](...args);
        expect(mockParser[method]).toHaveBeenCalledWith(...args);
      });
    });
  });

  describe('Buffer Configuration', () => {
    it('should use defaults when buffer is true', () => {
      const parser = new IncomingXMLParserSelectorEngine();
      jest.spyOn(parser, 'add');
      
      const wrapper = new BufferedParserWrapper(parser, {
        buffer: true
      });

      // Add content under default maxSize (1024)
      wrapper.add('x'.repeat(512));
      expect(parser.add).not.toHaveBeenCalled();

      // Add more to exceed default maxSize
      wrapper.add('x'.repeat(513));
      expect(parser.add).toHaveBeenCalled();

      // Test default timeout
      const anotherWrapper = new BufferedParserWrapper(parser, {
        buffer: true
      });
      anotherWrapper.add('<test>');
      
      jest.advanceTimersByTime(9);
      expect(parser.add).not.toHaveBeenCalledWith('<test>');
      
      jest.advanceTimersByTime(1);
      expect(parser.add).toHaveBeenCalledWith('<test>');
    });

    it('should disable buffering when buffer is false', () => {
      const parser = new IncomingXMLParserSelectorEngine();
      jest.spyOn(parser, 'add');
      
      const wrapper = new BufferedParserWrapper(parser, {
        buffer: false
      });

      wrapper.add('<test>');
      // Should pass through immediately
      expect(parser.add).toHaveBeenCalledWith('<test>');
    });

    it('should respect buffer: false', () => {
      const noBufferWrapper = new BufferedParserWrapper(mockParser, {
        buffer: false
      });

      noBufferWrapper.add('<root>');
      // Should flush immediately
      expect(mockParser.add).toHaveBeenCalledTimes(1);
      expect(mockParser.add).toHaveBeenCalledWith('<root>');
    });

    it('should use defaults with buffer: true', () => {
      const defaultBufferWrapper = new BufferedParserWrapper(mockParser, {
        buffer: true
      });

      defaultBufferWrapper.add('<root>');
      expect(mockParser.add).not.toHaveBeenCalled();

      jest.advanceTimersByTime(10); // Default timeout
      expect(mockParser.add).toHaveBeenCalledWith('<root>');
    });

    it('should handle partial buffer config', () => {
      const partialBufferWrapper = new BufferedParserWrapper(mockParser, {
        buffer: {
          timeout: 25 // Only specify timeout
        }
      });

      partialBufferWrapper.add('<root>');
      jest.advanceTimersByTime(24);
      expect(mockParser.add).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(1);
      expect(mockParser.add).toHaveBeenCalledWith('<root>');
    });
  });
}); 