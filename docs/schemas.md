# Schema Documentation

## Introduction

A schema in xmllm defines both:

1. The XML/Idio structure you want the AI to generate
2. How that XML/Idio should be transformed into JavaScript objects

For example, this schema:
```javascript
const schema = {
  analysis: {                                    
    sentiment: types.string("Sentiment value"),  // Hint-first pattern
    score: types.number("Score from 0-1"),
    categories: types.items(types.string("Category name"))
  }
};
```

Guides the AI to generate XML like this:
```xml
<analysis>
  <sentiment>positive</sentiment>
  <score>0.87</score>
  <categories>
    <item>technical</item>
    <item>detailed</item>
  </categories>
</analysis>
```

And transforms it into this JavaScript object:
```javascript
{
  analysis: {
    sentiment: "positive",  // String conversion
    score: 0.87,           // Number conversion
    categories: [          // Array conversion
      "technical",
      "detailed"
    ]
  }
}
```

A schema is an object definition of precisely (_more or less_) what you wish to receive back, i.e., the data you receive back will be a reflection of your schema.

Each value in the schema is a `Type` or an array or object containing such a value. Schemas can be any level of depth, though shallower is more likely to succeed with an LLM.

## Types

To build a schema (and hints), xmllm provides `types` methods for the following: `string` (/`str`), `number` (/`num`), `boolean` (/`bool`), `enum`. You can define optional hints, defaults, validation, and transformations. All methods (constructors) follow a consistent hint-first pattern.

```javascript
import { types } from 'xmllm';

const schema = {
  user: {
    // String type with hint:
    name: types.string("User's full name"),
    // Number type with hint:
    age: types.number("Age in years"),
    // Boolean type with hint:
    active: types.boolean("Account status"),
    // Lists of strings:
    hobbies: types.items(types.string('A hobby')),
    // Enum type with hint and values:
    status: types.enum("Status", ["ACTIVE", "PENDING"]),
    // Raw content with hint (preserves CDATA):
    content: types.raw("HTML content"),
    // String type without hint:
    conttent: types.string()
  }
};
```

To add defaults, transforms, or to manipulate hints, you can use the methods thus:

```javascript
const schema = {
  user: {
    // String type with hint, default, and transform
    name: types.string("User's name")
      .withDefault("Anonymous")                    
      .withTransform(name => name.toLowerCase()),  
    
    // Number type with hint, default, and transform
    age: types.number()
      .withHint("Age in years")
      .withDefault(0)
      .withTransform(age => Math.floor(age)),
    
    // Enum type with hint, allowed values, and default
    status: types.enum("Account status", ['ACTIVE', 'PENDING'])
      .withDefault('PENDING')                      
  }
};
```

### Type Processing Order

When processing values, xmllm will:

- 1. Check if element exists
  - If missing → use default if provided, otherwise undefined
  - If empty → use default if provided, otherwise continue processing
- 2. Parse raw value according to type (e.g. `parseFloat` for numbers)
- 3. Apply transform if present

```javascript
const schema = {
  settings: {
    // Will first parse as number, then round down, default to 0 if invalid
    count: types.number("Count")
      .withTransform(n => Math.floor(n))
      .withDefault(0),
    
    // Will first parse as boolean, then invert, default to false if missing
    enabled: types.boolean("Status")
      .withTransform(b => !b)
      .withDefault(false)
  }
};
```

### Working with Lists using types.items()

The `items()` type handles arrays of values or objects. It supports both item-level and array-level operations:

```javascript
const schema = {
  colors: types.items(
    types.string("A color name")  // Item type definition
  )
  .withDefault(['red', 'blue'])   // Array-level default
  .withTransform(arr => arr.sort()) // Array-level transform
};

// Complex items
const schema = {
  users: types.items({
    name: types.string("User's name"),
    age: types.number("User's age")
  })
}
```

#### Default Values

