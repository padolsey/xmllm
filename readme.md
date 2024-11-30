# xmllm

xmllm solves a core problem with AI APIs: you shouldn't have to choose between getting structured data OR real-time updates.

> *XML allows LLMs to communicate naturally with the best merits of 'free prose' while still giving you structured data back. The norm of deriving JSON from LLMs, even if valid, is biased to more "robotic" completions, arguably lacking some of the more fluid or creative higher-temperature prose we have come to value.*

Instead of wrestling with JSON function calls or parsing text deltas, xmllm lets AI models communicate naturally using markup - giving you both structure and streaming at once. It is provider-agnostic and uses a flexible HTML parser to extract structured data, making it more resilient and less brittle than JSON.

Here's an example:

```javascript
const analysis = await stream(
  `
    How many Rs are in the word strawberry?
    Count the letters prior to your answer.
  `,
  {
    schema: {
      approach: 'the approach you will use',
      letter: ['each letter'],
      philosophical_arguments_on_strawberry_math: {
        argument: [{
          $text: 'the argument',
          $lang: 'the language of the argument'
        }]
      },
      final_answer: String
    }
  }
).value();
```

The AI responds naturally with XML:
```xml
<approach>To solve this problem, I will first count the number of 'R' letters 
in the word 'strawberry'. Then, I will provide some abstract and philosophical
reflections...</approach>
<letter>s</letter>
<letter>t</letter>
<letter>r</letter>
<!-- ... more letters ... -->
<philosophical_arguments_on_strawberry_math>
  <argument lang="Existential">
    The letters that make up the word 'strawberry' are more than just symbols...
  </argument>
  <!-- more arguments... -->
</philosophical_arguments_on_strawberry_math>
<final_answer>There are 3 Rs in the word 'strawberry'.</final_answer>
```

Which transforms into structured data:
```javascript
{
  approach: "To solve this problem, I will first count...",
  letter: ["s", "t", "r", "a", "w", "b", "e", "r", "r", "y"],
  philosophical_arguments_on_strawberry_math: {
    argument: [{
      text: "The letters that make up the word 'strawberry'...",
      lang: "Existential"
    },
    // more arguments...
    ]
  },
  final_answer: "There are 3 Rs in the word 'strawberry'."
}
```

## How does it work?

TLDR: `Schema-guided prompt`→`Stream XML`→`HTML parser`→`Data`

Under the hood, xmllm uses a specialized system prompt and a seeded-user prompt ([see prompts.mjs](./src/prompts.mjs)) that tells the LLM the structure of the XML it must output using your provided schemas (and optional hints). This prompting method has been tested with a variety of models, from Claude Haiku to Qwen2.5-7B. Once the stream starts coming in, xmllm uses a streaming HTML parser (htmlparser2) to extract the data then reflect it back to you in the structure of your schema. This data can be reflected in realtime or you can wait until the stream completes and then get the final value.

## Frailty & Errors:

LLMs are unquestionably _very_ liberal in what output they give you, despite our best efforts to constrain. Therefore xmllm follows the latter of Postel's Law: "Be liberal in what you accept". Whatever data exists in the shape specified by your schema will be given to you, and it is up to you what to do with it.

## Quick Start

```bash
# Install
npm install xmllm

# Configure your AI provider (at least one required)
export ANTHROPIC_API_KEY=your_key    # For Claude
export OPENAI_API_KEY=your_key       # For GPT-4
```

### Simplest Usage

The `simple()` function provides the easiest way to get structured data from AI, but lacks streaming. It is still a good starting point.

```javascript
import { simple } from 'xmllm';

// Get structured data in one line
const result = await simple(
  "What is 2+2?", 
  {
    answer: {
      value: Number,
      explanation: String
    }
  }
);

console.log(result);
// {
//   answer: {
//     value: 4,
//     explanation: "Basic addition of two plus two"
//   }
// }
```

### Streaming Usage

The `stream()` API offers a simple interface for streaming with or without a schema:

```javascript
import { stream } from 'xmllm';

// 1. NO SCHEMA: Use CSS selectors to manually extract things:
const thoughts = stream(`
  Share three deep thoughts about programming. Use a structure like:
  <thought>...</thought>
  <thought>...</thought> etc.
`)
  .select('thought')  // Select <thought> elements
  .text();            // Extract text content

for await (const thought of thoughts) {
  console.log('AI is thinking:', thought); // See thoughts as they arrive
}

// 2. SCHEMA: Structured Data:
const result = await stream('What is 2+2?', {
  schema: {
    answer: {
      value: Number,
      explanation: String
    }
  }
}).last(); // wait until the stream completes
```

## Core Features

**Streaming First**
- Process AI responses as they arrive
- Show real-time progress
- Handle partial updates

```javascript
// See updates in real-time:
for await (const color of stream('List colors as <color>...</color>').select('color')) {
  console.log(color.$text);       // "re", "red", "blu", "blue"
  console.log(color.$tagclosed);  // false, true, false, true
}
```

A more thorough example that uses a custom model and schema:

```javascript
const colors = [];
for await (
  const {color} of
    stream('List colors as <color>...</color>', {
      clientProvider: client,
      model: {
        inherit: 'togetherai',
        name: 'Qwen/Qwen2.5-7B-Instruct-Turbo',
        endpoint: 'https://api.together.xyz/v1/chat/completions',
        key: process.env.TOGETHER_API_KEY
      },
      schema: {
        color: Array(String)
      }
    }).closedOnly() // ensure tags are closed
) {
  colors = 
}
```

See more details in the [Streaming Guide](./docs/streaming.md).

**Schema-Based**
- Transform XML into structured data
- Type conversion & validation
- Flexible mapping options

```javascript
const schema = {
  analysis: {
    score: Number,
    tag: [String],
    details: {
      $lang: String,    // Attribute
      $text: String     // Text content
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
}, client).last()

// last() is a shortcut for getting the very final value
// i.e. the completed stream
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

* [Schema Guide](./docs/schemas.md)
* [Provider Setup](./docs/providers.md)
* [Stream Interface](./docs/stream.md)
* [Streaming with a Schema](./docs/schema_streaming.md)
* [Raw Streaming](./docs/raw_streaming.md)
* [Advanced Pipeline Guide](./docs/pipelines.md)
* [Complete API Reference](./docs/api.md)
* [TypeScript Types Guide](./docs/typescript.md)

## License

MIT 