import { jest } from '@jest/globals';
import { stream, simple, configure } from '../src/xmllm-main.mjs';
import { resetConfig, getConfig } from '../src/config.mjs';

const createMockReader = (responses) => {
  let index = 0;
  return {
    read: jest.fn(async () => {
      if (index >= responses.length) {
        return { done: true, value: undefined };
      }
      return {
        value: new TextEncoder().encode(responses[index++]),
        done: false
      };
    }),
    releaseLock: jest.fn()
  };
};

describe('ChainableStreamInterface', () => {

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
        .map(({$$text}) => parseInt($$text))
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
          score: parseInt(analysis.score[0].$$text),
          rating: analysis.score[0].$$attr.rating,
          comments: analysis.comments[0].comment.map(c => c.$$text)
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
        .map(({$$text}) => $$text.toUpperCase());

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
          .map(({$$text}) => parseInt($$text))
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
          .map(({$$text}) => parseInt($$text))
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
          .map(({$$text}) => parseInt($$text))
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
      .last();

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
          '<thinking>',
          '<result><score>8</score></result>',
          '<result><score>9</score></result>',  // Make sure mock provides different value
          '</thinking>'
        ])
      }));

      const scoreStream = stream('Rate these poems', {
        llmStream: TestStream,
        schema: {
          result: {
            score: Number
          }
        },
        mode: 'root_closed'  // Use new mode param instead of closed
      });

      const results = await scoreStream.last(2);

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
      }).last();

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
        .map(({$$text}) => ({ value: parseInt($$text) }))
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
          if (el.$$tagname === 'stats') {
            const child = el.$$children[0];
            console.log('>>>child', child);
            return { 
              stats: {
                [child.$$tagname]: Number(child.$$text)
              }
            };
          }
          if (el.$$tagname === 'tag') {
            return {
              tags: [el.$$text]
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
            main: [analysis.topics[0].topic[0].$$text],
            subtopics: {
              tech: [analysis.subtopics[0].tech[0].$$text]
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

  describe('last(n)', () => {
    it('should get last n items', async () => {
      const TestStream = jest.fn().mockImplementation(() => ({
        getReader: () => createMockReader([
          '<thinking><num>1</num><num>2</num><num>3</num><num>4</num></thinking>'
        ])
      }));

      const stream1 = stream('List numbers', {
        llmStream: TestStream
      })
        .select('num')
        .map(({$$text}) => parseInt($$text));

      // Get last 2 items
      const lastTwo = await stream1.last(2);
      expect(lastTwo).toEqual([3, 4]);

      // Default to last 1 item
      const lastOne = await stream1.last();
      expect(lastOne).toBe(4);

      // Get last 3 items
      const lastThree = await stream1.last(3);
      expect(lastThree).toEqual([2, 3, 4]);
    });

    it('should handle fewer items than requested', async () => {
      const TestStream = jest.fn().mockImplementation(() => ({
        getReader: () => createMockReader([
          '<thinking><num>1</num><num>2</num></thinking>'
        ])
      }));

      const nums = stream('List numbers', {
        llmStream: TestStream
      })
        .select('num')
        .map(({$$text}) => parseInt($$text));

      const lastThree = await nums.last(3);
      expect(lastThree).toEqual([1, 2]);
    });

    it('should validate n parameter', async () => {
      const TestStream = jest.fn().mockImplementation(() => ({
        getReader: () => createMockReader([
          '<thinking><num>1</num></thinking>'
        ])
      }));

      const nums = stream('List numbers', {
        llmStream: TestStream
      }).select('num');

      await expect(nums.last(0)).rejects.toThrow('n must be greater than 0');
      await expect(nums.last(-1)).rejects.toThrow('n must be greater than 0');
    });
  });
});

describe('Stream Function Signatures', () => {
  const TestStream = jest.fn().mockImplementation(() => ({
    getReader: () => createMockReader([
      '<thinking><response>Test response</response></thinking>'
    ])
  }));

  beforeEach(() => {
    TestStream.mockClear();
  });

  it('should handle string prompt', async () => {
    await stream('Test query', {
      llmStream: TestStream,
      system: 'BE FRIENDLY'
    }).last();

    expect(TestStream).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [
          {
            role: 'system',
            content: expect.stringContaining('BE FRIENDLY')
          },
          {
            role: 'user',
            content: 'Test query'
          }
        ]
      })
    );
  });

  it('should handle config object with prompt', async () => {
    await stream({
      prompt: 'Test query',
      temperature: 0.8
    }, {
      llmStream: TestStream
    }).last();

    expect(TestStream).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([
          {
            role: 'user',
            content: 'Test query'
          }
        ]),
        temperature: 0.8
      })
    );
  });

  it('should handle config object with messages array', async () => {
    await stream({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful astronaut'
        },
        {
          role: 'user',
          content: 'Test query'
        }
      ]
    }, {
      llmStream: TestStream
    }).last();

    // Updated expectation to match actual behavior
    expect(TestStream).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([ // TODO: what do we actually expect when people do this? 
          {
            role: 'system',
            content: 'You are a helpful astronaut'
          },
          {
            role: 'user',
            content: 'Test query'
          }
        ])
      })
    );
  });

  it('should merge config defaults with overrides', async () => {
    await stream({
      prompt: 'Test query',
      temperature: 0.8,  // Override default
      model: 'anthropic:fast'  // Override default
    }, {
      llmStream: TestStream,
      maxTokens: 2000  // Override in options
    }).last();

    expect(TestStream).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.any(Array),
        temperature: 0.8,
        model: 'anthropic:fast',
        max_tokens: 2000
      })
    );
  });

  it('should handle schema with string prompt', async () => {
    await stream('Test query', {
      llmStream: TestStream,
      schema: {
        response: String
      }
    }).last();

    expect(TestStream).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: 'user',
            content: expect.stringContaining('<response>')
          })
        ])
      })
    );
  });
});

