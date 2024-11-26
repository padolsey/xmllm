# Schema Documentation

## Naming Conventions

### Important: Use Snake Case
Always use lowercase with underscores (snake_case) for element names. This helps ensure the LLM produces consistent XML:

```javascript
// ❌ Avoid camelCase or PascalCase
// Risky with our XML/HTML parsing approaches
// And less likely to be abided by the LLM
const badSchema = {
  userProfile: {
    firstName: String,
    emailAddress: String
  }
};

// ✅ Use lowercase with underscores
const goodSchema = {
  user_profile: {
    first_name: String,
    email_address: String
  }
};
```

### Arrays and Plural Elements
When defining arrays in schemas, use the singular form of the element name. This matches how the XML will be structured:

```javascript
// ❌ Intuitive but incorrect
const incorrectSchema = {
  stories: [String],     // Seems natural but doesn't match XML
  user_reviews: [{       // Same issue
    rating: Number,
    comments: [String]   // Again, plural doesn't match XML
  }]
};
```

This would make XMLLM tell the LLM to produce XML like this:

```
<stories>First story</stories>
<stories>Second story</stories>
<user_reviews>
  <rating>5</rating>
  <comments>Great!</comments>
  <comments>Would recommend!</comments>
</user_reviews>
```

Do you see the issue? All of the plural items are itemized using the name you provide. This most likely is not what you want. Instead, use singular forms:

```javascript
// ✅ Correct way - use singular forms
const correctSchema = {
  story: [String],      // Will match <story>...</story><story>...</story>
  user_review: [{       // Will match <user_review>...</user_review>
    rating: Number,
    comment: [String]   // Will match <comment>...</comment>
  }]
};

// The resulting XML will look like:
/*
<story>First story</story>
<story>Second story</story>
<user_review>
  <rating>5</rating>
  <comment>Great!</comment>
  <comment>Would recommend!</comment>
</user_review>
*/

// When you get the data back, it's structured as arrays:
const result = {
  story: ['First story', 'Second story'],
  user_review: [{
    rating: 5,
    comment: ['Great!', 'Would recommend!']
  }]
};
```

To make things more sensible and intuitive, you can also add a plurally-named container, e.g.

```javascript
const correctSchema = {
  stories: {
    story: [String]
  },
  user_reviews: {
    user_review: [{
      rating: Number,
      comment: [String]
    }]
  }
};

// The resulting XML will look like:
/*
<stories>
  <story>First story</story>
  <story>Second story</story>
</stories>
<user_reviews>
  <user_review>
    <rating>5</rating>
    <comment>Great!</comment>
    <comment>Would recommend!</comment>
  </user_review>
</user_reviews>
*/
```

All this fuss about singular/plural naming for Arrays might seem counterintuitive at first, but it's worth remembering.

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
      const amount = parseFloat($text.trim());
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

## Schema Hints for LLMs

String literals in schemas serve as "hints" or explanations that guide the LLM in generating appropriate content:

```javascript
const schema = {
  analysis: {
    // Basic type definitions - less guidance for LLM
    summary: String,
    risk_level: Number,
    
    // String literals as hints - better guidance
    summary: "A concise 2-3 sentence overview of the main points",
    risk_level: "A number from 1-5 where 1 is lowest risk and 5 is highest",
    
    finding: [{
      title: "A brief one-line description of the issue",
      severity: "Either 'low', 'medium', or 'high'",
      detail: "A detailed explanation with specific examples"
    }]
  }
};

// The LLM will see these hints and try to match the format:
/*
<analysis>
  <summary>The project shows strong fundamentals but has two areas of concern...</summary>
  <risk_level>3</risk_level>
  <finding>
    <title>Insufficient test coverage in core modules</title>
    <severity>high</severity>
    <detail>The authentication module lacks integration tests...</detail>
  </finding>
  <finding>
    <title>Dependencies need updating</title>
    <severity>medium</severity>
    <detail>Several packages are 2 major versions behind...</detail>
  </finding>
</analysis>
*/

// Note: You'll still need to transform the values after:
const schema = {
  analysis: {
    summary: "A concise 2-3 sentence overview",  // Hint for LLM
    risk_level: ({$text}) => parseInt($text),    // Transform to Number
    finding: [{
      severity: ({$text}) => {                   // Validate severity
        const level = $text.toLowerCase();
        if (!['low', 'medium', 'high'].includes(level)) {
          throw new Error('Invalid severity level');
        }
        return level;
      }
    }]
  }
};
```

### Best Practices for Hints

1. **Be Specific**
```javascript
// ❌ Vague hint
{
  score: "A score"
}

// ✅ Clear guidance
{
  score: "A number between 0-100 representing completion percentage"
}
```

2. **Include Format Examples**
```javascript
{
  date: "ISO date format, e.g., '2024-03-14'",
  color: "Hex color code, e.g., '#FF0000'",
  phone: "International format with country code, e.g., '+1-555-0123'"
}
```

3. **Define Constraints**
```javascript
{
  username: "Alphanumeric, 3-20 characters, no spaces",
  password: "At least 8 characters with 1 number and 1 special character",
  status: "One of: 'active', 'pending', 'disabled'"
}
```

4. **Provide Context**
```javascript
{
  technical_score: "Rate technical complexity from 1-5 considering code structure, dependencies, and testing requirements",
  business_impact: "Describe the potential effect on revenue, user experience, and market position"
}
```

### Combining Hints with Transformations

Important: When using string literals as hints, no transformations occur - the values come through as plain strings. You'll need to transform the data after receiving it:

```javascript
// First Request: Schema with hints for the LLM
const analysisStream = stream('Analyze the code', {
  schema: {
    analysis: {
      complexity: "Rate from 1-5 where 5 is most complex",  // Hint for LLM
      risk_level: "High, Medium, or Low risk assessment",   // Hint for LLM
      issue: [{
        severity: "A number from 1-3 (1=low, 2=medium, 3=high)",
        description: "Detailed explanation of the issue"
      }]
    }
  }
});

// Get the raw result (all values are strings)
const rawResult = await analysisStream.last();
/* Might be:
{
  analysis: {
    complexity: "4",                // Still a string!
    risk_level: "High",            // Still a string!
    issue: [{
      severity: "3",               // Still a string!
      description: "The auth..."
    }]
  }
}
*/

// Then transform the raw data:
const transformedResult = {
  analysis: {
    complexity: parseInt(rawResult.analysis.complexity),
    risk_level: rawResult.analysis.risk_level.toLowerCase(),
    issue: rawResult.analysis.issue.map(issue => ({
      severity: parseInt(issue.severity),
      description: issue.description
    }))
  }
};
```
