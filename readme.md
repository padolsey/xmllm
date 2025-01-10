# xmllm

xmllm is a JS utility that makes it easy to get structured data from LLMs, using a boring, time-tested, semantically enriched human-writable/readable syntax that is resilient and forgiving of human-made (and thus, **LLM-made**) mistakes.

> **PLEASE:** This is experimental. However I <u>have</u> shipped fully operable apps with xmllm. But please have patience whenever trying to derive structured data from LLMs. It's not as deterministic as normal programming. You can find demos and examples in the [xmllm_demos](https://github.com/padolsey/xmllm_demos) repo, shipped live at [xmllm.j11y.io](https://xmllm.j11y.io) if you want to have a play (rate-limited so apologies for any issues!)

> **I'm looking for collaborators and testers to help me improve this library**.

---

Simple example:

```javascript
import { simple, types } from 'xmllm';
const names = await simple('fun pet names', {
  schema: {
    name: [String]
  }
});

names; // => { name: ["Daisy", "Whiskers", "Rocky"]

// FYI Using `[String]` as a schema value
// is a shortcut for `types.items(types.string())`.
```



What actually happened:

```markdown
┌─────────────────────────┐
│                         │
│     "fun pet names"     │
│                         │
└───┬─────────────────────┘
    │
    │ Your prompt is sent to the configured LLM with
    │ xmllm's strategic system prompt of your choice,
    │ plus schema instructions and examples
    │
    ▼
┌─────────────────────────┐
│     LLM generates       │
│   <name>Daisy</name>    │
│  <name>Whiskers</name>  │
│    <name>Rocky</name>   │
└───┬─────────────────────┘
    │
    │ LLM's natural output parsed
    │
    ▼
┌─────────────────────────┐
│      XML parsed to      │
│  structured data via    │
│ schema {name: [String]} │
└───┬─────────────────────┘
    │
    │ Data transformed & validated
    │
    ▼
┌────────────────────────┐
│ Final result:          │
│ {                      │
│   name: [              │
│     "Daisy",           │
│     "Whiskers",        │
│     "Rocky"            │
│   ]                    │
│ }                      │
└────────────────────────┘
```

### Even messy XML is recoverable!

Because xmllm uses a rather flexible HTML parser, even LLMs providing weird flourishes or non-contiguous XML will still be able to be parsed, e.g.

```markdown
    Hi im a plucky    and annoying
    little llm and sure i can
    help with      your request for 
    PET NAMES, how about <name>
    Charlie</name> or
    maybe <name>Bella </ IM MESSING THINGS UP ></name>
    <name>King
    Julian
```

... from which we can still recover:

```javascript
{
  name: ['Charlie', 'Bella', 'King Julian']
}
```

---

## XML *{through the eyes of a forgiving HTML parser.}*
### (Why not function-calling or 'tool use'?)

*Why XML?* – XML allows LLMs to communicate naturally with the best merits of 'free prose' while still giving you structured data back. In contrast, the norm of deriving JSON from LLMs via 'Function Calling' or 'Tool Use' is famously brittle. Such APIs are also only available with some providers and models.

And–*anecdotally*–JSON, by nature of where it usually appears in training data, will bias the LLM to more "robotic" transactional completions, arguably lacking some of the more fluid or creative higher-temperature completions we have come to value from language models. Such abstractions also make streaming a headache. Markup languages like XML and HTML, however, excel at all of these weaknesses.

---

As an example of how fluid an xmllm stream can be, here's an example of a UI being progressively populated by a streaming LLM 'alien species' generator (code [here](https://github.com/padolsey/xmllm_demos/blob/main/src/app/fluid/species/page.tsx)):

