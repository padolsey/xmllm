import { jest } from '@jest/globals';
import { stream } from '../src/xmllm-main.mjs';

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

describe('Stream Interface Basics', () => {
  test('basic string yields from stream', async () => {
    const TestStream = jest.fn().mockImplementation(() => ({
      getReader: () => createMockReader([
        '<root><item>test</item></root>'
      ])
    }));

    const yields = [];
    const basicStream = stream('Basic prompt', {
      llmStream: TestStream
    });

    for await (const chunk of basicStream) {
      console.log('Stream yielded:', {
        type: typeof chunk,
        value: chunk,
        isObject: typeof chunk === 'object'
      });
      yields.push(chunk);
    }

    expect(yields.every(y => typeof y === 'string')).toBe(true);
  });

  test('stream with schema should yield objects', async () => {
    const TestStream = jest.fn().mockImplementation(() => ({
      getReader: () => createMockReader([
        '<root><item>test</item></root>'
      ])
    }));

    const yields = [];
    const schemaStream = stream('Schema prompt', {
      llmStream: TestStream,
      schema: {
        item: String
      }
    });

    for await (const chunk of schemaStream) {
      console.log('Schema stream yielded:', {
        type: typeof chunk,
        value: chunk,
        keys: chunk ? Object.keys(chunk) : null
      });
      yields.push(chunk);
    }

    expect(yields.every(y => typeof y === 'object')).toBe(true);
  });

  test('stream with select should yield Node objects', async () => {
    const TestStream = jest.fn().mockImplementation(() => ({
      getReader: () => createMockReader([
        '<root><item>first</item><item>second</item></root>'
      ])
    }));

    const yields = [];
    const selectStream = stream('Select test', {
      llmStream: TestStream
    })
    .select('item');

    for await (const chunk of selectStream) {
      console.log('Select stream yielded:', {
        type: typeof chunk,
        value: chunk,
        isNode: chunk?.__isNodeObj__,
        text: chunk?.$$text
      });
      yields.push(chunk);
    }

    expect(yields.every(y => y?.__isNodeObj__)).toBe(true);
  });

  test('stream text() should only yield strings', async () => {
    const TestStream = jest.fn().mockImplementation(() => ({
      getReader: () => createMockReader([
        '<root><item>first</item><item>second</item></root>'
      ])
    }));

    const yields = [];
    const textStream = stream('Text test', {
      llmStream: TestStream
    })
    .select('item')
    .text();

    for await (const chunk of textStream) {
      console.log('Text stream yielded:', {
        type: typeof chunk,
        value: chunk
      });
      yields.push(chunk);
    }

    expect(yields.every(y => typeof y === 'string')).toBe(true);
    expect(yields).toEqual(['first', 'second']);
  });

  test('stream with nested elements and text()', async () => {
    const TestStream = jest.fn().mockImplementation(() => ({
      getReader: () => createMockReader([
        '<root><book><title>Test Book</title><author>Test Author</author></book></root>'
      ])
    }));

    const yields = [];
    const nestedStream = stream('Nested test', {
      llmStream: TestStream
    })
    .select('book')
    .text();

    for await (const chunk of nestedStream) {
      console.log('Nested text stream yielded:', {
        type: typeof chunk,
        value: chunk
      });
      yields.push(chunk);
    }

    expect(yields.every(y => !y.includes('[object Object]'))).toBe(true);
  });
}); 