describe('Stream to Provider Parameter Passing', () => {
  test('parameters from stream() reach provider payloader correctly', async () => {
    let capturedParams = {};

    const TestStream = jest.fn().mockImplementation((payload) => {
      console.log('fake payload capture', payload);
      capturedParams = payload;
      throw new Error('Payload captured');
    });

    const customPayloader = (payload) => {
      throw new Error('Should not reach payloader');
    };

    const streamConfig = {
      prompt: 'Test prompt 111',
      model: {
        inherit: 'anthropic',
        name: 'param-test-model',
        payloader: customPayloader
      },
      // Core parameters that MUST be passed through
      maxTokens: 1000,
      temperature: 0.7,
      topP: 0.9,
      presencePenalty: 0.5,
      system: 'Test system prompt 222',
      cache: true,
      stop: ['EOR'],
      schema: {
        response: String
      }
    };

    await expect(
      stream(streamConfig, { llmStream: TestStream }).value()
    ).rejects.toThrow('Payload captured');

    // Verify message content
    const systemMessage = capturedParams.messages.find(m => m.role === 'system');
    const userMessage = capturedParams.messages.find(m => m.role === 'user');

    expect(systemMessage.content).toContain('Test system prompt 222');
    expect(userMessage.content).toContain('Test prompt 111');
    expect(userMessage.content).toContain('<response>');

    console.log('CAPTURED', capturedParams);4

    // Strict parameter checking
    expect(capturedParams).toMatchObject({
      // Core parameters must match exactly what we passed in
      max_tokens: 1000,        // Not defaulting to 4000
      temperature: 0.7,        // Not defaulting to 0.5
      top_p: 0.9,             // Should pass through
      presence_penalty: 0.5,   // Should pass through
      cache: true,            // Should pass through
      
      stop: ['EOR'],
      model: {
        name: 'param-test-model',
        inherit: 'anthropic',
        payloader: customPayloader
      }
    });
  });

  // Add test for default values when parameters aren't specified
  test('uses correct defaults when parameters not specified', async () => {
    const capturedParams = {};

    const TestStream = jest.fn().mockImplementation((payload) => {
      Object.assign(capturedParams, payload);
      throw new Error('Payload captured');
    });

    // Minimal configuration
    await expect(
      stream({
        prompt: 'Test prompt 999'
      }, { llmStream: TestStream }).value()
    ).rejects.toThrow('Payload captured');

    // Verify default values
    expect(capturedParams).toMatchObject({
      max_tokens: 300,      // Default max tokens
      temperature: 0.72,     // Default temperature
    });
  });
});

