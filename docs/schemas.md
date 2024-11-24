# Schema Documentation

Schemas in xmllm define how XML responses should be transformed into structured data. They support a wide range of transformations, from simple type conversion to complex validations.

## Element Properties

Every XML element provides these core properties for transformations:

```javascript
const schema = {
  item: ({
    $text,    // The element's text content
    $attr,    // Object containing attributes
    $key,     // Unique identifier for the element
    $closed,  // Boolean indicating if element is closed
    children  // Array of child elements (if any)
  }) => ({
    // ... transformation
  })
}
```

## Basic Schema Types

```javascript
const schema = {
  // Simple type conversion
  title: String,
  rating: Number,
  isPublished: Boolean,

  // String literals as documentation/hints for AI
  summary: "A brief overview of the content",
  
  // Custom transformations
  price: ({$text}) => parseFloat($text).toFixed(2),
  
  // Arrays of values
  tags: [String],
  scores: [Number]
}
```

## Working with Attributes

Access XML attributes with the `$` prefix:

```javascript
const schema = {
  product: {
    $id: Number,           // <product id="123">
    $category: String,     // <product category="electronics">
    name: String,
    price: {
      $currency: String,   // <price currency="USD">
      _: Number           // Text content of price element
    }
  }
}
```

## Streaming Behavior

Schemas process elements as they arrive. Consider streaming state in transformations:

```javascript
const schema = {
  // Handle both partial and complete elements
  status: ({$text, $closed}) => {
    if (!$closed) {
      return 'loading...';  // Partial content
    }
    return $text;  // Complete content
  },

  // Avoid expensive operations during streaming
  analysis: ({$text, $closed}) => {
    if (!$closed) return $text;  // Pass through until complete
    return expensiveAnalysis($text);  // Only analyze complete content
  }
}
```

## Schema Composition

Reuse schema definitions for cleaner code:

```javascript
// Define reusable schemas
const addressSchema = {
  street: String,
  city: String,
  country: String
};

const reviewSchema = {
  $rating: Number,
  _: "A detailed review with pros and cons"
};

// Compose schemas
const schema = {
  user: {
    name: String,
    homeAddress: addressSchema,
    workAddress: addressSchema,
    reviews: [reviewSchema]
  }
}
```

## Error Recovery

Handle malformed XML and invalid data gracefully:

```javascript
const schema = {
  // Recover from invalid numbers
  price: ({$text}) => {
    try {
      const price = parseFloat($text);
      if (isNaN(price) || price < 0) return 0;
      return price;
    } catch {
      return 0;  // Fallback for invalid input
    }
  },

  // Handle missing attributes
  status: ({$text, $attr}) => ({
    text: $text,
    type: $attr.type || 'default',  // Fallback for missing attribute
    timestamp: $attr.time ? new Date($attr.time) : new Date()
  })
}
```

## Debugging

Debug transformations during development:

```javascript
const schema = {
  data: ({$text, $attr, $key, $closed}) => {
    // Log element details
    console.log('Processing element:', {
      key: $key,
      text: $text,
      attributes: $attr,
      isClosed: $closed
    });

    // Add debug wrapper
    return {
      value: $text,
      _debug: {
        processedAt: new Date(),
        elementKey: $key
      }
    };
  }
}
```

## Performance Tips

1. **Minimize Work During Streaming**
```javascript
// Bad - Expensive operation on every update
const schema = {
  content: ({$text}) => expensiveProcess($text)
}

// Good - Only process complete elements
const schema = {
  content: ({$text, $closed}) => 
    $closed ? expensiveProcess($text) : $text
}
```

2. **Use Complete Mode When Appropriate**
```javascript
// Wait for complete elements if processing can be deferred
const result = await stream('Analyze text', { schema })
  .complete()  // Only process complete elements
  .value();
```

3. **Efficient Transformations**
```javascript
// Bad - Creates new array on every update
const schema = {
  tags: [({$text}) => [...existingTags, $text]]
}

// Good - Simple transformation
const schema = {
  tags: [({$text}) => $text.trim()]
}
```

## Type Safety

TypeScript definitions for schema transformations:

```typescript
interface Element {
  $text: string;
  $attr: Record<string, string>;
  $key: number;
  $closed: boolean;
  children?: Element[];
}

type Transformer<T> = (element: Element) => T;

const schema = {
  // Type-safe transformers
  count: ({$text}: Element): number => parseInt($text),
  status: ({$text, $attr}: Element): Status => ({
    state: $text as StatusState,
    updatedAt: new Date($attr.timestamp)
  })
};
```

## Best Practices

1. **Start Simple**: Begin with basic type conversions before adding complexity
2. **Use Documentation**: String literals help guide AI responses
3. **Validate Early**: Add validation in transformers to catch issues early
4. **Handle Errors**: Decide whether to throw errors or return null/defaults
5. **Consider Streaming**: Remember transformations run on partial content during streaming
6. **Debug Carefully**: Use logging strategically to avoid performance impact
7. **Type Safety**: Use TypeScript for better development experience
8. **Reuse Schemas**: Compose schemas from reusable parts
9. **Performance First**: Design transformations with streaming in mind
10. **Graceful Recovery**: Always handle potential errors in transformations

## Common Patterns

### Optional Fields
```javascript
const schema = {
  title: String,
  subtitle: ({$text}) => $text || null,  // Optional
  description: ({$text}) => $text || undefined  // Omit if empty
}
```

### Normalized Values
```javascript
const schema = {
  tags: [({$text}) => $text.toLowerCase().trim()],
  status: ({$text}) => ['active', 'inactive'].includes($text) 
    ? $text 
    : 'inactive'
}
```

### Complex Validation
```javascript
const schema = {
  product: {
    price: ({$text, $attr}) => {
      const amount = parseFloat($text);
      if (isNaN(amount) || amount < 0) {
        throw new Error('Invalid price');
      }
      return {
        amount,
        currency: $attr.currency || 'USD',
        formatted: `${$attr.currency || 'USD'} ${amount.toFixed(2)}`
      };
    }
  }
}
``` 