function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4
};
var CONFIG = {
  logging: {
    level: process.env.NODE_ENV === 'production' ? 'ERROR' : 'INFO',
    customLogger: null
  },
  defaults: {
    temperature: 0.72,
    maxTokens: 4000,
    presencePenalty: 0,
    topP: 1,
    mode: 'state_open',
    model: 'claude:good',
    modelFallbacks: ['claude:good', 'openai:good', 'claude:fast', 'openai:fast']
  }
};

// Validation helper
var validateLogLevel = function validateLogLevel(level) {
  return LOG_LEVELS[level === null || level === void 0 ? void 0 : level.toUpperCase()] !== undefined ? level.toUpperCase() : 'INFO';
};
export function configure() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  console.log('configure()', options);
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
}
export function getConfig() {
  var frozenConfig = _objectSpread({}, CONFIG);
  Object.freeze(frozenConfig);
  Object.freeze(frozenConfig.logging);
  return frozenConfig;
}
export { LOG_LEVELS };