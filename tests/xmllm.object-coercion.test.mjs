import xmllm from '../src/xmllm.mjs';
import IncomingXMLParserSelectorEngine from '../src/parsers/IncomingXMLParserSelectorEngine.mjs';

describe('Object Coercion Investigation', () => {
  test('observe basic pipeline yields', async () => {
    const yields = [];
    
    const stream = xmllm(() => [
      // First generator - just yield some XML strings
      function* () {
        yield '<root>';
        yield '<item>first</item>';
        yield '<item>second</item>';
        yield '</root>';
      },
      
      // Second generator - log and pass through
      function* (chunk) {
        console.log('Pipeline received:', {
          type: typeof chunk,
          value: chunk,
          isArray: Array.isArray(chunk)
        });
        yields.push(chunk);
        yield chunk;
      }
    ]);

    // Collect all results
    const results = await stream.all();
    
    console.log('All yields:', yields);
    console.log('Final results:', results);
    
    // Add some basic assertions
    expect(yields.every(y => typeof y === 'string')).toBe(true);
  });

  test('basic stream with object chunks', async () => {
    const chunks = [];
    
    // Create a simple stream that yields both strings and objects
    const stream = xmllm(() => [
      function* () {
        yield '<root>';
        // yield { some: 'object' };  // Deliberately yield an object
        yield '<item>text</item>';
        yield '</root>';
      },
      
      // Log what mapSelect receives
      function* (chunk) {
        console.log('Before mapSelect:', {
          type: typeof chunk,
          value: chunk
        });
        chunks.push(chunk);
        yield chunk;
      },
      
      // Try to select from it
      function* (chunk) {
        const engine = new IncomingXMLParserSelectorEngine();
        engine.add(chunk);  // This is where object might get coerced
        
        console.log('Added to parser:', {
          chunk,
          buffer: engine.buffer
        });
        
        yield engine.select('item');
      }
    ]);

    const results = await stream.all();
    console.log('Chunks received:', chunks);
    console.log('Final results:', results);
  });

  test('minimal xmlps test', () => {
    const engine = new IncomingXMLParserSelectorEngine();
    
    // Try different types of input
    engine.add('<root>');
    engine.add({ toString: () => '<item>from object</item>' });
    engine.add('<item>normal</item>');
    engine.add('</root>');

    const results = engine.select('item');
  });
}); 