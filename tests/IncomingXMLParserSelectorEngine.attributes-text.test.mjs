import IncomingXMLParserSelectorEngine from '../src/parsers/IncomingXMLParserSelectorEngine';

describe('IncomingXMLParserSelectorEngine Attribute and Text Content Schema', () => {
  let engine;

  beforeEach(() => {
    engine = new IncomingXMLParserSelectorEngine();
  });

  test('should handle $$attr in schema', () => {
    engine.add(`
      <product id="123" category="electronics" in-stock="true">
        <name lang="en">Laptop</name>
        <price currency="USD">999.99</price>
      </product>
    `);

    const result = engine.mapSelect({
      product: {
        $id: Number,
        $category: String,
        '$in-stock': (v) => v === 'true',
        name: {
          $lang: String,
          $$text: String
        },
        price: {
          $currency: String,
          $$text: Number
        }
      }
    });

    expect(result).toEqual({
      product: {
        $id: 123,
        $category: 'electronics',
        '$in-stock': true,
        name: {
          $lang: 'en',
          $$text: 'Laptop'
        },
        price: {
          $currency: 'USD',
          $$text: 999.99
        }
      }
    });
  });

  test('should handle text content transformations', () => {
    engine.add(`
      <data>
        <number>42</number>
        <decimal>3.14</decimal>
        <flag>true</flag>
        <text>  trim me  </text>
      </data>
    `);

    const result = engine.mapSelect({
      data: {
        number: {
          $$text: Number
        },
        decimal: {
          $$text: parseFloat
        },
        flag: {
          $$text: text => text === 'true'
        },
        text: {
          $$text: text => text.trim()
        }
      }
    });

    expect(result).toEqual({
      data: {
        number: { $$text: 42 },
        decimal: { $$text: 3.14 },
        flag: { $$text: true },
        text: { $$text: 'trim me' }
      }
    });
  });

  test('should handle text content with nested elements', () => {
    engine.add(`
      <article>Introduction <section>First section</section> <section>Second section</section> Conclusion</article>
    `);

    const result = engine.mapSelect({
      article: {
        $$text: String,
        section: [String]
      }
    });

    expect(result).toEqual({
      article: {
        $$text: 'Introduction First section Second section Conclusion',
        section: ['First section', 'Second section']
      }
    });
  });

  test('should handle attributes in array elements', () => {
    engine.add(`
      <list>
        <item priority="high" done="true">Task 1</item>
        <item priority="medium" done="false">Task 2</item>
        <item priority="low" done="true">Task 3</item>
      </list>
    `);

    const result = engine.mapSelect({
      list: {
        item: [{
          $priority: String,
          $done: text => text === 'true',
          $$text: String
        }]
      }
    });

    expect(result).toEqual({
      list: {
        item: [
          { $priority: 'high', $done: true, $$text: 'Task 1' },
          { $priority: 'medium', $done: false, $$text: 'Task 2' },
          { $priority: 'low', $done: true, $$text: 'Task 3' }
        ]
      }
    });
  });

  test('should handle string literals as hints while processing actual values', () => {
    // The XML that would come from the LLM, which should have followed our hints
    engine.add(`
      <people>
        <person name="John Smith">John is a software engineer with 10 years experience.</person>
        <person name="Sarah Jones">Sarah is a data scientist specializing in ML.</person>
      </people>
    `);

    // Schema with string literals as hints
    const result = engine.mapSelect({
      people: {
        person: [{
          $name: "their full name",     // This is just a hint for the LLM
          $$text: "their bio"            // This is just a hint for the LLM
        }]
      }
    });

    // The actual values should be processed, ignoring the hint strings
    expect(result).toEqual({
      people: {
        person: [
          {
            $name: "John Smith",
            $$text: "John is a software engineer with 10 years experience."
          },
          {
            $name: "Sarah Jones", 
            $$text: "Sarah is a data scientist specializing in ML."
          }
        ]
      }
    });
  });

  test('should handle string literals with transformers', () => {
    engine.add(`
      <people>
        <person name="JOHN SMITH" age="42" joined="2020-01-15">stuff about john</person>
      </people>
    `);

    // Schema mixing hints and transformers
    const result = engine.mapSelect({
      people: {
        person: [{
          $name: "their full name (we'll convert to lowercase)",
          $age: Number,
          $$text: "stuff",
          $joined: text => new Date(text)
        }]
      }
    });

    expect(result).toEqual({
      people: {
        person: [{
          $name: "JOHN SMITH",
          $age: 42,
          $$text: "stuff about john",
          $joined: new Date('2020-01-15')
        }]
      }
    });
  });

  test('should handle $$text specially and not as an attribute', () => {
    engine.add(`
      <element text="this is an attribute" other="something">This is the actual text content</element>
    `);

    const result = engine.mapSelect({
      element: {
        $$text: String,
        $other: String
      }
    });

    expect(result).toEqual({
      element: {
        $$text: "This is the actual text content",
        $other: "something"
      }
    });
  });

  test('can still access "text" attribute if done by element transformer', () => {
    engine.add(`
      <element text="this is an attribute" other="something">This is the actual text content</element>
    `);

    const result = engine.mapSelect({
      element: ({$$attr, $$text}) => ({
        $$text: $$text,
        $other: $$attr.other,
        $$text_attr: $$attr.text
      })
    });

    expect(result).toEqual({
      element: {
        $$text: "This is the actual text content",
        $other: "something",
        $$text_attr: "this is an attribute"
      }
    });
  });

  test('should handle nested attributes correctly', () => {
    const engine = new IncomingXMLParserSelectorEngine();
    
    engine.add(`
      <colors>
        <color>
          <name>Red</name>
          <rgb r="255" g="0" b="0"/>
        </color>
        <color>
          <name>Blue</name>
          <rgb r="0" g="0" b="255"/>
        </color>
      </colors>
    `);

    const result = engine.mapSelect({
      colors: {
        color: [{
          name: String,
          rgb: {
            $r: Number,
            $g: Number,
            $b: Number
          }
        }]
      }
    });

    expect(result).toEqual({
      colors: {
        color: [
          {
            name: 'Red',
            rgb: {
              $r: 255,
              $g: 0,
              $b: 0
            }
          },
          {
            name: 'Blue',
            rgb: {
              $r: 0,
              $g: 0,
              $b: 255
            }
          }
        ]
      }
    });
  });

  // Add a test for attribute transformation behavior
  test('should transform attributes at any nesting level', () => {
    const engine = new IncomingXMLParserSelectorEngine();
    
    engine.add(`
      <root>
        <nested level="1">
          <deeper level="2" value="42">
            <deepest level="3" score="99.9"/>
          </deeper>
        </nested>
      </root>
    `);

    const result = engine.mapSelect({
      root: {
        nested: {
          $level: Number,
          deeper: {
            $level: Number,
            $value: Number,
            deepest: {
              $level: Number,
              $score: Number
            }
          }
        }
      }
    });

    expect(result).toEqual({
      root: {
        nested: {
          $level: 1,
          deeper: {
            $level: 2,
            $value: 42,
            deepest: {
              $level: 3,
              $score: 99.9
            }
          }
        }
      }
    });
  });

  test('should handle RGB attributes', () => {
    const engine = new IncomingXMLParserSelectorEngine();
    
    engine.add(`
      <color>
        <name>Red</name>
        <rgb r="255" g="0" b="0"/>
      </color>
    `);

    const result = engine.mapSelect({
      color: {
        name: String,
        rgb: {
          $r: Number,
          $g: Number,
          $b: Number
        }
      }
    });

    expect(result).toEqual({
      color: {
        name: 'Red',
        rgb: {
          $r: 255,
          $g: 0,
          $b: 0
        }
      }
    });
  });

  test('should reject schemas using reserved node properties', () => {
    const engine = new IncomingXMLParserSelectorEngine();
    
    // Test various reserved properties
    const invalidSchemas = [
      {
        element: {
          $$attr: String,  // Can't use $$attr as a schema field
        }
      },
      {
        element: {
          $$tagclosed: Boolean  // Can't use $$tagclosed
        }
      },
      {
        element: {
          $$tagkey: Number  // Can't use $$tagkey
        }
      },
      {
        element: {
          $$children: Array  // Can't use $$children
        }
      },
      {
        element: {
          $$tagname: String  // Can't use $$tagname
        }
      }
    ];

    invalidSchemas.forEach(schema => {
      expect(() => {
        engine.mapSelect(schema);
      }).toThrow(/Reserved node property/i);
    });

    // Ensure it catches nested usage too
    expect(() => {
      engine.mapSelect({
        root: {
          nested: {
            $$tagclosed: Boolean
          }
        }
      });
    }).toThrow(/Reserved node property/i);

    // But should allow normal $ prefixed attributes
    expect(() => {
      engine.mapSelect({
        element: {
          $customAttr: String,
          $userDefined: Number
        }
      });
    }).not.toThrow();
  });

  test('should handle $$text in schema', () => {
    engine.add(`
      <product id="123" text="some text">
        Content here
      </product>
    `);

    // This would now fail because it has both $$text and $text
    const result = engine.mapSelect({
      product: {
        $text: String,  // Attribute
        $$text: String  // Text content
      }
    });
  });

}); 