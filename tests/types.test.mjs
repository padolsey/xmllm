import { types, StringType, NumberType, BooleanType, EnumType, RawType } from '../src/types.mjs';
import IncomingXMLParserSelectorEngine from '../src/parsers/IncomingXMLParserSelectorEngine.mjs';

describe('Type System', () => {
  let engine;

  function normalize(s) {
    return s.replace(/\s+/g, ' ').trim();
  }

  beforeEach(() => {
    engine = new IncomingXMLParserSelectorEngine();
  });

  test('basic types work with hints and transformers', () => {
    engine.add(`k
      <data>
        <name>John Doe</name>
        <age>42</age>
        <active>true</active>
        <status>PENDING</status>
      </data>
    `);

    const result = engine.mapSelect({
      data: {
        name: types.string("Person's full name")
                  .withTransform(s => s.trim()),
        age: types.number("Age in years")
                 .withTransform(x => Math.floor(x)),
        active: types.boolean("Account status"),
        status: types.enum("Current status", ['PENDING', 'ACTIVE', 'DONE'])
      }
    });

    expect(result).toEqual({
      data: {
        name: 'John Doe',
        age: 42,
        active: true,
        status: 'PENDING'
      }
    });
  });

  test('type constructors enforce correct patterns', () => {
    // Single argument types
    expect(types.string("Name")).toBeInstanceOf(StringType);
    expect(types.number("Age")).toBeInstanceOf(NumberType);
    expect(types.boolean("Active")).toBeInstanceOf(BooleanType);
    expect(types.raw("Content")).toBeInstanceOf(RawType);

    // Enum requires both hint and values
    expect(types.enum("Status", ['A', 'B'])).toBeInstanceOf(EnumType);
    expect(() => types.enum('Blah blah'))
      .toThrow(); // Should throw if there are no enums specified
  });

  test('all types support method chaining for configuration', () => {
    const str = types.string("Name")
                    .withDefault("Anonymous")
                    .withTransform(s => s.toUpperCase());
    
    const num = types.number("Count")
                    .withDefault(0)
                    .withTransform(n => Math.abs(n));
    
    const bool = types.boolean("Active")
                     .withDefault(false)
                     .withTransform(b => !!b);
    
    const raw = types.raw("HTML")
                    .withDefault("<div>")
                    .withTransform(h => h.trim());
    
    const enum1 = types.enum("Status", ['A', 'B'])
                      .withDefault('A')
                      .withTransform(s => s.toLowerCase());

    // Verify all configurations were set
    expect(str.default).toBe("Anonymous");
    expect(str.transform).toBeDefined();
    expect(num.default).toBe(0);
    expect(num.transform).toBeDefined();
    expect(bool.default).toBe(false);
    expect(bool.transform).toBeDefined();
    expect(raw.default).toBe("<div>");
    expect(raw.transform).toBeDefined();
    expect(enum1.default).toBe('A');
    expect(enum1.transform).toBeDefined();
  });

  test('raw type handles CDATA content', () => {
    engine.add(`
      <data>
        <content><![CDATA[<div>Some HTML</div>]]></content>
      </data>
    `);

    const result = engine.mapSelect({
      data: {
        content: types.raw("HTML content"),
        other: types.raw("Default HTML")
                   .withDefault("<span>Default</span>")
      }
    });

    expect(result).toEqual({
      data: {
        content: '<div>Some HTML</div>',
        other: '<span>Default</span>'
      }
    });
  });

  test('types can be chained with hints and transformers', () => {
    engine.add(`
      <data>
        <name>  JOHN DOE  </name>
      </data>
    `);

    const result = engine.mapSelect({
      data: {
        name: types.string("Person's name")
                  .withTransform(value => value.toLowerCase().trim())
      }
    });

    expect(result).toEqual({
      data: {
        name: 'john doe'
      }
    });
  });

  test('types maintain backward compatibility', () => {
    engine.add(`
      <data>
        <name>John</name>
        <age>42</age>
        <active>true</active>
      </data>
    `);

    // Old style
    const oldResult = engine.mapSelect({
      data: {
        name: String,
        age: Number,
        active: Boolean
      }
    }, true, false);

    // New style
    const newResult = engine.mapSelect({
      data: {
        name: types.string(),
        age: types.number(),
        active: types.boolean()
      }
    }, true, false);

    expect(newResult).toEqual(oldResult);
  });

  test('types support default values', () => {
    engine.add(`
      <data>
        <name></name>
        <age></age>
        <active></active>
      </data>
    `);

    const result = engine.mapSelect({
      data: {
        name: types.string("Name").withDefault("Anonymous"),
        age: types.number("Age").withDefault(0),
        active: types.boolean("Active").withDefault(false)
      }
    });

    expect(result).toEqual({
      data: {
        name: "Anonymous",
        age: 0,
        active: false
      }
    });
  });

  test('handles unfulfilled schema parts with defaults', () => {
    engine.add(`
      <data>
        <name>John</name>
        <!-- missing age and settings -->
      </data>
    `);

    const result = engine.mapSelect({
      data: {
        name: types.string().withDefault("Anonymous"),
        age: types.number().withDefault(25),
        settings: {
          theme: types.string().withDefault("light"),
          notifications: types.boolean().withDefault(true)
        },
        somethingWithNoDefaults: {
          v1: types.string(),
          v2: types.string()
        }
      }
    });

    expect(result).toEqual({
      data: {
        name: "John",  // provided in XML
        age: 25,       // uses default
        settings: {
          theme: "light",        // uses default
          notifications: true    // uses default
        }
        // my current thinkning is that if there is a schema part with
        // no defaults, it should not be here.
      }
    });
  });

  test('generates correct scaffold for Type system', () => {
    const schema = {
      data: {
        person: [{
          name: types.string('name of person'),
          age: types.number(),
          active: types.boolean(),
          settings: {
            theme: types.string(),
            notifications: types.boolean()
          },
          content: types.raw(),
          status: types.enum('Current status', ['PENDING', 'ACTIVE', 'DONE'])
        }]
      }
    };

    const hints = {
      data: {
        person: [{
          name: "John Doe",
          age: "42",
          active: "true",
          settings: {
            theme: "dark",
            notifications: "false"
          },
          content: "<div>Some content</div>",
          status: "PENDING"
        }]
      }
    };

    const scaffold = IncomingXMLParserSelectorEngine.makeMapSelectScaffold(schema, hints);
    
    expect(normalize(scaffold)).toEqual(normalize(`
      <data>
        <person>
          <name>John Doe</name>
          <age>42</age>
          <active>true</active>
          <settings>
            <theme>dark</theme>
            <notifications>false</notifications>
          </settings>
          <content><![CDATA[<div>Some content</div>]]></content>
          <status>PENDING</status>
        </person>
        <person>
          <name>John Doe</name>
          <age>42</age>
          <active>true</active>
          <settings>
            <theme>dark</theme>
            <notifications>false</notifications>
          </settings>
          <content><![CDATA[<div>Some content</div>]]></content>
          <status>PENDING</status>
        </person>
        /*etc.*/
      </data>
    `));

    // Test without hints to see type information
    const scaffoldNoHints = IncomingXMLParserSelectorEngine.makeMapSelectScaffold(schema);

    console.log('>>>>>>scaffoldNoHints', scaffoldNoHints);
    
    expect(normalize(scaffoldNoHints)).toEqual(normalize(`
      <data>
        <person>
          <name>{String: name of person}</name>
          <age>{Number}</age>
          <active>{Boolean}</active>
          <settings>
            <theme>{String}</theme>
            <notifications>{Boolean}</notifications>
          </settings>
          <content><![CDATA[...]]></content>
          <status>{Enum: Current status (allowed values: PENDING|ACTIVE|DONE)}</status>
        </person>
        <person>
          <name>{String: name of person}</name>
          <age>{Number}</age>
          <active>{Boolean}</active>
          <settings>
            <theme>{String}</theme>
            <notifications>{Boolean}</notifications>
          </settings>
          <content><![CDATA[...]]></content>
          <status>{Enum: Current status (allowed values: PENDING|ACTIVE|DONE)}</status>
        </person>
        /*etc.*/
      </data>
    `));
  });

  test('enum type with hints works correctly', () => {
    engine.add(`
      <data>
        <status>PENDING</status>
      </data>
    `);

    const result = engine.mapSelect({
      data: {
        status: types.enum("Status", ['PENDING', 'ACTIVE', 'DONE']).withHint("Current status")
      }
    });

    expect(result).toEqual({
      data: {
        status: 'PENDING'
      }
    });

    // Test scaffolding with hints
    const schema = {
      data: {
        status: types.enum("Status", ['PENDING', 'ACTIVE', 'DONE']).withHint("Current status")
      }
    };

    const hints = {
      data: {
        status: "ACTIVE"  // hint value should be used in scaffold
      }
    };

    const scaffold = IncomingXMLParserSelectorEngine.makeMapSelectScaffold(schema, hints);

    expect(normalize(scaffold)).toEqual(normalize(`
      <data>
        <status>ACTIVE</status>
      </data>
    `));

    // Test scaffolding without hints
    const scaffoldNoHints = IncomingXMLParserSelectorEngine.makeMapSelectScaffold(schema);
    expect(normalize(scaffoldNoHints)).toEqual(normalize(`
      <data>
        <status>{Enum: Current status (allowed values: PENDING|ACTIVE|DONE)}</status>
      </data>
    `));
  });

  test('enum type handles invalid values gracefully', () => {
    engine.add(`
      <data>
        <status>INVALID</status>
        <status2>INVALID</status2>
      </data>
    `);

    const result = engine.mapSelect({
      data: {
        // With default value
        status: types.enum("Status", ['PENDING', 'ACTIVE'])
                    .withDefault('PENDING'),
        // Without default value
        status2: types.enum("Status", ['PENDING', 'ACTIVE'])
      }
    });

    expect(result).toEqual({
      data: {
        status: 'PENDING',  // Falls back to default
        // status2 is not included since it's invalid and has no default
      }
    });
  });
});
