import IncomingIdioParserSelectorEngine from '../src/parsers/IncomingIdioParserSelectorEngine.mjs';
import types from '../src/types';

describe('Schema and Hints Scaffold Generation for Idio', () => {
  let engine;

  beforeEach(() => {
    engine = new IncomingIdioParserSelectorEngine();
  });

  test('should generate basic scaffold using hints where available', () => {
    const schema = {
      analysis: {
        summary: String,
        findings: {
          finding: [{
            severity: String,
            impact: Number,
            description: String,
            details: {
              mitigation: String,
              timeline: String
            }
          }]
        }
      }
    };

    const hints = {
      analysis: {
        summary: "A 2-3 sentence overview of the security assessment",
        findings: {
          finding: [{
            severity: "Either 'High', 'Medium', or 'Low'",
            impact: "Impact score from 1-10",
            description: "Brief description of the security issue",
            details: {
              mitigation: "Steps to fix the issue",
              // Note: no hint for timeline - should use generic placeholder
            }
          }]
        }
      }
    };

    const scaffold = IncomingIdioParserSelectorEngine.makeMapSelectScaffold(schema, hints);
    const normalized = scaffold.replace(/\s+/g, ' ').trim();

    // The scaffold should use hints where available and fallback to generic placeholders
    expect(normalized).toContain('@START(summary)A 2-3 sentence overview of the security assessment@END(summary)');
    expect(normalized).toContain('@START(severity)Either \'High\', \'Medium\', or \'Low\'@END(severity)');
    expect(normalized).toContain('@START(impact)Impact score from 1-10@END(impact)');
    expect(normalized).toContain('@START(mitigation)Steps to fix the issue@END(mitigation)');
    expect(normalized).toContain('@START(timeline)...String...@END(timeline)');

    // Should include example structure
    expect(normalized).toContain('@START(finding)');
    expect(normalized).toContain('@END(finding)');
    expect(normalized).toContain('@START(finding)');  // Second example
    expect(normalized).toContain('/*etc.*/');  // Indicate more can follow
  });

  test('should handle array hints correctly', () => {
    const schema = {
      tags: {
        tag: [String]
      },
      items: {
        item: [{
          priority: Number,
          description: String
        }]
      }
    };

    const hints = {
      tags: {
        tag: "A relevant keyword or category"  // Single hint for array items
      },
      items: {
        item: [{
          priority: "Priority from 1-5 (1 is highest)",
          description: "Description of the task"
        }]
      }
    };

    const scaffold = IncomingIdioParserSelectorEngine.makeMapSelectScaffold(schema, hints);
    const normalized = scaffold.replace(/\s+/g, ' ').trim();

    // Should show multiple examples for arrays
    expect(normalized).toContain('@START(tag) A relevant keyword or category @END(tag)');
    expect(normalized).toContain('@START(priority)Priority from 1-5 (1 is highest)@END(priority)');
    expect(normalized).toContain('@START(description)Description of the task@END(description)');
    
    // Should show multiple examples for arrays
    expect((normalized.match(/@START\(tag\)/g) || []).length).toBe(2);
  });

  test('should handle missing hints gracefully', () => {
    const schema = {
      user: {
        id: Number,
        profile: {
          name: String,
          age: Number,
          bio: String
        }
      }
    };

    // Only partial hints
    const hints = {
      user: {
        profile: {
          name: "User's full name",
          // No hints for other fields
        }
      }
    };

    const scaffold = IncomingIdioParserSelectorEngine.makeMapSelectScaffold(schema, hints);
    const normalized = scaffold.replace(/\s+/g, ' ').trim();

    // Should use hints where available
    expect(normalized).toContain('@START(name)User\'s full name@END(name)');
    
    // Should use generic placeholders for missing hints
    expect(normalized).toContain('@START(id)...Number...@END(id)');
    expect(normalized).toContain('@START(age)...Number...@END(age)');
    expect(normalized).toContain('@START(bio)...String...@END(bio)');
  });

  test('should handle complex nested structures', () => {
    const schema = {
      book: {
        isbn: String,
        chapters: {
          chapter: [{
            number: Number,
            title: String,
            sections: {
              section: [{
                id: String,
                content: String
              }]
            }
          }]
        }
      }
    };

    const hints = {
      book: {
        isbn: "ISBN-13 format (e.g. 978-3-16-148410-0)",
        chapters: {
          chapter: [{
            number: "Chapter number",
            title: "Chapter title",
            sections: {
              section: [{
                id: "Section identifier (e.g. 1.1, 1.2)",
                content: "Section content with proper academic language"
              }]
            }
          }]
        }
      }
    };

    const scaffold = IncomingIdioParserSelectorEngine.makeMapSelectScaffold(schema, hints);
    const normalized = scaffold.replace(/\s+/g, ' ').trim();

    // Should maintain proper nesting
    expect(normalized).toMatch(/@START\(book\).*@START\(chapters\).*@START\(chapter\).*@START\(sections\).*@START\(section\)/);
    
    // Should include hints at all levels
    expect(normalized).toContain('@START(isbn)ISBN-13 format');
    expect(normalized).toContain('@START(number)Chapter number@END(number)');
    expect(normalized).toContain('@START(title)Chapter title@END(title)');
    expect(normalized).toContain('@START(id)Section identifier');
    expect(normalized).toContain('@START(content)Section content with proper academic language@END(content)');
  });

  test('should handle string literals as pure hints', () => {
    const schema = {
      person: {
        name: 'Full name',                    // Pure hint
        age: Number,                          // Type only
        status: String,                       // Type only
        role: 'Admin/User/Guest',             // Pure hint
        details: {
          type: 'Basic/Premium',              // Pure hint
          level: Number,                      // Type only
          bio: String,                        // Type only
          notes: 'Additional observations'     // Pure hint
        }
      }
    };

    const scaffold = IncomingIdioParserSelectorEngine.makeMapSelectScaffold(schema);
    const normalized = scaffold.replace(/\s+/g, ' ').trim();

    // String literals should appear as pure hints without type annotations
    expect(normalized).toContain('@START(name)Full name@END(name)');
    expect(normalized).toContain('@START(role)Admin/User/Guest@END(role)');
    expect(normalized).toContain('@START(type)Basic/Premium@END(type)');
    expect(normalized).toContain('@START(notes)Additional observations@END(notes)');

    // Regular types should have type annotations
    expect(normalized).toContain('@START(age)...Number...@END(age)');
    expect(normalized).toContain('@START(status)...String...@END(status)');
    expect(normalized).toContain('@START(level)...Number...@END(level)');
    expect(normalized).toContain('@START(bio)...String...@END(bio)');
  });

  test('Enums', () => {
    const schema = {
      person: {
        name: types.enum(null, ['John', 'Jane', 'Doe'])
      }
    };

    const scaffold = IncomingIdioParserSelectorEngine.makeMapSelectScaffold(schema);
    const normalized = scaffold.replace(/\s+/g, ' ').trim();

    expect(normalized).toContain('@START(person) @START(name)...Allowed values: "John" or "Jane" or "Doe"...@END(name) @END(person)');
  });

  test('should generate scaffold with attributes', () => {
    const schema = {
      user: {
        $id: Number,
        $type: String,
        name: String,
        details: {
          $role: 'admin/user/guest',
          $level: Number,
          bio: String
        }
      }
    };

    const scaffold = IncomingIdioParserSelectorEngine.makeMapSelectScaffold(schema);

    expect(scaffold).toBe(`
@START(user)
  @START(@id)...Number...@END(@id)
  @START(@type)...String...@END(@type)
  @START(name)...String...@END(name)
  @START(details)
    @START(@role)admin/user/guest@END(@role)
    @START(@level)...Number...@END(@level)
    @START(bio)...String...@END(bio)
  @END(details)
@END(user)
    `.trim() + '\n');
  });

  test('should handle types.items() correctly', () => {
    const schema = {
      data: {
        // Simple array of strings
        tags: types.items(types.string("A tag name")),
        
        // Array with attributes
        tasks: types.items({
          $priority: types.string("Priority level"),
          description: types.string("Task description")
        }),
        
        // Nested arrays
        categories: types.items({
          name: types.string("Category name"),
          items: types.items(types.string("Item in category"))
        })
      }
    };

    const scaffold = IncomingIdioParserSelectorEngine.makeMapSelectScaffold(schema);
    const normalized = scaffold.replace(/\s+/g, ' ').trim();

    // Simple array
    expect(normalized).toContain('@START(tags)');
    expect(normalized).toContain('@START(item) ...String: A tag name... @END(item)');
    
    // Array with attributes
    expect(normalized).toContain('@START(tasks)');
    expect(normalized).toContain('@START(@priority)...String: Priority level...@END(@priority)');
    expect(normalized).toContain('@START(description)...String: Task description...@END(description)');
    
    // Nested arrays
    expect(normalized).toContain('@START(categories)');
    expect(normalized).toContain('@START(name)...String: Category name...@END(name)');
    expect(normalized).toContain('@START(items)');
    expect(normalized).toContain('@START(item) ...String: Item in category... @END(item)');

    // Should show multiple examples and /*etc*/
    expect(normalized).toMatch(/@START\(item\).*@END\(item\).*@START\(item\).*@END\(item\).*\/\*etc\.\*\//);
  });

  test('should handle types.items() with transforms and defaults', () => {
    const schema = {
      data: {
        numbers: types.items(
          types.number("A number")
            .withTransform(n => n * 2)
        )
        .withDefault([1, 2, 3])
        .withTransform(arr => arr.filter(n => n > 0))
      }
    };

    const scaffold = IncomingIdioParserSelectorEngine.makeMapSelectScaffold(schema);
    const normalized = scaffold.replace(/\s+/g, ' ').trim();

    expect(normalized).toContain('@START(numbers)');
    expect(normalized).toContain('@START(item) ...Number: A number... @END(item)');
    expect(normalized).toContain('/*etc.*/');
  });

  test('should generate scaffold with custom markers', () => {
    const engine = new IncomingIdioParserSelectorEngine({
      openTagPrefix: '[[',
      closeTagPrefix: '[[',
      tagOpener: 'BEGIN(',
      tagCloser: 'FINISH(',
      tagSuffix: ')]]'
    });

    const schema = {
      items: {
        item: [{
          $category: String,
          $priority: Number,
          $$text: String
        }]
      }
    };

    const scaffold = engine.makeMapSelectScaffold(schema);
    const normalized = scaffold.replace(/\s+/g, ' ').trim();

    // The expected scaffold should use the custom markers
    expect(normalized).toBe(
      '[[BEGIN(items)]] ' +
      '[[BEGIN(item)]] ' +
      '[[BEGIN(@category)]]...String...[[FINISH(@category)]] ' +
      '[[BEGIN(@priority)]]...Number...[[FINISH(@priority)]] ' +
      '...String... ' +
      '[[FINISH(item)]] ' +
      '[[BEGIN(item)]] ' +
      '[[BEGIN(@category)]]...String...[[FINISH(@category)]] ' +
      '[[BEGIN(@priority)]]...Number...[[FINISH(@priority)]] ' +
      '...String... ' +
      '[[FINISH(item)]] ' +
      '/*etc.*/ ' +
      '[[FINISH(items)]]'
    );
  });
});
