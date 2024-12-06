"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ProviderTimeoutError = exports.ProviderRateLimitError = exports.ProviderNetworkError = exports.ProviderError = exports.ProviderAuthenticationError = exports.ModelValidationError = void 0;
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _wrapNativeSuper(t) { var r = "function" == typeof Map ? new Map() : void 0; return _wrapNativeSuper = function _wrapNativeSuper(t) { if (null === t || !_isNativeFunction(t)) return t; if ("function" != typeof t) throw new TypeError("Super expression must either be null or a function"); if (void 0 !== r) { if (r.has(t)) return r.get(t); r.set(t, Wrapper); } function Wrapper() { return _construct(t, arguments, _getPrototypeOf(this).constructor); } return Wrapper.prototype = Object.create(t.prototype, { constructor: { value: Wrapper, enumerable: !1, writable: !0, configurable: !0 } }), _setPrototypeOf(Wrapper, t); }, _wrapNativeSuper(t); }
function _construct(t, e, r) { if (_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments); var o = [null]; o.push.apply(o, e); var p = new (t.bind.apply(t, o))(); return r && _setPrototypeOf(p, r.prototype), p; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _isNativeFunction(t) { try { return -1 !== Function.toString.call(t).indexOf("[native code]"); } catch (n) { return "function" == typeof t; } }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
var ProviderError = exports.ProviderError = /*#__PURE__*/function (_Error) {
  function ProviderError(message, code, provider) {
    var _this;
    _classCallCheck(this, ProviderError);
    _this = _callSuper(this, ProviderError, [message]);
    _this.name = 'ProviderError';
    _this.code = code;
    _this.provider = provider;
    _this.timestamp = new Date().toISOString();
    return _this;
  }
  _inherits(ProviderError, _Error);
  return _createClass(ProviderError);
}(/*#__PURE__*/_wrapNativeSuper(Error));
var ProviderRateLimitError = exports.ProviderRateLimitError = /*#__PURE__*/function (_ProviderError) {
  function ProviderRateLimitError(provider, resetInMs, limits) {
    var _this2;
    _classCallCheck(this, ProviderRateLimitError);
    _this2 = _callSuper(this, ProviderRateLimitError, ["Rate limit exceeded for provider ".concat(provider), 'RATE_LIMIT_ERROR', provider]);
    _this2.name = 'ProviderRateLimitError';
    _this2.resetInMs = resetInMs;
    _this2.limits = limits;
    return _this2;
  }
  _inherits(ProviderRateLimitError, _ProviderError);
  return _createClass(ProviderRateLimitError);
}(ProviderError);
var ProviderAuthenticationError = exports.ProviderAuthenticationError = /*#__PURE__*/function (_ProviderError2) {
  function ProviderAuthenticationError(provider, details) {
    var _this3;
    _classCallCheck(this, ProviderAuthenticationError);
    _this3 = _callSuper(this, ProviderAuthenticationError, ["Authentication failed for provider ".concat(provider), 'AUTH_ERROR', provider]);
    _this3.name = 'ProviderAuthenticationError';
    _this3.details = details;
    return _this3;
  }
  _inherits(ProviderAuthenticationError, _ProviderError2);
  return _createClass(ProviderAuthenticationError);
}(ProviderError);
var ProviderNetworkError = exports.ProviderNetworkError = /*#__PURE__*/function (_ProviderError3) {
  function ProviderNetworkError(provider, statusCode, details) {
    var _this4;
    _classCallCheck(this, ProviderNetworkError);
    _this4 = _callSuper(this, ProviderNetworkError, ["Network error with provider ".concat(provider), 'NETWORK_ERROR', provider]);
    _this4.name = 'ProviderNetworkError';
    _this4.statusCode = statusCode;
    _this4.details = details;
    return _this4;
  }
  _inherits(ProviderNetworkError, _ProviderError3);
  return _createClass(ProviderNetworkError);
}(ProviderError);
var ProviderTimeoutError = exports.ProviderTimeoutError = /*#__PURE__*/function (_ProviderError4) {
  function ProviderTimeoutError(provider, timeoutMs) {
    var _this5;
    _classCallCheck(this, ProviderTimeoutError);
    _this5 = _callSuper(this, ProviderTimeoutError, ["Request to provider ".concat(provider, " timed out after ").concat(timeoutMs, "ms"), 'TIMEOUT_ERROR', provider]);
    _this5.name = 'ProviderTimeoutError';
    _this5.timeoutMs = timeoutMs;
    return _this5;
  }
  _inherits(ProviderTimeoutError, _ProviderError4);
  return _createClass(ProviderTimeoutError);
}(ProviderError);
var ModelValidationError = exports.ModelValidationError = /*#__PURE__*/function (_ProviderError5) {
  function ModelValidationError(message, details) {
    var _this6;
    _classCallCheck(this, ModelValidationError);
    _this6 = _callSuper(this, ModelValidationError, [message, 'MODEL_VALIDATION_ERROR', details === null || details === void 0 ? void 0 : details.provider]);
    _this6.name = 'ModelValidationError';
    _this6.details = details;
    return _this6;
  }
  _inherits(ModelValidationError, _ProviderError5);
  return _createClass(ModelValidationError);
}(ProviderError);