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

## Provider Selection

### Single Provider
```javascript
stream('What is 2+2?', {
  model: 'claude:fast',  // Use Claude's fast model
  schema: {
    answer: Number
  }
})
```

### Fallback Chain
```javascript
stream('What is 2+2?', {
  model: [
    'claude:fast',     // Try Claude first
    'openai:fast',     // Then OpenAI
    'togetherai:fast'  // Finally TogetherAI
  ],
  schema: {
    answer: Number
  }
})
```

## Rate Limiting

Default rate limits per provider:
- Claude: 200 RPM
- OpenAI: 200 RPM
- TogetherAI: 100 RPM
- PerplexityAI: 100 RPM

Override defaults:
```javascript
stream('Analyze this', {
  model: 'claude:fast',
  constraints: {
    rpmLimit: 50  // Custom rate limit
  }
})
```

## Error Handling & Retries

Configure retry behavior:
```javascript
stream('What is 2+2?', {
  model: 'claude:fast',
  retryMax: 3,              // Max retries
  retryStartDelay: 1000,    // Start with 1s delay
  retryBackoffMultiplier: 2 // Double delay after each retry
})
```

## Response Caching

Enable caching to reduce API calls:
```javascript
const result = await stream('What is 2+2?', {
  model: 'claude:fast',
  cache: true,  // Enable caching
  schema: {
    answer: Number
  }
})
.complete()
.value();
```

## Client-Side Usage

For browser usage, run the proxy server to handle API requests:

1. **Start the Proxy Server**
```bash
# Using npm script
npm run proxy

# With configuration options
npm run proxy -- \
  --port=4000 \
  --corsOrigins=http://localhost:3000 \
  --maxRequestSize=10mb \
  --timeout=30000
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

## Custom Providers

Define custom provider configurations:
```javascript
stream('Query', {
  model: {
    inherit: 'claude',  // Inherit from existing provider
    name: 'claude-custom',
    maxContextSize: 200_000,
    endpoint: 'https://custom-endpoint.com',
    key: process.env.CUSTOM_API_KEY,
    constraints: {
      rpmLimit: 50
    }
  }
})
```

## Testing & Development

1. **Mock Responses**
```javascript
stream('Test query', {
  fakeResponse: '<answer>42</answer>'
})
```

2. **Delay Simulation**
```javascript
stream('Test query', {
  fakeDelay: 1000  // 1 second delay
})
```

3. **Provider Debugging**
```javascript
stream('Query', {
  debug: true,
  verbose: true
})
```

## Error Types

The library provides specific error types for different scenarios:

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
  }
}
```

## Best Practices

1. **Use Environment Variables**: Keep API keys in environment variables
2. **Enable Caching**: Use caching for repeated queries
3. **Configure Retries**: Set appropriate retry limits and delays
4. **Use Fallbacks**: Configure fallback providers for reliability
5. **Monitor Rate Limits**: Stay within provider rate limits
6. **Handle Errors**: Implement proper error handling
7. **Test with Mocks**: Use fakeResponse for testing