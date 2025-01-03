import IncomingXMLParserSelectorEngine from '../src/parsers/IncomingXMLParserSelectorEngine';

describe('IncomingXMLParserSelectorEngine Malformed XML Handling', () => {
  let engine;

  beforeEach(() => {
    engine = new IncomingXMLParserSelectorEngine();
  });

  test('should handle extra angle brackets', () => {
    engine.add(`
      < `);
    engine.add(`<event>
        <title>Announcement</title>
        <details>Some details</details>
      </event>
    `);

    const result = engine.mapSelect({
      event: {
        title: String,
        details: String
      }
    });

    // Should ignore the stray < and parse the valid XML
    expect(result).toEqual({
      event: {
        title: 'Announcement',
        details: 'Some details'
      }
    });
  });

  test('should handle incomplete/malformed attributes', () => {
    engine.add(`
      <person name="John" age= role="admin" status=>
        <data value=>Content</data>
        <info something"invalid">More content</info>
      </person>
    `);

    const result = engine.mapSelect({
      person: {
        $name: String,
        $age: String,
        $role: String,
        $status: String,
        data: {
          $value: String,
          $$text: String
        },
        info: {
          $something: String,
          $$text: String
        }
      }
    });

    // htmlparser2 will do its best to salvage what it can
    expect(result.person.$name).toBe('John');
    expect(result.person.data.$$text).toBe('Content');
    expect(result.person.info.$$text).toBe('More content');
  });

  test('should handle mixed and nested angle brackets', () => {
    engine.add(`
      <math>
        2 < 3 && 5 > 4
        if (x < 10) { doThing() }
        <result>true</result>
      </math>
    `);

    const result = engine.select('math');
    expect(result[0].$$text).toContain('2 < 3');
    expect(result[0].$$text).toContain('5 > 4');
    expect(result[0].$$text).toContain('if (x < 10)');
    expect(result[0].result[0].$$text).toBe('true');
  });

  test('should handle LLM thinking tokens mixed with XML', () => {
    engine.add(`
      Let me think about this...
      <response>
        Here's what I found:
        <item>First thing</item>
        Hmm, what else...
        <item>Second thing</item>
      </response>
    `);

    const result = engine.mapSelect({
      response: {
        item: [String]
      }
    });

    expect(result).toEqual({
      response: {
        item: ['First thing', 'Second thing']
      }
    });
  });

  test('should handle incomplete tags and recover', () => {
    engine.add('<root><item>First</item><item>Second<item>Third</item></root>');

    const result = engine.mapSelect({
      root: {
        item: [String]
      }
    });

    // htmlparser2 will try to make sense of the structure
    expect(result.root.item).toContain('First');
    expect(result.root.item).toContain('SecondThird');

    // Let's add a more realistic example that shows proper recovery
    engine.add('<root><item>One</item><item>Two</item><item>Three');
    const result2 = engine.mapSelect({
      root: {
        item: [String]
      }
    });
    expect(result2.root.item).toEqual(['One', 'Two', 'Three']);
  });

  test('should handle CDATA and script-like content', () => {
    engine.add(`
      <root>
        <![CDATA[
          function test() {
            if (x < 3) {
              return true;
            }
          }
        ]]>
        <code>
          const x = () => {
            return <div>JSX Content</div>;
          }
        </code>
      </root>
    `);

    const result = engine.select('root');
    expect(result[0].$$text).toContain('function test()');
    expect(result[0].$$text).toContain('if (x < 3)');
    expect(result[0].code[0].$$text).toContain('const x = ()');
  });

  test('should handle random line breaks and whitespace in tags', () => {
    engine.add(`
      <root
        >
        <item
          id="1"
          >Content</item
        >
        <item
          id="2"
          
          >More content</
          item>
      </root
      >
    `);

    const result = engine.mapSelect({
      root: {
        item: [{
          $id: String,
          $$text: String
        }]
      }
    });

    expect(result.root.item).toEqual([
      { $id: '1', $$text: 'Content' },
      { $id: '2', $$text: 'More content' }
    ]);
  });
});