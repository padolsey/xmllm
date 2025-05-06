# Provider Configuration & Management

xmllm supports multiple AI providers and offers flexible configuration options for production deployments.

## Quick Setup

You can configure API keys of any models you intend to use either at runtime or via environment variables.

```javascript
import { stream } from 'xmllm';

// OPTION 1. Environment Variables (recommended)
// .env
ANTHROPIC_API_KEY=your_claude_key
OPENAI_API_KEY=your_openai_key
TOGETHERAI_API_KEY=your_together_key
PERPLEXITYAI_API_KEY=your_perplexity_key

// 2. Runtime Configuration
const result = await stream('What is 2+2?', {
  keys: {
    anthropic: 'AAA',
    openai: 'BBB',
    togetherai: 'CCC',
    perplexityai: 'DDD',
    openrouter: 'EEE'
  },
  model: 'anthropic:fast' // an alias to Anthropic Claude Haiku
})
.complete()
.value();
```

## Supported Providers & Models

You can specify models in three formats:

1. Using predefined aliases:
   ```javascript
   stream('Query', {
     model: 'anthropic:fast'  // Uses claude-3-haiku
   })
   ```

2. Using specific model names:
   ```javascript
   stream('Query', {
     model: 'openrouter:mistralai/mistral-7b'  // Uses exact model name
   })
   ```

3. Using a custom model configuration object (see "Custom Model Configuration" section below):
   ```javascript
   stream('Query', {
     model: {
       inherit: 'anthropic',  // Inherit base provider settings
       name: 'claude-3-opus-20240229',
       endpoint: 'https://custom-claude-endpoint.com/v1',
       key: process.env.CUSTOM_CLAUDE_KEY,
       constraints: {
         rpmLimit: 50,
         maxContextSize: 150_000
       }
     }
   })
   ```

The format is either:
- `provider:model` string where:
  - `provider` is one of: claude, openai, togetherai, perplexityai, openrouter
  - `model` can be either:
    - A predefined alias: `superfast`, `fast`, or `good`
    - The actual model name used by the provider (e.g. `mistralai/mistral-7b`, `claude-3-haiku-20240307`)
