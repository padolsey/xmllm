# Configuration

xmllm provides extensive configuration options at both global and per-request levels.

## Global Configuration

Use `configure()` to set global defaults and behaviors:

```javascript
import { configure } from 'xmllm';

configure({
  // Logging configuration
  logging: {
    level: 'DEBUG',
    custom: (level, ...args) => console.log(`[${level}]`, ...args)
  },

  // Default parameters
  defaults: {
    temperature: 0.7,
    maxTokens: 4000,
    model: ['anthropic:good', 'openai:fast'],
    mode: 'root_closed',
    strategy: 'default',
    presencePenalty: 0,
    topP: 1,
    errorMessages: {
      rateLimitExceeded: "Rate limit exceeded. Please try again later."
    }
  },

  // Provider API keys
  keys: {
    openai: "sk-...",
    anthropic: "sk-ant-...",
    togetherai: "...",
    perplexityai: "...",
    openrouter: "..."
  }
});
```

## Model Configuration

### Model Selection

Models can be specified in several ways:

```javascript
// Simple provider:speed format
const model1 = 'anthropic:good';    // High quality
const model2 = 'openai:fast';       // Fast response
const model3 = 'claude:superfast';  // Fastest response

// Specific model configuration
const model4 = {
  inherit: 'anthropic',
  name: 'claude-3-opus-20240229',
  maxContextSize: 100000
};

// Fallback chain
const model5 = [
  'anthropic:good',
  'openai:fast',
  { inherit: 'togetherai', name: 'mixtral-8x7b' }
];
```

### Provider Settings

Each provider can have specific settings:

```javascript
configure({
  providers: {
    anthropic: {
      maxContextSize: 100000,
      endpoint: 'https://api.anthropic.com/v1',
      constraints: {
        rpmLimit: 50
      }
    },
    openai: {
      maxContextSize: 16000,
      constraints: {
        rpmLimit: 100
      }
    }
  }
});
```

## Token Management

### Auto-Truncation

Control how message history is managed when approaching token limits:

```javascript
// Use model's maxContextSize
stream('Query', {
  autoTruncateMessages: true
});

// Specify exact token limit
stream('Query', {
  autoTruncateMessages: 4000  // Truncate at 4000 tokens
});
```

### Truncation Behavior

When `autoTruncateMessages` is enabled:

1. **Priority Order:**
   - System message is always preserved
   - Latest user message is always preserved
   - Historical messages are truncated proportionally

2. **Token Budget Calculation:**
   ```javascript
   const availableTokens = 
     totalLimit -                    // Total token limit
     systemMessageTokens -           // System message size
     latestUserMessageTokens -       // Latest message size
     expectedResponseTokens;         // Expected response size
   ```

3. **Proportional Truncation:**
   - Each historical message is truncated based on its relative size
   - Messages retain at least one token
   - Truncated content is indicated with '[...]'

### Token Estimation

Token counts are estimated using heuristics:

```javascript
stream('Query', {
  maxTokens: 500,                    // Response token limit
  autoTruncateMessages: 4000,        // Total context limit
  messages: conversationHistory,      // Message history
  system: "You are a helpful AI."    // System message
});
```

## Retry Configuration

Configure automatic retry behavior for transient errors:

```javascript
configure({
  defaults: {
    // Retry settings
    retryMax: 3,                    // Maximum retry attempts
    retryStartDelay: 1000,          // Initial retry delay (ms)
    retryBackoffMultiplier: 2,      // Exponential backoff multiplier
    
    // Retry triggers
    retryOn: {
      rateLimitExceeded: true,      // Retry on rate limits
      networkError: true,           // Retry on network errors
      serviceUnavailable: true      // Retry on 503 errors
    }
  }
});
```

## Client Configuration

Additional options for browser/client usage:

```javascript
import { configure } from 'xmllm/client';

configure({
  // Required for browser usage
  clientProvider: 'http://localhost:3000/api/stream',
  
  // Optional custom fetch configuration
  fetchOptions: {
    credentials: 'include',
    headers: {
      'Custom-Header': 'value'
    }
  },
  
  // Client-specific defaults
  defaults: {
    mode: 'state_open',
    errorMessages: {
      networkError: "Connection failed. Check your internet."
    }
  }
});
```

## Parser Configuration

Configure the XML/Idio parser behavior:

```javascript
configure({
  // Use Idio parser instead of XML
  globalParser: 'idio',
  
  // Custom Idio syntax
  idioSymbols: {
    openTagPrefix: '@',
    closeTagPrefix: '@',
    tagOpener: 'START(',
    tagCloser: 'END(',
    tagSuffix: ')'
  }
});
```

## Logging Configuration

Configure logging behavior:

```javascript
configure({
  logging: {
    // Log level
    level: 'DEBUG',  // ERROR | WARN | INFO | DEBUG | TRACE
    
    // Custom logger
    custom: (level, ...args) => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [${level}]`, ...args);
    }
  }
});
```

## Strategy Configuration

Select and configure prompt strategies:

```javascript
stream('Query', {
  // Use specific strategy
  strategy: 'structured',  // default | minimal | structured | assertive
  
  // Custom prompt generation
  genSystemPrompt: (system) => 
    `Custom system: ${system || ''}`,
  
  genUserPrompt: (scaffold, prompt) => 
    `Custom user: ${prompt}`
});
``` 