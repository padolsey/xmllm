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
        .merge()
        .value();

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
        .all()
        .value();

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
        .all()
        .value();

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
        .value();

      // Get fiction books specifically
      const fictionBooks = await baseStream
        .select('shelf[category="fiction"] > book')
        .map(book => book.title[0].$text)
        .all()
        .value();

      // Get all authors
      const authors = await baseStream
        .select('author')
        .map(author => author.$text)
        .all()
        .value();

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
}); 