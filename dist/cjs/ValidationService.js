"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _ValidationErrors = require("./errors/ValidationErrors.js");
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var ValidationService = /*#__PURE__*/function () {
  function ValidationService() {
    _classCallCheck(this, ValidationService);
  }
  return _createClass(ValidationService, null, [{
    key: "validateMessages",
    value: function validateMessages(messages) {
      var _systemMessage;
      if (!Array.isArray(messages)) {
        throw new _ValidationErrors.MessageValidationError('Messages must be an array', {
          received: _typeof(messages)
        });
      }

      // Extract system message if it's the first message
      var systemMessage = null;
      if (messages.length > 0 && messages[0].role === 'system') {
        // Validate system message content first
        if (typeof messages[0].content !== 'string') {
          throw new _ValidationErrors.MessageValidationError('System message content must be a string', {
            contentType: _typeof(messages[0].content)
          });
        }
        systemMessage = messages[0];
        messages = messages.slice(1);
      }
      messages.forEach(function (message, index) {
        if (!message.role || !message.content) {
          throw new _ValidationErrors.MessageValidationError('Message must have role and content', {
            index: index,
            message: message
          });
        }
        if (!['user', 'assistant'].includes(message.role)) {
          throw new _ValidationErrors.MessageValidationError('Invalid message role', {
            index: index,
            role: message.role,
            validRoles: ['user', 'assistant']
          });
        }
        if (typeof message.content !== 'string') {
          throw new _ValidationErrors.MessageValidationError('Message content must be a string', {
            index: index,
            contentType: _typeof(message.content)
          });
        }
      });
      return {
        systemMessage: ((_systemMessage = systemMessage) === null || _systemMessage === void 0 ? void 0 : _systemMessage.content) || '',
        messages: messages
      };
    }
  }, {
    key: "validateModel",
    value: function validateModel(model, availableModels) {
      var _this = this;
      if (Array.isArray(model)) {
        model.forEach(function (m, index) {
          _this.validateSingleModel(m, availableModels, index);
        });
        return true;
      }
      return this.validateSingleModel(model, availableModels);
    }
  }, {
    key: "validateSingleModel",
    value: function validateSingleModel(model, availableModels) {
      var index = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      if (typeof model !== 'string') {
        if (!(model !== null && model !== void 0 && model.name)) {
          throw new _ValidationErrors.ModelValidationError('Custom model must me object with a name', {
            model: model,
            index: index
          });
        }
        return true;
      }
      var _split = (model || '').split(':'),
        _split2 = _slicedToArray(_split, 2),
        provider = _split2[0],
        type = _split2[1];
      if (!provider || !type) {
        throw new _ValidationErrors.ModelValidationError('Invalid model format', {
          model: model,
          index: index,
          expectedFormat: 'provider:type'
        });
      }
      if (!availableModels[provider]) {
        throw new _ValidationErrors.ModelValidationError('Provider not found', {
          provider: provider,
          index: index,
          availableProviders: Object.keys(availableModels)
        });
      }
      if (!availableModels[provider].models[type]) {
        throw new _ValidationErrors.ModelValidationError('Model type not found for provider', {
          provider: provider,
          type: type,
          index: index,
          availableTypes: Object.keys(availableModels[provider].models)
        });
      }
      return true;
    }
  }, {
    key: "validateConstraints",
    value: function validateConstraints(constraints) {
      if (!constraints) return true;
      if (constraints.rpmLimit !== undefined) {
        // First check if it's a number at all
        if (typeof constraints.rpmLimit !== 'number' || Number.isNaN(constraints.rpmLimit)) {
          throw new _ValidationErrors.ParameterValidationError('rpmLimit must be a whole number', {
            rpmLimit: constraints.rpmLimit
          });
        }

        // Then check for finite
        if (!Number.isFinite(constraints.rpmLimit)) {
          throw new _ValidationErrors.ParameterValidationError('rpmLimit must be finite', {
            rpmLimit: constraints.rpmLimit
          });
        }

        // Then check for integer
        if (!Number.isInteger(constraints.rpmLimit)) {
          throw new _ValidationErrors.ParameterValidationError('rpmLimit must be a whole number', {
            rpmLimit: constraints.rpmLimit
          });
        }

        // Finally check for positive
        if (constraints.rpmLimit <= 0) {
          throw new _ValidationErrors.ParameterValidationError('rpmLimit must be positive', {
            rpmLimit: constraints.rpmLimit
          });
        }
      }
      return true;
    }
  }, {
    key: "validateParameters",
    value: function validateParameters(params) {
      var temperature = params.temperature,
        max_tokens = params.max_tokens,
        stream = params.stream,
        cache = params.cache;
      if (temperature !== undefined) {
        // OpenAI allows up to 2.0; let's just use that.
        if (typeof temperature !== 'number' || temperature < 0 || temperature > 2) {
          throw new _ValidationErrors.ParameterValidationError('Temperature must be between 0 and 2', {
            temperature: temperature
          });
        }
      }
      if (max_tokens !== undefined) {
        if (!Number.isInteger(max_tokens) || max_tokens <= 0) {
          throw new _ValidationErrors.ParameterValidationError('max_tokens must be a positive integer', {
            max_tokens: max_tokens
          });
        }
      }
      if (stream !== undefined && typeof stream !== 'boolean') {
        throw new _ValidationErrors.ParameterValidationError('stream must be a boolean', {
          stream: stream
        });
      }
      if (cache !== undefined && typeof cache !== 'boolean') {
        throw new _ValidationErrors.ParameterValidationError('cache must be a boolean', {
          cache: cache
        });
      }
      if (params.constraints) {
        this.validateConstraints(params.constraints);
      }
      return true;
    }
  }, {
    key: "validateConfig",
    value: function validateConfig(config) {
      // ... existing validation ...

      // Hints requires schema
      if (config.hints && !config.schema) {
        throw new Error('Cannot provide hints without a schema');
      }

      // If both provided, validate hints against schema
      if (config.hints && config.schema) {
        IncomingXMLParserSelectorEngine.validateHints(config.schema, config.hints);
      }
    }
  }]);
}();
var _default = exports["default"] = ValidationService;