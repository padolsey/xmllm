# API Documentation

> Note: xmllm includes TypeScript definitions out of the box. See [index.d.ts](../index.d.ts) and [client.d.ts](../client.d.ts) for type details. This file (`api.md`) is AI generated.

## Core Functions

### xmllm() / pipeline()

Creates a pipeline for processing XML streams. Used for complex operations like chaining multiple prompts or transformations.

See [Pipeline API](#pipeline-api) below for details on available helper functions.

```typescript
function xmllm<T>(
  pipelineFn: (helpers: PipelineHelpers) => Operation[], 
  options?: XmlLmOptions
): AsyncGenerator<T> & {
  first(n?: number): Promise<T | T[]>;
  last(n?: number): Promise<T | T[]>;
  all(): Promise<T[]>;
}
```

Options:
```typescript
interface XmlLmOptions {
  timeout?: number;                    // Request timeout in ms
  llmStream?: LLMStreamFunction;       // Custom stream provider
  providerManager?: ProviderManager;   // Custom provider manager
}
```

Example:

```typescript
const analysis = pipeline(({ promptClosed, map }) => [
  // Get scientist info
  promptClosed('Name a scientist', {
    scientist: {
      name: String,
      field: String
    }
  }),

  // Use that info in next prompt
  promptClosed(({ scientist }) => ({
    messages: [{
      role: 'user',
      content: `What was ${scientist.name}'s biggest discovery?`
    }],
    schema: {
      discovery: {
        year: Number,
        description: String
      }
    }
  })),

  // Combine results
  map(({ scientist, discovery }) => ({
    scientist,
    discovery
  }))
]);

const result = await analysis.last();
```

### simple()

One-shot function for getting structured data from AI. No streaming, simpler to use than stream().

Error handling:
```typescript
try {
  const result = await simple(
    "What is 2+2?",
    { answer: Number }
  );
} catch (error) {
  if (error instanceof ProviderError) {
    // Handle API provider errors
    console.error('Provider error:', error.message);
  } else if (error instanceof ValidationError) {
    // Handle schema validation errors
    console.error('Schema error:', error.message);
  }
}
```

```typescript
async function simple<T>(
  prompt: string,
  schema: Schema,
  options?: SimpleOptions
): Promise<T>
```

Options:
```typescript
interface SimpleOptions {
  system?: string;                    // System prompt
  model?: ModelPreference;            // Model selection
  temperature?: number;               // 0-2, default 0.7
  maxTokens?: number;                 // Max response length
  cache?: boolean;                    // Enable response caching
  keys?: Record<string, string>;      // Provider API keys
  retryMax?: number;                  // Max retry attempts
  retryStartDelay?: number;           // Initial retry delay (ms)
  retryBackoffMultiplier?: number;    // Backoff multiplier
}
```

Example:

```typescript
const result = await simple(
  "What is 2+2?",
  {
    answer: {
      value: Number,
      explanation: String
    }
  }
);
```

### configure()

Configures global settings for logging and default parameters.

```typescript
function configure(options: ConfigureOptions): void
```

Options:
```typescript
interface ConfigureOptions {
  logging?: {
    level?: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'TRACE';
    custom?: (level: string, ...args: any[]) => void;
  };
  defaults?: {
    temperature?: number;              // Default temperature (0-2)
    maxTokens?: number;               // Default max tokens
    presencePenalty?: number;         // Default presence penalty
    topP?: number;                    // Default top_p value
    mode?: 'state_open' | 'root_closed' | 'state_closed' | 'root_open';
    model?: ModelPreference;          // Default model
  };
}
```

Client-specific additional options:
```typescript
interface ClientConfigureOptions extends ConfigureOptions {
  clientProvider?: ClientProvider | string;  // Required for browser usage
}
```

Examples:

```typescript
// Server-side configuration
configure({
  logging: {
    level: 'DEBUG',
    custom: (level, ...args) => console.log(`[${level}]`, ...args)
  },
  defaults: {
    temperature: 0.7,
    model: 'anthropic:good',
    mode: 'root_closed'
  }
});

