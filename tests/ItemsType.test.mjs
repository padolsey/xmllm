import IncomingXMLParserSelectorEngine from '../src/parsers/IncomingXMLParserSelectorEngine';
import IncomingIdioParserSelectorEngine from '../src/parsers/IncomingIdioParserSelectorEngine';
import { types } from '../src/types.mjs';

describe('ItemsType', () => {
  let engine;

  beforeEach(() => {
    engine = new IncomingXMLParserSelectorEngine();
  });

  test('should handle basic string items', () => {
    engine.add(`
      <colors>
        <item>red</item>
        <item>blue</item>
        <item>green</item>
      </colors>
    `);

    const result = engine.mapSelect({
      colors: types.items(types.string('A color'))
    });

    expect(result).toEqual({
      colors: ['red', 'blue', 'green']
    });
  });

  test('should handle complex item types', () => {
    engine.add(`
      <people>
        <item>
          <name>John</name>
          <age>30</age>
        </item>
        <item>
          <name>Jane</name>
          <age>25</age>
        </item>
      </people>
    `);

    const result = engine.mapSelect({
      people: types.items({
        name: types.string('Person name'),
        age: types.number('Person age')
      })
    });

    expect(result).toEqual({
      people: [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 }
      ]
    });
  });

  test('should handle empty arrays', () => {
    engine.add('<colors></colors>');

    const result = engine.mapSelect({
      colors: types.items(types.string('A color'))
    });

    expect(result).toEqual({
      colors: []
    });
  });

  test('should handle nested items', () => {
    engine.add(`
      <departments>
        <item>
          <name>Engineering</name>
          <employees>
            <item>Alice</item>
            <item>Bob</item>
          </employees>
        </item>

      </departments>
    `);

  //   <item>
  //   <name>Sales</name>
  //   <employees>
  //     <item>Charlie</item>
  //   </employees>
  // </item>

    const result = engine.mapSelect({
      departments: types.items({
        name: types.string('Department name'),
        employees: types.items(types.string('Employee name'))
      })
    });

    expect(result).toEqual({
      departments: [
        {
          name: 'Engineering',
          employees: ['Alice', 'Bob']
        },
        // {
        //   name: 'Sales',
        //   employees: ['Charlie']
        // }
      ]
    });
  });

  test('should handle items with attributes', () => {
    engine.add(`
      <tasks>
        <item priority="high" due="2024-03-20">Complete project</item>
        <item priority="low" due="2024-03-25">Review code</item>
      </tasks>
    `);

    const result = engine.mapSelect({
      tasks: types.items({
        $priority: types.string('Task priority'),
        $due: types.string('Due date'),
        $$text: types.string('Task description')
      })
    });

    expect(result).toEqual({
      tasks: [
        {
          $priority: 'high',
          $due: '2024-03-20',
          $$text: 'Complete project'
        },
        {
          $priority: 'low',
          $due: '2024-03-25',
          $$text: 'Review code'
        }
      ]
    });
  });

  test('should handle transformation and ad-hoc validation', () => {
    engine.add(`
      <scores>
        <item>85</item>
        <item>92</item>
        <item>invalid</item>
        <item>78</item>
      </scores>
    `);

    const result = engine.mapSelect({
      scores: types.items(
        types.number('Score')
          .withTransform(n => {
            if (isNaN(n)) {
              return 50;
            }
            return Math.round(n);
          })
          .withDefault(0)
      )
    });

    expect(result).toEqual({
      scores: [85, 92, 50, 78]
    });
  });

  test('should handle mixed content types', () => {
    engine.add(`
      <data>
        <item>plain text</item>
        <item><nested>structured</nested></item>
        <item priority="high">with attributes</item>
      </data>
    `);
    // Test handling different item structures
  });

  test('should validate item types appropriately', () => {
    // These should throw with specific error messages
    expect(() => engine.mapSelect({
      data: types.items(undefined)
    })).toThrow('ItemsType requires an itemType');

    expect(() => engine.mapSelect({
      data: types.items([])
    })).toThrow('ItemsType itemType must be an object');

    expect(() => engine.mapSelect({
      data: types.items(123)
    })).toThrow('ItemsType itemType must be an object');

    // These should work fine
    engine.add(`
      <data>
        <item>test</item>
      </data>
    `);

    // With string type (explicit)
    expect(engine.mapSelect({
      data: types.items(types.string())
    })).toEqual({
      data: ['test']
    });

    // With string literal (converted to StringType)
    // (ensure to NOT dedupe since we want to test the same
    //  stuff already mapSelect'd from the engine)
    expect(engine.mapSelect({
      data: types.items('A hint')
    }, false, false)).toEqual({
      data: ['test']
    });

    // With String constructor
    expect(engine.mapSelect({
      data: types.items(String)
    }, false, false)).toEqual({
      data: ['test']
    });
  });

  test('should preserve type transformations on items', () => {
    engine.add(`
      <numbers>
        <item>1</item>
        <item>2</item>
      </numbers>
    `);
    
    const result = engine.mapSelect({
      numbers: types.items(
        types.number().withTransform(n => n * 2)
      )
    });
    
    expect(result).toEqual({
      numbers: [2, 4]
    });
  });

  test('should handle deeply nested item structures', () => {
    engine.add(`
      <people>
        <item>
          <name>John</name>
          <age>30</age>
          <hobbies>
            <item name="Reading" priority="high">
              <description>Sci-fi novels</description>
              <schedule>
                <item day="Monday">Evening</item>
                <item day="Friday">Afternoon</item>
              </schedule>
            </item>
            <item name="Gaming" priority="medium">
              <description>Strategy games</description>
              <schedule>
                <item day="Weekend">Morning</item>
              </schedule>
            </item>
          </hobbies>
        </item>
        <item>
          <name>Jane</name>
          <age>25</age>
          <hobbies>
            <item name="Painting" priority="high">
              <description>Oil painting</description>
              <schedule>
                <item day="Wednesday">Evening</item>
              </schedule>
            </item>
          </hobbies>
        </item>
      </people>
    `);

    const result = engine.mapSelect({
      people: types.items({
        name: types.string('Person name'),
        age: types.number('Age'),
        hobbies: types.items({
          $name: types.string('Hobby name'),
          $priority: types.string('Priority level'),
          description: types.string('Description'),
          schedule: types.items({
            $day: types.string('Day of week'),
            $$text: types.string('Time of day')
          })
        })
      })
    });

    expect(result).toEqual({
      people: [
        {
          name: 'John',
          age: 30,
          hobbies: [
            {
              $name: 'Reading',
              $priority: 'high',
              description: 'Sci-fi novels',
              schedule: [
                { $day: 'Monday', $$text: 'Evening' },
                { $day: 'Friday', $$text: 'Afternoon' }
              ]
            },
            {
              $name: 'Gaming',
              $priority: 'medium',
              description: 'Strategy games',
              schedule: [
                { $day: 'Weekend', $$text: 'Morning' }
              ]
            }
          ]
        },
        {
          name: 'Jane',
          age: 25,
          hobbies: [
            {
              $name: 'Painting',
              $priority: 'high',
              description: 'Oil painting',
              schedule: [
                { $day: 'Wednesday', $$text: 'Evening' }
              ]
            }
          ]
        }
      ]
    });
  });

  test('should handle string literals as item types', () => {
    engine.add(`
      <data>
        <item>test</item>
      </data>
    `);

    const result = engine.mapSelect({
      data: types.items('A hint')
    });

    expect(result).toEqual({
      data: ['test']
    });
  });

});

