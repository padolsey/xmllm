# xmllm API Reference

This is the API reference documentation for xmllm. For getting started and conceptual guides, see the [main documentation](../../readme.md).

## Core Functions

- [`simple(prompt, schema?, options?)`](./core.md#simple) - One-shot structured data from AI
- [`stream(prompt, options?)`](./core.md#stream) - Real-time streaming interface
- [`xmllm()/pipeline()`](./core.md#xmllm--pipeline) - Complex processing chains
- [`configure(options)`](./core.md#configure) - Global configuration

## Type System

- [Type Constructors](./types.md#available-types) - `string()`, `number()`, `boolean()`, etc.
- [Type Methods](./types.md#type-methods) - `withDefault()`, `withTransform()`, etc.
- [ItemsType](./types.md#itemstype) - Array handling
- [Type Composition](./types.md#type-composition) - Combining types

## Stream Interface

- [Chainable Methods](./stream.md#chainable-methods) - `select()`, `map()`, `filter()`, etc.
- [Terminal Operations](./stream.md#terminal-operations) - `first()`, `last()`, `all()`
- [Stream Modes](./stream.md#stream-modes) - Different streaming behaviors

## Pipeline API

- [Pipeline Helpers](./pipeline.md#pipeline-helpers) - Built-in transformation helpers
- [Pipeline Patterns](./pipeline.md#pipeline-patterns) - Common usage patterns
- [Terminal Operations](./pipeline.md#terminal-operations) - Pipeline result handling

## Error Handling

- [Error Types](./errors.md#error-types) - Provider and validation errors
- [Error Messages](./errors.md#error-messages) - Customizing error messages
- [Error Handling Patterns](./errors.md#error-handling-patterns) - Best practices

## Configuration

- [Global Configuration](./configuration.md#global-configuration) - System-wide settings
- [Model Configuration](./configuration.md#model-configuration) - LLM provider settings
- [Token Management](./configuration.md#token-management) - Context window handling
- [Parser Configuration](./configuration.md#parser-configuration) - XML/Idio settings

## Quick Examples

```javascript
// Simple one-shot request
const result = await simple(
  "What is 2+2?",
  { answer: types.number() }
);

// Real-time streaming
const stream1 = stream('List colors')
  .select('color')
  .text();

// Schema-based streaming
const stream2 = stream('Analyze text', {
  schema: {
    sentiment: types.string(),
    score: types.number()
  }
});

// Complex pipeline
const pipeline1 = xmllm(({ prompt, map }) => [
  prompt('Get data'),
  map(transform),
  filter(validate)
]);

// Global configuration
configure({
  logging: { level: 'DEBUG' },
  defaults: {
    temperature: 0.7,
    model: 'anthropic:good'
  }
});
```

## TypeScript Support

xmllm includes TypeScript definitions out of the box. See [index.d.ts](../../index.d.ts) for detailed type information.

```typescript
import { simple, Schema, types } from 'xmllm';

interface Analysis {
  sentiment: string;
  score: number;
}

const result = await simple<Analysis>(
  "Analyze this text",
  {
    sentiment: types.string(),
    score: types.number()
  }
);
``` 