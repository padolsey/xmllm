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
    temperature = _ref$temperature === void 0 ? 0.52 : _ref$temperature,
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
    temperature = _ref2$temperature === void 0 ? 0.52 : _ref2$temperature,
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
export default {
  claude: {
    constraints: {
      rpmLimit: 200
    },
    endpoint: 'https://api.anthropic.com/v1/messages',
    key: process.env.ANTHROPIC_API_KEY,
    models: {
      superfast: {
        name: 'claude-3-haiku-20240307',
        maxContextSize: 100000
      },
      fast: {
        name: 'claude-3-haiku-20240307',
        maxContextSize: 100000
      },
      good: {
        name: 'claude-3-5-sonnet-20240620',
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
        temperature = _ref3$temperature === void 0 ? 0.52 : _ref3$temperature,
        _ref3$top_p = _ref3.top_p,
        top_p = _ref3$top_p === void 0 ? 1 : _ref3$top_p,
        _ref3$presence_penalt = _ref3.presence_penalty,
        presence_penalty = _ref3$presence_penalt === void 0 ? 0 : _ref3$presence_penalt;
      return {
        system: system,
        messages: messages,
        max_tokens: max_tokens,
        stop_sequences: stop,
        temperature: temperature,
        top_p: top_p
      };
    }
  },
  openai: {
    constraints: {
      rpmLimit: 200
    },
    endpoint: 'https://api.openai.com/v1/chat/completions',
    key: process.env.OPENAI_API_KEY,
    models: {
      superfast: {
        name: 'gpt-4o-mini',
        maxContextSize: 1000000
      },
      fast: {
        name: 'gpt-4o-mini',
        maxContextSize: 1000000
      },
      good: {
        name: 'gpt-4o',
        maxContextSize: 128000
      }
    },
    payloader: standardPayloader
  },
  togetherai: {
    constraints: {
      rpmLimit: 10
    },
    endpoint: 'https://api.together.xyz/v1/chat/completions',
    key: process.env.TOGETHER_API_KEY,
    models: {
      superfast: {
        name: 'mistralai/Mixtral-8x7B-Instruct-v0.1'
      },
      fast: {
        name: 'mistralai/Mixtral-8x7B-Instruct-v0.1'
      },
      good: {
        name: 'Qwen/Qwen1.5-72B-Chat'
      }
    },
    payloader: taiStylePayloader
  },
  perplexityai: {
    constraints: {
      rpmLimit: 10
    },
    endpoint: 'https://api.perplexity.ai/chat/completions',
    key: process.env.PERPLEXITY_API_KEY,
    models: {
      superfast: {
        name: 'llama-3.1-sonar-small-128k-chat'
      },
      fast: {
        name: 'llama-3.1-sonar-small-128k-chat'
      },
      good: {
        name: 'llama-3.1-sonar-large-128k-chat'
      }
    },
    payloader: standardPayloader
  }
};