describe('Stream Mode Support', () => {

  it('should handle state_open mode (default)', async () => {
    const TestStream = jest.fn().mockImplementation(() => ({
      getReader: () => createMockReader([
        '<colors>',
        '<color>re',
        'd</color>',
        '<color>blu',
        'e</color>',
        '</colors>'
      ])
    }));

    const updates = [];
    const colorStream = stream('List colors', {
      llmStream: TestStream,
      schema: {
        color: Array(String)
      }
      // mode: 'state_open' is default
    });

    for await (const update of colorStream) {
      updates.push(update);
    }

    expect(updates).toEqual([
      { color: ['re'] },            // Partial
      { color: ['red'] },           // Complete
      { color: ['red', 'blu'] },    // Complete + Partial
      { color: ['red', 'blue'] },    // Both Complete
      { color: ['red', 'blue'] }    // Both Complete
    ]);
  });

  it('should handle root_closed mode', async () => {
    const TestStream = jest.fn().mockImplementation(() => ({
      getReader: () => createMockReader([
        '<colors>',
        '<color>re',
        'd</color>',
        '<color>blu',
        'e</color>',
        '</colors>'
      ])
    }));

    const updates = [];
    const colorStream = stream('List colors', {
      llmStream: TestStream,
      schema: {
        color: Array(String)
      },
      mode: 'root_closed'
    });

    for await (const update of colorStream) {
      updates.push(update);
    }

    expect(updates).toEqual([
      { color: ['red'] },     // First complete
      { color: ['blue'] }     // Second complete
    ]);
  });

  it('should handle state_closed mode', async () => {
    const TestStream = jest.fn().mockImplementation(() => ({
      getReader: () => createMockReader([
        '<colors>',
        '<color>re',
        'd</color>',
        '<color>blu',
        'e</color>',
        '</colors>'
      ])
    }));

    const updates = [];
    const colorStream = stream('List colors', {
      llmStream: TestStream,
      schema: {
        color: Array(String)
      },
      mode: 'state_closed'
    });

    for await (const update of colorStream) {
      updates.push(update);
    }

    expect(updates).toEqual([
      { color: ['red'] },           // First complete element
      { color: ['red'] },           // No change
      { color: ['red', 'blue'] },   // Both complete
      { color: ['red', 'blue'] }    // Final state
    ]);
  });

  it('should validate mode parameter', async () => {
    expect(() => {
      stream('List colors', {
        schema: { color: Array(String) },
        mode: 'invalid'
      });
    }).toThrow('Invalid mode. Must be one of: state_open, state_closed, root_open, root_closed');
  });

  it('should handle mode in simple() function', async () => {
    const TestStream = jest.fn().mockImplementation(() => ({
      getReader: () => createMockReader([
        '<colors><color>red</color><color>blue</color></colors>'
      ])
    }));

    // simple() defaults to delta mode
    const result = await simple(
      'List colors',
      {
        schema: {
          color: Array(String)
        },
        llmStream: TestStream
      }
    );

    expect(result).toEqual({
      color: ['red', 'blue']
    });

    // Can override to state mode
    const stateResult = await simple(
      'List colors',
      {
        schema: {
          color: Array(String)
        },
        llmStream: TestStream,
        mode: 'state_open'
      }
    );

    expect(stateResult).toEqual({
      color: ['red', 'blue']
    });
  });

  it('should support legacy closed parameter', async () => {
    const TestStream = jest.fn().mockImplementation(() => ({
      getReader: () => createMockReader([
        '<colors><color>red</color><color>blue</color></colors>'
      ])
    }));

    // Using legacy closed: true
    const updates = [];
    const colorStream = stream('List colors', {
      llmStream: TestStream,
      schema: { color: Array(String) },
      closed: true  // Legacy parameter
    });

    for await (const update of colorStream) {
      updates.push(update);
    }

    // Should behave like delta mode
    expect(updates).toEqual([
      {
        color: ['red', 'blue']
      }
    ]);
  });
});

