# API Documentation

## Core Functions

### `xmllm(pipelineFn: (helpers: PipelineHelpers) => Operation[], options?: XmlLmOptions)`

Creates a pipeline for processing XML streams.

**Arguments:**
- `pipelineFn`: Function that returns array of pipeline operations
- `options`: 
  ```typescript
  {
    timeout?: number;                                    // Request timeout in ms
    llmStream?: LLMStreamFunction;                      // Custom stream provider
    generateSystemPrompt?: (system: string) => string;  // Custom system prompt generator
    generateUserPrompt?: (scaffold: string, prompt: string) => string;  // Custom user prompt
    apiKeys?: Record<string, string>;                   // Provider API keys
  }
  ```

**Returns:** AsyncGenerator with additional methods:
- `all()`: Promise<T[]> - Collect all results
- `first(n?: number)`: Promise<T | T[]> - Get first n results
- `last(n?: number)`: Promise<T | T[]> - Get last n results

### `simple(prompt: string, schema: SchemaType, options?: SimpleOptions)`

Single-shot function for getting structured data from AI.

**Arguments:**
- `prompt`: String prompt to send to AI
- `schema`: Schema definition for transforming response
- `options`:
  ```typescript
  {
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

**Returns:** Promise<SchemaResult>

### `stream(promptOrConfig: string | StreamConfig, options?: StreamOptions)`

Creates a chainable stream for processing AI responses.

**Arguments:**
- `promptOrConfig`: String prompt or configuration object
- `options`:
  ```typescript
  {
    schema?: SchemaType;                // Transform schema
    system?: string;                    // System prompt
    model?: ModelPreference;            // Model selection
    temperature?: number;               // 0-2, default 0.7
    maxTokens?: number;                 // Max tokens
    cache?: boolean;                    // Enable caching
    apiKeys?: Record<string, string>;   // API keys
    hints?: SchemaHints;                // Schema hints
    waitMessageString?: string;         // Progress message
    waitMessageDelay?: number;          // Delay before progress
  }
  ```

**Returns:** XMLStream instance with chainable methods

## XMLStream Methods

### Chainable Methods

- `select(selector: string)`: Select elements using CSS selectors
- `map(fn: (value: T) => U)`: Transform values
- `filter(fn: (value: T) => boolean)`: Filter values
- `text()`: Extract text content from elements
- `closedOnly()`: Filter for only completed XML elements
- `take(n: number)`: Take first n results from stream
- `skip(n: number)`: Skip first n results
- `reduce(reducer: (acc: U, value: T) => U, initial: U)`: Reduce values
- `merge()`: Deep merge all results into single object
- `debug(label?: string)`: Log debug information
- `raw()`: Get raw response chunks
- `first()`: Get first result
- `last(n?: number)`: Get last n results
- `all()`: Get all results as array

### Return Types

```typescript
type XMLStreamResult<T> = AsyncGenerator<T> & {
  first(): Promise<T>;
  last(n?: number): Promise<T | T[]>;
  all(): Promise<T[]>;
  select(selector: string): XMLStream;
  map(fn: (value: T) => U): XMLStream;
  filter(fn: (value: T) => boolean): XMLStream;
  text(): XMLStream;
  closedOnly(): XMLStream;
  merge(): XMLStream;
  raw(): XMLStream;
  debug(label?: string): XMLStream;
}
```

## Schema Hints

Hints guide the AI's output format:

```typescript
type SchemaHints = {
  [K in keyof SchemaType]: string | SchemaHints;
}

const schema = {
  user: {
    name: String,
    age: Number
  }
};

const hints = {
  user: {
    name: "User's full name",
    age: "Age in years (must be > 0)"
  }
};
```

## Proxy Server

Simple proxy server for browser usage:

```bash
npm run proxy -- [options]

Options:
  --port=3124        # Server port
  --debug           # Enable debug logging
  --verbose         # Verbose logging
  --corsOrigins=*   # CORS origins
