const IncomingXMLParserSelectorEngine = require('./IncomingXMLParserSelectorEngine');

describe('IncomingXMLParserSelectorEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new IncomingXMLParserSelectorEngine();
    console.log('--- New Test ---');
  });

  test('non-existent element', () => {
    const engine = new IncomingXMLParserSelectorEngine();
    engine.add(`
      <thing>hhhh</think>
    `);
    expect(engine.mapSelect({
      notExisting: String
    })).toEqual({});
  });return;

  test('mapSelect should handle nested elements with multiple occurrences', () => {
    const engine = new IncomingXMLParserSelectorEngine();
    engine.add(`
      <thing><name>123</name></thing>
      <thing><name>456</name><name>123</name></thing>
    `);
    
    let result = engine.mapSelect([{
      thing: {
        name: [String]
      }
    }]);

    expect(result).toEqual([
      {
        thing: {
          name: ["123"]
        }
      },
      {
        thing: {
          name: ["456", "123"]
        }
      }
    ]);
  });

  test('mapSelect should handle simple structures', () => {
    const engine = new IncomingXMLParserSelectorEngine();
    engine.add(`
      <topic>blah</topic>
      <topic>foo</topic>
      <topic>123</topic>
    `);

    let result = engine.mapSelect([{
      topic: String
    }]);

    expect(result).toEqual([
      { topic: "blah" },
      { topic: "foo" },
      { topic: "123" }
    ]);
  });

  test('mapSelect should handle simple structure #2', () => {
    const engine = new IncomingXMLParserSelectorEngine();
    engine.add(`
      <good>happy</good>
      <good>elated</good>
      <bad>sad</bad>
    `);
    let result = engine.mapSelect({
      good: [String],
      bad: [String]
    });
    expect(result).toEqual({
      good: ["happy", "elated"],
      bad: ["sad"]
    });
  });

  test('mapSelect should handle attributes', () => {
    const engine = new IncomingXMLParserSelectorEngine();
    engine.add('<foo blah="123" />');
    
    let result = engine.mapSelect({
      foo: {
        $blah: String
      }
    });

    expect(result).toEqual({
      foo: {
        $blah: '123'
      }
    });
  });

  test('mapSelect should handle attributes and child elements', () => {
    const engine = new IncomingXMLParserSelectorEngine();
    engine.add('<foo blah="123"><bar>456</bar></foo>');
    
    let result = engine.mapSelect({
      foo: {
        $blah: String,
        bar: Number
      }
    });

    expect(result).toEqual({
      foo: {
        $blah: '123',
        bar: 456
      }
    });
  });

  test('mapSelect should handle a simple structure', () => {
    const engine = new IncomingXMLParserSelectorEngine();
    engine.add(`
      <book>
        <title>The Great Gatsby</title>
        <author>F. Scott Fitzgerald</author>
        <reviews>
          <review>it was good</review>
          <review>it was alright</review>
        </reviews>
        <isbn><number>0000</number></isbn>
        <isbn><number>1111</number></isbn>
      </book>
    `);

    const result = engine.mapSelect({
      book: {
        title: title => title.toUpperCase(),
        author: String,
        reviews: {
          review: [String]
        },
        isbn: [
          {
            number: n => 'ISBN: ' + n
          }
        ]
      }
    });

    expect(result).toEqual({
      book: {
        title: 'THE GREAT GATSBY',
        author: 'F. Scott Fitzgerald',
        reviews: {
          review: ['it was good', 'it was alright']
        },
        isbn: [
          {
            number: 'ISBN: 0000'
          },
          {
            number: 'ISBN: 1111'
          }
        ]
      }
    });
  });

  test('mapSelect should handle nested structures', () => {
    const engine = new IncomingXMLParserSelectorEngine();
    engine.add(`
      <root>
        <parent>
          <child>
            <grandchild>Hello</grandchild>
            <grandchild>World</grandchild>
          </child>
          <child>
            <grandchild>Foo</grandchild>
            <grandchild>Bar</grandchild>
          </child>
        </parent>
      </root>
    `);
    const result = engine.mapSelect({
      root: {
        parent: {
          child: [
            {
              grandchild: [
                text => text.toLowerCase()
              ]
            }
          ]
        }
      }
    });
    expect(result).toEqual({
      root: {
        parent: {
          child: [
            {
              grandchild: ['hello', 'world']
            },
            {
              grandchild: ['foo', 'bar']
            }
          ]
        }
      }
    });
  });


  test('mapSelect should handle attributes with $ prefix', () => {
    const engine = new IncomingXMLParserSelectorEngine();
    engine.add('<item id="123" category="book">The Great Gatsby</item>');
    
    let result = engine.mapSelect({
      item: {
        $id: Number,
        $category: String,
        _: String
      }
    });

    expect(result).toEqual({
      item: {
        $id: 123,
        $category: 'book',
        _: 'The Great Gatsby'
      }
    });
  });

  test('mapSelect should handle attributes and child elements together', () => {
    const engine = new IncomingXMLParserSelectorEngine();
    engine.add(`
      <product sku="ABC123">
        <name lang="en">Laptop</name>
        <price currency="USD">999.99</price>
        <tags>
          <tag>electronics</tag>
          <tag>computer</tag>
        </tags>
      </product>
    `);
    
    let result = engine.mapSelect({
      product: {
        $sku: String,
        name: {
          $lang: String,
          _: String
        },
        price: {
          $currency: String,
          _: Number
        },
        tags: {
          tag: [String]
        }
      }
    });

    expect(result).toEqual({
      product: {
        $sku: 'ABC123',
        name: {
          $lang: 'en',
          _: 'Laptop'
        },
        price: {
          $currency: 'USD',
          _: 999.99
        },
        tags: {
          tag: ['electronics', 'computer']
        }
      }
    });
  });

  test('mapSelect should handle multiple elements with attributes', () => {
    const engine = new IncomingXMLParserSelectorEngine();
    engine.add(`
      <library>
        <book id="1" genre="fiction">
          <title>1984</title>
          <author>George Orwell</author>
        </book>
        <book id="2" genre="non-fiction">
          <title>A Brief History of Time</title>
          <author>Stephen Hawking</author>
        </book>
      </library>
    `);
    
    let result = engine.mapSelect({
      library: {
        book: [{
          $id: Number,
          $genre: String,
          title: String,
          author: String
        }]
      }
    });

    expect(result).toEqual({
      library: {
        book: [
          {
            $id: 1,
            $genre: 'fiction',
            title: '1984',
            author: 'George Orwell'
          },
          {
            $id: 2,
            $genre: 'non-fiction',
            title: 'A Brief History of Time',
            author: 'Stephen Hawking'
          }
        ]
      }
    });
  });

  test('mapSelect should handle both simple text and detailed content with attributes', () => {
    const engine = new IncomingXMLParserSelectorEngine();
    engine.add(`
      <root>
        <simple>Just text</simple>
        <complex attr="value">Text and attribute</complex>
      </root>
    `);
    
    let result = engine.mapSelect({
      root: {
        simple: String,
        complex: {
          _: String,
          $attr: String
        }
      }
    });

    expect(result).toEqual({
      root: {
        simple: "Just text",
        complex: {
          _: "Text and attribute",
          $attr: "value"
        }
      }
    });
  });

  test('makeMapSelectXMLScaffold should generate correct XML scaffold for simple schema with attributes and text', () => {
    const schema = {
      person: {
        $id: Number,
        name: String,
        age: Number,
        address: {
          $type: String,
          _: String
        }
      }
    };

    const result = IncomingXMLParserSelectorEngine.makeMapSelectXMLScaffold(schema);
    console.log("Generated scaffold:\n", result);  // Add this line to see the actual output

    const expectedXML = `
  <person id="...">
    <name>...text content...</name>
    <age>...text content...</age>
    <address type="...">
      ...text content...
    </address>
  </person>
    `.trim().replace(/\s+/g, '');

    expect(result.replace(/\s+/g, '')).toBe(expectedXML);
  });

  test('makeMapSelectXMLScaffold should generate correct XML scaffold for super simple schema', () => {

    expect(
      IncomingXMLParserSelectorEngine
        .makeMapSelectXMLScaffold({
          topic: String
        })
        .replace(/\s+/g, '')
    ).toBe('<topic>...textcontent...</topic>');

  });

  test('makeMapSelectXMLScaffold should generate correct XML scaffold for simple schema', () => {
    const schema = {
      book: {
        title: title => title.toUpperCase(),
        author: String,
        reviews: {
          review: [String]
        },
        isbn: [
          {
            number: n => 'ISBN: ' + n
          }
        ]
      }
    };

    const result = IncomingXMLParserSelectorEngine.makeMapSelectXMLScaffold(schema);
    console.log("Generated scaffold:\n", result);  // Keep this for debugging

    const expectedXML = `
  <book>
    <title>...text content...</title>
    <author>...text content...</author>
    <reviews>
      <review>...text content...</review>
      <review>...text content...</review>
      /*etc.*/
    </reviews>
    <isbn>
      <number>...text content...</number>
    </isbn>
    <isbn>
      <number>...text content...</number>
    </isbn>
    /*etc.*/
  </book>
    `.trim().replace(/\s+/g, '');

    expect(result.replace(/\s+/g, '')).toBe(expectedXML);
  });

  test('makeMapSelectXMLScaffold should generate correct XML scaffold for complex schema', () => {
    const schema = {
      book: {
        $id: Number,
        title: {
          _: String,
          $lang: String
        },
        author: String,
        reviews: {
          review: [{
            _: String,
            $rating: Number
          }]
        },
        isbn: [
          {
            $type: String,
            _: n => 'ISBN: ' + n
          }
        ]
      }
    };

    const result = IncomingXMLParserSelectorEngine.makeMapSelectXMLScaffold(schema);
    console.log("Generated scaffold:\n", result);

    const expectedXML = `
  <book id="...">
    <title lang="...">
      ...text content...
    </title>
    <author>...text content...</author>
    <reviews>
      <review rating="...">
        ...text content...
      </review>
      <review rating="...">
        ...text content...
      </review>
      /*etc.*/
    </reviews>
    <isbn type="...">
      ...text content...
    </isbn>
    <isbn type="...">
      ...text content...
    </isbn>
    /*etc.*/
  </book>
    `.trim().replace(/\s+/g, '');

    expect(result.replace(/\s+/g, '')).toBe(expectedXML);
  });
});