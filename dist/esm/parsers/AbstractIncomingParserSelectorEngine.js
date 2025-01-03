var _excluded = ["text", "children", "key", "closed"];
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
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
  this.$$tagname = name;
  this.$$text = options.text || '';
  this.$$children = options.children || [];
  this.$$tagkey = options.key;
  this.$$tagclosed = options.closed || false;
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
     * Gets all text content from an element and its children
     * @param {Object} element - The element to get text from
     * @param {Function} [filterFn] - Optional function to filter which children to include
     * @returns {string} The concatenated text content
     */
  }, {
    key: "getTextContent",
    value: function getTextContent(element) {
      var filterFn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      if (element.type === 'text') {
        return element.data;
      }
      var text = '';
      var _iterator = _createForOfIteratorHelper(element.children || []),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var child = _step.value;
          if (filterFn && !filterFn(child)) {
            continue;
          }
          if (child.type === 'text') {
            text += child.data;
          } else if (child.type === 'tag') {
            text += this.getTextContent(child, filterFn);
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return text;
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
      var _this = this;
      var includeOpenTags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      return results.map(function (r) {
        return _this.formatElement(r, includeOpenTags);
      }).filter(Boolean);
    }
  }, {
    key: "mapSelect",
    value: function mapSelect(mapping) {
      var _this2 = this;
      var includeOpenTags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var doDedupe = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      var normalizedMapping = this.normalizeSchemaWithCache(mapping);
      var attributeMarker = this.constructor.GEN_ATTRIBUTE_MARKER();
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
          var value = map.parse(element === null || element === void 0 ? void 0 : element.$$text);

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
            var _element$$$text, _element$$$text$trim;
            return parseFloat(((_element$$$text = element.$$text) === null || _element$$$text === void 0 || (_element$$$text$trim = _element$$$text.trim) === null || _element$$$text$trim === void 0 ? void 0 : _element$$$text$trim.call(_element$$$text)) || '');
          }
          if (map === String) {
            return String(element.$$text);
          }
          if (map === Boolean) {
            var _element$$$text2, _element$$$text2$trim;
            var text = ((_element$$$text2 = element.$$text) === null || _element$$$text2 === void 0 || (_element$$$text2$trim = _element$$$text2.trim) === null || _element$$$text2$trim === void 0 ? void 0 : _element$$$text2$trim.call(_element$$$text2).toLowerCase()) || '';
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
            if (k === '_' || k === '$$text') {
              var _value = _applyMapping(element === null || element === void 0 ? void 0 : element.$$text, mapItem);
              if (_value !== undefined) out[k] = _value;
            } else if (!attributeMarker && k.startsWith('$')) {
              throw new Error("There is no attribute marker defined for this parser (".concat(_this2.constructor.NAME, "); it looks like you are trying to use the $$attr pattern, but it will not work with this parser."));
            } else if (attributeMarker && k.startsWith(attributeMarker)) {
              var attrName = k.slice(1);
              if (element !== null && element !== void 0 && element.$$attr && element.$$attr[attrName] != null) {
                var _value2 = _applyMapping(element.$$attr[attrName], mapItem);
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
        var elements = doDedupe ? _this2.dedupeSelect(selector, includeOpenTags) : _this2.select(selector, includeOpenTags);
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
      var _this3 = this;
      var hints = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var indent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2;
      // Add validation before processing
      this.validateSchema(schema);
      var _processObject = function processObject(obj) {
        var hintObj = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var level = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
        var xml = '';
        var indentation = ' '.repeat(level * indent);
        for (var key in obj) {
          var value = obj[key];
          var hint = hintObj[key];
          // Skip attribute markers
          if (_this3.SKIP_ATTRIBUTE_MARKER_IN_SCAFFOLD && _this3.GEN_ATTRIBUTE_MARKER() && key.startsWith(_this3.GEN_ATTRIBUTE_MARKER())) {
            continue;
          }

          // Handle string literals as pure hints
          if (typeof value === 'string') {
            xml += "".concat(indentation).concat(_this3.GEN_OPEN_TAG(key)).concat(value).concat(_this3.GEN_CLOSE_TAG(key), "\n");
            continue;
          }

          // Handle functions (including primitives) with optional hints
          if (typeof value === 'function') {
            var typeHint = value === String ? _this3.GEN_TYPE_HINT('String') : value === Number ? _this3.GEN_TYPE_HINT('Number') : value === Boolean ? _this3.GEN_TYPE_HINT('Boolean') : '';
            var content = hint ? hint : typeHint || '...';
            xml += "".concat(indentation).concat(_this3.GEN_OPEN_TAG(key)).concat(content).concat(_this3.GEN_CLOSE_TAG(key), "\n");
            continue;
          }

          // Handle Type instances
          if (value instanceof Type) {
            // Determine content following the same pattern as other types
            var _typeHint = '';
            if (value instanceof StringType) _typeHint = _this3.GEN_TYPE_HINT('String' + (value.hint ? ': ' + value.hint : ''));else if (value instanceof NumberType) _typeHint = _this3.GEN_TYPE_HINT('Number' + (value.hint ? ': ' + value.hint : ''));else if (value instanceof BooleanType) _typeHint = _this3.GEN_TYPE_HINT('Boolean' + (value.hint ? ': ' + value.hint : ''));else if (value instanceof EnumType) _typeHint = _this3.GEN_TYPE_HINT('Enum:' + (value.hint ? ' ' + value.hint : '') + ' (allowed values: ' + value.allowedValues.join('|') + ')');
            var _content = hint || _typeHint || '...';
            if (value.isCData) {
              xml += "".concat(indentation).concat(_this3.GEN_OPEN_TAG(key), "<![CDATA[").concat(_content, "]]>").concat(_this3.GEN_CLOSE_TAG(key), "\n");
            } else {
              xml += "".concat(indentation).concat(_this3.GEN_OPEN_TAG(key)).concat(_content).concat(_this3.GEN_CLOSE_TAG(key), "\n");
            }
            continue;
          }

          // Handle arrays
          if (Array.isArray(value)) {
            var itemValue = value[0];
            var itemHint = Array.isArray(hint) ? hint[0] : hint;

            // Show two examples for arrays
            for (var i = 0; i < 2; i++) {
              xml += "".concat(indentation).concat(_this3.GEN_OPEN_TAG(key, itemValue, itemHint), "\n");

              // Handle text content for array items
              if (_typeof(itemValue) !== 'object' || itemValue === null) {
                // For primitive arrays, use the hint directly if it's a string
                var _content2 = typeof itemHint === 'string' ? itemHint : typeof itemValue === 'string' ? itemValue : itemValue === String ? _this3.GEN_TYPE_HINT('String') : itemValue === Number ? _this3.GEN_TYPE_HINT('Number') : itemValue === Boolean ? _this3.GEN_TYPE_HINT('Boolean') : '...';
                xml += "".concat(indentation, "  ").concat(_content2, "\n");
              } else {
                // Handle text content from $$text in object
                if (itemValue.$$text !== undefined) {
                  var textContent = (itemHint === null || itemHint === void 0 ? void 0 : itemHint.$$text) || (typeof itemValue.$$text === 'function' ? itemValue.$$text === String ? _this3.GEN_TYPE_HINT('String') : itemValue.$$text === Number ? _this3.GEN_TYPE_HINT('Number') : itemValue.$$text === Boolean ? _this3.GEN_TYPE_HINT('Boolean') : '...' : typeof itemValue.$$text === 'string' ? itemValue.$$text : '...');
                  xml += "".concat(indentation, "  ").concat(textContent, "\n");
                } else if (itemHint !== null && itemHint !== void 0 && itemHint.$$text) {
                  xml += "".concat(indentation, "  ").concat(itemHint.$$text, "\n");
                }
                xml += _processObject(itemValue, itemHint, level + 1);
              }
              xml += "".concat(indentation).concat(_this3.GEN_CLOSE_TAG(key), "\n");
            }
            xml += "".concat(indentation, "/*etc.*/\n");
            continue;
          }

          // Handle objects
          if (_typeof(value) === 'object' && value !== null) {
            xml += "".concat(indentation).concat(_this3.GEN_OPEN_TAG(key, value, hint), "\n");

            // Handle text content - check if it's explicitly typed
            if (value.$$text !== undefined) {
              var _textContent = (hint === null || hint === void 0 ? void 0 : hint.$$text) || (typeof value.$$text === 'function' ? value.$$text === String ? _this3.GEN_TYPE_HINT('String') : value.$$text === Number ? _this3.GEN_TYPE_HINT('Number') : value.$$text === Boolean ? _this3.GEN_TYPE_HINT('Boolean') : '...' : typeof value.$$text === 'string' ? value.$$text : '...');
              xml += "".concat(indentation, "  ").concat(_textContent, "\n");
            } else if (hint !== null && hint !== void 0 && hint.$$text) {
              xml += "".concat(indentation, "  ").concat(hint.$$text, "\n");
            }
            xml += _processObject(value, hint || {}, level + 1);
            xml += "".concat(indentation).concat(_this3.GEN_CLOSE_TAG(key), "\n");
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
  }, {
    key: "validateSchema",
    value: function validateSchema(schema) {
      var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      if (!schema || _typeof(schema) !== 'object') {
        return;
      }

      // Track property names at current level (without $ prefix)
      var propertyNames = new Set();
      var attributeNames = new Set();
      for (var key in schema) {
        // Skip internal/reserved properties
        if (this.RESERVED_PROPERTIES.has(key)) {
          continue;
        }

        // Special case: Allow $$text alongside $text
        if (key === '$$text') {
          continue;
        }
        var isAttribute = key.startsWith(this.GEN_ATTRIBUTE_MARKER());
        var baseName = isAttribute ? key.slice(1) : key;

        // Check for duplicate names between attributes and properties
        if (isAttribute) {
          if (propertyNames.has(baseName)) {
            throw new Error("Schema validation error at ".concat(path, ": Cannot have both property \"").concat(baseName, "\" and attribute \"").concat(key, "\" at the same level"));
          }
          attributeNames.add(baseName);
        } else {
          if (attributeNames.has(baseName)) {
            throw new Error("Schema validation error at ".concat(path, ": Cannot have both property \"").concat(key, "\" and attribute \"$").concat(baseName, "\" at the same level"));
          }
          propertyNames.add(baseName);
        }
        var value = schema[key];

        // Continue validating nested objects and arrays
        if (Array.isArray(value)) {
          if (value.length === 1) {
            this.validateSchema(value[0], "".concat(path, ".").concat(key, "[0]"));
          }
        } else if (value && _typeof(value) === 'object' && !('type' in value)) {
          this.validateSchema(value, "".concat(path, ".").concat(key));
        }
      }
    }
  }]);
}();
_defineProperty(AbstractIncomingParserSelectorEngine, "SKIP_ATTRIBUTE_MARKER_IN_SCAFFOLD", true);
_defineProperty(AbstractIncomingParserSelectorEngine, "NAME", 'AbstractIncomingParserSelectorEngine');
_defineProperty(AbstractIncomingParserSelectorEngine, "RESERVED_PROPERTIES", new Set(['$$tagclosed', '$$tagkey', '$$children', '$$tagname', '__isNodeObj__']));
_defineProperty(AbstractIncomingParserSelectorEngine, "GEN_ATTRIBUTE_MARKER", function () {
  throw new Error('Subclass must implement GEN_ATTRIBUTE_MARKER');
});
_defineProperty(AbstractIncomingParserSelectorEngine, "GEN_OPEN_TAG", function () {
  throw new Error('Subclass must implement GEN_OPEN_TAG');
});
_defineProperty(AbstractIncomingParserSelectorEngine, "GEN_CLOSE_TAG", function () {
  throw new Error('Subclass must implement GEN_CLOSE_TAG');
});
_defineProperty(AbstractIncomingParserSelectorEngine, "GEN_TYPE_HINT", function (type) {
  var enumValues = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  return "{".concat(type).concat(enumValues !== null && enumValues !== void 0 && enumValues.length ? ": ".concat(enumValues.join('|')) : '', "}");
});
export { Node };
export default AbstractIncomingParserSelectorEngine;