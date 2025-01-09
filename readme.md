# xmllm

xmllm is a JS utility that makes it easy to get structured data from LLMs, using a boring, time-tested, semantically enriched human-writable/readable syntax that is resilient and forgiving of human-made (and thus, **LLM-made**) mistakes.

> **PLEASE:** This is experimental. However I <u>have</u> shipped fully operable apps with xmllm. But please have patience whenever trying to derive structured data from LLMs. It's not as deterministic as normal programming. You can find demos and examples in the [xmllm_demos](https://github.com/padolsey/xmllm_demos) repo. Shipped live at [xmllm.j11y.io](https://xmllm.j11y.io) if you want to have a play (rate-limited so apologies for any issues!)

> **I'm looking for collaborators and testers to help me improve this library**.

---

Simple example:

```javascript
import { simple, types } from 'xmllm';
await simple('fun pet names', {
  schema: { 
    name: types.items(types.string("Pet name")) 
  }
}); // => { name: ["Daisy", "Whiskers", "Rocky"] }
```

What actually happened:

```markdown
┌───────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐
│                   │     │     LLM generates       │     │      XML parsed to      │
│  "fun pet names"  │ ──▶ │   <name>Daisy</name>    │ ──▶ │  structured data via    │
│                   │     │  <name>Whiskers</name>  │     │ schema {name: [String]} │
│                   │     │    <name>Rocky</name>   │     │                         │
└───────────────────┘     └─────────────────────────┘     └─────────────────────────┘
 Prompt sent to LLM          LLM's natural output                Final result:
                                                        ["Daisy", "Whiskers", "Rocky"]
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

*Why XML?* – XML allows LLMs to communicate naturally with the best merits of 'free prose' while still giving you structured data back. In contrast, the norm of deriving JSON from LLMs via 'Function Calling' or 'Tool Use' is famously brittle. And (*anecdotally*) these approaches are biased to more "robotic" transactional completions, arguably lacking some of the more fluid or creative higher-temperature completions we have come to value from language models. And they make streaming a headache. Markup languages like XML, however, excel at these things.

---

Here's an example of a UI being progressively populated by a streaming LLM 'alien species' generator:

![XMLLM Demo](https://j11y.io/public_images/xmllm1.gif)

---

## Demo Repo

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

In addition to the big frontier models, xmllm has impressive schema compliance on mid-to-low-param models like: Llama 3.1 8B, Qwen2.5-7B-Instruct-Turbo, Nous Hermes 2 Mixtral, Qwen 2.5 Coder 32B. And, where lacking, compliance can usually be improved by using `hints` in addition to [schemas](https://github.com/padolsey/xmllm/blob/main/docs/schemas.md) and a bit of experimental prompt-engineering.

---

## Famous strawberry problem

Here's an example with a slightly more complex schema, which in this case lets us enforce some kind of structured chain-of-thought and the containment of a 'final answer':

```javascript
import { simple, types } from 'xmllm';

const analysis = await simple(
  `
    How many Rs are in the word strawberry?
    Count the letters prior to your answer.
  `,
  {
    schema: {
      approach: types.string("The approach you will use for counting"),
      letter: types.items({
        character: types.string("Current letter being analyzed"),
        is_r_letter: types.boolean("Whether this is the letter R")
          .withTransform(b => b === true)  // Ensure boolean
      }),
      final_answer: types.string("The complete answer with explanation")
    },
    model: 'openrouter:mistralai/ministral-3b',
    max_tokens: 1000
  }
);
```

The LLM responds naturally with XML:

```xml
<approach>To solve this problem, I will count the number of R/r letters 
in the word 'strawberry'.</approach>
<letter>
  <character>s</character>
  <is_r_letter>false</is_r_letter>
</letter>
<letter>
  <character>t</character>
  <is_r_letter>false</is_r_letter>
</letter>
<letter>
  <character>r</character>
  <is_r_letter>true</is_r_letter>
