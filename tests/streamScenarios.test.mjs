import { jest } from '@jest/globals';
import { stream, simple } from '../src/xmllm-main.mjs';
import { getConfig, resetConfig } from '../src/config.mjs';
import {
  ProviderError,
  ProviderRateLimitError,
  ProviderTimeoutError
} from '../src/errors/ProviderErrors.mjs';
import ProviderManager from '../src/ProviderManager.mjs';

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

describe('Common xmllm Scenarios', () => {
  
  describe('1. Raw Text Streaming', () => {
    it('should stream raw LLM output as it arrives', async () => {
      const TestStream = jest.fn().mockImplementation(() => ({
        getReader: () => createMockReader([
          'Once upon', ' a time', ' there was', ' a programmer'
        ])
      }));

      const chunks = [];
      const rawStream = stream('Tell me a story', {
        llmStream: TestStream
      }).raw();

      for await (const chunk of rawStream) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual([
        'Once upon',
        ' a time',
        ' there was',
        ' a programmer'
      ]);
    });
  });

  describe('2. Element-by-Element Processing', () => {
    it('should process each element as it arrives', async () => {
      const TestStream = jest.fn().mockImplementation(() => ({
        getReader: () => createMockReader([
          '<thinking>',
          '<thought>First thought</thought>',
          '<thought>Second thought</thought>',
          '<thought>Final thought</thought>',
          '</thinking>'
        ])
      }));

      const thoughts = [];
      const thoughtStream = stream('Share some thoughts', {
        llmStream: TestStream
      })
        .select('thought')
        .map(({$text}) => $text);

      for await (const thought of thoughtStream) {
        thoughts.push(thought);
      }

      expect(thoughts).toEqual([
        'First thought',
        'Second thought',
        'Final thought'
      ]);
    });
  });

  describe('3. Real-time Partial Updates', () => {
    it('should show element content as it grows', async () => {
      const TestStream = jest.fn().mockImplementation(() => ({
        getReader: () => createMockReader([
          '<thinking><story>Once', ' upon', ' a time</story></thinking>'
        ])
      }));

      const updates = [];
      const storyStream = stream('Tell me a story', {
        llmStream: TestStream
      })
        .select('story');

      for await (const update of storyStream) {
        updates.push(update.$text);
      }

      expect(updates).toEqual([
        'Once',
        'Once upon',
        'Once upon a time'
      ]);
    });
  });

  describe('4. Schema-Based Analysis', () => {
    it('should collect and merge schema-based results', async () => {
      const TestStream = jest.fn().mockImplementation(() => ({
        getReader: () => createMockReader([
          '<thinking>',
          '<sentiment>Positive</sentiment>',
          '<topics><topic>Career</topic><topic>Technology</topic></topics>',
          '<insights><insight><point>Achievement</point><reasoning>Major milestone</reasoning></insight></insights>',
          '</thinking>'
        ])
      }));

      const analysis = await stream('Analyze: "Just landed my first dev job!"', {
        schema: {
          sentiment: String,
          topics: {
            topic: [String]
          },
          insights: {
            insight: [{
              point: String,
              reasoning: String
            }]
          }
        },
        llmStream: TestStream
      })
        .last();

      expect(analysis).toEqual({
        sentiment: 'Positive',
        topics: {
          topic: ['Career', 'Technology']
        },
        insights: {
          insight: [{
            point: 'Achievement',
            reasoning: 'Major milestone'
          }]
        }
      });
    });
  });

  describe('5. Multiple Selectors from Same Stream', () => {
    it('should allow branching stream for different selectors', async () => {
      const TestStream = jest.fn().mockImplementation(() => ({
        getReader: () => createMockReader([
          '<poem>Roses are red</poem>',
          '<haiku>Autumn leaves falling</haiku>',
          '<poem>Violets are blue</poem>'
        ])
      }));

      const baseStream = stream('Write poems and haikus', {
        llmStream: TestStream
      });

      // Get all poems
      const poems = await baseStream
        .select('poem')
        .all();

      // Get first haiku
      const firstHaiku = await baseStream
        .select('haiku')
        .first();

      expect(poems.map(p => p.$text)).toEqual([
        'Roses are red',
        'Violets are blue'
      ]);

      expect(firstHaiku.$text).toBe('Autumn leaves falling');
    });
  });

  describe('6. Structured Data Collection', () => {
    it('should collect and transform structured XML data', async () => {
      const TestStream = jest.fn().mockImplementation(() => ({
        getReader: () => createMockReader([
          '<thinking>',
          '<color><name>Red</name><rgb><r>255</r><g>0</g><b>0</b></rgb></color>',
          '<color><name>Green</name><rgb><r>0</r><g>255</g><b>0</b></rgb></color>',
          '</thinking>'
        ])
      }));

      // Get all colors and transform them
      const colors = await stream('List RGB colors', {
        llmStream: TestStream
      })
        .select('color')
        .map(color => ({
          name: color.name[0].$text,
          rgb: {
            r: parseInt(color.rgb[0].r[0].$text),
            g: parseInt(color.rgb[0].g[0].$text),
            b: parseInt(color.rgb[0].b[0].$text)
          }
        }))
        .all();

      expect(colors).toEqual([
        { name: 'Red', rgb: { r: 255, g: 0, b: 0 } },
        { name: 'Green', rgb: { r: 0, g: 255, b: 0 } }
      ]);
    });
  });

  describe('6. Nested Element Selection', () => {
    it('should handle selecting nested elements at different levels', async () => {
      const TestStream = jest.fn().mockImplementation(() => ({
        getReader: () => createMockReader([
          '<library>',
          '  <shelf category="fiction">',
          '    <book><title>Dune</title><author>Herbert</author></book>',
          '    <book><title>Neuromancer</title><author>Gibson</author></book>',
          '  </shelf>',
          '  <shelf category="non-fiction">',
          '    <book><title>Cosmos</title><author>Sagan</author></book>',
          '  </shelf>',
          '</library>'
        ])
      }));

      const baseStream = stream('List books by category', {
        llmStream: TestStream
      });

      // Get all books
      const allBooks = await baseStream
        .select('book')
        .map(book => ({
          title: book.title[0].$text,
          author: book.author[0].$text
        }))
        .all()

      // Get fiction books specifically
      const fictionBooks = await baseStream
        .select('shelf[category="fiction"] > book')
        .map(book => book.title[0].$text)
        .all()

      // Get all authors
      const authors = await baseStream
        .select('author')
        .map(author => author.$text)
        .all();

      expect(allBooks).toEqual([
        { title: 'Dune', author: 'Herbert' },
        { title: 'Neuromancer', author: 'Gibson' },
        { title: 'Cosmos', author: 'Sagan' }
      ]);

      expect(fictionBooks).toEqual([
        'Dune',
        'Neuromancer'
      ]);

      expect(authors).toEqual([
        'Herbert',
        'Gibson',
        'Sagan'
      ]);
    });
  });

  describe('Text Analysis Schema', () => {
    it('should analyze text using the standard analysis schema', async () => {
      const TestStream = jest.fn().mockImplementation(() => ({
        getReader: () => createMockReader([
          '<analysis>',
          '<sentiment>Positive and enthusiastic</sentiment>',
          '<topics>',
          '<topic>Career Development</topic>',
          '<topic>Technology Industry</topic>',
          '<topic>Personal Achievement</topic>',
          '</topics>',
          '<key_points>',
          '<key_point>',
          '<point>Career milestone reached</point>',
          '<relevance>0.9</relevance>',
          '</key_point>',
          '<key_point>',
          '<point>Entry into tech industry</point>',
          '<relevance>0.8</relevance>',
          '</key_point>',
          '</key_points>',
          '<summary>A significant career achievement marking entry into the tech industry.</summary>',
          '</analysis>'
        ])
      }));

      const result = await stream(
        'Analyze this tweet: "Just landed my first dev job! 🚀"',
        {
          schema: {
            analysis: {
              sentiment: String,
              topics: {
                topic: Array(String)
              },
              key_points: {
                key_point: Array({
                  point: String,
                  relevance: Number
                })
              },
              summary: String
            }
          },
          llmStream: TestStream
        }
      )
      // .closedOnly()
      // .merge()
      .last();

      expect(result).toEqual({
        analysis: {
          sentiment: 'Positive and enthusiastic',
          topics: {
            topic: [
              'Career Development',
              'Technology Industry',
              'Personal Achievement'
            ]
          },
          key_points: {
            key_point: [
              {
                point: 'Career milestone reached',
                relevance: 0.9
              },
              {
                point: 'Entry into tech industry',
                relevance: 0.8
              }
            ]
          },
          summary: 'A significant career achievement marking entry into the tech industry.'
        }
      });
    });
  });

  describe('Simple Array Schema', () => {
    it('should handle multiple top-level elements with array schema', async () => {
      const TestStream = jest.fn().mockImplementation(() => ({
        getReader: () => createMockReader([
          '<p',
          'oem>Roses ',
          'are red</poem>',
          '<poem>Violets are bl',
          'ue</poem>', //broken up
          '<poem>Sugar is sweet</poem>',
          '<poem>And so are you</poem>'
        ])
      }));

      const result = await stream(
        'Write me a simple poem',
        {
          schema: {
            poem: Array(String)
          },
          llmStream: TestStream
        }
      );

      const poemArrayStates = [];
      for await (const {poem} of result) {
        poemArrayStates.push(poem);
      }

      expect(poemArrayStates).toEqual([
        // I.e. like looking at slices in time:
        [
          'Roses '
        ],
        [
          'Roses are red',  
        ],
        [
          'Roses are red',
          'Violets are bl'
        ],
        [
          'Roses are red',
          'Violets are blue',
        ],
        [
          'Roses are red',
          'Violets are blue',
          'Sugar is sweet'
        ],
        [
          'Roses are red',
          'Violets are blue',
          'Sugar is sweet',
          'And so are you'
        ]
      ]);
    });
  });

  describe('simple() Mode Behavior', () => {

    it('should demonstrate why state_closed is better than root_closed for simple()', async () => {
      const TestStream = jest.fn().mockImplementation(() => ({
        getReader: () => createMockReader([
          // '<data>',
          '<root_value_a>A</root_value_a>',  // First value emitted
          '<root_value_b>B</root_value_b>',  // Same value updated/corrected
          '<root_value_c>C</root_value_c>',  // New value
          // '</data>'
        ])
      }));

      // Using root_closed mode (wrong approach)
      const rootClosedResult = await simple(
        'Get values',
        {
          root_value_a: String,
          root_value_b: String,
          root_value_c: String
        },
        { 
          llmStream: TestStream,
          mode: 'root_closed'
        }
      );

      // Reset mock for second test
      TestStream.mockClear();

      // Using state_closed mode (correct approach)
      const stateClosedResult = await simple(
        'Get values',
        {
          root_value_a: String,
          root_value_b: String,
          root_value_c: String
        },
        { 
          llmStream: TestStream,
          // mode: 'state_closed'  // default so we comment it out!
        }
      );

      // root_closed would miss the correction due to deduplication
      expect(rootClosedResult.root_value_a).toBeUndefined();
      expect(rootClosedResult.root_value_b).toBeUndefined();
      // Only the last is given to use:
      expect(rootClosedResult.root_value_c).toBeDefined();
      
      // state_closed captures the final state correctly
      expect(stateClosedResult.root_value_a).toEqual('A');
      expect(stateClosedResult.root_value_b).toEqual('B');
      expect(stateClosedResult.root_value_c).toEqual('C');
    });
  });

});

