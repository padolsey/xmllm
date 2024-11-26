# Streaming Guide

xmllm provides powerful streaming capabilities that let you process AI responses as they arrive. This guide explains how streaming works and common patterns for handling streaming data.

## Core Concepts

### Streaming vs Complete Elements

```javascript
// 1. Stream Processing - see updates as they arrive
for await (const update of stream('List colors')
  .select('color')
  .text()
) {
  console.log('Partial:', update);
  // Might see: "re", "red", "blu", "blue"
}

// 2. Complete Elements - only see finished tags
for await (const color of stream('List colors')
  .select('color')
  .complete()  // Wait for </color> tags
  .text()
) {
  console.log('Complete:', color);
  // Only sees: "red", "blue"
}
```

### Element States

XML elements can be in different states during streaming:

```javascript
stream('Analyze this')
  .select('analysis')
  .map(element => ({
    text: element.$text,     // Current text content
    isComplete: element.$closed,  // Has closing tag
    attributes: element.$attr     // Any XML attributes
  }));

// Example states:
// 1. Opening: { text: "", isComplete: false }
// 2. Partial: { text: "This text is", isComplete: false }
// 3. Complete: { text: "This text is great", isComplete: true }
```

## Common Patterns

### Progress Indicators

Show progress as the AI thinks:

```javascript
let dots = '';
const analysis = stream('Analyze this text...')
  .select('thought')
  .map(({$text, $closed}) => {
    // Show typing indicator for partial content
    if (!$closed) {
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
  .map(({$text, $closed}) => {
    if ($closed) {
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
  .map(({$text, $closed}) => {
    // Try to parse number
    const num = parseInt($text);
    if (isNaN(num)) {
      if ($closed) {
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
    .map(async ({$text, $closed}) => {
      try {
        // Attempt processing
        return await processPoint($text);
      } catch (error) {
        if ($closed) {
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
   - Always check `$closed` when processing might fail
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
  .map(({$text, $closed}) => ({
    text: $text,
    isComplete: $closed
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