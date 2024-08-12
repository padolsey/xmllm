const IncomingXMLParserSelectorEngine = require('../IncomingXMLParserSelectorEngine');

describe('IncomingXMLParserSelectorEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new IncomingXMLParserSelectorEngine();
  });

  test('should parse XML chunks and select elements', () => {
    engine.add('<root>');
    console.log('After adding root:');
    console.log(engine.select('root'));

    engine.add('<item>Item 1</item>');
    console.log('After adding first item:');
    console.log(engine.select('item'));

    engine.add('<item>Item 2</item>');
    console.log('After adding second item:');
    console.log(engine.select('item'));

    engine.add('</root>');
    console.log('After closing root:');
    console.log(engine.select('root'));
  });

  test('should parse XML chunks and select elements', () => {
    engine.add('<root>');
    expect(engine.select('root')).toEqual([]);
    
    engine.add('<item>Item 1</item>');
    expect(engine.select('item')).toEqual([
      {
        key: 1,
        attr: {},
        text: 'Item 1'
      }
    ]);
    
    engine.add('<item>Item 2</item>');
    expect(engine.select('item')).toEqual([
      {
        key: 1,
        attr: {},
        text: 'Item 1'
      },
      {
        key: 2,
        attr: {},
        text: 'Item 2'
      }
    ]);
    
    engine.add('</root>');
    expect(engine.select('root')).toEqual([
      {
        key: 0,
        attr: {},
        text: 'Item 1Item 2',
        item: [
          {
            key: 1,
            attr: {},
            text: 'Item 1'
          },
          {
            key: 2,
            attr: {},
            text: 'Item 2'
          }
        ]
      }
    ]);
  });

  test('should handle nested elements and attributes', () => {
    engine.add('<message type="greeting">');
    engine.add('Hello, ');
    engine.add('<name id="user1">John</name>');
    engine.add('!</message>');
    
    expect(engine.select('message')).toEqual([
      {
        key: 0,
        attr: { type: 'greeting' },
        text: 'Hello, John!',
        name: [
          {
            key: 1,
            attr: { id: 'user1' },
            text: 'John'
          }
        ]
      }
    ]);
    
    expect(engine.select('name')).toEqual([
      {
        key: 1,
        attr: { id: 'user1' },
        text: 'John'
      }
    ]);
  });

  test('should handle multiple chunks and incomplete tags', () => {
    engine.add('<root><item>Item');
    expect(engine.select('item')).toEqual([]);
    
    engine.add(' 1</item><item>Item 2</it');
    expect(engine.select('item')).toEqual([
      {
        key: 1,
        attr: {},
        text: 'Item 1'
      }
    ]);
    
    engine.add('em></root>');
    expect(engine.select('item')).toEqual([
      {
        key: 1,
        attr: {},
        text: 'Item 1'
      },
      {
        key: 2,
        attr: {},
        text: 'Item 2'
      }
    ]);
  });

  test('should handle empty elements', () => {
    const engine = new IncomingXMLParserSelectorEngine();
    engine.add('<root><empty></empty><self-closing />Text<empty-with-attr attr="value"></empty-with-attr></root>');
    
    const emptyResult = engine.select('empty');
    expect(emptyResult).toHaveLength(1);
    expect(emptyResult[0]).toMatchObject({
      attr: {},
      text: ''
    });
    expect(typeof emptyResult[0].key).toBe('number');

    const selfClosingResult = engine.select('self-closing');
    expect(selfClosingResult).toHaveLength(1);
    expect(selfClosingResult[0]).toMatchObject({
      attr: {},
      text: ''
    });
    expect(typeof selfClosingResult[0].key).toBe('number');

    const emptyWithAttrResult = engine.select('empty-with-attr');
    expect(emptyWithAttrResult).toHaveLength(1);
    expect(emptyWithAttrResult[0]).toMatchObject({
      attr: { attr: 'value' },
      text: ''
    });
    expect(typeof emptyWithAttrResult[0].key).toBe('number');

    // Ensure keys are unique
    const allKeys = [...emptyResult, ...selfClosingResult, ...emptyWithAttrResult].map(el => el.key);
    expect(new Set(allKeys).size).toBe(allKeys.length);
  });

  test('should handle deeply nested elements', () => {
    const engine = new IncomingXMLParserSelectorEngine();
    engine.add('<root><level1><level2><level3>Deep</level3></level2></level1></root>');
    
    expect(engine.select('level3')).toEqual([
      { key: 3, attr: {}, text: 'Deep' }
    ]);
    expect(engine.select('root level3')).toEqual([
      { key: 3, attr: {}, text: 'Deep' }
    ]);
  });

  test('should handle multiple elements with the same name', () => {
    const engine = new IncomingXMLParserSelectorEngine();
    engine.add('<root><item id="1">First</item><item id="2">Second</item><item id="3">Third</item></root>');
    
    expect(engine.select('item')).toEqual([
      { key: 1, attr: { id: '1' }, text: 'First' },
      { key: 2, attr: { id: '2' }, text: 'Second' },
      { key: 3, attr: { id: '3' }, text: 'Third' }
    ]);
  });

  test('should handle elements with mixed content', () => {
    const engine = new IncomingXMLParserSelectorEngine();
    engine.add('<root>Text <em>emphasized</em> and <strong>strong</strong>.</root>');
    
    expect(engine.select('root')).toEqual([
      { 
        key: 0, 
        attr: {}, 
        text: 'Text emphasized and strong.',
        em: [{ key: 1, attr: {}, text: 'emphasized' }],
        strong: [{ key: 2, attr: {}, text: 'strong' }]
      }
    ]);
  });

  test('should handle XML declaration and comments', () => {
    const engine = new IncomingXMLParserSelectorEngine();
    engine.add('<?xml version="1.0" encoding="UTF-8"?>');
    engine.add('<!-- This is a comment -->');
    engine.add('<root><!-- Another comment -->Content</root>');
    
    expect(engine.select('root')).toEqual([
      { key: 0, attr: {}, text: 'Content' }
    ]);
  });

  test('should handle CDATA sections', () => {
    const engine = new IncomingXMLParserSelectorEngine();
    engine.add('<root><![CDATA[This is <not> parsed & preserved]]></root>');
    
    expect(engine.select('root')).toEqual([
      { key: 0, attr: {}, text: 'This is <not> parsed & preserved' }
    ]);
  });

  test('should handle special characters and entities', () => {
    const engine = new IncomingXMLParserSelectorEngine();
    engine.add('<root><item>&lt;Tag&gt;</item><item>AT&amp;T</item><item>&#x1F600;</item></root>');
    
    expect(engine.select('item')).toEqual([
      { key: 1, attr: {}, text: '<Tag>' },
      { key: 2, attr: {}, text: 'AT&T' },
      { key: 3, attr: {}, text: '😀' }
    ]);
  });

  test('should handle namespaces', () => {
    const engine = new IncomingXMLParserSelectorEngine();
    engine.add('<root xmlns:ns="http://example.com"><ns:item>Namespaced</ns:item></root>');
    
    expect(engine.select('ns\\:item')).toEqual([
      { key: 1, attr: {}, text: 'Namespaced' }
    ]);
  });

  test('should handle realistic fragmented input and resolve selections as soon as possible', () => {
    const engine = new IncomingXMLParserSelectorEngine();

    // Simulate root element
    engine.add('<root>');

    engine.add('hello');
    expect(engine.select('strong')).toEqual([]);

    engine.add('these are arbitrary chunks which might break mid-');
    expect(engine.select('strong')).toEqual([]);

    engine.add('word or randomly<strong>');
    expect(engine.select('strong')).toEqual([]);

    engine.add('ok??</stro');
    expect(engine.select('strong')).toEqual([]);

    engine.add('ng>');
    const strongResult = engine.select('strong');
    expect(strongResult).toHaveLength(1);
    expect(strongResult[0]).toMatchObject({
      attr: {},
      text: 'ok??'
    });

    engine.add('<data><x>hi</x>Boop!</da');
    
    const xResult = engine.select('data > x');
    expect(xResult).toHaveLength(1);
    expect(xResult[0]).toMatchObject({
      attr: {},
      text: 'hi'
    });

    expect(engine.select('data')).toEqual([]);

    engine.add('ta>');
    const dataResult = engine.select('data');
    expect(dataResult).toHaveLength(1);
    expect(dataResult[0]).toMatchObject({
      attr: {},
      text: 'hiBoop!',
      x: [{ attr: {}, text: 'hi' }]
    });

    // Close root element
    engine.add('</root>');
  });

  test('dedupeSelect should return new elements only', () => {
    const engine = new IncomingXMLParserSelectorEngine();

    engine.add('<root><item>1</item><item>2</item>');
    const firstResult = engine.dedupeSelect('item');
    expect(firstResult).toHaveLength(2);
    expect(firstResult.map(item => item.text)).toEqual(['1', '2']);

    engine.add('<item>3</item>');
    const secondResult = engine.dedupeSelect('item');
    expect(secondResult).toHaveLength(1);
    expect(secondResult[0].text).toBe('3');

    engine.add('<item>4</item></root>');
    const thirdResult = engine.dedupeSelect('item');
    expect(thirdResult).toHaveLength(1);
    expect(thirdResult[0].text).toBe('4');

    // Should return an empty array as all items have been returned before
    const fourthResult = engine.dedupeSelect('item');
    expect(fourthResult).toHaveLength(0);
  });


});