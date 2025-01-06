"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PROVIDER_ALIASES = void 0;
exports.createCustomModel = createCustomModel;
exports["default"] = void 0;
var _dotenv = require("dotenv");
var _ProviderErrors = require("./errors/ProviderErrors.js");
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
(0, _dotenv.config)({
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
    stop = _ref2$stop === void 0 ? ['', ''] : _ref2$stop,
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
var providers = {
  anthropic: {
    constraints: {
      rpmLimit: 200
    },
    endpoint: 'https://api.anthropic.com/v1/messages',
    key: process.env.ANTHROPIC_API_KEY,
    models: {
      superfast: {
        name: 'claude-3-haiku-20240307',
        maxContextSize: 200000
      },
      fast: {
        name: 'claude-3-haiku-20240307',
        maxContextSize: 200000
      },
      good: {
        name: 'claude-3-5-sonnet-20240620',
        maxContextSize: 200000
      }
    },
    headerGen: function headerGen() {
      return {
        'x-api-key': this.key || process.env.ANTHROPIC_API_KEY,
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
        maxContextSize: 128000
      },
      fast: {
        name: 'gpt-4o-mini',
        maxContextSize: 128000
      },
      good: {
        name: 'gpt-4o',
        maxContextSize: 128000
      }
    },
    payloader: standardPayloader
  },
  openrouter: {
    constraints: {
      rpmLimit: 100
    },
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    key: process.env.OPENROUTER_API_KEY,
    models: {
      superfast: {
        name: 'mistralai/ministral-3b',
        maxContextSize: 128000
      },
      fast: {
        name: 'mistralai/ministral-8b',
        maxContextSize: 128000
      },
      good: {
        name: 'mistralai/mistral-large-2411',
        maxContextSize: 128000
      }
    },
    headerGen: function headerGen() {
      return {
        Authorization: "Bearer ".concat(this.key || process.env.OPENROUTER_API_KEY),
        'Content-Type': 'application/json'
      };
    },
    payloader: standardPayloader
  },
  togetherai: {
    constraints: {
      rpmLimit: 100
    },
    endpoint: 'https://api.together.xyz/v1/chat/completions',
    key: process.env.TOGETHER_API_KEY || process.env.TOGETHERAI_API_KEY,
    models: {
      superfast: {
        name: 'Qwen/Qwen2.5-7B-Instruct-Turbo',
        maxContextSize: 32000
      },
      fast: {
        name: 'Qwen/Qwen2.5-7B-Instruct-Turbo',
        maxContextSize: 32000
      },
      good: {
        name: 'Qwen/Qwen2.5-72B-Instruct-Turbo',
        maxContextSize: 32000
      }
    },
    payloader: taiStylePayloader
  },
  perplexityai: {
    constraints: {
      rpmLimit: 100
    },
    endpoint: 'https://api.perplexity.ai/chat/completions',
    key: process.env.PERPLEXITY_API_KEY,
    models: {
      superfast: {
        name: 'llama-3.1-sonar-small-128k-chat',
        maxContextSize: 128000
      },
      fast: {
        name: 'llama-3.1-sonar-small-128k-chat',
        maxContextSize: 128000
      },
      good: {
        name: 'llama-3.1-sonar-large-128k-chat',
        maxContextSize: 128000
      }
    },
    payloader: standardPayloader
  }
};
providers.claude = providers.anthropic;
var PROVIDER_ALIASES = exports.PROVIDER_ALIASES = {
  claude: 'anthropic'
};
var _default = exports["default"] = providers;
function createCustomModel(baseProvider, config) {
  var _baseProvider$models;
  // Required fields
  if (!config.name) {
    throw new _ProviderErrors.ModelValidationError('Model name is required', {
      provider: baseProvider.name
    });
  }

  // Validate maxContextSize
  if (config.maxContextSize !== undefined) {
    if (typeof config.maxContextSize !== 'number' || config.maxContextSize <= 0) {
      throw new _ProviderErrors.ModelValidationError('maxContextSize must be a positive number', {
        provider: baseProvider.name,
        value: config.maxContextSize
      });
    }
  }

  // Validate constraints
  if (config.constraints) {
    if (_typeof(config.constraints) !== 'object') {
      throw new _ProviderErrors.ModelValidationError('constraints must be an object', {
        provider: baseProvider.name
      });
    }
    if (config.constraints.rpmLimit !== undefined) {
      if (typeof config.constraints.rpmLimit !== 'number' || config.constraints.rpmLimit <= 0) {
        throw new _ProviderErrors.ModelValidationError('rpmLimit must be a positive number', {
          provider: baseProvider.name,
          value: config.constraints.rpmLimit
        });
      }
    }
  }

  // Validate endpoint if provided
  if (config.endpoint !== undefined) {
    try {
      new URL(config.endpoint);
    } catch (e) {
      throw new _ProviderErrors.ModelValidationError('Invalid endpoint URL', {
        provider: baseProvider.name,
        value: config.endpoint
      });
    }
  }

  // Validate functions
  if (config.headerGen && typeof config.headerGen !== 'function') {
    throw new _ProviderErrors.ModelValidationError('headerGen must be a function', {
      provider: baseProvider.name
    });
  }
  if (config.payloader && typeof config.payloader !== 'function') {
    throw new _ProviderErrors.ModelValidationError('payloader must be a function', {
      provider: baseProvider.name
    });
  }
  return _objectSpread(_objectSpread({}, baseProvider), {}, {
    endpoint: config.endpoint || baseProvider.endpoint,
    key: config.key || baseProvider.key,
    headerGen: config.headerGen || baseProvider.headerGen,
    payloader: config.payloader || baseProvider.payloader,
    constraints: _objectSpread(_objectSpread({}, baseProvider.constraints), config.constraints || {}),
    models: {
      custom: {
        name: config.name,
        maxContextSize: config.maxContextSize || ((_baseProvider$models = baseProvider.models) === null || _baseProvider$models === void 0 || (_baseProvider$models = _baseProvider$models.fast) === null || _baseProvider$models === void 0 ? void 0 : _baseProvider$models.maxContextSize)
      }
    }
  });
}