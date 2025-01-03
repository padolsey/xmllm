import _xmllm from '../src/xmllm-main.mjs';
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

const createTestStream = (responses) => {
  let requestCount = 0;
  return jest.fn().mockImplementation(() => {
    const response = responses[requestCount++] || responses[responses.length - 1];
    console.log('TestStream creating response:', { requestCount, response });
    return Promise.resolve({
      getReader: () => createMockReader(Array.isArray(response) ? response : [response])
    });
  });
};

const xmllm = (pipeline, opts = {}) => {
  return _xmllm(pipeline, {
    ...opts,
    llmStream: opts.llmStream
  });
};

describe('Parser Isolation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not double-process XML when selecting nodes', async () => {
    const responses = [
      '<user><name>Alice</name></user>',
      '<post><title>Hello</title></post>'
    ];
    let requestCount = 0;

    let aliceCount = 0;
    let helloCount = 0;

    const pipeline = xmllm(({req, select}) => [
      req("First request"),
      select('name'),
      async function*(x) {
        if (x?.$$text === 'Alice') {
          aliceCount++;
          console.log('Found Alice node:', aliceCount, 'times');
          yield x;
        }
      },
      req("Second request"),
      select('title'),
      async function*(x) {
        if (x?.$$text === 'Hello') {
          helloCount++;
          console.log('Found Hello node:', helloCount, 'times');
          yield x;
        }
      }
    ], {
      llmStream: async () => ({
        getReader: () => createMockReader([responses[requestCount++]])
      })
    });

    for await (const item of pipeline) {}
    
    expect(aliceCount).toBe(1);
    expect(helloCount).toBe(1);
  });
}); 