When using `withDefault()` on an ItemsType, the default values are considered pre-processed and will only be affected by array-level transformations:

```javascript
const schema = {
  numbers: types.items(
    types.number()
      .withTransform(n => n * 2)  // Won't affect defaults
  )
  .withDefault([1, 2, 3])
  .withTransform(arr => arr.map(n => n + 1))  // Will affect defaults
};
```

#### Nesting

ItemsType supports deep nesting for complex data structures:

```javascript
const schema = {
  departments: types.items({
    name: types.string("Department name"),
    employees: types.items({
      name: types.string("Employee name"),
      skills: types.items(types.string("Skill name"))
    })
  })
};
```

This will generate scaffold like:
```xml
<departments>
  <item>
    <name>{String: Department name}</name>
    <employees>
      <item>
        <name>{String: Employee name}</name>
        <skills>
          <item>{String: Skill name}</item>
          <item>{String: Skill name}</item>
          /*etc.*/
        </skills>
      </item>
      <item>...</item>
      /*etc.*/
    </employees>
  </item>
  <item>...</item>
  /*etc.*/
</departments>
```

## Working with Attributes

Access XML attributes with the `$` prefix. All types support attributes:

```javascript
const schema = {
  product: {
    $id: types.number("Product ID"),                    // <product id="123">
    $category: types.string("Category name"),           // <product category="electronics">
    price: {
      $currency: types.string("Currency code"),         // <price currency="USD">
      $$text: types.number("Price amount in currency")   // Price value
    }
  }
};
```

Generates scaffold:
```xml
<product id="{Number}" category="{String}">
  <price currency="{String}">{Number}</price>
</product>
```

## Reserved Properties

These properties (prefixed with `$`) have special meaning:

```javascript
element: {
  $$text,      // The element's text content
  $$attr,      // The element's attributes
  $$tagclosed, // Whether the element is complete
  $$children,  // The element's child nodes
  $$tagname    // The element's tag name
}
```

### Arrays and Objects

Objects in schemas are used for expressing nested data structures:

```javascript
const schema = {
  person: {
    details: {
      name: types.string("Full name"),
      age: types.number("Age in years")
    }
  }
};
```

For arrays or lists, use `types.items()` as described in the Types section above. While array literals are supported for backward compatibility, `types.items()` is the recommended approach as it provides better control over item processing and clearer scaffolding.

## Guiding AI Responses (more on scaffolding)

A crucial function of xmllm is in guiding the LLM towards the appropriate structured response. To achieve this we send along a desired example structure with your prompts. We call this the scaffold.

The schema you define and the hints will determine the scaffolding we generate for the LLM. For example:

```javascript
const schema = {
  analysis: {
    severity: types.enum("Severity level", ['High', 'Medium', 'Low'])
      .withDefault('Medium'),
    enabled: types.boolean("Analysis activation status")
      .withDefault(true),
    findings: {
      finding: [{
        $impact: types.number("Impact score from 1-10")
          .withTransform(n => Math.min(10, Math.max(1, n))),
        $active: types.boolean("Finding relevance status"),
        description: types.string("Security issue description")
          .withTransform(s => s.trim())
      }]
    }
  }
};
```

With the above schema, the AI will see a scaffold like:
```xml
<analysis>
  <severity>{Enum: High|Medium|Low} Severity level</severity>
  <enabled>{Boolean} Analysis activation status</enabled>
  <findings>
    <finding
      impact="{Number} Impact score from 1-10"
      active="{Boolean} Finding relevance status">
      <description>{String} Security issue description</description>
    </finding>
    <finding
      impact="{Number} Impact score from 1-10"
      active="{Boolean} Finding relevance status">
      <description>{String} Security issue description</description>
    </finding>
    /*etc.*/
  </findings>
</analysis>
```

## Notes on Enum Type

The `enum` type enforces a set of allowed values and provides clear scaffolding:

