# Stream API Reference

> For practical examples and common patterns, see the [Streaming Guide](../streaming-guide.md)

## stream()

Creates a chainable stream for processing AI responses.

```typescript
function stream<T>(
  promptOrConfig: string | StreamConfig,
  options?: StreamOptions
): ChainableStreamInterface<T>
```

### Options

```typescript
interface StreamConfig {
  // Core parameters
  schema?: Schema;                    // Transform schema
  mode?: StreamMode;                  // Stream mode
  model?: ModelPreference;            // Model selection
  temperature?: number;               // 0-2, default 0.7
  
  // Messaging
  system?: string;                    // System prompt
  messages?: Message[];               // Chat history
  
  // Behavior
  cache?: boolean;                    // Enable caching
  strategy?: string;                  // Prompt strategy
  onChunk?: (chunk: string) => void;  // Chunk callback
  
  // Error handling
  errorMessages?: ErrorMessages;      // Custom error messages
  retryMax?: number;                  // Max retry attempts
}

type StreamMode = 'state_open' | 'state_closed' | 'root_open' | 'root_closed';
```

## Chainable Methods

### Selection & Transformation

```typescript
// Select elements by CSS selector
select(selector: string): ChainableStreamInterface<XMLElement>

// Transform values
map<U>(fn: (value: T) => U): ChainableStreamInterface<U>

// Filter values
filter(fn: (value: T) => boolean): ChainableStreamInterface<T>

// Extract text content
text(): ChainableStreamInterface<string>

// Deep merge results
merge(): ChainableStreamInterface<T>

// Merge into array
mergeAggregate(): ChainableStreamInterface<T[]>

// Transform with reducer
reduce<U>(
  fn: (acc: U, value: T) => U, 
  initial: U
): ChainableStreamInterface<U>
```

### Stream Control

```typescript
// Only complete elements
closedOnly(): ChainableStreamInterface<T>

// First n elements
take(n: number): ChainableStreamInterface<T>

// Skip n elements
skip(n: number): ChainableStreamInterface<T>

// Group into batches
batch(
  size: number, 
  options?: { yieldIncomplete?: boolean }
): ChainableStreamInterface<T[]>

// Raw response chunks
raw(): ChainableStreamInterface<string>

// Debug logging
debug(label?: string): ChainableStreamInterface<T>
```

### Terminal Operations

```typescript
// Get first result
first(): Promise<T>

// Get last n results
last(n?: number): Promise<T>

// Get all results
all(): Promise<T[]>
collect(): Promise<T[]> // Alias for all()

// Get value (deprecated - use first() or last())
value(): Promise<T>
```

## XMLElement Interface

```typescript
interface XMLElement {
  $$text: string;                    // Element text content
  $$attr: Record<string, string>;    // Element attributes
  $$tagclosed: boolean;              // Is element complete
  $$tagname: string;                 // Tag name
  $$children: XMLElement[];          // Child elements
  $$tagkey: number;                  // Internal unique ID
  [key: string]: any;                // Dynamic properties
}
```

## Stream Modes

```typescript
type StreamMode = 
  | 'state_open'    // Shows growing state including partials (default)
  | 'state_closed'  // Shows complete state at each point
  | 'root_open'     // Shows each root element's progress once
  | 'root_closed';  // Shows each complete root element once
```

## Error Handling

```typescript
try {
  const result = await stream('Query')
    .select('answer')
    .first();
} catch (error) {
  if (error instanceof ProviderError) {
    // Handle provider errors
  } else if (error instanceof ValidationError) {
    // Handle validation errors
  }
}
``` 