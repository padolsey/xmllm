"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PROVIDER_ALIASES = void 0;
exports.createCustomModel = createCustomModel;
exports["default"] = void 0;
exports.normalizeProviderParams = normalizeProviderParams;
exports.providers = exports.openaiPayloader = exports.o1Payloader = void 0;
exports.registerProvider = registerProvider;
exports.taiStylePayloader = exports.standardPayloader = void 0;
var _dotenv = require("dotenv");
var _ProviderErrors = require("./errors/ProviderErrors.js");
var _excluded = ["search_domain_filter", "return_images", "return_related_questions"],
  _excluded2 = ["random_seed", "safe_prompt", "response_format"],
  _excluded3 = ["response_format"];
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var s = Object.getOwnPropertySymbols(e); for (r = 0; r < s.length; r++) o = s[r], t.includes(o) || {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (e.includes(n)) continue; t[n] = r[n]; } return t; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
(0, _dotenv.config)({
  path: '.env'
});
var standardHeaderGen = function standardHeaderGen() {
  return {
    'Authorization': "Bearer ".concat(this.key),
    'Content-Type': 'application/json'
  };
};

// Add the o1Payloader function
var o1Payloader = exports.o1Payloader = function o1Payloader(o) {
  var _this$models$model;
  var _o$messages = o.messages,
    messages = _o$messages === void 0 ? [] : _o$messages,
    _o$max_completion_tok = o.max_completion_tokens,
    max_completion_tokens = _o$max_completion_tok === void 0 ? 300 : _o$max_completion_tok,
    max_tokens = o.max_tokens,
    maxTokens = o.maxTokens,
    _o$stop = o.stop,
    stop = _o$stop === void 0 ? null : _o$stop,
    _o$reasoning_effort = o.reasoning_effort,
    reasoning_effort = _o$reasoning_effort === void 0 ? 'medium' : _o$reasoning_effort,
    _o$system = o.system,
    system = _o$system === void 0 ? '' : _o$system,
    model = o.model;

  // Store model name for reference - handle case when this.models is undefined
  var modelName = this !== null && this !== void 0 && this.models && model ? ((_this$models$model = this.models[model]) === null || _this$models$model === void 0 ? void 0 : _this$models$model.name) || model : model;

  // Check if the model does not support the 'developer' role
  var modelsWithoutDeveloperRole = ['o1-mini'];
  var doesNotSupportDeveloper = modelsWithoutDeveloperRole.includes(modelName);

  // Process messages
  var processedMessages;
  if (doesNotSupportDeveloper) {
    // Map 'system' and 'developer' roles to 'assistant' with specialist tags
    processedMessages = [].concat(_toConsumableArray(system ? [{
      role: 'assistant',
      content: '<system>' + system + '</system>'
    }] : []), _toConsumableArray(messages.map(function (msg) {
      return ['system', 'developer'].includes(msg.role) ? _objectSpread(_objectSpread({}, msg), {}, {
        role: 'assistant',
        content: "<".concat(msg.role, ">").concat(msg.content, "</").concat(msg.role, ">")
      }) : msg;
    })));
  } else {
    // Use 'developer' role for system messages
    processedMessages = [].concat(_toConsumableArray(system ? [{
      role: 'developer',
      content: system
    }] : []), _toConsumableArray(messages.map(function (msg) {
      return msg.role === 'system' ? _objectSpread(_objectSpread({}, msg), {}, {
        role: 'developer'
      }) : msg;
    })));
  }

  // Use max_completion_tokens, falling back to max_tokens if provided
  var finalMaxTokens = max_completion_tokens || max_tokens || maxTokens || 300;
  var payload = {
    messages: processedMessages,
    max_completion_tokens: finalMaxTokens
  };
  if (modelName !== 'o1-mini') {
    // o1-mini does not support reasoning_effort
    payload.reasoning_effort = reasoning_effort;
  }
  if (stop != null) {
    payload.stop = stop;
  }

  // Note: We intentionally ignore temperature, top_p, presence_penalty, etc.
  // as they are not supported by O1 models

  return payload;
};