```javascript
const schema = {
  order: {
    // Enum with hint and allowed values and a default value
    status: types.enum("Order status", ['PENDING', 'SHIPPED', 'DELIVERED'])
      .withDefault('PENDING'),
    
    // Another enum example
    priority: types.enum("Priority level", ['LOW', 'MEDIUM', 'HIGH'])
  }
};
```

When scaffolding, FYI, enums show their allowed values:

```xml
<order>
  <status>{Enum: Order status (allowed values: PENDING|SHIPPED|DELIVERED)}</status>
  <priority>{Enum: Priority level (allowed values: LOW|MEDIUM|HIGH)}</priority>
</order>
```

## Raw Type and CDATA

The raw type is designed for handling CDATA content, i.e. content that should be preserved as-is and should not be parsed as XML. This is useful for markup or programming languages where you want to preserve the original formatting. E.g. if you were to ask the LLM to produce HTML, you'd want to use the raw type for the content.

```javascript
const schema = {
  content: {
    body: types.raw("HTML content"),              // Will be wrapped in CDATA
    default: types.raw("Default HTML content")
      .withDefault("<p>Default</p>")
  }
};
```

Generates scaffold:
```xml
<content>
  <body><![CDATA[...]]></body>
  <default><![CDATA[<p>Default</p>]]></default>
</content>
```

Compliance is sometimes a bit tricky with raw types, so if you encounter issues, I'd suggest taking a look at the [Idio parser](https://github.com/padolsey/xmllm/blob/main/docs/idio-syntax.md) which can help to disambiguate further.

## Convenience Type System

While the `Type` system (via `types`, explained above) is recommended, xmllm allows you to define types in a simpler way:

### Basic Type Conversion

```javascript
const schema = {
  title: String,    // Equivalent to types.string()
  count: Number,    // Equivalent to types.number()
  active: Boolean   // Equivalent to types.boolean()
};
```

### Custom Transform Functions

```javascript
const schema = {
  enabled: ({ $$text }) => $$text.trim().toLowerCase() === 'true'
};
```

### String Literals

```javascript
const schema = {
  status: "pending"  // Used as a hint for the AI
};
```

The above would be equivalent to:
```javascript
const schema = {
  status: types.string('pending')
};
```

### Transformation
Types can be transformed using the `withTransform` method. This is useful for
both data conversion and validation:

```javascript
const schema = {
  score: types.number()
    .withTransform(n => {
      // Transform and validate in one step
      if (n >= 0 && n <= 100) return n;
      return undefined; // Invalid values become undefined
    })
    .withDefault(0)
};
```

### Number Parsing

The number type finds the first occurrence of a number pattern and uses everything from that point onwards for parsing:

1. Looks for the first match of: `-?\d*\.?\d+` (a negative sign, digits, optional decimal point, more digits)
2. Takes the substring from the start of that match to the end of the string
3. Passes that substring to `parseFloat()`

```javascript
const schema = {
  data: {
    price: types.number() // "costs $42.50" -> parseFloat("42.50") -> 42.50
                          // "4.5/5 stars"   -> parseFloat("4.5/5 stars") -> 4.5
                          // "-3.2 degrees"  -> parseFloat("-3.2 degrees") -> -3.2
                          // ".75 percent"   -> parseFloat(".75 percent") -> 0.75
                          // "no numbers"    -> NaN (no number pattern found)
  }
};
```

This approach lets parseFloat handle the actual number parsing while we just help it find where the number starts. It's particularly useful for LLM outputs that might include currency symbols, units, or descriptive text. LLMs are rarely perfect at complying with strict types, so we try to be flexible.

If you need more control over number parsing, you can use a string type with a custom transform:

```javascript
const schema = {
  data: {
    // Custom number parsing logic
    price: types.string()
      .withTransform(str => {
        // Your custom parsing logic here
        const match = str.match(/\$(\d+\.?\d*)/);
        return match ? parseFloat(match[1]) : undefined;
      })
  }
};
```
