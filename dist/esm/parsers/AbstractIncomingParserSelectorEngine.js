var _excluded = ["text", "children", "key", "closed"];
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var s = Object.getOwnPropertySymbols(e); for (r = 0; r < s.length; r++) o = s[r], t.includes(o) || {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (e.includes(n)) continue; t[n] = r[n]; } return t; }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
import { Type, EnumType, StringType, NumberType, BooleanType } from '../types.mjs';
var Node = /*#__PURE__*/_createClass(function Node(name) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  _classCallCheck(this, Node);
  this.length = 0;
  this.__isNodeObj__ = true;
  this.$tagname = name;
  this.$text = options.text || '';
  this.$children = options.children || [];
  this.$tagkey = options.key;
  this.$tagclosed = options.closed || false;
  var text = options.text,
    children = options.children,
    key = options.key,
    closed = options.closed,
    rest = _objectWithoutProperties(options, _excluded);
  Object.assign(this, rest);
});
var AbstractIncomingParserSelectorEngine = /*#__PURE__*/function () {
  function AbstractIncomingParserSelectorEngine() {
    _classCallCheck(this, AbstractIncomingParserSelectorEngine);
    this.buffer = '';
    this.position = 0;
    this.elementIndex = 0;
    this.parsedData = [];
    this.openElements = [];
    this.returnedElementSignatures = new Map();
  }
  return _createClass(AbstractIncomingParserSelectorEngine, [{
    key: "add",
    value: function add(chunk) {
      throw new Error('Subclass must implement add');
    }

    /**
     * Generates a unique signature for an element
     */
  }, {
    key: "getElementSignature",
    value: function getElementSignature(element) {
      var forDeduping = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var ancestry = [];
      var current = element;
      while (current.parent) {
        var index = current.parent.children.indexOf(current);
        ancestry.unshift("".concat(current.name, "[").concat(index, "]"));
        current = current.parent;
      }
      var signature = {
        ancestry: ancestry.join('/'),
        name: element.name,
        key: element.key,
        closed: element.closed
      };
      if (!forDeduping) {
        signature.textContent = this.getTextContent(element);
      }
      return JSON.stringify(signature);
    }

    /**
     * Gets the text content of an element including children
     */
  }, {
    key: "getTextContent",
    value: function getTextContent(element) {
      var _this = this;
      if (element.type === 'text') {
        return element.data;
      }
      return (element.children || []).reduce(function (text, child) {
        if (child.type === 'text') {
          return text + child.data;
        } else if (child.type === 'tag') {
          return text + _this.getTextContent(child);
        }
        return text;
      }, '');
    }
  }, {
    key: "select",
    value: function select(selector) {
      var includeOpenTags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      throw new Error('Subclass must implement select');
    }
  }, {
    key: "dedupeSelect",
    value: function dedupeSelect(selector) {
      var includeOpenTags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      throw new Error('Subclass must implement dedupeSelect');
    }
  }, {
    key: "formatElement",
    value: function formatElement(element) {
      var includeOpenTags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      throw new Error('Subclass must implement formatElement');
    }
  }, {
    key: "formatResults",
    value: function formatResults(results) {
      var _this2 = this;
      var includeOpenTags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      return results.map(function (r) {
        return _this2.formatElement(r, includeOpenTags);
      }).filter(Boolean);
    }
  }, {
    key: "mapSelect",
    value: function mapSelect(mapping) {
      var _this3 = this;
      var includeOpenTags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var doDedupe = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      var normalizedMapping = this.normalizeSchemaWithCache(mapping);
      var _applyMapping = function applyMapping(element, map) {
        // Handle arrays first
        if (Array.isArray(map)) {
          if (map.length !== 1) {
            throw new Error('A map array must only have one element');
          }
          return Array.isArray(element) ? element.map(function (e) {
            return _applyMapping(e, map[0]);
          }) : [_applyMapping(element, map[0])];
        }

        // Handle non-Node values
        if (!(element !== null && element !== void 0 && element.__isNodeObj__) && element != null) {
          // Treat it as a plain value:
          if (typeof map === 'function') {
            return map(element);
          } else {
            return element;
          }
        }

        // Handle string literals as String type
        if (typeof map === 'string') {
          map = String;
        }

        // Handle Type instances
        if (map instanceof Type) {
          // If there's no element and no default, return undefined
          if (!element && map["default"] === undefined) {
            return undefined;
          }

          // Get the raw value and parse it according to the type
          var value = map.parse(element === null || element === void 0 ? void 0 : element.$text);

          // Apply transform or use default transformer
          var result = map.transform ? map.transform(value) : value;

          // Apply default value if result is empty or NaN
          if ((result === '' || typeof result === 'number' && isNaN(result)) && map["default"] !== undefined) {
            result = map["default"];
          }

          // If we still have an empty result and no default, return undefined
          if (result === '' && map["default"] === undefined) {
            return undefined;
          }
          return result;
        }

        // Handle built-in constructors
        if (typeof map === 'function') {
          if (map === Number) {
            var _element$$text, _element$$text$trim;
            return parseFloat(((_element$$text = element.$text) === null || _element$$text === void 0 || (_element$$text$trim = _element$$text.trim) === null || _element$$text$trim === void 0 ? void 0 : _element$$text$trim.call(_element$$text)) || '');
          }
          if (map === String) {
            return String(element.$text);
          }
          if (map === Boolean) {
            var _element$$text2, _element$$text2$trim;
            var text = ((_element$$text2 = element.$text) === null || _element$$text2 === void 0 || (_element$$text2$trim = _element$$text2.trim) === null || _element$$text2$trim === void 0 ? void 0 : _element$$text2$trim.call(_element$$text2).toLowerCase()) || '';
            var isWordedAsFalse = ['false', 'no', 'null'].includes(text);
            var isEssentiallyFalsey = text === '' || isWordedAsFalse || parseFloat(text) === 0;
            return !isEssentiallyFalsey;
          }
          return map(element);
        }

        // Handle objects (nested schemas)
        if (_typeof(map) === 'object') {
          var out = {};
          for (var k in map) {
            var mapItem = map[k];
            if (k === '_' || k === '$text') {
              var _value = _applyMapping(element === null || element === void 0 ? void 0 : element.$text, mapItem);
              if (_value !== undefined) out[k] = _value;
            } else if (k.startsWith(_this3.constructor.GEN_ATTRIBUTE_MARKER())) {
              var attrName = k.slice(1);
              if (element !== null && element !== void 0 && element.$attr && element.$attr[attrName] != null) {
                var _value2 = _applyMapping(element.$attr[attrName], mapItem);
                if (_value2 !== undefined) out[k] = _value2;
              }
            } else {
              var childElement = element === null || element === void 0 ? void 0 : element[k];
              if (!childElement) {
                // Handle unfulfilled schema parts
                if (mapItem instanceof Type && mapItem["default"] !== undefined) {
                  out[k] = mapItem["default"];
                } else if (_typeof(mapItem) === 'object' && !Array.isArray(mapItem)) {
                  // Recursively handle nested objects with null element
                  var _value3 = _applyMapping(null, mapItem);
                  // Only include the object if it has properties
                  if (_value3 !== undefined && Object.keys(_value3).length > 0) {
                    out[k] = _value3;
                  }
                } else {
                  // Don't include arrays or undefined values
                  if (Array.isArray(mapItem)) out[k] = [];
                }
              } else if (Array.isArray(mapItem)) {
                var _value4 = _applyMapping(childElement, mapItem);
                if (_value4 !== undefined) out[k] = _value4;
              } else {
                var _value5 = _applyMapping(Array.isArray(childElement) ? childElement[0] : childElement, mapItem);
                if (_value5 !== undefined) out[k] = _value5;
              }
            }
          }
          return Object.keys(out).length > 0 ? out : undefined;
        }
        throw new Error('Invalid mapping type');
      };
      var isArrayMapping = Array.isArray(normalizedMapping);
      if (isArrayMapping) {
        var rootSelector = Object.keys(normalizedMapping[0])[0];
        return (doDedupe ? this.dedupeSelect(rootSelector, includeOpenTags) : this.select(rootSelector, includeOpenTags)).map(function (element) {
          return _defineProperty({}, rootSelector, _applyMapping(element, normalizedMapping[0][rootSelector]));
        });
      }
      var rootSelectors = Object.keys(normalizedMapping);
      var results = {};
      rootSelectors.forEach(function (selector) {
        var elements = doDedupe ? _this3.dedupeSelect(selector, includeOpenTags) : _this3.select(selector, includeOpenTags);
        if (!(elements !== null && elements !== void 0 && elements.length)) return;
        var resultName = selector;
        if (Array.isArray(normalizedMapping[selector])) {
          elements.forEach(function (el) {
            results[resultName] = (results[resultName] || []).concat(_applyMapping(el, normalizedMapping[selector]));
          });
        } else {
          results[resultName] = _applyMapping(elements[0], normalizedMapping[selector]);
        }
      });
      return results;
    }
  }, {
    key: "normalizeSchemaWithCache",
    value: function normalizeSchemaWithCache(schema) {
      return schema;
    }
  }], [{
    key: "validateHints",
    value: function validateHints(schema, hints) {
      function validateStructure(schemaObj, hintsObj) {
        var path = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
        if (!hintsObj) return; // Hints are optional

        // Handle primitives in schema
        if (_typeof(schemaObj) !== 'object' || schemaObj === null || schemaObj instanceof Type) {
          return;
        }

        // Handle arrays
        if (Array.isArray(schemaObj)) {
          if (schemaObj.length !== 1) {
            throw new Error("Schema array at ".concat(path, " must have exactly one element"));
          }
          if (hintsObj && !Array.isArray(hintsObj) && typeof hintsObj !== 'string') {
            throw new Error("Hints at ".concat(path, " must be array or string for array schema"));
          }
          validateStructure(schemaObj[0], Array.isArray(hintsObj) ? hintsObj[0] : hintsObj, "".concat(path, "[]"));
          return;
        }

        // Check each hint has corresponding schema definition
        for (var key in hintsObj) {
          if (!schemaObj.hasOwnProperty(key)) {
            throw new Error("Hint \"".concat(key, "\" has no corresponding schema definition at ").concat(path));
          }
          validateStructure(schemaObj[key], hintsObj[key], path ? "".concat(path, ".").concat(key) : key);
        }
      }
      validateStructure(schema, hints);
    }
  }, {
    key: "makeMapSelectScaffold",
    value: function makeMapSelectScaffold(schema) {
      var _this4 = this;
      var hints = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var indent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2;
      var _processObject = function processObject(obj) {
        var hintObj = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var level = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
        var xml = '';
        var indentation = ' '.repeat(level * indent);
        for (var key in obj) {
          var value = obj[key];
          var hint = hintObj[key];

          // Skip attribute markers
          if (key.startsWith(_this4.GEN_ATTRIBUTE_MARKER())) {
            continue;
          }

          // Handle string literals as pure hints
          if (typeof value === 'string') {
            xml += "".concat(indentation).concat(_this4.GEN_OPEN_TAG(key)).concat(value).concat(_this4.GEN_CLOSE_TAG(key), "\n");
            continue;
          }

          // Handle functions (including primitives) with optional hints
          if (typeof value === 'function') {
            var typeHint = value === String ? '{String}' : value === Number ? '{Number}' : value === Boolean ? '{Boolean}' : '';
            var content = hint ? hint : typeHint || '...';
            xml += "".concat(indentation).concat(_this4.GEN_OPEN_TAG(key)).concat(content).concat(_this4.GEN_CLOSE_TAG(key), "\n");
            continue;
          }

          // Handle Type instances
          if (value instanceof Type) {
            var _value$allowedValues;
            // Determine content following the same pattern as other types
            var _typeHint = '';
            if (value instanceof StringType) _typeHint = '{String}';else if (value instanceof NumberType) _typeHint = '{Number}';else if (value instanceof BooleanType) _typeHint = '{Boolean}';else if (value instanceof EnumType) _typeHint = "{Enum: ".concat((_value$allowedValues = value.allowedValues) === null || _value$allowedValues === void 0 ? void 0 : _value$allowedValues.join('|'), "}");
            var _content = hint || _typeHint || '...';
            if (value.isCData) {
              xml += "".concat(indentation).concat(_this4.GEN_OPEN_TAG(key), "<![CDATA[").concat(_content, "]]>").concat(_this4.GEN_CLOSE_TAG(key), "\n");
            } else {
              xml += "".concat(indentation).concat(_this4.GEN_OPEN_TAG(key)).concat(_content).concat(_this4.GEN_CLOSE_TAG(key), "\n");
            }
            continue;
          }

          // Handle arrays
          if (Array.isArray(value)) {
            var itemValue = value[0];
            var itemHint = Array.isArray(hint) ? hint[0] : hint;

            // Show two examples for arrays
            for (var i = 0; i < 2; i++) {
              xml += "".concat(indentation).concat(_this4.GEN_OPEN_TAG(key, itemValue, itemHint), "\n");

              // Handle text content for array items
              if (_typeof(itemValue) !== 'object' || itemValue === null) {
                // For primitive arrays, use the hint directly if it's a string
                var _content2 = typeof itemHint === 'string' ? itemHint : typeof itemValue === 'string' ? itemValue : itemValue === String ? '{String}' : itemValue === Number ? '{Number}' : itemValue === Boolean ? '{Boolean}' : '...';
                xml += "".concat(indentation, "  ").concat(_content2, "\n");
              } else {
                // Handle text content from $text in object
                if (itemValue.$text !== undefined) {
                  var textContent = (itemHint === null || itemHint === void 0 ? void 0 : itemHint.$text) || (typeof itemValue.$text === 'function' ? itemValue.$text === String ? '{String}' : itemValue.$text === Number ? '{Number}' : itemValue.$text === Boolean ? '{Boolean}' : '...' : typeof itemValue.$text === 'string' ? itemValue.$text : '...');
                  xml += "".concat(indentation, "  ").concat(textContent, "\n");
                } else if (itemHint !== null && itemHint !== void 0 && itemHint.$text) {
                  xml += "".concat(indentation, "  ").concat(itemHint.$text, "\n");
                }
                xml += _processObject(itemValue, itemHint, level + 1);
              }
              xml += "".concat(indentation).concat(_this4.GEN_CLOSE_TAG(key), "\n");
            }
            xml += "".concat(indentation, "/*etc.*/\n");
            continue;
          }

          // Handle objects
          if (_typeof(value) === 'object' && value !== null) {
            xml += "".concat(indentation).concat(_this4.GEN_OPEN_TAG(key, value, hint), "\n");

            // Handle text content - check if it's explicitly typed
            if (value.$text !== undefined) {
              var _textContent = (hint === null || hint === void 0 ? void 0 : hint.$text) || (typeof value.$text === 'function' ? value.$text === String ? '{String}' : value.$text === Number ? '{Number}' : value.$text === Boolean ? '{Boolean}' : '...' : typeof value.$text === 'string' ? value.$text : '...');
              xml += "".concat(indentation, "  ").concat(_textContent, "\n");
            } else if (hint !== null && hint !== void 0 && hint.$text) {
              xml += "".concat(indentation, "  ").concat(hint.$text, "\n");
            }
            xml += _processObject(value, hint || {}, level + 1);
            xml += "".concat(indentation).concat(_this4.GEN_CLOSE_TAG(key), "\n");
          }
        }
        return xml;
      };

      // Validate hints against schema if provided
      if (Object.keys(hints).length > 0) {
        AbstractIncomingParserSelectorEngine.validateHints(schema, hints);
      }
      return _processObject(schema, hints);
    }
  }]);
}();
_defineProperty(AbstractIncomingParserSelectorEngine, "GEN_ATTRIBUTE_MARKER", function () {
  throw new Error('Subclass must implement GEN_ATTRIBUTE_MARKER');
});
_defineProperty(AbstractIncomingParserSelectorEngine, "RESERVED_PROPERTIES", new Set(['$tagclosed', '$tagkey', '$children', '$tagname', '__isNodeObj__']));
_defineProperty(AbstractIncomingParserSelectorEngine, "GEN_OPEN_TAG", function () {
  throw new Error('Subclass must implement GEN_OPEN_TAG');
});
_defineProperty(AbstractIncomingParserSelectorEngine, "GEN_CLOSE_TAG", function () {
  throw new Error('Subclass must implement GEN_CLOSE_TAG');
});
export { Node };
export default AbstractIncomingParserSelectorEngine;