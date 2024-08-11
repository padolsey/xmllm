// import { Parser } from 'htmlparser2';
// import { selectOne, selectAll } from 'css-select';
const createStreaming = require('streeem');
const llmStream = require('./Stream.js');
const IncomingXMLParserSelectorEngine = require('./IncomingXMLParserSelectorEngine.js');

const streeem = createStreaming();

const req = (prompt, mapSelectionSchema) => async function*(thing) {

  console.log('Req called', {prompt, mapSelectionSchema, thing})

  let transformedPrompt = prompt;

  const mapSelectionSchemaScaffold =
    mapSelectionSchema &&
    IncomingXMLParserSelectorEngine
      .makeMapSelectXMLScaffold(mapSelectionSchema);

  console.log({thing, transformedPrompt, mapSelectionSchemaScaffold})

  if (typeof transformedPrompt == 'function') {
    transformedPrompt = transformedPrompt(thing);
    console.log('>Prompt w/ thing?', {transformedPrompt, thing});
  }

  if (mapSelectionSchemaScaffold) {
    transformedPrompt += `
The data you return should be approximately like this:
\`\`\`
${mapSelectionSchemaScaffold}
\`\`\`
    `;
  }

  const systemPrompt = `
You are an AI that only outputs XML. You accept an instruction just like normal and do your best to fulfil it. You can express your thinking, but use XML <thinking/> elements to do this.

You can output multiple results if you like.

E.g. if asked for several names, you could just return:
<name>sarah</name> <name>james</name>
etc.

Rule: you must return valid xml. 

All outputs begin with '<thinking>', followed by your output in XML. If the user doesn't specify an XML structure or certain tags, make an informed decision. Prefer content over attributes.
  `;

  console.log('>>PROMPT', transformedPrompt);

  if (!transformedPrompt.trim()) {
    throw new Error('we need a prompt');
  }

  const stream = await llmStream({
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: transformedPrompt
      },
      {
        role: 'assistant',
        content: '<thinking>'
      }
    ]
  });

  const reader = stream.getReader();

  let accrued = '<thinking>';
  let cancelled = false;

  yield accrued; // stuff so far.

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (cancelled || done) break;

      const text = new TextDecoder().decode(value);

      accrued += text;

      yield text;
    }

    console.log('ACCRUED\n\n>>>\n\n', accrued, '\n\n');
  } catch (e) {
    console.error('Error reading stream:', e);
  } finally {
    reader.releaseLock();
  }

};

async function xmllm(pipeline) {

  pipeline = pipeline.map((step, index) => {

    console.log('step??', step, step?.type === 'select');

    if (step?.__custom__) {
      return step.step;
    }

    return step;
  });

  pipeline.xmlps = pipeline.xmlps || new IncomingXMLParserSelectorEngine();

  console.log('Setting pipeline.xmlps', pipeline.xmlps)
  const s = streeem(pipeline);

  const items = [];
  for await (const item of s) {
    items.push(item);
    // console.log('Item??', item);
  }
  return items;
}

xmllm.req = req;

xmllm.prompt = (prompt, selectionSchema, mapper, fakeResponse) => {
  if (!selectionSchema) {
    return req(prompt);
  }
  return function*(input) {
    console.log('PDATA', input, 's>', selectionSchema)

    const reqPipeline = [
      function*() {
        if (input == null) {
          yield [undefined];
          return;
        }
        if (isComplexIterable(input)) {
          //i.e. not a string (strings are iterables)
          yield*input;
        } else {
          yield input;
        }
      },

      fakeResponse 
        ? function*() {
          // chunk the fake response
          yield* [fakeResponse]
        }
        : xmllm.req(prompt, selectionSchema),

      xmllm.mapSelect(selectionSchema)
    ];

    const pipeline = [

      xmllm(reqPipeline),

      // xmllm([
      //   fakeResponse 
      //     ? function*() {
      //       // chunk the fake response
      //       yield* [fakeResponse]
      //     }
      //     : xmllm.req(prompt, selectionSchema),

      //   xmllm.mapSelect(selectionSchema)
      // ]),

      async function*(output) {
        if (!isComplexIterable(input)) {
          if (isComplexIterable(output)) {
            for await (const x of output) {
              yield mapper ? mapper(input, x) : x;
            }
          } else {
            yield mapper ? mapper(input, output) : output;
          }
          return;
        }
        for await (const x of input) {
          console.log('inIndex', input, 'xx', x,' -> ', output);
          
          if (isComplexIterable(output)) {
            for await (const y of output) {
              yield mapper ? mapper(x, y) : x;
            }
          } else {
            yield mapper ? mapper(x, output) : output;
          }
        }
      }
    ];

    pipeline.xmlps = this.xmlps;
    reqPipeline.xmlps = this.xmlps;

    yield xmllm(pipeline);
  };
}

xmllm.mapSelect = (schema) => {
  return function* (chunk) {
    console.log('>>This_This', this.xmlps, this);
    this.xmlps.add([chunk].flat().join(''));
    let selection = this.xmlps.mapSelect(schema);
    // console.log('mapSelect->', chunk, '....', selection, ':::', Object.keys(selection).length);
    if (selection && Object.keys(selection).length) {
      yield selection;
    }
  }
};

xmllm.select = (selector, mapperFn = x => x) => {
  // const xmlps = new IncomingXMLParserSelectorEngine();
  return function* (chunk) {

    this.xmlps.add([chunk].flat().join(''));

    const selection = this.xmlps.dedupeSelect(selector);
    if (selection?.length) {
      yield* selection.map(mapperFn);
    }
  }
};

module.exports = xmllm;


function isComplexIterable(obj) {
  return obj != null && 
    (
      typeof obj[Symbol.iterator] === 'function' ||
      typeof obj[Symbol.asyncIterator] === 'function'
    ) &&
      typeof obj !== 'string' &&
      typeof obj !== 'number' &&
      typeof obj !== 'boolean' &&
      typeof obj !== 'symbol';
}
// main advantages over function-calling/json

// - chain of thought more intact
// - more forgiving while still being a fixed schema
// - (can yield to you for finer grained decisions on filtering)
// - quicker to get results and instigate other requests
// - no absolute failure
// - ordering can be more easily defined  