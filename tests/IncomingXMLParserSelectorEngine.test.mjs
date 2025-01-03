import IncomingXMLParserSelectorEngine, { Node } from '../src/parsers/IncomingXMLParserSelectorEngine';

expect.extend({
  toBeNode(received, expected) {
    if (!(received instanceof Node)) {
      return {
        pass: false,
        message: () => `Expected ${JSON.stringify(received)} to be a Node instance`
      };
    }
    
    const pass = this.equals(
      {$$attr: received.$$attr, $$text: received.$$text, $$tagclosed: received.$$tagclosed, $$tagkey: received.$$tagkey},
      {$$attr: expected.$$attr, $$text: expected.$$text, $$tagclosed: expected.$$tagclosed, $$tagkey: expected.$$tagkey}
    );

    return {
      pass,
      message: () => `Expected Node ${JSON.stringify(received)} to match ${JSON.stringify(expected)}`
    };
  },
  
  toMatchNodeData(received, expected) {
    const nodeData = received instanceof Node ? 
      {$$attr: received.$$attr, $$text: received.$$text, $$tagkey: received.$$tagkey} :
      received;
      
    return {
      // Individually check the properties we care about:
      pass: this.equals(nodeData.$$attr, expected.$$attr) &&
            this.equals(nodeData.$$text, expected.$$text) &&
            this.equals(nodeData.$$tagkey, expected.$$tagkey) &&
            this.equals(nodeData.$$tagclosed, expected.$$tagclosed),

      message: () => `Expected node data ${JSON.stringify(nodeData)} to match ${JSON.stringify(expected)}`
    };
  }
});

describe('IncomingXMLParserSelectorEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new IncomingXMLParserSelectorEngine();
  });

  test('should handle angle brackets within element content', () => {
    const engine = new IncomingXMLParserSelectorEngine();

    engine.add('<complex><![CDATA[<not>parsed</not>]]></complex>');
    engine.add('<math>2 < 3 && 5 > 4</math>');

    const complexResult = engine.select('complex');
    expect(complexResult).toHaveLength(1);
    expect(complexResult[0]).toBeNode({
      $$attr: {},
      $$text: '<not>parsed</not>',
      $$tagclosed: true,
      $$tagkey: 0
    });

    const mathResult = engine.select('math');
    expect(mathResult).toHaveLength(1);
    expect(mathResult[0]).toBeNode({
      $$attr: {},
      $$text: '2 < 3 && 5 > 4',
      $$tagclosed: true,
      $$tagkey: 1
    });
  });

  test('should parse XML chunks and select elements', () => {
    engine.add('<root>');
    expect(engine.select('root')).toEqual([]);
    
    engine.add('<item>Item 1</item>');
    expect(engine.select('item')[0]).toBeNode({
      $$tagkey: 1,
      $$attr: {},
      $$text: 'Item 1',
      $$tagclosed: true
    });
    
    engine.add('<item>Item 2</item>');
    expect(engine.select('item')[1]).toBeNode({
      $$tagkey: 2,
      $$attr: {},
      $$text: 'Item 2',
      $$tagclosed: true
    });
    
    engine.add('</root>');
    const root = engine.select('root')[0];
    expect(root).toMatchNodeData({
      $$tagkey: 0,
      $$attr: {},
      $$text: 'Item 1Item 2'
    });

    expect(root.item[0]).toMatchNodeData({
      $$tagkey: 1,
      $$attr: {},
      $$text: 'Item 1'
    });

    expect(root.item[1]).toMatchNodeData({
      $$tagkey: 2,
      $$attr: {},
      $$text: 'Item 2'
    });
  });

  test('should handle nested elements and attributes', () => {
    engine.add('<message type="greeting">');
    engine.add('Hello, ');
    engine.add('<name id="user1">John</name>');
    engine.add('!</message>');
    
    const messageResult = engine.select('message');
    expect(messageResult).toHaveLength(1);
    expect(messageResult[0]).toMatchNodeData({
      $$tagkey: 0,
      $$attr: { type: 'greeting' },
      $$text: 'Hello, John!'
    });

    expect(messageResult[0].name[0]).toMatchNodeData(
      {
        $$tagkey: 1,
        $$attr: { id: 'user1' },
        $$text: 'John'
      }
    );
    
    const nameResult = engine.select('name');
    expect(nameResult).toHaveLength(1);
    expect(nameResult[0]).toMatchNodeData({
      $$tagkey: 1,
      $$attr: { id: 'user1' },
      $$text: 'John'
    });
  });

  test('should handle multiple chunks and incomplete tags', () => {
    engine.add('<root><item> Item');
    expect(engine.select('item')).toEqual([]);
    
    engine.add(' 1 </item><item>Item 2</it');
    expect(engine.select('item')[0]).toBeNode({
      $$tagkey: 1,
      $$attr: {},
      $$text: ' Item 1 ',
      $$tagclosed: true
    });
    
    engine.add('em></root>');
    expect(engine.select('item')[0]).toBeNode({
      $$tagkey: 1,
      $$attr: {},
      $$text: ' Item 1 ',
      $$tagclosed: true
    });
    expect(engine.select('item')[1]).toBeNode({
      $$tagkey: 2,
      $$attr: {},
      $$text: 'Item 2',
      $$tagclosed: true
    });
  });

  test('should handle empty elements', () => {
    const engine = new IncomingXMLParserSelectorEngine();
    engine.add('<root><empty></empty><self-closing />Text<empty-with-attr attr="value"></empty-with-attr></root>');
    
    const emptyResult = engine.select('empty');
    expect(emptyResult).toHaveLength(1);
    expect(emptyResult[0]).toBeNode({
      $$attr: {},
      $$tagclosed: true,
      $$text: '',
      $$tagkey: 1
    });
    expect(typeof emptyResult[0].$$tagkey).toBe('number');

    const selfClosingResult = engine.select('self-closing');
    expect(selfClosingResult).toHaveLength(1);
    expect(selfClosingResult[0]).toBeNode({
      $$attr: {},
      $$tagclosed: true,
      $$text: '',
      $$tagkey: 2
    });
    expect(typeof selfClosingResult[0].$$tagkey).toBe('number');

    const emptyWithAttrResult = engine.select('empty-with-attr');
    expect(emptyWithAttrResult).toHaveLength(1);
    expect(emptyWithAttrResult[0]).toBeNode({
      $$attr: { attr: 'value' },
      $$tagclosed: true,
      $$tagkey: 3,
      $$text: ''
    });
    expect(typeof emptyWithAttrResult[0].$$tagkey).toBe('number');

    // Ensure keys are unique
    const allKeys = [...emptyResult, ...selfClosingResult, ...emptyWithAttrResult].map(el => el.$$tagkey);
    expect(new Set(allKeys).size).toBe(allKeys.length);
  });

  test('should handle deeply nested elements', () => {
    const engine = new IncomingXMLParserSelectorEngine();
    engine.add('<root><level1><level2><level3>Deep</level3></level2></level1></root>');
    
    const level3Result = engine.select('level3');
    expect(level3Result).toHaveLength(1);
    expect(level3Result[0]).toMatchNodeData({ 
      $$tagkey: 3, 
      $$attr: {}, 
      $$text: 'Deep' 
    });
    
    const rootLevel3Result = engine.select('root level3');
    expect(rootLevel3Result).toHaveLength(1);
    expect(rootLevel3Result[0]).toMatchNodeData({ 
      $$tagkey: 3, 
      $$attr: {}, 
      $$text: 'Deep' 
    });
  });

  test('should handle multiple elements with the same name', () => {
    const engine = new IncomingXMLParserSelectorEngine();
    engine.add('<root><item id="1">First</item><item id="2">Second</item><item id="3">Third</item></root>');
    
    const items = engine.select('item');
    items.forEach((item, i) => {
      expect(item).toMatchNodeData({
        $$tagkey: i + 1,
        $$attr: { id: `${i + 1}` },
        $$text: ['First', 'Second', 'Third'][i]
      });
    });
  });

  test('should handle elements with mixed content', () => {
    const engine = new IncomingXMLParserSelectorEngine();
    engine.add('<root>Text <em>emphasized</em> and <strong>strong</strong>.</root>');
    
    const root = engine.select('root')[0];
    expect(root).toMatchNodeData({
      $$tagkey: 0,
      $$attr: {},
      $$text: 'Text emphasized and strong.',
      em: [{ $$tagkey: 1, $$attr: {}, $$text: 'emphasized' }],
      strong: [{ $$tagkey: 2, $$attr: {}, $$text: 'strong' }]
    });
  });

  test('should handle XML declaration and comments', () => {
    const engine = new IncomingXMLParserSelectorEngine();
    engine.add('<?xml version="1.0" encoding="UTF-8"?>');
    engine.add('<!-- This is a comment -->');
    engine.add('<root><!-- Another comment -->Content</root>');
    
    const root = engine.select('root')[0];
    expect(root).toMatchNodeData({
      $$tagkey: 0,
      $$attr: {},
      $$text: 'Content'
    });
  });

  test('should handle CDATA sections', () => {
    const engine = new IncomingXMLParserSelectorEngine();
    engine.add('<root><![CDATA[This is <not> parsed & preserved]]></root>');
    
    const root = engine.select('root')[0];
    expect(root).toMatchNodeData({
      $$tagkey: 0,
      $$attr: {},
      $$text: 'This is <not> parsed & preserved'
    });
  });

  test('should handle special characters and entities', () => {
    const engine = new IncomingXMLParserSelectorEngine();
    engine.add('<root><item>&lt;Tag&gt;</item><item>AT&amp;T</item><item>&#x1F600;</item></root>');
    
    const items = engine.select('item');
    expect(items).toHaveLength(3);
    
    expect(items[0]).toMatchNodeData({ 
      $$tagkey: 1, 
      $$attr: {}, 
      $$text: '<Tag>' 
    });
    expect(items[1]).toMatchNodeData({ 
      $$tagkey: 2, 
      $$attr: {}, 
      $$text: 'AT&T' 
    });
    expect(items[2]).toMatchNodeData({ 
      $$tagkey: 3, 
      $$attr: {}, 
      $$text: '😀' 
    });
  });

  test('should handle namespaces', () => {
    const engine = new IncomingXMLParserSelectorEngine();
    engine.add('<root xmlns:ns="http://example.com"><ns:item>Namespaced</ns:item></root>');
    
    const items = engine.select('ns\\:item');
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchNodeData({ 
      $$tagkey: 1, 
      $$attr: {}, 
      $$text: 'Namespaced' 
    });
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
    expect(strongResult[0]).toBeNode({
      $$attr: {},
      $$tagclosed: true,
      $$tagkey: 1,
      $$text: 'ok??'
    });

    engine.add('<data><x>hi</x>Boop!</da');
    
    const xResult = engine.select('data > x');
    expect(xResult).toHaveLength(1);
    expect(xResult[0]).toBeNode({
      $$tagclosed: true,
      $$tagkey: 3,
      $$attr: {},
      $$text: 'hi'
    });

    expect(engine.select('data')).toEqual([]);

    engine.add('ta>');
    const dataResult = engine.select('data');
    expect(dataResult).toHaveLength(1);
    expect(dataResult[0]).toBeNode({
      $$attr: {},
      $$text: 'hiBoop!',
      $$tagclosed: true,
      $$tagkey: 2,
    });

    const x = dataResult[0].x;
    expect(x).toHaveLength(1);
    expect(x[0]).toBeNode({
      $$attr: {},
      $$text: 'hi',
      $$tagkey: 3,
      $$tagclosed: true
    });

    // Close root element
    engine.add('</root>');
  });

});