describe('ItemsType validation', () => {
  test('should throw on undefined/null itemType', () => {
    expect(() => types.items()).toThrow('ItemsType requires an itemType');
    expect(() => types.items(null)).toThrow('ItemsType requires an itemType');
  });

  test('should throw on invalid itemType', () => {
    expect(() => types.items([])).toThrow();
    expect(() => types.items(123)).toThrow();
    expect(() => types.items(() => {})).toThrow();
  });

  test('should throw on nested ItemsType', () => {
    expect(() => 
      types.items(types.items(String))
    ).toThrow('ItemsType cannot directly contain another ItemsType');
  });

  test('should accept valid itemTypes', () => {
    // Object for element mapping
    expect(() => types.items({ name: String })).not.toThrow();
    
    // Type instances
    expect(() => types.items(types.string())).not.toThrow();
    expect(() => types.items(types.number())).not.toThrow();
    expect(() => types.items(types.boolean())).not.toThrow();
    expect(() => types.items(types.enum(['A', 'B']))).not.toThrow();
    
    // Built-in constructors
    expect(() => types.items(String)).not.toThrow();
    expect(() => types.items(Number)).not.toThrow();
    expect(() => types.items(Boolean)).not.toThrow();
    
    // String literal as hint
    expect(() => types.items('A descriptive hint')).not.toThrow();
  });

  test('should handle nested items correctly in object structure', () => {
    // This is the correct way to nest items
    expect(() => types.items({
      name: String,
      subItems: types.items(String)
    })).not.toThrow();
  });
});

