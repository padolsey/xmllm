import IncomingIdioParserSelectorEngine from '../src/parsers/IncomingIdioParserSelectorEngine.mjs';

describe('IncomingIdioParserSelectorEngine', () => {
  let engine;
 
  beforeEach(() => {
    engine = new IncomingIdioParserSelectorEngine();
  });
 
  test('should parse simple nodes with content', () => {
    engine.add('@START(greeting)hello world@END(greeting)');
    const result = engine.select('greeting');
    expect(result).toHaveLength(1);
    expect(result[0].$$text).toBe('hello world');
  });
 
  test('should parse nested nodes', () => {
    engine.add(`@START(document)
 @START(header)Title here@END(header)
 @START(body)Content here@END(body)
 @END(document)`);
    
    const doc = engine.select('document');
    expect(doc).toHaveLength(1);
    expect(doc[0].header[0].$$text).toBe('Title here');
    expect(doc[0].body[0].$$text).toBe('Content here');
  });
 
  test('should handle multiline content', () => {
    engine.add(`@START(code)def hello():
    return "world"@END(code)`);
    
    const result = engine.select('code');
    expect(result[0].$$text).toBe('def hello():\n    return "world"');
  });

  test('should handle many nested lists', () => {
    engine.add(`@START(list)
      @START(sublist)
        @START(item)item 1@END(item)
        @START(item)item 2@END(item)
      @END(sublist)
      @START(sublist)
        @START(item)item 3@END(item)
        @START(item)item 4@END(item)
      @END(sublist)
    @END(list)`);

    const result = engine.select('list');
    expect(result[0].sublist[0].item[0].$$text).toBe('item 1');
    expect(result[0].sublist[0].item[1].$$text).toBe('item 2');
    expect(result[0].sublist[1].item[0].$$text).toBe('item 3');
    expect(result[0].sublist[1].item[1].$$text).toBe('item 4');
  });
 
  test('should handle streaming input', () => {
    engine.add('@START(test)');
    let result = engine.select('test');
    expect(result).toHaveLength(0);
 
    engine.add('partial content');
    result = engine.select('test');
    expect(result).toHaveLength(0);
 
    engine.add('@END(test)');
    result = engine.select('test');
    expect(result).toHaveLength(1);
    expect(result[0].$$text).toBe('partial content');
  });
 
  test('should handle streaming with partial markers', () => {
    engine.add('@ST');
    engine.add('ART(stream');
    engine.add(')some text@');
    engine.add('END(stream)');
    
    const result = engine.select('stream');
    expect(result).toHaveLength(1);
    expect(result[0].$$text).toBe('some text');
  });
 
  test('should aggregate all text including between child nodes', () => {
    engine.add(`@START(parent)
    Start text
    @START(child)middle@END(child)
    End text
    @END(parent)`);
    
    const result = engine.select('parent');
    expect(result[0].$$text.replace(/\s/g, '')).toBe('Start text\n    middle\n    End text'.replace(/\s/g, ''));
    expect(result[0].child[0].$$text).toBe('middle');
  });
 
  test('should ignore unmatched end tags', () => {
    engine.add('@END(random)@START(real)content@END(real)@END(extra)');
    const result = engine.select('real');
    expect(result).toHaveLength(1);
    expect(result[0].$$text).toBe('content');
  });
 
  test('should handle corrupted or partial markers', () => {
    // Partial START marker - treat as text
    engine.add('text @STA stuff @START(node)content@END(node)');
    expect(engine.select('node')[0].$$text).toBe('content');
    
    // Corrupted END marker - best effort matching
    engine.add('@START(node)content@ENDnode)');
    expect(engine.select('node')[0].$$text).toBe('content');
  });
 
  test('should handle empty nodes and whitespace', () => {
    engine.add('@START(empty)@END(empty)');
    expect(engine.select('empty')[0].$$text).toBe('');
    
    engine.add('@START(space)   @END(space)');
    expect(engine.select('space')[0].$$text).toBe('   ');
    
    engine.add('@START(spaces)  \n  \t  @END(spaces)');
    expect(engine.select('spaces')[0].$$text).toBe('  \n  \t  ');
  });
 
  test('should handle nested identical node names', () => {
    engine.add(`@START(div)
    outer
    @START(div)
      inner
      @START(div)deepest@END(div)
    @END(div)
  @END(div)`);
    
    const result = engine.select('div');
    expect(result).toHaveLength(3);
    expect(result[0].div).toHaveLength(1);
    expect(result[0].div[0].div).toHaveLength(1);
    expect(result[0].div[0].div[0].$$text).toBe('deepest');
  });
 
  test('should handle complex selectors', () => {
    engine.add(`@START(root)
    @START(a)@START(b)@START(c)deep@END(c)@END(b)@END(a)
    @START(x)@START(b)other@END(b)@END(x)
  @END(root)`);
    
    expect(engine.select('root a b c')[0].$$text).toBe('deep');
    expect(engine.select('root x b')[0].$$text).toBe('other');
    expect(engine.select('root b')).toHaveLength(2);
    expect(engine.select('nonexistent')).toHaveLength(0);
    expect(engine.select('')).toHaveLength(0);
  });
 
  test('should handle unicode in content', () => {
    engine.add('@START(unicode)こんにちは世界🌏@END(unicode)');
    const result = engine.select('unicode');
    expect(result[0].$$text).toBe('こんにちは世界🌏');
  });

  return; // not doing these currently:
 
  test('should handle malformed attribute nodes resiliently', () => {
    engine.add(`@START(person)
      @START(@name)james
      @START(@age)30
      @START(@title)mr
      some other content
      @END(person)`);

    const result = engine.select('person');
    expect(result).toHaveLength(1);
    expect(result[0].$$attr).toEqual({
      name: 'james\n      ',
      age: '30\n      ',
      title: 'mr\n      some other content\n      '
    });
  });

  test('should handle nested content in attributes by ignoring it', () => {
    engine.add(`@START(user)
      @START(@role)admin
        @START(nested)this should be ignored@END(nested)
      @END(@role)
      @END(user)`);

    const result = engine.select('user');
    expect(result).toHaveLength(1);
    expect(result[0].$$attr).toEqual({
      role: 'admin\n        '
    });
  });

  test('should handle interleaved attributes', () => {
    engine.add(`@START(item)
      @START(@type)book
      @START(@id)123
      @START(@status)active
      @END(@status)
      content here
      @END(item)`);

    const result = engine.select('item');
    expect(result).toHaveLength(1);
    expect(result[0].$$attr).toEqual({
      type: 'book\n      ',
      id: '123\n      ',
      status: 'active\n      '
    });
    expect(result[0].$$text.trim()).toBe('content here');
  });

  test('should handle attribute nodes without proper closure', () => {
    engine.add(`@START(product)
      @START(@price)99.99
      @START(description)A great product@END(description)
      @END(product)`);

    const result = engine.select('product');
    expect(result).toHaveLength(1);
    expect(result[0].$$attr).toEqual({
      price: '99.99\n      '
    });
    expect(result[0].description[0].$$text).toBe('A great product');
  });

});

