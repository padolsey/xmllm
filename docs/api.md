# API Documentation

> Note: xmllm includes TypeScript definitions out of the box. See [index.d.ts](../index.d.ts) and [client.d.ts](../client.d.ts) for type details.

## Core Functions

### xmllm()

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
  timeout?: number;                                    // Request timeout in ms
  llmStream?: LLMStreamFunction;                      // Custom stream provider
  generateSystemPrompt?: (system: string) => string;  // Custom prompt generator
  generateUserPrompt?: (scaffold: string, prompt: string) => string;
  apiKeys?: {                                         // Provider API keys
    ANTHROPIC_API_KEY?: string;
    OPENAI_API_KEY?: string;
    TOGETHERAI_API_KEY?: string;
    PERPLEXITYAI_API_KEY?: string;
  };
}
```

Example:

```typescript
const analysis = xmllm(({ promptClosed, map }) => [
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
  schema: SchemaType,
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
  apiKeys?: Record<string, string>;   // Provider API keys
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
    modelFallbacks?: ModelPreference[]; // Fallback models
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
    model: 'claude:good',
    modelFallbacks: ['openai:fast', 'claude:fast'],
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
  prompt?: string;                   // Prompt text
  messages?: Message[];              // Alternative to prompt
  schema?: SchemaType;               // Transform schema
  system?: string;                   // System prompt
  sudoPrompt?: boolean;              // Use sudoPrompt (more forceful) conversation flow
  mode?: 'state_open' | 'state_closed' | 'root_open' | 'root_closed';
  model?: ModelPreference;           // Model selection (see Model Configuration below)
  temperature?: number;              // Temperature (0-2)
  maxTokens?: number;                // Max tokens
  cache?: boolean;                   // Enable caching
  clientProvider?: ClientProvider;   // Required for browser usage
  errorMessages?: {
    genericFailure?: string;      // Default error message
    rateLimitExceeded?: string;   // Rate limit error message
    invalidRequest?: string;      // Invalid request error message
    authenticationFailed?: string; // Auth failure message
    resourceNotFound?: string;    // 404 error message
    serviceUnavailable?: string;  // Service unavailable message
    networkError?: string;        // Network error message
    unexpectedError?: string;     // Unexpected error message
  };
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
  .map(({$text, $tagclosed}) => ({
    text: $text,
    complete: $tagclosed
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

## Pipeline API

The pipeline API provides helper functions for building complex streaming operations. These are available in the `helpers` argument to xmllm().

### Core Prompt Functions

```typescript
interface PipelineHelpers {
  // Main prompt functions
  prompt(
    prompt: string | PromptConfig,
    schema?: SchemaType,
    options?: PromptOptions
  ): PipelineFunction                // Stream all updates including partial elements
  
  promptClosed(
    prompt: string | PromptConfig,
    schema?: SchemaType,
    options?: PromptOptions
  ): PipelineFunction                // Only yield complete elements
  
  // Shorthand aliases
  p: typeof promptClosed             // Alias for promptClosed
  ps: typeof prompt                  // Alias for prompt
  r: typeof req                      // Alias for req
}

interface PromptOptions {
  system?: string;                   // System prompt
  model?: ModelPreference;           // Model selection
  temperature?: number;              // 0-2, default 0.7
  maxTokens?: number;                // Max tokens
  cache?: boolean;                   // Enable caching
  mapper?: (input: any, output: any) => any;  // Transform results
}
```

### Selection Helpers

```typescript
interface PipelineHelpers {
  // CSS selector based
  select(selector: string): PipelineFunction
  
  // Schema based selection
  mapSelect(
    schema: SchemaType,
    includeOpenTags?: boolean,      // Include incomplete elements
    doDedupe?: boolean             // Deduplicate elements
  ): PipelineFunction
  
  mapSelectClosed(
    schema: SchemaType             // Only complete elements
  ): PipelineFunction
}
```

### Stream Operations

```typescript
interface PipelineHelpers {
  // Transformation
  map<T, U>(fn: (value: T) => U): PipelineFunction
  filter(fn: (value: T) => boolean): PipelineFunction
  reduce<T, U>(fn: (acc: U, value: T) => U, initial: U): PipelineFunction
  
  // Collection
  accrue(): PipelineFunction                          // Collect into array
  mergeAggregate(): PipelineFunction                  // Merge results
  batch(size: number): PipelineFunction               // Group into batches
  
  // Control
  take(n: number): PipelineFunction                   // Take n items
  skip(n: number): PipelineFunction                   // Skip n items
  tap(fn: (value: T) => void): PipelineFunction       // Side effects
  waitUntil(fn: (value: T) => boolean): PipelineFunction
}
```

### Transformer Helpers

Special helpers for transforming XML elements:

```typescript
// Transform text content
const text = (fn?: (text: string) => any) => 
  ({ $text }: XMLElement) => fn ? fn($text) : $text;

// Combine text and attributes  
const withAttrs = (fn: (text: string, attrs: Record<string, string>) => any) => 
  ({ $text, $attr }: XMLElement) => fn($text, $attr);

// Only transform complete elements
const whenClosed = (fn: (el: XMLElement) => any) => 
  (el: XMLElement) => el.$tagclosed ? fn(el) : undefined;
```

Examples:

```typescript
const stream = xmllm(({ prompt, text, withAttrs, whenClosed }) => [
  prompt('Get product info', {
    product: {
      // Transform text only
      name: text(s => s.toUpperCase()),
      
      // Combine text and attributes
      price: withAttrs((text, attrs) => ({
        amount: Number(text),
        currency: attrs.currency
      })),
      
      // Only process when element is complete
      status: whenClosed(el => 
        el.$tagclosed ? `Final: ${el.$text}` : undefined
      )
    }
  })
]);
```

### Additional Stream Operations

```typescript
// Collect all results into an array
accrue(): PipelineFunction

// Example:
xmllm(({ accrue }) => [
  function*() {
    yield 'apple';
    yield 'banana';
  },
  accrue(),
  function*(everything) {
    yield everything.join(' ');  // "apple banana"
  }
]);

// Merge results into single array
mergeAggregate(): PipelineFunction

// Manually add XML content
parse(str?: string): PipelineFunction

// Example:
xmllm(({ parse, select }) => [
  parse('<root><item>test</item></root>'),
  select('item')  // Select from parsed content
]);
```

### Examples

```typescript
// Basic transformation pipeline
const sentiment = xmllm(({ prompt, select, map }) => [
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
const conversation = xmllm(({ p, map }) => [
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

## Common Types

### Schema Types

The schema system defines how XML elements are transformed into structured data.

```typescript
type SchemaType = {
  [key: string]: 
    | StringConstructor                 // Convert to string
    | NumberConstructor                 // Convert to number
    | BooleanConstructor               // Convert to boolean
    | ((el: XMLElement) => any)        // Custom transformer
    | SchemaType                       // Nested schema
    | [SchemaType]                     // Array of schema
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
  date: (el: XMLElement) => new Date(el.$text),
  color: (el: XMLElement) => ({
    name: el.$text,
    rgb: el.$attr.rgb?.split(',').map(Number)
  })
};
```

### XMLElement

The parsed XML element structure available in transformers and selectors.

```typescript
interface XMLElement {
  $text: string;                        // Element text content
  $attr: Record<string, string>;        // Element attributes
  $tagclosed: boolean;                  // Is element complete
  $tagname: string;                     // Tag name
  $children: XMLElement[];              // Child elements
  $tagkey: number;                      // Internal unique ID
}

// Example usage in transformer:
const schema = {
  product: (el: XMLElement) => ({
    name: el.$text,
    inStock: el.$attr.stock === 'true',
    variants: el.$children
      .filter(child => child.$tagname === 'variant')
      .map(v => v.$text)
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
  | `${ModelProvider}:${ModelSpeed}`   // e.g. 'claude:fast'
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
const simple = 'claude:fast';
const detailed = {
  inherit: 'claude',
  name: 'claude-3-opus-20240229',
  maxContextSize: 100000
};
const withFallback = [
  'claude:fast',
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
class ModelValidationError extends Error {}
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