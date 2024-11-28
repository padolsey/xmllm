import IncomingXMLParserSelectorEngine from '../src/IncomingXMLParserSelectorEngine';

describe('Schema and Hints Scaffold Generation', () => {
  let engine;

  beforeEach(() => {
    engine = new IncomingXMLParserSelectorEngine();
  });

  test('should generate scaffold using hints where available', () => {
    const schema = {
      analysis: {
        summary: String,
        findings: {
          finding: [{
            $severity: String,
            $impact: Number,
            $text: String,
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
            $severity: "Either 'High', 'Medium', or 'Low'",
            $impact: "Impact score from 1-10",
            $text: "Brief description of the security issue",
            details: {
              mitigation: "Steps to fix the issue",
              // Note: no hint for timeline - should use generic placeholder
            }
          }]
        }
      }
    };

    const scaffold = IncomingXMLParserSelectorEngine.makeMapSelectXMLScaffold(schema, hints);
    const normalized = scaffold.replace(/\s+/g, ' ').trim();

    // The scaffold should use hints where available and fallback to generic placeholders
    expect(normalized).toContain('<summary>A 2-3 sentence overview of the security assessment</summary>');
    expect(normalized).toContain('severity="Either \'High\', \'Medium\', or \'Low\'"');
    expect(normalized).toContain('impact="Impact score from 1-10"');
    expect(normalized).toContain('<mitigation>Steps to fix the issue</mitigation>');
    expect(normalized).toContain('<timeline>...text content...</timeline>');

    // Should include example structure
    expect(normalized).toContain('<finding');
    expect(normalized).toContain('</finding>');
    expect(normalized).toContain('<finding');  // Second example
    expect(normalized).toContain('/*etc.*/');  // Indicate more can follow
  });

  test('should handle array hints correctly', () => {
    const schema = {
      tags: {
        tag: [String]
      },
      items: {
        item: [{
          $priority: Number,
          $text: String
        }]
      }
    };

    const hints = {
      tags: {
        tag: "A relevant keyword or category"  // Single hint for array items
      },
      items: {
        item: [{
          $priority: "Priority from 1-5 (1 is highest)",
          $text: "Description of the task"
        }]
      }
    };

    const scaffold = IncomingXMLParserSelectorEngine.makeMapSelectXMLScaffold(schema, hints);
    const normalized = scaffold.replace(/\s+/g, ' ').trim();

    // Should show multiple examples for arrays
    expect(normalized).toContain('<tag> A relevant keyword or category </tag>');
    expect(normalized).toContain('<tag> A relevant keyword or category </tag>');
    expect(normalized).toContain('priority="Priority from 1-5 (1 is highest)"');
    expect(normalized).toContain('Description of the task');
  });

  test('should handle missing hints gracefully', () => {
    const schema = {
      user: {
        $id: Number,
        profile: {
          $tagname: String,
          $age: Number,
          $text: String
        }
      }
    };

    // Only partial hints
    const hints = {
      user: {
        profile: {
          $tagname: "User's full name",
          // No hints for other fields
        }
      }
    };

    const scaffold = IncomingXMLParserSelectorEngine.makeMapSelectXMLScaffold(schema, hints);
    const normalized = scaffold.replace(/\s+/g, ' ').trim();

    // Should use hints where available
    expect(normalized).toContain('name="User\'s full name"');
    
    // Should use generic placeholders for missing hints
    expect(normalized).toContain('id="..."');
    expect(normalized).toContain('age="..."');
    expect(normalized).toContain('...text content...');
  });

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
                $text: String
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
                $text: "Section content with proper academic language"
              }]
            }
          }]
        }
      }
    };

    const scaffold = IncomingXMLParserSelectorEngine.makeMapSelectXMLScaffold(schema, hints);
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
}); 