# Schema-Based Streaming

When using xmllm with a schema, you get structured data streaming with built-in modes for handling updates.

## Streaming Modes

```javascript
import { stream } from 'xmllm';

// 1. State Mode (default)
const colors = stream('List colors', {
  schema: { color: Array(String) },
  mode: 'state'
});

for await (const update of colors) {
  console.log(update);
  // Shows growing state:
  // { color: ['re'] }               // Partial
  // { color: ['red'] }              // Complete
  // { color: ['red', 'blu'] }       // Complete + Partial
  // { color: ['red', 'blue'] }      // Both Complete
}

// 2. Delta Mode
const updates = stream('List colors', {
  schema: { color: Array(String) },
  mode: 'delta'
});

for await (const update of updates) {
  console.log(update);
  // Only shows new complete elements:
  // { color: ['red'] }     // First complete
  // { color: ['blue'] }    // Second complete
}

// 3. Snapshot Mode
const snapshots = stream('List colors', {
  schema: { color: Array(String) },
  mode: 'snapshot'
});

for await (const update of snapshots) {
  console.log(update);
  // Shows complete state at each point:
  // { color: ['red'] }           // First complete
  // { color: ['red', 'blue'] }   // Both complete
}
```

## Complex Schemas

The schema system handles nested structures and arrays:

```javascript
const analysis = stream('Analyze this text', {
  schema: {
    analysis: {
      sentiment: String,
      topics: {
        topic: [{          // Array of topics
          $text: String,   // Topic text
          $score: Number   // Topic score attribute
        }]
      },
      key_points: {
        point: [String]    // Array of strings
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

## Handling Partial Updates

Schema streaming automatically handles partial content:

```javascript
const stream1 = stream('List items', {
  schema: {
    items: {
      item: [{
        name: String,
        count: Number
      }]
    }
  },
  mode: 'state'  // See partial updates
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

Arrays in schemas require special handling:

```javascript
// 1. Simple array of values
const tags = stream('List tags', {
  schema: {
    tags: {
      tag: [String]  // Array of strings
    }
  }
});

// 2. Array of objects
const users = stream('List users', {
  schema: {
    users: {
      user: [{        // Array of user objects
        name: String,
        age: Number
      }]
    }
  }
});

// 3. Nested arrays
const data = stream('List data', {
  schema: {
    categories: {
      category: [{              // Array of categories
        name: String,
        items: {
          item: [String]        // Array of items per category
        }
      }]
    }
  }
});
```

## Collecting Results

Different ways to handle schema-based streams:

```javascript
// 1. See every update
for await (const update of stream('Query', {
  schema: { answer: String },
  mode: 'state'
})) {
  console.log('Progress:', update);
}

// 2. Wait for completion
const final = await stream('Query', {
  schema: { answer: String },
  mode: 'delta'  // Only complete elements
}).last();

// 3. Get first complete result
const first = await stream('Query', {
  schema: { answer: String },
  mode: 'delta'
}).first();

// 4. Collect all results
const all = await stream('Query', {
  schema: { answer: String },
  mode: 'delta'
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