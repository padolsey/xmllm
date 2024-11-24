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

describe('Stream Chaining Convenience API', () => {
  describe('A: stream()', () => {
    it('should handle basic prompt and selection', async () => {
      const TestStream = jest.fn().mockImplementation(() => ({
        getReader: () => createMockReader([
          '<thinking><score>8</score></thinking>'
        ])
      }));

      const result = await stream('Rate this poem', {
        llmStream: TestStream
      })
        .select('score')
        .map(({$text}) => parseInt($text))
        .value();
      
      expect(result).toBe(8);
    });

    it('should handle complex selections with attributes', async () => {
      const TestStream = jest.fn().mockImplementation(() => ({
        getReader: () => createMockReader([
          '<thinking><analysis><score rating="good">9</score><comments><comment>Excellent</comment><comment>Outstanding</comment></comments></analysis></thinking>'
        ])
      }));

      const result = await stream('Analyze this text', {
        llmStream: TestStream
      })
        .select('analysis')
        .map(analysis => ({
          score: parseInt(analysis.score[0].$text),
          rating: analysis.score[0].$attr.rating,
          comments: analysis.comments[0].comment.map(c => c.$text)
        }))
        .value();

      expect(result).toEqual({
        score: 9,
        rating: 'good',
        comments: ['Excellent', 'Outstanding']
      });
    });
  });

  describe('stream()', () => {
    it('should stream multiple results', async () => {
      const TestStream = jest.fn().mockImplementation(() => ({
        getReader: () => createMockReader([
          '<thinking><thought>First thought</thought>',
          '<thought>Second thought</thought></thinking>'
        ])
      }));

      const results = [];
      const thoughtStream = stream('Give me some thoughts I.e. <thought>...</thought> etc', {
        llmStream: TestStream
      })
        .select('thought')
        .text();

      for await (const thought of thoughtStream) {
        results.push(thought);
      }

      expect(results).toEqual([
        'First thought',
        'Second thought'
      ]);
    });

    it('should allow chaining transformations', async () => {
      const TestStream = jest.fn().mockImplementation(() => ({
        getReader: () => createMockReader([
          '<thinking><thought>First thought</thought>',
          '<thought>Second thought</thought></thinking>'
        ])
      }));

      const results = [];
      const thoughtStream = stream('Give me some thoughts', {
        llmStream: TestStream
      })
        .select('thought')
        .map(({$text}) => $text.toUpperCase());

      for await (const thought of thoughtStream) {
        results.push(thought);
      }

      expect(results).toEqual([
        'FIRST THOUGHT',
        'SECOND THOUGHT'
      ]);
    });

    it('should properly stream transformed results', async () => {
      const TestStream = jest.fn().mockImplementation(() => ({
        getReader: () => createMockReader([
          '<thinking><thought>First thought</thought>',
          '<thought>Second thought</thought></thinking>'
        ])
      }));

      const results = [];
      const thoughtStream = stream('Give me some thoughts', {
        llmStream: TestStream
      })
        .select('thought')
        .text();

      for await (const thought of thoughtStream) {
        results.push(thought.toUpperCase());
      }

      expect(results).toEqual([
        'FIRST THOUGHT',
        'SECOND THOUGHT'
      ]);
    });

    it('should clean up resources when stream is interrupted', async () => {
      const mockStream = {
        getReader: () => ({
          read: () => Promise.resolve({ done: true }),
          releaseLock: jest.fn()
        })
      };

      const TestStream = jest.fn().mockReturnValue(mockStream);

      const streamInstance = stream('Rate this poem', {
        llmStream: TestStream
      });

      for await (const _ of streamInstance) {
        break; // Exit early, triggering cleanup
      }
      
      // The stream should have been cleaned up
      expect(TestStream).toHaveBeenCalled();
    });

    describe('stream() pagination', () => {
      it('should limit results with take()', async () => {
        const TestStream = jest.fn().mockImplementation(() => ({
          getReader: () => createMockReader([
            '<thinking><thought>First</thought><thought>Second</thought><thought>Third</thought></thinking>'
          ])
        }));

        const results = [];
        const thoughtStream = stream('Give me thoughts', {
          llmStream: TestStream
        })
          .select('thought')
          .text()
          .take(2);  // Only take first 2 thoughts

        for await (const thought of thoughtStream) {
          results.push(thought);
        }

        expect(results).toEqual(['First', 'Second']);
      });

      it('should skip initial results', async () => {
        const TestStream = jest.fn().mockImplementation(() => ({
          getReader: () => createMockReader([
            '<thinking><thought>First</thought><thought>Second</thought><thought>Third</thought></thinking>'
          ])
        }));

        const results = [];
        const thoughtStream = stream('Give me thoughts', {
          llmStream: TestStream
        })
          .select('thought')
          .text()
          .skip(1);  // Skip first thought

        for await (const thought of thoughtStream) {
          results.push(thought);
        }

        expect(results).toEqual(['Second', 'Third']);
      });

      it('should combine skip and take', async () => {
        const TestStream = jest.fn().mockImplementation(() => ({
          getReader: () => createMockReader([
            '<thinking><thought>First</thought><thought>Second</thought><thought>Third</thought><thought>Fourth</thought></thinking>'
          ])
        }));

        const results = [];
        const thoughtStream = stream('Give me thoughts', {
          llmStream: TestStream
        })
        .select('thought')
        .skip(1)    // Skip first
        .take(2)    // Take two
        .text();    // Transform to text last

        for await (const thought of thoughtStream) {
          results.push(thought);
        }

        expect(results).toEqual(['Second', 'Third']);
      });
    });

    describe('stream transformations', () => {
      it('should filter results', async () => {
        const TestStream = jest.fn().mockImplementation(() => ({
          getReader: () => createMockReader([
            '<thinking><number>1</number><number>2</number><number>3</number><number>4</number></thinking>'
          ])
        }));

        const results = [];
        const evenStream = stream('Give me numbers', {
          llmStream: TestStream
        })
          .select('number')
          .map(({$text}) => parseInt($text))
          .filter(n => n % 2 === 0);

        for await (const num of evenStream) {
          results.push(num);
        }

        expect(results).toEqual([2, 4]);
      });

      it('should reduce results', async () => {
        const TestStream = jest.fn().mockImplementation(() => ({
          getReader: () => createMockReader([
            '<thinking><number>1</number><number>2</number><number>3</number></thinking>'
          ])
        }));

        const results = [];
        const sumStream = stream('Give me numbers', {
          llmStream: TestStream
        })
          .select('number')
          .map(({$text}) => parseInt($text))
          .reduce((acc, n) => acc + n, 0);

        for await (const sum of sumStream) {
          results.push(sum);
        }

        // Should yield running totals
        expect(results).toEqual([1, 3, 6]);
      });

      it('should combine transformations', async () => {
        const TestStream = jest.fn().mockImplementation(() => ({
          getReader: () => createMockReader([
            '<thinking><number>1</number><number>2</number><number>3</number><number>4</number></thinking>'
          ])
        }));

        const results = [];
        const numberStream = stream('Give me numbers', {
          llmStream: TestStream
        })
          .select('number')
          .map(({$text}) => parseInt($text))
          .filter(n => n % 2 === 0)
          .reduce((acc, n) => acc + n, 0);

        for await (const sum of numberStream) {
          results.push(sum);
        }

        // Should filter even numbers and sum them
        expect(results).toEqual([2, 6]);
      });
    });
  });

  describe('Error handling', () => {
    it('should handle network errors gracefully', async () => {
      const TestStream = jest.fn().mockImplementation(() => {
        const error = new Error('Network disconnected');
        error.name = 'NetworkError';
        throw error;
      });

      await expect(async () => {
        await stream('Rate this poem', {
          llmStream: TestStream
        })
          .select('score')
          .value();
      }).rejects.toThrow('Failed to connect to LLM service: Network disconnected');
    });

    it('should handle timeouts', async () => {
      const TestStream = jest.fn().mockImplementation(() => {
        const error = new Error('Request timed out');
        error.name = 'TimeoutError';
        throw error;
      });

      await expect(async () => {
        await stream('Rate this poem', {
          llmStream: TestStream
        })
          .select('score')
          .value();
      }).rejects.toThrow('LLM request timed out: Request timed out');
    });
  });

  describe('stream() with schema and closed mode', () => {
    it('should handle schema-based prompts', async () => {
      const TestStream = jest.fn().mockImplementation(() => ({
        getReader: () => createMockReader([
          '<thinking><answer><value>4</value><explanation>Basic addition</explanation></answer></thinking>'
        ])
      }));

      const result = await stream({
        prompt: "What is 2+2?",
        schema: {
          answer: {
            value: Number,
            explanation: String
          }
        }
      }, {
        llmStream: TestStream
      })
      .closedOnly()
      .value();

      expect(result).toEqual({
        answer: {
          value: 4,
          explanation: 'Basic addition'
        }
      });
    });

    it('should filter for complete elements with closedOnly()', async () => {
      const TestStream = jest.fn().mockImplementation(() => ({
        getReader: () => createMockReader([
          '<thinking><item>First</item><item>Sec',
          'ond</item><item>Third</item></thinking>'
        ])
      }));

      const results = [];
      const itemStream = stream('List items', {
        llmStream: TestStream
      })
        .select('item')
        .closedOnly()
        .text();

      for await (const item of itemStream) {
        results.push(item);
      }

      expect(results).toEqual(['First', 'Second', 'Third']);
    });

    it('should combine schema and closed mode', async () => {
      const TestStream = jest.fn().mockImplementation(() => ({
        getReader: () => createMockReader([
          '<thinking><result><score>8</score></result><result><sc',
          'ore>9</score></result></thinking>'
        ])
      }));

      const results = [];
      const scoreStream = stream({
        prompt: 'Give me scores',
        schema: {
          result: {
            score: Number
          }
        },
        closed: true
      }, {
        llmStream: TestStream
      });

      for await (const result of scoreStream) {
        results.push(result);
      }

      expect(results).toEqual([
        { result: { score: 8 } },
        { result: { score: 9 } }
      ]);
    });

    it('should handle system prompts with schema', async () => {
      const TestStream = jest.fn().mockImplementation(() => ({
        getReader: () => createMockReader([
          '<thinking><math><result>4</result><method>addition</method></math></thinking>'
        ])
      }));

      const result = await stream({
        prompt: "What is 2+2?",
        schema: {
          math: {
            result: Number,
            method: String
          }
        },
        system: "You are a math tutor. Always explain your method."
      }, {
        llmStream: TestStream
      }).value();

      expect(result).toEqual({
        math: {
          result: 4,
          method: 'addition'
        }
      });
    });
  });

  describe('stream() with complete filter', () => {
    it('should filter for complete elements', async () => {
      const TestStream = jest.fn().mockImplementation(() => ({
        getReader: () => createMockReader([
          '<thinking><item>First</item><item>Sec',
          'ond</item><item>Third</item></thinking>'
        ])
      }));

      const results = [];
      const stream1 = stream('List items', {
        llmStream: TestStream
      })
        .select('item')
        .closedOnly()
        .text();

      for await (const item of stream1) {
        results.push(item);
      }

      expect(results).toEqual(['First', 'Second', 'Third']);
    });

    it('should be applied before transformations', async () => {
      const TestStream = jest.fn().mockImplementation(() => ({
        getReader: () => createMockReader([
          '<thinking><item type="number">1</item><item>Part',
          'ial</item><item type="number">2</item></thinking>'
        ])
      }));

      const results = [];
      const stream1 = stream('List items', {
        llmStream: TestStream
      })
        .select('item')
        .text();

      for await (const item of stream1) {
        results.push(item);
      }

      expect(results).toEqual(['1', 'Part', 'Partial', '2']);
    });
  });

  describe('stream() with select and closedOnly()', () => {
    it('should stream partial updates by default', async () => {
      const TestStream = jest.fn().mockImplementation(() => ({
        getReader: () => createMockReader([
          '<thinking><item>First</item><item>Part',
          'ial</item><item>Third</item></thinking>'
        ])
      }));

      // Default behavior - shows partial updates
      const results1 = [];
      const stream1 = stream('List items', {
        llmStream: TestStream
      })
        .select('item')
        .text();

      for await (const item of stream1) {
        results1.push(item);
      }

      // Should include partial updates
      expect(results1).toEqual(['First', 'Part', 'Partial', 'Third']);

      // With closedOnly() - only closed elements
      const results2 = [];
      const stream2 = stream('List items', {
        llmStream: TestStream
      })
        .select('item')
        .closedOnly()
        .text();

      for await (const item of stream2) {
        results2.push(item);
      }

      // Should only include closed elements
      expect(results2).toEqual(['First', 'Partial', 'Third']);
    });
  });

  describe('stream() merge()', () => {
    it('should merge simple objects', async () => {
      const TestStream = jest.fn().mockImplementation(() => ({
        getReader: () => ({
          read: jest.fn()
            .mockResolvedValueOnce({ 
              value: new TextEncoder().encode(
                '<thinking><item>1</item><item>2</item></thinking>'
              ),
              done: false 
            })
            .mockResolvedValueOnce({ done: true }),
          releaseLock: jest.fn()
        })
      }));

      const result = await stream('List items', {
        llmStream: TestStream
      })
        .select('item')
        .map(({$text}) => ({ value: parseInt($text) }))
        .merge()
        .value();

      expect(result).toEqual({
        value: 2  // Last value wins for simple merge
      });
    });

    it('should merge nested objects recursively', async () => {
      const TestStream = jest.fn().mockImplementation(() => ({
        getReader: () => ({
          read: jest.fn()
            .mockResolvedValueOnce({ 
              value: new TextEncoder().encode(
                '<thinking><stats><views>10</views></stats><tag>a</tag><stats><likes>5</likes></stats><tag>b</tag></thinking>'
              ),
              done: false 
            })
            .mockResolvedValueOnce({ done: true }),
          releaseLock: jest.fn()
        })
      }));

      const result = await stream('Get stats', {
        llmStream: TestStream
      })
        .select('stats, tag')
        .map(el => {
          console.log('>>>name', el);
          if (el.$name === 'stats') {
            const child = el.$children[0];
            console.log('>>>child', child);
            return { 
              stats: {
                [child.$name]: Number(child.$text)
              }
            };
          }
          if (el.$name === 'tag') {
            return {
              tags: [el.$text]
            };
          }
        })
        .merge()
        .value();

      expect(result).toEqual({
        stats: {
          views: 10,
          likes: 5
        },
        tags: ['a', 'b']
      });
    });

    it('should handle complex nested structures', async () => {
      const TestStream = jest.fn().mockImplementation(() => ({
        getReader: () => ({
          read: jest.fn()
            .mockResolvedValueOnce({ 
              value: new TextEncoder().encode(`
                <thinking>
                  <analysis>
                    <topics><topic>AI</topic></topics>
                    <subtopics><tech>ML</tech></subtopics>
                  </analysis>
                  <analysis>
                    <topics><topic>Science</topic></topics>
                    <subtopics><tech>Data</tech></subtopics>
                  </analysis>
                </thinking>
              `),
              done: false 
            })
            .mockResolvedValueOnce({ done: true }),
          releaseLock: jest.fn()
        })
      }));

      const result = await stream('Analyze topics', {
        llmStream: TestStream
      })
        .select('analysis')
        .map(analysis => ({
          topics: {
            main: [analysis.topics[0].topic[0].$text],
            subtopics: {
              tech: [analysis.subtopics[0].tech[0].$text]
            }
          }
        }))
        .merge()
        .value();

      expect(result).toEqual({
        topics: {
          main: ['AI', 'Science'],
          subtopics: {
            tech: ['ML', 'Data']
          }
        }
      });
    });
  });
}); 