- Or a custom model configuration object (see [Custom Model Configuration](#custom-model-configuration) section below for details)

Current predefined model mappings (as of 2024):

| Provider | Alias | Actual Model | Context Size | Notes | API Key Env Variable |
|----------|-------|--------------|--------------|-------|---------------------|
| Claude (Anthropic) | `anthropic:superfast`<br>`anthropic:fast`<br>`anthropic:good` | claude-3-haiku<br>claude-3-haiku<br>claude-3-5-sonnet | 200k tokens | Best for structured responses | `ANTHROPIC_API_KEY` |
| OpenAI | `openai:superfast`<br>`openai:fast`<br>`openai:good` | gpt-4o-mini<br>gpt-4o-mini<br>gpt-4o | 128k tokens | Good all-around performance | `OPENAI_API_KEY` |
| Together.ai | `togetherai:fast`<br>`togetherai:good`<br>`togetherai:best` | meta-llama/Llama-3-8b-instruct<br>meta-llama/Llama-3-70b-instruct<br>meta-llama/Meta-Llama-3.1-70B-Instruct | 8k tokens | Access to open models | `TOGETHER_API_KEY` |
| Perplexity | `perplexityai:superfast`<br>`perplexityai:fast`<br>`perplexityai:good` | sonar-small<br>sonar-small<br>sonar-large | 128k tokens | Newer provider with web search | `PERPLEXITYAI_API_KEY` |
| Mistral AI | `mistralai:superfast`<br>`mistralai:fast`<br>`mistralai:good`<br>`mistralai:best` | mistral-tiny<br>mistral-small<br>mistral-medium<br>mistral-large-latest | 32k tokens | Strong open-source models | `MISTRAL_API_KEY` |
| DeepSeek | `deepseek:fast`<br>`deepseek:best` | deepseek-chat<br>deepseek-reasoner | 64k tokens | Specialized for reasoning tasks | `DEEPSEEK_API_KEY` |
| AI21 | `ai21:fast` | j2-grande-chat | 8k tokens | Jurassic models | `AI21_API_KEY` |
| OpenRouter | `openrouter:fast`<br>`openrouter:good` | (varies)<br>(varies) | Varies | Gateway to multiple models | `OPENROUTER_API_KEY` |
| xAI (Grok) | `x:fast`<br>`x:good` | grok-beta | 131k tokens | Conversational model with web access | `X_API_KEY` |

### Examples

```javascript
// Using predefined aliases
stream('Query', {
  model: 'anthropic:fast'  // Uses claude-3-haiku
})

// Using specific model names
stream('Query', {
  model: 'openrouter:mistralai/mistral-7b'  // Uses exact model name
})

// Using fallbacks with mix of aliases and specific models
stream('Query', {
  model: [
    'anthropic:fast',                          // Try Claude's fast alias first
    'openrouter:mistralai/mistral-7b',     // Then specific Mistral model
    'togetherai:Qwen/Qwen2.5-7B-Instruct'  // Finally specific Qwen model
  ]
})
```

## Model Parameters

```javascript
stream('What is 2+2?', {
  model: 'anthropic:fast',
  temperature: 0.52,     // 0.5-0.8 recommended for balanced output
  top_p: 1,              // Default sampling parameter
  presence_penalty: 0,    // Default repetition control
  max_tokens: 300        // Default response length
})
```

## Provider Selection & Fallbacks

```javascript
// Single provider
stream('What is 2+2?', {
  model: 'anthropic:fast',  // Use Claude's fast model
  schema: { answer: Number }
})

// Fallback chain
stream('What is 2+2?', {
  model: [
    'anthropic:fast',     // Try Claude first
    'openai:fast',     // Then OpenAI
    'togetherai:fast'  // Finally TogetherAI
  ],
  schema: { answer: Number }
})
```

## Connection & Reliability Management

### Connection Pooling

xmllm manages provider connections through a connection pool to:
- Limit concurrent connections per provider
- Handle connection queuing
- Enforce timeouts
- Manage provider-specific rate limits

```javascript
stream('Query', {
  model: 'anthropic:fast',
  // Connection pool options
  timeout: 30000,           // Request timeout (ms)
  maxConnections: 10,       // Max concurrent connections
  providerLimits: {         // Per-provider limits
    'claude': 5,
    'openai': 5
  }
})
```

### Circuit Breakers

Circuit breakers prevent cascading failures by temporarily stopping operations when a provider is experiencing issues:

```javascript
stream('Query', {
  model: 'anthropic:fast',
  // Circuit breaker configuration
  circuitBreakerThreshold: 5,     // Errors before circuit opens
  circuitBreakerResetTime: 60000, // Time before retry (ms)
})
```

The circuit breaker has three states:

1. **Closed** (normal operation):
   - Requests flow through normally
   - Errors are tracked
   - When error count reaches threshold, circuit "trips"

2. **Open** (blocking requests):
   - After threshold errors occur
   - All requests immediately fail
   - Stays open for reset timeout period
   - Protects system from cascade failures

3. **Half-Open** (testing recovery):
   - After reset timeout expires
   - Next request is allowed through
   - If successful, circuit closes
   - If fails, circuit opens again

Example with full error handling:

```javascript
stream('Query', {
  model: [
    'anthropic:fast',
    'openai:fast'  // Fallback provider
  ],
  // Connection management
  timeout: 30000,
  maxConnections: 10,
  
  // Circuit breaker config
  circuitBreakerThreshold: 5,
  circuitBreakerResetTime: 60000,
  
  // Retry configuration
  retryMax: 3,
  retryStartDelay: 1000,
  retryBackoffMultiplier: 2
})
.catch(error => {
  if (error.code === 'CIRCUIT_BREAKER_OPEN') {
    // Circuit breaker has tripped
    console.log(`Provider ${error.provider} is temporarily disabled`);
  }
});
```

### Connection States & Recovery

The library manages connections through several states:

1. **Active**: Connection is in use
2. **Queued**: Waiting for available connection
3. **Failed**: Connection error occurred
4. **Recovering**: Testing after failure
5. **Closed**: Connection completed successfully

When a connection fails:

1. Error is logged and counted
2. If error count exceeds threshold:
   - Circuit breaker opens
   - Requests are blocked
   - Timer starts for reset
3. After reset timeout:
   - Next request tests connection
   - Success resets error count
   - Failure reopens circuit

Benefits:
- Prevents overwhelming failing services
- Allows time for recovery
- Fails fast instead of timing out
- Reduces load during problems
- Automatically recovers when service stabilizes

### Provider Health Monitoring

The library tracks provider health metrics:

```javascript
const stats = stream.getProviderStats();
// Returns:
{
  claude: {
    activeConnections: 2,
    queuedRequests: 1,
    errorCount: 0,
    circuitBreakerStatus: 'closed',
    lastError: null
  },
  openai: {
    // ... similar stats
  }
}
```

### Caching

The proxy server supports caching to reduce API costs and improve response times. Caching is disabled by default but can be enabled per-request:

```javascript
stream('Query', {
  cache: true,  // Enable caching for this request
  model: 'anthropic:fast'
});
```

When running the proxy server, you can configure cache settings:

```bash
xmllm-proxy \
  --cache.maxSize=5000000 \      # Max cache size in bytes (default: 5MB)
  --cache.maxEntries=1000 \      # Max number of entries (default: 100000)
  --cache.maxEntrySize=10000 \   # Max entry size in bytes (default: 10KB)
  --cache.persistInterval=60000 \ # Save interval in ms (default: 5 min)
  --cache.ttl=3600000 \          # Time-to-live in ms (default: 5 days)
  --cache.dir=".cache" \         # Cache directory (relative to process.cwd())
  --cache.filename="llm-cache.json" # Cache filename
```

Cache entries are automatically pruned when they expire or when size limits are reached. See [Configuration Guide](./api/configuration.md#cache-configuration) for full cache configuration options.

## Error Handling

```javascript
try {
  const result = await stream('Query')
    .complete()
    .value();
} catch (error) {
  switch(error.code) {
    case 'RATE_LIMIT_ERROR':
      // Handle rate limiting
      break;
    case 'AUTH_ERROR':
      // Handle authentication issues
      break;
    case 'NETWORK_ERROR':
      // Handle network problems
      break;
    case 'TIMEOUT_ERROR':
      // Handle timeouts
      break;
    case 'CIRCUIT_BREAKER_OPEN':
      // Handle circuit breaker
      break;
  }
}
```

## Testing & Development

```javascript
// Mock responses
stream('Test query', {
  fakeResponse: '<answer>42</answer>'
})

// Delay simulation
stream('Test query', {
  fakeDelay: 1000  // 1 second delay
})

// Debug logging
stream('Query', {
  debug: true,
  verbose: true
})
```

## Client-Side Usage

For browser usage, a proxy server is required to keep API keys secure.

### Architecture Overview

```
Browser/Client                     Proxy Server                  AI Provider
+-----------------+                +------------+               +------------+
|                 |                |            |               |            |
| - Schema        | --> Formatted  |            |  --> Passes   |            |
| - Parsing       |     Messages   | - Auth     |      Through  | - Claude   |
| - Mode Handling |     + Config   | - Rate     |      Request  | - OpenAI   |
| - XML Assembly  |                |   Limiting |               | - etc      |
|                 | <-- Raw SSE -- |            | <-- Raw SSE-- |            |
+-----------------+                +------------+               +------------+
```

The proxy server is intentionally "blind" - it only:
- Handles authentication (keeping API keys secure)
- Manages rate limiting
- Routes requests to providers
- Streams responses back

### Setup

1. **Run the Proxy Server**

```bash
npx xmllm-proxy --port=3124 --corsOrigins="http://localhost:3000" --debug
```

2. **Connect from Client**

```javascript
import { stream, ClientProvider } from 'xmllm/client';

const client = new ClientProvider('http://localhost:3124/api/stream');

const result = await stream('Query', {
  schema: { answer: String }
}, client)
.complete()
.value();
```

### Rate Limiting

The proxy server supports multiple types of rate limiting that can be combined:

- **Global Limits**: Apply across all clients
  - `globalRequestsPerMinute`: Max requests per minute
  - `globalTokensPerMinute`: Max tokens per minute
  - `globalTokensPerHour`: Max tokens per hour
  - `globalRequestsPerHour`: Max requests per hour

- **Per-Provider Limits**: Each provider has its own built-in limits
  - Claude: 200 RPM
  - OpenAI: 200 RPM
  - TogetherAI: 100 RPM
  - PerplexityAI: 100 RPM

The most restrictive limit (global or provider) will be applied.

### Rate Limit Error Handling

When rate limits are exceeded, the error is returned in two ways:

1. JSON Response (non-streaming):
```json
{
  "error": "Global rate limit exceeded",
  "code": "GLOBAL_RATE_LIMIT",
  "message": "Custom rate limit message here",
  "limits": {
    "rpm": {
      "resetInMs": 45000
    }
  }
}
```

2. SSE Stream Event:
```
event: error
data: {"error":"Stream error","code":"GLOBAL_RATE_LIMIT","message":"Custom rate limit message here"}
```

You can customize the error message via:
```bash
xmllm-proxy --rateLimitMessage="Custom rate limit exceeded message"
```

## Proxy Server Configuration

The proxy server can be started via CLI with various configuration options:

```bash
xmllm-proxy \
  --port=3124 \
  --corsOrigins="http://localhost:3000" \
  --globalRequestsPerMinute=20 \
  --globalTokensPerMinute=1000 \
  --globalTokensPerHour=10000 \
  --globalRequestsPerHour=1000 \
  --maxRequestSize=1048576 \
  --timeout=30000 \
  --rateLimitMessage="Custom rate limit exceeded message" \
  --debug \
  --verbose
```

### Configuration Options

| Option | Environment Variable | Default | Description |
|--------|---------------------|---------|-------------|
| port | PORT | 3124 | Port to run the proxy server on |
| corsOrigins | - | * | CORS allowed origins (string or array) |
| paths.stream | - | /api/stream | Custom path for streaming endpoint |
| paths.limits | - | /api/limits | Custom path for rate limits endpoint |
| globalRequestsPerMinute | GLOBAL_RATE_LIMIT | - | Max requests per minute |
| globalTokensPerMinute | GLOBAL_TOKENS_PER_MINUTE | - | Max tokens per minute |
| globalTokensPerHour | GLOBAL_TOKENS_PER_HOUR | - | Max tokens per hour |
| globalRequestsPerHour | GLOBAL_REQUESTS_PER_HOUR | - | Max requests per hour |
| maxRequestSize | - | 1MB | Max request size in bytes |
| timeout | - | 30000 | Request timeout in ms |
| debug | - | false | Enable debug logging |
| verbose | - | false | Enable verbose logging |
| type | - | default | Proxy type ('default' or 'cot') |

### Proxy Types

The proxy server supports different types of processing:

1. **Default Proxy** (--type=default)
   - Standard streaming response
   - Direct pass-through of model responses
   - Minimal processing overhead

2. **Chain of Thought Proxy** (--type=cot)
   - Structures responses with explicit reasoning steps
   - Includes thinking process, draft response, metrics, and improvements
   - Returns final refined response
   - Useful for debugging or understanding model reasoning

Example starting the CoT proxy:
```bash
xmllm-proxy --type=cot --port=3124
```

### Monitoring Rate Limits

The proxy exposes an endpoint to check current rate limit status:

```bash
curl http://localhost:3124/api/limits
# Or with custom path if configured:
# curl http://localhost:3124/v1/rate_limits
```

Response:
```json
{
  "allowed": true,
  "limits": {
    "rpm": {
      "allowed": true,
      "remaining": 15,
      "limit": 20,
      "resetInMs": 45000
    },
    "tpm": {
      "allowed": true,
      "remaining": 800,
      "limit": 1000,
      "resetInMs": 45000
    }
  }
}
```

### Custom Paths

You can customize the endpoint paths to match existing APIs or preferences:

```bash
xmllm-proxy \
  --paths.stream=/v1/chat/completions \
  --paths.limits=/v1/rate_limits
```

### Error Message Configuration

Error messages can be customized at both proxy and request levels:

1. **Proxy Level** (applies to all requests):
```bash
xmllm-proxy --rateLimitMessage="Custom global rate limit message"
```

2. **Request Level** (per-request override):
```javascript
fetch('http://localhost:3124/api/stream', {
  method: 'POST',
  body: JSON.stringify({
    messages: [...],
    errorMessages: {
      rateLimitExceeded: "Custom rate limit message",
      genericFailure: "Custom error message"
    }
  })
});
```

The priority order for error messages is:
1. Request-level error messages
2. Proxy-level rateLimitMessage
3. Proxy-level errorMessages configuration
4. Default messages

## Custom Model Configuration

For advanced use cases, you can define custom model configurations that inherit from existing providers while overriding specific behaviors:

```javascript
stream('Query', {
  model: {
    inherit: 'anthropic',  // Base provider to inherit from
    name: 'custom-model-name', // Required: The model identifier
    
    // Optional: Override the endpoint
    endpoint: 'https://custom-api.example.com/v1/chat',
    
    // Optional: Custom API key
    key: process.env.CUSTOM_API_KEY,
    
    // Optional: Custom header generation
    headerGen: function() {
      return {
        'x-custom-auth': this.key,
        'x-model-version': '2024.1',
        'Content-Type': 'application/json'
      };
    },

    // Optional: Handle non-standard parameter mappings
    payloader: function(payload) {
      return {
        // Transform standard temperature (0-1) to custom range (-100 to 100)
        creativity_factor: (payload.temperature * 200) - 100,
        
        // Convert max_tokens to characters
        max_chars: payload.max_tokens * 4,
        
        // Custom presence penalty scaling
        repetition_avoidance: Math.exp(payload.presence_penalty) - 1,
        
        // Unique way of handling messages
        conversation: payload.messages.map(msg => ({
          speaker: msg.role === 'user' ? 'human' : 'ai',
          utterance: msg.content,
          timestamp: Date.now()
        }))
      };
    },

    // Optional: Custom constraints
    constraints: {
      rpmLimit: 50,
      maxContextSize: 150_000,
      customRateLimit: {
        tokens_per_minute: 10000,
        requests_per_day: 1000
      }
    }
  }
});
```

### Parameter Mapping Examples

For models with unique parameter requirements you can use the `payloader` function to map your parameters to the provider's requirements.

```javascript
// Example: Model that uses percentages instead of 0-1 ranges
const percentageModel = {
  inherit: 'anthropic',
  name: 'percentage-model',
  payloader: function(payload) {
    return {
      temp_percent: Math.round(payload.temperature * 100),
      top_p_percent: Math.round(payload.top_p * 100),
      penalty_strength: Math.round(payload.presence_penalty * 100)
    };
  }
};

// Usage:
stream('Query', {
  model: percentageModel
});
```

## Registering New Providers

You can register new providers globally using the `registerProvider` function:

```javascript
import { registerProvider } from 'xmllm';

// Register a new provider
registerProvider('mistral', {
  endpoint: 'https://api.mistral.ai/v1/chat/completions',
  models: {
    superfast: {
      name: 'mistral-tiny',
      maxContextSize: 32000
    },
    fast: {
      name: 'mistral-small', 
      maxContextSize: 32000
    },
    good: {
      name: 'mistral-medium',
      maxContextSize: 32000
    }
  },
  constraints: {
    rpmLimit: 150
  },
  // Optional custom header generator
  headerGen() {
    return {
      'Authorization': `Bearer ${this.key}`,
      'Content-Type': 'application/json'
    };
  },
  // Optional custom payload transformer
  payloader: function(payload) {
    // Standard OpenAI-compatible format
    return {
      messages: [
        { role: 'system', content: payload.system || '' },
        ...payload.messages
      ],
      model: this.models[payload.model].name,
      max_tokens: payload.max_tokens || 300,
      temperature: payload.temperature || 0.5,
      stream: true
    };
  },
  // Optional aliases
  aliases: ['mistralai']
});
```

### Provider Configuration

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `endpoint` | string | Yes | The API endpoint URL |
| `models` | object | Yes | Model configurations |
| `models.superfast` | object | No* | Ultra-fast model config |
| `models.fast` | object | No* | Fast model config |
| `models.good` | object | No* | High-quality model config |
| `constraints` | object | No | Provider limits |
| `constraints.rpmLimit` | number | No | Requests per minute (default: 100) |
| `constraints.tokensPerMinute` | number | No | Token rate limit per minute |
| `constraints.requestsPerHour` | number | No | Request rate limit per hour |
| `key` | string | No | API key (falls back to env var) |
| `headerGen` | function | No | Custom header generator |
| `payloader` | function | No | Custom payload transformer |
| `aliases` | string[] | No | Alternative provider names |

*Note: You must define at least one model, but it doesn't have to use these specific aliases.

### Understanding `this` Context in Custom Functions

Both `headerGen` and `payloader` functions have access to the provider instance via `this`, giving you access to:

- `this.key` - The API key for the provider
- `this.endpoint` - The provider's endpoint URL
- `this.models` - The provider's model configurations
- `this.name` - The provider's name

This is particularly useful for:

1. **Dynamic Authorization Headers**:
   ```javascript
   headerGen() {
     // Different auth formats based on key format
     if (this.key.startsWith('sk-')) {
       return { 'Authorization': `Bearer ${this.key}` };
     } else {
       return { 'x-api-key': this.key };
     }
   }
   ```

2. **Model-Specific Payload Transformations**:
   ```javascript
   payloader(payload) {
     const modelName = this.models[payload.model].name;
     
     // Different handling for different model types
     if (modelName.includes('instruct')) {
       return { instruction: payload.messages[0].content };
     } else {
       return { messages: payload.messages };
     }
   }
   ```

### Custom Payloader Examples

Here are examples of custom payloaders for different API formats:

#### 1. OpenAI-Compatible API

```javascript
function openAIStylePayloader(payload) {
  return {
    messages: [
      { role: 'system', content: payload.system || '' },
      ...payload.messages
    ],
    model: this.models[payload.model].name,
    max_tokens: payload.max_tokens || 300,
    temperature: payload.temperature || 0.5,
    top_p: payload.top_p || 1,
    presence_penalty: payload.presence_penalty || 0,
    stream: true
  };
}
```

#### 2. Anthropic-Compatible API

```javascript
function anthropicStylePayloader(payload) {
  return {
    system: payload.system,
    messages: payload.messages,
    model: this.models[payload.model].name,
    max_tokens: payload.max_tokens || 300,
    temperature: payload.temperature || 0.5,
    stream: true
  };
}
```

#### 3. Simple Prompt-Based API

```javascript
function promptBasedPayloader(payload) {
  // Extract the last user message
  const userMessage = payload.messages[payload.messages.length - 1].content;
  
  // Combine system prompt and user message
  const fullPrompt = payload.system 
    ? `${payload.system}\n\n${userMessage}`
    : userMessage;
    
  return {
    prompt: fullPrompt,
    model: this.models[payload.model].name,
    max_tokens: payload.max_tokens || 300,
    temperature: payload.temperature || 0.5,
    stream: true
  };
}
```

#### 4. Custom Parameter Mapping

```javascript
function customParameterPayloader(payload) {
  return {
    // Transform standard parameters to provider-specific format
    input: payload.messages[payload.messages.length - 1].content,
    context: payload.system || '',
    settings: {
      response_length: payload.max_tokens || 300,
      creativity: payload.temperature * 100, // Scale 0-1 to 0-100
      repetition_avoidance: payload.presence_penalty * 10
    },
    model_id: this.models[payload.model].name,
    stream_response: true
  };
}
```

### Testing Custom Providers

To test your custom provider without making actual API calls:

```javascript
import { stream, configure } from 'xmllm';
import { registerProvider } from 'xmllm';

// Register your custom provider
registerProvider('test-provider', {
  endpoint: 'https://api.test.com/v1/generate',
  models: {
    fast: { name: 'test-model' }
  },
  payloader: customPayloader
});

// Test with a mock response
const result = await stream('Test query', {
  model: 'test-provider:fast',
  // Mock the response for testing
  fakeResponse: '<answer>This is a test response</answer>',
  // Optional delay to simulate network latency
  fakeDelay: 500
}).complete().value();

console.log(result); // { answer: 'This is a test response' }
```

This approach lets you verify your custom provider configuration without making actual API calls, which is useful for:
- Unit testing
- Development and debugging
- CI/CD environments

### Schema Support in Custom Providers

xmllm's schema functionality works seamlessly with custom providers. When using schemas with custom providers, there are a few important considerations:

#### 1. Schema Handling in Payloaders

The schema is not automatically passed to the payloader function, as it's primarily used for client-side parsing. However, you can detect if a schema is being used and adjust your payload accordingly:

```javascript
function schemaAwarePayloader(payload) {
  // Check if a schema is being used
  const hasSchema = payload.schema !== undefined;
  
  return {
    messages: [
      { role: 'system', content: payload.system || '' },
      ...payload.messages
    ],
    model: this.models[payload.model].name,
    // Some providers have special parameters for structured output
    response_format: hasSchema ? { type: 'xml' } : undefined,
    // You might want to adjust the system prompt for schema usage
    system_instructions: hasSchema 
      ? "Respond with well-formed XML matching the requested schema."
      : undefined,
    // Other standard parameters
    max_tokens: payload.max_tokens || 300,
    temperature: payload.temperature || 0.5
  };
}
```

#### 2. Testing Schema Support

You can test schema support with mock responses:

```javascript
// Define a schema
const scoreSchema = {
  evaluation: {
    score: Number,
    feedback: String,
    categories: [String]
  }
};

// Test with a mock response matching the schema
const result = await stream('Evaluate this submission', {
  model: 'custom-provider:fast',
  schema: scoreSchema,
  fakeResponse: `
    <evaluation>
      <score>95</score>
      <feedback>Excellent work with clear explanations.</feedback>
      <categories>
        <item>Clarity</item>
        <item>Thoroughness</item>
        <item>Accuracy</item>
      </categories>
    </evaluation>
  `
}).complete().value();

console.log(result);
// {
//   evaluation: {
//     score: 95,
//     feedback: 'Excellent work with clear explanations.',
//     categories: ['Clarity', 'Thoroughness', 'Accuracy']
//   }
// }
```

#### 3. Provider-Specific Schema Handling

Different providers have different ways of handling structured output:

- **OpenAI**: Supports `response_format: { type: "json_object" }` for JSON output
- **Anthropic**: Supports XML output with appropriate system prompts
- **Custom APIs**: May have specific parameters for structured output

Your payloader can adapt to these differences:

```javascript
function adaptiveSchemaPayloader(payload) {
  const hasSchema = payload.schema !== undefined;
  const modelName = this.models[payload.model].name;
  
  // Base payload
  const basePayload = {
    messages: payload.messages,
    max_tokens: payload.max_tokens || 300,
    temperature: payload.temperature || 0.5
  };
  
  // Add provider-specific schema handling
  if (hasSchema) {
    if (modelName.includes('gpt')) {
      // OpenAI-style
      return {
        ...basePayload,
        response_format: { type: "json_object" }
      };
    } else if (modelName.includes('claude')) {
      // Anthropic-style (relies on system prompt)
      return {
        ...basePayload,
        system: (payload.system || '') + 
          '\nRespond with well-formed XML matching the requested schema.'
      };
    } else {
      // Generic approach
      return {
        ...basePayload,
        structured_output: true,
        output_format: 'xml'
      };
    }
  }
  
  return basePayload;
}
```

Remember that xmllm handles the parsing of the structured response on the client side, so your provider only needs to ensure the model generates properly formatted XML or JSON that matches the schema structure.

## Provider Compatibility Matrix

Different providers support different parameters. Here's a compatibility matrix for common parameters:

| Parameter | OpenAI | Anthropic | Mistral | DeepSeek | Together | Perplexity |
|-----------|--------|-----------|---------|----------|----------|------------|
| `temperature` | ✅ 0-2 | ✅ 0-1 | ✅ 0-1 | ✅ 0-1 | ✅ 0-2 | ✅ 0-1 |
| `top_p` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `max_tokens` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `stop` | ✅ | ✅* | ✅ | ✅ | ✅ | ✅ |
| `presence_penalty` | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| `frequency_penalty` | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| `response_format` | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ |
| `random_seed` | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `safe_prompt` | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `search_domain_filter` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

*Anthropic uses `stop_sequences` instead of `stop` (xmllm handles this conversion automatically)

## Random Provider-Specific Notes

### OpenAI O1 Models

OpenAI's O1 models have specific requirements:

- They don't support `temperature`, `top_p`, `presence_penalty`, or `frequency_penalty`
- They use `max_completion_tokens` instead of `max_tokens`
- They support a `reasoning_effort` parameter (except for o1-mini)
- System messages use the `developer` role instead of `system` (except for o1-mini)

xmllm handles these differences automatically when you use an O1 model.

### Anthropic Claude

Anthropic's Claude models:

- Have a maximum temperature of 1.0 (values above 1.0 are capped)
- Use `stop_sequences` instead of `stop` (xmllm handles this conversion)
- Don't support presence or frequency penalties

### Mistral AI

Mistral AI models support:

- `random_seed` for reproducible outputs
- `safe_prompt` for content filtering
- `response_format` for structured output

### DeepSeek

DeepSeek's models:

- Support very large context windows (64k tokens)
- The "reasoner" model is specialized for complex reasoning tasks
- Support `response_format` for structured output

### Perplexity

Perplexity models support unique features:

- `search_domain_filter` to limit web searches to specific domains
- `return_images` to include images in responses
- `return_related_questions` to suggest follow-up questions
