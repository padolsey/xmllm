import createStreaming from 'streamops';
import IncomingXMLParserSelectorEngine from './IncomingXMLParserSelectorEngine.mjs';
import Logger from './Logger.mjs';
import { generateSystemPrompt as defaultSystemPrompt, generateUserPrompt as defaultUserPrompt } from './prompts.mjs';

const logger = new Logger('xmllm');

const DEFAULT_TEMPERATURE = 0.72;

const text = (fn) => ({ $text }) => fn ? fn($text) : $text;
const withAttrs = (fn) => ({ $text, $attr }) => fn($text, $attr);
const whenClosed = (fn) => (el) => el.$tagclosed ? fn(el) : undefined;

const parserStack = new WeakMap();

async function* xmllmGen(pipelineFn, {
  timeout, 
  llmStream,
  generateSystemPrompt = defaultSystemPrompt,
  generateUserPrompt = defaultUserPrompt
} = {}) {

  const streamops = createStreaming({
    timeout: timeout || 1e6
  });

  const context = {};
  parserStack.set(context, []);
  pushNewParser(); // ensure there's at least one

  if (typeof pipelineFn !== 'function') {
    throw new Error('You must pass a function to xmllm - and that function must return a pipeline array.');
  }

  const xmlps = new IncomingXMLParserSelectorEngine();

  const pipeline = pipelineFn({

    // Convenience aliases
    p: promptClosed,
    pc: promptClosed, //legacy
    ps: promptStream,
    r: req,

    prompt: promptStream,
    promptStream,
    promptClosed,
    promptComplex,
    select,
    mapSelect,
    mapSelectClosed,
    req,

    // Manually add things to parser
    // Useful for testing or adding HTML/XML from other non req/xmlReq
    // sources.
    parse: (str) => {
      return function*(incoming) {
        getCurrentParser().add(String(str));
        yield incoming;
      }
    },

    map: streamops.map,
    filter: streamops.filter,
    reduce: streamops.reduce,
    accrue: streamops.accrue,
    tap: streamops.tap,
    waitUntil: streamops.waitUntil,
    mergeAggregate: streamops.mergeAggregate,
    take: streamops.take,
    batch: streamops.batch,
    // batch: (n, ops) => {
    //   console.log('xmllm: batch', n, ops);
    //   return streamops.batch.call(this, n, ops);
    // },
    skip: streamops.skip,

    text,
    val: text,
    value: text,
    v: text,
    withAttrs,
    whenClosed
  });

  if (!Array.isArray(pipeline)) {
    throw new Error('Pipeline creator function must return an array.');
  }

  const stream = streamops(pipeline);
  yield* stream;

  function getCurrentParser() {
    const stack = parserStack.get(context);
    return stack[stack.length - 1];
  }

  function pushNewParser() {
    const parser = new IncomingXMLParserSelectorEngine();
    const stack = parserStack.get(context);
    stack.push(parser);
    return parser;
  }

  function req(config) {

    return async function*(thing) {
      const parser = pushNewParser();

      let transformedConfig = config;

      if (typeof transformedConfig == 'function') {
        transformedConfig = transformedConfig(thing);
      }

      if (typeof transformedConfig === 'string') {
        transformedConfig = { 
          system: '',
          messages: [
            {
              role: 'user',
              content: transformedConfig
            }
          ]
        }
      }

      const {
        system,
        model,
        cache,
        max_tokens,
        maxTokens,
        temperature,
        top_p,
        topP,
        presence_penalty,
        presencePenalty,
        stop,
        messages
      } = transformedConfig;

      if (!messages.length) {
        throw new Error('Must be at least one message');
      }

      const stream = await (llmStream)({
        max_tokens: max_tokens || maxTokens || 4000,
        temperature: temperature == null ? DEFAULT_TEMPERATURE : temperature,
        fakeDelay: transformedConfig.fakeDelay,
        top_p: top_p || topP,
        presence_penalty: presence_penalty || presencePenalty,
        stop: stop,
        messages: [
          {
            role: 'system',
            content: system || ''
          },
          ...(messages || [])
        ],
        model,
        cache
      });

      const reader = stream.getReader();

      let accrued = config.accrued || '';
      let cancelled = false;

      if (accrued) yield accrued;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (cancelled || done) break;

          const text = new TextDecoder().decode(value);
          parser.add(text);
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

  function xmlReq({
    schema, 
    hints,
    system,
    messages, 
    max_tokens, 
    maxTokens, 
    model, 
    temperature, 
    stop,
    top_p,
    topP,
    presence_penalty,
    presencePenalty,
    cache,
    fakeDelay,
    waitMessageString,
    waitMessageDelay,
    retryMax,
    retryStartDelay,
    retryBackoffMultiplier,
    onChunk,
    generateSystemPrompt: localSystemPrompt,
    generateUserPrompt: localUserPrompt
  }) {

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

    const useSystemPrompt = localSystemPrompt || generateSystemPrompt;
    const useUserPrompt = localUserPrompt || generateUserPrompt;

    return async function*(thing) {
      const parser = pushNewParser();

      let transformedPrompt = prompt;

      const mapSelectionSchemaScaffold =
        schema &&
        IncomingXMLParserSelectorEngine
          .makeMapSelectXMLScaffold(schema, hints);

      if (typeof transformedPrompt == 'function') {
        transformedPrompt = transformedPrompt(thing);
      }

      if (mapSelectionSchemaScaffold) {
        transformedPrompt = useUserPrompt(mapSelectionSchemaScaffold, transformedPrompt);
      }

      const systemPrompt = useSystemPrompt(system);

      if (typeof transformedPrompt !== 'string') {
        throw new Error('transformedPrompt must be a string');
      }

      if (!transformedPrompt.trim()) {
        throw new Error('we need a prompt');
      }

      const stream = await (llmStream)({
        max_tokens: max_tokens || maxTokens || 4000,
        temperature: temperature == null ? 0.5 : temperature,
        top_p: top_p || topP || null,
        stop: stop || null,
        presence_penalty: presence_penalty || presencePenalty || null,
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
          }
        ],
        model,
        fakeDelay,
        waitMessageString,
        waitMessageDelay,
        retryMax,
        retryStartDelay,
        retryBackoffMultiplier,
        cache
      });

      const reader = stream.getReader();

      let accrued = '';
      let cancelled = false;

      yield accrued; // Do we need this?
      // (can't hurt?)

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (cancelled || done) break;

          const text = new TextDecoder().decode(value);
          if (onChunk) {
            try {
              onChunk(text);
            } catch(err) {
              logger.error('onChunk err', err);
            }
          }
          parser.add(text);
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

  function promptClosed(prompt, schema, options = {}, fakeResponse = null) {
    let transformedConfig = prompt;
    
    if (typeof transformedConfig == 'function') {
      return promptComplex(prompt, {
        doMapSelectClosed: true
      });
    }

    if (typeof transformedConfig === 'string') {
      transformedConfig = {
        system: '',
        doMapSelectClosed: true,
        messages: [
          {
            role: 'user',
            content: transformedConfig
          }
        ]
      }
    }

    const { mapper, ...restOptions } = options;

    return promptComplex({
      schema,
      mapper,
      fakeResponse,
      ...transformedConfig,
      ...restOptions,
      doMapSelectClosed: true
    });
  }



  function promptStream(prompt, schema, options = {}, fakeResponse = null) {
    let transformedConfig = prompt;
    
    if (typeof transformedConfig == 'function') {
      return promptComplex(prompt, {
        doMapSelectClosed: false
      });
    }

    if (typeof transformedConfig === 'string') {
      transformedConfig = {
        system: '',
        doMapSelectClosed: false,
        messages: [
          {
            role: 'user',
            content: transformedConfig
          }
        ]
      }
    }


    return promptComplex({
      schema,
      fakeResponse,
      ...transformedConfig,
      ...options,
      doMapSelectClosed: false
    });
  }

  function promptComplex(config, additionalOverrides = {}) {

    return async function*(input) {

      if (typeof config === 'function') {
        config = config(input);
        config = {...config, ...additionalOverrides};
      }

      if (typeof config === 'string') {
        config = {
          messages: [{
            role: 'user',
            content: config
          }]
        }
      }

      const {
        messages,
        schema,
        hints,
        mapper,
        system,
        max_tokens,
        maxTokens,
        top_p,
        topP,
        stop,
        presence_penalty,
        presencePenalty,
        temperature,
        fakeResponse,
        doMapSelectClosed = false,
        includeOpenTags = true,
        doDedupe = false,
        model,
        fakeDelay,
        waitMessageString,
        waitMessageDelay,
        retryMax,
        onChunk,
        retryStartDelay,
        retryBackoffMultiplier,
        cache,
        generateSystemPrompt,
        generateUserPrompt
      } = config;

      if (
        mapper && !schema 
      ) {
        throw new Error('You cannot have a schema with a mapper; it makes no sense.');
      }

      if (!schema) {
        return xmlReq({
          system: system,
          messages,
          model,
          hints,
          max_tokens,
          maxTokens,
          top_p,
          topP,
          presence_penalty,
          presencePenalty,
          temperature,
          stop,
          schema,
          generateSystemPrompt,
          generateUserPrompt
        });
      }

      const reqPipeline = [
        function*() {
          // if (input == null) {
          //   yield [undefined];
          //   return;
          // }
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
            // If it's a fakeResponse we still want to ensure it's added
            // to the parser, otherwise selections won't work and there's
            // no point...
            getCurrentParser().add(fakeResponse);
            yield* [fakeResponse];
          }
          : xmlReq({
            system: system,
            messages: messages,
            max_tokens: max_tokens || maxTokens,
            schema: schema,
            hints,
            model,
            fakeDelay,
            waitMessageString,
            waitMessageDelay,
            retryMax,
            temperature,
            top_p,
            topP,
            presence_penalty,
            presencePenalty,
            stop,
            onChunk,
            retryStartDelay,
            retryBackoffMultiplier,
            cache,
            generateSystemPrompt,
            generateUserPrompt
          }),

        // function*(x) {
        //   yield x;
        // },

        // doMapSelectClosed ? mapSelectClosed(schema) : mapSelect(schema),
        doMapSelectClosed ? 
          mapSelectClosed(schema) : 
          mapSelect(schema, includeOpenTags, doDedupe),

        // function*(x) {
        //   yield x;
        // },
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

  /**
   * Creates a pipeline operator for state-mode selection.
   * Yields growing state including partial elements.
   * @see IncomingXMLParserSelectorEngine.mapSelect
   */
  function mapSelect(schema, includeOpenTags = true, doDedupe = false) {
    return function* (chunk) {
      const currentParser = getCurrentParser();
      if (!currentParser) {
        logger.warn('No active parser found for mapSelect()');
        return;
      }

      let selection = currentParser.mapSelect(schema, includeOpenTags, doDedupe);
      if (selection && Object.keys(selection).length) {
        yield selection;
      }
    }
  }

  /**
   * Creates a pipeline operator for delta-mode selection.
   * Yields only newly completed elements.
   * @see IncomingXMLParserSelectorEngine.mapSelectClosed
   */
  function mapSelectClosed(schema) {
    return function* (chunk) {
      const currentParser = getCurrentParser();
      if (!currentParser) {
        logger.warn('No active parser found for mapSelectClosed()');
        return;
      }

      let selection = currentParser.mapSelectClosed(schema);
      if (selection && Object.keys(selection).length) {
        yield selection;
      }
    }
  }

  function select(selector, mapperFn = x => x) {
    return function*(chunk) {
      const currentParser = getCurrentParser();
      if (!currentParser) {
        logger.warn('No active parser found for select()');
        return;
      }

      const selection = currentParser.dedupeSelect(selector, true);
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

  g.first = async function(n = 1) {
    const results = [];
    for await (const item of this) {
      results.push(item);
      if (results.length >= n) break;
    }
    return n === 1 ? results[0] : results;
  };

  g.last = async function(n = 1) {
    const results = [];
    for await (const item of this) {
      results.push(item);
    }
    const lastN = results.slice(-n);
    return n === 1 ? lastN[0] : lastN;
  };

  return g;
}

export default xmllm;
export { xmllm };
