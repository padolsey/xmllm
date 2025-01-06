import IncomingIdioParserSelectorEngine from '../src/parsers/IncomingIdioParserSelectorEngine.mjs';

describe('IncomingIdioParserSelectorEngine realistic cases (plucked from various examples)', () => {
  let engine;
 
  beforeEach(() => {
    engine = new IncomingIdioParserSelectorEngine();
  });

  test('Random complex case', () => {
    engine.add(`@START(analysis)
      @START(sentiment)mixed@END(sentiment)
      @START(topics)
        @START(topic)
          AI regulations
        @END(topic)
        @START(topic)
          Technology development
        @END(topic)
        @START(topic)
          Safety vs. innovation
        @END(topic)
      @END(topics)
      @START(key_points)
        @START(point)
          @START(content)The new AI regulations focus on striking a balance between progress and protection.@END(content)
          @START(relevance)0.8@END(relevance)
          @START(category)main point@END(category)
        @END(point)
        @START(point)
          @START(content)Critics argue that the regulations may slow down technological development.@END(content)
          @START(relevance)0.7@END(relevance)
          @START(category)counterargument@END(category)
        @END(point)
      @END(key_points)
      @START(metadata)
        @START(confidence)0.8@END(confidence)
        @START(word_count)27@END(word_count)
      @END(metadata)
    @END(analysis)
`);

    const result = engine.select('topics topic');
    expect(result).toHaveLength(3);
    expect(result.map(r => r.$$text.trim())).toEqual(['AI regulations', 'Technology development', 'Safety vs. innovation']);
  });

});

