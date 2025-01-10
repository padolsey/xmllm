# Core Functions

xmllm provides four main functions for interacting with AI models:

## simple()

The simplest way to get structured data from an AI. Makes a single request and returns the result.

```javascript
import { simple, types } from 'xmllm';

// Basic usage
const result = await simple(
  "What is 2+2?",
  { answer: types.number() }
);
// { answer: 4 }

// With configuration
const analysis = await simple(
  "Analyze this sentence.",
  {
    sentiment: types.string("Positive or negative"),
    score: types.number("Score from 0-1"),
    keywords: types.items(types.string("Key word or phrase"))
  },
  {
    temperature: 0.7,
    model: 'anthropic:good',
    system: "You are a text analysis expert."
  }
);
```

### Options

```typescript
interface SimpleOptions {
  // Core parameters
  system?: string;                    // System prompt
  model?: ModelPreference;            // Model selection
  temperature?: number;               // 0-2, default 0.7
  maxTokens?: number;                 // Max response length
  
  // Behavior
  cache?: boolean;                    // Enable response caching
  strategy?: string;                  // Prompt strategy
  
  // Error handling
  retryMax?: number;                  // Max retry attempts
  retryStartDelay?: number;           // Initial retry delay (ms)
  retryBackoffMultiplier?: number;    // Backoff multiplier
  
  // Provider keys
  keys?: {
    openai?: string;
    anthropic?: string;
    togetherai?: string;
    perplexityai?: string;
    openrouter?: string;
  };
}
```

### Error Handling

```javascript
try {
  const result = await simple(
    "What is 2+2?",
    { answer: types.number() }
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

## stream()

Creates a chainable stream for processing AI responses in real-time. Supports partial results and complex transformations.

```javascript
import { stream, types } from 'xmllm';

// Basic streaming
const colors = stream('List some colors')
  .select('color')
  .text();

for await (const color of colors) {
  console.log(color); // Real-time updates
}

// With schema
const analysis = await stream(
  'Analyze this text',
  {
    schema: {
      sentiment: types.string(),
      keywords: types.items(types.string())
    },
    mode: 'root_closed'  // Only complete elements
  }
).last();
```

### Stream Modes

- `state_open`: Shows growing state including partials (default)
- `state_closed`: Shows complete state at each point
- `root_open`: Shows each root element's progress once
- `root_closed`: Shows each complete root element once

### Stream Options

```typescript
interface StreamOptions {
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
  
  // Provider keys
  keys?: {
    openai?: string;
    anthropic?: string;
    togetherai?: string;
    perplexityai?: string;
    openrouter?: string;
  };
}
```

## xmllm() / pipeline()

Creates a pipeline for complex operations like chaining multiple prompts or transformations.

```javascript
import xmllm, { types } from 'xmllm';

const analysis = xmllm(({ prompt, map }) => [
  // First prompt
  prompt('Tell me a joke', {
    joke: types.string()
  }),
  
  // Use result in next prompt
  map(async ({joke}) => {
    return prompt(`Rate this joke: ${joke}`, {
      rating: {
        score: types.number(),
        explanation: types.string()
      }
    });
  }),
  
  // Transform results
  map(({joke, rating}) => ({
    joke,
    rating,
    isGood: rating.score > 7
  }))
]);

const result = await analysis.last();
```

See [Pipeline API](./pipeline.md) for detailed documentation of pipeline helpers and patterns.

## configure()

Configures global settings for logging and default parameters.

```javascript
import { configure } from 'xmllm';

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

### Configuration Options

```typescript
interface ConfigureOptions {
  // Logging
  logging?: {
    level?: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'TRACE';
    custom?: (level: string, ...args: any[]) => void;
  };
  
  // Default parameters
  defaults?: {
    temperature?: number;              // Default temperature
    maxTokens?: number;               // Default max tokens
    presencePenalty?: number;         // Default presence penalty
    topP?: number;                    // Default top_p value
    mode?: StreamMode;                // Default stream mode
    model?: ModelPreference;          // Default model
    errorMessages?: ErrorMessages;    // Default error messages
  };
  
  // Client configuration
  clientProvider?: string | ClientProvider;  // For browser usage
  
  // Provider keys
  keys?: {
    openai?: string;
    anthropic?: string;
    togetherai?: string;
    perplexityai?: string;
    openrouter?: string;
  };
}
``` 