// Client-side configuration
configure({
  clientProvider: 'http://localhost:3000/api/stream',
  defaults: {
    temperature: 0.8,
    mode: 'state_open'
  }
});
```

### stream()

Creates a chainable stream for processing AI responses. Main interface for most use cases.

Returns an [ChainableStreamInterface](#xmlstream-interface) instance with chainable methods.

```typescript
function stream<T>(
  promptOrConfig: string | StreamConfig,
  options?: StreamOptions
): ChainableStreamInterface<T>
```

Modes:
- `state_open`: Shows growing state including partials (default)
- `state_closed`: Shows complete state at each point 
- `root_open`: Shows each root element's progress once
- `root_closed`: Shows each complete root element once

Examples:

```typescript
// Basic usage
const colorStream = stream('List colors')
  .select('color')
  .text();

for await (const color of colorStream) {
  console.log(color);
}

// With schema
const result = await stream('What is 2+2?', {
  schema: {
    answer: {
      value: Number,
      explanation: String
    }
  },
  mode: 'root_closed'  // Only complete elements
}).last();

// Browser usage
const browserStream = stream('Query', {
  schema: { answer: String },
  clientProvider: new ClientProvider('http://localhost:3124/api/stream')
});
```

Configuration:
```typescript
interface StreamConfig {
  // Core streaming parameters
  messages?: Message[];              // Alternative to prompt
  model?: ModelPreference;           // Model selection
  temperature?: number;              // Temperature (0-2)
  maxTokens?: number;                // Max tokens
  cache?: boolean;                   // Enable caching
  autoTruncateMessages?: boolean | number; // Token limit control for message
  errorMessages?: {                  // Custom error messages
    genericFailure?: string;         // Default error message
    rateLimitExceeded?: string;      // Rate limit error message
    invalidRequest?: string;         // Invalid request error message
    authenticationFailed?: string;   // Auth failure message
    resourceNotFound?: string;       // 404 error message
    serviceUnavailable?: string;     // Service unavailable message
    networkError?: string;           // Network error message
    unexpectedError?: string;        // Unexpected error message
  };
  
  // Schema-related options
  prompt?: string;                   // Prompt text
  schema?: Schema;               // Transform schema
  hints?: Hint;                  // Schema hints
  system?: string;                   // System prompt
  mode?: 'state_open' | 'state_closed' | 'root_open' | 'root_closed';
  onChunk?: (chunk: string) => void; // Chunk callback
  strategy?: string;                 // Prompt strategy ID (see strategies.md)
  // Valid strategies = default | minimal | structured | assertive | exemplar | seed
  
  // Advanced options
  fakeDelay?: number;               // Simulate delay (testing)
  waitMessageString?: string;       // Custom wait message
  waitMessageDelay?: number;        // Wait message delay
  retryMax?: number;                // Max retry attempts
  retryStartDelay?: number;         // Initial retry delay
  retryBackoffMultiplier?: number;  // Retry backoff multiplier
}
```

The schema parameter uses the [Schema Types](#schema-types) format to transform XML into structured data.
For model configuration options, see [Model Configuration](#model-configuration).

## ChainableStreamInterface

The ChainableStreamInterface class provides a chainable API for transforming and controlling the stream of data from the LLM.

### Chainable Methods

```typescript
interface ChainableStreamInterface<T> {
  // Selection & Transformation
  select(selector: string): ChainableStreamInterface<XMLElement>     // CSS selector
  map<U>(fn: (value: T) => U): ChainableStreamInterface<U>          // Transform values
  filter(fn: (value: T) => boolean): ChainableStreamInterface<T>     // Filter values
  text(): ChainableStreamInterface<string>                          // Get text content
  
