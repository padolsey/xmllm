import IncomingXMLParserSelectorEngine from '../src/parsers/IncomingXMLParserSelectorEngine';

describe('Schema and Hints Validation', () => {
  let engine;

  beforeEach(() => {
    engine = new IncomingXMLParserSelectorEngine();
  });

  test('should validate hints against schema structure', () => {
    const schema = {
      people: {
        person: [{
          $$tagname: String,
          $age: Number,
          $$text: String
        }]
      }
    };

    // Valid hints - everything in hints exists in schema
    const validHints = {
      people: {
        person: [{
          $$tagname: "their full name",
          $$text: "their bio"
          // Note: $age doesn't need a hint, that's fine
        }]
      }
    };

    // This should work fine
    expect(() => {
      IncomingXMLParserSelectorEngine.validateHints(schema, validHints);
    }).not.toThrow();

    // Invalid hints - contains fields not in schema
    const invalidHints = {
      people: {
        person: [{
          $$tagname: "their full name",
          $location: "where they live",  // This isn't in the schema!
          $$text: "their bio"
        }]
      }
    };

    // This should throw
    expect(() => {
      IncomingXMLParserSelectorEngine.validateHints(schema, invalidHints);
    }).toThrow('Hint "$location" has no corresponding schema definition');

    // Invalid hints - wrong structure
    const wrongStructureHints = {
      people: {
        person: {  // Should be an array!
          $$tagname: "their full name"
        }
      }
    };

    expect(() => {
      IncomingXMLParserSelectorEngine.validateHints(schema, wrongStructureHints);
    }).toThrow('Hints at people.person must be array or string for array schema');
  });

  test('should handle nested structures in validation', () => {
    const schema = {
      company: {
        departments: {
          department: [{
            $$tagname: String,
            employees: {
              employee: [{
                $id: Number,
                $role: String
              }]
            }
          }]
        }
      }
    };

    // Valid nested hints
    const validHints = {
      company: {
        departments: {
          department: [{
            $$tagname: "department name",
            employees: {
              employee: [{
                $role: "their job title"  // $id doesn't need a hint
              }]
            }
          }]
        }
      }
    };

    expect(() => {
      IncomingXMLParserSelectorEngine.validateHints(schema, validHints);
    }).not.toThrow();

    // Invalid nested structure
    const invalidHints = {
      company: {
        departments: {
          department: [{
            $$tagname: "department name",
            employees: {
              employee: [{
                $role: "their job title",
                $salary: "their yearly salary"  // This isn't in schema!
              }]
            }
          }]
        }
      }
    };

    expect(() => {
      IncomingXMLParserSelectorEngine.validateHints(schema, invalidHints);
    }).toThrow('Hint "$salary" has no corresponding schema definition');
  });

  test('should handle array syntax variations', () => {
    const schema = {
      tags: {
        tag: [String]  // Array syntax
      },
      items: {
        item: Array(String)  // Alternative array syntax
      }
    };

    // Both hint styles should work
    const validHints = {
      tags: {
        tag: ["a descriptive tag"]
      },
      items: {
        item: "an item in the list"
      }
    };

    expect(() => {
      IncomingXMLParserSelectorEngine.validateHints(schema, validHints);
    }).not.toThrow();
  });

  test('should reject schemas with duplicate attribute/property names', () => {
    const invalidSchemas = [
      {
        person: {
          $name: String,
          name: String
        }
      },
      {
        user: {
          details: {
            $role: String,
            role: String
          }
        }
      }
    ];

    invalidSchemas.forEach(schema => {
      expect(() => {
        (new IncomingXMLParserSelectorEngine()).validateSchema(schema);
      }).toThrow(/Cannot have both property .* and attribute/);
    });

    // Valid schema should pass
    const validSchema = {
      person: {
        $name: String,
        fullName: String,
        age: Number
      }
    };

    expect(() => {
      (new IncomingXMLParserSelectorEngine()).validateSchema(validSchema);
    }).not.toThrow();
  });

  test('should allow $$text alongside $text attribute', () => {
    const schema = {
      element: {
        $text: String,    // Attribute
        $$text: String,   // Special text content property
        otherProp: String
      }
    };

    expect(() => {
      (new IncomingXMLParserSelectorEngine()).validateSchema(schema);
    }).not.toThrow();

    // But should still catch other duplicates
    const invalidSchema = {
      element: {
        $text: String,
        $$text: String,
        otherProp: String,
        $otherProp: String  // This should fail
      }
    };

    expect(() => {
      (new IncomingXMLParserSelectorEngine()).validateSchema(invalidSchema);
    }).toThrow(/Cannot have both property/);
  });
}); 