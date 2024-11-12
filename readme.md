# xmllm: XML-based Language Model Pipeline

xmllm is a tool for creating structured AI workflows using pipelines and generators. It supports both server-side and client-side usage, with a focus on reliability and structured responses.

## Quick Start

### Server-Side Usage (Simplest)
```javascript
import { xmllm } from 'xmllm';

// Direct usage with API keys from environment
const stream = await xmllm(({ prompt }) => [
  prompt({
    messages: [{ role: 'user', content: 'What is 2+2?' }],
    model: 'claude:fast',
    schema: {
      answer: {
        value: Number,
        explanation: String
      }
    }
  })
]);

for await (const chunk of stream) {
  console.log(chunk);
}
```

### Client-Side Usage (Optional)
Requires running the proxy server to handle API keys:

1. Start proxy server:
```bash
# Create .env file with your API keys
ANTHROPIC_API_KEY=your_claude_key
OPENAI_API_KEY=your_openai_key

# Start proxy
npm run proxy
```

2. Use in browser:
```javascript
import { xmllm, ClientProvider } from 'xmllm/client';

const client = new ClientProvider('http://localhost:3124/api/stream');
const stream = await xmllm(({ prompt }) => [...], client);
```

## Pipeline Architecture

xmllm uses a pipeline architecture with generators. Each step in the pipeline can:
- Generate new data
- Transform existing data
- Filter results
- Accumulate results

### Basic Pipeline
```javascript
const stream = await xmllm(({ prompt }) => [
  // Step 1: Initial prompt
  prompt({
    messages: [{ role: 'user', content: 'List three colors.' }],
    schema: {
      'color[]': {
        name: String,
        hex: String
      }
    }
  }),

  // Step 2: Transform results
  function* (colors) {
    for (const color of colors.color) {
      yield `${color.name}: ${color.hex}`;
    }
  }
]);
```

### Advanced Pipeline Patterns

#### Result Accumulation
```javascript
const stream = await xmllm(({ prompt, accrue }) => [
  // Generate multiple results
  prompt({
    messages: [{ role: 'user', content: 'Give me a random number' }],
    schema: { number: Number }
  }),

  // Collect all results
  accrue(),

  // Process accumulated results
  function* (numbers) {
    const avg = numbers.reduce((sum, n) => sum + n.number, 0) / numbers.length;
    yield { average: avg };
  }
]);
```

#### Parallel Processing
```javascript
const stream = await xmllm(({ prompt, merge }) => [
  // Run multiple prompts in parallel
  [
    prompt({
      messages: [{ role: 'user', content: 'List colors' }],
      schema: { 'colors[]': String }
    }),
    prompt({
      messages: [{ role: 'user', content: 'List shapes' }],
      schema: { 'shapes[]': String }
    })
  ],

  // Merge results
  merge((colors, shapes) => ({
    combinations: colors.colors.flatMap(c => 
      shapes.shapes.map(s => `${c} ${s}`)
    )
  }))
]);
```

#### Conditional Processing
```javascript
const stream = await xmllm(({ prompt, filter }) => [
  prompt({
    messages: [{ role: 'user', content: 'Generate random numbers' }],
    schema: { 
      'numbers[]': Number
    }
  }),

  // Filter results
  filter(result => result.numbers.every(n => n > 0)),

  // Transform filtered results
  function* (result) {
    yield { 
      positive_numbers: result.numbers,
      count: result.numbers.length
    };
  }
]);
```

## Resource Management

### Rate Limiting
```javascript
const stream = await xmllm(({ prompt }) => [
  prompt({
    messages: [...],
    model: 'claude:fast',
    constraints: {
      rpmLimit: 100  // Limit to 100 requests per minute
    }
  })
]);
```

### Provider Fallbacks
```javascript
const stream = await xmllm(({ prompt }) => [
  prompt({
    messages: [...],
    // Try providers in order
    model: [
      'claude:fast',     // Try Claude first
      'openai:fast',     // Then OpenAI
      'togetherai:fast'  // Finally TogetherAI
    ]
  })
]);
```

### Custom Providers
```javascript
const stream = await xmllm(({ prompt }) => [
  prompt({
    messages: [...],
    model: [{
      inherit: 'openai',    // Use OpenAI's protocol
      name: 'local-llama',
      endpoint: 'http://localhost:8000/v1/chat/completions',
      key: 'local-key',
      constraints: {
        rpmLimit: 1000
      }
    }]
  })
]);
```

## Error Handling

```javascript
try {
  const stream = await xmllm(({ prompt }) => [
    prompt({
      messages: [...],
      model: ['claude:fast', 'openai:fast']
    })
  ]);

  for await (const chunk of stream) {
    try {
      console.log(chunk);
    } catch (error) {
      // Handle stream processing errors
      console.error('Stream processing error:', error);
    }
  }
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation errors
  } else if (error instanceof ProviderError) {
    if (error instanceof ProviderRateLimitError) {
      // Handle rate limits
      console.log('Retry after:', error.retryAfter);
    }
  }
}
```

## Best Practices

### Pipeline Design
1. Keep pipelines focused and composable
2. Use appropriate operators (filter, map, reduce, etc.)
3. Handle errors at appropriate levels
4. Consider resource constraints

### Schema Design
1. Use elements over attributes
2. Keep schemas flat when possible
3. Use arrays with [] suffix
4. Document expected formats

### Resource Management
1. Set appropriate rate limits
2. Use provider fallbacks
3. Implement proper cleanup
4. Monitor resource usage

## License

MIT