# Schema Documentation

## Introduction

A schema in xmllm defines both:
1. The XML structure you want the AI to generate
2. How that XML should be transformed into JavaScript objects

For example, this schema:
```javascript
const schema = {
  analysis: {                // Tells AI to use <analysis> tag
    sentiment: String,       // Tells AI to use <sentiment> inside <analysis>
    score: Number,          // Tells AI to use <score> inside <analysis>
    categories: {           // Tells AI to use <categories> container
      category: [String]    // Tells AI to use multiple <category> tags
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
    sentiment: "positive", // String conversion
    score: 0.87,           // Number (parseFloat)conversion
    categories: {
      category: [          // Array conversion
        "technical",
        "detailed"
      ]
    }
  }
}
```

The schema structure directly mirrors the XML you want. Each property name becomes a tag name, and the value (String, Number, etc.) defines how to transform its content.

### Basic Type Conversion (String / Number)

The simplest schemas use `String`, `Number`, and `Boolean` to transform text content:

```javascript
const schema = {
  title: String,  // Uses String constructor
  count: Number,  // Uses parseFloat for robust number parsing
  active: Boolean // Special handling for truthy/falsy values
}
```

IMPORTANT: `Number` uses `parseFloat` under the hood, which handles scientific notation, trailing units, and whitespace. See [parseFloat on MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseFloat) for details.

IMPORTANT: `Boolean` treats the following as false:
- Empty or whitespace-only content
- The strings "false", "no", or "null" (case insensitive)
- Numeric zero (0, 0.00, etc)

Otherwise the value is deemed true. If you don't like this behavior, you can use your own function (custom "transformer" as we call it):

```javascript
// Custom boolean transformer example:
const schema = {
  enabled: ({ $text }) => $text.trim().toLowerCase() === 'true'  // Only 'true' is true
}
```

## Array Structure

The most important pattern in xmllm schemas is how repeated elements are handled. It's best to use a plural container with singularly named elements (i.e. `person` instead of `people`):

```javascript
// ❌ Incorrect - seems intuitive but won't work reliably
const badSchema = {
  // Attempt to ask for an array of tags:
  tags: [String],   // Don't do this

  // Attempt to ask for an array of comment objects:
  comments: [{      // Don't do this either
    author: String,
    text: String
  }]
};

// ✅ Correct - use plural containers with singular elements
const goodSchema = {
  tags: {            // Plural container (simpler to reason about)
    tag: [String]    // Singular elements (crucial though less intuitive)
  },
  comments: {        // Plural container (simpler to reason about)
    comment: [{      // Singular elements (crucial though less intuitive)
      author: String,
      text: String
    }]
  }
};
```

### Why This Pattern Matters

1. XML naturally represents repeated elements using the same tag name
2. The container element guides the AI to generate properly structured responses
3. Streaming updates fit naturally into this hierarchy
4. The container-item relationship is explicit and semantic

### Root Level Arrays

Sometimes you need to handle multiple occurrences of a root element. Use an array of schemas:

```javascript
const schema = [{
  item: {
    title: String,
    price: Number
  }
}];

// Matches XML like:
<item><title>First</title><price>10</price></item>
<item><title>Second</title><price>20</price></item>

// Results in:
[
  { item: { title: "First", price: 10 } },
  { item: { title: "Second", price: 20 } }
]
```

## Working with Elements

### Element Properties

Transform functions receive an object containing all information about an element:

```javascript
const schema = {
  product: ({ $text, $attr, $tagclosed, $tagkey, $tagname, $children }) => {
    // $text - Element's text content
    // $attr - Object containing attributes
    // $tagclosed - Boolean indicating if element is complete
    // $tagkey - Unique identifier for the element
    // $tagname - Name of the element
    // $children - Array of child elements

    return {
      content: $text,
      attributes: $attr
    };
  }
};
```

### Working with Attributes

Access XML attributes with the `$` prefix:

```javascript
const schema = {
  product: {
    $id: Number,          // <product id="123">
    $category: String,    // <product category="electronics">
    $text: String,        // Text content inside the element
    price: {
      $currency: String,  // <price currency="USD">
      $text: Number       // Text content as number
    }
  }
}
```

## Building Complex Schemas

### Nested Structures

```javascript
const schema = {
  library: {
    books: {
      book: [{
        $id: Number,
        title: String,
        authors: {
          author: [String]
        },
        reviews: {
          review: [{
            $rating: Number,
            $text: String
          }]
        }
      }]
    }
  }
};
```

### Reusable Components

Break down complex schemas into reusable parts:

```javascript
const addressSchema = {
  street: String,
  city: String,
  country: String
};

const reviewSchema = {
  $rating: Number,
  $text: String,
  response: {
    $author: String,
    $text: String
  }
};

const schema = {
  user: {
    name: String,
    home_address: addressSchema,
    work_address: addressSchema,
    reviews: {
      review: [reviewSchema]
    }
  }
};
```

## Guiding AI Responses

Use the `hints` configuration to guide the AI's output structure:

```javascript
const result = await stream('Analyze security issues', {
  schema: {
    analysis: {
      severity: String,
      enabled: Boolean,
      findings: {
        finding: [{
          $impact: Number,
          $active: Boolean,
          $text: String
        }]
      }
    }
  },
  hints: {
    analysis: {
      severity: "Must be 'High', 'Medium', or 'Low'",
      enabled: "true/false indicating if analysis is active",
      findings: {
        finding: [{
          $impact: "Impact score from 1-10",
          $active: "true/false - is this finding still relevant",
          $text: "Detailed description of the security issue"
        }]
      }
    }
  }
});
```

### The Scaffold System

The hints create a template that guides the AI. For the above schema, the AI sees something like:

```xml
<analysis>
  <severity>Must be 'High', 'Medium', or 'Low'</severity>
  <enabled>true/false indicating if analysis is active</enabled>
  <findings>
    <finding impact="Impact score from 1-10" active="true/false - is this finding still relevant">
      Detailed description of the security issue
    </finding>
    <finding impact="Impact score from 1-10" active="true/false - is this finding still relevant">
      Detailed description of the security issue
    </finding>
    /*etc.*/
  </findings>
</analysis>
```

### Best Practices for Hints

1. Match your schema structure exactly
2. Provide specific formats and constraints
3. Include examples in the hints
4. Use hints for all important fields
5. Consider edge cases the AI should handle

```javascript
const schema = {
  book: {
    $isbn: String,
    title: String,
    price: {
      $currency: String,
      $text: Number
    }
  }
};

const hints = {
  book: {
    $isbn: "ISBN-13 format (e.g., 978-3-16-148410-0)",
    title: "Book title using proper capitalization",
    price: {
      $currency: "Three-letter currency code (e.g., USD, EUR)",
      $text: "Price as a decimal number"
    }
  }
};
```

## Reserved Properties

Certain properties (prefixed with `$`) are reserved because they represent the internal structure of XML elements that transformers need to access:

```javascript
// These properties are reserved for transformer access:
element: ({
  $text,      // The element's text content
  $attr,      // The element's attributes
  $tagclosed, // Whether the element is complete
  $children,  // The element's child nodes
  $tagname    // The element's tag name
}) => ({
  // Your transformation here
})

// So in schemas, use:
element: {
  $type: String,     // Transform the 'type' attribute
  content: String    // Transform the text content
}
```

This separation ensures transformers can reliably access element properties without them being overwritten by schema transformations.