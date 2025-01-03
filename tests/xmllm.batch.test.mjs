import xmllm from '../src/xmllm.mjs';
import { jest } from '@jest/globals';

describe('xmllm - batch operator', () => {
  // Helper to create a mock stream that properly returns chunks
  const createMockStream = (responses) => {
    return jest.fn().mockImplementation(() => {
      const chunks = Array.isArray(responses) ? responses : [responses];
      return {
        getReader: () => ({
          read: jest.fn()
            .mockImplementationOnce(() => Promise.resolve({
              value: new TextEncoder().encode(chunks.join('')),
              done: false
            }))
            .mockImplementationOnce(() => Promise.resolve({ done: true })),
          releaseLock: jest.fn()
        })
      };
    });
  };

  it('should batch simple values correctly', async () => {
    const stream = xmllm(({ batch }) => [
      function*() {
        for (let i = 1; i <= 5; i++) {
          yield i;
        }
      },
      batch(2, { yieldIncomplete: true }) // Enable yieldIncomplete for last batch
    ]);

    const results = await stream.all();
    expect(results).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('should batch XML elements with schema mapping', async () => {
    const mockStream = createMockStream([]);

    const stream = xmllm(({ batch, mapSelect, parse }) => [
      parse([
        '<root>',
        '<item><value>1</value></item>',
        '<item><value>2</value></item>',
        '<item><value>3</value></item>',
        '</root>'
      ].join('')),
      mapSelect({
        item: [{
          value: Number
        }]
      }),
      function*(v) {
        yield*v.item;
      },
      batch(2, { yieldIncomplete: true })
    ], { llmStream: mockStream });

    const results = [];
    for await (const item of stream) {
      console.log('stream item', item);
      results.push(item);
    }

    // const results = await stream.all();
    console.log('>>>results', results);
    expect(results.length).toBe(2);
    expect(results).toEqual([
      [
        { value: 1 },
        { value: 2 }
      ],
      [
        { value: 3 }
      ]
    ]);
  });

  it('should handle empty batches', async () => {
    const stream = xmllm(({ batch }) => [
      function*() {
        // Yield nothing
      },
      batch(2)
    ]);

    const results = await stream.all();
    expect(results).toEqual([]);
  });

  it('should respect batch size with streaming XML', async () => {
    const mockStream = createMockStream([]);

    const stream = xmllm(({ batch, select, parse }) => [
      parse([
        '<thinking>',
        '<result>First</result>',
        '<result>Second</result>',
        '<result>Third</result>',
        '<result>Fourth</result>',
        '</thinking>'
      ].join('')),
      select('result'),
      batch(2, { yieldIncomplete: true })
    ], { llmStream: mockStream });

    const results = await stream.all();

    console.log('results', results);
    
    // Each batch should contain the raw XML nodes
    expect(results.length).toBe(2);
    expect(results[0].length).toBe(2); // First batch has 2 items
    expect(results[1].length).toBe(2); // Second batch has 2 items
    
    // Verify the content of nodes
    expect(results[0][0].$$text).toBe('First');
    expect(results[0][1].$$text).toBe('Second');
    expect(results[1][0].$$text).toBe('Third');
    expect(results[1][1].$$text).toBe('Fourth');
  });

  it('should work with async generators', async () => {
    const stream = xmllm(({ batch }) => [
      async function*() {
        for (let i = 1; i <= 5; i++) {
          await new Promise(resolve => setTimeout(resolve, 10));
          yield i;
        }
      },
      batch(2, { yieldIncomplete: true })
    ]);

    const results = await stream.all();
    expect(results).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('should handle complex XML transformations in batches', async () => {
    const mockStream = createMockStream([]);

    const stream = xmllm(({ batch, mapSelect, parse }) => [
      parse(
        '<data>' +
        '<user><name>Alice</name><score>10</score></user>' +
        '<user><name>Bob</name><score>20</score></user>' +
        '<user><name>Charlie</name><score>30</score></user>' +
        '</data>'
      ),
      mapSelect({
        user: [{
          name: String,
          score: Number
        }]
      }),
      function*(v) {
        yield*v.user;
      },
      batch(2, { yieldIncomplete: true })
    ], { llmStream: mockStream });

    const results = [];

    for await (const item of stream) {
      results.push(item);
    }
    
    expect(results).toEqual([
      [
        { name: 'Alice', score: 10 },
        { name: 'Bob', score: 20 }
      ],
      [
        { name: 'Charlie', score: 30 }
      ]
    ]);
  });

  it('should maintain XML structure integrity across batches', async () => {
    const mockStream = createMockStream([]);

    const stream = xmllm(({ batch, mapSelect, parse }) => [
      parse(
        '<root>' +
        '<group><item>A1</item><item>A2</item></group>' +
        '<group><item>B1</item><item>B2</item></group>' +
        '</root>'
      ),
      mapSelect({
        group: [{
          item: [String]
        }]
      }),
      function*(v) {
        yield*v.group;
      },
      batch(1, { yieldIncomplete: true })
    ], { llmStream: mockStream });

    const results = await stream.all();
    
    expect(results).toEqual([
      [
        { item: ['A1', 'A2'] }
      ],
      [
        { item: ['B1', 'B2'] }
      ]
    ]);
  });

}); 