import IncomingXMLParserSelectorEngine from '../src/parsers/IncomingXMLParserSelectorEngine';
import types from '../src/types';

describe('Schema and Hints Scaffold Generation', () => {
  let engine;

  beforeEach(() => {
    engine = new IncomingXMLParserSelectorEngine();
  });

  // test('should generate scaffold using hints where available', () => {
  //   const schema = {
  //     analysis: {
  //       summary: types.string('the summary'),
  //       findings: {
  //         finding: [{
  //           $severity: String,
  //           $impact: Number,
  //           $$text: String,
  //           details: {
  //             mitigation: String,
  //             timeline: String
  //           }
  //         }]
  //       }
  //     }
  //   };

  //   const hints = {
  //     analysis: {
  //       summary: "A 2-3 sentence overview of the security assessment",
  //       findings: {
  //         finding: [{
  //           $severity: "Either 'High', 'Medium', or 'Low'",
  //           $impact: "Impact score from 1-10",
  //           $$text: "Brief description of the security issue",
  //           details: {
  //             mitigation: "Steps to fix the issue",
  //             // Note: no hint for timeline - should use generic placeholder
  //           }
  //         }]
  //       }
  //     }
  //   };

  //   const scaffold = IncomingXMLParserSelectorEngine.makeMapSelectScaffold(schema, hints);
  //   const normalized = scaffold.replace(/\s+/g, ' ').trim();

  //   // The scaffold should use hints where available and fallback to generic placeholders
  //   expect(normalized).toContain('<summary>A 2-3 sentence overview of the security assessment</summary>');
  //   expect(normalized).toContain('severity="Either \'High\', \'Medium\', or \'Low\'"');
  //   expect(normalized).toContain('impact="Impact score from 1-10"');
  //   expect(normalized).toContain('<mitigation>Steps to fix the issue</mitigation>');
  //   expect(normalized).toContain('<timeline>{String}</timeline>');

  //   // Should include example structure
  //   expect(normalized).toContain('<finding');
  //   expect(normalized).toContain('</finding>');
  //   expect(normalized).toContain('<finding');  // Second example
  //   expect(normalized).toContain('/*etc.*/');  // Indicate more can follow
  // });

  // test('should handle array hints correctly', () => {
  //   const schema = {
  //     tags: {
  //       tag: [String]
  //     },
  //     items: {
  //       item: [{
  //         $priority: Number,
  //         $$text: String
  //       }]
  //     }
  //   };

  //   const hints = {
  //     tags: {
  //       tag: "A relevant keyword or category"  // Single hint for array items
  //     },
  //     items: {
  //       item: [{
  //         $priority: "Priority from 1-5 (1 is highest)",
  //         $$text: "Description of the task"
  //       }]
  //     }
  //   };

  //   const scaffold = IncomingXMLParserSelectorEngine.makeMapSelectScaffold(schema, hints);
  //   const normalized = scaffold.replace(/\s+/g, ' ').trim();

  //   // Should show multiple examples for arrays
  //   expect(normalized).toContain('<tag> A relevant keyword or category </tag>');
  //   expect(normalized).toContain('<tag> A relevant keyword or category </tag>');
  //   expect(normalized).toContain('priority="Priority from 1-5 (1 is highest)"');
  //   expect(normalized).toContain('Description of the task');
  // });

  // test('should handle missing hints gracefully', () => {
  //   const schema = {
  //     user: {
  //       $id: Number,
  //       profile: {
  //         $name: String,
  //         $age: Number,
  //         $$text: String
  //       }
  //     }
  //   };

  //   // Only partial hints
  //   const hints = {
  //     user: {
  //       profile: {
  //         $name: "User's full name",
  //         // No hints for other fields
  //       }
  //     }
  //   };

  //   const scaffold = IncomingXMLParserSelectorEngine.makeMapSelectScaffold(schema, hints);
  //   const normalized = scaffold.replace(/\s+/g, ' ').trim();

  //   // Should use hints where available
  //   expect(normalized).toContain('name="User\'s full name"');
    
  //   // Should use generic placeholders for missing hints
  //   expect(normalized).toContain('id="{Number}"');
  //   expect(normalized).toContain('age="{Number}"');
  //   expect(normalized).toContain('{String}');
  // });

  test('should handle complex nested structures', () => {
    const schema = {
      book: {
        $isbn: String,
        chapters: {
          chapter: [{
            $number: Number,
            title: String,
            sections: {
              section: [{
                $id: String,
                $$text: String
              }]
            }
          }]
        }
      }
    };

    const hints = {
      book: {
        $isbn: "ISBN-13 format (e.g. 978-3-16-148410-0)",
        chapters: {
          chapter: [{
            $number: "Chapter number",
            title: "Chapter title",
            sections: {
              section: [{
                $id: "Section identifier (e.g. 1.1, 1.2)",
                $$text: "Section content with proper academic language"
              }]
            }
          }]
        }
      }
    };

    const scaffold = IncomingXMLParserSelectorEngine.makeMapSelectScaffold(schema, hints);
    const normalized = scaffold.replace(/\s+/g, ' ').trim();

    // Should maintain proper nesting
    expect(normalized).toMatch(/<book.*>.*<chapters.*>.*<chapter.*>.*<sections.*>.*<section.*>/);
    
    // Should include hints at all levels
    expect(normalized).toContain('isbn="ISBN-13 format');
    expect(normalized).toContain('number="Chapter number"');
    expect(normalized).toContain('<title>Chapter title</title>');
    expect(normalized).toContain('id="Section identifier');
    expect(normalized).toContain('Section content with proper academic language');
  });

  test('should show type hints in curly braces and combine with explicit hints', () => {
    const schema = {
      person: {
        name: String,
        age: Number,
        active: Boolean,
        details: {
          $type: String,
          $score: Number,
          bio: String
        }
      }
    };

    // Test without hints first
    const basicScaffold = IncomingXMLParserSelectorEngine.makeMapSelectScaffold(schema);
    const normalized = basicScaffold.replace(/\s+/g, ' ').trim();

    // Should show type hints in curly braces
    expect(normalized).toContain('<name>{String}</name>');
    expect(normalized).toContain('<age>{Number}</age>');
    expect(normalized).toContain('<active>{Boolean}</active>');
    expect(normalized).toContain('type="{String}"');
    expect(normalized).toContain('score="{Number}"');
    expect(normalized).toContain('<bio>{String}</bio>');

    // Now test with hints
    const hints = {
      person: {
        name: "The person's full name",
        age: "Age in years",
        details: {
          bio: "A brief biography"
        }
      }
    };

    const hintedScaffold = IncomingXMLParserSelectorEngine.makeMapSelectScaffold(schema, hints);
    const normalizedHinted = hintedScaffold.replace(/\s+/g, ' ').trim();

    // Should combine type hints with explicit hints
    expect(normalizedHinted).toContain('<name>The person\'s full name</name>');
    expect(normalizedHinted).toContain('<age>Age in years</age>');
  expect(normalizedHinted).toContain('<active>{Boolean}</active>'); // No hint, just type
    expect(normalizedHinted).toContain('<bio>A brief biography</bio>');
  });

  test('should handle array types with curly hints', () => {
    const schema = {
      tags: {
        tag: [String]
      },
      scores: {
        score: [Number]
      }
    };

    const hints = {
      tags: {
        tag: "A descriptive tag"
      }
    };

    const scaffold = IncomingXMLParserSelectorEngine.makeMapSelectScaffold(schema, hints);
    const normalized = scaffold.replace(/\s+/g, ' ').trim();

    // Array items should show type + hint when available
    expect(normalized).toContain('<tag> A descriptive tag </tag>');
    // Array items without hints should just show type
    expect(normalized).toContain('<score> {Number} </score>');
    // Should still show multiple examples
    expect(normalized.match(/<tag>/g).length).toBe(2);
    expect(normalized.match(/<score>/g).length).toBe(2);
  });

  test('should handle string literals as pure hints without type annotations', () => {
    const schema = {
      person: {
        name: 'Full name',                    // Pure hint
        age: Number,                          // Type only
        status: String,                       // Type only
        role: 'Admin/User/Guest',             // Pure hint
        details: {
          $type: 'Basic/Premium',             // Pure hint for attribute
          $level: Number,                     // Type for attribute
          bio: String,                        // Type only
          notes: 'Additional observations'     // Pure hint
        }
      }
    };

    const scaffold = IncomingXMLParserSelectorEngine.makeMapSelectScaffold(schema);
    const normalized = scaffold.replace(/\s+/g, ' ').trim();

    // String literals should appear as pure hints without type annotations
    expect(normalized).toContain('<name>Full name</name>');
    expect(normalized).toContain('<role>Admin/User/Guest</role>');
    expect(normalized).toContain('type="Basic/Premium"');
    expect(normalized).toContain('<notes>Additional observations</notes>');

    // Regular types should have type annotations
    expect(normalized).toContain('<age>{Number}</age>');
    expect(normalized).toContain('<status>{String}</status>');
    expect(normalized).toContain('level="{Number}"');
    expect(normalized).toContain('<bio>{String}</bio>');
  });

  test('should combine explicit hints with types but use string literals as pure hints', () => {
    const schema = {
      user: {
        name: 'Full name here',           // Pure hint
        age: Number,                      // Type only
        bio: String                       // Type only
      }
    };

    const hints = {
      user: {
        age: "STRING!! User's age in years",
        bio: "Brief biography"
      }
    };

    const scaffold = IncomingXMLParserSelectorEngine.makeMapSelectScaffold(schema, hints);
    const normalized = scaffold.replace(/\s+/g, ' ').trim();

    // String literal should be used directly without type annotation
    expect(normalized).toContain('<name>Full name here</name>');
    
    // Types with hints should show both
    expect(normalized).toContain('<age>STRING!! User\'s age in years</age>');
    expect(normalized).toContain('<bio>Brief biography</bio>');
  });

  test('Enums', () => {
    const schema = {
      person: {
        name: types.enum(null, ['John', 'Jane', 'Doe'])
      }
    };

    const scaffold = IncomingXMLParserSelectorEngine.makeMapSelectScaffold(schema);
    const normalized = scaffold.replace(/\s+/g, ' ').trim();

    expect(normalized).toContain('<name>{Allowed values: "John" or "Jane" or "Doe"}</name>');
  });

  test('handles primitive types consistently in different contexts', () => {
    const schema = {
      root: {
        // Direct primitive
        name: String,
        // In array
        tags: [String],
        // In object text
        details: {
          $$text: String,
          $type: Number
        }
      }
    };
    
    const scaffold = IncomingXMLParserSelectorEngine.makeMapSelectScaffold(schema);
    const normalized = scaffold.replace(/\s+/g, ' ').trim();
    
    // Should show {String} consistently - no extra spaces around type hint
    expect(normalized).toContain('<name>{String}</name>');
    expect(normalized).toContain('<tags> {String} </tags>');
    expect(normalized).toMatch(/<details[^>]*> {String}/);
  });

  test('handles deeply nested arrays correctly', () => {
    const schema = {
      root: {
        sections: [{
          items: [{
            values: [String]
          }]
        }]
      }
    };
    
    const scaffold = IncomingXMLParserSelectorEngine.makeMapSelectScaffold(schema);
    const normalized = scaffold.replace(/\s+/g, ' ').trim();

    // Should show proper nesting structure
    expect(normalized).toMatch(
      /<root>.*?<sections>.*?<items>.*?<values>.*?{String}.*?<\/values>.*?<\/items>.*?<\/sections>.*?<\/root>/
    );

    // Should show two examples at each array level
    const sectionsCount = (normalized.match(/<sections>/g) || []).length;
    const itemsCount = (normalized.match(/<items>/g) || []).length;
    const valuesCount = (normalized.match(/<values>/g) || []).length;

    expect(sectionsCount).toBe(2); // Two section examples
    expect(itemsCount).toBe(4);    // Two items per section
    expect(valuesCount).toBe(8);   // Two values per item
  });
}); 