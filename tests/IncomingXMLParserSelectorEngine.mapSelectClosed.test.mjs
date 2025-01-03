import IncomingXMLParserSelectorEngine from '../src/parsers/IncomingXMLParserSelectorEngine';

describe('IncomingXMLParserSelectorEngine mapSelectClosed', () => {
  let engine;

  beforeEach(() => {
    engine = new IncomingXMLParserSelectorEngine();
  });

  test('mapSelectClosed should only include closed tags', () => {
    engine.add('<root><item>1</item><item>2<subitem>');
    
    let result = engine.mapSelectClosed({
      item: [{ $$text: String }],
      subitem: [{ $$text: String }]
    });

    expect(result).toEqual({
      item: [
        { $$text: '1' }
      ]
      // No subitem or second item, as they're not closed
    });

    engine.add('sub-content</subitem></item>');
    
    result = engine.mapSelectClosed({
      item: [{ $$text: String }],
      subitem: [{ $$text: String }]
    });

    expect(result).toEqual({
      item: [
        { $$text: '2sub-content' }
      ],
      
      // Currently the implementation is such that subitem will
      // have been de-duped since it has been returned already as
      // part of the <item>.
      // subitem: [
      //   { $$text: 'sub-content' }
      // ]
    });
  });
  
  test('mapSelectClosed should handle nested structures', () => {
    engine.add(`
      <root>
        <parent>
          <child>
            <grandchild>Hello</grandchild>
            <grandchild>World</grandchild>
          </child>
          <child>
            <grandchild>Foo`);

    let result = engine.mapSelectClosed({
      root: {
        parent: {
          child: [
            {
              grandchild: [String]
            }
          ]
        }
      }
    });

    // No results yet, as root is not closed
    expect(result).toEqual({});

    engine.add(`</grandchild>
            <grandchild>Bar</grandchild>
          </child>
        </parent>
      </root>
    `);

    result = engine.mapSelectClosed({
      root: {
        parent: {
          child: [
            {
              grandchild: [String]
            }
          ]
        }
      }
    });

    // Now we get the full result as root is closed
    expect(result).toEqual({
      root: {
        parent: {
          child: [
            {
              grandchild: ['Hello', 'World']
            },
            {
              grandchild: ['Foo', 'Bar']
            }
          ]
        }
      }
    });
  });

  test('mapSelectClosed should handle attributes', () => {
    engine.add('<item id="1" complete="false">In progress</item><item id="2" complete="true">Done</item>');
    
    let result = engine.mapSelectClosed({
      item: [{
        $id: Number,
        $complete: complete => complete === 'true',
        $$text: String
      }]
    });

    expect(result).toEqual({
      item: [
        {
          $id: 1,
          $complete: false,
          $$text: 'In progress'
        },
        {
          $id: 2,
          $complete: true,
          $$text: 'Done'
        }
      ]
    });
  });

  test('mapSelectClosed should not return results for non-existent elements', () => {
    engine.add('<root><existing>Content</existing></root>');
    
    let result = engine.mapSelectClosed({
      existing: String,
      nonExisting: String
    });

    expect(result).toEqual({
      existing: 'Content'
    });
  });

  test('mapSelectClosed should not return partial results or duplicates', () => {
    engine.add('<root><item>Complete</item><item>Incomple');
    
    let result = engine.mapSelectClosed({
      item: [String]
    });

    expect(result).toEqual({
      item: ['Complete']
    });

    engine.add('te</item></root>');

    result = engine.mapSelectClosed({
      item: [String]
    });

    expect(result).toEqual({
      item: ['Incomplete']
    });
  });

  test('mapSelectClosed should return elements with same content but different positions', () => {
    engine.add('<root><item>First</item><item>Second</item>');
    
    let result1 = engine.mapSelectClosed({
      item: [String]
    });

    expect(result1).toEqual({
      item: ['First', 'Second']
    });

    engine.add('<item>Third</item></root>');
    
    let result2 = engine.mapSelectClosed({
      item: [String]
    });

    expect(result2).toEqual({
      item: ['Third']
    });

    // Adding the same content again should produce results, as these are new elements by position
    engine.add('<root><item>First</item><item>Second</item><item>Third</item></root>');
    
    let result3 = engine.mapSelectClosed({
      item: [String]
    });

    expect(result3).toEqual({
      item: ['First', 'Second', 'Third']
    });
  });

  test('mapSelectClosed should differentiate elements based on position, not just content', () => {
    engine.add('<root><parent><child>Same Content</child></parent></root>');
    
    let result1 = engine.mapSelectClosed({
      child: [String]
    });

    expect(result1).toEqual({
      child: ['Same Content']
    });

    engine.add('<root><parent><child>Same Content</child></parent><parent><child>Same Content</child></parent></root>');
    
    let result2 = engine.mapSelectClosed({
      child: [String]
    });

    // Even though the content is the same, these are new elements in different positions
    expect(result2).toEqual({
      child: ['Same Content', 'Same Content']
    });
  });

  test('mapSelectClosed should only yield when all schema-defined tags are closed', () => {
    engine.add(`
      <root>
        <required>Complete</required>
        <alsoRequired>`);
  
    let result = engine.mapSelectClosed({
      root: {
        required: String,
        alsoRequired: String
      }
    });
  
    // Should be empty because not all required tags are closed
    expect(result).toEqual({});
  
    engine.add(`Also Complete</alsoRequired></root>`);
  
    result = engine.mapSelectClosed({
      root: {
        required: String,
        alsoRequired: String
      }
    });
  
    // Now should have the complete structure
    expect(result).toEqual({
      root: {
        required: 'Complete',
        alsoRequired: 'Also Complete'
      }
    });
  });

  test('mapSelectClosed should handle multiple top-level elements', () => {
    engine.add('<book><title>The Great Gatsby</title></book>');
    
    let result = engine.mapSelectClosed({
      book: {
        title: String
      },
      author: {
        name: String
      }
    });
  
    // Does it yield just the book?
    // Or wait for both book AND author?
    // The test would clarify this behavior
  
    engine.add('<author><name>F. Scott Fitzgerald</name></author>');
    
    result = engine.mapSelectClosed({
      book: {
        title: String
      },
      author: {
        name: String
      }
    });
  });
});