# Streaming Guide

> For the complete API reference, see the [Stream API Reference](./api/stream.md)

xmllm provides powerful streaming capabilities for processing AI responses in real-time. This guide covers common patterns and practical examples. 

## Quick Results with simple()

For when you just want the final result, and are unconcerned about the streaming updates:

```javascript
import { simple } from 'xmllm';

// Get a clean, complete result
const result = await simple('Analyze this text: ' + TEXT, {
  schema: {
    sentiment: String,
    score: Number
  }
});

console.log(result);
// { sentiment: 'positive', score: 0.92 }
```

## Streaming with stream()

For when you need to process updates as they arrive:

### 1. Raw XML Streaming ([details](./raw_streaming.md))
```javascript
const thoughts = stream('Share some thoughts')
  .select('thought')    // Find <thought> elements
  .text();             // Get text content

for await (const thought of thoughts) {
  console.log(thought);
}
```

### 2. Schema-Based Streaming ([details](./schema_streaming.md))
```javascript
const analysis = stream('Analyze this text', {
  schema: {
    sentiment: String,
    score: Number
  }
});

for await (const update of analysis) {
  console.log(update);
}
```

## Configuration

```javascript
stream(promptOrConfig, options)
```

### promptOrConfig
Either a string prompt or configuration object:
```javascript
{
  prompt: string,              // The prompt to send
  model?: string | string[],   // Model selection
  strategy?: string,           // Prompt strategy (see strategies.md)
  schema?: Schema,         // Enable schema processing
  hints?: Hint,
  temperature?: number,        // 0-2, default 0.72
  maxTokens?: number,         // Max response length
  cache?: boolean,            // Enable caching
  
  // Schema-specific options:
  system?: string,             // System prompt
  mode?: 'state_open' | 'state_closed' | 'root_open' | 'root_closed'
}
```

### options
Additional options that override promptOrConfig:
```javascript
{
  llmStream?: StreamFunction,  // Custom stream provider
  keys?: Record<string, string>,  // Provider API keys
  clientProvider?: ClientProvider    // For browser usage
}
```

## Chainable Methods

### Selection & Extraction
```javascript
.select(selector: string)     // CSS selector for elements
.text()                       // Extract text content
.closedOnly()                 // Only complete elements
```

### Transformation
```javascript
.map(fn: (value: T) => U)    // Transform values
.filter(fn: (value: T) => boolean)  // Filter values
.reduce(fn: (acc: U, value: T) => U, initial: U)  // Reduce values
```

### Collection
```javascript
.first()                     // Get first result
.last(n?: number)            // Get last n results (default 1)
.all()                       // Get all results as array
.merge()                     // Deep merge all results
```

### Pagination
```javascript
.take(n: number)             // Take first n results
.skip(n: number)             // Skip first n results
```

### Debug
```javascript
.debug(label?: string)       // Log debug information
.raw()                       // Get raw response chunks
```

## Browser Usage

For browser environments, see the [Provider Setup Guide](./providers.md#browser-usage):

```javascript
import { stream, ClientProvider } from 'xmllm/client';

const client = new ClientProvider('http://localhost:3124/api/stream');

const result = await stream('Query', {
  clientProvider: client
}).last();
```

## Error Handling

```javascript
try {
  const result = await stream('Query')
    .select('answer')
    .first();
} catch (error) {
  if (error.message.includes('Failed to connect')) {
    // Handle network error
  }
}
``` 

