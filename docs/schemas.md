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
    categories: {
      category: [types.string("Category name")] 
    }
  }
};
```

Guides the AI to generate XML like this:
```xml
<analysis>
  <sentiment>positive</sentiment>
  <score>0.87</score>
  <categories>
    <category>technical</category>
    <category>detailed</category>
  </categories>
</analysis>
```

And transforms it into this JavaScript object:
```javascript
{
  analysis: {
    sentiment: "positive",  // String conversion
    score: 0.87,           // Number conversion
    categories: {
      category: [          // Array conversion
        "technical",
        "detailed"
      ]
    }
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
    // Enum type with hint and values:
    status: types.enum("Status", ['ACTIVE', 'PENDING']),
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
      .withTransform(age => Math.floor(age))
      .withValidate(age => isNaN(age) && age >= 0),
    
    // Enum type with hint, allowed values, and default
    status: types.enum("Account status", ['ACTIVE', 'PENDING'])
      .withDefault('PENDING')                      
  }
};
```

### Type Processing Order

When processing values, xmllm will do the following to a given value:

1. Parse the raw value according to its type (e.g., `parseFloat` for numbers)
2. Apply custom transform function (optional)
3. Apply custom validation function (optional)
4. Use default value (or `null`) if the result is invalid or missing

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

As mentioned, you can define arrays or objects as well. Objects are for expressing nested data, like so:

```javascript
const schema = {
  person: {
    fav_city: {
      name: types.string(),
      population: types.number(),
      mayor: {
        name: types.string(),
        tenure: types.string()
      }
    }
  }
};
```

To specify arrays or lists, you would use an array literal (or the `Array` constructor in JS):

```
const schema = {
  pet_names: [
    types.string('a pet name')
  ]
};
```

Arrays in schemas are defined using a single template item in square brackets (or `Array(...)` constructor, which in JS is equivalent to `[...]`). This template defines the structure and type for all items that will appear in that array. For example:

```javascript
const schema = {
  pet_names: [
    // Template for each item in the array:
    // (You can only define a single item)
    types.string('a fun pet name')
  ]
};
```

This will allow the LLM to generate multiple items following this template structure. The hint provided with the template will be used to guide the LLM in generating appropriate values. Since xmllm will use 2 examples as a guide (to increase compliance), the scaffold for the above would be as follows:

```xml
<pet_names>
  <pet_name>a fun pet name</pet_name>
  <pet_name>a fun pet name</pet_name>
  /*etc.*/
</pet_names>
```

The `/*etc.*/` is literally in the scaffold as a guide for the LLM, so it understands it's a list/continuation.

## Guiding AI Responses (more on scaffolding)

As touched on, a crucial function of xmllm is in guiding the LLM towards the appropriate structured response. To achieve this we send along a desired example structure with your prompts. We call this the scaffold.

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
    // Enum with hint and allowed values
    status: types.enum("Order status", ['PENDING', 'SHIPPED', 'DELIVERED'])
      .withDefault('PENDING'),
    
    // Enum with validation through allowed values
    priority: types.enum("Priority level", ['LOW', 'MEDIUM', 'HIGH'])
  }
};
```

When scaffolding, FYI, enums show their allowed values:

```xml
<order>
  <status>{Enum: PENDING|SHIPPED|DELIVERED}</status>
  <priority>{Enum: LOW|MEDIUM|HIGH}</priority>
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

## Alternative Type System (legacy, but _not_ deprecated)

While the Type system is recommended, xmllm maintains backward compatibility with simpler type definitions:

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
