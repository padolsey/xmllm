# xmllm

xmllm lets you have natural, structured conversations with AI language models. Instead of forcing AI responses into rigid function calls, xmllm works with the natural way LLMs communicate - through semantically rich, flowing text - while still giving you structured data that's ready to use in your application.

## Why xmllm?

Traditional approaches to structured AI responses often use "function calling" or "tools" APIs. These force LLMs to work against their strengths, squeezing rich responses into predetermined function signatures.

xmllm takes a different approach:
1. Let the LLM respond naturally in a semantically meaningful way
2. Guide the structure through simple XML schemas
3. Transform the results into exactly the data structures you need

## Quick Start

```javascript
import { xmllm } from 'xmllm';

// With API keys from environment
const stream = xmllm(({ p: prompt }) => [
  p(
    "What's the weather like in London and Paris?",
    {
      cities: {
        city: [{
          name: String, // equivalent to `(text) => text`
          temp: text => parseInt(text),
          conditions: String
        }]
      }
    }
  )
]);

// Get back structured data:
for await (const result of stream) {
  console.log(result);
  // {
  //   cities: {
  //     city: [
  //       { name: "London", temp: 18, conditions: "cloudy with light rain" },
  //       { name: "Paris", temp: 22, conditions: "partly sunny" }
  //     ]
  //   }
  // }
}
```

### Client-Side Usage

For browser environments, use the proxy server to handle API keys:

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

## Core Concepts

### Schemas and Data Flow

Schemas define both the expected XML structure and how you'll receive the data in your pipeline. When using repeating elements (arrays), use the singular form as that's how you'll access the data:

```javascript
const stream = xmllm(({ p }) => [
  p('List three colors', {
    'color[]': String  // Note: singular 'color', not 'colors'
  }),
  async function*(chunk) {
    console.log(chunk);
    // Chunks might look like:
    // { color: ['red'] }                    // Complete color
    // { color: ['blue', 'green'] }          // Two complete colors
    // { color: ['yellow (still typing)'] }  // Incomplete color
    yield chunk;
  }
]);

// With promptClosed (pc), you'll get complete elements only:
const stream = xmllm(({ pc }) => [
  pc('List three colors', {
    'color[]': String
  }),
  async function*(chunk) {
    console.log(chunk);
    // Will only receive complete colors:
    // { color: ['red', 'blue', 'green'] }
    yield chunk;
  }
]);
```

This pattern applies to nested structures too:

```javascript
const stream = xmllm(({ p }) => [
  p('List cities and their landmarks', {
    'city[]': {            // Matches <city> elements
      name: String,
      'landmark[]': {      // Matches <landmark> elements within <city>
        name: String,
        year: Number
      }
    }
  }),
  async function*(chunk) {
    console.log(chunk);
    // Might receive:
    // {
    //   city: [{
    //     name: 'Paris',
    //     landmark: [{
    //       name: 'Eiffel Tower',
    //       year: 1889
    //     }]
    //   }]
    // }
    yield chunk;
  }
]);
```

The key points:
1. Use singular names in schemas (`'city[]'` not `'cities[]'`)
2. Access data using the same singular names (`chunk.city` not `chunk.cities`)
3. With `prompt`/`p`, you may receive partial results as they stream in
4. With `promptClosed`/`pc`, you'll only receive complete elements

### Schema Design Best Practices

1. Use singular nouns for repeating elements:
   ```javascript
   // Good - matches XML semantics:
   {
     'city[]': {  // Will match multiple <city> elements
       name: String,
       'email[]': String  // Will match multiple <email> elements
     }
   }

   // Bad - confusing and doesn't match XML conventions:
   {
     'cities[]': {  // Would expect multiple <cities> elements?
       name: String,
       'emails[]': String  // Would expect multiple <emails> elements?
     }
   }
   ```

2. Keep schemas flat when possible
3. Use transformers for data conversion:
   ```javascript
   {
     temperature: Number,  // Converts to number
     email: text => text.toLowerCase(),  // Custom transformation
     active: text => text === 'true'  // Convert to boolean
   }
   ```

4. Use attributes for metadata:
   ```javascript
   {
     message: {
       $id: Number,  // Matches id attribute
       $type: String,  // Matches type attribute
       _: String  // Matches element content
     }
   }
   ```

### Pipelines

Pipelines are arrays of generator functions that process data step by step:

```javascript
const stream = xmllm(({ p, m, f }) => [
  // 1. Get data from AI
  p('List three colors'),
  
  // 2. Transform results
  m(colors => colors.map(c => c.toUpperCase())),
  
  // 3. Filter if needed
  f(c => c.length > 0)
]);
```

### Streaming

xmllm processes XML in chunks as it arrives from the AI. You can handle this in two ways:

```javascript
// 1. Get all results (closed tags only)
const stream = xmllm(({ pc }) => [
  pc(
    'Generate a story',
    {
      story: {
        title: String,
        content: String
      }
    }
  )
]);

// 2. Get partial results as they arrive
const stream = xmllm(({ p }) => [
  p(
    'Generate a story',
    {
      story: {
        title: String,
        content: String
      }
    }
  )
]);
```

## Advanced Features

### Pipeline Operations

xmllm provides a rich set of pipeline operations with short aliases:

```javascript
const stream = xmllm(({ 
  p,    // prompt
  pc,   // promptClosed
  ms,   // mapSelect
  msc,  // mapSelectClosed
  s,    // select
  m,    // map
  f,    // filter
  r,    // reduce
  a,    // accrue
  t,    // tap
  w,    // waitUntil
  ma    // mergeAggregate
}) => [
  // Your pipeline here
]);
```

### Result Accumulation

Collect and process multiple results:

```javascript
const stream = xmllm(({ p, a, r }) => [
  p('Generate 3 random numbers'),
  a(),  // Collect all results
  r((acc, nums) => acc + nums.reduce((s,n) => s + n, 0), 0)
]);
```

### Parallel Processing

Run multiple prompts in parallel:

```javascript
const stream = xmllm(({ p, ma }) => [
  [
    p('List colors'),
    p('List shapes')
  ],
  ma((colors, shapes) => ({
    combinations: colors.flatMap(c => 
      shapes.map(s => `${c} ${s}`)
    )
  }))
]);
```

### Provider Configuration

Use multiple providers with fallbacks:

```javascript
const stream = xmllm(({ p }) => [
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

### Custom Endpoints

Add your own OAI-compatible endpoints:

```javascript
const stream = xmllm(({ p }) => [
  p({
    messages: [...],
    model: [{
      inherit: 'openai',
      name: 'local-llama',
      endpoint: 'http://localhost:8000/v1/chat/completions',
      key: 'local-key'
    }]
  })
]);
```

## Best Practices

### Schema Design
1. Use elements over attributes for main data
2. Keep schemas flat when possible
3. Use arrays with [] suffix
4. Make transformers pure functions

### Pipeline Design
1. Keep pipelines focused and composable
2. Handle errors appropriately
3. Use streaming consciously
4. Consider resource constraints

### Error Handling
```javascript
try {
  const stream = xmllm(({ p }) => [...]);
  
  for await (const chunk of stream) {
    try {
      console.log(chunk);
    } catch (error) {
      console.error('Processing error:', error);
    }
  }
} catch (error) {
  console.error('Pipeline error:', error);
}
```

## License

MIT