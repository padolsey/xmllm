import { simple } from '../src/xmllm-main.mjs';
import { jest } from '@jest/globals';

describe('xmllm simple()', () => {
  it('should handle basic schema-based requests', async () => {
    const TestStream = jest.fn().mockImplementation(() => ({
      getReader: () => ({
        read: jest.fn()
          .mockResolvedValueOnce({ 
            value: new TextEncoder().encode(
              '<thinking><poem><title>Test Poem</title><author>AI Writer</author><stanzas><stanza>First verse</stanza><stanza>Second verse</stanza></stanzas></poem></thinking>'
            ),
            done: false 
          })
          .mockResolvedValueOnce({ done: true }),
        releaseLock: jest.fn()
      })
    }));

    const result = await simple(
      "Write a poem",
      {
        schema: {
          poem: {
            title: String,
            author: String,
            stanzas: {
              stanza: [String]
            }
          }
        },
        llmStream: TestStream
      }
    );

    expect(result).toEqual({
      poem: {
        title: 'Test Poem',
        author: 'AI Writer',
        stanzas: {
          stanza: ['First verse', 'Second verse']
        }
      }
    });
  });

  it('should handle type transformations', async () => {
    const TestStream = jest.fn().mockImplementation(() => ({
      getReader: () => ({
        read: jest.fn()
          .mockResolvedValueOnce({ 
            value: new TextEncoder().encode(
              '<thinking><result><count>42</count><items><item>1</item><item>2</item></items></result></thinking>'
            ),
            done: false 
          })
          .mockResolvedValueOnce({ done: true }),
        releaseLock: jest.fn()
      })
    }));

    const result = await simple(
      "Give me some numbers",
      {
        schema: {
          result: {
            count: Number,
            items: {
              item: [Number]
            }
          }
        },
        llmStream: TestStream
      }
    );

    expect(result).toEqual({
      result: {
        count: 42,
        items: {
          item: [1, 2]
        }
      }
    });
  });

  it('should always wait for closed tags', async () => {
    const TestStream = jest.fn().mockImplementation(() => ({
      getReader: () => ({
        read: jest.fn()
          .mockResolvedValueOnce({ 
            value: new TextEncoder().encode('<thinking><status>In prog'),
            done: false 
          })
          .mockResolvedValueOnce({ 
            value: new TextEncoder().encode('ress</status></thinking>'),
            done: false 
          })
          .mockResolvedValueOnce({ done: true }),
        releaseLock: jest.fn()
      })
    }));

    const result = await simple(
      "What's the status?",
      {
        schema: {
          status: String
        },
        llmStream: TestStream
      }
    );

    expect(result).toEqual({
      status: 'In progress'
    });
  });

  it('should handle nested schema transformations', async () => {
    const TestStream = jest.fn().mockImplementation(() => ({
      getReader: () => ({
        read: jest.fn()
          .mockResolvedValueOnce({ 
            value: new TextEncoder().encode(
              '<thinking><user><profile><name>John</name><age>30</age></profile><settings><theme>dark</theme></settings></user></thinking>'
            ),
            done: false 
          })
          .mockResolvedValueOnce({ done: true }),
        releaseLock: jest.fn()
      })
    }));

    const result = await simple(
      "Get user info",
      {
        schema: {
          user: {
            profile: {
              name: String,
              age: Number
          },
          settings: {
            theme: String
            }
          }
        },
        llmStream: TestStream
      }
    );

    expect(result).toEqual({
      user: {
        profile: {
          name: 'John',
          age: 30
        },
        settings: {
          theme: 'dark'
        }
      }
    });
  });

  it('should handle arrays in schema', async () => {
    const TestStream = jest.fn().mockImplementation(() => ({
      getReader: () => ({
        read: jest.fn()
          .mockResolvedValueOnce({ 
            value: new TextEncoder().encode(
              '<thinking><list><item>1</item><item>2</item><item>3</item></list></thinking>'
            ),
            done: false 
          })
          .mockResolvedValueOnce({ done: true }),
        releaseLock: jest.fn()
      })
    }));

    const result = await simple(
      "List numbers",
      {
        schema: {
          list: {
            item: [Number]
          }
        },
        llmStream: TestStream
      }
    );

    expect(result).toEqual({
      list: {
        item: [1, 2, 3]
      }
    });
  });

  it('should handle custom transformers', async () => {
    const TestStream = jest.fn().mockImplementation(() => ({
      getReader: () => ({
        read: jest.fn()
          .mockResolvedValueOnce({ 
            value: new TextEncoder().encode(
              '<thinking><data><date>2024-03-14</date><tags>one,two,three</tags></data></thinking>'
            ),
            done: false 
          })
          .mockResolvedValueOnce({ done: true }),
        releaseLock: jest.fn()
      })
    }));

    const result = await simple(
      "Get data",
      {
        schema: {
          data: {
            date: element => new Date(element.$$text),
            tags: element => element.$$text.split(',')
          }
        },
        llmStream: TestStream
      }
    );

    expect(result.data.tags).toEqual(['one', 'two', 'three']);
    
    const date = result.data.date;
    expect(date).toBeInstanceOf(Date);
    expect(date.getFullYear()).toBe(2024);
    expect(date.getMonth()).toBe(2);
    expect(date.getDate()).toBe(14);
  });

  it('should handle error cases gracefully', async () => {
    const TestStream = jest.fn().mockImplementation(() => ({
      getReader: () => ({
        read: jest.fn()
          .mockResolvedValueOnce({ 
            value: new TextEncoder().encode(
              '<thinking><data><number>not a number</number></data></thinking>'
            ),
            done: false 
          })
          .mockResolvedValueOnce({ done: true }),
        releaseLock: jest.fn()
      })
    }));

    const schema = {
      data: {
        number: text => {
          const num = Number(text);
          if (isNaN(num)) {
            throw new Error('Invalid number');
          }
          return num;
        }
      }
    };

    await expect(async () => {
      await simple(
        "Get number",
        {
          schema,
          llmStream: TestStream
        }
      );
    }).rejects.toThrow('Invalid number');
  });

  it('should handle empty or malformed responses', async () => {
    const TestStream = jest.fn().mockImplementation(() => ({
      getReader: () => ({
        read: jest.fn()
          .mockResolvedValueOnce({ 
            value: new TextEncoder().encode(''),
            done: false 
          })
          .mockResolvedValueOnce({ done: true }),
        releaseLock: jest.fn()
      })
    }));

    const result = await simple(
      "Get data",
      {
        schema: {
          data: String
        },
        llmStream: TestStream
      }
    );

    expect(result).toEqual(undefined);
  });

  it('should support system prompts and additional options', async () => {
    const TestStream = jest.fn().mockImplementation(() => ({
      getReader: () => ({
        read: jest.fn()
          .mockResolvedValueOnce({ 
            value: new TextEncoder().encode(
              '<thinking><response>Test</response></thinking>'
            ),
            done: false 
          })
          .mockResolvedValueOnce({ done: true }),
        releaseLock: jest.fn()
      })
    }));

    const result = await simple(
      "Test prompt",
      {
        schema: {
          response: String
        },
        llmStream: TestStream,
        system: "You are a test assistant",
        temperature: 0.5,
        maxTokens: 100
      }
    );

    expect(result).toEqual({
      response: 'Test'
    });
  });
}); 