  // Stream Control
  closedOnly(): ChainableStreamInterface<T>                         // Only complete elements
  take(n: number): ChainableStreamInterface<T>                      // First n elements
  skip(n: number): ChainableStreamInterface<T>                      // Skip n elements
  batch(size: number): ChainableStreamInterface<T[]>                // Group into batches
  
  // Aggregation
  merge(): ChainableStreamInterface<T>                              // Deep merge results
  mergeAggregate(): ChainableStreamInterface<T[]>                   // Merge into array
  reduce<U>(                                         // Reduce values
    fn: (acc: U, value: T) => U, 
    initial: U
  ): ChainableStreamInterface<U>
  
  // Debugging
  debug(label?: string): ChainableStreamInterface<T>                // Log debug info
  raw(): ChainableStreamInterface<string>                          // Raw response chunks
}
```

### Terminal Operations

Methods that end the stream and return a Promise:

```typescript
interface ChainableStreamInterface<T> {
  first(): Promise<T>                    // Get first result
  last(n?: number): Promise<T>           // Get last n results
  all(): Promise<T[]>                    // Get all results
  collect(): Promise<T[]>                // Alias for all()
  value(): Promise<T>                    // Deprecated: use first() or last()
}
```

### Examples

```typescript
// Real-time updates with partial elements
const colorUpdates = stream('List colors')
  .select('color')
  .map(({$$text, $$tagclosed}) => ({
    text: $$text,
    complete: $$tagclosed
  }));

for await (const update of colorUpdates) {
  console.log(update);
  // { text: "re", complete: false }
  // { text: "red", complete: true }
}

// Collecting complete elements
const colors = await stream('List colors')
  .select('color')
  .closedOnly()  // Only complete tags
  .text()        // Extract text content
  .collect();    // Get all results

// Schema-based transformation
const analysis = await stream('Analyze text', {
  schema: {
    sentiment: {
      score: Number,
      label: String
    },
    keywords: [String]
  }
})
.closedOnly()
.last();
```

### Some Pipeline Examples

```typescript
// Basic transformation pipeline
const sentiment = pipeline(({ prompt, select, map }) => [
  prompt('Analyze the sentiment of: "Great product, highly recommend!"', {
    analysis: {
      score: Number,
      keywords: [String]
    }
  }),
  mapSelect({ analysis: { score: Number }}),
  map(({analysis}) => analysis.score > 0.5 ? 'positive' : 'negative')
]);

// Stateful pipeline with aggregation
const categoryAnalysis = xmllm(({ promptClosed, mapSelect, reduce }) => [
  promptClosed('Categorize these products: iPhone, Galaxy, Pixel', {
    product: [{
      name: String,
      category: String,
      score: Number
    }]
  }),
  mapSelect({ product: [{ score: Number }]}),
  reduce((avg, {product}) => {
    return product.reduce((sum, p) => sum + p.score, 0) / product.length;
  }, 0)
]);

// Complex chained prompts
const conversation = pipeline(({ p, map }) => [
  // First prompt
  p('Tell me a joke', {
    joke: String
  }),
  
  // Use result in next prompt
  map(async ({joke}) => {
    return p(`Rate this joke: ${joke}`, {
      rating: {
        score: Number,
        explanation: String
      }
    });
  }),
  
  // Combine results
  map(({joke, rating}) => ({
    joke,
    rating
  }))
]);
```

## Common Types (for TypeScript users and pedants)

### Schema Types

The schema system defines how XML elements are transformed into structured data.

```typescript
type Schema = {
  [key: string]: 
    | StringConstructor                 // Convert to string
    | NumberConstructor                 // Convert to number
    | BooleanConstructor               // Convert to boolean
    | ((el: XMLElement) => any)        // Custom transformer
    | Schema                       // Nested schema
    | [Schema]                     // Array of schema
    | string                           // Hint for LLM
}

// Example schemas:
const basic = {
  user: {
    name: String,
    age: Number,
    active: Boolean
  }
};

