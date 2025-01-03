import IncomingIdioParserSelectorEngine from '../src/parsers/IncomingIdioParserSelectorEngine.mjs';

describe('IncomingIdioParserSelectorEngine Tag Closure Rules', () => {
  let engine;

  beforeEach(() => {
    engine = new IncomingIdioParserSelectorEngine();
  });

  describe('Exact Match Closure', () => {
    test('should close matching tags in correct order', () => {
      engine.add(`@START(root)
        @START(child1)first@END(child1)
        @START(child2)second@END(child2)
      @END(root)`);

      const result = engine.select('root');
      expect(result).toHaveLength(1);
      expect(result[0].child1[0].$$text.trim()).toBe('first');
      expect(result[0].child2[0].$$text.trim()).toBe('second');
      expect(result[0].$$tagclosed).toBe(true);
    });

    test('should handle deeply nested matching tags', () => {
      engine.add(`@START(level1)
        @START(level2)
          @START(level3)deep@END(level3)
        @END(level2)
      @END(level1)`);

      const result = engine.select('level1');
      expect(result[0].level2[0].level3[0].$$text.trim()).toBe('deep');
      expect(result[0].level2[0].$$tagclosed).toBe(true);
      expect(result[0].$$tagclosed).toBe(true);
    });
  });

  describe('Fallback Closure', () => {
    test('should close most recent open tag when no match found', () => {
      engine.add(`@START(outer)
        @START(inner)content@END(wrong)
      @END(outer)`);

      const result = engine.select('outer');
      expect(result).toHaveLength(1);
      expect(result[0].inner[0].$$text.trim()).toBe('content');
      expect(result[0].inner[0].$$tagclosed).toBe(true);
      expect(result[0].$$tagclosed).toBe(true);
    });

    test('should handle multiple mismatched closures', () => {
      engine.add(`@START(root)
        @START(child1)
          @START(child2)content@END(wrong1)
        @END(wrong2)
      @END(wrong3)`);

      const result = engine.select('root');
      expect(result).toHaveLength(1);
      expect(result[0].child1[0].child2[0].$$text.trim()).toBe('content');
      expect(result[0].child1[0].child2[0].$$tagclosed).toBe(true);
      expect(result[0].child1[0].$$tagclosed).toBe(true);
      expect(result[0].$$tagclosed).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    test('should handle attribute nodes correctly', () => {
      engine.add(`@START(element)
        @START(@attr)value
        @START(child)content@END(wrong)
        @END(@attr)
      @END(element)`);

      const result = engine.select('element');
      expect(result).toHaveLength(1);
      // attr swallows up all $$text inside it
      expect(result[0].$$attr.attr.trim()).toBe('value\n        content');
      // expect(result[0].child[0].$$text.trim()).toBe('content');
      // child won't even exist...
      expect(result[0].child).toBeUndefined();
      // expect(result[0].child[0].$$tagclosed).toBe(true);
    });

    test('should handle interleaved tag closure', () => {
      engine.add(`@START(a)
        @START(b)
          @START(c)first@END(a)
          second@END(d)
          third@END(b)
        fourth@END(c)`);

      const result = engine.select('a');
      expect(result).toHaveLength(1);
      expect(result[0].b[0].c[0].$$text.trim()).toBe('first');
      // Verify closure order
      expect(result[0].$$tagclosed).toBe(true);
      expect(result[0].b[0].$$tagclosed).toBe(true);
      expect(result[0].b[0].c[0].$$tagclosed).toBe(true);
    });

    test('Incorrectly closed group (real-life examplar test)', () => {
      engine.add(`
        @START(event)
          @START(participants)
            @START(participant)John Smith@END(participant)
            @START(participant)Jane Doe@END(participant)
            @START(participant)Mary Taylor@END(participant)
          @END(participant)
        @END(event)
      `);
      // note it incorrectly closes on 'participtant' (singular)

      const result = engine.select('participants');

      expect(result[0].participant[0].$$text).toBe('John Smith');
      expect(result[0].participant[1].$$text).toBe('Jane Doe');
      expect(result[0].participant[2].$$text).toBe('Mary Taylor');
    })

    test('should handle unclosed tags at end of input', () => {
      engine.add(`@START(root)
        @START(child1)content1
        @START(child2)content2`);

      const result = engine.select('root', true); // includeOpenTags=true
      expect(result).toHaveLength(1);
      // expect(result[0].child1[0].$$text.trim()).toBe('content1');
      expect(result[0].child1[0].child2[0].$$text.trim()).toBe('content2');
      expect(result[0].$$tagclosed).toBe(false);
      expect(result[0].child1[0].$$tagclosed).toBe(false);
      expect(result[0].child1[0].child2[0].$$tagclosed).toBe(false);
    });

    test('should handle empty tags and immediate closure', () => {
      engine.add(`@START(root)
        @START(empty1)@END(empty1)
        @START(empty2)@END(wrong)
        @START(empty3)@END(empty3)
      @END(root)`);

      const result = engine.select('root');
      expect(result).toHaveLength(1);
      expect(result[0].empty1[0].$$tagclosed).toBe(true);
      expect(result[0].empty2[0].$$tagclosed).toBe(true);
      expect(result[0].empty3[0].$$tagclosed).toBe(true);
      expect(result[0].$$tagclosed).toBe(true);
    });
  });

  describe('Streaming Behavior', () => {
    test('should handle tag closure across chunks', () => {
      engine.add('@START(stream)');
      engine.add('@START(child)content');
      engine.add('@END(wrong)');
      engine.add('@END(stream)');

      const result = engine.select('stream');
      expect(result).toHaveLength(1);
      expect(result[0].child[0].$$text).toBe('content');
      expect(result[0].child[0].$$tagclosed).toBe(true);
      expect(result[0].$$tagclosed).toBe(true);
    });

    test('should handle interleaved closure across chunks', () => {
      engine.add('@START(outer)@START(inner1)');
      engine.add('content1@END(wrong1)');
      engine.add('@START(inner2)content2');
      engine.add('@END(wrong2)@END(outer)');

      const result = engine.select('outer');
      expect(result).toHaveLength(1);
      expect(result[0].inner1[0].$$text).toBe('content1');
      expect(result[0].inner2[0].$$text).toBe('content2');
      expect(result[0].inner1[0].$$tagclosed).toBe(true);
      expect(result[0].inner2[0].$$tagclosed).toBe(true);
      expect(result[0].$$tagclosed).toBe(true);
    });
  });
}); 