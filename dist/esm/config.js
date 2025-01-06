function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { LOG_LEVELS } from './LogLevels.mjs';
import { ClientProvider } from './ClientProvider.mjs';
import { Logger } from './Logger.mjs';
var DEFAULT_CONFIG = {
  logging: {
    level: 'ERROR',
    customLogger: null
  },
  clientProvider: null,
  globalParser: 'xml',
  idioSymbols: {
    // openTagPrefix, closeTagPrefix, openTag, closeTag, tagSuffix
    openTagPrefix: ['@'],
    closeTagPrefix: ['@'],
    tagOpener: ['START('],
    tagCloser: ['END('],
    tagSuffix: [')']
  },
  defaults: {
    temperature: 0.72,
    maxTokens: 300,
    presencePenalty: 0,
    topP: 1,
    mode: 'state_open',
    strategy: 'default',
    model: ['anthropic:good', 'openai:good', 'anthropic:fast', 'openai:fast'],
    keys: {},
    errorMessages: {
      genericFailure: "It seems we have encountered issues responding, please try again later or get in touch with the website owner.",
      rateLimitExceeded: "Rate limit exceeded. Please try again later.",
      invalidRequest: "Invalid request. Please check your input.",
      authenticationFailed: "Authentication failed. Please check your credentials.",
      resourceNotFound: "The requested resource was not found.",
      serviceUnavailable: "The service is temporarily unavailable. Please try again later.",
      networkError: "Failed to connect to the service. Please check your connection and try again.",
      unexpectedError: "An unexpected error occurred. Please try again later."
    }
  }
};
var CONFIG = _objectSpread({}, DEFAULT_CONFIG);