const nested = {
  product: {
    name: String,
    price: {
      amount: Number,
      currency: String
    },
    tags: [String]
  }
};

const withTransformer = {
  date: (el: XMLElement) => new Date(el.$$text),
  color: (el: XMLElement) => ({
    name: el.$$text,
    rgb: el.$$attr.rgb?.split(',').map(Number)
  })
};
```

### XMLElement

The parsed XML element structure available in transformers and selectors.

```typescript
interface XMLElement {
  $$text: string;                        // Element text content
  $$attr: Record<string, string>;        // Element attributes
  $$tagclosed: boolean;                  // Is element complete
  $$tagname: string;                     // Tag name
  $$children: XMLElement[];              // Child elements
  $$tagkey: number;                      // Internal unique ID
}

// Example usage in transformer:
const schema = {
  product: (el: XMLElement) => ({
    name: el.$$text,
    inStock: el.$$attr.stock === 'true',
    variants: el.$$children
      .filter(child => child.$$tagname === 'variant')
      .map(v => v.$$text)
  })
};
```

### Message Format

Chat-style messages for LLM interaction.

```typescript
interface Message {
  role: 'system' | 'user' | 'assistant';  // Message role
  content: string;                        // Message content
}

// Example usage:
const result = await stream({
  messages: [
    {
      role: 'system',
      content: 'You are a helpful assistant'
    },
    {
      role: 'user',
      content: 'List three colors'
    }
  ],
  schema: { color: [String] }
});
```

### Model Configuration

Options for selecting and configuring LLM providers.

```typescript
type ModelPreference = 
  | `${ModelProvider}:${ModelSpeed}`   // e.g. 'anthropic:fast'
  | `${ModelProvider}:${string}`       // e.g. 'claude:claude-3'
  | {
      inherit: ModelProvider;          // Base provider (e.g. 'claude')
      name: string;                    // Model name
      maxContextSize?: number;         // Max context window
      endpoint?: string;               // Custom endpoint
      key?: string;                    // API key
    }
  | Array<ModelString | ModelConfig>;  // Fallback chain

type ModelProvider = 'claude' | 'openai' | 'togetherai' | 'perplexityai';
type ModelSpeed = 'superfast' | 'fast' | 'good';

// Examples:
const simple = 'anthropic:fast';
const detailed = {
  inherit: 'anthropic',
  name: 'claude-3-opus-20240229',
  maxContextSize: 100000
};
const withFallback = [
  'anthropic:fast',
  'openai:good',
  { inherit: 'togetherai', name: 'mixtral-8x7b' }
];
```

## Error Types

```typescript
// Provider Errors
class ProviderError extends Error {
  name: string;
  code: string;
  provider: string;
}

class ProviderRateLimitError extends ProviderError {}
class ProviderAuthenticationError extends ProviderError {}
class ProviderTimeoutError extends ProviderError {}
class ProviderNetworkError extends ProviderError {}

// Validation Errors
class ValidationError extends Error {
  code: string;
  details: any;
  timestamp: string;
}

class MessageValidationError extends ValidationError {
  name: 'MessageValidationError';
  code: 'MESSAGE_VALIDATION_ERROR';
}

class ModelValidationError extends ValidationError {
  name: 'ModelValidationError';
  code: 'MODEL_VALIDATION_ERROR';
}

class PayloadValidationError extends ValidationError {
  name: 'PayloadValidationError';
  code: 'PAYLOAD_VALIDATION_ERROR';
}
```

## Provider Configuration

```typescript
interface ProviderConfig {
  // Circuit Breaker
  circuitBreakerThreshold?: number;    // Max errors before circuit opens
  circuitBreakerResetTime?: number;    // Time (ms) before circuit resets
  
