import { jest } from '@jest/globals';
import xmllm from '../src/xmllm.mjs';
import BufferedParserWrapper from '../src/parsers/BufferedParserWrapper.mjs';

describe('xmllm Streaming Tests', () => {
  let mockStream;
  let mockReader;
  
  beforeEach(() => {
  });

  afterEach(() => {
  });

  const createMockStream = (chunks) => {
    let index = 0;
    mockReader = {
      read: jest.fn(async () => {
        if (index >= chunks.length) {
          return { done: true };
        }
        return {
          value: new TextEncoder().encode(chunks[index++]),
          done: false
        };
      }),
      releaseLock: jest.fn()
    };
    
    mockStream = {
      getReader: () => mockReader
    };
  };

  it('should handle buffered streaming correctly', async () => {
    // Setup stream that sends XML in chunks
    createMockStream([
      '<root><item>',
      'First',
      ' item</item><item>',
      'Second',
      ' item</item></root>'
    ]);

    const results = [];
    
    // Create pipeline that uses buffered parser
    const pipeline = xmllm(({ prompt }) => [
      prompt({
        messages: [{ role: 'user', content: 'test' }],
        buffer: {
          timeout: 5,
          maxSize: 50
        }
      }),
      function*(chunk) {
        if (chunk) {  // Only push non-empty chunks
          results.push(chunk);
        }
        yield chunk;
      }
    ], {
      llmStream: () => Promise.resolve(mockStream)
    });

    // Collect all chunks
    for await (const chunk of pipeline) {
      // Each chunk here represents a flush from the buffer
      console.log('Got chunk:', chunk);
    }

    // Should have combined chunks appropriately
    expect(results).toEqual([
      '<root><item>First item</item><item>Second item</item></root>'
    ]);
  });

  it('should handle unbuffered streaming correctly', async () => {
    createMockStream([
      '<root><item>',
      'First',
      ' item</item><item>',
      'Second',
      ' item</item></root>'
    ]);

    const results = [];
    
    const pipeline = xmllm(({ prompt }) => [
      prompt({
        messages: [{ role: 'user', content: 'test' }],
        buffer: false // Disable buffering
      }),
      function*(chunk) {
        if (chunk) {  // Only push non-empty chunks
          results.push(chunk);
        }
        yield chunk;
      }
    ], {
      llmStream: () => Promise.resolve(mockStream)
    });

    for await (const chunk of pipeline) {
      console.log('Got chunk:', chunk);
    }

    // Should see every chunk immediately
    expect(results).toEqual([
      '<root><item>',
      'First',
      ' item</item><item>',
      'Second',
      ' item</item></root>'
    ]);
  });

  it('should flush buffer after timeout', async () => {
    createMockStream([
      '<root>',
      '<item>First</item>'
    ]);
  
    const results = [];
  
    const pipeline = xmllm(({ prompt }) => [
      prompt({
        messages: [{ role: 'user', content: 'test' }],
        buffer: {
          timeout: 1,
          maxSize: 1024
        }
      }),
      function*(chunk) {
        if (chunk) results.push(chunk);
        yield chunk;
      }
    ], {
      llmStream: () => Promise.resolve(mockStream)
    });
  
    for await (const chunk of pipeline) {
      console.log('Got chunk:', chunk);
    }
  
    // Small delay to ensure buffer has flushed
    await new Promise(resolve => setTimeout(resolve, 5));
  
    expect(results).toEqual([
      '<root><item>First</item>'
    ]);
  });

  it('should flush remaining content when stream ends', async () => {
    createMockStream([
      '<root>',
      '<item>Content</item>',
      '</root>'
    ]);
  
    const results = [];
  
    const pipeline = xmllm(({ prompt }) => [
      prompt({
        messages: [{ role: 'user', content: 'test' }],
        buffer: {
          timeout: 1, // Short timeout for faster tests
          maxSize: 1024
        }
      }),
      function*(chunk) {
        if (chunk) results.push(chunk);
        yield chunk;
      }
    ], {
      llmStream: () => Promise.resolve(mockStream)
    });
  
    for await (const chunk of pipeline) {
      console.log('Got chunk:', chunk);
    }

    // Small delay to ensure buffer has flushed
    await new Promise(resolve => setTimeout(resolve, 5));
  
    // Check that the results contain the flushed content
    expect(results).toEqual([
      '<root><item>Content</item></root>'
    ]);
  });
}); 