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