```

## Cache Usage

```typescript
// Simple boolean flag to enable/disable caching
const result = await stream('Query', {
  cache: true
});
```

## Model Configuration

```typescript
type ModelConfig = {
  inherit: string;    // Base provider (e.g. 'claude')
  name: string;       // Model name
  endpoint?: string;  // Custom endpoint
}

// Example usage:
const result = await stream('Query', {
  model: {
    inherit: 'claude',
    name: 'custom-model',
    endpoint: 'https://custom-endpoint.com'
  }
});
```

## Streaming Patterns

### Real-time Updates

```typescript
const stream = stream('List colors')
  .select('color')
  .map(({$text, $tagclosed}) => ({
    text: $text,
    complete: $tagclosed
  }));

for await (const update of stream) {
  console.log(update);
  // { text: "re", complete: false }
  // { text: "red", complete: true }
}
```

### Schema-based Collection

```typescript
const result = await stream('Analyze', {
  schema: {
    analysis: {
      score: Number,
      tags: {
        tag: [String]
      }
    }
  }
})
.closedOnly()  // Wait for complete elements
.merge()       // Merge results
.last();       // Get final state
```

## Pipeline Helper Functions

### `req(config: RequestConfig | string)`

Low-level request function for direct provider interaction.

**Arguments:**
```typescript
type RequestConfig = {
  messages?: Message[];                // Message array
  system?: string;                    // System prompt
  model?: ModelPreference;            // Model selection
  temperature?: number;               // Temperature
  max_tokens?: number;                // Max tokens
  top_p?: number;                     // Top P sampling
  presence_penalty?: number;          // Presence penalty
  stop?: string[];                    // Stop sequences
  cache?: boolean;                    // Enable caching
  accrued?: string;                   // Previous content
  fakeDelay?: number;                 // Test delay
  onChunk?: (chunk: string) => void;  // Chunk callback
}
```

**Returns:** AsyncGenerator<string>

### `prompt(prompt: string | PromptConfig, schema?: SchemaType, mapper?: MapperFunction)`

Basic prompt with optional schema transformation.

**Arguments:**
- `prompt`: String or prompt configuration
- `schema`: Optional schema for transformation
- `mapper`: Optional mapping function for results

### `promptClosed(prompt: string | PromptConfig, schema?: SchemaType, options?: PromptOptions)`

Like prompt() but only yields complete XML elements.

**Arguments:**
```typescript
type PromptOptions = {
  mapper?: MapperFunction;             // Transform results
  system?: string;                     // System prompt
  model?: ModelPreference;             // Model selection
  temperature?: number;                // Temperature
  maxTokens?: number;                  // Max tokens
  cache?: boolean;                     // Enable caching
  retryMax?: number;                   // Max retries
  retryStartDelay?: number;            // Initial retry delay
  retryBackoffMultiplier?: number;     // Backoff multiplier
}
```

**Returns:** AsyncGenerator<T>

### `promptComplex(config: ComplexPromptConfig)`

Advanced prompt configuration with full control.

**Arguments:**
```typescript
{
  messages: Message[];                  // Message array
  schema?: SchemaType;                 // Transform schema
  hints?: SchemaHints;                 // Schema hints
  mapper?: MapperFunction;             // Result mapper
  system?: string;                     // System prompt
  maxTokens?: number;                  // Max tokens
  temperature?: number;                // Temperature
  model?: ModelPreference;             // Model selection
  cache?: boolean;                     // Enable caching
  retryMax?: number;                   // Max retries
  retryStartDelay?: number;            // Initial retry delay
  retryBackoffMultiplier?: number;     // Backoff multiplier
  onChunk?: (chunk: string) => void;   // Chunk callback
  doMapSelectClosed?: boolean;         // Only return closed elements
  generateSystemPrompt?: (system: string) => string;  // Custom system prompt
  generateUserPrompt?: (scaffold: string, prompt: string) => string;  // Custom user prompt
}
```

**Returns:** AsyncGenerator<T>

### `promptStream(prompt: string | PromptConfig, schema?: SchemaType, mapper?: MapperFunction)`

Basic prompt with streaming results.

**Arguments:**
- `prompt`: String or prompt configuration
- `schema`: Optional schema for transformation
- `mapper`: Optional mapping function

**Returns:** AsyncGenerator<T>

### `select(selector: string, mapperFn?: (element: XMLElement) => any)`

Select elements using CSS selectors.

**Arguments:**
- `selector`: CSS selector string
- `mapperFn`: Optional transform function

**Returns:** AsyncGenerator<T>

### `mapSelect(schema: SchemaType)`

Select and transform elements using schema.

**Arguments:**
- `schema`: Schema definition
- `includeOpenTags`: Include incomplete elements
- `doDedupeChildren`: Deduplicate child elements

**Returns:** AsyncGenerator<T>

### `mapSelectClosed(schema: SchemaType)`

Like mapSelect() but only returns complete elements.

**Arguments:**
- `schema`: Schema definition

**Returns:** AsyncGenerator<T>

### Stream Operations

- `map(fn: (value: T) => U)`: Transform values
- `filter(fn: (value: T) => boolean)`: Filter values
- `reduce(fn: (acc: U, value: T) => U, initial: U)`: Reduce values
- `accrue()`: Collect values into array
- `tap(fn: (value: T) => void)`: Side effects
- `waitUntil(fn: (value: T) => boolean)`: Wait for condition
- `mergeAggregate()`: Merge accumulated values
- `take(n: number)`: Take n values
- `batch(size: number)`: Batch values
- `skip(n: number)`: Skip n values

### Helper Functions

- `text(fn?: (text: string) => string)`: Extract/transform text content
- `withAttrs(fn: (text: string, attrs: Record<string, string>) => any)`: Combine text and attributes
- `whenClosed(fn: (element: XMLElement) => any)`: Only transform complete elements

## Client Usage

### `ClientProvider`

Browser-compatible provider that routes requests through a proxy.

```typescript
const client = new ClientProvider(proxyEndpoint: string);

