# Streaming Guide

xmllm provides powerful streaming capabilities that let you process AI responses as they arrive.

## Core Concepts

### Streaming Modes

xmllm offers four modes for handling streaming data:

```javascript
// 1. State Mode (default) - See progress as it happens
const analysis = stream('Analyze text', {
  schema: { sentiment: String },
  mode: 'state'  // Shows growing state
});
// Yields:
// { sentiment: 'Pos' }        // Partial
// { sentiment: 'Positive' }   // Complete

// 2. Delta Mode - Only complete elements
const items = stream('List items', {
  schema: { item: Array(String) },
  mode: 'delta'  // Only complete items
});
// Yields:
// { item: ['first'] }   // When first completes
// { item: ['second'] }  // When second completes

// 3. Snapshot Mode - Current complete state
const stats = stream('Get stats', {
  schema: { users: Number },
  mode: 'snapshot'  // Complete state at each point
});
// Yields:
// { users: 10 }     // First complete state
// { users: 10 }     // No change
// { users: 20 }     // Updated state

// 4. Realtime Mode - Everything (for debugging)
const debug = stream('Test', {
  schema: { data: String },
  mode: 'realtime'  // See all updates
});
// Yields:
// { data: '' }      // Empty tag
// { data: 'te' }    // Partial
// { data: 'test' }  // Complete
```

### Simple vs Streaming

```javascript
// 1. Simple - Just get final result
const result = await simple('Analyze text', {
  analysis: { score: Number }
});
// Waits for completion, returns final state

// 2. Streaming - See updates as they arrive
const progress = stream('Analyze text', {
  schema: { analysis: { score: Number }},
  mode: 'state'  // Show progress
});
for await (const update of progress) {
  console.log('Update:', update);
}
```

### Streaming vs Complete Elements

```javascript
// 1. Stream Processing - see all updates
for await (const update of stream('List colors', {
  schema: { color: Array(String) },
  mode: 'state'  // default mode - shows all updates
})) {
  console.log('Update:', update);
  // Might see:
  // { color: ['re'] }
  // { color: ['red'] }
  // { color: ['red', 'blu'] }
  // { color: ['red', 'blue'] }
}

// 2. Complete Elements Only
for await (const update of stream('List colors', {
  schema: { color: Array(String) },
  mode: 'delta'  // only complete elements
})) {
  console.log('Complete:', update);
  // Only sees:
  // { color: ['red'] }
  // { color: ['blue'] }
}
```

### Element States

XML elements can be in different states during streaming:

```javascript
stream('Analyze this', {
  schema: { analysis: String },
  mode: 'state'  // to see all states
})
.map(element => ({
  text: element.analysis,     // Current text content
  isComplete: true           // Using mode to control what we see
}));

// Example states with state mode:
// { text: "This text is", isComplete: false }
// { text: "This text is great", isComplete: true }

// With delta mode, only see complete states:
// { text: "This text is great", isComplete: true }
```

## Common Patterns

### Progress Indicators

Show progress as the AI thinks:

```javascript
let dots = '';
const analysis = stream('Analyze this text...')
  .select('thought')
  .map(({$text, $tagclosed}) => {
    // Show typing indicator for partial content
    if (!$tagclosed) {
      dots = dots.length < 3 ? dots + '.' : '';
      return `Thinking${dots}: ${$text}`;
    }
    // Show complete thought
    return `Complete: ${$text}`;
  });

for await (const update of analysis) {
  console.clear();
  console.log(update);
}
```

### Accumulating Results

Collect results while showing progress:

```javascript
const colors = [];
const colorStream = stream('List 5 colors')
  .select('color')
  .map(({$text, $tagclosed}) => {
    if ($tagclosed) {
      colors.push($text);
    }
    return {
      current: $text,
      collected: colors.length,
      total: 5
    };
  });

for await (const update of colorStream) {
  console.log(
    `Progress: ${update.collected}/5 colors`,
    `Current: ${update.current}`
  );
}
```

### Validation During Streaming

Handle potentially invalid data:

```javascript
const numbers = stream('List numbers')
  .select('number')
  .map(({$text, $tagclosed}) => {
    // Try to parse number
    const num = parseInt($text);
    if (isNaN(num)) {
      if ($tagclosed) {
        return null; // Skip invalid complete numbers
      }
      return '...'; // Show placeholder for partial content
    }
    return num;
  })
  .filter(n => n !== null); // Remove invalid entries
```

### State Management

Maintain state across streaming updates:

```javascript
// Using generator function
const withRunningTotal = function*() {
  let sum = 0;
  while (true) {
    const num = yield; // Get next number
    if (typeof num === 'number') {
      sum += num;
      yield {
        value: num,
        runningTotal: sum
      };
    }
  }
};

// Use in stream
const numbers = stream('List numbers')
  .select('number')
  .map(({$text}) => parseInt($text))
  .pipe(withRunningTotal());
```

### Error Recovery

Handle errors during streaming:

