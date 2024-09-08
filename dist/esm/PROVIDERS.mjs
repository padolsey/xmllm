import { config } from 'dotenv';
config({
  path: '.env'
});
var standardPayloader = function standardPayloader(_ref) {
  var _ref$messages = _ref.messages,
    messages = _ref$messages === void 0 ? [] : _ref$messages,
    _ref$max_tokens = _ref.max_tokens,
    max_tokens = _ref$max_tokens === void 0 ? 300 : _ref$max_tokens,
    _ref$stop = _ref.stop,
    stop = _ref$stop === void 0 ? null : _ref$stop,
    _ref$temperature = _ref.temperature,
    temperature = _ref$temperature === void 0 ? 0.5 : _ref$temperature,
    _ref$top_p = _ref.top_p,
    top_p = _ref$top_p === void 0 ? 1 : _ref$top_p,
    _ref$presence_penalty = _ref.presence_penalty,
    presence_penalty = _ref$presence_penalty === void 0 ? 0 : _ref$presence_penalty,
    _ref$system = _ref.system,
    system = _ref$system === void 0 ? '' : _ref$system;
  return {
    messages: [{
      role: 'system',
      content: system || ''
    }].concat(messages),
    max_tokens: max_tokens,
    stop: stop,
    temperature: temperature,
    top_p: top_p,
    presence_penalty: presence_penalty
  };
};
var taiStylePayloader = function taiStylePayloader(_ref2) {
  var _ref2$messages = _ref2.messages,
    messages = _ref2$messages === void 0 ? [] : _ref2$messages,
    _ref2$max_tokens = _ref2.max_tokens,
    max_tokens = _ref2$max_tokens === void 0 ? 300 : _ref2$max_tokens,
    _ref2$stop = _ref2.stop,
    stop = _ref2$stop === void 0 ? ['</s>', '[/INST]'] : _ref2$stop,
    _ref2$temperature = _ref2.temperature,
    temperature = _ref2$temperature === void 0 ? 0.5 : _ref2$temperature,
    _ref2$top_p = _ref2.top_p,
    top_p = _ref2$top_p === void 0 ? 1 : _ref2$top_p,
    _ref2$frequency_penal = _ref2.frequency_penalty,
    frequency_penalty = _ref2$frequency_penal === void 0 ? 0.01 : _ref2$frequency_penal,
    _ref2$presence_penalt = _ref2.presence_penalty,
    presence_penalty = _ref2$presence_penalt === void 0 ? 0 : _ref2$presence_penalt,
    _ref2$system = _ref2.system,
    system = _ref2$system === void 0 ? '' : _ref2$system;
  return {
    messages: [{
      role: 'system',
      content: system || ''
    }].concat(messages),
    max_tokens: max_tokens,
    stop: stop,
    temperature: temperature,
    top_p: top_p,
    top_k: 50,
    repetition_penalty: 1 + presence_penalty
  };
};

// We anchor pricing/cost to the gpt3.5/7x8B level models
// Note that 'cost' under 'constraints' is just used for scoring
// which model to use - cheapest is best, so if we really want a model
// to be used, we just set the cost to lower. lol.

