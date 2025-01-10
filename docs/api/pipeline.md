# Pipeline API Reference

## xmllm()/pipeline()

Creates a pipeline for complex processing chains.

```typescript
function xmllm<T>(
  pipelineFn: (helpers: PipelineHelpers) => Array<PipelineOperation<T>>
): AsyncGenerator<T> & {
  first(n?: number): Promise<T>;
  last(n?: number): Promise<T>;
  all(): Promise<T[]>;
}
```

## Pipeline Helpers

### Prompt Functions

```typescript
interface PipelineHelpers {
  // Basic prompt with streaming
  prompt(
    promptOrConfig: string | PromptConfig,
    schema?: Schema
  ): AsyncGenerator;
  p: typeof prompt;  // Alias

  // Prompt that only yields complete elements
  promptClosed(
    promptOrConfig: string | PromptConfig,
    schema?: Schema
  ): AsyncGenerator;
  pc: typeof promptClosed;  // Alias

  // Raw request without schema processing
  req(config: RequestConfig): AsyncGenerator;
  r: typeof req;  // Alias

  // Selection helpers
  select(selector: string): AsyncGenerator<XMLElement>;
  mapSelect(
    schema: Schema,
    includeOpenTags?: boolean,
    doDedupe?: boolean
  ): AsyncGenerator;
  mapSelectClosed(schema: Schema): AsyncGenerator;

  // Stream operations
  map<T, U>(fn: (input: T) => U): AsyncGenerator<U>;
  filter<T>(fn: (input: T) => boolean): AsyncGenerator<T>;
  reduce<T, U>(
    fn: (acc: U, input: T) => U,
    initial: U
  ): AsyncGenerator<U>;
  tap<T>(fn: (input: T) => void): AsyncGenerator<T>;
  accrue<T>(): AsyncGenerator<T[]>;
  combine(...streams: AsyncGenerator[]): AsyncGenerator;
}
```

## Pipeline Operations

A pipeline operation can be any of:

```typescript
type PipelineOperation<T> =
  | T                                           // Raw value
  | AsyncGenerator<T>                           // Generator
  | ((input: any) => T | Promise<T>)           // Function
  | ((input: any) => AsyncGenerator<T>)        // Generator function
  | Array<PipelineOperation<T>>;               // Parallel operations
```

## Configuration Types

```typescript
interface PromptConfig {
  prompt?: string;
  messages?: Message[];
  system?: string;
  schema?: Schema;
  temperature?: number;
  model?: ModelPreference;
  strategy?: string;
  mode?: StreamMode;
}

interface RequestConfig {
  messages: Message[];
  model?: ModelPreference;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  presencePenalty?: number;
  frequencyPenalty?: number;
  topP?: number;
}

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  name?: string;
}
```

## Terminal Operations

```typescript
const pipeline = xmllm(helpers => [ /* ... */ ]);

// Get first result(s)
await pipeline.first();      // Single result
await pipeline.first(3);     // First three results

// Get last result(s)
await pipeline.last();       // Single result
await pipeline.last(2);      // Last two results

// Get all results
await pipeline.all();        // All results as array

// Manual iteration
for await (const result of pipeline) {
  // Process each result
}
``` 