</letter>
<!-- ... more letters ... -->
<final_answer>There are 3 Rs in the word 'strawberry'.</final_answer>
```

Which transforms into structured data:

```javascript
{
  approach: "To solve this problem, I will first count...",
  letter: [
    {character: "s", is_r_letter: false},
    {character: "t", is_r_letter: false},
    {character: "r", is_r_letter: true},
    //....
  ],
  final_answer: "There are 3 Rs in the word 'strawberry'."
}
```

---

## ➠ [Model Compliance Dashboard](https://xmllm.j11y.io/model-testing)

View the [Model Compliance Matrix](https://xmllm.j11y.io/model-testing) to see how well xmllm works with different models and prompting strategies.

![Model Compliance](https://j11y.io/public_images/xmllm2.png)

## How does it work?

TLDR: `Schema-guided prompt`→`Stream XML`→`HTML parser`→`Data`

Under the hood, xmllm uses different [prompting strategies](docs/strategies.md), pairing custom system prompts and custom user/assistant pairings. These prompts tell the LLM the structure of the XML it must output using your provided schemas (and optional hints). This prompting method has been tested with a variety of models, including low param models like Ministral-3B and Qwen2.5-7B. Once the stream starts coming in, xmllm uses a lenient streaming HTML parser (htmlparser2) to extract the data then reflect it back to you in the structure of your schema. This data can be reflected in real time or you can wait until the stream completes and then get the final value.

## Resilience & Errors:

LLMs are usually quite flakey and unstructured in what output they give you, despite our best efforts to constrain. Therefore xmllm follows the latter of Postel's Law: "Be liberal in what you accept". The HTML parser will be flexible in what it accepts and so even if the XML is messy or non-contiguous, xmllm will still give you back what it finds.

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
    key: process.env.ANTHROPIC_API_KEY
  }
});

console.log(result);
// { answer: 4 }
```

### Streaming Usage

The `stream()` API offers a simple interface for streaming with or without a schema. Some examples:

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

// 3. WITH ENUMS: Enforce specific values
const analysis = await stream('Analyze the sentiment', {
  schema: {
    sentiment: types.enum("Overall sentiment", ['POSITIVE', 'NEUTRAL', 'NEGATIVE'])
      .withDefault('NEUTRAL'),
    confidence: types.number("Confidence score 0-1")
      .withTransform(n => Math.min(1, Math.max(0, n)))
      .withDefault(0)
  }
}).last();

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

---

Here's a more qualified example of the earlier color scenario where we're:

1. Defining a schema to increase compliance (i.e. more likely to get XML from the LLM)
2. Using `closedOnly()` prior to `select()` to ensure we'll only get tags when they're closed.
3. Configuring a custom model and provider (in this case, inheriting from the togetherai-style payloader).

```javascript
const colors = [];
for await (
  const {color} of
    stream('List colors as <color>...</color>', {
      model: {
        inherit: 'togetherai',
        name: 'Qwen/Qwen2.5-7B-Instruct-Turbo',
        endpoint: 'https://api.together.xyz/v1/chat/completions',
        key: process.env.TOGETHERAI_API_KEY
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

See more details in the [Streaming Guide](https://github.com/padolsey/xmllm/blob/main/docs/streaming.md).

---

## Schemas!

xmllm uses schemas to transform XML into structured data.

```javascript
const schema = {
  analysis: {
    score: types.number('The score'),
    tag: types.items(types.string('The tag')), // array of strings
    details: {
      $lang: types.string('The language'),     // Attribute
      $$text: types.string('The text content') // Text content
    }
  }
};
```

A schema is an object that indicates what kind of object you want _back_ from xmllm at the end of the process. So if you want an array of strings under the key 'color' you'll use: 

```javascript
{ color: types.items(types.string('The color')) }
```

This will give you something like:

```javascript
{ color: ['red', 'blue', 'green'] }
```

The **vital** thing when composing schemas with xmllm is to realize that each key you define becomes an XML element. So, we are using the key 'color' instead of 'colors' because we want this:

```xml
<color>red</color>
<color>blue</color>
<color>green</color>
```

And **NOT**:

```xml
<colors>red</colors>
<colors>blue</colors>
<colors>green</colors>
```

And as such the key on the returned data will be `color`, not `colors`. 

The best practice to avoid this mental overhead is to wrap a singular named array in a plurally named container, like this:

```javascript
schema = {
  colors: {
    color: types.items(types.string('The color'))
  }
}
```

... which would get you:

```xml
<colors>
  <color>red</color>
  <color>blue</color>
  <color>green</color>