const result = await stream('Query', {
  schema: { answer: String },
  clientProvider: client
});
```

## Error Types & Handling

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

// Connection Errors
class ConnectionError extends Error {
  name: string;
  code: string;
}

class ConnectionTimeoutError extends ConnectionError {}

// Validation Errors
class ModelValidationError extends Error {}
class ValidationError extends Error {}

// Example error handling:
try {
  await stream.first();
} catch (error) {
  if (error.message.includes('Failed to connect')) {
    // Handle network error
  }
  if (error.message.includes('LLM request timed out')) {
    // Handle timeout
  }
}
```

## Types

```typescript
type XMLElement = {
  $text: string;                        // Element text content
  $attr: Record<string, string>;        // Element attributes
  $tagclosed: boolean;                  // Is element complete
  $tagkey: number;                      // Unique identifier
  $tagname: string;                     // Tag name
  $children: XMLElement[];              // Child elements
}

type SchemaType = {
  [key: string]: 
    | StringConstructor                 // Convert to string
    | NumberConstructor                 // Convert to number
    | BooleanConstructor               // Convert to boolean
    | ((el: XMLElement) => any)        // Custom transformer
    | SchemaType                       // Nested schema
    | [SchemaType];                    // Array of schema
}

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

type ModelPreference = 
  | string                             // e.g. 'claude:fast'
  | string[]                           // Fallback chain
  | {
      inherit: string;                 // Base provider
      name: string;                    // Model name
      maxContextSize?: number;         // Context window
      endpoint?: string;               // Custom endpoint
      key?: string;                    // API key
    }
```

## Provider Configuration