describe('Stream Terminal Operations', () => {
  it('should collect all results with collect()', async () => {
    const TestStream = jest.fn().mockImplementation(() => ({
      getReader: () => createMockReader([
        '<items><item>1</item><item>2</item><item>3</item></items>'
      ])
    }));

    // Using non-array schema to get individual items
    const results = await stream('List items', {
      llmStream: TestStream,
      schema: { item: [String] },  // Not Array(String)
      mode: 'state_closed'  // Only get complete items
    }).collect();

    expect(results).toEqual([
      { item: ['1', '2', '3'] }
    ]);
  });

  it('should deprecate value() in favor of first()', async () => {
    const TestStream = jest.fn().mockImplementation(() => ({
      getReader: () => createMockReader([
        '<items><item>1</item><item>2</item></items>'
      ])
    }));

    const stream1 = stream('List items', {
      llmStream: TestStream,
      schema: { item: String }
    });

    // Both should give same result
    const valueResult = await stream1.value();
    const firstResult = await stream1.first();

    expect(valueResult).toEqual(firstResult);
    expect(valueResult).toEqual({ item: '1' });
  });

  it('should collect results with all()', async () => {
    const TestStream = jest.fn().mockImplementation(() => ({
      getReader: () => createMockReader([
        '<items><item>1</item><item>2</item><item>3</item></items>'
      ])
    }));

    const results = await stream('List items', {
      llmStream: TestStream
    })
      .select('item')
      .map(({$$text}) => parseInt($$text))
      .all();

    expect(results).toEqual([1, 2, 3]);
  });

  it('should accumulate results with accrue()', async () => {
    const TestStream = jest.fn().mockImplementation(() => ({
      getReader: () => createMockReader([
        '<items><item>1</item><item>2</item><item>3</item></items>'
      ])
    }));

    const results = await stream('List items', {
      llmStream: TestStream
    })
      .select('item')
      .map(({$$text}) => parseInt($$text))
      .accrue()
      .last();

    expect(results).toEqual([1, 2, 3]);
  });

});

describe('Config', () => {
  beforeEach(() => {
    configure({
      defaults: {
        temperature: 0.72,
        maxTokens: 300,
        model: 'anthropic:good'
      }
    });
  });
  
  test('should respect global default configuration', async () => {
    configure({
      defaults: {
        temperature: 0.9,
        model: 'anthropic:fast',
        maxTokens: 2000
      }
    });
  
    const TestStream = jest.fn().mockImplementation(() => ({
      getReader: () => ({
        read: jest.fn().mockResolvedValue({ done: true }),
        releaseLock: jest.fn()
      })
    }));
  
    await stream('Test prompt 111', {
      llmStream: TestStream
    }).last();
  
    // Verify TestStream was called with our default config
    expect(TestStream).toHaveBeenCalledWith(
      expect.objectContaining({
        temperature: 0.9,
        model: 'anthropic:fast',
        max_tokens: 2000
      })
    );
  });
  
  test('should allow overriding global defaults', async () => {
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
  
    await stream('Test prompt 222', {
      llmStream: TestStream,
      temperature: 0.5,  // Override default
      model: 'openai:good'  // Override default
    }).last();
  
    expect(TestStream).toHaveBeenCalledWith(
      expect.objectContaining({
        temperature: 0.5,  // Should use override
        model: 'openai:good'  // Should use override
      })
    );
  });
});

