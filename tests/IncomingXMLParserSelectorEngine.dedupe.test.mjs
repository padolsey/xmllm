import IncomingXMLParserSelectorEngine from '../src/IncomingXMLParserSelectorEngine';

describe('IncomingXMLParserSelectorEngine Dedupe', () => {
  let engine;

  beforeEach(() => {
    engine = new IncomingXMLParserSelectorEngine();
  });

  test('dedupeSelect should only return new elements as XML is parsed', () => {
    engine.add('<root><item>1</item><item>2</item>');
    
    const firstResult = engine.dedupeSelect('item');
    expect(firstResult).toHaveLength(2);
    expect(firstResult.map(item => item.text)).toEqual(['1', '2']);
    
    engine.add('<item> 3');
    engine.add(' </item>');
    
    const secondResult = engine.dedupeSelect('item');
    expect(secondResult).toHaveLength(1);
    expect(secondResult[0].text).toBe(' 3 ');
    
    engine.add('<item>4</item></root>');
    
    const thirdResult = engine.dedupeSelect('item');
    expect(thirdResult).toHaveLength(1);
    expect(thirdResult[0].text).toBe('4');
    
    const fourthResult = engine.dedupeSelect('item');
    expect(fourthResult).toHaveLength(0);
  });

  test('dedupeSelect should maintain state across multiple XML chunks', () => {
    engine.add('<root><item>First</item><item>Second</item>');
    
    const firstResult = engine.dedupeSelect('item');
    expect(firstResult).toHaveLength(2);
    expect(firstResult.map(item => item.text)).toEqual(['First', 'Second']);
    
    const secondResult = engine.dedupeSelect('item');
    expect(secondResult).toHaveLength(0);
    
    engine.add('<item>Third</item><item>Fourth</item></root>');
    
    const thirdResult = engine.dedupeSelect('item');
    expect(thirdResult).toHaveLength(2);
    expect(thirdResult.map(item => item.text)).toEqual(['Third', 'Fourth']);
    
    const fourthResult = engine.dedupeSelect('item');
    expect(fourthResult).toHaveLength(0);
    
    const allItems = engine.select('item');
    expect(allItems).toHaveLength(4);
    expect(allItems.map(item => item.text)).toEqual(['First', 'Second', 'Third', 'Fourth']);
  });

  test('dedupeSelect should handle streaming XML with partial and complete elements', () => {
    engine.add('<root><item id="1">');
    let result = engine.dedupeSelect('item');
    expect(result).toHaveLength(0); // Item is not closed yet
    
    engine.add('First item</item><item id="2">Second ');
    result = engine.dedupeSelect('item');
    expect(result).toHaveLength(1); // Only the completed first item
    expect(result[0].attr.id).toBe('1');
    expect(result[0].text).toBe('First item');
    
    engine.add('item</item><item id="3">');
    result = engine.dedupeSelect('item');
    expect(result).toHaveLength(1); // Only the completed second item
    expect(result[0].attr.id).toBe('2');
    expect(result[0].text).toBe('Second item');
    
    engine.add('Third item</item></root>');
    result = engine.dedupeSelect('item');
    expect(result).toHaveLength(1); // Only the completed third item
    expect(result[0].attr.id).toBe('3');
    expect(result[0].text).toBe('Third item');
    
    result = engine.dedupeSelect('item');
    expect(result).toHaveLength(0);
    
    result = engine.select('item');
    expect(result).toHaveLength(3);
  });

  test('dedupeSelect should handle nested elements correctly', () => {
    engine.add('<root><item nested="true"><item>Nested</item></item><item>Sibling</item></root>');
    
    const result = engine.dedupeSelect('item');
    expect(result).toHaveLength(3);
    expect(result.map(item => ({text: item.text.trim(), nested: item.attr.nested}))).toEqual([
      {text: 'Nested', nested: 'true'},
      {text: 'Nested', nested: undefined},
      {text: 'Sibling', nested: undefined}
    ]);
    
    const secondResult = engine.dedupeSelect('item');
    expect(secondResult).toHaveLength(0);
  });

  test('dedupeSelect should handle open tags correctly when includeOpenTags is true', () => {
    engine.add('<root><item>1</item><item>2<subitem>');
    
    let result = engine.dedupeSelect('item', true);
    expect(result).toHaveLength(2);
    expect(result.map(item => item.text)).toEqual(['1', '2']);
    
    engine.add('sub');
    result = engine.dedupeSelect('item', true);
    expect(result).toHaveLength(1);  // Only the updated open tag
    expect(result[0].text).toBe('2sub');
    
    engine.add('</subitem></item><item>3</item>');
    
    result = engine.dedupeSelect('item', true);
    expect(result).toHaveLength(2);  // The now-closed tag and the new tag
    expect(result.map(item => item.text)).toEqual(['2sub', '3']);
    
    // No changes, so no results
    result = engine.dedupeSelect('item', true);
    expect(result).toHaveLength(0);
  });

  test('dedupeSelect should update open tags as they are completed', () => {
    engine.add('<root><item id="1">Start');
    
    let result = engine.dedupeSelect('item', true);
    expect(result).toHaveLength(1);
    expect(result[0].text).toBe('Start');
    
    engine.add(' Middle');
    result = engine.dedupeSelect('item', true);
    expect(result).toHaveLength(1);
    expect(result[0].text).toBe('Start Middle');
    
    engine.add(' End</item>');
    result = engine.dedupeSelect('item', true);
    expect(result).toHaveLength(1);
    expect(result[0].text).toBe('Start Middle End');
  });

  test('dedupeSelect should handle siblings and nested elements with open tags', () => {
    engine.add('<root><item id="1"><subitem>Sub 1');
    
    let result = engine.dedupeSelect('item', true);
    expect(result).toHaveLength(1);
    expect(result[0].attr.id).toBe('1');
    expect(result[0].text).toBe('Sub 1');
    
    engine.add('</subitem></item><item id="2"><subitem>Sub 2</subitem>');
    
    result = engine.dedupeSelect('item', true);
    expect(result).toHaveLength(2);  // Both items should be returned
    expect(result[0].attr.id).toBe('1');  // First item is now closed
    expect(result[0].text).toBe('Sub 1');
    expect(result[1].attr.id).toBe('2');
    expect(result[1].text).toBe('Sub 2');
    
    result = engine.dedupeSelect('subitem', true);
    expect(result).toHaveLength(2);
    expect(result.map(item => item.text)).toEqual(['Sub 1', 'Sub 2']);
    
    // Additional check to ensure no more selections are made
    result = engine.dedupeSelect('item', true);
    expect(result).toHaveLength(0);
    
    result = engine.dedupeSelect('subitem', true);
    expect(result).toHaveLength(0);
  });
});