export default {
  claude: {
    //https://www.anthropic.com/api
    constraints: {
      cost: .2,
      rpmLimit: 100
    },
    endpoint: 'https://api.anthropic.com/v1/messages',
    key: process.env.ANTHROPIC_API_KEY,
    models: {
      superfast: {
        // name: 'claude-3-5-sonnet-20240620',
        name: 'claude-3-haiku-20240307',
        costPer1MTokens: 0.50,
        //avg? i/o...
        maxContextSize: 100000
      },
      fast: {
        // name: 'claude-3-5-sonnet-20240620',
        name: 'claude-3-haiku-20240307',
        costPer1MTokens: 1.50,
        maxContextSize: 100000
      },
      good: {
        // name: 'claude-3-opus-20240229',
        // name: 'claude-3-5-sonnet-20240620',
        name: 'claude-3-haiku-20240307',
        costPer1MTokens: 5.00,
        // avg i/o ?
        maxContextSize: 100000
      }
    },
    headerGen: function headerGen() {
      return {
        'x-api-key': this.key,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      };
    },
    payloader: function payloader(_ref3) {
      var _ref3$messages = _ref3.messages,
        messages = _ref3$messages === void 0 ? [] : _ref3$messages,
        system = _ref3.system,
        _ref3$max_tokens = _ref3.max_tokens,
        max_tokens = _ref3$max_tokens === void 0 ? 300 : _ref3$max_tokens,
        _ref3$stop = _ref3.stop,
        stop = _ref3$stop === void 0 ? null : _ref3$stop,
        _ref3$temperature = _ref3.temperature,
        temperature = _ref3$temperature === void 0 ? 0.5 : _ref3$temperature,
        _ref3$top_p = _ref3.top_p,
        top_p = _ref3$top_p === void 0 ? 1 : _ref3$top_p,
        _ref3$presence_penalt = _ref3.presence_penalty,
        presence_penalty = _ref3$presence_penalt === void 0 ? 0 : _ref3$presence_penalt;
      // const systemPrompt = messages.filter(m => m.role === 'system')?.[0];

      return {
        system: system,
        messages: messages,
        max_tokens: max_tokens,
        stop_sequences: stop,
        temperature: temperature,
        top_p: top_p
        // presence_penalty // not used by claude ...
      };
      var obj = {
        max_tokens: max_tokens,
        stop_sequences: stop,
        temperature: temperature,
        top_p: top_p,
        presence_penalty: presence_penalty
      };
      obj.messages = messages.filter(function (m) {
        return m.role !== 'system';
      }).map(function (m) {
        return {
          role: m.role,
          content: (m.content || '').trim()
          // claude seems to complain about whitespace,
          // just with assistant role but still, may as well trim:
          // E.g. {"type":"error","error":{"type":"invalid_request_error",
          // "message":"messages: final assistant content cannot
          // end with trailing whitespace"}}
        };
      });
      return obj;
    }
  },
  openai: {
    constraints: {
      cost: .5,
      // approx agg cost hueristic
      rpmLimit: 20
    },
    endpoint: 'https://api.openai.com/v1/chat/completions',
    key: process.env.OPENAI_API_KEY,
    models: {
      superfast: {
        name: 'gpt-4o-mini',
        costPer1MTokens: 1.50,
        maxContextSize: 1000000
      },
      fast: {
        name: 'gpt-4o-mini',
        costPer1MTokens: 1.50,
        maxContextSize: 1000000
      },
      good: {
        name: 'gpt-4o-mini',
        costPer1MTokens: 15,
        maxContextSize: 128000
      }
    },
    payloader: standardPayloader
  }
  // togetherai: {
  //   constraints: {
  //     cost: 2,
  //     rpmLimit: 10
  //   }, 
  //   endpoint: 'https://api.together.xyz/v1/chat/completions',
  //   key: process.env.TOGETHER_API_KEY,
  //   models: {
  //     superfast: {
  //       // name: 'Qwen/Qwen1.5-4B-Chat', //tiny context of 4k
  //       name: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
  //       costPer1MTokens: 0.60,
  //     },
  //     fast: {
  //       name: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
  //       costPer1MTokens: 0.60,
  //     },
  //     good: {
  //       // name: 'mistralai/Mixtral-8x22B-Instruct-v0.1',
  //       // name: 'meta-llama/Llama-2-70b-chat-hf',
  //       name: 'Qwen/Qwen1.5-72B-Chat',
  //       costPer1MTokens: 0.90
  //     }
  //   },
  //   payloader: taiStylePayloader
  // },
  // perplexityai: {
  //   constraints: {
  //     cost: 3,
  //     rpmLimit: 10
  //   }, 
  //   endpoint: 'https://api.perplexity.ai/chat/completions',
  //   key: process.env.PERPLEXITY_API_KEY,
  //   models: {
  //     superfast: {
  //       // name: 'llama-3-8b-instruct',
  //       name: 'mixtral-8x7b-instruct',
  //       costPer1MTokens: 0.60
  //     },
  //     fast: {
  //       // name: 'llama-3-8b-instruct',
  //       name: 'mixtral-8x7b-instruct',
  //       costPer1MTokens: 0.60
  //     },
  //     good: {
  //       // slightly more reliable in terms of prompting
  //       // seemingly aligns well with how we've optimized the prompt for openai
  //       name: 'llama-3-70b-instruct', 
  //       // name: 'llama-3-sonar-large-32k-chat',
  //       costPer1MTokens: 1.00
  //     }
  //   },
  //   payloader: standardPayloader
  // },
  // anyscaleai: {
  //   constraints: {
  //     cost: 10, // I've upped this like scary because anyscale is unreliable
  //     rpmLimit: 30
  //   }, 
  //   endpoint: 'https://api.endpoints.anyscale.com/v1/chat/completions',
  //   key: process.env.ANYSCALE_API_KEY,
  //   models: {
  //     superfast: {
  //       name: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
  //       costPer1MTokens: 0.001
  //     },
  //     fast: {
  //       name: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
  //       costPer1MTokens: 0.001
  //     },
  //     good: {
  //       name: 'mistralai/Mixtral-8x22B-Instruct-v0.1',
  //       costPer1MTokens: 0.001
  //     }
  //   },
  //   payloader: standardPayloader
  // }
};