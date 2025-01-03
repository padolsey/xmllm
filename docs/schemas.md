# Schema Documentation

## Introduction

A schema in xmllm defines both:
1. The XML structure you want the AI to generate
2. How that XML should be transformed into JavaScript objects

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

## Type System

The Type system provides explicit type definitions with features like hints, defaults, validation, and transformations. All type constructors follow a consistent hint-first pattern.

### Basic Types

```javascript
import { types } from 'xmllm';

const schema = {
  user: {
    name: types.string("User's full name"),           // String type with hint
    age: types.number("Age in years"),                // Number type with hint
    active: types.boolean("Account status"),          // Boolean type with hint
    status: types.enum("Status", ['ACTIVE', 'PENDING']), // Enum type with hint and values
    content: types.raw("HTML content")                // Raw content with hint (preserves CDATA)
  }
};
```

### Type Features

Each type supports several features that can be chained:

```javascript
const schema = {
  user: {
    // String type with hint, default, and transform
    name: types.string("User's name")
      .withDefault("Anonymous")                    
      .withTransform(name => name.toLowerCase()),  
    
    // Number type with hint, default, and transform
    age: types.number("Age in years")
      .withDefault(0)
      .withTransform(age => Math.floor(age)),     
    
    // Enum type with hint, allowed values, and default
    status: types.enum("Account status", ['ACTIVE', 'PENDING'])
      .withDefault('PENDING')                      
  }
};
```

### Type Processing Order

When processing values, types follow this order:
1. Parse the raw value according to the type (e.g., `parseFloat` for numbers)
2. Apply any custom transform function
3. Apply validation (if any)
4. Use default value if the result is invalid or missing

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

### Enum Type

The enum type enforces a set of allowed values and provides clear scaffolding:

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

When scaffolding, enums show their allowed values:
```xml
<order>
  <status>{Enum: PENDING|SHIPPED|DELIVERED}</status>
  <priority>{Enum: LOW|MEDIUM|HIGH}</priority>
</order>
```

### Raw Type and CDATA

The raw type is designed for handling CDATA content:

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

## Array Structure

Arrays in xmllm follow a consistent pattern using plural containers with singular elements:

```javascript
const schema = {
  tags: {
    tag: [types.string("Tag name")]  // Array of strings with hint
  },
  comments: {
    comment: [{                      // Array of objects
      author: types.string("Author name"),
      text: types.string("Comment text")
    }]
  }
};
```

Generates scaffold:
```xml
<tags>
  <tag>{String}</tag>
  <tag>{String}</tag>
  /*etc.*/
</tags>
<comments>
  <comment>
    <author>{String}</author>
    <text>{String}</text>
  </comment>
  /*etc.*/
</comments>
```

### Root Level Arrays

For multiple occurrences of a root element, use an array of schemas:

```javascript
const schema = [{
  item: {
    title: types.string("Item title"),
    price: types.number("Price in USD")
  }
}];
```

Generates scaffold:
```xml
<item>
  <title>{String}</title>
  <price>{Number}</price>
</item>
<item>
  <title>{String}</title>
  <price>{Number}</price>
</item>
/*etc.*/
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

## Legacy Type System

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

## Guiding AI Responses

The schema structure, type hints, and scaffolding guide the AI's output. For example:

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

The AI will see a scaffold like:

```xml
<analysis>
  <severity>{Enum: High|Medium|Low}</severity>
  <enabled>{Boolean}</enabled>
  <findings>
    <finding impact="{Number}" active="{Boolean}">
      <description>{String}</description>
    </finding>
    /*etc.*/
  </findings>
</analysis>
```

### Best Practices

1. Always provide descriptive hints for better AI guidance
2. Use the hint-first pattern consistently
3. Place type constraints in the hint (e.g., "Score from 0-100")
4. Use enums when you have a fixed set of valid values
5. Add validation for critical constraints
6. Provide sensible defaults for optional elements
7. Use transforms to normalize or sanitize data
8. Keep hints concise but informative