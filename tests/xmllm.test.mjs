import xmllm, { configure } from '../src/xmllm-main.mjs';
import { jest } from '@jest/globals';

const TestStream = (() => {
  const mockFn = jest.fn();
  mockFn
    .mockImplementationOnce(() => ({
      getReader: () => ({
        read: jest.fn()
          .mockResolvedValueOnce({ value: new TextEncoder().encode('<thinking>'), done: false })
          .mockResolvedValueOnce({ value: new TextEncoder().encode('<item><name>Test Result</name><value>42</value></item>'), done: false })
          .mockResolvedValueOnce({ done: true }),
        releaseLock: jest.fn()
      })
    }))
    .mockImplementationOnce(() => ({
      getReader: () => ({
        read: jest.fn()
          .mockResolvedValueOnce({ value: new TextEncoder().encode('<thinking><subtopic><perspective>Test Result</perspective><title>Test Result</title></subtopic></thinking>'), done: false })
          .mockResolvedValueOnce({ done: true }),
        releaseLock: jest.fn()
      })
    }))
    .mockImplementationOnce(() => ({
      getReader: () => ({
        read: jest.fn()
          .mockResolvedValueOnce({ value: new TextEncoder().encode('<thinking><explanation>Test Result</explanation></thinking>'), done: false })
          .mockResolvedValueOnce({ done: true }),
        releaseLock: jest.fn()
      })
    }))
    .mockImplementationOnce(() => ({
      getReader: () => ({
        read: jest.fn()
          .mockResolvedValueOnce({ value: new TextEncoder().encode('<user><name>Test Result</name><email>TEST RESULT</email></user>'), done: false })
          .mockResolvedValueOnce({ done: true }),
        releaseLock: jest.fn()
      })
    }))
    .mockImplementationOnce(() => ({
      getReader: () => ({
        read: jest.fn()
          .mockResolvedValueOnce({ value: new TextEncoder().encode('<product><price>42.99</price><quantity>5</quantity></product>'), done: false })
          .mockResolvedValueOnce({ done: true }),
        releaseLock: jest.fn()
      })
    }))
    .mockImplementationOnce(() => ({
      getReader: () => ({
        read: jest.fn()
          .mockResolvedValueOnce({ value: new TextEncoder().encode('<scores><score>10</score><score>20</score><score>30</score></scores>'), done: false })
          .mockResolvedValueOnce({ done: true }),
        releaseLock: jest.fn()
      })
    }))
    .mockImplementationOnce(() => ({
      getReader: () => ({
        read: jest.fn()
          .mockResolvedValueOnce({ value: new TextEncoder().encode('<user><name>Test User</name><stats><score>10</score><score>20</score><average>15.0</average></stats></user>'), done: false })
          .mockResolvedValueOnce({ done: true }),
        releaseLock: jest.fn()
      })
    }));
  return mockFn;
})();

const createTestXmllm = (pipeline, opts) => {
  return xmllm(pipeline, {
    ...(opts || {}),
    llmStream: TestStream
  })
}

