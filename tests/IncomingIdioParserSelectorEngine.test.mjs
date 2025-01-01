import IncomingIdioParserSelectorEngine from '../src/parsers/IncomingIdioParserSelectorEngine.mjs';

describe('IncomingIdioParserSelectorEngine', () => {
  let engine;
 
  beforeEach(() => {
    engine = new IncomingIdioParserSelectorEngine();
  });
 
  test('should parse simple nodes with content', () => {
    engine.add('⁂START(greeting)hello world⁂END(greeting)');
    const result = engine.select('greeting');
    expect(result).toHaveLength(1);
    expect(result[0].$text).toBe('hello world');
  });
 
  test('should parse nested nodes', () => {
    engine.add(`⁂START(document)
 ⁂START(header)Title here⁂END(header)
 ⁂START(body)Content here⁂END(body)
 ⁂END(document)`);
    
    const doc = engine.select('document');
    expect(doc).toHaveLength(1);
    expect(doc[0].header[0].$text).toBe('Title here');
    expect(doc[0].body[0].$text).toBe('Content here');
  });
 
  test('should handle multiline content', () => {
    engine.add(`⁂START(code)def hello():
    return "world"⁂END(code)`);
    
    const result = engine.select('code');
    expect(result[0].$text).toBe('def hello():\n    return "world"');
  });
 
  test('should handle streaming input', () => {
    engine.add('⁂START(test)');
    let result = engine.select('test');
    expect(result).toHaveLength(0);
 
    engine.add('partial content');
    result = engine.select('test');
    expect(result).toHaveLength(0);
 
    engine.add('⁂END(test)');
    result = engine.select('test');
    expect(result).toHaveLength(1);
    expect(result[0].$text).toBe('partial content');
  });
 
  test('should handle streaming with partial markers', () => {
    engine.add('⁂ST');
    engine.add('ART(stream');
    engine.add(')some text⁂');
    engine.add('END(stream)');
    
    const result = engine.select('stream');
    expect(result).toHaveLength(1);
    expect(result[0].$text).toBe('some text');
  });
 
  test('should aggregate all text including between child nodes', () => {
    engine.add(`⁂START(parent)
    Start text
    ⁂START(child)middle⁂END(child)
    End text
    ⁂END(parent)`);
    
    const result = engine.select('parent');
    expect(result[0].$text.replace(/\s/g, '')).toBe('Start text\n    middle\n    End text'.replace(/\s/g, ''));
    expect(result[0].child[0].$text).toBe('middle');
  });
 
  test('should ignore unmatched end tags', () => {
    engine.add('⁂END(random)⁂START(real)content⁂END(real)⁂END(extra)');
    const result = engine.select('real');
    expect(result).toHaveLength(1);
    expect(result[0].$text).toBe('content');
  });
 
  test('should handle corrupted or partial markers', () => {
    // Partial START marker - treat as text
    engine.add('text ⁂STA stuff ⁂START(node)content⁂END(node)');
    expect(engine.select('node')[0].$text).toBe('content');
    
    // Corrupted END marker - best effort matching
    engine.add('⁂START(node)content⁂ENDnode)');
    expect(engine.select('node')[0].$text).toBe('content');
  });
 
  test('should handle empty nodes and whitespace', () => {
    engine.add('⁂START(empty)⁂END(empty)');
    expect(engine.select('empty')[0].$text).toBe('');
    
    engine.add('⁂START(space)   ⁂END(space)');
    expect(engine.select('space')[0].$text).toBe('   ');
    
    engine.add('⁂START(spaces)  \n  \t  ⁂END(spaces)');
    expect(engine.select('spaces')[0].$text).toBe('  \n  \t  ');
  });
 
  test('should handle nested identical node names', () => {
    engine.add(`⁂START(div)
    outer
    ⁂START(div)
      inner
      ⁂START(div)deepest⁂END(div)
    ⁂END(div)
  ⁂END(div)`);
    
    const result = engine.select('div');
    expect(result).toHaveLength(3);
    expect(result[0].div).toHaveLength(1);
    expect(result[0].div[0].div).toHaveLength(1);
    expect(result[0].div[0].div[0].$text).toBe('deepest');
  });
 
  test('should handle complex selectors', () => {
    engine.add(`⁂START(root)
    ⁂START(a)⁂START(b)⁂START(c)deep⁂END(c)⁂END(b)⁂END(a)
    ⁂START(x)⁂START(b)other⁂END(b)⁂END(x)
  ⁂END(root)`);
    
    expect(engine.select('root a b c')[0].$text).toBe('deep');
    expect(engine.select('root x b')[0].$text).toBe('other');
    expect(engine.select('root b')).toHaveLength(2);
    expect(engine.select('nonexistent')).toHaveLength(0);
    expect(engine.select('')).toHaveLength(0);
  });
 
  test('should handle unicode in content', () => {
    engine.add('⁂START(unicode)こんにちは世界🌏⁂END(unicode)');
    const result = engine.select('unicode');
    expect(result[0].$text).toBe('こんにちは世界🌏');
  });
});