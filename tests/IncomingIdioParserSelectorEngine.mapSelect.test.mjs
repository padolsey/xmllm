import IncomingIdioParserSelectorEngine from '../src/parsers/IncomingIdioParserSelectorEngine.mjs';
import { Type, EnumType, StringType, NumberType, BooleanType, RawType } from '../src/types.mjs';

describe('IncomingIdioParserSelectorEngine mapSelect', () => {
  let engine;

  beforeEach(() => {
    engine = new IncomingIdioParserSelectorEngine();
  });

  test('mapSelect should handle simple mapping', () => {
    engine.add('@START(book)@START(title)The Hobbit@END(title)@START(author)Tolkien@END(author)@END(book)');

    const result = engine.mapSelect({
      book: {
        title: String,
        author: String,
      },
    });

    expect(result).toEqual({
      book: {
        title: 'The Hobbit',
        author: 'Tolkien',
      },
    });
  });

  test('mapSelect should handle arrays and nested content', () => {
    engine.add(
      '@START(library)' +
      '@START(book)' +
      '@START(title)The Hobbit@END(title)' +
      '@START(review)Great!@END(review)' +
      '@START(review)Amazing!@END(review)' +
      '@END(book)' +
      '@START(book)' +
      '@START(title)LOTR@END(title)' +
      '@START(review)Classic@END(review)' +
      '@END(book)' +
      '@END(library)'
    );

    const result = engine.mapSelect([{
      book: {
        title: String,
        review: [String],
      },
    }]);

    expect(result).toEqual([
      {
        book: {
          title: 'The Hobbit',
          review: ['Great!', 'Amazing!'],
        },
      },
      {
        book: {
          title: 'LOTR',
          review: ['Classic'],
        },
      },
    ]);
  });

  test('mapSelect should handle streaming with accruing updates', () => {
    engine.add('@START(feed)@START(item)First@END(item)');

    let result = engine.mapSelect({
      feed: {
        item: [String],
      }
    }, true, true); // includeOpenTags=true, doDedupe=true

    expect(result).toEqual({
      feed: {
        item: ['First'],
      },
    });

    engine.add('@START(item)Second@END(item)');

    result = engine.mapSelect({
      feed: {
        item: [String],
      }
    }, true, true);

    expect(result).toEqual({
      feed: {
        item: ['First', 'Second'],
      },
    });
  });

  test('mapSelect should handle transformer functions', () => {
    engine.add('@START(data)@START(value)42@END(value)@END(data)');

    const result = engine.mapSelect({
      data: {
        value: (el) => parseInt(el.$$text) * 2,
      },
    });

    expect(result).toEqual({
      data: {
        value: 84,
      },
    });
  });

  test('mapSelect should handle type coercion', () => {
    engine.add(`
      @START(data)
        @START(string)hello@END(string)
        @START(number)42@END(number)
        @START(boolean)true@END(boolean)
      @END(data)
    `);

    const result = engine.mapSelect({
      data: {
        string: String,
        number: Number,
        boolean: Boolean
      }
    });

    expect(result).toEqual({
      data: {
        string: 'hello',
        number: 42,
        boolean: true
      }
    });
  });

  test('mapSelect should handle nested arrays', () => {
    engine.add(
      '@START(orders)' +
      '@START(order)' +
      '@START(item)Apple@END(item)' +
      '@START(item)Banana@END(item)' +
      '@END(order)' +
      '@START(order)' +
      '@START(item)Cherry@END(item)' +
      '@END(order)' +
      '@END(orders)'
    );

    const result = engine.mapSelect({
      orders: {
        order: [{
          item: [String],
        }],
      },
    });

    expect(result).toEqual({
      orders: {
        order: [
          {
            item: ['Apple', 'Banana'],
          },
          {
            item: ['Cherry'],
          },
        ],
      },
    });
  });

  test('mapSelect should handle Type instances', () => {
    engine.add(`
      @START(data)
        @START(str)hello@END(str)
        @START(num)42@END(num)
        @START(bool)true@END(bool)
        @START(enum)red@END(enum)
        @START(defaulted)@END(defaulted)
      @END(data)
    `);

    const result = engine.mapSelect({
      data: {
        str: new StringType(),
        num: new NumberType(),
        bool: new BooleanType(),
        enum: new EnumType(null, ['red', 'blue', 'green']),
        defaulted: new StringType().withDefault('default value')
      }
    });

    expect(result).toEqual({
      data: {
        str: 'hello',
        num: 42,
        bool: true,
        enum: 'red',
        defaulted: 'default value'
      }
    });
  });

  test('mapSelect should handle enum validation', () => {
    engine.add('@START(color)invalid@END(color)');

    const result = engine.mapSelect({
      color: new EnumType('color', ['red', 'blue', 'green']).withDefault('blue')
    });

    expect(result).toEqual({
      color: 'blue' // Falls back to default
    });
  });

  test('mapSelect should handle empty values with defaults', () => {
    engine.add(`
      @START(data)
        @START(empty)@END(empty)
        @START(defaulted)@END(defaulted)
      @END(data)
    `);

    const result = engine.mapSelect({
      data: {
        empty: new StringType(),
        defaulted: new StringType().withDefault('defaultValueHere')
      }
    });

    expect(result).toEqual({
      data: {
        defaulted: 'defaultValueHere'
        // empty is undefined since it has no default
      }
    });
  });

  test('mapSelect should handle raw content', () => {
    engine.add('@START(html)<p>content</p>@END(html)');

    const result = engine.mapSelect({
      html: new RawType()
    });

    expect(result).toEqual({
      html: '<p>content</p>'
    });
  });

  test('complex case', () => {
    engine.add(`
      @START(items)
        @START(item)
          @START(@category)Urgent@END(@category)
          @START(@priority)5@END(@priority)
          @START(@text)Fix critical server issue@END(@text)
        @END(item)
        @START(item)
          @START(@category)High@END(@category)
          @START(@priority)4@END(@priority)
          @START(@text)Update security protocols@END(@text)
        @END(item)
        @START(item)
          @START(@category)Medium@END(@category)
          @START(@priority)3@END(@priority)
          @START(@text)Train new employees@END(@text)
        @END(item)
      @END(items)
    `);

    const result = engine.mapSelect({
      items: {
        item: [{
          $category: String,
          $priority: Number,
          $text: String
        }]
      }
    });

    expect(result).toEqual({
      items: {
        item: [{
          $category: 'Urgent',
          $priority: 5,
          $text: 'Fix critical server issue'
        }, {
          $category: 'High',
          $priority: 4,
          $text: 'Update security protocols'
        }, {
          $category: 'Medium',
          $priority: 3,
          $text: 'Train new employees'
        }]
      }
    });
  })

  test('should handle incomplete nested tag structures appropriately', () => {
    const engine = new IncomingIdioParserSelectorEngine();
    
    // Add partial structure
    engine.add('@START(colors)@START(color)');
    
    const result = engine.mapSelect({
      colors: {
        color: [String]
      }
    });

    expect(result).toEqual({
      colors: {
        color: ['']  // Empty string for incomplete tag
      }
    });
    
    // Add the rest
    engine.add('red@END(color)@END(colors)');
    
    const completeResult = engine.mapSelect({
      colors: {
        color: [String]
      }
    });

    expect(completeResult).toEqual({
      colors: {
        color: ['red']
      }
    });
  });
}); 