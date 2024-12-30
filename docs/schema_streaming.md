# Schema-Based Streaming

When using xmllm with a schema, you get structured data streaming with built-in modes for handling updates.

## Streaming Modes

```javascript
import { stream, types } from 'xmllm';

// 1. State (Open) Mode - Shows growing state including partials
const colors = stream('List colors', {
  schema: { 
    color: [types.string("Color name")] 
  },
  mode: 'state_open'  // default mode
});

for await (const update of colors) {
  console.log(update);
  // Shows growing state:
  // { color: ['re'] }               // Partial
  // { color: ['red'] }              // Complete
  // { color: ['red', 'blu'] }       // Complete + Partial
  // { color: ['red', 'blue'] }      // Both Complete
}

// 2. State (Closed) Mode - Shows complete state at each point
const snapshots = stream('List colors', {
  schema: { 
    color: [types.string("Color name")] 
  },
  mode: 'state_closed'
});

for await (const update of snapshots) {
  console.log(update);
  // Shows complete state at each point:
  // { color: ['red'] }           // First complete
  // { color: ['red', 'blue'] }   // Both complete
}

// 3. Root (Closed) Mode - Shows each complete root element once
const updates = stream('List colors', {
  schema: { 
    color: [types.string("Color name")] 
  },
  mode: 'root_closed'
});

for await (const update of updates) {
  console.log(update);
  // Only shows new complete elements:
  // { color: ['red'] }     // First complete
  // { color: ['blue'] }    // Second complete
}

// 4. Root (Open) Mode - Shows each root element's progress once
const progress = stream('List colors', {
  schema: { 
    color: [types.string("Color name")] 
  },
  mode: 'root_open'
});

for await (const update of progress) {
  console.log(update);
  // Shows progress of each root element once:
  // { color: ['re'] }      // First partial
  // { color: ['red'] }     // First complete
  // { color: ['blu'] }     // Second partial
  // { color: ['blue'] }    // Second complete
}
```

## Complex Schemas

The schema system handles nested structures and arrays with type hints and transformations:

```javascript
const analysis = stream('Analyze this text', {
  schema: {
    analysis: {
      sentiment: types.enum("Overall sentiment", ['POSITIVE', 'NEUTRAL', 'NEGATIVE'])
        .withDefault('NEUTRAL'),
      topics: {
        topic: [{          
          $text: types.string("Topic description"),   
          $score: types.number("Relevance score 0-1")
            .withTransform(n => Math.min(1, Math.max(0, n)))
        }]
      },
      key_points: {
        point: [types.string("Key insight or observation")]    
      }
    }
  }
});

for await (const update of analysis) {
  // Updates might look like:
  // { analysis: { sentiment: 'pos' } }
  // { analysis: { sentiment: 'positive', topics: { topic: [{ text: 'AI', score: 0.8 }] } } }
  // etc.
}
```

## Type Processing Order

The type system processes values in a consistent order:

```javascript
const stream1 = stream('Process data', {
  schema: {
    data: {
      value: types.number("Score between 0-100")
        .withTransform(n => Math.min(100, Math.max(0, n)))  // Clamp between 0-100
        .withDefault(0),                                     // Default if invalid
      status: types.enum("Processing status", ['PENDING', 'DONE'])
        .withValidate(s => ['PENDING', 'DONE'].includes(s)) // Validate allowed values
        .withDefault('PENDING')                             // Default if invalid
    }
  }
});

// Processing order for each value:
// 1. Parse raw value according to type
// 2. Apply custom transform
// 3. Apply validation
// 4. Use default if invalid
```

## Handling Partial Updates

Schema streaming automatically handles partial content:

```javascript
const stream1 = stream('List items', {
  schema: {
    items: {
      item: [{
        name: types.string("Item name")
          .withTransform(s => s.trim()),
        count: types.number("Quantity")
          .withDefault(0)
      }]
    }
  },
  mode: 'state_open'  // See partial updates
});

// You might see:
// { items: { item: [{ name: 'App' }] } }                    // Partial
// { items: { item: [{ name: 'Apple', count: 5 }] } }       // Complete
// { items: { item: [
//   { name: 'Apple', count: 5 },
//   { name: 'Ban' }                                         // Next partial
// ] } }
```

