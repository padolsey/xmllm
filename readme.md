# xmllm: XML-based Language Model Pipeline

xmllm is a tool for creating LLM-driven pipelines.

## Features

- TODO

## Installation

\```bash
npm install xmllm
\```

## Quick Start

E.g.

\```javascript
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
\```

This might output:

\```json
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
\```

## Example

This example shows how to use xmllm for a multi-step analysis of a topic:

\```javascript
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
\```
