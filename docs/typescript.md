# TypeScript Usage

xmllm is written in TypeScript and provides full type safety out of the box.

## Schema Types

The `SchemaType` system allows you to define transformations with full type inference:

```typescript
import { simple, SchemaType } from 'xmllm';

// Schema definition with type inference
const schema: SchemaType = {
  user: {
    name: String,          // infers as string
    age: Number,          // infers as number
    active: Boolean,      // infers as boolean
    // Custom transformer
    joinDate: (el: XMLElement) => new Date(el.$text)  // infers as Date
  }
};

// Result is fully typed
const result = await simple(
  "Get user info", 
  schema
);
// TypeScript knows this is { user: { name: string, age: number, ... } }
```

## String Literals as Hints

Schema values can be string literals to provide hints to the AI:

```typescript
const schema: SchemaType = {
  user: {
    name: "The user's full name",  // Valid hint
    age: Number,
    roles: ["The user's assigned roles"]  // Valid in arrays too
  }
};
```

## Generic Type Parameters

All main functions support generic type parameters for precise control:

```typescript
// Explicit return type
const result = await simple<{ count: number }>(
  "Count to 3",
  { count: Number }
);

// Stream with specific type
const stream = xmllmStream<string>("List colors")
  .select("color")
  .text();
```

## Stream API

The `stream()` function returns an `XMLStream<T>` type that supports chaining operations:

```typescript
import { stream, XMLStream } from 'xmllm';

// Basic streaming with type inference
const colors = stream("List colors")
  .select("color")     // XMLStream<XMLElement>
  .map(el => el.$text) // XMLStream<string>
  .filter(c => c.length > 3); // XMLStream<string>

// With schema - type is inferred from schema
const userStream = stream("Get user", {
  schema: {
    user: {
      name: String,
      age: Number
    }
  }
}); // XMLStream<{ user: { name: string, age: number } }>

// Combining operations with type tracking
const processedStream = stream("Get data")
  .select("item")
  .map((el): number => parseInt(el.$text))
  .filter((n): n is number => !isNaN(n))
  .map(n => n * 2);
// Type is XMLStream<number>
```

## Pipeline API

The pipeline API provides full control over the processing flow with type safety:

```typescript
import xmllm, { PipelineHelpers } from 'xmllm';

// Pipeline functions are typed through PipelineHelpers
const pipeline = (helpers: PipelineHelpers) => [
  // Each helper is properly typed
  helpers.prompt("List numbers"),
  helpers.select("number"),
  helpers.map((el): number => parseInt(el.$text)),
  helpers.filter((n: number) => n > 0),
  helpers.reduce((acc: number, n: number) => acc + n, 0)
];

// Type inference works through the pipeline
const stream = xmllm<number>(pipeline);
for await (const sum of stream) {
  // sum is typed as number
}

// Complex pipelines maintain type information
type UserData = {
  name: string;
  scores: number[];
};

const complexPipeline = (h: PipelineHelpers) => [
  h.prompt("Get user data"),
  h.select("user"),
  h.map((el): UserData => ({
    name: el.select("name").$text,
    scores: el.select("scores > score")
      .map(s => parseInt(s.$text))
  })),
  h.filter((user: UserData) => user.scores.length > 0)
];

const userStream = xmllm<UserData>(complexPipeline);
// userStream is AsyncGenerator<UserData>
```

## Error Handling Types

The library provides typed error classes:

```typescript
import { ValidationError, MessageValidationError } from 'xmllm';

try {
  await stream("Invalid prompt", {
    model: "invalid:model" // Will throw ModelValidationError
  });
} catch (e) {
  if (e instanceof MessageValidationError) {
    // Handle message validation error
  } else if (e instanceof ValidationError) {
    // Handle other validation errors
  }
}
```

## Provider Configuration Types

Provider configuration is fully typed:

```typescript
import { ModelPreference } from 'xmllm';

// String literal types for models
const model: ModelPreference = 'claude:fast';

// Or detailed configuration
const config: ModelPreference = {
  inherit: 'claude',
  name: 'claude-3-opus',
  maxContextSize: 100000
};

// Array of fallback options
const fallbacks: ModelPreference = [
  'claude:fast',
  'openai:good',
  { inherit: 'anthropic', name: 'custom-model' }
];
```