describe('ItemsType scaffolding', () => {
  test('should generate correct scaffold for basic items', () => {
    const schema = {
      colors: types.items(types.string('A color')),
      numbers: types.items(types.number('A number')),
      flags: types.items(types.boolean('A flag'))
    };

    const scaffold = IncomingXMLParserSelectorEngine.makeMapSelectScaffold(schema);
    const normalized = scaffold.replace(/\s+/g, ' ').trim();

    // Check structure and repetition
    expect(normalized).toMatch(/<colors>.*?<item>.*?<\/item>.*?<item>.*?<\/item>.*?\/\*etc\.\*\/.*?<\/colors>/);
    
    // Check content
    expect(normalized).toContain('<item> {String: A color} </item>');
    expect(normalized).toContain('<item> {Number: A number} </item>');
    expect(normalized).toContain('<item> {Boolean: A flag} </item>');
  });

  test('should generate correct scaffold for items with attributes', () => {
    const schema = {
      tasks: types.items({
        $priority: types.string("Priority level"),
        $due: types.string("Due date"),
        $$text: types.string("Task description")
      })
    };

    const scaffold = IncomingXMLParserSelectorEngine.makeMapSelectScaffold(schema);
    const normalized = scaffold.replace(/\s+/g, ' ').trim();

    expect(normalized).toContain('<item');
    expect(normalized).toContain('priority="{String: Priority level}"');
    expect(normalized).toContain('due="{String: Due date}"');
    expect(normalized).toContain('{String: Task description}');
  });

  test('should generate correct scaffold for nested items', () => {
    const schema = {
      departments: types.items({
        name: types.string("Department name"),
        employees: types.items({
          $role: types.string("Employee role"),
          name: types.string("Employee name"),
          skills: types.items(types.string("Skill name"))
        })
      })
    };

    const scaffold = IncomingXMLParserSelectorEngine.makeMapSelectScaffold(
      schema,
      undefined, // hints
      2, // indent
    );

    const normalized = scaffold.replace(/\s+/g, ' ').trim();

    expect(normalized).toContain('<departments>');
    expect(normalized).toContain('<item>');
    expect(normalized).toContain('<name>{String: Department name}</name>');
    expect(normalized).toContain('<employees>');
    expect(normalized).toContain('<item');
    expect(normalized).toContain('role="{String: Employee role}"');
    expect(normalized).toContain('<name>{String: Employee name}</name>');
  });

  test('should handle string literals as hints in scaffold', () => {
    const schema = {
      data: types.items('Simple item hint'),
      complex: types.items({
        name: 'Person name here',
        age: Number,
        hobbies: types.items('Hobby description')
      })
    };

    const scaffold = IncomingXMLParserSelectorEngine.makeMapSelectScaffold(schema);
    const normalized = scaffold.replace(/\s+/g, ' ').trim();

    expect(normalized).toContain('<item> {String: Simple item hint} </item>');
    expect(normalized).toContain('<name>{String: Person name here}</name>');
    expect(normalized).toContain('<item> {String: Hobby description} </item>');
  });
});

