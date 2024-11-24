# xmllm

xmllm is a provider-agnostic JavaScript library that lets AI language models communicate naturally while still giving you structured data back. Instead of forcing AIs to return strict JSON through brittle function-calling APIs, xmllm lets them respond in XML/HTML - formats they deeply understand from training data.

**Why does this matter?** Most LLM function-calling APIs force models to return JSON, which:
1. Often fails due to strict grammar requirements
2. Typically doesn't support streaming responses
3. Forces models away from their strength: natural language

xmllm takes a different approach:
- Let AIs respond in semantically-rich XML/HTML according to schemas
- Stream partial results as they're generated
- Query a DOM-like structure using CSS selectors if you like
- Transform & filter responses into custom structured data
- Work with any AI provider (Anthropic, OpenAI, etc.)

```javascript
// Instead of praying for valid JSON:
const analysis = await stream(
  'Analyze this tweet: "Just landed my first dev job! 🚀"',
  {
    schema: {
      sentiment: String,
      topics: [String],
      suggestions: [{
        title: String,
        description: "A helpful suggestion for the new developer"
      }]
    }
  }
).value();

/* The AI can respond naturally with XML:
<analysis>
  <sentiment>Positive! This tweet shows excitement and achievement.</sentiment>
  <topics>
    <topic>Career Growth</topic>
    <topic>Technology Industry</topic>
  </topics>
  <suggestions>
    <suggestion>
      <title>Join Dev Communities</title>
      <description>Connect with other developers to share your 
      journey and learn from their experiences...</description>
    </suggestion>
  </suggestions>
</analysis>

Which transforms into structured data:
{
  sentiment: "Positive! This tweet shows excitement and achievement.",
  topics: ["Career Growth", "Technology Industry"],
  suggestions: [{
    title: "Join Dev Communities",
    description: "Connect with other developers to share your journey..."
  }]
} */
```

## Why XML?

Traditional function-calling APIs have limitations:
- **Rigid JSON Grammar**: Function calls often fail due to strict requirements
- **No Streaming**: Most don't support real-time updates
- **Unnatural Responses**: JSON format constrains natural language

xmllm solves these by using 'loose' XML (akin to HTML), which:
- Allows natural language within structure
- Streams responses in real-time
- Recovers gracefully from errors
- Preserves semantic meaning

## Quick Start

```bash
# Install
npm install xmllm

# Configure your AI provider (at least one required)
export ANTHROPIC_API_KEY=your_key    # For Claude
export OPENAI_API_KEY=your_key       # For GPT-4
```

### Basic Usage

```javascript
import { stream } from 'xmllm';

// 1. Simple Streaming
const thoughts = stream('Share three deep thoughts about programming')
  .select('thought')  // Select <thought> elements
  .text();           // Extract text content

for await (const thought of thoughts) {
  console.log('AI is thinking:', thought); // See thoughts as they arrive
}

// 2. Structured Data
const result = await stream('What is 2+2?', {
  schema: {
    answer: {
      value: Number,
      explanation: String
    }
  }
})
.complete()  // Wait for complete response
.value();
```

## Core Features

🔄 **Streaming First**
- Process AI responses as they arrive
- Show real-time progress
- Handle partial updates

```javascript
// See updates in real-time:
for await (const color of stream('List colors').select('color')) {
  console.log(color.$text);    // "re", "red", "blu", "blue"
  console.log(color.$closed);  // false, true, false, true
}
```

See more details in the [Streaming Guide](./docs/streaming.md).

🔧 **Schema-Based**
- Transform XML into structured data
- Type conversion & validation
- Flexible mapping options

```javascript
const schema = {
  analysis: {
    score: Number,
    tags: [String],
    details: {
      $lang: String,    // Attribute
      _: String         // Text content
    }
  }
};
```

See more details in the [Schema Guide](./docs/schemas.md).

🛠️ **Developer Friendly**
- Multiple AI providers supported
- Graceful error recovery
- Browser & Node.js support

## Configuration

xmllm supports multiple AI providers. You'll need at least one:

| Provider | Key | Models such as... |
|----------|-----|-----------|
| Claude | `ANTHROPIC_API_KEY` | Sonnet, Haiku, Opus |
| OpenAI | `OPENAI_API_KEY` | GPT-o1, GPT-4o, GPT-4o-mini |
| Together.ai | `TOGETHERAI_API_KEY` | Qwen, Mistral, Llama, etc. |
| Perplexity | `PERPLEXITYAI_API_KEY` | Llama, Mistral, etc. |

See many more details in the [Provider Setup](./docs/providers.md) guide.

```javascript
// Configure at runtime or in an `.env` file
stream('Query', {
  apiKeys: {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY
  },
  model: 'claude:fast'  // Use Claude's fast model
})
```

## Browser Usage

For browser environments, use the client interface with a proxy server:

```javascript
import { stream, ClientProvider } from 'xmllm/client';

const client = new ClientProvider('http://localhost:3124/api/stream');

const result = await stream('Query', {
  schema: { answer: String }
}, client)
.complete()
.value();
```

## Advanced Pipeline API

Need more control? xmllm provides a lower-level pipeline API for complex scenarios:

```javascript
import { xmllm } from 'xmllm';

// Chain prompts and track state:
const stream = xmllm(({ prompt }) => [
  // Get initial response
  prompt('List three colors', {
    colors: { color: [String] }
  }),

  // Track colors seen so far
  function*() {
    const seen = new Set();
    while (true) {
      const result = yield;
      if (!result?.colors?.color) continue;
      
      const newColors = result.colors.color
        .filter(c => !seen.has(c));
      
      newColors.forEach(c => seen.add(c));
      
      yield {
        colors: newColors,
        total: seen.size
      };
    }
  }
]);

// Outputs like: 
// { colors: ["red", "blue"], total: 2 }
// { colors: ["green"], total: 3 }
```

See the [Pipeline Guide](./docs/pipelines.md) for more advanced usage like parallel processing, complex transformations, and error handling.

## In-Depth Documentation

[Schema Guide](./docs/schemas.md)
- Define how XML transforms into data
- Type conversion & validation
- Complex transformations

[Provider Setup](./docs/providers.md)
- Configure AI providers
- Model selection
- Rate limiting & caching

[Streaming Guide](./docs/streaming.md)
- Handle real-time updates
- Progress indicators
- Error recovery

[Advanced Pipeline Guide](./docs/pipelines.md)
- Chain multiple prompts
- Process in parallel
- Stateful transformations

## License

MIT 