```javascript
try {
  const analysis = stream('Complex analysis')
    .select('point')
    .map(async ({$text, $tagclosed}) => {
      try {
        // Attempt processing
        return await processPoint($text);
      } catch (error) {
        if ($tagclosed) {
          // Log complete but failed points
          console.error('Failed to process:', $text);
          return null;
        }
        // Return partial content as-is
        return $text;
      }
    })
    .filter(result => result !== null);

  for await (const point of analysis) {
    console.log(point);
  }
} catch (error) {
  // Handle stream-level errors
  console.error('Stream failed:', error);
}
```

## Pipeline vs Stream API

xmllm offers two ways to handle streaming:

### 1. Stream API (Recommended)
```javascript
// Chainable, easier to understand
stream('Query')
  .select('item')
  .map(transform)
  .filter(validate)
  .complete();
```

### 2. Pipeline API (Advanced)
```javascript
// More flexible, handles complex cases
xmllm(({prompt, select, map}) => [
  prompt('Query'),
  select('item'),
  map(transform),
  function*(item) {
    // Custom streaming logic
    this.state = this.state || {};
    yield* processWithState(item, this.state);
  }
]);
```

Choose based on your needs:
- Use Stream API for simple transformations
- Use Pipeline API for complex state management or custom streaming logic

## Best Practices

1. **Consider Partial Content**
   - Always check `$tagclosed` when processing might fail
   - Provide appropriate feedback for partial updates
   - Use `complete()` when you need full elements

2. **Handle State Carefully**
   - Clean up state when streams end
   - Use generators for complex state
   - Consider memory usage with accumulators

3. **Error Handling**
   - Recover from processing errors
   - Provide fallbacks for partial content
   - Clean up resources in finally blocks

4. **Performance**
   - Avoid expensive operations on partial content
   - Use `complete()` for heavy processing
   - Consider batching for many small updates

5. **User Experience**
   - Show meaningful progress indicators
   - Provide feedback during processing
   - Handle both fast and slow responses gracefully 

## Working with Partial & Complete Results 

### Understanding Streaming Results

When working with xmllm streams, results arrive in chunks and gradually coalesce into complete structures:

```javascript
const analysis = stream('Analyze this text')
  .select('analysis')
  .map(({$text, $tagclosed}) => ({
    text: $text,
    isComplete: $tagclosed
  }));

// You might see:
// { text: "This tex", isComplete: false }
// { text: "This text is gr", isComplete: false }
// { text: "This text is great", isComplete: true }
```

### Using first() and last()

`first(n)` and `last(n)` help you work with streaming results:

```javascript
// Get first complete result
const firstComplete = await stream('List colors')
  .select('color')
  .closedOnly()  // Only consider complete elements
  .first();

// Get last 2 results (waits for stream to finish)
const lastTwo = await stream('List colors')
  .select('color')
  .last(2);

// Combine with schema for structured data
const finalAnalysis = await stream('Analyze text', {
  schema: {
    analysis: {
      sentiment: String,
      score: Number
    }
  }
})
.last();  // Get final complete structure
```

### When to Use Each

- Use `first()` when:
  - You need just one result quickly
  - You're validating/testing responses
  - The order matters (first response is most relevant)

- Use `last()` when:
  - You need the final/complete result
  - Working with schemas (wait for full structure)
  - You want the most refined/complete answer
  - Collecting the final n items

### Streaming vs Complete Results

Remember that streaming results may be partial:

```javascript
const colorStream = stream('List 3 colors')
  .select('color');

// 1. See every update (including partial)
for await (const color of colorStream) {
  console.log('Update:', color.$text);  // Might see: "re", "red", "blu", "blue"
}

// 2. Only see complete elements
for await (const color of colorStream.closedOnly()) {
  console.log('Complete:', color.$text);  // Only sees: "red", "blue"
}

// 3. Wait for final result
const lastColor = await colorStream.last();
console.log('Final:', lastColor.$text);  // Gets last complete color
```

### Working with Schemas

When using schemas, results build up gradually:

```javascript
const analysis = stream('Analyze text', {
  schema: {
    analysis: {
      sentiment: String,
      topics: [String],
      score: Number
    }
  }
});

// 1. See partial updates
for await (const result of analysis) {
  console.log('Partial:', result);
  // Might see:
  // { analysis: { sentiment: "Pos" } }
  // { analysis: { sentiment: "Positive", topics: ["AI"] } }
  // { analysis: { sentiment: "Positive", topics: ["AI"], score: 8 } }
}

// 2. Wait for complete structure
const final = await analysis.last();
console.log('Complete:', final);
// Gets full structure with all fields
```

### Best Practices

1. **Choose the Right Method**
   - Use streaming iteration for real-time updates/feedback
   - Use `first()`/`last()` for complete results
   - Combine with `closedOnly()` for reliable complete elements

2. **Schema Considerations**
   - Partial results may not match your schema
   - Use `last()` to wait for complete structure
   - Consider using `merge()` to combine partial updates

3. **Error Handling**
   - Partial results might be malformed
   - Use `closedOnly()` for safer processing
   - Handle timeouts when using `last()`

4. **Performance**
   - `first()` returns quickly
   - `last()` must consume entire stream
   - Consider memory usage with large streams

### Complete Configuration Example

Here's a fully qualified example showing system prompts, model selection, and other options:

