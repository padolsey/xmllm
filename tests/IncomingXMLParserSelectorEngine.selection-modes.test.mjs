import IncomingXMLParserSelectorEngine from '../src/parsers/IncomingXMLParserSelectorEngine';

describe('Selection Modes', () => {
  let engine;

  beforeEach(() => {
    engine = new IncomingXMLParserSelectorEngine();
  });

  describe('State Mode (Growing Lists)', () => {
    it('should show progressive state including partial elements', () => {
      // Add color elements one at a time
      engine.add('<colors>');
      engine.add('<color>re');
      
      let result = engine.mapSelect({
        color: [String]
      }, true, false); // includeOpen=true, doDedupe=false
      
      expect(result).toEqual({
        color: ['re']
      });

      engine.add('d</color>');
      result = engine.mapSelect({
        color: [String]
      }, true, false);
      
      expect(result).toEqual({
        color: ['red']
      });

      engine.add('<color>blu');
      result = engine.mapSelect({
        color: [String]
      }, true, false);
      
      expect(result).toEqual({
        color: ['red', 'blu']
      });

      engine.add('e</color></colors>');
      result = engine.mapSelect({
        color: [String]
      }, true, false);
      
      expect(result).toEqual({
        color: ['red', 'blue']
      });
    });
  });

  describe('RootOnce Mode (New Complete Elements)', () => {
    it('should only return new complete elements', () => {
      engine.add('<colors>');
      engine.add('<color>red</color>');
      
      let result = engine.mapSelectClosed({
        color: [String]
      });
      
      expect(result).toEqual({
        color: ['red']
      });

      engine.add('<color>blu'); // Incomplete - should not appear
      result = engine.mapSelectClosed({
        color: [String]
      });
      
      expect(result).toEqual({}); // Nothing new completed

      engine.add('e</color>');
      result = engine.mapSelectClosed({
        color: [String]
      });
      
      expect(result).toEqual({
        color: ['blue']
      });
    });
  });

  describe('Snapshot Mode (Complete State)', () => {
    it('should show current complete state', () => {
      engine.add('<colors>');
      engine.add('<color>red</color>');
      
      let result = engine.select('color', false); // includeOpen=false
      expect(result.map(n => n.$$text)).toEqual(['red']);

      engine.add('<color>blu'); // Incomplete
      result = engine.select('color', false);
      expect(result.map(n => n.$$text)).toEqual(['red']); // Still just red

      engine.add('e</color>');
      result = engine.select('color', false);
      expect(result.map(n => n.$$text)).toEqual(['red', 'blue']);
    });
  });

  describe('Real-time Mode (All Updates)', () => {
    it('should show all changes including partials', () => {
      const updates = [];
      
      engine.add('<colors>');
      engine.add('<color>re');
      updates.push(engine.select('color', true).map(n => n.$$text));
      
      engine.add('d</color>');
      updates.push(engine.select('color', true).map(n => n.$$text));
      
      engine.add('<color>blu');
      updates.push(engine.select('color', true).map(n => n.$$text));
      
      engine.add('e</color>');
      updates.push(engine.select('color', true).map(n => n.$$text));

      expect(updates).toEqual([
        ['re'],           // Partial first color
        ['red'],          // Complete first color
        ['red', 'blu'],   // First color + partial second
        ['red', 'blue']   // Both complete colors
      ]);
    });
  });

  describe('Deduplication Behavior', () => {
    it('should demonstrate deduplication vs growing lists', () => {
      // First add some complete elements
      engine.add('<list><item>1</item><item>2</item>');
      
      // With deduplication
      let withDedupe = engine.dedupeSelect('item', true);
      expect(withDedupe.map(n => n.$$text)).toEqual(['1', '2']);
      
      // Add another complete element
      engine.add('<item>3</item>');
      
      // With deduplication - only shows new element
      withDedupe = engine.dedupeSelect('item', true);
      expect(withDedupe.map(n => n.$$text)).toEqual(['3']);
      
      // Without deduplication - shows all elements
      let withoutDedupe = engine.select('item', true);
      expect(withoutDedupe.map(n => n.$$text)).toEqual(['1', '2', '3']);
    });
  });
}); 