describe('ItemsType advanced features', () => {
  let engine;

  beforeEach(() => {
    engine = new IncomingXMLParserSelectorEngine();
  });

  test('should handle item-level and array-level transformations', () => {
    engine.add(`
      <data>
        <numbers>
          <item>1</item>
          <item>2</item>
          <item>3</item>
          <item>-4</item>
        </numbers>
      </data>
    `);

    const result = engine.mapSelect({
      data: {
        numbers: types.items(
          types.number()
            .withTransform(n => n > 0 ? n * 2 : undefined) // Item level: double each number
            .withDefault(0)  // Item level: default for invalid items
        )
        .withTransform(arr => arr.filter(n => n > 0)) // Array level: remove zeros
      }
    });

    expect(result).toEqual({
      data: {
        numbers: [2, 4, 6] // -4 becomes -8, fails validation, becomes 0, gets filtered
      }
    });
  });

  test('should handle array-level defaults', () => {
    engine.add('<data><numbers></numbers></data>');

    const result = engine.mapSelect({
      data: {
        numbers: types.items(types.number())
          .withDefault([1, 2, 3])
      }
    });

    expect(result).toEqual({
      data: {
        numbers: [1, 2, 3]
      }
    });
  });

  test('should handle nested transformations', () => {
    engine.add(`
      <data>
        <users>
          <item>
            <name>john</name>
            <scores>
              <item>80</item>
              <item>90</item>
              <item>-5</item>
            </scores>
          </item>
          <item>
            <name>jane</name>
            <scores>
              <item>95</item>
              <item>85</item>
            </scores>
          </item>
        </users>
      </data>
    `);

    const result = engine.mapSelect({
      data: {
        users: types.items({
          name: types.string()
            .withTransform(s => s.toUpperCase()),
          scores: types.items(
            types.number()
              .withTransform(n => n >= 0 ? n : undefined)
          )
          .withTransform(arr => arr.filter(n => n !== undefined))
        })
        .withTransform(users => users.filter(u => u.scores.length > 0))
      }
    });

    expect(result).toEqual({
      data: {
        users: [
          {
            name: 'JOHN',
            scores: [80, 90]
          },
          {
            name: 'JANE',
            scores: [95, 85]
          }
        ]
      }
    });
  });

  test('should handle array-level transformations', () => {
    engine.add(`
      <data>
        <grades>
          <item>95</item>
          <item>85</item>
          <item>invalid</item>
          <item>105</item>
          <item>75</item>
        </grades>
      </data>
    `);

    const result = engine.mapSelect({
      data: {
        grades: types.items(
          types.number()
            .withTransform(n => {
              if (isNaN(n) || n < 0 || n > 100) return undefined;
              return n;
            })
        )
        .withTransform(arr => {
          const validGrades = arr.filter(g => g !== undefined);
          // If we don't have enough grades, return undefined
          if (validGrades.length < 3) return undefined;
          return validGrades.sort((a, b) => b - a);
        })
        .withDefault([95, 85, 75])  // Default if we don't get enough valid grades
      }
    });

    expect(result).toEqual({
      data: {
        grades: [95, 85, 75] // Invalid and 105 become undefined, get filtered, then sorted
      }
    });
  });

  test('should handle complex item validation', () => {
    engine.add(`
      <users>
        <item>
          <name>John</name>
          <age>invalid</age>
        </item>
        <item>
          <name>Jane</name>
          <age>25</age>
        </item>
      </users>
    `);

    const result = engine.mapSelect({
      users: types.items({
        name: types.string(),
        age: types.number()
          .withTransform(age => {
            if (isNaN(age) || age < 0) return undefined;
            return age;
          })
      })
      .withTransform(users => users.filter(u => u.age !== undefined))
    });

    expect(result).toEqual({
      users: [
        // First user filtered out due to invalid age
        { name: 'Jane', age: 25 }
      ]
    });
  });
});

