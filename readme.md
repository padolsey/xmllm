# xmllm

xmllm lets AI language models communicate naturally while giving you structured data back. Instead of forcing rigid function calls, xmllm lets AIs respond in XML - a format that's both semantic and structured.

## Core Concepts

Before diving into code, let's understand how xmllm works:

```
AI Response (XML) -> Schema Definition -> Transformer -> Structured Data
```

### 1. XML Schemas & Transformers

xmllm uses schemas to transform XML responses into structured data. Here's a simple example:

```javascript
const schema = {
  weather: {
    temp: Number,        // Transform to number
    condition: String,   // Keep as string
    'warning[]': String  // Array of warnings
  }
};

// AI responds with:
// <weather>
//   <temp>72</temp>
//   <condition>sunny</condition>
//   <warning>High UV index</warning>
//   <warning>Strong winds</warning>
// </weather>

// You get:
{
  weather: {
    temp: 72,
    condition: "sunny",
    warning: ["High UV index", "Strong winds"]
  }
}
```

Every XML element has these core properties available for transformation:

```javascript
{
  $text: "element content",      // Text content
  $attr: { id: "123" },         // XML attributes
  $key: 1,                      // Unique element ID
  $closed: true                 // Has closing tag
}
```

### 2. Streaming Behavior

xmllm processes XML as it arrives, giving you real-time updates:

```javascript
// When AI starts responding:
<weather>              // -> { weather: {} }
<weather><temp>        // -> { weather: { temp: '' } }
<weather><temp>72      // -> { weather: { temp: '72' } }
<weather><temp>72</temp><condition>sunny</condition>
// -> { weather: { temp: 72, condition: 'sunny' } }
```

This streaming behavior:
- Shows real-time progress
- Enables early processing
- Helps with debugging
- Provides better UX

You can handle streaming in two ways:

```javascript
// 1. Get all updates (default)
for await (const update of stream) {
  console.log(update); // See every change
}

// 2. Get only complete elements
for await (const complete of closedStream) {
  console.log(complete); // Only final results
}
```

## Quick Start

```bash
npm install xmllm
```

```javascript
import { xmllm } from 'xmllm';

const stream = xmllm(({ p, value }) => [
  p(
    "What's the weather like in London and Paris?",
    {
      cities: {
        city: [{
          name: value(),
          temp: value(n => parseFloat(n)),
          conditions: value()
        }]
      }
    }
  )
]);

for await (const result of stream) {
  console.log(result);
  // {
  //   cities: {
  //     city: [
  //       { name: "London", temp: 18, conditions: "cloudy" },
  //       { name: "Paris", temp: 22, conditions: "sunny" }
  //     ]
  //   }
  // }
}
```

## Why xmllm?

Consider asking an AI about the weather. Traditional approaches force rigid structures:

```javascript
// Traditional "function calling" approach:
getWeather({
  cities: ["London", "Paris"],
  fields: ["temperature", "conditions"]
})
```

With xmllm, the AI can respond more naturally while still giving you structured data:

```xml
<response>
  <city name="London">
    <temp>18°C</temp>
    <conditions>Cloudy with light rain expected later</conditions>
    <note>Bring an umbrella!</note>
  </city>
  <city name="Paris">
    <temp>22°C</temp>
    <conditions>Partly sunny with mild winds</conditions>
    <note>Perfect weather for cafés</note>
  </city>
</response>
```

xmllm solves common problems with AI responses:
1. **Function Calling is Rigid**
   - Forces LLMs into predefined function signatures
   - Loses semantic richness of natural responses
   - Hard to handle complex, nested data

2. **JSON Parsing is Fragile**
   - Easy for LLMs to generate invalid JSON
   - No streaming support
   - All-or-nothing parsing

## Basic Usage

### Schema Design

Here are key principles for effective schemas:

1. Use singular nouns for repeating elements:
```javascript
{
  // Good - matches XML semantics
  'user[]': {  // Each <user> is one user
    name: value(),
    'email[]': value(e => e.toLowerCase())  // Each <email> is one email
  },
  
  // Bad - confusing semantics
  'users[]': {
    name: value(),
    'emails[]': value()
  }
}
```

2. Keep schemas flat when possible:
```javascript
// Good - simple and clear
{
  'product[]': {
    name: value(),
    price: value(p => parseFloat(p))
  }
}

// Avoid - unnecessarily nested
{
  products: {
    list: {
      'item[]': {
        name: value(),
        price: value(p => parseFloat(p))
      }
    }
  }
}
```

3. Use transformers effectively:
```javascript
{
  user: {
    // Simple cases: use value()
    name: value(),
    
    // Numbers with validation
    age: value(age => {
      const n = parseInt(age);
      return isNaN(n) ? null : n;
    }),
    
    // Complex cases: custom transform
    email: ({ $text, $attr }) => ({
      address: $text.toLowerCase(),
      verified: $attr.verified === 'true'
    })
  }
}
```

### Working with Streams

Choose the right streaming approach for your needs:

```javascript
// 1. Real-time updates (good for UX)
const stream = xmllm(({ p }) => [
  p('List three colors', {
    'color[]': ({ $text, $closed }) => ({
      value: $text,
      complete: $closed
    })
  })
]);

// Shows interim states:
// { value: "re", complete: false }
// { value: "red", complete: true }

// 2. Complete elements only (simpler logic)
const stream = xmllm(({ pc }) => [
  pc('List three colors', {
    'color[]': String
  })
]);

// Only shows final states:
// { color: ["red", "blue", "green"] }
```