### Model Configuration
```typescript
type ModelConfig = {
  inherit: string;                    // Base provider (e.g. 'claude')
  name: string;                       // Model name
  endpoint?: string;                  // Custom endpoint
  maxContextSize?: number;           // Max context window
  headerGen?: () => Headers;         // Custom headers
  payloader?: (payload: any) => any; // Custom payload transformer
  constraints?: {
    rpmLimit?: number;              // Requests per minute
  }
}
```

### Provider Options
```typescript
type ProviderOptions = {
  apiKeys: Record<string, string>;   // Provider API keys
  model?: ModelConfig | string;      // Model selection
  temperature?: number;              // 0-2, default 0.7
  maxTokens?: number;               // Max response length
  cache?: boolean;                  // Enable caching
  retryMax?: number;                // Max retries
  retryStartDelay?: number;         // Initial retry delay
  retryBackoffMultiplier?: number;  // Backoff multiplier
}
```

## Cache Configuration

```typescript
interface CacheOptions {
  enabled: boolean;           // Enable caching
  maxSize?: number;          // Max cache size (bytes)
  maxEntries?: number;       // Max number of entries
  ttl?: number;              // Time to live (ms)
}
```

### Helper Functions

#### `text(fn?: (text: string) => string)`
Transform element text content.

```typescript
// Example
.map(text(s => s.toUpperCase()))
```

#### `withAttrs(fn: (text: string, attrs: Record<string, string>) => any)`
Access both text content and attributes.

```typescript
// Example
.map(withAttrs((text, attrs) => ({
  content: text,
  type: attrs.type
})))
```

#### `whenClosed(fn: (element: XMLElement) => any)`
Only transform complete elements.

```typescript
// Example
.map(whenClosed(el => `Complete: ${el.$text}`))
```

## Stream Configuration

```typescript
type StreamConfig = {
  prompt: string;                      // Prompt text
  schema?: SchemaType;                 // Transform schema
  system?: string;                     // System prompt
  model?: ModelPreference;             // Model selection
  temperature?: number;                // Temperature (0-2)
  maxTokens?: number;                  // Max tokens
  topP?: number;                       // Top P sampling
  presencePenalty?: number;           // Presence penalty
  stop?: string[];                    // Stop sequences
  cache?: boolean;                    // Enable caching
  closed?: boolean;                   // Only return closed elements
  waitMessageString?: string;         // Progress message
  waitMessageDelay?: number;          // Delay before progress
  retryMax?: number;                  // Max retries
  retryStartDelay?: number;           // Initial retry delay
  retryBackoffMultiplier?: number;    // Retry backoff multiplier
  fakeDelay?: number;                 // Test-only: artificial delay
  clientProvider?: ClientProvider;    // Browser client provider
}
```

## Browser Usage

### Client Setup

```typescript
import { ClientProvider, stream } from 'xmllm/client';

const client = new ClientProvider('http://localhost:3124/api/stream');

const result = await stream('Query', {
  schema: { answer: String },
  clientProvider: client
});
```

### Proxy Configuration

The proxy server supports additional options:

```bash
npm run proxy -- [options]

Options:
  --port=3124        # Server port
  --corsOrigins=*    # CORS origins
  --debug           # Enable debug logging
  --verbose         # Verbose logging
  --maxRequestSize  # Max request size
  --timeout        # Request timeout
```

## Model Configuration & Provider Fallback

```typescript
type ModelPreference = 
  | string        // Single provider e.g. 'claude:fast'
  | string[]      // Fallback chain e.g. ['claude:good', 'openai:good']
  | {
      inherit: string;   // Base provider (e.g. 'claude', 'openai')
      name: string;      // Model name
      endpoint?: string; // Custom endpoint
      key?: string;      // API key
    }

// Example using fallback chain:
const result = await stream('Query', {
  model: ['claude:good', 'openai:good', 'claude:fast']  // Will try each in order
});
``` 