## Working with Arrays

Arrays in schemas support type hints and transformations:

```javascript
// 1. Simple array of values
const tags = stream('List tags', {
  schema: {
    tags: {
      tag: [types.string("Tag name").withTransform(s => s.toLowerCase())]
    }
  }
});

// 2. Array of objects
const users = stream('List users', {
  schema: {
    users: {
      user: [{        
        name: types.string("User's full name"),
        age: types.number("Age in years")
          .withTransform(n => Math.floor(n))
      }]
    }
  }
});

// 3. Nested arrays
const data = stream('List data', {
  schema: {
    categories: {
      category: [{              
        name: types.string("Category name"),
        items: {
          item: [types.string("Item in category")]
        }
      }]
    }
  }
});
```

## Collecting Results

Different ways to handle schema-based streams:

```javascript
// 1. See every update (including partials)
for await (const update of stream('Query', {
  schema: { answer: String },
  mode: 'state_open'
})) {
  console.log('Progress:', update);
}

// 2. Get final complete state
const final = await stream('Query', {
  schema: { answer: String },
  mode: 'state_closed'  // Best for getting clean final state
}).last();

// 3. Process complete elements one by one
const elements = await stream('Query', {
  schema: { answer: String },
  mode: 'root_closed'  // Best for processing elements individually
}).all();
```

## Error Recovery

Schema streaming provides type safety and validation:

```javascript
const numbers = stream('List numbers', {
  schema: {
    numbers: {
      value: [Number]  // Expects numbers
    }
  }
});

for await (const update of numbers) {
  // Invalid numbers are converted to NaN
  // Missing fields return undefined
  // Malformed XML is skipped
  console.log(update);
}
```

## Transformation During Streaming

You can still use stream methods with schemas:

```javascript
const colors = stream('List colors', {
  schema: { color: Array(String) }
})
.map(update => ({
  ...update,
  count: update.color.length,
  complete: update.color.every(c => c.length > 2)
}))
.filter(update => update.count > 0);

// Yields objects like:
// { color: ['red'], count: 1, complete: true }
// { color: ['red', 'blue'], count: 2, complete: true }
```

## Error Handling with Schemas

When using schemas, you can handle errors by configuring `errorMessages` to include a specific tag such as `<error>`. This allows you to process errors in the same stream as schema data. 

```javascript
// Configure error messages to use XML tags
configure({
  defaults: {
    errorMessages: {
      rateLimitExceeded: "<error>Rate limit exceeded</error>",
      networkError: "<error>Network connection failed</error>",
      genericFailure: "<error>An unexpected error occurred</error>"
    }
  }
});

// Then use schema and error handling together
// NOTE: don't include the error tag in the schema
// (There is no need, and it will mislead the LLM)
const mainStream = stream('Get user data', {
  schema: {
    user: [{
      name: String,
      age: Number
    }]
  }
});

// E.g. Get the 'end state' schema data
const userData = await mainStream.last();
// { user: [{ name: 'Alice', age: 30 }, { name: 'Bob', age: 25 }] }

// E.g. Get any errors that were streamed in:
const errors = await mainStream
  .select('error')
  .text()
  .collect();
// ['Rate limit exceeded']

// Or handle both in real-time:
for await (const update of mainStream) {
  console.log('Update:', update);
}
for await (const errorUpdate of mainStream.select('error').text()) {
  console.log('Error:', errorUpdate);
}
```

BTW: You can also configure error messages per-request; you don't have to do it with a global `configure()` call.

```javascript
stream('Make users', {
  schema: {
    user: [{
      name: String
    }]
  },
  errorMessages: {
    rateLimitExceeded: "<error>Custom rate limit message</error>",
    networkError: "<error>Custom network error message</error>"
  }
});
```

``` 