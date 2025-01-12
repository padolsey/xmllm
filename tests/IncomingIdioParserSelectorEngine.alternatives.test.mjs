import IncomingIdioParserSelectorEngine from '../src/parsers/IncomingIdioParserSelectorEngine.mjs';

describe('IncomingIdioParserSelectorEngine Alternative Syntax', () => {

  test('should accept any combination of configured syntax elements', () => {
    const engine = new IncomingIdioParserSelectorEngine({
      tagOpener: ['START(', 'START<'],
      tagCloser: ['END(', 'END<'],
      tagSuffix: [')', '>']
    });

    // Test all possible combinations
    const combinations = [
      '@START(tag)content1@END(tag)',      // First syntax set
      '@START<tag>content2@END<tag>',      // Second syntax set
      '@START(tag>content3@END(tag>',      // Mixed suffix
      '@START<tag)content4@END<tag)',      // Alternative mixed suffix
      '@START(tag)content5@END<tag>',      // Mixed braces
      '@START<tag>content6@END(tag)'       // Alternative mixed braces
    ];
    
    const found = [];

    for (const input of combinations) {
      engine.add(input);
      const result = engine.dedupeSelect('tag');
      found.push(result?.[0]);
      expect(result[result.length - 1].$$text).toMatch(/content\d/);
    }

    expect(found).toHaveLength(combinations.length);
    expect(found.map(r => r.$$text)).toEqual(
      ['content1', 'content2', 'content3', 'content4', 'content5', 'content6']
    );
  });

  test('should handle streaming with partial markers of different alternative syntaxes', () => {
    const engine = new IncomingIdioParserSelectorEngine({
      openTagPrefix: ['@'],
      closeTagPrefix: ['@'],
      tagOpener: ['START(', 'START<'],
      tagCloser: ['END(', 'END<'],
      tagSuffix: [')', '>']
    });
    
    console.log('Initial state');
    engine.add('@ST');
    console.log('After @ST:', {
      buffer: engine.buffer,
      position: engine.position,
      parsedData: engine.parsedData
    });

    engine.add('ART<stream');
    console.log('After ART<stream:', {
      buffer: engine.buffer,
      position: engine.position,
      parsedData: engine.parsedData
    });

    engine.add('>some text@');
    console.log('After >some text@:', {
      buffer: engine.buffer,
      position: engine.position,
      parsedData: engine.parsedData
    });

    engine.add('END(stream>');
    console.log('After END(stream>:', {
      buffer: engine.buffer,
      position: engine.position,
      parsedData: engine.parsedData,
      openElements: engine.openElements
    });
    
    const result = engine.select('stream');
    console.log('Final result:', result);
    expect(result).toHaveLength(1);
    expect(result[0].$$text).toBe('some text');
  });

  test('should use first syntax set for scaffolding', () => {
    const engine = new IncomingIdioParserSelectorEngine({
      tagOpener: ['START(', 'START<'],
      tagCloser: ['END(', 'END<'],
      tagSuffix: [')', '>']
    });

    const openTag = (new IncomingIdioParserSelectorEngine()).GEN_OPEN_TAG('test');
    const closeTag = (new IncomingIdioParserSelectorEngine()).GEN_CLOSE_TAG('test');

    expect(openTag).toBe('@START(test)');
    expect(closeTag).toBe('@END(test)');
  });

  test('should handle streaming input with mixed syntax', () => {
    const engine = new IncomingIdioParserSelectorEngine({
      tagOpener: ['START(', 'START<'],
      tagCloser: ['END(', 'END<'],
      tagSuffix: [')', '>']
    });

    engine.add('@START(first>');
    engine.add('content1');
    engine.add('@END<first)');
    engine.add('@START<second)');
    engine.add('content2');
    engine.add('@END(second>');

    const results = engine.select('first');
    expect(results).toHaveLength(1);
    expect(results[0].$$text).toBe('content1');

    const results2 = engine.select('second');
    expect(results2).toHaveLength(1);
    expect(results2[0].$$text).toBe('content2');
  });

  test('should handle nested tags with mixed syntax', () => {
    const engine = new IncomingIdioParserSelectorEngine({
      tagOpener: ['START(', 'START<'],
      tagCloser: ['END(', 'END<'],
      tagSuffix: [')', '>']
    });

    engine.add(`
      @START(parent>
        @START<child1)First@END(child1>
        @START(child2>Second@END<child2)
      @END<parent)
    `);

    const parent = engine.select('parent');
    expect(parent).toHaveLength(1);
    expect(parent[0].child1[0].$$text.trim()).toBe('First');
    expect(parent[0].child2[0].$$text.trim()).toBe('Second');
  });

  test('should handle @ in text content across chunk boundaries', () => {
    const engine = new IncomingIdioParserSelectorEngine({
      openTagPrefix: ['@'],
      closeTagPrefix: ['@'],
      tagOpener: ['START(', 'START<'],
      tagCloser: ['END(', 'END<'],
      tagSuffix: [')', '>']
    });

    engine.add('@START<test>');
    engine.add('james@');
    engine.add('gmail.com');
    engine.add('@END<test>');

    const result = engine.select('test');
    expect(result).toHaveLength(1);
    expect(result[0].$$text).toBe('james@gmail.com');
  });
});