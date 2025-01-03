function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
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
    tagPrefix: '⁂',
    closePrefix: '⁂',
    openBrace: 'START(',
    closeBrace: 'END(',
    braceSuffix: ')'
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
    // Validate properties that must be non-empty strings
    var requiredNonEmptyProps = ['tagPrefix', 'closePrefix', 'braceSuffix'];
    var optionalProps = ['openBrace', 'closeBrace'];

    // Validate each provided property
    Object.entries(options.idioSymbols).forEach(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
        key = _ref2[0],
        value = _ref2[1];
      // All properties must be strings
      if (typeof value !== 'string') {
        throw new Error("".concat(key, " must be a non-empty string"));
      }
      // Some properties must be non-empty
      if (requiredNonEmptyProps.includes(key) && value.length === 0) {
        throw new Error("".concat(key, " cannot be empty"));
      }
    });

    // Ensure we preserve defaults for non-provided values
    CONFIG.idioSymbols = _objectSpread(_objectSpread(_objectSpread({}, DEFAULT_CONFIG.idioSymbols), CONFIG.idioSymbols), options.idioSymbols);
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