describe('Error Handling Scenarios', () => {
  beforeEach(() => {
    resetConfig();
  });

  it('should handle provider errors as stream content', async () => {
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

  it('should handle rate limit errors as stream content', async () => {
    // Mock ProviderManager instead of raw stream
    jest.spyOn(ProviderManager.prototype, 'streamRequest').mockImplementation(() => {
      console.log('Mocked streamRequest');
      throw new ProviderRateLimitError('test-provider', 1000, [{
        type: 'rpm',
        resetInMs: 1000
      }]);
    });

    const updates = [];
    const stream1 = stream('Test query', {
      errorMessages: {
        rateLimitExceeded: "Custom rate limit error"
      }
    });

    for await (const update of stream1) {
      updates.push(update);
    }

    expect(updates).toEqual(["Custom rate limit error"]);

    // Clean up
    jest.restoreAllMocks();
  });

  it('should handle timeout errors as stream content', async () => {
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
});

describe('Schema and Error Handling', () => {
  it('should handle both schema data and errors in single stream', async () => {
    const TestStream = jest.fn().mockImplementation(() => ({
      getReader: () => createMockReader([
        '<user><name>Alice</name></user>',  // Valid schema data
        '<error>Rate limit exceeded</error>',  // Error message
        '<user><name>Bob</name></user>',    // More schema data
      ])
    }));

    const schema = {
      user: [{
        name: String
      }]
    };
    
    const baseStream = stream('Get users', {
      llmStream: TestStream,
      schema
    });

    const final = await baseStream.last();

    expect(final).toEqual({
      user: [
        { name: 'Alice' },
        { name: 'Bob' }
      ]
    });

    const errors = await baseStream.select('error').text().last();

    expect(errors).toEqual('Rate limit exceeded');
  });
  
  // Could also show alternative using stream operations
  it('should handle schema and errors using stream operations', async () => {
    const TestStream = jest.fn().mockImplementation(() => ({
      getReader: () => createMockReader([
        '<thinking>',
        '<user><name>Alice</name></user>',
        '<error>Rate limit exceeded</error>',
        '<user><name>Bob</name></user>',
        '</thinking>'
      ])
    }));

    const baseStream = stream('Get users', {
      llmStream: TestStream
    });

    // Get errors
    const errors = await baseStream
      .select('error')
      .text()
      .collect();

    // Get user data
    const users = await baseStream
      .select('user name')
      .text()
      .collect();

    expect(errors).toEqual(['Rate limit exceeded']);
    expect(users).toEqual(['Alice', 'Bob']);
  });

  async function* combineStreams(schemaStream, errorStream) {
    const schemaIterator = schemaStream[Symbol.asyncIterator]();
    const errorIterator = errorStream[Symbol.asyncIterator]();
    
    let schemaNext = schemaIterator.next();
    let errorNext = errorIterator.next();

    while (true) {
      const [schema, error] = await Promise.all([schemaNext, errorNext]);
      
      if (schema.done && error.done) break;
      
      yield {
        schema: schema.done ? null : schema.value,
        error: error.done ? null : error.value
      };

      if (!schema.done) schemaNext = schemaIterator.next();
      if (!error.done) errorNext = errorIterator.next();
    }
  }

  it('should handle parallel streams with generator helper', async () => {
    const TestStream = jest.fn().mockImplementation(() => ({
      getReader: () => createMockReader([
        '<user><name>Alice</name></user>',
        '<error>Rate limit exceeded</error>',
        '<user><name>Bob</name></user>'
      ])
    }));

    const mainStream = stream('Get users', {
      llmStream: TestStream,
      schema: {
        user: [{
          name: String
        }]
      }
    });

    const updates = [];
    const errors = [];

    for await (const { schema, error } of combineStreams(
      mainStream,
      mainStream.select('error').text()
    )) {
      if (schema) updates.push(schema);
      if (error) errors.push(error);
    }

    expect(updates).toEqual([
      { user: [{ name: 'Alice' }] },
      // Since there are three chunk updates (due to our <error/>)
      // we do receive 3 updates (this is expected)
      { user: [{ name: 'Alice' }] }, // redundant
      { user: [{ name: 'Alice' }, { name: 'Bob' }] } // final state
    ]);
    expect(errors).toEqual(['Rate limit exceeded']);
  });
});
