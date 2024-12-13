import { pipeline, xmllm, stream, simple } from '../src/xmllm-main.mjs';
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

describe('Pipeline API', () => {
  it('should expose pipeline as alias for xmllm', () => {
    // Verify pipeline is the same function as xmllm
    expect(pipeline).toBe(xmllm);
  });

  it('should work with pipeline syntax', async () => {
    const TestStream = jest.fn().mockImplementation(() => ({
      getReader: () => createMockReader([
        '<thinking><item>test</item></thinking>'
      ])
    }));

    const result = await pipeline(({ prompt }) => [
      prompt('Test prompt')
    ], {
      llmStream: TestStream
    }).last();

    // Verify the pipeline executed
    expect(TestStream).toHaveBeenCalled();
  });

  it('should expose all main exports', () => {
    // Verify all expected exports are available
    expect(pipeline).toBeDefined();
    expect(xmllm).toBeDefined();
    expect(stream).toBeDefined();
    expect(simple).toBeDefined();
  });
}); 