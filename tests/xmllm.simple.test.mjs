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
        poem: {
          title: String,
          author: String,
          stanzas: {
            stanza: [String]
          }
        }
      },
      { llmStream: TestStream }
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
        result: {
          count: Number,
          items: {
            item: [Number]
          }
        }
      },
      { llmStream: TestStream }
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
        status: String
      },
      { llmStream: TestStream }
    );

    expect(result).toEqual({
      status: 'In progress'
    });
  });
}); 