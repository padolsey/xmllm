# xmllm: XML-based Language Model Pipeline

xmllm is a tool for creating LLM-driven pipelines.

> From me (the creator): I have found it useful in creating multi-'agent' LLM instantiations to solve more complex problems, where a single completion doesn't get the required results. LLMs suffer a lot from tunnel vision, so I've found it useful to break up tasks and do refinement/distillation loops to get to a final product. This library is my attempt at ~standardizing (for myself initially) this approach.

## Features

- Multi-step pipeline with native generator support (uses [streamops](https://github.com/padolsey/streamops))
- Reliable XML-based schema with prompting, parsing and mapping included

## Installation

```bash
npm install xmllm
```

## Quick Start

E.g.

```js
const xmllm = require('xmllm');

(async () => {
  const results = await xmllm(({ prompt }) => [
    prompt(
      'List three popular programming languages.',
      {
        language: [{
          name: String,
          type: String
        }]
      }
    )
  ]);

  console.log(results);
})();
```

This might output:

```json
[
  {
    "language": [
      {
        "name": "Python",
        "type": "Interpreted"
      },
      {
        "name": "JavaScript",
        "type": "Interpreted"
      },
      {
        "name": "Java",
        "type": "Compiled"
      }
    ]
  }
]
```

## Example

This example shows how to use xmllm for a multi-step analysis of a topic:

```javascript
const xmllm = require('xmllm');

(async () => {
  const results = await xmllm(({ prompt }) => [
    function* () {
      yield "Artificial Intelligence";
    },
    prompt(
      topic => `Provide three subtopics for "${topic}" from different perspectives: scientific, social, and economic.`,
      {
        subtopic: [{
          perspective: String,
          title: String
        }]
      }
    ),
    prompt(
      (thing) => {
        const { subtopic: [{ perspective, title }] } = thing;
        return `Give a brief explanation of "${title}" from a ${perspective} perspective, and suggest one potential future development.`;
      },
      {
        explanation: String,
        future_development: String
      }
    )
  ]);

  console.log(results);
})();
```