describe('Error Message Handling', () => {
  beforeEach(() => {
    resetConfig();
  });

  it('should use default generic failure message', async () => {
    const TestStream = jest.fn().mockImplementation(() => ({
      getReader: () => createMockReader([
        getConfig().defaults.errorMessages.genericFailure
      ])
    }));

    const updates = [];
    const stream1 = stream('Test query', {
      llmStream: TestStream
    });

    for await (const update of stream1) {
      updates.push(update);
    }

    expect(updates).toEqual([
      getConfig().defaults.errorMessages.genericFailure
    ]);
  });

  it('should allow overriding generic failure message via config', async () => {
    const customMessage = "Custom failure message";
    
    configure({
      defaults: {
        errorMessages: {
          genericFailure: customMessage
        }
      }
    });

    const TestStream = jest.fn().mockImplementation(() => ({
      getReader: () => createMockReader([customMessage])
    }));

    const updates = [];
    const stream1 = stream('Test query', {
      llmStream: TestStream
    });

    for await (const update of stream1) {
      updates.push(update);
    }

    expect(updates).toEqual([customMessage]);
  });

  it('should allow overriding generic failure message per request', async () => {
    const customMessage = "Request-specific failure message";
    
    const TestStream = jest.fn().mockImplementation(() => ({
      getReader: () => createMockReader([customMessage])
    }));

    const updates = [];
    const stream1 = stream('Test query', {
      llmStream: TestStream,
      errorMessages: {
        genericFailure: customMessage
      }
    });

    for await (const update of stream1) {
      updates.push(update);
    }

    expect(updates).toEqual([customMessage]);
  });
});

describe('Strategy Configuration', () => {
  it('should pass strategy through to final payload', async () => {
    const TestStream = jest.fn().mockImplementation(() => ({
      getReader: () => createMockReader(['<result>test</result>'])
    }));

    // Test with a specific strategy
    await stream('Test prompt', {
      llmStream: TestStream,
      strategy: 'minimal',
      schema: { result: String }
    }).last();

    // Verify the final payload to TestStream
    expect(TestStream).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([
          {
            role: 'system',
            content: expect.stringContaining('XML OUTPUT RULES')
          },
          {
            role: 'user',
            content: expect.stringContaining('Here is the schema to follow:')
          }
        ])
      })
    );

    // Test that it flows through with schema and other options
    expect(TestStream).toHaveBeenCalledWith(
      expect.objectContaining({
        // Check other expected payload properties
        model: expect.arrayContaining(['anthropic:good', 'openai:good', 'anthropic:fast', 'openai:fast']),
        temperature: expect.any(Number),
        max_tokens: expect.any(Number)
      })
    );
  });

  it('should handle partial prompt generator overrides', async () => {
    const TestStream = jest.fn().mockImplementation(() => ({
      getReader: () => createMockReader(['<result>test</result>'])
    }));

    const customUserPrompt = (scaffold, prompt) => `CUSTOM: ${prompt}\nSCAFFOLD: ${scaffold}`;

    await stream('Test prompt', {
      llmStream: TestStream,
      strategy: 'minimal',  // Uses minimal strategy's system prompt
      genUserPrompt: customUserPrompt, // But custom user prompt
      schema: { result: String }
    }).last();

    // Should use minimal strategy's system prompt
    expect(TestStream.mock.calls[0][0].messages[0]).toEqual({
      role: 'system',
      content: expect.stringContaining('XML OUTPUT RULES')
    });

    // But use our custom user prompt
    expect(TestStream.mock.calls[0][0].messages[1]).toEqual({
      role: 'user',
      content: expect.stringContaining('CUSTOM:')
    });
  });
}); 