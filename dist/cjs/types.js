"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.types = exports["default"] = exports.Type = exports.StringType = exports.RawType = exports.NumberType = exports.ItemsType = exports.EnumType = exports.BooleanType = void 0;
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
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
var Type = exports.Type = /*#__PURE__*/function () {
  function Type(hint) {
    _classCallCheck(this, Type);
    this.hint = hint;
    this["default"] = undefined;
    this.transform = undefined;
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
    key: "withHint",
    value: function withHint(hint) {
      this.hint = hint;
      return this;
    }
  }, {
    key: "parse",
    value: function parse(value, element, applyMapping) {
      // 1. If element doesn't exist at all, use default or undefined
      if (!element) {
        return this["default"] !== undefined ? this["default"] : undefined;
      }

      // 2. Parse the raw value
      var parsed = this._parse(value, element, applyMapping);

      // 3. Apply transform if present
      if (this.transform) {
        parsed = this.transform(parsed);
      }
      return parsed;
    }
  }, {
    key: "_parse",
    value: function _parse(value) {
      return value;
    }

    // Optional method that types can implement to handle node mapping
  }, {
    key: "mapNodes",
    value: function mapNodes(element) {
      return null; // Default implementation returns null to indicate no node mapping
    }

    /**
     * Generate scaffold content for this type
     * @param {Function} genTypeHint Function to generate type hint (from parser)
     * @returns {string} Scaffold content
     */
  }, {
    key: "generateScaffold",
    value: function generateScaffold(genTypeHint) {
      // If there's a hint, use it directly
      if (this.hint) {
        return genTypeHint("".concat(this.constructor.name.replace('Type', ''), ": ").concat(this.hint));
      }
      // Otherwise just show the type
      return genTypeHint(this.constructor.name.replace('Type', ''));
    }

    // New method for type-specific empty values
  }, {
    key: "getEmptyValue",
    value: function getEmptyValue() {
      return ''; // Default empty value
    }
  }]);
}();
var StringType = exports.StringType = /*#__PURE__*/function (_Type) {
  function StringType() {
    _classCallCheck(this, StringType);
    return _callSuper(this, StringType, arguments);
  }
  _inherits(StringType, _Type);
  return _createClass(StringType, [{
    key: "_parse",
    value: function _parse(value) {
      return (value === null || value === void 0 ? void 0 : value.trim()) || '';
    }
  }, {
    key: "generateScaffold",
    value: function generateScaffold(genTypeHint) {
      if (this.hint) {
        return genTypeHint("String: ".concat(this.hint));
      }
      return genTypeHint('String');
    }
  }]);
}(Type);
var NumberType = exports.NumberType = /*#__PURE__*/function (_Type2) {
  function NumberType() {
    _classCallCheck(this, NumberType);
    return _callSuper(this, NumberType, arguments);
  }
  _inherits(NumberType, _Type2);
  return _createClass(NumberType, [{
    key: "_parse",
    value: function _parse(value) {
      if (!value) return NaN;
      var str = value.trim();

      // Find first occurrence of a number pattern:
      // -? : Optional negative sign
      // \d* : Zero or more digits
      // \.? : Optional decimal point
      // \d+ : One or more digits
      var match = str.match(/-?\d*\.?\d+/);
      if (!match) return NaN;

      // Get the substring from the start of the number onwards
      var fromNumber = str.slice(match.index);
      return parseFloat(fromNumber);
    }
  }, {
    key: "generateScaffold",
    value: function generateScaffold(genTypeHint) {
      if (this.hint) {
        return genTypeHint("Number: ".concat(this.hint));
      }
      return genTypeHint('Number');
    }
  }, {
    key: "getEmptyValue",
    value: function getEmptyValue() {
      return 0;
    }
  }]);
}(Type);
var BooleanType = exports.BooleanType = /*#__PURE__*/function (_Type3) {
  function BooleanType(hint) {
    var _this;
    _classCallCheck(this, BooleanType);
    _this = _callSuper(this, BooleanType, [hint]);
    _this["default"] = false;
    return _this;
  }
  _inherits(BooleanType, _Type3);
  return _createClass(BooleanType, [{
    key: "determineTruthiness",
    value: function determineTruthiness(value) {
      var _value$trim;
      var text = (value === null || value === void 0 || (_value$trim = value.trim()) === null || _value$trim === void 0 ? void 0 : _value$trim.toLowerCase()) || '';
      var isWordedAsFalse = ['false', 'no', 'null'].includes(text);
      var isEssentiallyFalsey = isWordedAsFalse || parseFloat(text) === 0;
      if (text === '') {
        return this["default"];
      }
      return !isEssentiallyFalsey;
    }
  }, {
    key: "_parse",
    value: function _parse(value) {
      return this.determineTruthiness(value);
    }
  }, {
    key: "generateScaffold",
    value: function generateScaffold(genTypeHint) {
      if (this.hint) {
        return genTypeHint("Boolean: ".concat(this.hint));
      }
      return genTypeHint('Boolean');
    }
  }, {
    key: "getEmptyValue",
    value: function getEmptyValue() {
      return false;
    }
  }]);
}(Type);
var RawType = exports.RawType = /*#__PURE__*/function (_Type4) {
  function RawType(hint) {
    var _this2;
    _classCallCheck(this, RawType);
    _this2 = _callSuper(this, RawType, [hint]);
    _this2.isCData = true;
    return _this2;
  }
  _inherits(RawType, _Type4);
  return _createClass(RawType, [{
    key: "_parse",
    value: function _parse(value) {
      return value || '';
    }
  }, {
    key: "generateScaffold",
    value: function generateScaffold(genTypeHint) {
      if (this.hint) {
        return genTypeHint("Raw: ".concat(this.hint));
      }
      return genTypeHint('Raw');
    }
  }]);
}(Type);
var EnumType = exports.EnumType = /*#__PURE__*/function (_Type5) {
  function EnumType(hint, allowedValues) {
    var _this3;
    _classCallCheck(this, EnumType);
    _this3 = _callSuper(this, EnumType, [hint]);
    if (!allowedValues && Array.isArray(hint)) {
      allowedValues = hint;
    }
    if (!allowedValues || !Array.isArray(allowedValues) || allowedValues.length === 0 || allowedValues.some(function (value) {
      return typeof value !== 'string';
    })) {
      throw new Error('EnumType requires allowedValues (array of strings)');
    }
    _this3.allowedValues = allowedValues;
    // Transform to default if not in allowed values
    _this3.transform = function (value) {
      return _this3.allowedValues.includes(value) ? value : _this3["default"];
    };
    return _this3;
  }
  _inherits(EnumType, _Type5);
  return _createClass(EnumType, [{
    key: "_parse",
    value: function _parse(value) {
      return (value === null || value === void 0 ? void 0 : value.trim()) || '';
    }
  }, {
    key: "generateScaffold",
    value: function generateScaffold(genTypeHint) {
      var enumValues = this.allowedValues.join('|');
      if (this.hint) {
        return genTypeHint("Enum: ".concat(this.hint, " (allowed values: ").concat(enumValues, ")"));
      }
      return genTypeHint("Enum: (allowed values: ".concat(enumValues, ")"));
    }
  }]);
}(Type);
var ItemsType = exports.ItemsType = /*#__PURE__*/function (_Type6) {
  function ItemsType(itemType, hint) {
    var _this4;
    _classCallCheck(this, ItemsType);
    _this4 = _callSuper(this, ItemsType, [hint]);
    if (itemType === undefined || itemType === null) {
      throw new Error('ItemsType requires an itemType');
    }

    // Check for invalid recursive items
    if (itemType instanceof ItemsType) {
      throw new Error('ItemsType cannot directly contain another ItemsType - use an object structure instead');
    }

    // Convert string literals and built-in constructors to Type instances
    if (typeof itemType === 'string') {
      itemType = new StringType(itemType);
    } else if (itemType === String) {
      itemType = new StringType();
    } else if (itemType === Number) {
      itemType = new NumberType();
    } else if (itemType === Boolean) {
      itemType = new BooleanType();
    }

    // Validate final itemType
    if (!(_typeof(itemType) === 'object' && !Array.isArray(itemType) || itemType instanceof Type)) {
      throw new Error('ItemsType itemType must be an object, Type instance, String/Number/Boolean constructor, or string literal');
    }
    _this4.itemType = itemType;
    console.log('Set itemType', itemType);
    return _this4;
  }
  _inherits(ItemsType, _Type6);
  return _createClass(ItemsType, [{
    key: "_parse",
    value: function _parse(value, element, applyMapping) {
      var _this5 = this;
      if (!element) {
        // If no element exists and we have a default, return it
        return this["default"] !== undefined ? this["default"] : [];
      }
      console.log('element', element);
      var items = (element.$$children || []).filter(function (c) {
        return c.$$tagname.toLowerCase() === 'item';
      });

      // If no items and we have a default, return it
      if (items.length === 0 && this["default"] !== undefined) {
        return this["default"];
      }
      var result = items.map(function (node) {
        if (_typeof(_this5.itemType) === 'object' && !Array.isArray(_this5.itemType)) {
          return applyMapping(node, _this5.itemType);
        } else {
          return _this5.itemType.parse(node.$$text, node, applyMapping);
        }
      });

      // Apply array-level validation if present
      if (this.validate && !this.validate(result)) {
        return this["default"] !== undefined ? this["default"] : result;
      }

      // Apply array-level transformation if present
      return this.transform ? this.transform(result) : result;
    }
  }, {
    key: "generateScaffold",
    value: function generateScaffold(genTypeHint) {
      // If itemType is a Type instance, wrap it in <item> tags
      if (this.itemType instanceof Type) {
        var content = this.itemType.generateScaffold(genTypeHint);
        return ["<item>".concat(content, "</item>"), "<item>".concat(content, "</item>"), '/*etc.*/'].join('\n');
      }

      // If itemType is an object, generate scaffold for each property within <item>
      if (_typeof(this.itemType) === 'object') {
        // Separate attributes, text content, and regular properties
        var attributes = [];
        var textContent = null;
        var regularProps = [];
        Object.entries(this.itemType).forEach(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2),
            key = _ref2[0],
            value = _ref2[1];
          if (key === '$$text') {
            textContent = value;
          } else if (key.startsWith('$')) {
            attributes.push([key.slice(1), value]); // Remove $ prefix
          } else {
            regularProps.push([key, value]);
          }
        });

        // Generate attribute string
        var attrStr = attributes.map(function (_ref3) {
          var _ref4 = _slicedToArray(_ref3, 2),
            key = _ref4[0],
            value = _ref4[1];
          var content = value instanceof Type ? value.generateScaffold(genTypeHint) : value === String ? genTypeHint('String') : value === Number ? genTypeHint('Number') : value === Boolean ? genTypeHint('Boolean') : typeof value === 'string' ? value : '...';
          return "".concat(key, "=\"").concat(content, "\"");
        }).join(' ');

        // Generate content string
        var getContent = function getContent() {
          var content = '';

          // Add text content if present
          if (textContent) {
            content += textContent instanceof Type ? textContent.generateScaffold(genTypeHint) : textContent === String ? genTypeHint('String') : textContent === Number ? genTypeHint('Number') : textContent === Boolean ? genTypeHint('Boolean') : typeof textContent === 'string' ? textContent : '...';
          }

          // Add regular properties
          var props = regularProps.map(function (_ref5) {
            var _ref6 = _slicedToArray(_ref5, 2),
              key = _ref6[0],
              value = _ref6[1];
            var propContent = typeof value === 'string' ? genTypeHint("String: ".concat(value)) : value instanceof Type ? value.generateScaffold(genTypeHint) : value === String ? genTypeHint('String') : value === Number ? genTypeHint('Number') : value === Boolean ? genTypeHint('Boolean') : '...';
            return "<".concat(key, ">").concat(propContent, "</").concat(key, ">");
          }).join('\n');
          if (props) {
            content += (content ? '\n' : '') + props;
          }
          return content;
        };
        var _content = getContent();
        var itemStart = attrStr ? "<item ".concat(attrStr, ">") : '<item>';

        // Show two examples with proper spacing
        return ["".concat(itemStart).concat(_content ? '\n' + _content : '').concat(_content ? '\n' : '', "</item>"), "".concat(itemStart).concat(_content ? '\n' + _content : '').concat(_content ? '\n' : '', "</item>"), '/*etc.*/'].join('\n');
      }

      // Fallback for other cases
      return genTypeHint('Items');
    }
  }]);
}(Type); // Create the types object with all type creators
var types = exports.types = {
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
  },
  // New items type
  items: function items(itemType, hint) {
    return new ItemsType(itemType, hint);
  }
};
var _default = exports["default"] = types;