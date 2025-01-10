# Pipeline API

The Pipeline API is xmllm's lower-level interface, giving you direct control over data flow. While [`stream()`](./api/stream.md) is great for common cases, pipelines let you chain multiple requests and transformations together, process results in parallel, and build custom streaming flows. Under the surface pipelines are implemented via [streamops](https://github.com/padolsey/streamops).

## Core Concepts

A pipeline is an array of operations that can include:

```javascript
import { pipeline } from 'xmllm';

const stream = pipeline(({ prompt, map }) => [
  // 1. Raw Values
  42,                           // Single value
  ['red', 'blue'],              // Array of values
  
  // 2. Functions (one input → one output)
  (x) => x.toUpperCase(),      // Transform each value
  async (x) => fetch(x),       // Async operation
  
  // 3. Generators (one input → many outputs)
  function*() {
    yield 'first';
    yield 'second';
  },
  
  // 4. Built-in Operations
  prompt('List colors'),        // AI prompt
  map(x => x * 2)               // Transform
]);

for await (const update of stream) {
  console.log(update); // See results as they arrive
}
```

Pipeline operations are passed into the function you pass to `xmllm()`. This is done so we have a concept of a pipeline context where state is maintained between operations.

## Parallel Processing

Arrays in a pipeline create parallel branches:

```javascript
pipeline(({ prompt, reduce }) => [
  // Parallel prompts
  [
    prompt('List colors', {
      colors: [String]
    }),
    prompt('List numbers', {
      numbers: [Number]
    })
  ],
  
  // Merge results
  reduce((acc, item) => ({
    ...acc,
    ...item
  }), {})
]);

// Result: { colors: [...], numbers: [...] }
```

## Functions vs Generators

### Functions: Transform One Value at a Time
```javascript
pipeline(({ prompt }) => [
  prompt('Count to 3'),
  // Function gets called for each value
  (x) => x.toUpperCase(),
  (x) => `Number ${x}`
]);
// "ONE", "TWO", "THREE"
```

### Generators: Yield Multiple Values with State
```javascript
pipeline(({ prompt }) => [
  prompt('Count to 3'),
  // Generator maintains state across values
  function*() {
    let count = 0;
    while (true) {
      count++;
      yield `Count: ${count}`;
    }
  }
]);
// "Count: 1", "Count: 2", "Count: 3"
```

## Result Accumulation

Use accrue() to collect all results before processing:

```javascript
pipeline(({ prompt, accrue }) => [
  prompt('List numbers', {
    numbers: [Number]
  }),
  
  // Wait for all numbers
  accrue(),
  
  // Process complete set
  (allNumbers) => ({
    count: allNumbers.length,
    sum: allNumbers.reduce((a, b) => a + b, 0),
    average: allNumbers.reduce((a, b) => a + b, 0) / allNumbers.length
  })
]);
```

## Complex Examples

### Chained Prompts
```javascript
pipeline(({ prompt }) => [
  // First prompt
  prompt('Name a scientist', {
    scientist: {
      name: String,
      field: String
    }
  }),

  // Use result in next prompt
  ({ scientist }) => prompt(
    `What was ${scientist.name}'s biggest discovery?`,
    {
      discovery: {
        year: Number,
        description: String
      }
    }
  ),

  // Combine results
  ({ scientist, discovery }) => ({
    scientist,
    discovery
  })
]);
```

### Stateful Processing
```javascript
pipeline(({ prompt }) => [
  prompt('List numbers'),
  
  // Maintain state between values
  function*() {
    let sum = 0;
    while (true) {
      const num = yield;
      sum += parseInt(num);
      yield {
        number: num,
        runningTotal: sum
      };
    }
  }
]);
```

### Conditional Processing
```javascript
pipeline(({ prompt }) => [
  prompt('Analyze text'),
  
  // Branch based on content
  async function*(analysis) {
    if (analysis.sentiment === 'positive') {
      yield* processPositive(analysis);
    } else {
      yield* processNegative(analysis);
    }
  }
]);
```

## In-built Pipeline Helpers

In addition to `prompt()` and `map()`, several other helpers are available within the pipeline context. These helpers are documented in detail in the [Pipeline Helpers](./api.md#pipeline-helpers) section of **api.md**.
