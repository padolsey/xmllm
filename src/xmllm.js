const createStreaming = require('streamops');
const llmStream = require('./Stream.js');
const IncomingXMLParserSelectorEngine = require('./IncomingXMLParserSelectorEngine');
const Logger = require('./Logger');

const logger = new Logger('xmllm');

async function* xmllm(pipelineFn, {timeout} = {}) {

  logger.log(`[${new Date().toISOString()}] xmllm started`);

  const streamops = createStreaming({
    timeout: timeout || 1e6
  });

  if (typeof pipelineFn !== 'function') {
    throw new Error('You must pass a function to xmllm - and that function must return a pipeline array.');
  }

  const xmlps = new IncomingXMLParserSelectorEngine();
  const pipeline = pipelineFn({
    // pass xmllm interface/methods
    req,
    prompt,
    mapSelect,
    select,
    reduce: streamops.reduce,
    filter: streamops.filter
  });

  if (!Array.isArray(pipeline)) {
    throw new Error('Pipeline creator function must return an array.');
  }

  const stream = streamops(pipeline);
  yield*stream;

  logger.log(`[${new Date().toISOString()}] xmllm finished`);

  function req(prompt, mapSelectionSchema) {

    return async function*(thing) {

      logger.log(`[${new Date().toISOString()}] req started`);

      logger.dev('Req called', {prompt, mapSelectionSchema, thing})

      let transformedPrompt = prompt;

      const mapSelectionSchemaScaffold =
        mapSelectionSchema &&
        IncomingXMLParserSelectorEngine
          .makeMapSelectXMLScaffold(mapSelectionSchema);

      logger.dev({thing, transformedPrompt, mapSelectionSchemaScaffold})

      if (typeof transformedPrompt == 'function') {
        transformedPrompt = transformedPrompt(thing);
        logger.dev('>Prompt w/ thing?', {transformedPrompt, thing});
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

    Rule: you must return valid xml. If using angle-braces or other HTML/XML characters within an element, you should escape these, e.g. '<' would be '&lt;' UNLESS you are trying to demarkate an actual XML tag. E.g. if you were asked to produce HTML code, within an <html> tag, then you would do it like this: <html>&lt;div&gt;etc.&lt;/div&gt;</html>

    All outputs begin with '<thinking>', followed by your output in XML. If the user doesn't specify an XML structure or certain tags, make an informed decision. Prefer content over attributes.
      `;

      logger.dev('>>PROMPT', transformedPrompt);

      if (!transformedPrompt.trim()) {
        throw new Error('we need a prompt');
      }

      logger.log(`[${new Date().toISOString()}] llmStream called`);
      const stream = await llmStream({
        max_tokens: 4000,
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
      logger.log(`[${new Date().toISOString()}] llmStream returned, starting to read`);

      const reader = stream.getReader();

      let accrued = '<thinking>';
      let cancelled = false;

      yield accrued; // stuff so far.

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (cancelled || done) break;

          const text = new TextDecoder().decode(value);
          logger.log(`[${new Date().toISOString()}] Yielding chunk of length ${text.length}`);

          accrued += text;

          yield text;
        }

        // logger.dev('ACCRUED\n\n>>>\n\n', accrued, '\n\n');
      } catch (e) {
        logger.error(`[${new Date().toISOString()}] Error reading stream:`, e);
      } finally {
        logger.log(`[${new Date().toISOString()}] req finished`);
        reader.releaseLock();
      }

    };
  }

  function prompt(prompt, selectionSchema, mapper, fakeResponse) {

    if (!selectionSchema) {
      return req(prompt);
    }

    const results = {};

    return async function*(input) {

      logger.log(`[${new Date().toISOString()}] prompt started`);

      logger.dev('PDATA', input, 's>', selectionSchema)

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

        function*(x) {
          logger.dev('Initial Response yield', x);
          yield x;
        },

        fakeResponse 
          ? function*() {
            // chunk the fake response
            yield* [fakeResponse]
          }
          : req(prompt, selectionSchema),

        function*(x) {
          logger.dev('Secondary Response yield', x);
          yield x;
        },

        mapSelect(selectionSchema)
      ];

      const pipeline = [

        xmllm(() => reqPipeline),

        async function*(output) {
          logger.log(`[${new Date().toISOString()}] Starting to process output`);
          logger.log('Output>>>>', input, output, isComplexIterable(input), isComplexIterable(output));
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
            logger.dev('inIndex', input, 'xx', x,' -> ', output);
            
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
      logger.log(`[${new Date().toISOString()}] Calling inner xmllm`);
      for await (const item of xmllm(() => pipeline)) {
        logger.log('Main yield result', item);
        yield item;
      }

      logger.log(`[${new Date().toISOString()}] prompt finished`);
    };
  }

  function mapSelect(schema) {
    return function* (chunk) {
      xmlps.add([chunk].flat().join(''));
      let selection = xmlps.mapSelect(schema);
      // logger.dev('mapSelect -> chunk:', chunk);
      // logger.dev('mapSelect -> selection:', selection);
      if (selection && Object.keys(selection).length) {
        yield selection;
      } else {
        logger.dev('mapSelect -> No selection yielded');
      }
    }
  }

  function select(selector, mapperFn = x => x) {
    return function* (chunk) {

      logger.log(`[${new Date().toISOString()}] select called with chunk length ${chunk.length}`);

      xmlps.add([chunk].flat().join(''));

      const selection = xmlps.dedupeSelect(selector);
      if (selection?.length) {
        yield* selection.map(mapperFn);
      }
    }
  };
}


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
// - more value and better results, less tunnel vision