describe('xmllm', () => {
  describe('Simple pipeline', () => {
    it('should process a single step pipeline', async () => {
      const results = createTestXmllm(({ select, parse }) => [
        parse('<root><item>Test</item></root>'),
        select('item')
      ]);
      
      expect((await results.next()).value).toBeNode({ 
        $$tagkey: 1, 
        $$attr: {}, 
        $$text: 'Test',
        $$tagclosed: true
      });
    });
  });

  describe('xmllm.prompt', () => {
    it('should process a prompt and apply selection schema', async () => {
      const results = await createTestXmllm(({ promptClosed }) => [
        function* () {
          yield '<item><name>Test</name><value>42</value></item>';
        },
        promptClosed(
          'List an item',
          {
            item: {
              name: String,
              value: Number
            }
          }
        ),
        function*(thing) {
          yield thing;
        }
      ]);

      const result = await results.last();
      expect(result).toEqual({
        item: {
          name: 'Test Result',
          value: 42
        }
      });
    });
  });

  describe('xmllm.mapSelect', () => {
    it('should select and map XML content', async () => {
      const results = await createTestXmllm(({ mapSelect, parse }) => [
        parse('<root><item><name>Item 1</name><value>10</value></item><item><name>Item 2</name><value>20</value></item></root>'),
        mapSelect({
          item: [{
            name: String,
            value: Number
          }]
        })
      ]);

      expect((await results.next()).value).toEqual({
        item: [
          { name: 'Item 1', value: 10 },
          { name: 'Item 2', value: 20 }
        ]
      });
    });
  });

  describe('Complex pipeline', () => {
    it('should process a multi-step pipeline', async () => {
      const stream = await createTestXmllm(({ prompt, filter }) => [
        function* () {
          yield "Artificial Intelligence";
        },
        prompt(
          topic => {
            return {
              messages: [{
                role: 'user',
                content: `Provide a subtopic for "${topic}" from a scientific perspective.`
              }],
              schema: {
                subtopic: [{
                perspective: String,
                  title: String
                }]
              }
            }
          }
        ),
        filter(thing => !!thing.subtopic),
        prompt(
          ({title, perspective}) => {
            return {
              messages: [{
                role: 'user',
                content: `Give a brief explanation of "${title}" from a ${perspective} perspective.`
              }],
              schema: {
                explanation: String
              },
              mapper: ({subtopic}, {explanation}) => {
                return {
                  subtopic,
                  explanation
                }
              } 
            }
          }
        )
      ]);

      const result = await stream.last();

      expect(result.subtopic).toBeDefined();
      expect(result.subtopic[0].perspective).toBe('Test Result');
      expect(result.subtopic[0].title).toBe('Test Result');
      expect(result.explanation).toBe('Test Result');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty input', async () => {
      const results = await createTestXmllm(({ select }) => [
        function* () {
          yield '';
        },
        select('item')
      ]);

      expect((await results.next()).value).toEqual(undefined);
    });

    it('should handle malformed XML', async () => {
      const results = await createTestXmllm(({ select, parse }) => [
        parse('<root><item>Test</item><unclosed>'),
        select('item')
      ]);

      expect((await results.next()).value).toBeNode({ 
        $$tagkey: 1, 
        $$tagclosed: true,
        $$attr: {}, 
        $$text: 'Test' 
      });
    });
  });

  describe('value() transformer', () => {
    it('should handle basic text transformation', async () => {
      const results = createTestXmllm(({ prompt, value }) => [
        prompt(
          'Give me a user record',
          {
            user: {
              name: value(),
              email: value(e => e.toLowerCase())
            }
          }
        )
      ]);

      const result = await results.last();
      expect(result.user.name).toBe('Test Result');
      expect(result.user.email).toBe('test result');
    });

    it('should handle numerical transformations safely', async () => {
      const results = createTestXmllm(({ prompt, value }) => [
        prompt(
          'Give me a product',
          {
            product: {
              price: value(p => {
                const n = parseFloat(p);
                return isNaN(n) ? null : n;
              }),
              quantity: value(q => {
                const n = parseInt(q);
                return isNaN(n) ? 0 : n;
              })
            }
          }
        )
      ]);

      const result = await results.last();
      expect(typeof result.product.price).toBe('number');
      expect(typeof result.product.quantity).toBe('number');
    });

    it('should handle arrays with value transformers', async () => {
      const results = createTestXmllm(({ prompt, value }) => [
        prompt(
          'List some scores',
          {
            'score': [value(s => {
              const n = parseInt(s);
              return isNaN(n) ? 0 : n;
            })]
          }
        )
      ]);

      const result = await results.last();
      expect(Array.isArray(result.score)).toBe(true);
      result.score.forEach(score => {
        expect(typeof score).toBe('number');
      });
    });

    it('should handle nested value transformers', async () => {
      const results = createTestXmllm(({ prompt, value }) => [
        prompt(
          'Give me user stats',
          {
            user: {
              name: value(),
              stats: {
                score: [value(s => {
                  const n = parseInt(s);
                  return isNaN(n) ? 0 : n;
                })],
                average: value(avg => {
                  const n = parseFloat(avg);
                  return isNaN(n) ? 0 : n;
                })
              }
            }
          }
        )
      ]);

      const result = await results.last();
      expect(typeof result.user.name).toBe('string');
      expect(Array.isArray(result.user.stats.score)).toBe(true);
      expect(typeof result.user.stats.average).toBe('number');
    });
  });

  test('should use global defaults in pipeline', async () => {
    configure({
      defaults: {
        temperature: 0.9,
        model: 'anthropic:fast'
      }
    });
  
    const TestStream = jest.fn().mockImplementation(() => ({
      getReader: () => ({
        read: jest.fn().mockResolvedValue({ done: true }),
        releaseLock: jest.fn()
      })
    }));
  
    const pipeline = xmllm(({ prompt }) => [
      prompt('Test prompt')  // No explicit config
    ], {
      llmStream: TestStream
    });
  
    await pipeline.last();
  
    expect(TestStream).toHaveBeenCalledWith(
      expect.objectContaining({
        temperature: 0.9,
        model: 'anthropic:fast'
      })
    );
  });

});