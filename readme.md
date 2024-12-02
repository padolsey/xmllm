# xmllm

xmllm is a JS utility that makes it easy to get structured data from LLMs, using a boring, time-tested, semantically enriched human-writable/readable syntax that is resilient and forgiving of human-made (and thus, **LLM-made**) mistakes.

## XML *{through the eyes of a forgiving HTML parser.}*

*Why XML?* – XML allows LLMs to communicate naturally with the best merits of 'free prose' while still giving you structured data back. In contrast, the norm of deriving JSON from LLMs via 'Function Calling' or 'Tool Use' is (*anecdotally*) biased to more "robotic" transactional completions, arguably lacking some of the more fluid or creative higher-temperature prose we have come to value from language models. And they make streaming a headache. Markup languages like XML, however, excel at this.

---

Here's an example of a UI being progressively populated by a streaming LLM 'alien species' generator:

![XMLLM Demo](https://j11y.io/public_images/xmllm1.gif)

---

## Demo Repo

Fork and play with **[xmllm demos](https://github.com/padolsey/xmllm_demos)** (SOON: shall have this up and running publicly!)


## Provider-agnostic & high compliance on many models!

xmllm is able to be run against most conceivable endpoints since you can define [custom providers](./docs/providers.md). Out of the box we've hard-coded some models just to play with like Claude Haiku/Sonnet, GPT-4o (+mini), and Qwen2.5-7B-Instruct via TogetherAI.

In addition to OpenAI and Anthropic models, xmllm has impressive schema compliance on mid-to-low-param models like: Llama 3.1 8B, Qwen2.5-7B-Instruct-Turbo, Nous Hermes 2 Mixtral, Qwen 2.5 Coder 32B. And, where lacking, compliance can usually be improved by using `hints` in addition to [schemas](./docs/schemas.md) and a bit of experimental prompt-engineering.


Here's an example:

```javascript
const analysis = await stream(
  `
    How many Rs are in the word strawberry?
    Count the letters prior to your answer.
    And add in some philosophical stuff too.
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

The LLM responds naturally with XML:
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

Under the hood, xmllm uses a specialized system prompt and a seeded-user prompt ([see prompts.mjs](./src/prompts.mjs)) that tells the LLM the structure of the XML it must output using your provided schemas (and optional hints). This prompting method has been tested with a variety of models, from Claude Haiku to Qwen2.5-7B. Once the stream starts coming in, xmllm uses a streaming HTML parser (htmlparser2) to extract the data then reflect it back to you in the structure of your schema. This data can be reflected in real time or you can wait until the stream completes and then get the final value.

## Resilience & Errors:

LLMs are unquestionably _very_ liberal in what output they give you, despite our best efforts to constrain. Therefore xmllm follows the latter of Postel's Law: "Be liberal in what you accept". Whatever data exists in the shape specified by your schema will be given to you, and it is up to you what to do with it.

## Quick Start

```bash
# Install
npm install xmllm

# Set up environment variables
# Create a .env file:
ANTHROPIC_API_KEY=your_api_key
OPENAI_API_KEY=your_api_key
TOGETHERAI_API_KEY=your_api_key
PERPLEXITYAI_API_KEY=your_api_key
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
  },
  {
    model: {
      inherit: 'claude',
      name: 'claude-3-haiku-20240307',
      key: process.env.ANTHROPIC_API_KEY
    }
  }
);

console.log(result);
// {
//   answer: {
//     explanation: "Basic addition of two plus two",
//     value: 4
//   }
// }
```

### Streaming Usage

The `stream()` API offers a simple interface for streaming with or without a schema. Some examples:

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
```

---

```javascript
// 2. WITH A SCHEMA: Structured Data:
const result = await stream('What is 2+2?', {
  schema: {
    answer: {
      value: Number,
      explanation: String
    }
  }
}).last(); // wait until the stream completes
```

---

```javascript
// See updates in real-time:
for await (const color of stream('List colors as <color>...</color>').select('color')) {
  console.log(color.$text);       // "re", "red", "blu", "blue"
  console.log(color.$tagclosed);  // false, true, false, true
}
```

---

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
  colors.push(...color); // Add new colors to array
  console.log('Current colors:', colors);
}
```

See more details in the [Streaming Guide](./docs/streaming.md).

---

## Schemas!

xmllm uses schemas to transform XML into structured data.

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

## Provider-Agnostic / Max-configuration

xmllm supports multiple AI providers. You'll need at least one:

| Provider | Key | Models such as... |
|----------|-----|-----------|
| Claude | `ANTHROPIC_API_KEY` | Sonnet, Haiku, Opus |
| OpenAI | `OPENAI_API_KEY` | GPT-4o, GPT-4o-mini |
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

For browser environments, use the client interface with a proxy server so that your LLM API keys stay private. This is most useful for development and experimentation. Production apps should tbh keep all direct LLM interfacing on the server.

```javascript
import { stream, ClientProvider } from 'xmllm/client';

const client = new ClientProvider('http://localhost:3124/api/stream');

const result = await stream('Tell me a joke', {
  schema: { joke: String }
}, client).last()

// btw: last() is a shortcut for getting the very final value
// i.e. the completed stream
```

## Lower-level Pipeline API

xmllm provides a lower-level pipeline API for complex scenarios where you might want several stream-friendly transformations or generations to happen in a row.

Contrived example:

```javascript

let results = {};

const analysis = xmllm(({ prompt, promptClosed }) => [
  // First prompt gets a scientist
  // promptClosed means 'close the tags before yielding'
  promptClosed('Name a scientist', {
    scientist: {
      name: String,
      field: String
    }
  }, {
    model: DEFAULT_MODEL
  }),

  // Then we get a discovery in a distinct LLM inference
  promptClosed((incoming) => {
    results.scientist = incoming.scientist;
    return {
      messages: [{
        role: 'user',
        content: `What was ${incoming.scientist.name}'s biggest discovery?`,
      }],
      schema: {
        discovery: {
          year: Number,
          description: String
        }
      },
      model: DEFAULT_MODEL
    };
  }),

  // Combine results
  ({discovery}) => {
    // (we would have already stored scientist btw)
    results.discovery = discovery;
    return results;
  }
], clientProvider);

await analysis.last();
// {
//   "scientist": {
//     "name": "Albert Einstein",
//     "field": "Theory of Relativity"
//   },
//   "discovery": {
//     "year": 1905,
//     "description": "E=mc², the theory of relativity"
//   }
// }
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

## License

MIT 