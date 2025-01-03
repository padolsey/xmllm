import IncomingXMLParserSelectorEngine from '../src/parsers/IncomingXMLParserSelectorEngine';

describe('IncomingXMLParserSelectorEngine Dedupe', () => {
  let engine;

  beforeEach(() => {
    engine = new IncomingXMLParserSelectorEngine();
  });

  test('dedupeSelect should only return new elements as XML is parsed, including only returning _new_ descendents', () => {
    engine.add('<root><item>1</item><item>2</item>');
    
    let rootResult = engine.dedupeSelect('root', true);

    expect(rootResult).toHaveLength(1);
    expect(rootResult[0].item.map(i => i.$$text)).toEqual(['1', '2']);
    expect(rootResult[0].$$text).toBe('12');
    
    engine.add('<item> NEW THING');
    engine.add(' </item>');
    
    rootResult = engine.dedupeSelect('root', true);

    console.log('rootResult>>>>', rootResult);
    expect(rootResult).toHaveLength(1);
    expect(rootResult[0].$$text).toBe('12 NEW THING ');
    expect(rootResult[0].item.map(i => i.$$text)).toEqual(['1', '2', ' NEW THING ']);
  });


  // return;
  test('dedupeSelect should only return new elements as XML is parsed, but can return existing descendents optionally', () => {
    engine.add('<root><item>1</item><item>2</item>');
    
    let rootResult = engine.dedupeSelect('root', true, false);

    expect(rootResult).toHaveLength(1);
    console.log('rootResult>>>>', rootResult);
    
    expect(rootResult[0].item.map(i => i.$$text)).toEqual(['1', '2']);
    expect(rootResult[0].$$text).toBe('12');
    
    engine.add('<item> NEW THING');
    engine.add(' </item>');

    console.log('Here888');
    
    // Now we are asking for root with with open tags included, but for
    // it not to dedupe children meanind we are okay to recieve the 
    // same stuff we have before:
    rootResult = engine.dedupeSelect('root', true, false);
    expect(rootResult).toHaveLength(1);
    expect(rootResult[0].item.map(i => i.$$text)).toEqual([
      '1',
      '2',
      ' NEW THING '
    ]);
  });

  test('dedupeSelect(_, false, false) can return existing descendents', () => {
    engine.add('<root><item>1</item><item>2</item>');
    
    const firstResult = engine.dedupeSelect('item', false, false);
    expect(firstResult).toHaveLength(2);
    expect(firstResult.map(item => item.$$text)).toEqual(['1', '2']);
    
    engine.add('<item> 3');
    engine.add(' </item>');
    
    const secondResult = engine.dedupeSelect('item', false, false);
    expect(secondResult).toHaveLength(1);
    expect(secondResult[0].$$text).toBe(' 3 ');
    
    engine.add('<item>4</item></root>');
    
    const thirdResult = engine.dedupeSelect('item');
    expect(thirdResult).toHaveLength(1);
    expect(thirdResult[0].$$text).toBe('4');
    
    const fourthResult = engine.dedupeSelect('item');
    expect(fourthResult).toHaveLength(0);
  });

  test('dedupeSelect should maintain state across multiple XML chunks', () => {
    engine.add('<root><item>First</item><item>Second</item>');
    
    const firstResult = engine.dedupeSelect('item');
    expect(firstResult).toHaveLength(2);
    expect(firstResult.map(item => item.$$text)).toEqual(['First', 'Second']);
    
    const secondResult = engine.dedupeSelect('item');
    expect(secondResult).toHaveLength(0);
    
    engine.add('<item>Third</item><item>Fourth</item></root>');
    
    const thirdResult = engine.dedupeSelect('item');
    expect(thirdResult).toHaveLength(2);
    expect(thirdResult.map(item => item.$$text)).toEqual(['Third', 'Fourth']);
    
    const fourthResult = engine.dedupeSelect('item');
    expect(fourthResult).toHaveLength(0);
    
    const allItems = engine.select('item');
    expect(allItems).toHaveLength(4);
    expect(allItems.map(item => item.$$text)).toEqual(['First', 'Second', 'Third', 'Fourth']);
  });

  test('dedupeSelect should handle streaming XML with partial and complete elements', () => {
    engine.add('<root><item id="1">');
    let result = engine.dedupeSelect('item');
    expect(result).toHaveLength(0); // Item is not closed yet
    
    engine.add('First item</item><item id="2">Second ');
    result = engine.dedupeSelect('item');
    expect(result).toHaveLength(1); // Only the completed first item
    expect(result[0].$$attr.id).toBe('1');
    expect(result[0].$$text).toBe('First item');
    
    engine.add('item</item><item id="3">');
    result = engine.dedupeSelect('item');
    expect(result).toHaveLength(1); // Only the completed second item
    expect(result[0].$$attr.id).toBe('2');
    expect(result[0].$$text).toBe('Second item');
    
    engine.add('Third item</item></root>');
    result = engine.dedupeSelect('item');
    expect(result).toHaveLength(1); // Only the completed third item
    expect(result[0].$$attr.id).toBe('3');
    expect(result[0].$$text).toBe('Third item');
    
    result = engine.dedupeSelect('item');
    expect(result).toHaveLength(0);
    
    result = engine.select('item');
    expect(result).toHaveLength(3);
  });

  test('dedupeSelect should handle nested elements correctly', () => {
    engine.add('<root><item nested="true"><inner>Nested</inner></item><item>Sibling</item></root>');
    
    const result = engine.dedupeSelect('item,inner');

    //???
    // Technically, since <inner> will have been returned when the first 
    // item has been selected, then it is considered a duplicate if it
    // were to be returned again, thus it is not returned again.
    expect(result).toHaveLength(2);
    expect(result.map(item => ({
      text: item.$$text.trim(),
      nested: item.$$attr.nested
    }))).toEqual([
      {text: 'Nested', nested: 'true'},
      // {text: 'Nested', nested: undefined},
      {text: 'Sibling', nested: undefined}
    ]);
    
    const secondResult = engine.dedupeSelect('item');
    expect(secondResult).toHaveLength(0);
  });

  test('dedupeSelect should handle open tags correctly when includeOpenTags is true', () => {
    engine.add('<root><item>1</item><item>2<subitem>');
    
    let result = engine.dedupeSelect('item', true);
    expect(result).toHaveLength(2);
    console.log('result>>>>', result);
    expect(result.map(item => item.$$text)).toEqual(['1', '2']);
    
    engine.add('sub');
    result = engine.dedupeSelect('item', true);
    expect(result).toHaveLength(1);  // Only the updated open tag
    expect(result[0].$$text).toBe('2sub');
    
    engine.add('</subitem></item><item>3</item>');
    
    result = engine.dedupeSelect('item', true);
    expect(result).toHaveLength(2);  // The now-closed tag and the new tag
    expect(result.map(item => item.$$text)).toEqual(['2sub', '3']);
    
    // No changes, so no results
    result = engine.dedupeSelect('item', true);
    expect(result).toHaveLength(0);
  });

  test('dedupeSelect should update open tags as they are completed', () => {
    engine.add('<root><item id="1">Start');
    
    let result = engine.dedupeSelect('item', true);
    expect(result).toHaveLength(1);
    expect(result[0].$$text).toBe('Start');
    
    engine.add(' Middle');
    result = engine.dedupeSelect('item', true);
    expect(result).toHaveLength(1);
    expect(result[0].$$text).toBe('Start Middle');
    
    engine.add(' End</item>');
    result = engine.dedupeSelect('item', true);
    expect(result).toHaveLength(1);
    expect(result[0].$$text).toBe('Start Middle End');
  });

  test('dedupeSelect should handle siblings and nested elements with open tags', () => {
    engine.add('<root><item id="1"><subitem>Sub 1');
    
    let result = engine.dedupeSelect('item', true);
    expect(result).toHaveLength(1);
    expect(result[0].$$attr.id).toBe('1');
    expect(result[0].$$text).toBe('Sub 1');
    
    engine.add('</subitem></item><item id="2"><subitem>Sub 2</subitem>');
    
    result = engine.dedupeSelect('item', true);
    expect(result).toHaveLength(2);  // Both items should be returned
    expect(result[0].$$attr.id).toBe('1');  // First item is now closed
    expect(result[0].$$text).toBe('Sub 1');
    expect(result[1].$$attr.id).toBe('2');
    expect(result[1].$$text).toBe('Sub 2');
    
    result = engine.dedupeSelect('subitem', true);
    // ^ we have already seen this but it is not closed
    // so we can't dedupe it
    expect(result).toHaveLength(1); 
    // result = engine.dedupeSelect('subitem', true, false);
    // expect(result).toHaveLength(2); 
    // expect(result.map(item => item.$$text)).toEqual(['Sub 1', 'Sub 2']);
    
    engine.add('</item>');
    // Additional check to ensure no more selections are made
    result = engine.dedupeSelect('item', true); //<= it's now closed so has a length of 1!
    expect(result).toHaveLength(1);
    result = engine.dedupeSelect('item', true); //<=deduped so now length=0
    expect(result).toHaveLength(0);
    
    result = engine.dedupeSelect('subitem', true);
    expect(result).toHaveLength(0);
  });
  
  test('dedupeSelect should handle complex hierarchical streaming with diverse CSS selectors', () => {
    const engine = new IncomingXMLParserSelectorEngine();

    // First chunk - start of document with some complete and incomplete elements
    engine.add(`
      <library type="public">
        <section id="fiction">
          <shelf location="A1">
            <book category="fantasy">
              <title>The Hobbit</title>
              <author>Tolkien</author>
            </book>
            <book category="sci-fi">
              <title>Dune</title>
              <author>Herbert</author>
            </book>
            <book category="fantasy"><title>The Way of K`);

    // Test immediate selection of completed elements

    let openResults = engine.select('book[category="fantasy"] > title', true);
    console.log('Results>>>>', openResults[0].$$children);

    // It will include open tags
    expect(openResults).toHaveLength(2);
    expect(openResults[0].$$text).toBe('The Hobbit');
    expect(openResults[1].$$text).toBe('The Way of K');
    // return;

    let closedResults = engine.select('book[category="fantasy"] > title');
    expect(closedResults).toHaveLength(1);
    expect(closedResults[0].$$text).toBe('The Hobbit');

    let results;
    // Test parent-based selector
    results = engine.select('shelf > book[category="sci-fi"]');
    expect(results).toHaveLength(1);
    expect(results[0].title[0].$$text).toBe('Dune');

    // Add more content, including nested structures
    engine.add(`ings</title>
              <author>Sanderson</author>
            </book>
          </shelf>
          <shelf location="A2">
            <book category="mystery">
              <title>The Da Vinci Code</title>
              <author>Brown</author>
              <reviews>
                <review stars="4">Great plot</review>
                <review stars="5">Couldn't put it down!</review>
              </reviews>
            </book>
            <book category="mystery"><title>Sh`);

    // Test attribute selectors
    results = engine.select('review[stars="5"]');
    expect(results).toHaveLength(1);
    expect(results[0].$$text).toBe("Couldn't put it down!");

    // Test ancestor-descendant selector
    results = engine.select('section[id="fiction"] title');
    expect(results).toHaveLength(4); // All completed titles so far

    // Complete the document with more nested content
    engine.add(`erlock Holmes</title>
              <author>Doyle</author>
              <reviews>
                <review stars="5">Classic!</review>
              </reviews>
            </book>
          </shelf>
        </section>
        <section id="non-fiction">
          <shelf location="B1">
            <book category="science" featured="true">
              <title>A Brief History of Time</title>
              <author>Hawking</author>
            </book>
          </shelf>
        </section>
      </library>`);

    // Test complex attribute + descendant selectors
    results = engine.select('book[category="mystery"] review[stars="5"]');
    expect(results).toHaveLength(2);
    expect(results.map(r => r.$$text)).toEqual([
      "Couldn't put it down!",
      "Classic!"
    ]);
  
    // Test direct child selector with attributes
    results = engine.select('section[id="non-fiction"] > shelf > book[featured="true"]');
    expect(results).toHaveLength(1);
    expect(results[0].title[0].$$text).toBe('A Brief History of Time');


    // Test sibling selectors
    results = engine.select('title + author');
    expect(results).toHaveLength(6); // All authors that follow titles

    // Test multiple selector combinations
    results = engine.select('book[category="fantasy"] title, book[category="science"] title');
    expect(results).toHaveLength(3);
    expect(results.map(r => r.$$text)).toEqual([
      'The Hobbit',
      'The Way of Kings',
      'A Brief History of Time'
    ]);

    // Test nested structure completeness
    results = engine.dedupeSelect('book');
    expect(results).toHaveLength(6);
    results.forEach(book => {
      expect(book.title).toBeDefined();
      expect(book.author).toBeDefined();
      if (book.$$attr.category === 'mystery') {
        expect(book.reviews).toBeDefined();
        expect(book.reviews[0].review).toBeDefined();
      }
    });

    // Test parent attribute inheritance
    results = engine.select('shelf[location="A1"] > book > title');
    expect(results).toHaveLength(3);
    
  });

  test('dedupeSelect should handle flat plural hierarchies correctly', () => {
    const engine = new IncomingXMLParserSelectorEngine();
    
    // Add poems in chunks to test streaming behavior
    engine.add('<poem>Roses are');
    let result = engine.dedupeSelect('poem', true);
    expect(result).toHaveLength(1);
    expect(result[0].$$text).toBe('Roses are');
    
    engine.add(' red</poem>');
    result = engine.dedupeSelect('poem', true);
    expect(result).toHaveLength(1);
    expect(result[0].$$text).toBe('Roses are red');
    
    engine.add('<poem>Violets are blue</poem>');
    result = engine.dedupeSelect('poem', true);
    expect(result).toHaveLength(1);
    expect(result[0].$$text).toBe('Violets are blue');
    
    engine.add('<poem>Sugar');
    result = engine.dedupeSelect('poem', true);
    expect(result).toHaveLength(1);
    expect(result[0].$$text).toBe('Sugar');
    
    engine.add(' is sweet</poem>');
    result = engine.dedupeSelect('poem', true);
    expect(result).toHaveLength(1);
    expect(result[0].$$text).toBe('Sugar is sweet');
    
  });

  test('mapSelect should handle flat plural hierarchies with fresh engine', () => {
    // Create a fresh engine instance
    const engine = new IncomingXMLParserSelectorEngine();
    
    // Add all poems at once
    engine.add(`
      <poem>Roses are red</poem>
      <poem>Violets are blue</poem>
      <poem>Sugar is sweet</poem>
      <poem>And so are you</poem>
    `);
    
    // Test mapSelect with array schema on fresh data
    const mapResult = engine.mapSelect({
      poem: Array(String)
    });
    
    expect(mapResult).toEqual({
      poem: [
        'Roses are red',
        'Violets are blue',
        'Sugar is sweet',
        'And so are you'
      ]
    });

    // Verify we can still get all poems with a fresh select
    const selectResult = engine.select('poem');
    expect(selectResult).toHaveLength(4);
    expect(selectResult.map(p => p.$$text)).toEqual([
      'Roses are red',
      'Violets are blue',
      'Sugar is sweet',
      'And so are you'
    ]);
  });

  test('mapSelect should handle incremental chunks of flat plural hierarchies', () => {
    const engine = new IncomingXMLParserSelectorEngine();
    
    // First chunk - partial first poem
    engine.add('<poem>Roses are');
    let result = engine.mapSelect({
      poem: Array(String)
    });
    expect(result).toEqual({
      poem: ['Roses are']
    });
    
    // Complete first poem
    engine.add(' red</poem>');
    result = engine.mapSelect({
      poem: Array(String)
    });
    expect(result).toEqual({
      poem: ['Roses are red']
    });
    
    // Add complete second poem
    engine.add('<poem>Violets are blue</poem>');
    result = engine.mapSelect({
      poem: Array(String)
    });
    expect(result).toEqual({
      poem: [
        // 'Roses are red', // <= already given
        'Violets are blue'
      ]
    });
    
    // Add partial third poem
    engine.add('<poem>Sugar');
    result = engine.mapSelect({
      poem: Array(String)
    });
    expect(result).toEqual({
      poem: [
        // 'Roses are red', // <= already given
        // 'Violets are blue', // <= already given  
        'Sugar'
      ]
    });
    
    // Complete third poem
    engine.add(' is sweet</poem>');
    result = engine.mapSelect({
      poem: Array(String)
    });
    expect(result).toEqual({
      poem: [
        // 'Roses are red', // <= already given
        // 'Violets are blue', // <= already given
        'Sugar is sweet'
      ]
    });
    
    // Add final poem
    engine.add('<poem>And so are you</poem>');
    result = engine.mapSelect({
      poem: Array(String)
    });
    expect(result).toEqual({
      poem: [
        // 'Roses are red', // <= already given
        // 'Violets are blue', // <= already given
        // 'Sugar is sweet', // <= already given
        'And so are you'
      ]
    });
  });

  test('dedupeSelect should track changes in nested content', () => {
    const engine = new IncomingXMLParserSelectorEngine();
    
    // Add initial poem with nested content
    engine.add('<poem>Once');
    let result = engine.dedupeSelect('poem', true);
    expect(result).toHaveLength(1);
    expect(result[0].$$text).toBe('Once');
    
    // Add more text
    engine.add(' upon');
    result = engine.dedupeSelect('poem', true);
    expect(result).toHaveLength(1);  // Returns because content changed
    expect(result[0].$$text).toBe('Once upon');
    
    // Add text and start nested element
    engine.add(' a time, <strong id="123">THERE');
    result = engine.dedupeSelect('poem', true);
    expect(result).toHaveLength(1);  // Returns because content changed
    expect(result[0].$$text).toBe('Once upon a time, THERE');
    
    // Complete nested element and add more text
    engine.add(' WAS</strong> a king.</poem>');
    result = engine.dedupeSelect('poem', true);
    expect(result).toHaveLength(1);  // Returns because content changed
    expect(result[0].$$text).toBe('Once upon a time, THERE WAS a king.');
  });

  test('mapSelect should show complete state at each point', () => {
    const engine = new IncomingXMLParserSelectorEngine();
    
    // Add initial content
    engine.add('<poem>Once');
    let result = engine.mapSelect({
      poem: Array(String),
      strong: Array(String)
    }, true, false);  // includeOpenTags=true, doDedupe=false
    
    expect(result).toEqual({
      poem: ['Once'],
      // strong: [] //<= does not exist yet.
      // (mapSelect does not force the schema into the results obj, as of now at least)
    });
    
    // Add nested content
    engine.add(' upon a time, <strong id="123">THERE');
    result = engine.mapSelect({
      poem: Array(String),
      strong: Array(String)
    }, true, false);
    
    expect(result).toEqual({
      poem: ['Once upon a time, THERE'],
      strong: ['THERE']
    });
    
    // Complete everything
    engine.add(' WAS</strong> a king.</poem>');
    result = engine.mapSelect({
      poem: Array(String),
      strong: Array(String)
    }, true, false);
    
    expect(result).toEqual({
      poem: ['Once upon a time, THERE WAS a king.'],
      strong: ['THERE WAS']
    });
  });
});