describe('ItemsType edge cases', () => {
  let engine;

  beforeEach(() => {
    engine = new IncomingXMLParserSelectorEngine();
  });

  test('should handle malformed XML within items', () => {
    engine.add(`
      <data>
        <items>
          <item>valid</item>
          <item><broken>no closing tag</item>
          <item>also valid</item>
        </items>
      </data>
    `);

    const result = engine.mapSelect({
      data: {
        items: types.items(types.string())
      }
    });

    expect(result).toEqual({
      data: {
        items: ['valid', 'no closing tag', 'also valid']
      }
    });
  });

  test('should handle mixed content types within items', () => {
    engine.add(`
      <data>
        <items>
          <item>plain text</item>
          <item><wrapped>text</wrapped></item>
          <item>42</item>
          <item attr="test">with attribute</item>
        </items>
      </data>
    `);

    const result = engine.mapSelect({
      data: {
        items: types.items(types.string())
          .withTransform(arr => arr.filter(Boolean))
      }
    });

    expect(result).toEqual({
      data: {
        items: ['plain text', 'text', '42', 'with attribute']
      }
    });
  });

  test('should treat array defaults as pre-processed values', () => {
    engine.add(`<data><items></items></data>`);

    const result = engine.mapSelect({
      data: {
        items: types.items(
          types.string()
            .withTransform(s => s.toUpperCase())
        )
        .withDefault(['a', 'b', 'c'])
        .withTransform(arr => arr.map(s => `item_${s}`))
      }
    });

    expect(result).toEqual({
      data: {
        items: ['item_a', 'item_b', 'item_c']
      }
    });
  });

  test('should handle circular references gracefully', () => {
    engine.add(`
      <data>
        <items>
          <item>
            <ref>item2</ref>
            <value>1</value>
          </item>
          <item>
            <ref>item1</ref>
            <value>2</value>
          </item>
        </items>
      </data>
    `);

    const result = engine.mapSelect({
      data: {
        items: types.items({
          ref: types.string(),
          value: types.number()
        })
        .withTransform(items => {
          // Attempt to create circular references
          items.forEach(item => {
            const refItem = items.find(i => i.value.toString() === item.ref.slice(-1));
            if (refItem) {
              item.reference = refItem; // This could create circular refs
            }
          });
          return items;
        })
      }
    });

    // Should handle circular references without crashing
    expect(result.data.items[0].value).toBe(1);
    expect(result.data.items[1].value).toBe(2);
    expect(result.data.items[0].reference.value).toBe(2);
    expect(result.data.items[1].reference.value).toBe(1);
  });

  test('should handle deeply nested defaults consistently', () => {
    engine.add(`
      <data>
        <users>
          <item>
            <name>John</name>
            <!-- missing preferences -->
          </item>
          <item>
            <!-- completely empty item -->
          </item>
        </users>
      </data>
    `);

    const result = engine.mapSelect({
      data: {
        users: types.items({
          name: types.string().withDefault('Anonymous'),
          preferences: types.items({
            theme: types.string().withDefault('light'),
            notifications: types.boolean().withDefault(true)
          }).withDefault([{ theme: 'dark', notifications: false }])
        })
      }
    });

    expect(result).toEqual({
      data: {
        users: [
          {
            name: 'John',
            preferences: [{ theme: 'dark', notifications: false }]
          },
          {
            name: 'Anonymous',
            preferences: [{ theme: 'dark', notifications: false }]
          }
        ]
      }
    });
  });
});

test('should generate correct scaffold for items with attributes in Idio format', () => {
  const schema = {
    tasks: types.items({
      $priority: types.string("Priority level"),
      $due: types.string("Due date"),
      $$text: types.string("Task description")
    })
  };

  const scaffold = IncomingIdioParserSelectorEngine.makeMapSelectScaffold(schema);
  const normalized = scaffold.replace(/\s+/g, ' ').trim();

  expect(normalized).toContain('@START(tasks)');
  expect(normalized).toContain('@START(@priority)...String: Priority level...@END(@priority)');
  expect(normalized).toContain('@START(@due)...String: Due date...@END(@due)');
  expect(normalized).toContain('...String: Task description...');
}); 