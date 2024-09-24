import createStreaming from 'streamops';
import IncomingXMLParserSelectorEngine from './IncomingXMLParserSelectorEngine.mjs';
import Logger from './Logger.mjs';

const logger = new Logger('xmllm');

async function* xmllmGen(pipelineFn, {timeout, llmStream} = {}) {

  const streamops = createStreaming({
    timeout: timeout || 1e6
  });

  if (typeof pipelineFn !== 'function') {
    throw new Error('You must pass a function to xmllm - and that function must return a pipeline array.');
  }

  const xmlps = new IncomingXMLParserSelectorEngine();
  const pipeline = pipelineFn({
    xmlReq,
    req,
    prompt,
    mapSelect,
    select,
    reduce: streamops.reduce,
    filter: streamops.filter,
    map: streamops.map,
    mergeAggregate: streamops.mergeAggregate
  });

  if (!Array.isArray(pipeline)) {
    throw new Error('Pipeline creator function must return an array.');
  }

  const stream = streamops(pipeline);
  yield* stream;

  function req(config) {
    return async function*(thing) {
      let transformedConfig = config;

      if (typeof transformedConfig == 'function') {
        transformedConfig = transformedConfig(thing);
      }

      const {
        system,
        messages
      } = transformedConfig;

      if (!messages.length) {
        throw new Error('Must be at least one message');
      }

      const stream = await (llmStream)({
        max_tokens: 4000,
        messages: [
          {
            role: 'system',
            content: system || ''
          },
          ...(messages || [])
        ]
      });

      const reader = stream.getReader();

      let accrued = config.accrued || '';
      let cancelled = false;

      yield accrued;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (cancelled || done) break;

          const text = new TextDecoder().decode(value);

          accrued += text;

          yield text;
        }
      } catch (e) {
        logger.error(`Error reading stream:`, e);
      } finally {
        reader.releaseLock();
      }
    };
  }

  function xmlReq({schema, system, messages}) {

    messages = (messages || []).slice();

    let prompt = '';

    if (messages?.length) {
      if (messages[messages.length - 1]?.role !== 'user') {
        throw new Error('Last message should have role of "user"');
      }
      if (!messages[messages.length - 1].content) {
        throw new Error('Last message should have a non-empty content property');
      }
      prompt = messages.pop().content;
    }

    return async function*(thing) {
      let transformedPrompt = prompt;

      const mapSelectionSchemaScaffold =
        schema &&
        IncomingXMLParserSelectorEngine
          .makeMapSelectXMLScaffold(schema);

      if (typeof transformedPrompt == 'function') {
        transformedPrompt = transformedPrompt(thing);
      }

      if (mapSelectionSchemaScaffold) {
        transformedPrompt = `
    FYI: The data you return should be approximately like this:
    \`\`\`
    ${mapSelectionSchemaScaffold}
    \`\`\`

    Prompt:
    ==== BEGIN PROMPT ====
    ${transformedPrompt}
    ==== END PROMPT ====

    Finally, remember: The data you return should be approximately like this:
    \`\`\`
    ${mapSelectionSchemaScaffold}
    \`\`\`
        `;
      }

      const systemPrompt = `
    META & OUTPUT STRUCTURE RULES:
    ===

    You are an AI that only outputs XML. You accept an instruction just like normal and do your best to fulfil it. You can express your thinking, but use XML <thinking/> elements to do this.

    You can output multiple results if you like.

    E.g. if asked for several names, you could just return:
    <name>sarah</name> <name>james</name>
    etc.

    Rule: you must return valid xml. If using angle-braces or other HTML/XML characters within an element, you should escape these, e.g. '<' would be '&lt;' UNLESS you are trying to demarkate an actual XML tag. E.g. if you were asked to produce HTML code, within an <html> tag, then you would do it like this: <html>&lt;div&gt;etc.&lt;/div&gt;</html>

    All outputs begin with '<thinking>', followed by your output in XML. If the user doesn't specify an XML structure or certain tags, make an informed decision. Prefer content over attributes.
      

    HIGHLY SPECIFIC RULES RELATED TO YOUR FUNCTIONS:
    (you must follow these religiously)
    ===
    ${system || 'you are an ai assistant and respond to the request.'}`;

      if (!transformedPrompt.trim()) {
        throw new Error('we need a prompt');
      }

      const stream = await (llmStream)({
        max_tokens: 4000,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },

          ...(
            messages?.length && messages || []
          ),

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

      // let accrued = '<thinking>';
      let accrued = '';
      let cancelled = false;

      yield accrued;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (cancelled || done) break;

          const text = new TextDecoder().decode(value);

          accrued += text;

          yield text;
        }
      } catch (e) {
        logger.error(`Error reading stream:`, e);
      } finally {
        reader.releaseLock();
      }
    };
  }

  function prompt(prompt, schema, mapper, fakeResponse) {

    if (typeof prompt === 'string' || typeof prompt === 'function') {
      return promptComplex({
        schema,
        mapper,
        fakeResponse,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    }

    // Assuming prompt is a config object
    return promptComplex(prompt);

  }

  function promptComplex({
    messages,
    schema,
    mapper,
    system,
    fakeResponse
  }) {

    logger.dev('promptComplex()', {
      messages,
      schema,
      mapper,
      system,
      fakeResponse
    });

    if (
      mapper && !schema 
    ) {
      throw new Error('You cannot have a schema without a mapper; it makes no sense.');
    }

    if (!schema) {
      return xmlReq({
        system: system,
        messages
      });
    }

    return async function*(input) {
      const reqPipeline = [
        function*() {
          if (input == null) {
            yield [undefined];
            return;
          }
          if (isComplexIterable(input)) {
            yield* input;
          } else {
            yield input;
          }
        },

        function*(x) {
          yield x; // debug opportunity
        },

        fakeResponse 
          ? function*() {
            yield* [fakeResponse]
          }
          : xmlReq({
            system: system,
            messages: messages,
            schema: schema
          }),

        function*(x) {
          yield x;
        },

        mapSelect(schema)
      ];

      const pipeline = [
        xmllmGen(() => reqPipeline, {llmStream}),

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
      for await (const item of xmllmGen(() => pipeline, {llmStream})) {
        yield item;
      }
    };
  }

  function mapSelect(schema) {
    return function* (chunk) {
      xmlps.add([chunk].flat().join(''));
      let selection = xmlps.mapSelect(schema);
      if (selection && Object.keys(selection).length) {
        yield selection;
      }
    }
  }

  function select(selector, mapperFn = x => x) {
    return function* (chunk) {
      xmlps.add([chunk].flat().join(''));

      const selection = xmlps.dedupeSelect(selector);
      if (selection?.length) {
        yield* selection.map(mapperFn);
      }
    }
  }
}

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

function xmllm(pipelineFn, options = {}) {
  const g = xmllmGen(pipelineFn, options);
  g.all = async function() {
    const results = [];
    for await (const item of this) {
      results.push(item);
    }
    return results;
  };
  return g;
}

export default xmllm;
