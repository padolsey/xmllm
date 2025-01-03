import IncomingXMLParserSelectorEngine from '../src/parsers/IncomingXMLParserSelectorEngine';

describe('Self-closing Tags', () => {
  let engine;

  beforeEach(() => {
    engine = new IncomingXMLParserSelectorEngine();
  });

  // test('should handle self-closing tags with attributes', () => {
  //   engine.add('<root><img src="test.jpg" alt="Test" /><br/><input type="text" /></root>');
    
  //   const result = engine.mapSelect({
  //     img: {
  //       $src: String,
  //       $alt: String
  //     },
  //     input: {
  //       $type: String
  //     },
  //     br: Boolean
  //   });

  //   expect(result).toEqual({
  //     img: {
  //       $src: 'test.jpg',
  //       $alt: 'Test'
  //     },
  //     input: {
  //       $type: 'text'
  //     },
  //     br: true
  //   });
  // });

  test('should handle self-closing tags in streaming chunks', () => {
    engine.add('<root><img');
    engine.add(' src="test.jpg"');
    engine.add(' alt="Test"');
    engine.add('/>');
    engine.add('<lemonade');
    engine.add('/>');
    engine.add('</root>');

    const result = engine.select('img, lemonade');
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchNodeData({
      $$attr: {
        src: 'test.jpg',
        alt: 'Test'
      },
      $$text: '',
      $$tagkey: 1
      // $$tagclosed: true
    });
    expect(result[1]).toMatchNodeData({
      $$attr: {},
      $$text: '',
      $$tagkey: 2
      // $$tagclosed: true
    });
  });

  test('should handle mixed normal and self-closing tags', () => {
    engine.add(`
      <article>
        <p>First paragraph</p>
        <hr />
        <p>Second paragraph</p>
        <img src="test.jpg" />
        <p>Third paragraph</p>
      </article>
    `);

    const result = engine.mapSelect({
      article: {
        p: [String],
        hr: [Boolean],
        img: [{
          $src: String
        }]
      }
    });

    expect(result).toEqual({
      article: {
        p: [
          'First paragraph',
          'Second paragraph', 
          'Third paragraph'
        ],
        hr: [false], // it is empty
        img: [{
          $src: 'test.jpg'
        }]
      }
    });
  });

  test('should handle self-closing tags with no space before slash', () => {
    engine.add('<root><img src="test.jpg"/><br/><input type="text"/></root>');
    
    const result = engine.select('img, br, input');
    expect(result).toHaveLength(3);
    result.forEach(node => {
      expect(node.$$tagclosed).toBe(true);
    });
  });

  test('should handle self-closing tags in nested structures', () => {
    engine.add(`
      <form>
        <fieldset>
          <input type="text" name="username"/>
          <input type="password" name="password"/>
          <br/>
          <input type="submit" value="Login"/>
        </fieldset>
      </form>
    `);

    const result = engine.mapSelect({
      form: {
        fieldset: {
          input: [{
            $type: String,
            $name: String,
            $value: String
          }],
          br: [Boolean]
        }
      }
    });

    expect(result).toEqual({
      form: {
        fieldset: {
          input: [
            {
              $type: 'text',
              $name: 'username'
            },
            {
              $type: 'password',
              $name: 'password',
              $value: undefined
            },
            {
              $type: 'submit',
              $name: undefined,
              $value: 'Login'
            }
          ],
          br: [false]
        }
      }
    });
  });

}); 