## Models & Providers

xmllm supports multiple AI providers out of the box. The current model configurations can be found in [PROVIDERS.mjs](https://github.com/padolsey/xmllm/blob/main/src/PROVIDERS.mjs).

```javascript
const stream = xmllm(({ p }) => [
  p({
    messages: [...],
    model: 'claude:fast'  // Use Claude's fast model
  })
]);
```

Currently supported providers and their models:

- **Claude (Anthropic)**
  - `claude:superfast` - claude-3-haiku-20240307
  - `claude:fast` - claude-3-haiku-20240307  
  - `claude:good` - claude-3-5-sonnet-20240620

- **OpenAI**
  - `openai:superfast` - gpt-4o-mini
  - `openai:fast` - gpt-4o-mini
  - `openai:good` - gpt-4o

- **Together.ai**
  - `togetherai:superfast` - Qwen/Qwen2.5-7B-Instruct-Turbo
  - `togetherai:fast` - Qwen/Qwen2.5-7B-Instruct-Turbo
  - `togetherai:good` - Qwen/Qwen2.5-72B-Instruct-Turbo

- **Perplexity AI**
  - `perplexityai:superfast` - llama-3.1-sonar-small-128k-chat
  - `perplexityai:fast` - llama-3.1-sonar-small-128k-chat
  - `perplexityai:good` - llama-3.1-sonar-large-128k-chat

> **Note:** We will be updating this at some point, likely deprecating the hard-coded models, as it's really not within the remit of xmllm to have hard-coded lists of models. Different providers frequently change models and we don't want to have to keep up with that.

### Custom Models (This is best!)

Use newer or custom models:

```javascript
// Simple string syntax
xmllm(({ p }) => [
  p({
    messages: [...],
    model: 'claude:claude-3-haiku-20240901'
  })
]);

// Advanced configuration
xmllm(({ p }) => [
  p({
    messages: [...],
    model: {
      inherit: 'claude',
      name: 'claude-3-haiku-20240901',
      maxContextSize: 200_000,
      endpoint: 'https://custom-endpoint.com',
      key: 'your-api-key',
      constraints: {
        rpmLimit: 50
      }
    }
  })
]);
```

### Provider Fallbacks

Specify multiple providers as fallbacks:

```javascript
xmllm(({ p }) => [
  p({
    messages: [...],
    model: [
      'claude:fast',     // Try Claude first
      'openai:fast',     // Then OpenAI
      'togetherai:fast'  // Finally TogetherAI
    ]
  })
]);
```

## Advanced Features

### Pipeline Operations

Available operations:
- `p` - Alias for `prompt`: Get data from AI
- `pc` - Alias for `promptClosed`: Get complete elements only
- `r` - Alias for `req`: Make raw request to AI
- `map`: Transform data
- `filter`: Filter results
- `reduce`: Reduce multiple results
- `accrue`: Collect all results
- `tap`: Side effects
- `waitUntil`: Wait for condition
- `mergeAggregate`: Combine parallel results

Example:
```javascript
const stream = xmllm(({ p, map, filter }) => [
  p('List colors'),
  map(data => transform(data)),
  filter(item => item.valid)
]);
```

### Client-Side Usage

For browser environments:

1. Start proxy:
```bash
# Create .env with your API keys
ANTHROPIC_API_KEY=your_claude_key
OPENAI_API_KEY=your_openai_key

npm run proxy
```

2. Use in browser:
```javascript
import { xmllm, ClientProvider } from 'xmllm/client';

const client = new ClientProvider('http://localhost:3124/api/stream');
const stream = xmllm(({ p }) => [...], client);
```

## Resilience & Error Handling

### Provider Fallbacks & Retries

xmllm implements multiple layers of resilience:

```javascript
xmllm(({ p }) => [
  p({
    messages: [...],
    // Specify fallback chain
    model: [
      'claude:good',    // Try Claude first
      'openai:good',    // Then OpenAI
      'claude:fast',    // Then faster Claude model
      'openai:fast'     // Finally faster OpenAI model
    ],
    // Configure retry behavior
    retryMax: 3,              // Max retries per provider
    retryStartDelay: 1000,    // Start with 1s delay
    retryBackoffMultiplier: 2 // Double delay after each retry
  })
]);
```

Recovery strategies by error type:
- **Rate Limits (429)**: Automatic retry with backoff
- **Server Errors (500)**: Quick switch to next provider
- **Auth Errors (401/403)**: Immediate skip to next provider
- **Network Errors**: Retry with backoff
- **Timeout Errors**: Retry with longer timeout

### Rate Limiting

xmllm implements default rate limits for development purposes. Note that these limits are conservative defaults and may not reflect your actual rate limits, which are determined by your provider and subscription tier.

Default development limits:
- Claude: 200 RPM
- OpenAI: 200 RPM 
- TogetherAI: 100 RPM
- PerplexityAI: 100 RPM

You can override these defaults:

```javascript
xmllm(({ p }) => [
  p({
    messages: [...],
    model: 'claude:good',
    constraints: {
      rpmLimit: 50  // Override default RPM limit
    }
  })
]);
```

**Note:** The actual rate limits you encounter will be determined by your API provider and subscription tier. The defaults in xmllm are conservative estimates for development purposes only.

## License

MIT