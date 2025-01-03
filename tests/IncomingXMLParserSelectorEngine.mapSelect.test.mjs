import IncomingXMLParserSelectorEngine from '../src/parsers/IncomingXMLParserSelectorEngine';

describe('IncomingXMLParserSelectorEngine mapSelect', () => {
  let engine;

  beforeEach(() => {
    engine = new IncomingXMLParserSelectorEngine();
  });

  test('mapSelect should handle multiple items in arrays', () => {
    const engine = new IncomingXMLParserSelectorEngine();
    engine.add(`
      <root>
        <baby_names>
          <name>Luna</name>
          <name>Zion</name>
          <name>Nova</name>
        </baby_names>
        <activities>
          <activity>Peekaboo</activity>
          <activity>Singing</activity>
        </activities>
        <exercises>
          <exercise>Tummy time</exercise>
          <exercise>Leg bicycling</exercise>
        </exercises>
      </root>
    `);

    const result = engine.mapSelect({
      'baby_names': { name: [String] },
      activities: { activity: [String] },
      exercises: { exercise: [String] }
    });

    expect(result).toEqual({
      baby_names: {
        name: [
          'Luna',
          'Zion',
          'Nova'
        ],
      },
      activities: {
        activity: [
          'Peekaboo',
          'Singing'
        ]
      },
      exercises: {
        exercise: [
          'Tummy time',
          'Leg bicycling'
        ]
      }
    });
  });

  test('non-existent element', () => {
    const engine = new IncomingXMLParserSelectorEngine();
    engine.add(`
      <thing>hhhh</think>
    `);
    expect(engine.mapSelect({
      notExisting: String
    })).toEqual({});
  });

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
        title: ({ $$text }) => $$text.toUpperCase(),
        author: String,
        reviews: {
          review: [String]
        },
        isbn: [
          {
            number: ({ $$text: n }) => 'ISBN: ' + n
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
                ({$$text: text}) => text.toLowerCase()
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
        $$text: String
      }
    });

    expect(result).toEqual({
      item: {
        $id: 123,
        $category: 'book',
        $$text: 'The Great Gatsby'
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
          $$text: String
        },
        price: {
          $currency: String,
          $$text: Number
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
          $$text: 'Laptop'
        },
        price: {
          $currency: 'USD',
          $$text: 999.99
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
        <complex thing="value">Text and attribute</complex>
      </root>
    `);
    
    let result = engine.mapSelect({
      root: {
        simple: String,
        complex: {
          $$text: String,
          $thing: String
        }
      }
    });

    expect(result).toEqual({
      root: {
        simple: "Just text",
        complex: {
          $$text: "Text and attribute",
          $thing: "value"
        }
      }
    });
  });

  test('makeMapSelectScaffold should generate correct XML scaffold for simple schema with attributes and text', () => {
    const schema = {
      person: {
        $id: Number,
        name: String,
        age: Number,
        address: {
          $type: String,
          $$text: String
        }
      }
    };

    const result = IncomingXMLParserSelectorEngine.makeMapSelectScaffold(schema);

    const expectedXML = `
  <person id="{Number}">
    <name>{String}</name>
    <age>{Number}</age>
    <address type="{String}">
      {String}
    </address>
  </person>
    `.trim().replace(/\s+/g, '');

    expect(result.replace(/\s+/g, '')).toBe(expectedXML);
  });

  test('makeMapSelectScaffold should generate correct XML scaffold for super simple schema', () => {

    expect(
      IncomingXMLParserSelectorEngine
        .makeMapSelectScaffold({
          topic: String
        })
        .replace(/\s+/g, '')
    ).toBe('<topic>{String}</topic>');

  });

  test('makeMapSelectScaffold should generate correct XML scaffold for simple schema', () => {
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

    const result = IncomingXMLParserSelectorEngine.makeMapSelectScaffold(schema);

    const expectedXML = `
  <book>
    <title>...</title>
    <author>{String}</author>
    <reviews>
      <review>{String}</review>
      <review>{String}</review>
      /*etc.*/
    </reviews>
    <isbn>
      <number>...</number>
    </isbn>
    <isbn>
      <number>...</number>
    </isbn>
    /*etc.*/
  </book>
    `.trim().replace(/\s+/g, '');

    expect(result.replace(/\s+/g, '')).toBe(expectedXML);
  });

  test('makeMapSelectScaffold should generate correct XML scaffold for complex schema', () => {
    const schema = {
      book: {
        $id: Number,
        title: {
          $$text: String,
          $lang: String
        },
        author: String,
        reviews: {
          review: [{
            $$text: String,
            $rating: Number
          }]
        },
        isbn: [
          {
            $type: String,
            $$text: n => 'ISBN: ' + n
          }
        ]
      }
    };

    const result = IncomingXMLParserSelectorEngine.makeMapSelectScaffold(schema);

    const expectedXML = `
  <book id="{Number}">
    <title lang="{String}">
      {String}
    </title>
    <author>{String}</author>
    <reviews>
      <review rating="{Number}">
        {String}
      </review>
      <review rating="{Number}">
        {String}
      </review>
      /*etc.*/
    </reviews>
    <isbn type="{String}">
      ...
    </isbn>
    <isbn type="{String}">
      ...
    </isbn>
    /*etc.*/
  </book>
    `.trim().replace(/\s+/g, '');

    expect(result.replace(/\s+/g, '')).toBe(expectedXML);
  });

  test('mapSelect should always include open tags', () => {
    engine.add('<root><item>1</item><item>2<subitem>');
    
    let result = engine.mapSelect({
      item: [{
        $$text: String
      }],
      subitem: [{
        $$text: String
      }]
    });

    expect(result).toEqual({
      item: [
        { $$text: '1' },
        { $$text: '2' }
      ],
      subitem: [
        { $$text: '' }  // Open tag with no content yet
      ]
    });

    engine.add('sub-content</subitem></item>');
    
    result = engine.mapSelect({
      item: [{
        $$text: String
      }],
      subitem: [{
        $$text: String
      }]
    });

    expect(result).toEqual({
      item: [
        { $$text: '2sub-content' }  // Updated content
      ],

      // Currently the implementation is such that subitem will
      // have been de-duped since it has been returned already as
      // part of the <item>.

      // subitem: [
      //   { $$text: 'sub-content' }  // Now closed with content
      // ]
    });
  });

  test('temp: test unclosed things', () => {
    const engine = new IncomingXMLParserSelectorEngine();
    engine.add('<thing>red</thing><thing>blu');
    let result = engine.mapSelect({
      thing: [String]
    });
    expect(result).toEqual({ thing: [ 'red', 'blu' ] });
  });

  test('temp: test unclosed things#2 non-root', () => {
    const engine = new IncomingXMLParserSelectorEngine();
    engine.add('<stuff><thing>red</thing><thing>blu');
    let result = engine.mapSelect({
      stuff: {
        thing: [String]
      }
    });
    expect(result).toEqual({
      stuff: {
        thing: [ 'red', 'blu' ]
      }
    });
  });

  test('Array notation handles unclosed elements appropriately', () => {
    const engine = new IncomingXMLParserSelectorEngine();
    
    // Add a complete color and an incomplete one
    engine.add('<colors><color>red</color><color>blu');
    
    let result = engine.mapSelect({
      colors: {
        color: [String]
      }
    });

    console.log('First chunk result:', result);

    // Should include both complete and incomplete items
    expect(result).toEqual({ colors: {
      color: [ 'red', 'blu' ]
    } });
    
    // Add the rest of the incomplete color
    engine.add('e</color></colors>');
    
    result = engine.mapSelect({
      colors: {
        color: [String]
      }
    });

    console.log('Second chunk result:', result);

    // Now expect the completed item
    expect(result).toEqual({ colors: {
      color: [
        'red',
        'blue'
      ]
    } });
  });
  
  test('mapSelect should handle string literals as String type with explanation hints', () => {
    const engine = new IncomingXMLParserSelectorEngine();
    engine.add(`
      <person>
        <name>John Smith</name>
        <age>42</age>
        <occupation>Software Engineer</occupation>
      </person>
    `);

    const result = engine.mapSelect({
      person: {
        name: "The person's full name",
        age: Number,
        occupation: "The person's current job title"
      }
    });

    expect(result).toEqual({
      person: {
        name: 'John Smith',
        age: 42,
        occupation: 'Software Engineer'
      }
    });
  });

  test('makeMapSelectScaffold should use string literals as explanation hints', () => {
    const schema = {
      person: {
        name: "The person's full name",
        age: Number,
        occupation: "The person's current job title",
        'hobbies': {
          hobby: ["A hobby"]
        }
      }
    };

    const scaffold = IncomingXMLParserSelectorEngine.makeMapSelectScaffold(schema);
    const normalized = scaffold.replace(/\s+/g, ' ').trim();

    expect(normalized).toContain(`<name>The person's full name</name>`);
    expect(normalized).toContain(`<age>{Number}</age>`);
    expect(normalized).toContain(`<occupation>The person's current job title</occupation>`);
    expect(normalized).toContain(`<hobby> A hobby </hobby>`);
  });

  test('mapSelect should handle transformations #2', () => {
    const engine = new IncomingXMLParserSelectorEngine();
    engine.add(`
      <user>
        <emails>
          <email>test@example.com</email>
          <email>another@example.com</email>
        </emails>
        <scores>
          <score>10</score>
          <score>20</score>
        </scores>
      </user>
    `);

    const result = engine.mapSelect({
      user: {
        emails: {
          email: [({$$text: email}) => {
            return email.toUpperCase();
          }]
        },
        scores: {
          score: [({$$text: score}) => Number(score) * 2]
        }
      }
    });

    expect(result).toEqual({
      user: {
        emails: {
          email: ['TEST@EXAMPLE.COM', 'ANOTHER@EXAMPLE.COM']
        },
        scores: {
          score: [20, 40]
        }
      }
    });
  });

  test('should handle incomplete nested tag structures appropriately', () => {
    const engine = new IncomingXMLParserSelectorEngine();
    
    // Add partial structure
    engine.add('<colors><color>');
    
    const result = engine.mapSelect({
      colors: {
        color: [String]
      }
    });

    expect(result).toEqual({
      colors: {
        color: ['']  // Empty string for incomplete tag
      }
    });
    
    // Add the rest
    engine.add('red</color></colors>');
    
    const completeResult = engine.mapSelect({
      colors: {
        color: [String]
      }
    });

    expect(completeResult).toEqual({
      colors: {
        color: ['red']
      }
    });
  });
});