"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ValidationError = exports.ParameterValidationError = exports.ModelValidationError = exports.MessageValidationError = void 0;
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
var ValidationError = exports.ValidationError = /*#__PURE__*/function (_Error) {
  function ValidationError(message, code) {
    var _this;
    var details = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    _classCallCheck(this, ValidationError);
    _this = _callSuper(this, ValidationError, [message]);
    _this.name = 'ValidationError';
    _this.code = code;
    _this.details = details;
    _this.timestamp = new Date().toISOString();
    return _this;
  }
  _inherits(ValidationError, _Error);
  return _createClass(ValidationError);
}(/*#__PURE__*/_wrapNativeSuper(Error));
var MessageValidationError = exports.MessageValidationError = /*#__PURE__*/function (_ValidationError) {
  function MessageValidationError(message, details) {
    var _this2;
    _classCallCheck(this, MessageValidationError);
    _this2 = _callSuper(this, MessageValidationError, [message, 'MESSAGE_VALIDATION_ERROR', details]);
    _this2.name = 'MessageValidationError';
    return _this2;
  }
  _inherits(MessageValidationError, _ValidationError);
  return _createClass(MessageValidationError);
}(ValidationError);
var ModelValidationError = exports.ModelValidationError = /*#__PURE__*/function (_ValidationError2) {
  function ModelValidationError(message, details) {
    var _this3;
    _classCallCheck(this, ModelValidationError);
    _this3 = _callSuper(this, ModelValidationError, [message, 'MODEL_VALIDATION_ERROR', details]);
    _this3.name = 'ModelValidationError';
    return _this3;
  }
  _inherits(ModelValidationError, _ValidationError2);
  return _createClass(ModelValidationError);
}(ValidationError);
var ParameterValidationError = exports.ParameterValidationError = /*#__PURE__*/function (_ValidationError3) {
  function ParameterValidationError(message, details) {
    var _this4;
    _classCallCheck(this, ParameterValidationError);
    _this4 = _callSuper(this, ParameterValidationError, [message, 'PARAMETER_VALIDATION_ERROR', details]);
    _this4.name = 'ParameterValidationError';
    return _this4;
  }
  _inherits(ParameterValidationError, _ValidationError3);
  return _createClass(ParameterValidationError);
}(ValidationError);