  // Request Configuration
  REQUEST_TIMEOUT_MS?: number;         // Request timeout
  MAX_RETRIES?: number;                // Max retry attempts
  RETRY_DELAY_WHEN_OVERLOADED?: number; // Delay between retries
}
```

## Streaming Modes

The stream API supports four modes of operation:

- `state_open`: Shows growing state including partials (default)
  - Includes incomplete elements
  - Shows full state at each update
  
- `state_closed`: Shows complete state at each point
  - Only complete elements
  - Shows full state at each update
  
- `root_open`: Shows each root element's progress once
  - Includes incomplete elements
  - Only shows each element once
  
- `root_closed`: Shows each complete root element once
  - Only complete elements
  - Only shows each element once

Example:

```typescript
// Get real-time updates including partial elements
const stream1 = stream('List colors', {
  mode: 'state_open'  // default
});

// Only see complete elements once
const stream2 = stream('List colors', {
  mode: 'root_closed'
});
```

## Input Validation

The library validates:

- Messages format and content
- Model configuration
- Schema structure
- Parameter ranges (temperature, tokens etc)
- Reserved property usage in schemas

Example validation error:

```typescript
try {
  await stream('Query', {
    temperature: 3.0  // Invalid: must be 0-2
  });
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Invalid parameter:', error.message);
  }
}
``` 

## Error Message Configuration

Error messages can be configured at three levels:

1. Global defaults (via configure):

```javascript
configure({
  defaults: {
    errorMessages: {
      genericFailure: "Custom generic error message",
      rateLimitExceeded: "Custom rate limit message",
      // ... other error messages
    }
  }
});
```

2. Per-request configuration:

```javascript
stream('Query', {
  errorMessages: {
    rateLimitExceeded: "Custom rate limit message for this request",
    networkError: "Custom network error for this request"
  }
});
```

3. Proxy-level configuration (for client/browser usage):

```javascript
createServer({
  errorMessages: {
    rateLimitExceeded: "Custom proxy rate limit message",
    // ... other error messages
  }
});
```

Priority order is:
1. Request-level messages
2. Proxy configuration (if using client/browser)
3. Global defaults

Available error message types:
- `genericFailure`: Default error message
- `rateLimitExceeded`: Rate limit exceeded
- `invalidRequest`: Invalid request format/parameters
- `authenticationFailed`: Authentication failure
- `resourceNotFound`: Resource not found (404)
- `serviceUnavailable`: Service temporarily unavailable
- `networkError`: Network connection issues
- `unexpectedError`: Unexpected errors 


## Pipeline Helpers

When creating pipelines using `xmllm()` or `pipeline()`, several helper functions are available within the pipeline context. These helpers allow you to manipulate the data flow, interact with the LLM, and process the AI's responses in flexible ways.

### prompt(promptText, schema?, options?)

Sends a prompt to the AI and processes the response. Allows for streaming and schema-based parsing.

```typescript
function prompt<T>(
  promptText: string | ((input: any) => { messages: Message[]; schema?: Schema }),
  schema?: Schema,
  options?: PromptOptions
): AsyncGenerator<T>
```

- **promptText**: The prompt string to send to the AI, or a function that takes the previous input and returns a prompt configuration.
- **schema**: Optional schema to structure the AI's response.
- **options**: Additional options for the prompt, such as model preferences, temperature, etc.

Example:

```javascript
pipeline(({ prompt }) => [
  prompt('Name a scientist', {
    scientist: {
      name: String,
      field: String
    }
  })
]);
```

### promptClosed(promptText, schema?, options?)

Similar to `prompt()`, but ensures that only complete (closed) XML tags are processed. Useful when you need to wait for the AI to finish producing a complete structure before proceeding.

```typescript
function promptClosed<T>(
  promptText: string | ((input: any) => { messages: Message[]; schema?: Schema }),
  schema?: Schema,
  options?: PromptOptions
): AsyncGenerator<T>
```

### promptStream(promptText, schema?, options?)

Creates a streaming prompt, allowing for real-time processing of the AI's response. You can process partial outputs as they arrive.

```typescript
function promptStream<T>(
  promptText: string | ((input: any) => { messages: Message[]; schema?: Schema }),
  schema?: Schema,
  options?: PromptOptions
): AsyncGenerator<T>
```

### parse(xmlString)

Adds an XML string to the parser manually. Useful for testing or adding XML from non-AI sources.

```typescript
function parse(xmlString: string): AsyncGenerator<void>
```

Example:

```javascript
pipeline(({ parse, select }) => [
  parse('<root><item>Test</item></root>'),
  select('item')
]);
```

### select(selector, mapperFn?)

Selects XML elements from the parsed content using a CSS selector.

```typescript
function select(
  selector: string,
  mapperFn?: (element: XMLElement) => any
): AsyncGenerator<any>
```

Example:

```javascript
pipeline(({ select }) => [
  select('item', el => el.$$text) // Extract text content of <item> elements
]);
```

### mapSelect(schema, includeOpenTags?, doDedupe?)

Maps the parsed XML content to a JavaScript object based on the provided schema.

```typescript
function mapSelect(
  schema: Schema,
  includeOpenTags?: boolean,
  doDedupe?: boolean
): AsyncGenerator<any>
```

### mapSelectClosed(schema)

Similar to `mapSelect()`, but processes only closed XML elements. Useful when you want to ensure that the data you're processing is complete.

```typescript
function mapSelectClosed(schema: Schema): AsyncGenerator<any>
```

### map(fn)

Applies a function to each item in the stream.

```typescript
function map<U>(fn: (value: T) => U): AsyncGenerator<U>
```

Example:

```javascript
pipeline(({ map }) => [
  map(x => x.toUpperCase())
]);
```

### filter(predicate)

Filters items in the stream based on a predicate function.

```typescript
function filter(fn: (value: T) => boolean): AsyncGenerator<T>
```

Example:

```javascript
pipeline(({ filter }) => [
  filter(x => x.startsWith('A'))
]);
```

### reduce(reducer, initialValue)

Reduces the stream to a single value using a reducer function.

```typescript
function reduce<U>(fn: (acc: U, value: T) => U, initialValue: U): AsyncGenerator<U>
```

Example:

```javascript
pipeline(({ reduce }) => [
  reduce((acc, x) => acc + x, 0)
]);
```

### accrue()

Accumulates all items in the stream into an array before proceeding. Useful when you need to wait for all data before processing.

```typescript
function accrue(): AsyncGenerator<T[]>
```

Example:

```javascript
pipeline(({ accrue }) => [
  accrue(),
  (allItems) => {
    // Process allItems array
  }
]);
```

### tap(fn)

Runs a side-effect function for each item in the stream without modifying it.

```typescript
function tap(fn: (value: T) => void): AsyncGenerator<T>
```

Example:

```javascript
pipeline(({ tap }) => [
  tap(x => console.log('Received:', x))
]);
```

### waitUntil(conditions)

Waits until certain conditions are met before yielding accumulated items.

```typescript
function waitUntil(
  conditions: ((buffer: T[]) => boolean) | string[] | Record<string, any>
): AsyncGenerator<T[]>
```

- **conditions**: Can be a function that evaluates the buffer, an array of required keys, or an object with expected key-value pairs.

Example:

```javascript
pipeline(({ waitUntil }) => [
  waitUntil(buffer => buffer.length >= 5),
  (items) => {
    // Process items once 5 items have been accumulated
  }
]);
```

### mergeAggregate(options?)

Merges objects from the stream into a single object or array.

```typescript
function mergeAggregate(options?: {
  removeDuplicates?: boolean;
  alwaysArray?: boolean;
}): AsyncGenerator<T>
```

- **removeDuplicates**: Whether to remove duplicates based on value equality.
- **alwaysArray**: Whether to always represent aggregated values as arrays.

Example:

```javascript
pipeline(({ mergeAggregate }) => [
  mergeAggregate(),
  (aggregated) => {
    // Process aggregated result
  }
]);
```

### take(n)

Takes the first `n` items from the stream and then stops processing.

```typescript
function take(n: number): AsyncGenerator<T>
```

Example:

```javascript
pipeline(({ take }) => [
  take(3)
]);
```

### skip(n)

Skips the first `n` items in the stream.

```typescript
function skip(n: number): AsyncGenerator<T>
```

Example:

```javascript
pipeline(({ skip }) => [
  skip(2)
]);
```

### batch(size, options?)

Groups items from the stream into batches of a specified size.

```typescript
function batch(
  size: number,
  options?: { yieldIncomplete?: boolean }
): AsyncGenerator<T[]>
```

- **size**: Number of items per batch.
- **yieldIncomplete**: Whether to yield the last batch even if it's smaller than `size`.

Example:

```javascript
pipeline(({ batch }) => [
  batch(10),
  (batch) => {
    // Process each batch of 10 items
  }
]);
```

### text(fn?)

Extracts text content from elements. Can apply an optional transformation function.

```typescript
function text(fn?: (text: string) => any): (element: XMLElement) => any
```

Example:

```javascript
pipeline(({ text }) => [
  text(text => text.toUpperCase())
]);
```

### withAttrs(fn)

Processes an element's text and attributes.

```typescript
function withAttrs(
  fn: (text: string, attrs: Record<string, string>) => any
): (element: XMLElement) => any
```

Example:

```javascript
pipeline(({ withAttrs }) => [
  withAttrs((text, attrs) => ({
    content: text,
    attributes: attrs
  }))
]);
```

### whenClosed(fn)

Processes an element only when it's fully closed (i.e., no longer being streamed).

```typescript
function whenClosed(fn: (element: XMLElement) => any): (element: XMLElement) => any
```

### req(config)

Sends a custom AI request based on the provided configuration. Offers fine-grained control over the AI request.

```typescript
function req(config: RequestConfig): AsyncGenerator<any>
```

### Convenience Aliases

For shorthand, the following aliases are available:

- **p**, **pc**: Alias for `promptClosed`
- **ps**: Alias for `promptStream`
- **r**: Alias for `req`
- **val**, **value**, **v**: Alias for `text`

### Some Pipeline Examples

```typescript
// Basic transformation pipeline
const sentiment = pipeline(({ prompt, select, map }) => [
  prompt('Analyze the sentiment of: "Great product, highly recommend!"', {
    analysis: {
      score: Number,
      keywords: [String]
    }
  }),
  mapSelect({ analysis: { score: Number }}),
  map(({analysis}) => analysis.score > 0.5 ? 'positive' : 'negative')
]);