// Validation helper
var validateLogLevel = function validateLogLevel(level) {
  return LOG_LEVELS[level === null || level === void 0 ? void 0 : level.toUpperCase()] !== undefined ? level.toUpperCase() : 'INFO';
};
export function configure() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  // Validate parser type if provided
  if (options.globalParser) {
    if (!['xml', 'idio'].includes(options.globalParser)) {
      throw new Error('Invalid parser type. Must be either "xml" or "idio"');
    }
    CONFIG.globalParser = options.globalParser;
  }

  // Handle clientProvider string -> ClientProvider conversion
  if (options.clientProvider) {
    var provider = typeof options.clientProvider === 'string' ? new ClientProvider(options.clientProvider) : options.clientProvider;

    // Set logger on provider
    var logger = new Logger('ClientProvider');
    provider.setLogger(logger);
    CONFIG = _objectSpread(_objectSpread({}, CONFIG), {}, {
      clientProvider: provider
    });
  }
  if (options.logging) {
    CONFIG = _objectSpread(_objectSpread({}, CONFIG), {}, {
      logging: _objectSpread(_objectSpread(_objectSpread({}, CONFIG.logging), options.logging.level && {
        level: validateLogLevel(options.logging.level)
      }), options.logging.custom !== undefined && {
        customLogger: typeof options.logging.custom === 'function' ? options.logging.custom : null
      })
    });

    // Log configuration changes
    if (CONFIG.logging.customLogger) {
      CONFIG.logging.customLogger('info', 'Config', 'Logging configuration updated:', "level=".concat(CONFIG.logging.level), "customLogger=".concat(CONFIG.logging.customLogger ? 'provided' : 'none'));
    }
  }

  // Allow setting global defaults
  if (options.defaults) {
    CONFIG = _objectSpread(_objectSpread({}, CONFIG), {}, {
      defaults: _objectSpread(_objectSpread({}, CONFIG.defaults), options.defaults)
    });

    // Log defaults update separately
    if (CONFIG.logging.customLogger) {
      CONFIG.logging.customLogger('info', 'Config', 'Global defaults updated:', CONFIG.defaults);
    }
  }

  // Handle keys in defaults
  if (options.keys) {
    CONFIG = _objectSpread(_objectSpread({}, CONFIG), {}, {
      defaults: _objectSpread(_objectSpread({}, CONFIG.defaults), {}, {
        keys: _objectSpread(_objectSpread({}, CONFIG.defaults.keys), options.keys)
      })
    });
  }

  // Handle idioSymbols configuration
  if (options.idioSymbols) {
    var _options$idioSymbols$, _options$idioSymbols$2, _options$idioSymbols$3, _options$idioSymbols$4, _options$idioSymbols$5;
    // Convert single values to arrays for validation
    var normalizeToArray = function normalizeToArray(value) {
      return Array.isArray(value) ? value : [value];
    };
    var symbols = {
      openTagPrefix: normalizeToArray((_options$idioSymbols$ = options.idioSymbols.openTagPrefix) !== null && _options$idioSymbols$ !== void 0 ? _options$idioSymbols$ : DEFAULT_CONFIG.idioSymbols.openTagPrefix),
      closeTagPrefix: normalizeToArray((_options$idioSymbols$2 = options.idioSymbols.closeTagPrefix) !== null && _options$idioSymbols$2 !== void 0 ? _options$idioSymbols$2 : DEFAULT_CONFIG.idioSymbols.closeTagPrefix),
      tagOpener: normalizeToArray((_options$idioSymbols$3 = options.idioSymbols.tagOpener) !== null && _options$idioSymbols$3 !== void 0 ? _options$idioSymbols$3 : DEFAULT_CONFIG.idioSymbols.tagOpener),
      tagCloser: normalizeToArray((_options$idioSymbols$4 = options.idioSymbols.tagCloser) !== null && _options$idioSymbols$4 !== void 0 ? _options$idioSymbols$4 : DEFAULT_CONFIG.idioSymbols.tagCloser),
      tagSuffix: normalizeToArray((_options$idioSymbols$5 = options.idioSymbols.tagSuffix) !== null && _options$idioSymbols$5 !== void 0 ? _options$idioSymbols$5 : DEFAULT_CONFIG.idioSymbols.tagSuffix)
    };

    // 1. Basic non-empty string validation
    var _iterator = _createForOfIteratorHelper(symbols.tagSuffix),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var tagSuffix = _step.value;
        if (typeof tagSuffix !== 'string' || tagSuffix.length === 0) {
          throw new Error('tagSuffix must be a non-empty string');
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
    var _iterator2 = _createForOfIteratorHelper(symbols.openTagPrefix),
      _step2;
    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        var openTagPrefix = _step2.value;
        if (typeof openTagPrefix !== 'string' || openTagPrefix.length === 0) {
          throw new Error('openTagPrefix must be a non-empty string');
        }
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }
    var _iterator3 = _createForOfIteratorHelper(symbols.closeTagPrefix),
      _step3;
    try {
      for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
        var closeTagPrefix = _step3.value;
        if (typeof closeTagPrefix !== 'string' || closeTagPrefix.length === 0) {
          throw new Error('closeTagPrefix must be a non-empty string');
        }
      }

      // 2. Prefix Containment Rule
    } catch (err) {
      _iterator3.e(err);
    } finally {
      _iterator3.f();
    }
    if (symbols.openTagPrefix.every(function (open) {
      return symbols.closeTagPrefix.includes(open);
    }) && symbols.tagOpener.every(function (opener) {
      return symbols.tagCloser.includes(opener);
    })) {
      throw new Error('Configuration must provide way to distinguish opening from closing tags');
    }

    // 3. Recursive Definition Rule
    if (symbols.openTagPrefix.some(function (prefix) {
      return symbols.tagSuffix.some(function (suffix) {
        return prefix.includes(suffix) || suffix.includes(prefix);
      });
    }) || symbols.closeTagPrefix.some(function (prefix) {
      return symbols.tagSuffix.some(function (suffix) {
        return prefix.includes(suffix) || suffix.includes(prefix);
      });
    })) {
      throw new Error('Prefixes and suffixes cannot contain each other');
    }

    // 4. Complete Ambiguity Rule
    if (symbols.openTagPrefix.every(function (open) {
      return symbols.closeTagPrefix.includes(open);
    }) && symbols.tagOpener.every(function (opener) {
      return symbols.tagCloser.includes(opener);
    }) && symbols.tagOpener.length === 0) {
      throw new Error('Configuration creates completely ambiguous parsing');
    }

    // 5. Suffix Dependency Rule
    if (symbols.tagSuffix.some(function (suffix) {
      return !suffix;
    })) {
      throw new Error('Tag suffix is required for unambiguous parsing');
    }

    // Apply validated configuration
    CONFIG.idioSymbols = _objectSpread(_objectSpread(_objectSpread({}, DEFAULT_CONFIG.idioSymbols), CONFIG.idioSymbols), symbols);
  }
}
export function getConfig() {
  var frozenConfig = _objectSpread({}, CONFIG);
  Object.freeze(frozenConfig);
  Object.freeze(frozenConfig.logging);
  return frozenConfig;
}
export { LOG_LEVELS };
export function resetConfig() {
  CONFIG = _objectSpread({}, DEFAULT_CONFIG);
}