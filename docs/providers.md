# Provider Configuration & Management

xmllm supports multiple AI providers and offers flexible configuration options for production deployments.

## Quick Setup

```javascript
import { stream } from 'xmllm';

// 1. Environment Variables (recommended)
// .env
ANTHROPIC_API_KEY=your_claude_key
OPENAI_API_KEY=your_openai_key
TOGETHERAI_API_KEY=your_together_key
PERPLEXITYAI_API_KEY=your_perplexity_key

// 2. Runtime Configuration
const result = await stream('What is 2+2?', {
  apiKeys: {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY
  },
  model: 'claude:fast',
  temperature: 0.52  // Default temperature for balanced output
})
.complete()
.value();
```

## Supported Providers & Models

Current model mappings (as of 2024):

| Provider | Models | Context Size | Notes |
|----------|---------|-------------|-------|
| Claude (Anthropic) | `claude:superfast` (claude-3-haiku)<br>`claude:fast` (claude-3-haiku)<br>`claude:good` (claude-3-sonnet) | 100k tokens | Best for structured responses |
| OpenAI | `openai:superfast` (gpt-4o-mini)<br>`openai:fast` (gpt-4o-mini)<br>`openai:good` (gpt-4o) | 128k tokens | Good all-around performance |
| Together.ai | `togetherai:superfast` (Qwen 7B)<br>`togetherai:fast` (Qwen 7B)<br>`togetherai:good` (Qwen 72B) | Varies | Cost-effective alternative |
| Perplexity | `perplexityai:superfast` (sonar-small)<br>`perplexityai:fast` (sonar-small)<br>`perplexityai:good` (sonar-large) | 128k tokens | Newer provider |

## Model Parameters

```javascript
stream('What is 2+2?', {
  model: 'claude:fast',
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
  model: 'claude:fast',  // Use Claude's fast model
  schema: { answer: Number }
})

// Fallback chain
stream('What is 2+2?', {
  model: [
    'claude:fast',     // Try Claude first
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
  model: 'claude:fast',
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
  model: 'claude:fast',
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
    'claude:fast',
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
npx xmllm-proxy --port=3000 --corsOrigins="http://localhost:3000" --debug
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

## Custom Model Configuration

xmllm supports highly customized model configurations for providers with non-standard parameters or unique requirements.

### A wild example...

```javascript
import { stream } from 'xmllm';

// Example with a model that uses non-standard parameters
const result = await stream('What is 2+2?', {
  model: {
    inherit: 'claude',  // Inherit base provider settings
    name: 'custom-weird-model',
    
    // Custom endpoint if needed
    endpoint: 'https://custom-api.example.com/v2/chat',
    
    // Custom header generation
    headerGen: function() {
      return {
        'x-custom-auth': this.key,
        'x-model-version': '2024.1',
        'Content-Type': 'application/json'
      };
    },

    // Handle non-standard parameter mappings
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
        })),

        // etc.
      };
    },

    // Custom constraints
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

For models with unique parameter requirements:

```javascript
// Example: Model that uses percentages instead of 0-1 ranges
const percentageModel = {
  inherit: 'claude',
  name: 'percentage-model',
  payloader: function(payload) {
    return {
      temp_percent: Math.round(payload.temperature * 100),
      top_p_percent: Math.round(payload.top_p * 100),
      penalty_strength: Math.round(payload.presence_penalty * 100)
    };
  }
};

// Example: Model with categorical parameters
const categoricalModel = {
  inherit: 'claude',
  name: 'categorical-model',
  payloader: function(payload) {
    // Map temperature to creativity modes
    const creativityMode = 
      payload.temperature < 0.3 ? 'conservative' :
      payload.temperature < 0.7 ? 'balanced' :
      'creative';
    
    // Map presence_penalty to repetition strategies
    const repetitionStrategy =
      payload.presence_penalty <= 0 ? 'allow_repetition' :
      payload.presence_penalty < 0.5 ? 'gentle_variation' :
      'force_unique';

    return {
      creativity_mode: creativityMode,
      repetition_strategy: repetitionStrategy,
      response_length: payload.max_tokens > 1000 ? 'long' : 'short'
    };
  }
};

// Example: Model with nested parameter groups
const nestedParamsModel = {
  inherit: 'claude',
  name: 'nested-params-model',
  payloader: function(payload) {
    return {
      generation_settings: {
        creative: {
          primary_temp: payload.temperature,
          secondary_temp: payload.temperature * 0.8,
          variance_factor: payload.top_p
        },
        constraints: {
          max_output_length: payload.max_tokens,
          repetition_settings: {
            penalty_multiplier: payload.presence_penalty,
            scope: 'global',
            decay_rate: 0.98
          }
        }
      },
      execution_mode: payload.stream ? 'streaming' : 'complete',
      quality_preferences: {
        enhance_coherence: true,
        maintain_style: true,
        fact_checking: 'strict'
      }
    };
  }
};
```

### Response Transformation

For models that return responses in non-standard formats:

```javascript
const customResponseModel = {
  inherit: 'claude',
  name: 'custom-response-model',
  
  // Transform the model's unique response format
  responseTransform: function(response) {
    return {
      content: response.generated_text,
      usage: {
        prompt_tokens: response.metrics.input_token_count,
        completion_tokens: response.metrics.output_token_count,
        total_tokens: response.metrics.total_tokens
      },
      model_metrics: {
        generation_time: response.timing.total_ms,
        tokens_per_second: response.metrics.tokens_per_second
      }
    };
  }
};
```
