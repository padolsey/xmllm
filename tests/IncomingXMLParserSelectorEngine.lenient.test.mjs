import IncomingXMLParserSelectorEngine from '../src/IncomingXMLParserSelectorEngine';

describe('IncomingXMLParserSelectorEngine Lenient Parsing', () => {
  let engine;

  beforeEach(() => {
    engine = new IncomingXMLParserSelectorEngine();
  });

  test('should handle mismatched nested tags by implicitly closing in correct order', () => {
    engine.add(`
      <root>Root...<outer>Start<inner>...Inside...</outer>Outside</inner></root>
    `);

    expect(engine.mapSelect({
      outer: {
        _: String,
        inner: String
      },
      root: String
    })).toEqual({
      outer: {
        _: 'Start...Inside...',
        inner: '...Inside...'
      },
      root: 'Root...Start...Inside...Outside'
    });
  });

  test('htmlparser2: Closing tags without corresponding opening tags will be ignored', () => {
    engine.add(`
      <book><title>My Book</title><author>John Doe</wrong><pages>100</pages></book>
    `);

    const result = engine.mapSelect({
      book: {
        title: String,
        author: { // query author as object.
          _: String,
          pages: Number
        },

        // query pages, let's just see...
        pages: Number
      }
    });

    // Wrong closing tag for author means <author> is interpreted as
    // "John Doe... 100" because per htmlparser2, Closing tags without
    // corresponding opening tags will be ignored.
    expect(result).toEqual({
      book: {
        title: 'My Book',
        author: {
          _: 'John Doe100',
          pages: 100
        }, // author is still _open_
        pages: undefined // pages is not root level
      }
    });
  });

  test('should handle interleaved tags by establishing proper hierarchy', () => {
    engine.add(`
      <p>First<b>Bold<i>Bold-Italic</b>Italic</i></p>
    `);

    // Natural html parsing behavior:
    // <p> is open
    // <b> is open
    // <i> is open
    // </b> closes <b>
    // <i> implicitly closes
    // </i> DOES NOTHING as there is no opening <i> tag
    // since <b> has been closed
    // </p> closes <p>
    
    const result = engine.mapSelect({
      p: {
        _: String,
        b: {
          _: String,
          i: String
        }
      }
    });

    expect(result).toEqual({
      p: {
        _: 'FirstBoldBold-ItalicItalic', // entire textContent
        b: {
          _: 'BoldBold-Italic',
          i: 'Bold-Italic'
        }
      }
    });
  });

  test('non-quoted or mal-quoted attributes', () => {
    engine.add(`
      <item id="1" status=pending" name=incomplete>
        <value>Test</value>
      </item>
    `);

    const result = engine.mapSelect({
      item: {
        $id: Number,
        $status: String,
        value: String
      }
    });

    // Should recover valid attributes and ignore malformed ones
    expect(result).toEqual({
      item: {
        $id: 1,
        $status: 'pending\"',
        value: 'Test'
      }
    });
  });

  test('should handle mixed content and normalize whitespace', () => {
    engine.add(`
      <article>
        Text before
        <p>Paragraph</p>
        Floating text
        <p>Another</p>
        More floating
        <p>Final</p>
      </article>
    `);

    const result = engine.mapSelect({
      article: {
        _: text => text.trim().replace(/\s+/g, ' '),  // Normalize whitespace
        p: [({ $text }) => $text.trim()]  // Trim each paragraph
      }
    });

    // Should preserve both structure and mixed content, with normalized whitespace
    expect(result).toEqual({
      article: {
        // _ (textContent) is entire aggregated content:
        _: 'Text before Paragraph Floating text Another More floating Final',
        p: ['Paragraph', 'Another', 'Final']
      }
    });
  });
}); 