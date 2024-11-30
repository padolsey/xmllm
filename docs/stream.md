# Streaming Interface

The `stream()` function is xmllm's main interface for processing AI responses. It returns a chainable `XMLStream` that lets you transform and filter data as it arrives.

## Basic Usage

```javascript
import { stream } from 'xmllm';

// With schema:
const analysis = stream('Analyze this text', {
  schema: {
    sentiment: String,
    score: Number
  }
});

// With selectors:
const thoughts = stream('Share some thoughts')
  .select('thought')
  .text();

// Both approaches use the same chainable methods
for await (const update of thoughts) {
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
  schema?: SchemaType,         // Optional schema
  system?: string,             // System prompt
  model?: string | string[],   // Model selection
  temperature?: number,        // 0-2, default 0.72
  maxTokens?: number,         // Max response length
  cache?: boolean,            // Enable caching
  mode?: 'state' | 'delta' | 'snapshot' | 'realtime'
}
```

### options
Additional options that override promptOrConfig:
```javascript
{
  llmStream?: StreamFunction,  // Custom stream provider
  apiKeys?: Record<string, string>,  // Provider API keys
  clientProvider?: ClientProvider    // For browser usage
}
```

## Chainable Methods

### Data Selection
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
.first()                      // Get first result
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

## simple() Function

For one-shot requests without streaming:

```javascript
import { simple } from 'xmllm';

const result = await simple(
  'What is 2+2?',
  { answer: Number }
);
```

Equivalent to:
```javascript
const result = await stream('What is 2+2?', {
  schema: { answer: Number },
  mode: 'delta'
}).last();
```

## Working with Streams

There are two main approaches to working with streams:

### 1. Schema-Based ([details](./schema_streaming.md))
```javascript
const stream1 = stream('List colors', {
  schema: { color: Array(String) },
  mode: 'state'  // See updates as they arrive
});
```

### 2. Selector-Based ([details](./raw_streaming.md))
```javascript
const stream2 = stream('List colors')
  .select('color')    // Find <color> elements
  .closedOnly()       // Only complete tags
  .text();           // Get text content
```

Both approaches use the same chainable methods, but handle the XML stream differently under the hood.

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
  if (error.message.includes('LLM request timed out')) {
    // Handle timeout
  }
}
```

## Browser Usage

For browser environments, see the [Provider Setup Guide](./providers.md#browser-usage) for details on configuring the proxy server. Basic usage:

```javascript
import { stream, ClientProvider } from 'xmllm/client';

const client = new ClientProvider('http://localhost:3124/api/stream');

const result = await stream('Query', {
  schema: { answer: String },
  clientProvider: client
}).last();
``` 