</colors>
```

This makes things simpler usually.

For simplicity, there is also a `types.items()` as well which makes reasoning way simpler for lists of things. It works like this. If you want a list of strings, for example, you would do this:

```javascript
schema = {
  colors: types.items(types.string('a fun color'))
  // "a color" is a hint sent to the LLM
}
```

This would, behind the scenes, be asking the LLM for the following structure:

```xml
<colors>
  <item></item>
  <item></item>
  <item></item>
  /*etc*/
</colors>
```

**See more details in the [Schema Guide](https://github.com/padolsey/xmllm/blob/main/docs/schemas.md).**

## Provider-Agnostic / Max-configuration

xmllm supports multiple AI providers. You'll need at least one:

| Provider | Key | Models such as... |
|----------|-----|-----------|
| Anthropic (`anthropic`) | `ANTHROPIC_API_KEY` | Claude Sonnet, Haiku, Opus |
| OpenAI (`openai`) | `OPENAI_API_KEY` | GPT-4o, GPT-4o-mini |
| Together.ai (`togetherai`) | `TOGETHERAI_API_KEY` | Qwen, Mistral, Llama, etc. |
| Perplexity (`perplexityai`) | `PERPLEXITYAI_API_KEY` | Llama, Mistral, etc. |
| OpenRouter (`openrouter`) | `OPENROUTER_API_KEY` | Everything! |

See many more details in the [Provider Setup](https://github.com/padolsey/xmllm/blob/main/docs/providers.md) guide.

```javascript
// Configure at runtime or in an `.env` file
stream('My prompt goes here', {
  keys: { openrouter: process.env.OPENROUTER_API_KEY },
  model: 'openrouter:mistralai/ministral-3b'
})
```

## Browser Usage

For browser environments, use the client interface with a proxy server so that your LLM API keys stay private. This is most useful for development and experimentation. Production apps should tbh keep all direct LLM interfacing on the server.

```javascript
import { stream, ClientProvider } from 'xmllm/client';

const client = new ClientProvider('http://localhost:3124/api/stream');

const result = await stream('Tell me a joke', {
  schema: { joke: types.string('The joke') }
}, client).last()

// btw: last() is a shortcut for getting the very final value
// i.e. the completed stream
```

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

* [Schema Guide](https://github.com/padolsey/xmllm/blob/main/docs/schemas.md)
* [Provider Setup](https://github.com/padolsey/xmllm/blob/main/docs/providers.md)
* [Stream Interface](https://github.com/padolsey/xmllm/blob/main/docs/stream.md)
* [Streaming with a Schema](https://github.com/padolsey/xmllm/blob/main/docs/schema_streaming.md)
* [Raw Streaming](https://github.com/padolsey/xmllm/blob/main/docs/raw_streaming.md)
* [Prompt Strategies](docs/strategies.md)
* [Advanced Pipeline Guide](https://github.com/padolsey/xmllm/blob/main/docs/pipelines.md)
* [Complete API Reference](https://github.com/padolsey/xmllm/blob/main/docs/api.md)

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

## Alternative Parser: Idio

In addition to XML, xmllm supports an experimental configurable parser grammar "of your choide" called "Idio". Its default grammar is designed to clearly disambiguate between structural markers and content. This is particularly useful when your LLM output itself needs to contain markup things like XML. Obviously such a thing would confuse xmllm usually.

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

## License

MIT