// Update the OpenAI payloader to handle all model-specific logic
var openaiPayloader = exports.openaiPayloader = function openaiPayloader(o) {
  var _this$models$o$model;
  var modelName = ((_this$models$o$model = this.models[o.model]) === null || _this$models$o$model === void 0 ? void 0 : _this$models$o$model.name) || o.model;
  var isO1Model = /^(?:o1|o3|o4)/.test(modelName);
  if (isO1Model) {
    // Remove parameters that O1 models don't support
    var sanitizedOpts = _objectSpread({}, o);

    // O1 models don't support these parameters
    delete sanitizedOpts.temperature;
    delete sanitizedOpts.top_p;
    delete sanitizedOpts.presence_penalty;
    delete sanitizedOpts.frequency_penalty;
    return o1Payloader.call(this, sanitizedOpts);
  } else {
    return standardPayloader.call(this, o);
  }
};
var standardPayloader = exports.standardPayloader = function standardPayloader(o) {
  var _o$messages2 = o.messages,
    messages = _o$messages2 === void 0 ? [] : _o$messages2,
    _o$max_tokens = o.max_tokens,
    max_tokens = _o$max_tokens === void 0 ? 300 : _o$max_tokens,
    _o$stop2 = o.stop,
    stop = _o$stop2 === void 0 ? null : _o$stop2,
    _o$temperature = o.temperature,
    temperature = _o$temperature === void 0 ? 0.52 : _o$temperature,
    _o$top_p = o.top_p,
    top_p = _o$top_p === void 0 ? 1 : _o$top_p,
    _o$presence_penalty = o.presence_penalty,
    presence_penalty = _o$presence_penalty === void 0 ? 0 : _o$presence_penalty,
    _o$system2 = o.system,
    system = _o$system2 === void 0 ? '' : _o$system2,
    maxTokens = o.maxTokens,
    topP = o.topP,
    presencePenalty = o.presencePenalty;

  // Process messages
  var processedMessages = [{
    role: 'system',
    content: system || ''
  }].concat(_toConsumableArray(messages));
  var payload = {
    messages: processedMessages,
    temperature: temperature
  };
  if (maxTokens || max_tokens) {
    payload.max_tokens = maxTokens || max_tokens;
  }

  // only add params that were specified:
  if (top_p != null || topP != null) {
    payload.top_p = top_p != null ? top_p : topP;
  }
  if (presence_penalty != null || presencePenalty != null) {
    payload.presence_penalty = presence_penalty != null ? presence_penalty : presencePenalty;
  }
  if (stop != null) {
    payload.stop = stop;
  }
  return payload;
};
var taiStylePayloader = exports.taiStylePayloader = function taiStylePayloader(_ref) {
  var _ref$messages = _ref.messages,
    messages = _ref$messages === void 0 ? [] : _ref$messages,
    _ref$max_tokens = _ref.max_tokens,
    max_tokens = _ref$max_tokens === void 0 ? 300 : _ref$max_tokens,
    _ref$stop = _ref.stop,
    stop = _ref$stop === void 0 ? ['', ''] : _ref$stop,
    _ref$temperature = _ref.temperature,
    temperature = _ref$temperature === void 0 ? 0.52 : _ref$temperature,
    _ref$top_p = _ref.top_p,
    top_p = _ref$top_p === void 0 ? 1 : _ref$top_p,
    _ref$frequency_penalt = _ref.frequency_penalty,
    frequency_penalty = _ref$frequency_penalt === void 0 ? 0.01 : _ref$frequency_penalt,
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
    top_k: 50,
    repetition_penalty: 1 + presence_penalty
  };
};
var providers = exports.providers = {
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
    payloader: function payloader(opts) {
      // Use the utility to normalize parameters for Anthropic
      var normalized = normalizeProviderParams(opts, {
        useStopSequences: true,
        // Convert 'stop' to 'stop_sequences'
        clampTemp: true,
        // Clamp temperature to 0.0-1.0
        maxTemp: 1.0,
        // Anthropic's max temperature
        removeParams: ['presence_penalty', 'frequency_penalty'] // Unsupported by Anthropic
      });

      // Extract the parameters we need
      var _normalized$messages = normalized.messages,
        messages = _normalized$messages === void 0 ? [] : _normalized$messages,
        system = normalized.system,
        _normalized$max_token = normalized.max_tokens,
        max_tokens = _normalized$max_token === void 0 ? 300 : _normalized$max_token,
        _normalized$stop_sequ = normalized.stop_sequences,
        stop_sequences = _normalized$stop_sequ === void 0 ? null : _normalized$stop_sequ,
        _normalized$temperatu = normalized.temperature,
        temperature = _normalized$temperatu === void 0 ? 0.52 : _normalized$temperatu,
        _normalized$top_p = normalized.top_p,
        top_p = _normalized$top_p === void 0 ? 1 : _normalized$top_p;
      var payload = {
        messages: messages,
        system: system,
        max_tokens: max_tokens,
        temperature: temperature,
        top_p: top_p
      };

      // Only add if explicitly set, to avoid nulls -- which will error...
      if (stop_sequences) {
        payload.stop_sequences = stop_sequences;
      }
      return payload;
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
    payloader: openaiPayloader
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
  x: {
    constraints: {
      rpmLimit: 100
    },
    endpoint: 'https://api.x.ai/v1/chat/completions',
    key: process.env.X_API_KEY,
    models: {
      fast: {
        name: 'grok-2-latest',
        maxContextSize: 131000
      },
      good: {
        name: 'grok-2-latest',
        maxContextSize: 131000
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
    key: process.env.TOGETHER_API_KEY,
    models: {
      fast: {
        name: 'meta-llama/Llama-3-8b-instruct',
        maxContextSize: 8192
      },
      good: {
        name: 'meta-llama/Llama-3-70b-instruct',
        maxContextSize: 8192
      },
      best: {
        name: 'meta-llama/Meta-Llama-3.1-70B-Instruct',
        maxContextSize: 8192
      }
    },
    headerGen: function headerGen() {
      return {
        'Authorization': "Bearer ".concat(this.key),
        'Content-Type': 'application/json'
      };
    },
    payloader: standardPayloader
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
    payloader: function payloader(opts) {
      // Extract Perplexity-specific parameters
      var search_domain_filter = opts.search_domain_filter,
        return_images = opts.return_images,
        return_related_questions = opts.return_related_questions,
        standardOpts = _objectWithoutProperties(opts, _excluded);

      // Process standard parameters
      var standardPayload = standardPayloader.call(this, standardOpts);

      // Add Perplexity-specific parameters if provided
      if (search_domain_filter !== undefined) {
        standardPayload.search_domain_filter = search_domain_filter;
      }
      if (return_images !== undefined) {
        standardPayload.return_images = return_images;
      }
      if (return_related_questions !== undefined) {
        standardPayload.return_related_questions = return_related_questions;
      }
      return standardPayload;
    }
  },
  mistralai: {
    constraints: {
      rpmLimit: 100
    },
    endpoint: 'https://api.mistral.ai/v1/chat/completions',
    key: process.env.MISTRAL_API_KEY,
    models: {
      superfast: {
        name: 'mistral-tiny',
        maxContextSize: 32000
      },
      fast: {
        name: 'mistral-small',
        maxContextSize: 32000
      },
      good: {
        name: 'mistral-medium',
        maxContextSize: 32000
      },
      best: {
        name: 'mistral-large-latest',
        maxContextSize: 32000
      }
    },
    headerGen: function headerGen() {
      return {
        'Authorization': "Bearer ".concat(this.key),
        'Content-Type': 'application/json'
      };
    },
    payloader: function payloader(opts) {
      // Mistral is very OpenAI-compatible, but has some unique parameters
      var random_seed = opts.random_seed,
        safe_prompt = opts.safe_prompt,
        response_format = opts.response_format,
        standardOpts = _objectWithoutProperties(opts, _excluded2);

      // Process standard parameters
      var standardPayload = standardPayloader.call(this, standardOpts);

      // Add Mistral-specific parameters if provided
      if (random_seed !== undefined) {
        standardPayload.random_seed = random_seed;
      }
      if (safe_prompt !== undefined) {
        standardPayload.safe_prompt = safe_prompt;
      }
      if (response_format !== undefined) {
        standardPayload.response_format = response_format;
      }
      return standardPayload;
    }
  },
  deepseek: {
    constraints: {
      rpmLimit: 100
    },
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    key: process.env.DEEPSEEK_API_KEY,
    models: {
      fast: {
        name: 'deepseek-chat',
        maxContextSize: 64000
      },
      best: {
        name: 'deepseek-reasoner',
        maxContextSize: 64000
      }
    },
    headerGen: function headerGen() {
      return {
        'Authorization': "Bearer ".concat(this.key),
        'Content-Type': 'application/json'
      };
    },
    payloader: function payloader(opts) {
      // DeepSeek is OpenAI-compatible, but has some unique parameters
      var response_format = opts.response_format,
        standardOpts = _objectWithoutProperties(opts, _excluded3);

      // Process standard parameters
      var standardPayload = standardPayloader.call(this, standardOpts);

      // Add DeepSeek-specific parameters if provided
      if (response_format !== undefined) {
        standardPayload.response_format = response_format;
      }
      return standardPayload;
    }
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
function registerProvider(name, config) {
  var _config$constraints, _config$constraints2, _config$constraints3;
  // Validate required fields
  if (!name || typeof name !== 'string') {
    throw new _ProviderErrors.ModelValidationError('Provider name is required');
  }
  if (!config || _typeof(config) !== 'object') {
    throw new _ProviderErrors.ModelValidationError('Provider configuration is required');
  }
  if (!config.endpoint) {
    throw new _ProviderErrors.ModelValidationError('Provider endpoint is required', {
      provider: name
    });
  }

  // Validate models configuration
  if (!config.models || Object.keys(config.models).length === 0) {
    throw new _ProviderErrors.ModelValidationError('Provider must define at least one model', {
      provider: name
    });
  }

  // Add URL validation
  try {
    new URL(config.endpoint);
  } catch (e) {
    throw new _ProviderErrors.ModelValidationError('Invalid endpoint URL', {
      provider: name,
      endpoint: config.endpoint
    });
  }

  // Validate model names
  Object.entries(config.models).forEach(function (_ref2) {
    var _ref3 = _slicedToArray(_ref2, 2),
      alias = _ref3[0],
      model = _ref3[1];
    if (!model.name) {
      throw new _ProviderErrors.ModelValidationError('Each model must have a name', {
        provider: name,
        alias: alias
      });
    }
  });

  // Add to providers registry
  providers[name] = {
    constraints: {
      rpmLimit: ((_config$constraints = config.constraints) === null || _config$constraints === void 0 ? void 0 : _config$constraints.rpmLimit) || 100,
      tokensPerMinute: (_config$constraints2 = config.constraints) === null || _config$constraints2 === void 0 ? void 0 : _config$constraints2.tokensPerMinute,
      requestsPerHour: (_config$constraints3 = config.constraints) === null || _config$constraints3 === void 0 ? void 0 : _config$constraints3.requestsPerHour
    },
    endpoint: config.endpoint,
    key: config.key || process.env["".concat(name.toUpperCase(), "_API_KEY")] || process.env["".concat(name.toUpperCase().replace(/-/g, '_'), "_API_KEY")],
    models: config.models,
    headerGen: config.headerGen || standardHeaderGen,
    payloader: config.payloader || standardPayloader
  };

  // Add any aliases
  if (config.aliases) {
    config.aliases.forEach(function (alias) {
      PROVIDER_ALIASES[alias] = name;
    });
  }
  return providers[name];
}

/**
 * Utility function to normalize and clean up parameters for different providers
 * 
 * @param {Object} opts - The original options object
 * @param {Object} config - Configuration for parameter handling
 * @param {boolean} config.useStopSequences - Whether to rename 'stop' to 'stop_sequences'
 * @param {boolean} config.clampTemp - Whether to clamp temperature to provider's range
 * @param {number} config.maxTemp - Maximum temperature value (default: 1.0)
 * @param {number} config.minTemp - Minimum temperature value (default: 0.0)
 * @returns {Object} - Cleaned up options object
 */
function normalizeProviderParams(opts) {
  var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var result = _objectSpread({}, opts);

  // Handle stop sequences
  if (config.useStopSequences && (typeof result.stop === 'string' || Array.isArray(result.stop))) {
    result.stop_sequences = Array.isArray(result.stop) ? result.stop : [result.stop];
    delete result.stop;
  }

  // Handle temperature clamping
  if (config.clampTemp && typeof result.temperature === 'number') {
    var _config$maxTemp, _config$minTemp;
    var maxTemp = (_config$maxTemp = config.maxTemp) !== null && _config$maxTemp !== void 0 ? _config$maxTemp : 1.0;
    var minTemp = (_config$minTemp = config.minTemp) !== null && _config$minTemp !== void 0 ? _config$minTemp : 0.0;
    result.temperature = Math.min(maxTemp, Math.max(minTemp, result.temperature));
  }

  // Remove unsupported parameters if specified
  if (Array.isArray(config.removeParams)) {
    var _iterator = _createForOfIteratorHelper(config.removeParams),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var param = _step.value;
        delete result[param];
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  }
  return result;
}