![XMLLM Demo](https://j11y.io/public_images/xmllm1.gif)

---

## Demo and Sandbox

Fork and play with the **[xmllm demos](https://github.com/padolsey/xmllm_demos)** repo, or:

### 🔥 See it live here: **[xmllm.j11y.io](https://xmllm.j11y.io)**

## Provider-agnostic & high compliance on many models!

xmllm is able to be run against most conceivable endpoints since you can define [custom providers](https://github.com/padolsey/xmllm/blob/main/docs/providers.md). We define some providers out of the box like `anthropic`, `openai`, `openrouter`, `togetherai`, `perplexityai`. You will usually put the API keys in a `.env` file but you can also put them inline. Additionally, if you're worried about rate limits or random failures, you can define fallback models.

```javascript
stream('fun pet names', {
  schema: {
    name: Array(String)
  },

  // If I am super cautious about network or LLM provider stability,
  // I can define fallback models:
  model: [
    // Preferred model:
    'openrouter:mistralai/ministral-3b',
    // Fallback models:
    'anthropic:claude-3-haiku-20240307',
    'togetherai:Qwen/Qwen2.5-7B-Instruct-Turbo',
    // Super-custom fallback model: 
    {
      inherit: 'openai', // indicating open-ai endpoint compatibility
      endpoint: 'https://api.myCustomLLM.com/v1/chat/completions',
      key: 'sk-...'
    }
  ]
});
```

Out of the box, only some providers are configured:

| Provider | Key | Models such as... |
|----------|-----|-----------|
| Anthropic (`anthropic`) | `ANTHROPIC_API_KEY` | Claude Sonnet, Haiku, Opus |
| OpenAI (`openai`) | `OPENAI_API_KEY` | GPT-4o, GPT-4o-mini |
| Together.ai (`togetherai`) | `TOGETHERAI_API_KEY` | Qwen, Mistral, Llama, etc. |
| Perplexity (`perplexityai`) | `PERPLEXITYAI_API_KEY` | Llama, Mistral, etc. |
| OpenRouter (`openrouter`) | `OPENROUTER_API_KEY` | Everything! |

In regards to schema compliance xmllm has impressive results on mid-to-low-param models like: Llama 3.1 8B, Qwen2.5-7B-Instruct-Turbo, Nous Hermes 2 Mixtral, Qwen 2.5 Coder 32B. And, where lacking, compliance can usually be improved by using `hints` in addition to [schemas](https://github.com/padolsey/xmllm/blob/main/docs/schemas.md) and by experimenting with configuring different [strategies](https://github.com/padolsey/xmllm/blob/main/docs/strategies.md).

See many more details in the [Provider Setup](https://github.com/padolsey/xmllm/blob/main/docs/providers.md) guide.

---

## EXAMPLE: Sentiment Analysis, Proceduralized

This example demonstrates how to use LLMs in a programmatic way to analyze customer sentiment, extracting structured insights from natural text:

```javascript
const analysis = await simple(
  `
    Analyze this customer review:
    "I absolutely love the new smartphone. The camera quality is outstanding, 
    but the battery life sucks!"
  `,
  {
    schema: {
      sentiment: types.enum(
        "Overall sentiment",
        ["POSITIVE", "NEUTRAL", "NEGATIVE"]
      ),
      pros: types.items(types.string("Positive aspects")),
      cons: types.items(types.string("Negative aspects")),
      summary: types.string("Brief analysis explanation")
    },
    model: 'openrouter:mistralai/ministral-3b',
    max_tokens: 1000
  }
);
```

The LLM responds naturally with XML:

```xml
<sentiment>POSITIVE</sentiment>
<pros>
  <item>Outstanding camera quality</item>
  <item>Overall positive user experience</item>
</pros>
<cons>
  <item>Battery life needs improvement</item>
</cons>
<summary>The review indicates a predominantly positive experience, 
with particular praise for the camera. While there is criticism 
about battery life, it doesn't overshadow the overall 
positive sentiment.</summary>
```

Which transforms into structured data:

```javascript
{
  sentiment: "POSITIVE",
  pros: [
    "Outstanding camera quality",
    "Overall positive user experience"
  ],
  cons: [
    "Battery life needs improvement"
  ],
  summary: "The review indicates a predominantly positive experience..."
}
```

---

## ➠ [Model Compliance Dashboard](https://xmllm.j11y.io/model-testing)

View the [Model Compliance Matrix](https://xmllm.j11y.io/model-testing) to see how well xmllm works with different models and prompting strategies.

![Model Compliance](https://j11y.io/public_images/xmllm2.png)

## How does it work?

Under the hood, xmllm uses different [prompting strategies](docs/strategies.md), pairing custom system prompts and custom user/assistant pairings. These prompts tell the LLM the structure of the XML it must output using your provided schemas (and optional hints).

These different prompt strategies have been tested with a variety of models, including low param models like Ministral-3B and Qwen2.5-7B. You can test these out yourself in the [Model Testing Dashboard](https://xmllm.j11y.io/model-testing).

Once the stream starts coming in, xmllm uses a lenient streaming HTML parser (htmlparser2) to extract the data then reflect it back to you in the structure of your schema. This data can be reflected in real time or you can wait until the stream completes and then get the final value. There's an optional non-XML parser if you want to use something more resilient to your needs.

## Resilience & Errors:

LLMs are usually quite flakey and unstructured in what output they give you, despite our best efforts to constrain. Therefore xmllm follows the latter of Postel's Law: "Be liberal in what you accept". The HTML parser will be flexible in what it accepts and so even if the XML is messy or non-contiguous, xmllm will still give you back what it finds.

## Quick Start

```bash
# Install
npm install xmllm

# Set up environment variables with an .env file
# (These will be read automatically, or you can configure
# keys yourself when submitting requests)

ANTHROPIC_API_KEY=your_api_key
OPENAI_API_KEY=your_api_key
TOGETHERAI_API_KEY=your_api_key
PERPLEXITYAI_API_KEY=your_api_key
OPENROUTER_API_KEY=your_api_key
```

### Simplest Usage

The `simple()` function provides the easiest way to get structured data from AI.

```javascript
import { simple, types } from 'xmllm';

// Updated usage with options object and type hints
const result = await simple("What is 2+2?", {
  schema: { 
    answer: types.number("The numerical result")
      .withTransform(n => Math.floor(n))  // Ensure whole number
  },
  model: {
    inherit: 'anthropic',
    name: 'claude-3-haiku-20240307',
    // key: "custom api key" // or it will use the env var
  }
});

console.log(result);
// { answer: 4 }
```

### Streaming Usage

The `stream()` API offers the same interface but for streaming with or without a schema. Some examples:

```javascript
import { stream, types } from 'xmllm';

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

// 2. WITH A SCHEMA: Structured Data with Type Hints:
const result = await stream('What is 2+2?', {
  schema: {
    answer: {
      value: types.number("The numerical result")
        .withTransform(n => Math.floor(n)),
      explanation: types.string("Step-by-step explanation")
        .withTransform(s => s.trim())
    }
  }
}).last();
// ^ the .last() methods will wait for the end of the
// stream and give you the final value of the aggregate data

// 3. WITH ENUMS: Enforce specific values
const sentiment = types.enum(
  'Overall sentiment', // hint
  ['POSITIVE', 'NEUTRAL', 'NEGATIVE'] // enum values
).withDefault('NEUTRAL');

const confidence = types.number("Confidence score 0-1")
  .withTransform(n => Math.min(1, Math.max(0, n)))
  .withDefault(0);

const analysis = await stream(
  'Analyze the sentiment of this text: "I am happy"',
  { schema: { sentiment, confidence } }
).last();

console.log(analysis);
// { sentiment: 'POSITIVE', confidence: 0.9 }

// 4. WITH DEFAULTS IN CASE OF NO XML FOR THAT VALUE:
const userProfile = await stream('Create a user profile', {
  schema: {
    user: {
      name: types.string("User's full name")
        .withDefault("Anonymous"),
      age: types.number("Age in years")
        .withTransform(n => Math.max(0, Math.floor(n)))
        .withDefault(0),
      status: types.enum("Account status", ['ACTIVE', 'PENDING', 'INACTIVE'])
        .withDefault('PENDING')
    }
  }
}).last();
```

See more details in the [Streaming Guide](https://github.com/padolsey/xmllm/blob/main/docs/streaming.md).

---

## Schemas!

Per the examples above, xmllm uses schemas to transform stuff generated by LLMs into structured data. These schemas both serve to instruct the LLM what we _ideally_ want it to generate (xmllm helps you by asking [extra politely](https://github.com/padolsey/xmllm/blob/main/docs/strategies.md)) and also to instruct xmllm how to transform the data post-generation.

```javascript
const schema = {
  analysis: {
    score: types.number('The score').withDefault(0),
    tags: types.items(types.string('The tag')), // array of strings
    details: {
      $lang: types.string('The language'),     // Attribute
      $$text: types.string('The text content') // Text content
    }
  }
};
```

Behind the scenes, this schema, in combination with one of [our strategies](https://github.com/padolsey/xmllm/blob/main/docs/strategies.md), might produce a prompt for the LLM like this:

```
{{ xmllm instructions }}

{{ the actual prompt you are sending to the LLM }}

{{ other instructions }}

Examplar scaffold XML:

E.g.
<analysis>
  <score>{Number: The score}</score>
  <tags>
    <item>{String: The tag}</item>
    <item>{String: The tag}</item>
    /* etc. */
  </tags>
  <details lang="{String: The language}">
    {String: The text content}
  </details>
</analysis>
```

**See many more details about how schemas and scaffolders work in the [Schema Guide](https://github.com/padolsey/xmllm/blob/main/docs/schemas.md).**

## Browser Usage

For browser environments, use the `xmllm/client` module and `ClientProvider` interface with a proxy server so that your LLM API keys stay private. This is most useful for development and experimentation. Production apps should (tbh) keep all direct LLM interfacing on the server anyway (to avoid rate limit issues, jailbreaking, other bad-actor vibes), but this is a good way to get started.

```javascript
import { stream, ClientProvider } from 'xmllm/client';

const client = new ClientProvider('http://localhost:3124/api/stream');

const result = await stream('Tell me a joke', {
  schema: { joke: types.string('The joke') }
}, client).last()

// btw: last() is a shortcut for getting the very final value
// i.e. the completed stream
```

## Alternative Parser: Idio

In addition to XML, xmllm supports an experimental configurable parser grammar  called "Idio". Its default grammar (_example below_) is designed to clearly disambiguate between structural markers and content. This is particularly useful when your LLM output itself needs to contain markup or special characters like HTML (_ironically_). Obviously such a thing would confuse xmllm usually due to its reliance on XML.

The default grammar of Idio is as follows:

```javascript
@START(greeting)Hello world@END(greeting)

@START(colors)
  @START(color)Red@END(color)
  @START(color)Blue@END(color)
@END(colors)
```

You can configure xmllm to use the Idio parser globally:

```javascript
import { configure } from 'xmllm';

configure({
  globalParser: 'idio'
});
```

This will mean it ignores XML and sees it just as regular content/prose, meaning you can do stuff like this:

```javascript
configure({
  globalParser: 'idio'
})

simple('Make me "hello world" in HTML', {
  schema: {
    html: types.string('The HTML')
  }
})

// LLM Raw Output:
// @START(html)
// <h1>hello world</h1>
// @END(html)

// Result:
// { html: '<h1>hello world</h1>' }
```

See [Idio Syntax Guide](docs/idio-syntax.md) for more details.

## Lower-level Pipeline API

xmllm provides a lower-level pipeline API for complex scenarios where you might want several stream-friendly transformations or generations to happen in a row.

Contrived example:

```javascript
import { pipeline } from 'xmllm';

let results = {};

const analysis = pipeline(({ prompt, promptClosed }) => [
  // First prompt gets a scientist
  // promptClosed means 'close the tags before yielding'
  promptClosed('Name a scientist', {
    scientist: {
      name: types.string('The scientist\'s name'),
      field: types.string('The scientist\'s field')
    }
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
          year: types.number('The year of the discovery'),
          description: types.string('The description of the discovery')
        }
      }
    };
  }),

  // Combine results
  ({discovery}) => {
    // (we would have already stored scientist btw)
    results.discovery = discovery;
    return results;
  }
]);

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

See the [Pipeline Guide](https://github.com/padolsey/xmllm/blob/main/docs/pipelines.md) for more advanced usage like parallel processing, complex transformations, and error handling.

## In-Depth Documentation

### Guides & Concepts
* [Schema Guide](docs/schemas.md) - Working with schemas and types
* [Provider Setup](docs/providers.md) - Configure AI providers and models
* [Streaming Guide](docs/streaming-guide.md) - Real-time processing patterns
* [Prompt Strategies](docs/strategies.md) - Optimize AI prompting
* [Pipeline Guide](docs/pipelines.md) - Complex processing chains
* [Idio Syntax Guide](docs/idio-syntax.md) - Alternative to XML parsing

### API Reference
* [API Overview](docs/api/readme.md) - Quick reference
* [Core Functions](docs/api/core.md) - Main API functions
* [Stream API](docs/api/stream.md) - Streaming interface
* [Schema Types](docs/api/schema-types.md) - Type system reference
* [Pipeline API](docs/api/pipeline.md) - Pipeline operations
* [Error Handling](docs/api/errors.md) - Error types and handling
* [Configuration](docs/api/configuration.md) - Global and request config

## Installing

```bash
npm install xmllm
# or
pnpm add xmllm
# or
yarn add xmllm
```

## Importing

xmllm supports both ESM and CommonJS imports:

```javascript
// ESM (recommended)
import { simple, stream } from 'xmllm';

// CommonJS
const { simple, stream } = require('xmllm');

// Alternative CommonJS if you have issues
const xmllm = require('xmllm');
const { simple, stream } = xmllm;
```

## License

MIT