// Stateful pipeline with aggregation
const categoryAnalysis = xmllm(({ promptClosed, mapSelect, reduce }) => [
  promptClosed('Categorize these products: iPhone, Galaxy, Pixel', {
    product: [{
      name: String,
      category: String,
      score: Number
    }]
  }),
  mapSelect({ product: [{ score: Number }]}),
  reduce((avg, {product}) => {
    return product.reduce((sum, p) => sum + p.score, 0) / product.length;
  }, 0)
]);

// Complex chained prompts
const conversation = pipeline(({ p, map }) => [
  // First prompt
  p('Tell me a joke', {
    joke: String
  }),
  
  // Use result in next prompt
  map(async ({joke}) => {
    return p(`Rate this joke: ${joke}`, {
      rating: {
        score: Number,
        explanation: String
      }
    });
  }),
  
  // Combine results
  map(({joke, rating}) => ({
    joke,
    rating
  }))
]);
```

---

## Token Management

The `autoTruncateMessages` parameter controls how message history is managed when the total token count exceeds the model's context size or a specified limit.

```typescript
// Use model's maxContextSize
stream('Query', {
  autoTruncateMessages: true
});

// Specify exact token limit
stream('Query', {
  autoTruncateMessages: 4000  // Truncate at 4000 tokens
});
```

### Truncation Logic:

When `autoTruncateMessages` is enabled, the library ensures that the input messages fit within the allowed token limit by proportionally truncating historical messages while preserving critical context.

**Key Points:**

- **System Message Preservation:**
  - The system message (`system`) is always included and is not truncated.
- **Latest User Message Preservation:**
  - The latest user message is always included and is not truncated.
- **Historical Messages Handling:**
  - If the total tokens of historical messages exceed the available token budget (after accounting for the system message, latest user message, and expected response tokens), the following steps are taken:
    - **Proportional Truncation:**
      - Each historical message is truncated proportionally based on its original token count relative to the total historical tokens.
      - This approach aims to retain as much meaningful content from each message as possible.
    - **Minimum Token Retention:**
      - Each message retains at least one token to avoid empty messages.
    - **Truncation Indicator:**
      - Truncated messages include a separator (e.g., `'[...]'`) to indicate where content has been omitted.
- **Error Handling:**
  - If the combined tokens of the system message, latest user message, and expected response tokens exceed the token limit, an error is thrown.
    - This ensures that essential components are always present for the model to generate a meaningful response.

### Example of Truncation:

Suppose you have a conversation history that exceeds the token limit. Note that actual token counts will vary depending on the strategy used (default, minimal, structured, etc.) as each strategy adds different system prompts and message structures.

Example with default strategy:
- **System message:** ~500-800 tokens (varies by strategy)
- **Latest user message:** 100 tokens
- **Historical messages:** 3000 tokens (across several messages)
- **Desired response tokens:** 500 tokens
- **Token limit (`autoTruncateMessages`):** 4000 tokens

**Calculation:**

1. **Minimum required tokens:**
   - System message: ~500-800 tokens (strategy-dependent)
   - Latest user message: 100 tokens
   - Expected response: 500 tokens
   - **Total minimum required:** Variable, but approximately 1100-1400 tokens

2. **Available tokens for historical messages:**
   - Total token limit: 4000 tokens
   - Available for history: 4000 (limit) - minimum required
   - Example: 4000 - 1400 = **2600 tokens** with default strategy
   - Note: Available tokens will be higher with minimal strategy, lower with more verbose strategies

3. **Truncation Process:**
   - Total tokens in historical messages: 3000 tokens
   - Since 3000 > available tokens, truncation is needed
   - **Ratio calculation:**
     - Ratio = Available tokens / Total historical tokens
     - Example: 2600 / 3000 ≈ 0.87 with default strategy
   - **Proportional truncation:**
     - Each historical message is truncated proportionally based on this ratio

### Notes:

- **Flexibility:**
  - By adjusting the `autoTruncateMessages` value, you can control how much of the conversation history to retain.
- **Preservation of Context:**
  - The proportional truncation aims to preserve essential context across all historical messages rather than removing entire messages.
- **Customization:**
  - If you need custom truncation logic, you can preprocess your messages before passing them to the `stream` function.
- **Approximate Token Estimation:**
  - Token counts are estimated using heuristics. Actual tokenization by the model may vary slightly.

### Usage Considerations:

- **Setting `max_tokens`:**
  - Ensure that your `max_tokens` (for the response) is set appropriately relative to the `autoTruncateMessages` limit.
- **Understanding Token Limits:**
  - Be aware that if the system message, latest user message, and expected response tokens exceed the `autoTruncateMessages` limit, an error will be thrown.

### Example Code:

```javascript
const conversationHistory = [
  { role: 'user', content: 'Hello, how are you today?' },
  { role: 'assistant', content: 'I am good, thank you! How can I assist you?' },
  // ... more messages ...
];
// Example with automatic truncation to fit model's context size
const responseStream = stream('Tell me about our previous discussions.', {
  messages: conversationHistory,
  autoTruncateMessages: true,
  max_tokens: 500
});
// Example with custom token limit
const responseStream = stream('Provide a summary of our conversation.', {
  messages: conversationHistory,
  autoTruncateMessages: 3000,
  max_tokens: 500
});
```