describe('Forum-style Syntax', () => {
  test('should support forum-style syntax with === markers', () => {
    const engine = new IncomingIdioParserSelectorEngine({
      openTagPrefix: ['='],
      closeTagPrefix: ['='],
      tagOpener: ['=='],      // Just empty string for opening tags
      tagCloser: ['==/'],     // Just '/' for closing tags
      tagSuffix: ['===']
    });

    engine.add(`===parent===
      ===child===
        Hello world!
      ===/child===
    ===/parent===`);

    const result = engine.select('parent');
    expect(result).toHaveLength(1);
    expect(result[0].child[0].$$text.trim()).toBe('Hello world!');
  });

  test('should handle forum-style syntax with streaming input', () => {
    const engine = new IncomingIdioParserSelectorEngine({
      openTagPrefix: ['='],
      closeTagPrefix: ['='],
      tagOpener: ['=='],      // Just empty string for opening tags
      tagCloser: ['==/'],     // Just '/' for closing tags
      tagSuffix: ['===']
    });

    // Split across boundaries
    engine.add('===pa');
    engine.add('rent===');
    engine.add('  ===ch');
    engine.add('ild===');
    engine.add('    Hello!');
    engine.add('  ===/chi');
    engine.add('ld===');
    engine.add('===/parent===');

    const result = engine.select('parent');
    expect(result).toHaveLength(1);
    expect(result[0].child[0].$$text.trim()).toBe('Hello!');
  });

  test('should handle forum-style syntax with different markers', () => {
    const engine = new IncomingIdioParserSelectorEngine({
      openTagPrefix: ['['],
      closeTagPrefix: ['['],
      tagOpener: ['[['],
      tagCloser: ['[[/'],
      tagSuffix: [']]]']
    });

    engine.add(`[[[section]]]
      [[[title]]]Hello[[[/title]]]
      [[[body]]]Content[[[/body]]]
    [[[/section]]]`);

    const result = engine.select('section');
    expect(result).toHaveLength(1);
    expect(result[0].title[0].$$text).toBe('Hello');
    expect(result[0].body[0].$$text).toBe('Content');
  });

  test('should handle variable length syntax parts', () => {
    const engine = new IncomingIdioParserSelectorEngine({
      openTagPrefix: ['opening node called '],
      closeTagPrefix: ['closing '],
      tagOpener: [''],
      tagCloser: [''],
      tagSuffix: ['.']
    });

    engine.add(`
      opening node called foo.
        hello world 999!
        opening node called child.
          child content
        closing child.
      closing foo.
    `);
    const result = engine.select('foo');
    expect(result).toHaveLength(1);
    expect(result[0].$$text.trim()).toContain('hello world 999!');
    expect(result[0].child[0].$$text.trim()).toBe('child content');
  });

  test('alternative syntaxes of different lengths (chaos)', () => { 
    const engine = new IncomingIdioParserSelectorEngine({
      openTagPrefix: ['$$', '%', '££'],
      closeTagPrefix: ['<<', '________'],
      tagOpener: ['Open:', 'Up:', 'Wow:'],
      tagCloser: ['Close:'],
      tagSuffix: ['.']
    });

    engine.add(`$$Open:person.
      the person
      %Up:name.
      bob
      <<Close:name.
      ££Wow:fact.
      they love`);

    const currentResult = engine.select('person fact', true); // open tags
    expect(currentResult).toHaveLength(1);
    expect(currentResult[0].$$text.trim()).toBe('they love');

    engine.add(` honey<<Close:fact.
      44444
      _________Close:person.
      5`);

    const nextResult = engine.select('person fact', false);
    expect(nextResult).toHaveLength(1);
    expect(nextResult[0].$$text.trim()).toBe('they love honey');
  });
});

