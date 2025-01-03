import IncomingXMLParserSelectorEngine from '../src/parsers/IncomingXMLParserSelectorEngine';

describe('IncomingXMLParserSelectorEngine Schema Transformers', () => {
  let engine;

  beforeEach(() => {
    engine = new IncomingXMLParserSelectorEngine();
  });

  test('should apply basic type constructors', () => {
    engine.add(`
      <data>
        <text>hello</text>
        <number>42</number>
        <boolean>true</boolean>
        <float>3.14</float>
      </data>
    `);

    const result = engine.mapSelect({
      data: {
        text: String,
        number: Number,
        boolean: Boolean,
        float: ({ $$text: text }) => parseFloat(text)
      }
    });

    expect(result).toEqual({
      data: {
        text: 'hello',
        number: 42,
        boolean: true,
        float: 3.14
      }
    });
  });

  test('should apply custom transformers', () => {
    engine.add(`
      <data>
        <csv>a,b,c</csv>
        <words>hello world</words>
        <date>2024-03-14</date>
        <mixed>  TRIM ME  </mixed>
      </data>
    `);

    const result = engine.mapSelect({
      data: {
        csv: ({ $$text }) => $$text.split(','),
        words: ({ $$text }) => $$text.split(' '),
        date: ({ $$text }) => new Date($$text),
        mixed: ({ $$text }) => $$text.trim().toLowerCase()
      }
    });

    expect(result).toEqual({
      data: {
        csv: ['a', 'b', 'c'],
        words: ['hello', 'world'],
        date: new Date('2024-03-14'),
        mixed: 'trim me'
      }
    });
  });

  test('should handle transformers with validation', () => {
    engine.add(`
      <form>
        <email>valid@email.com</email>
        <age>25</age>
      </form>
    `);

    const validateEmail = ({ $$text }) => {
      if (!/^\S+@\S+\.\S+$/.test($$text)) {
        throw new Error('Invalid email');
      }
      return $$text;
    };

    const validateAge = ({ $$text }) => {
      const age = Number($$text);
      if (isNaN(age) || age < 0 || age > 150) {
        throw new Error('Invalid age');
      }
      return age;
    };

    const result = engine.mapSelect({
      form: {
        email: validateEmail,
        age: validateAge
      }
    });

    expect(result).toEqual({
      form: {
        email: 'valid@email.com',
        age: 25
      }
    });

    // Test invalid data
    engine.add(`
      <form>
        <email>not-an-email</email>
        <age>invalid</age>
      </form>
    `);

    expect(() => {
      engine.mapSelect({
        form: {
          email: validateEmail,
          age: validateAge
        }
      });
    }).toThrow('Invalid email');
  });

  test('should handle transformers with arrays', () => {
    engine.add(`
      <list>
        <item>1,2,3</item>
        <item>4,5,6</item>
        <item>7,8,9</item>
      </list>
    `);

    const result = engine.mapSelect({
      list: {
        item: [({$$text: text}) => text.split(',').map(Number)]
      }
    });

    expect(result).toEqual({
      list: {
        item: [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9]
        ]
      }
    });
  });

  test('should handle transformers with streaming data', () => {
    // First chunk
    engine.add('<data><value>Hello');
    
    let result = engine.mapSelect({
      data: {
        value: ({$$text: text}) => text.toUpperCase()
      }
    });

    // We get a result even though tag isn't closed
    expect(result).toEqual({
      data: {
        value: 'HELLO'
      }
    });

    // Second chunk
    engine.add(' World</value></data>');
    
    result = engine.mapSelect({
      data: {
        value: ({$$text: text}) => text.toUpperCase()
      }
    });

    expect(result).toEqual({
      data: {
        value: 'HELLO WORLD'
      }
    });
  });

  test('should handle nested transformers', () => {
    engine.add(`
      <person>
        <name>John Doe</name>
        <details>
          <age>30</age>
          <preferences>red,green,blue</preferences>
        </details>
      </person>
    `);

    const result = engine.mapSelect({
      person: {
        name: ({ $$text: name }) => ({
          first: name.split(' ')[0],
          last: name.split(' ')[1]
        }),
        details: {
          age: Number,
          preferences: ({ $$text }) => $$text.split(',')
        }
      }
    });

    expect(result).toEqual({
      person: {
        name: {
          first: 'John',
          last: 'Doe'
        },
        details: {
          age: 30,
          preferences: ['red', 'green', 'blue']
        }
      }
    });
  });

  test('Number transformer should handle various numeric formats', () => {
    const engine = new IncomingXMLParserSelectorEngine();
    engine.add(`
      <numbers>
        <num>42</num>
        <num>  3.14159  </num>
        <num>-123.45</num>
        <num>5e-9</num>
        <num>  +0.123  </num>
        <num>
          42
        </num>
        <num>1.23e+4</num>
        <num>0xFF</num>
        <num>invalid</num>
        <num></num>
      </numbers>
    `);

    const result = engine.mapSelect({
      numbers: {
        num: [Number]  // Use Number transformer
      }
    });

    expect(result).toEqual({
      numbers: {
        num: [
          42,         // Integer
          3.14159,    // Decimal with whitespace
          -123.45,    // Negative
          5e-9,       // Scientific notation
          0.123,      // Leading plus and whitespace
          42,         // Multiline whitespace
          12300,      // Scientific notation with plus
          0,          // Hex not supported by parseFloat
          NaN,        // Invalid number
          NaN         // Empty string
        ]
      }
    });
  });

  test('Boolean should be treated as special transformer', () => {
    const engine = new IncomingXMLParserSelectorEngine();
    engine.add(`
      <flags>
        <flag>true</flag>
        <flag>false</flag>
        <flag>1</flag>
        <flag>0</flag>
      </flags>
    `);

    const result = engine.mapSelect({
      flags: {
        flag: [Boolean]  // Boolean is just a regular transformer now
      }
    }, false, false);

    // Which will mean its always true since Boolean(Element Object) is true:
    expect(result).toEqual({
      flags: {
        flag: [true, false, true, false]
      }
    });

    // Boolean constructor has its own rules which might not be what we want
    // Better to use explicit transformer:
    const betterResult = engine.mapSelect({
      flags: {
        flag: [({$$text}) => $$text.trim().toLowerCase() === 'true']
      }
    }, false, false);

    expect(betterResult).toEqual({
      flags: {
        flag: [true, false, false, false]
      }
    });
  });

  test('Boolean transformer should handle various truthy/falsy formats', () => {
    const engine = new IncomingXMLParserSelectorEngine();
    engine.add(`
      <flags>
        <flag>true</flag>
        <flag>false</flag>
        <flag>yes</flag>
        <flag>no</flag>
        <flag>  TRUE  </flag>
        <flag>  FALSE  </flag>
        <flag>null</flag>
        <flag></flag>
        <flag>   </flag>
        <flag>anything else</flag>
        <flag>0</flag>
        <flag>0.00</flag>
        <flag>1</flag>
      </flags>
    `);

    const result = engine.mapSelect({
      flags: {
        flag: [Boolean]
      }
    });

    expect(result).toEqual({
      flags: {
        flag: [
          true,    // "true"
          false,   // "false" 
          true,    // "yes"
          false,   // "no"
          true,    // "  TRUE  "
          false,   // "  FALSE  "
          false,   // "null"
          false,   // empty
          false,   // whitespace only
          true,    // any other non-empty string
          false,    // "0"
          false,    // "0.00"
          true     // "1"
        ]
      }
    });
  });
}); 