```javascript
const analysis = stream({
  prompt: "Analyze this technical document",
  system: "You are an expert technical writer who excels at clear, concise analysis.",
  
  schema: {
    analysis: {
      summary: String,
      technical_level: Number,
      key_point: [String],
      recommendation: [{
        title: String,
        priority: Number,
        detail: String
      }]
    }
  },
  model: 'claude-3-opus-20240229',
  temperature: 0.7,
  maxTokens: 2000,
  cache: true,
  retryMax: 3,
  retryStartDelay: 1000,
  retryBackoffMultiplier: 2,
  waitMessageString: 'Analyzing... ',
  waitMessageDelay: 500
});

// 1. Stream updates in real-time
for await (const update of analysis) {
  console.log('Progress:', update);
  // Might see:
  // { analysis: { summary: "This document..." } }
  // { analysis: { summary: "...", keyPoints: ["First point"] } }
  // etc.
}

// 2. Or wait for final result
const final = await analysis.last();
console.log('Complete Analysis:', final);
// Gets full structure with all fields
```

This example shows:
- System prompt to guide AI behavior
- Structured schema for response format
- Model selection and parameters
- Retry logic for reliability
- Progress indicators for UX
- Both streaming and final result patterns

You can also use the same options with simpler prompts:

```javascript
const colors = stream('List 5 colors', {
  system: 'You are a color expert. Prefer unique and interesting colors.',
  model: 'claude-3-sonnet',
  temperature: 0.9
})
.select('color')
.text();

for await (const color of colors) {
  console.log('Color:', color);
}
```

## Default Behaviors

### stream() Defaults
```javascript
// By default, stream() uses 'state' mode:
const colors = stream('List colors', {
  schema: { color: Array(String) }
});

for await (const update of colors) {
  console.log(update);
}

// You'll see:
// { color: ['re'] }               // Partial content
// { color: ['red'] }              // Complete first
// { color: ['red', 'blu'] }       // Complete + partial
// { color: ['red', 'blue'] }      // Both complete
// { color: ['red', 'blue'] }      // Final state
```

### simple() Defaults
```javascript
// simple() just waits for completion:
const result = await simple('List colors', {
  color: Array(String)
});

console.log(result);
// You'll get the final complete state:
// { color: ['red', 'blue'] }
```

### Real-World Example
```javascript
// 1. Streaming UI updates (use stream's state mode)
const analysis = stream('Analyze text', {
  schema: {
    analysis: {
      sentiment: String,
      score: Number
    }
  }
});

for await (const update of analysis) {
  console.log('Progress:', update);
  // Shows partial updates:
  // { analysis: { sentiment: 'Pos' } }
  // { analysis: { sentiment: 'Positive', score: 8 } }
}

// 2. One-shot API call (use simple)
const result = await simple('Analyze text', {
  analysis: {
    sentiment: String,
    score: Number
  }
});

console.log('Final:', result);
// Shows complete result:
// { analysis: { sentiment: 'Positive', score: 8 } }
```

The defaults are chosen to match common use cases:
- `stream()` → state mode for real-time UI feedback
- `simple()` → just waits for complete result

## Streaming Modes

The `mode` option controls how and when you receive updates from the stream:

### Available Modes

```javascript
// 1. State Mode (default)
stream('List colors', {
  schema: { color: Array(String) },
  mode: 'state'
});
// Shows growing/accumulating state including partials
// Yields:
// { color: ['re'] }               // Partial content
// { color: ['red'] }              // Complete first
// { color: ['red', 'blu'] }       // Complete + partial
// { color: ['red', 'blue'] }      // Both complete

// 2. Delta Mode
stream('List colors', {
  schema: { color: Array(String) },
  mode: 'delta'
});
// Only yields when elements complete
// Yields:
// { color: ['red'] }              // First complete
// { color: ['blue'] }             // Second complete

// 3. Snapshot Mode
stream('List colors', {
  schema: { color: Array(String) },
  mode: 'snapshot'
});
// Shows current complete state at each point
// Yields:
// { color: ['red'] }              // After first completes
// { color: ['red'] }              // No change
// { color: ['red', 'blue'] }      // After second completes

// 4. Realtime Mode
stream('List colors', {
  schema: { color: Array(String) },
  mode: 'realtime'
});
// Shows everything including empty tags
// Yields:
// { color: [''] }                 // Empty tag
// { color: ['re'] }               // Partial
// { color: ['red'] }              // Complete
// { color: ['red', 'blu'] }       // Partial
// { color: ['red', 'blue'] }      // Complete
```

### Choosing a Mode

- Use `state` (default) when:
  - Building UIs that show progress
  - Want to see content as it arrives
  - Need to show growing/accumulating state

- Use `delta` when:
  - Only want complete elements
  - Processing items as they finish
  - Want to avoid partial content

- Use `snapshot` when:
  - Need point-in-time views of complete state
  - Want to ignore partial updates
  - Polling current state

- Use `realtime` when:
  - Debugging
  - Need to see everything including empty tags
  - Want maximum visibility into the stream

Note: The `simple()` function always waits for completion regardless of mode, since it uses `last()` internally.