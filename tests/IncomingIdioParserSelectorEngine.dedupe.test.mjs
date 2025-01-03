import IncomingIdioParserSelectorEngine from '../src/parsers/IncomingIdioParserSelectorEngine.mjs';

describe('IncomingIdioParserSelectorEngine Dedupe', () => {
  let engine;

  beforeEach(() => {
    engine = new IncomingIdioParserSelectorEngine();
  });

  test('dedupeSelect should only return new elements as Idio syntax is parsed', () => {
    engine.add('@START(tag1)Content1@END(tag1)');
    
    let result = engine.dedupeSelect('tag1');
    expect(result).toHaveLength(1);
    expect(result[0].$$text).toBe('Content1');
    
    // Subsequent call should return no elements, since tag1 was already returned
    result = engine.dedupeSelect('tag1');
    expect(result).toHaveLength(0);

    // Add a new tag
    engine.add('@START(tag2)Content2@END(tag2)');

    // Should return the new tag
    result = engine.dedupeSelect('tag2');
    expect(result).toHaveLength(1);
    expect(result[0].$$text).toBe('Content2');
  });

  test('dedupeSelect should handle streaming input with partial tags', () => {
    engine.add('@START(tag)');
    let result = engine.dedupeSelect('tag');
    expect(result).toHaveLength(0); // Tag is not closed yet

    engine.add('Some content');
    result = engine.dedupeSelect('tag');
    expect(result).toHaveLength(0); // Still not closed

    engine.add('@END(tag)');
    result = engine.dedupeSelect('tag');
    expect(result).toHaveLength(1);
    expect(result[0].$$text).toBe('Some content');

    // Subsequent call should return no elements
    result = engine.dedupeSelect('tag');
    expect(result).toHaveLength(0);
  });

  test('dedupeSelect should handle nested tags', () => {
    engine.add('@START(parent)@START(child)Child content@END(child)');
    
    let result = engine.dedupeSelect('child');
    expect(result).toHaveLength(1);
    expect(result[0].$$text).toBe('Child content');
    
    engine.add('@START(child)Another child@END(child)@END(parent)');
    
    // Should only return the new child
    result = engine.dedupeSelect('child');
    expect(result).toHaveLength(1);
    expect(result[0].$$text).toBe('Another child');
    
    // Now, dedupeSelect for parent should return the parent node
    result = engine.dedupeSelect('parent');
    expect(result).toHaveLength(1);
    expect(result[0].$$text.replace(/\s/g, '')).toBe('Child contentAnother child'.replace(/\s/g, ''));
    
    // Subsequent calls should return nothing
    result = engine.dedupeSelect('child');
    expect(result).toHaveLength(0);
    result = engine.dedupeSelect('parent');
    expect(result).toHaveLength(0);
  });

  test('dedupeSelect should handle multiple calls without adding new content', () => {
    engine.add('@START(tag)Content@END(tag)');
    
    let result = engine.dedupeSelect('tag');
    expect(result).toHaveLength(1);
    
    // Multiple subsequent calls
    result = engine.dedupeSelect('tag');
    expect(result).toHaveLength(0);
    result = engine.dedupeSelect('tag');
    expect(result).toHaveLength(0);
  });

  test('dedupeSelect should include open tags when includeOpenTags is true', () => {
    engine.add('@START(openTag)');
    let result = engine.dedupeSelect('openTag', true);
    expect(result).toHaveLength(1);
    expect(result[0].$$text).toBe('');

    engine.add('Some content');
    result = engine.dedupeSelect('openTag', true);
    expect(result).toHaveLength(1);
    expect(result[0].$$text).toBe('Some content');

    engine.add('@END(openTag)');
    result = engine.dedupeSelect('openTag', true);
    expect(result).toHaveLength(1);
    expect(result[0].$$text).toBe('Some content');
  });

  test('dedupeSelect should not include open tags when includeOpenTags is false', () => {
    engine.add('@START(openTag)');
    let result = engine.dedupeSelect('openTag', false);
    expect(result).toHaveLength(0);

    engine.add('Some content');
    result = engine.dedupeSelect('openTag', false);
    expect(result).toHaveLength(0);

    engine.add('@END(openTag)');
    result = engine.dedupeSelect('openTag', false);
    expect(result).toHaveLength(1);
    expect(result[0].$$text).toBe('Some content');
  });

  test('dedupeSelect should handle tags with the same name', () => {
    engine.add('@START(tag)First instance@END(tag)');
    engine.add('@START(tag)Second instance@END(tag)');

    let result = engine.dedupeSelect('tag');
    expect(result).toHaveLength(2);
    expect(result[0].$$text).toBe('First instance');
    expect(result[1].$$text).toBe('Second instance');

    // Subsequent call should return nothing
    result = engine.dedupeSelect('tag');
    expect(result).toHaveLength(0);
  });

  test('dedupeSelect should handle interleaved tags', () => {
    engine.add('@START(a)Content A1@END(a)@START(b)Content B1@END(b)');
    engine.add('@START(a)Content A2@END(a)@START(b)Content B2@END(b)');

    let resultA = engine.dedupeSelect('a');
    expect(resultA).toHaveLength(2);
    expect(resultA[0].$$text).toBe('Content A1');
    expect(resultA[1].$$text).toBe('Content A2');

    let resultB = engine.dedupeSelect('b');
    expect(resultB).toHaveLength(2);
    expect(resultB[0].$$text).toBe('Content B1');
    expect(resultB[1].$$text).toBe('Content B2');
  });

  test('dedupeSelect should handle deeply nested structures', () => {
    engine.add('@START(root)@START(level1)@START(level2)Deep content@END(level2)@END(level1)@END(root)');

    let result = engine.dedupeSelect('level2');
    expect(result).toHaveLength(1);
    expect(result[0].$$text).toBe('Deep content');

    // 'root' and 'level1' should also be deduped accordingly
    result = engine.dedupeSelect('root');
    expect(result).toHaveLength(1);
    // We can check that the text includes 'Deep content'
    expect(result[0].$$text.replace(/\s/g, '')).toContain('Deepcontent');
  });
});