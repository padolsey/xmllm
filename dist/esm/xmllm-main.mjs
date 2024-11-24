var _excluded = ["prompt", "schema", "system", "closed"];
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var s = Object.getOwnPropertySymbols(e); for (r = 0; r < s.length; r++) o = s[r], t.includes(o) || {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (e.includes(n)) continue; t[n] = r[n]; } return t; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import xmllmCore from './xmllm.mjs';
import Stream from './Stream.mjs';
import { createProvidersWithKeys } from './PROVIDERS.mjs';
import ProviderManager from './ProviderManager.mjs';
import XMLStream from './XMLStream.mjs';
function xmllm(pipelineFn) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var providerManager;
  if (options.apiKeys) {
    var providers = createProvidersWithKeys(options.apiKeys);
    providerManager = new ProviderManager(providers);
  }
  return xmllmCore(pipelineFn, _objectSpread(_objectSpread({}, options), {}, {
    llmStream: options.llmStream || Stream,
    providerManager: providerManager
  }));
}

// Enhanced stream function with flexible config
export function stream(promptOrConfig) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var config = {};

  // Handle different argument patterns
  if (typeof promptOrConfig === 'string') {
    config = _objectSpread({
      prompt: promptOrConfig
    }, options);
  } else if (_typeof(promptOrConfig) === 'object') {
    config = _objectSpread(_objectSpread({}, promptOrConfig), options);
  }
  var _config = config,
    prompt = _config.prompt,
    schema = _config.schema,
    system = _config.system,
    closed = _config.closed,
    restOptions = _objectWithoutProperties(_config, _excluded);

  // If schema is provided, use promptComplex style config
  if (schema) {
    return new XMLStream([['req', {
      messages: [{
        role: 'user',
        content: prompt
      }],
      schema: schema,
      system: system,
      doMapSelectClosed: closed
    }]], restOptions);
  }

  // Basic prompt
  return new XMLStream([['req', prompt]], _objectSpread(_objectSpread({}, restOptions), {}, {
    doMapSelectClosed: closed
  }));
}
export function simple(prompt, schema) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return stream(_objectSpread({
    prompt: prompt,
    schema: schema,
    closed: true
  }, options)).merge().value();
}
export default xmllm;