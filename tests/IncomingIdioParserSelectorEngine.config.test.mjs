import { configure, resetConfig } from '../src/config.mjs';
import IncomingIdioParserSelectorEngine from '../src/parsers/IncomingIdioParserSelectorEngine.mjs';

describe('IncomingIdioParserSelectorEngine Configuration', () => {
  beforeEach(() => {
    resetConfig();
  });

  test('should use global config when no instance config provided', () => {
    configure({
      idioSymbols: {
        openTagPrefix: '<<<',
        closeTagPrefix: '<<<',
        tagOpener: 'START(',
        tagCloser: 'END(',
        tagSuffix: ')>>>'
      }
    });

    const engine = new IncomingIdioParserSelectorEngine();
    
    engine.add(`
      <<<START(test)>>>content<<<END(test)>>>
    `);

    const result = engine.select('test');
    expect(result).toHaveLength(1);
    expect(result[0].$$text.trim()).toBe('content');
  });

  test('instance config should override global config', () => {
    configure({
      idioSymbols: {
        openTagPrefix: '<<<',
        closeTagPrefix: '<<<',
        tagOpener: 'START(',
        tagCloser: 'END(',
        tagSuffix: '>>>'
      }
    });

    const engine = new IncomingIdioParserSelectorEngine({
      openTagPrefix: '[[',
      closeTagPrefix: '[[',
      tagOpener: 'BEGIN(',
      tagCloser: 'FINISH(',
      tagSuffix: ')]]'
    });

    // Add debug logging
    console.log('Engine config:', engine.config);
    
    const input = `[[BEGIN(test)]]content[[FINISH(test)]]`;
    console.log('Input:', input);
    
    engine.add(input);

    // Debug the parsed data
    console.log('Parsed data:', engine.parsedData);
    console.log('Open elements:', engine.openElements);

    const result = engine.select('test');
    console.log('Select result:', result);

    expect(result).toHaveLength(1);
    expect(result[0].$$text.trim()).toBe('content');
  });

  test('should fall back to defaults if no config provided', () => {
    const engine = new IncomingIdioParserSelectorEngine();
    
    engine.add('@START(test)content@END(test)');

    const result = engine.select('test');
    expect(result).toHaveLength(1);
    expect(result[0].$$text).toBe('content');
  });

  test('should generate scaffold using configured markers', () => {
    configure({
      idioSymbols: {
        openTagPrefix: '<<<',
        closeTagPrefix: '<<<',
        tagOpener: 'START(',
        tagCloser: 'END(',
        tagSuffix: ')>>>'
      }
    });

    const schema = {
      test: {
        field: String
      }
    };

    const scaffold = IncomingIdioParserSelectorEngine.makeMapSelectScaffold(schema);
    const normalized = scaffold.replace(/\s+/g, ' ').trim();

    expect(normalized).toContain('<<<START(test)>>>');
    expect(normalized).toContain('<<<END(test)>>>');
    expect(normalized).toContain('<<<START(field)>>>...String...<<<END(field)>>>');
  });

  describe('Custom marker parsing', () => {
    test('should correctly parse start tags with custom markers', () => {
      const engine = new IncomingIdioParserSelectorEngine({
        openTagPrefix: '[[',
        closeTagPrefix: '[[',
        tagOpener: 'BEGIN(',
        tagCloser: 'FINISH(',
        tagSuffix: ')]]'
      });

      // Add logging for the actual config
      console.log('Test config:', engine.config);

      // Test just the start tag first
      engine.add('[[BEGIN(test)]]');
      console.log('After start tag parsed:', {
        parsedData: engine.parsedData,
        openElements: engine.openElements
      });

      expect(engine.openElements).toHaveLength(1);
      expect(engine.openElements[0].name).toBe('test');
      expect(engine.openElements[0].closed).toBe(false);
    });

    test('should correctly parse end tags with custom markers', () => {
      const engine = new IncomingIdioParserSelectorEngine({
        openTagPrefix: '[[',
        closeTagPrefix: '[[',
        tagOpener: 'BEGIN(',
        tagCloser: 'FINISH(',
        tagSuffix: ')]]'
      });

      engine.add('[[BEGIN(test)]]content[[FINISH(test)]]');
      console.log('After full tag parsed:', {
        parsedData: engine.parsedData,
        openElements: engine.openElements
      });

      expect(engine.parsedData).toHaveLength(1);
      expect(engine.parsedData[0].name).toBe('test');
      expect(engine.parsedData[0].closed).toBe(true);
      
      // Test the text content
      expect(engine.parsedData[0].children).toHaveLength(1);
      expect(engine.parsedData[0].children[0].type).toBe('text');
      expect(engine.parsedData[0].children[0].data).toBe('content');
    });

    test('should correctly handle tag name extraction', () => {
      const engine = new IncomingIdioParserSelectorEngine({
        openTagPrefix: '[[',
        closeTagPrefix: '[[',
        tagOpener: 'BEGIN(',
        tagCloser: 'FINISH(',
        tagSuffix: ')]]'
      });

      // Log the exact string positions we're using to extract the name
      const input = '[[BEGIN(test)]]';
      engine.add(input);

      const startPattern = `${engine.config.openTagPrefix}${engine.config.tagOpener}`;
      const tagStart = input.indexOf(startPattern) + startPattern.length;
      const endOfStartTag = input.indexOf(engine.config.tagSuffix, tagStart);
      const wrapperClosePos = input.lastIndexOf('(', endOfStartTag) + 1;

      console.log('Tag name extraction details:', {
        input,
        startPattern,
        tagStart,
        endOfStartTag,
        wrapperClosePos,
        extractedName: input.substring(wrapperClosePos, endOfStartTag)
      });

      expect(engine.parsedData[0].name).toBe('test');
    });

    test('should correctly select elements with custom markers', () => {
      const engine = new IncomingIdioParserSelectorEngine({
        openTagPrefix: '[[',
        closeTagPrefix: '[[',
        tagOpener: 'BEGIN(',
        tagCloser: 'FINISH(',
        tagSuffix: ')]]'
      });

      engine.add('[[BEGIN(test)]]content[[FINISH(test)]]');

      // Log the state before selection
      console.log('Before select:', {
        parsedData: engine.parsedData,
        config: engine.config
      });

      const result = engine.select('test');
      
      // Log the selection process
      console.log('After select:', {
        result,
        parsedDataNames: engine.parsedData.map(el => el.name)
      });

      expect(result).toHaveLength(1);
      expect(result[0].$$text.trim()).toBe('content');
    });
  });

  describe('Custom Idio Syntax Variations', () => {
    test('should handle XML-like syntax', () => {
      const engine = new IncomingIdioParserSelectorEngine({
        openTagPrefix: '<',
        closeTagPrefix: '</',
        tagOpener: '',
        tagCloser: '',
        tagSuffix: '>'
      });

      engine.add('<user>John</user>');
      const result = engine.select('user');
      expect(result).toHaveLength(1);
      expect(result[0].$$text).toBe('John');
    });

    test('should handle JSON-like syntax', () => {
      const engine = new IncomingIdioParserSelectorEngine({
        openTagPrefix: '{',
        closeTagPrefix: '{',
        tagOpener: 'begin:',
        tagCloser: 'end:',
        tagSuffix: '}'
      });

      engine.add('{begin:person}Alice{end:person}');
      const result = engine.select('person');
      expect(result).toHaveLength(1);
      expect(result[0].$$text).toBe('Alice');
    });

    test('should handle complex nested structures with emoji markers', () => {
      const engine = new IncomingIdioParserSelectorEngine({
        openTagPrefix: '🔵',
        closeTagPrefix: '🔴',
        tagOpener: '(',
        tagCloser: '(',
        tagSuffix: ')'
      });

      engine.add(`
        🔵(root)
          🔵(child1)First🔴(child1)
          🔵(child2)
            🔵(@type)nested🔴(@type)
            Second
          🔴(child2)
        🔴(root)
      `);

      const root = engine.select('root');
      expect(root).toHaveLength(1);
      expect(root[0].child1[0].$$text.trim()).toBe('First');
      expect(root[0].child2[0].$$attr.type.trim()).toBe('nested');
    });

    test('should handle markdown-like syntax', () => {
      const engine = new IncomingIdioParserSelectorEngine({
        openTagPrefix: '#',
        closeTagPrefix: '#',
        tagOpener: '[',
        tagCloser: '[/',
        tagSuffix: ']'
      });

      engine.add(`
        #[section]
          #[title]Header#[/title]
          #[content]
            #[@type]article#[/@type]
            Some text here
          #[/content]
        #[/section]
      `);

      const section = engine.select('section');
      expect(section).toHaveLength(1);
      expect(section[0].title[0].$$text.trim()).toBe('Header');
      expect(section[0].content[0].$$attr.type.trim()).toBe('article');
    });

    test('should handle whitespace-heavy syntax', () => {
      const engine = new IncomingIdioParserSelectorEngine({
        openTagPrefix: '   ',
        closeTagPrefix: '   ',
        tagOpener: '>>>',
        tagCloser: '<<<',
        tagSuffix: '   '
      });

      engine.add('   >>>test   content   <<<test   ');
      const result = engine.select('test');
      expect(result).toHaveLength(1);
      expect(result[0].$$text.trim()).toBe('content');
    });

    test('should handle multi-character markers with special characters', () => {
      const engine = new IncomingIdioParserSelectorEngine({
        openTagPrefix: '-->',
        closeTagPrefix: '<--',
        tagOpener: '{{',
        tagCloser: '{{',
        tagSuffix: '}}!!'
      });

      // Beggining ofnode would be -->{{thing}}!!
      // End of node would be <--{{thing}}!!

      engine.add(`
        -->{{root}}!!
          -->{{@id}}!!123<--{{@id}}!!
          -->{{data}}!!
            -->{{item}}!!value<--{{item}}!!
          <--{{data}}!!
        <--{{root}}!!
      `);

      const root = engine.select('root');
      expect(root).toHaveLength(1);
      expect(root[0].$$attr.id).toBe('123');
      expect(root[0].data[0].item[0].$$text).toBe('value');
    });

    test('should handle streaming with complex markers', () => {
      const engine = new IncomingIdioParserSelectorEngine({
        openTagPrefix: '<%=',
        closeTagPrefix: '<%/',
        tagOpener: '_',
        tagCloser: '_',
        tagSuffix: '%>'
      });

      // Add content in chunks
      engine.add('<%=_test');
      let result = engine.select('test');
      expect(result).toHaveLength(0);

      engine.add('%>content');
      result = engine.select('test');
      expect(result).toHaveLength(0);

      engine.add('<%/_test%>');
      result = engine.select('test');
      expect(result).toHaveLength(1);
      expect(result[0].$$text).toBe('content');
    });

    test('should handle mixed attribute and element markers', () => {
      const engine = new IncomingIdioParserSelectorEngine({
        openTagPrefix: '::',
        closeTagPrefix: '::',
        tagOpener: 'NODE_BOUNDARY(',
        tagCloser: 'NODE_END_BOUNDARY(',
        tagSuffix: ')$$'
      });

      engine.add(`
        ::NODE_BOUNDARY(element)$$
          ::NODE_BOUNDARY(@attr1)$$value1::NODE_END_BOUNDARY(@attr1)$$
          ::NODE_BOUNDARY(child)$$
            ::NODE_BOUNDARY(@attr2)$$
              value2
            ::NODE_END_BOUNDARY(@attr2)$$
            content
          ::NODE_END_BOUNDARY(child)$$
        ::NODE_END_BOUNDARY(element)$$
      `);

      const result = engine.select('element');
      expect(result).toHaveLength(1);
      expect(result[0].$$attr.attr1.trim()).toBe('value1');
      expect(result[0].child[0].$$attr.attr2.trim()).toBe('value2');
      expect(result[0].child[0].$$text.trim()).toBe('content');
    });
  });
}); 