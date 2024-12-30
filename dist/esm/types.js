function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
export var Type = /*#__PURE__*/function () {
  function Type(hint) {
    _classCallCheck(this, Type);
    this.hint = hint;
    this["default"] = undefined;
    this.transform = undefined;
    this.validate = undefined;
    this.isCData = false;
  }
  return _createClass(Type, [{
    key: "withDefault",
    value: function withDefault(value) {
      this["default"] = value;
      return this;
    }
  }, {
    key: "withTransform",
    value: function withTransform(transform) {
      this.transform = transform;
      return this;
    }
  }, {
    key: "withValidate",
    value: function withValidate(validate) {
      this.validate = validate;
      return this;
    }
  }, {
    key: "withHint",
    value: function withHint(hint) {
      this.hint = hint;
      return this;
    }
  }, {
    key: "parse",
    value: function parse(value) {
      return value;
    }
  }]);
}();
export var StringType = /*#__PURE__*/function (_Type) {
  function StringType() {
    _classCallCheck(this, StringType);
    return _callSuper(this, StringType, arguments);
  }
  _inherits(StringType, _Type);
  return _createClass(StringType, [{
    key: "parse",
    value: function parse(value) {
      return (value === null || value === void 0 ? void 0 : value.trim()) || '';
    }
  }]);
}(Type);
export var NumberType = /*#__PURE__*/function (_Type2) {
  function NumberType() {
    _classCallCheck(this, NumberType);
    return _callSuper(this, NumberType, arguments);
  }
  _inherits(NumberType, _Type2);
  return _createClass(NumberType, [{
    key: "parse",
    value: function parse(value) {
      return parseFloat((value === null || value === void 0 ? void 0 : value.trim()) || '');
    }
  }]);
}(Type);
export var BooleanType = /*#__PURE__*/function (_Type3) {
  function BooleanType() {
    _classCallCheck(this, BooleanType);
    return _callSuper(this, BooleanType, arguments);
  }
  _inherits(BooleanType, _Type3);
  return _createClass(BooleanType, [{
    key: "parse",
    value: function parse(value) {
      var _value$trim;
      var text = (value === null || value === void 0 || (_value$trim = value.trim()) === null || _value$trim === void 0 ? void 0 : _value$trim.toLowerCase()) || '';
      var isWordedAsFalse = ['false', 'no', 'null'].includes(text);
      var isEssentiallyFalsey = text === '' || isWordedAsFalse || parseFloat(text) === 0;
      return !isEssentiallyFalsey;
    }
  }]);
}(Type);
export var RawType = /*#__PURE__*/function (_Type4) {
  function RawType(hint) {
    var _this;
    _classCallCheck(this, RawType);
    _this = _callSuper(this, RawType, [hint]);
    _this.isCData = true;
    return _this;
  }
  _inherits(RawType, _Type4);
  return _createClass(RawType, [{
    key: "parse",
    value: function parse(value) {
      return value || '';
    }
  }]);
}(Type);
export var EnumType = /*#__PURE__*/function (_Type5) {
  function EnumType(hint, allowedValues) {
    var _this2;
    _classCallCheck(this, EnumType);
    _this2 = _callSuper(this, EnumType, [hint]);
    if (!allowedValues && Array.isArray(hint)) {
      allowedValues = hint;
    }
    if (!allowedValues || !Array.isArray(allowedValues) || allowedValues.length === 0 || allowedValues.some(function (value) {
      return typeof value !== 'string';
    })) {
      throw new Error('EnumType requires allowedValues (array of strings)');
    }
    _this2.allowedValues = allowedValues;
    _this2.validate = function (value) {
      return _this2.allowedValues.includes(value);
    };
    return _this2;
  }
  _inherits(EnumType, _Type5);
  return _createClass(EnumType, [{
    key: "parse",
    value: function parse(value) {
      return (value === null || value === void 0 ? void 0 : value.trim()) || '';
    }
  }]);
}(Type);

// Create the types object with all type creators
var types = {
  // String types
  string: function string(hint) {
    return new StringType(hint);
  },
  str: function str(hint) {
    return new StringType(hint);
  },
  // Number types
  number: function number(hint) {
    return new NumberType(hint);
  },
  num: function num(hint) {
    return new NumberType(hint);
  },
  // Boolean types
  "boolean": function boolean(hint) {
    return new BooleanType(hint);
  },
  bool: function bool(hint) {
    return new BooleanType(hint);
  },
  // Raw type
  raw: function raw(hint) {
    return new RawType(hint);
  },
  // Enum type
  "enum": function _enum(hint, values) {
    return new EnumType(hint, values);
  }
};
export { types };
export default types;