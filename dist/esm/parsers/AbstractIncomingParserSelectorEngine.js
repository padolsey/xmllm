var _AbstractIncomingParserSelectorEngine;
var _excluded = ["text", "children", "key", "closed"];
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
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
import { Type, EnumType, StringType, NumberType, BooleanType, ItemsType } from '../types.mjs';
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
    key: "GEN_TYPE_HINT",
    value: function GEN_TYPE_HINT(type) {
      return "...".concat(type, "...");
    }
  }, {
    key: "GEN_CDATA_OPEN",
    value: function GEN_CDATA_OPEN() {
      return '';
    }
  }, {
    key: "GEN_CDATA_CLOSE",
    value: function GEN_CDATA_CLOSE() {
      return '';
    }
  }, {
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
      var attributeMarker = this.GEN_ATTRIBUTE_MARKER();
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
          if (!element && map["default"] === undefined) {
            return undefined;
          }
          var value = map.parse(element === null || element === void 0 ? void 0 : element.$$text, element, _applyMapping);
          // let result = map.transform ? map.transform(value) : value;
          var result = value;
          if ((result === '' || typeof result === 'number' && isNaN(result)) && map["default"] !== undefined) {
            result = map["default"];
          }
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
  }, {
    key: "getTypeHintForPrimitive",
    value:
    // New helper method
    function getTypeHintForPrimitive(value) {
      return value === String ? this.GEN_TYPE_HINT('String') : value === Number ? this.GEN_TYPE_HINT('Number') : value === Boolean ? this.GEN_TYPE_HINT('Boolean') : '';
    }
  }, {
    key: "makeMapSelectScaffold",
    value: function makeMapSelectScaffold(schema) {
      var hints = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var indent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2;
      return this.generateScaffold(schema, hints, indent);
    }
  }, {
    key: "generateScaffold",
    value: function generateScaffold(schema) {
      var _this3 = this;
      var hints = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var indent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2;
      this.validateSchema(schema, '');
      var _traverseSchema = function traverseSchema(schemaNode) {
        var hintNode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var level = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
        var output = '';
        var indentation = ' '.repeat(level * indent);

        // Process attributes first
        for (var key in schemaNode) {
          if (key === '$$text') continue;
          if (!key.startsWith(_this3.GEN_ATTRIBUTE_MARKER())) continue;
          var value = schemaNode[key];
          var hint = hintNode[key];
          output += _this3.renderNode(value, key, hint, indentation, level, indent, _traverseSchema);
        }

        // Process regular elements
        for (var _key in schemaNode) {
          if (_key === '$$text') continue;
          if (_key.startsWith(_this3.GEN_ATTRIBUTE_MARKER())) continue;
          var _value6 = schemaNode[_key];
          var _hint = hintNode[_key];
          output += _this3.renderNode(_value6, _key, _hint, indentation, level, indent, _traverseSchema);
        }
        return output;
      };
      return _traverseSchema(schema, hints);
    }
  }, {
    key: "renderElementNode",
    value: function renderElementNode(tagName, schemaNode, hint, indentation, level, indent, traverseSchema) {
      var output = '';

      // Generate opening tag with attributes
      output += "".concat(indentation).concat(this.GEN_OPEN_TAG(tagName, schemaNode, hint), "\n");

      // Handle text content
      var textContent = this.extractTextContent(schemaNode, hint);
      if (textContent) {
        output += "".concat(indentation, "  ").concat(textContent, "\n");
      }

      // Process child elements
      output += traverseSchema(schemaNode, hint || {}, level + 1);

      // Close tag
      output += "".concat(indentation).concat(this.GEN_CLOSE_TAG(tagName), "\n");
      return output;
    }
  }, {
    key: "extractTextContent",
    value: function extractTextContent(schemaNode, hint) {
      if (hint !== null && hint !== void 0 && hint.$$text) {
        return hint.$$text;
      }
      if (schemaNode.$$text !== undefined) {
        if (typeof schemaNode.$$text === 'function') {
          // If it's a built-in type (String, Number, etc), show type hint
          if (schemaNode.$$text === String || schemaNode.$$text === Number || schemaNode.$$text === Boolean) {
            return this.GEN_TYPE_HINT(schemaNode.$$text.name, hint);
          }
          // For custom transformations, just show ...
          return '...';
        }
        return typeof schemaNode.$$text === 'string' ? schemaNode.$$text : '...';
      }
      return null;
    }
  }, {
    key: "renderNode",
    value: function renderNode(value, key, hint, indentation, level, indent, traverseSchema) {
      if (this.constructor.SKIP_ATTRIBUTE_MARKER_IN_SCAFFOLD && key.startsWith(this.GEN_ATTRIBUTE_MARKER())) {
        return '';
      }

      // Route to appropriate renderer based on type
      if (value instanceof Type) {
        return this.renderTypeNode(value, key, hint, indentation);
      }
      if (typeof value === 'string') {
        return this.renderStringNode(value, key, indentation);
      }
      if (typeof value === 'function') {
        return this.renderFunctionNode(value, key, hint, indentation);
      }
      if (Array.isArray(value)) {
        return this.renderArrayNode(key, value, hint, indentation, level, indent, traverseSchema);
      }
      if (_typeof(value) === 'object' && value !== null) {
        return this.renderElementNode(key, value, hint, indentation, level, indent, traverseSchema);
      }
      return '';
    }
  }, {
    key: "renderTypeNode",
    value: function renderTypeNode(value, key, hint, indentation) {
      var content = hint || value.generateScaffold(this.GEN_TYPE_HINT, {
        parser: this
      });
      if (value.isCData) {
        return "".concat(indentation).concat(this.GEN_OPEN_TAG(key)).concat(this.GEN_CDATA_OPEN()).concat(content).concat(this.GEN_CDATA_CLOSE()).concat(this.GEN_CLOSE_TAG(key), "\n");
      }
      return "".concat(indentation).concat(this.GEN_OPEN_TAG(key)).concat(content).concat(this.GEN_CLOSE_TAG(key), "\n");
    }
  }, {
    key: "renderStringNode",
    value: function renderStringNode(value, key, indentation) {
      return "".concat(indentation).concat(this.GEN_OPEN_TAG(key)).concat(value).concat(this.GEN_CLOSE_TAG(key), "\n");
    }
  }, {
    key: "renderFunctionNode",
    value: function renderFunctionNode(value, key, hint, indentation) {
      var typeHint = value === String || value === Number || value === Boolean ? this.GEN_TYPE_HINT(value.name, hint) : '...';
      var content = hint ? hint : typeHint || '...';
      return "".concat(indentation).concat(this.GEN_OPEN_TAG(key)).concat(content).concat(this.GEN_CLOSE_TAG(key), "\n");
    }
  }, {
    key: "renderArrayNode",
    value: function renderArrayNode(key, value, hint, indentation, level, indent, traverseSchema) {
      var output = '';
      var itemValue = value[0];
      var itemHint = Array.isArray(hint) ? hint[0] : hint;

      // Show two examples for arrays
      for (var i = 0; i < 2; i++) {
        output += "".concat(indentation).concat(this.GEN_OPEN_TAG(key, itemValue, itemHint), "\n");
        if (_typeof(itemValue) === 'object' && itemValue !== null) {
          // Always traverse for attributes/nested elements
          output += traverseSchema(itemValue, itemHint, level + 1);
        }

        // Then add text content if present
        var textContent = this.extractTextContent(itemValue, itemHint);
        if (textContent) {
          output += "".concat(indentation, "  ").concat(textContent, "\n");
        } else if (_typeof(itemValue) !== 'object' || itemValue === null) {
          var content = typeof itemHint === 'string' ? itemHint : typeof itemValue === 'string' ? itemValue : this.getTypeHintForPrimitive(itemValue) || '...';
          output += "".concat(indentation, "  ").concat(content, "\n");
        }
        output += "".concat(indentation).concat(this.GEN_CLOSE_TAG(key), "\n");
      }
      output += "".concat(indentation, "/*etc.*/\n");
      return output;
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
        if (this.constructor.RESERVED_PROPERTIES.has(key)) {
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
  }, {
    key: "makeArrayScaffold",
    value: function makeArrayScaffold(tag, content) {
      var schema = _defineProperty({}, tag, [content]);
      return this.makeMapSelectScaffold(schema);
    }
  }, {
    key: "makeObjectScaffold",
    value: function makeObjectScaffold(tag, _ref2) {
      var attributes = _ref2.attributes,
        textContent = _ref2.textContent,
        properties = _ref2.properties;
      var schema = _defineProperty({}, tag, _objectSpread(_objectSpread(_objectSpread({}, Object.fromEntries(attributes.map(function (_ref3) {
        var key = _ref3.key,
          value = _ref3.value;
        return ["$".concat(key), value];
      }))), textContent ? {
        $$text: textContent
      } : {}), Object.fromEntries(properties.map(function (_ref4) {
        var key = _ref4.key,
          value = _ref4.value;
        return [key, value];
      }))));
      return this.makeMapSelectScaffold(schema);
    }
  }, {
    key: "GEN_ATTRIBUTE_MARKER",
    value: function GEN_ATTRIBUTE_MARKER() {
      throw new Error('Subclass must implement GEN_ATTRIBUTE_MARKER');
    }
  }, {
    key: "GEN_ATTRIBUTE",
    value: function GEN_ATTRIBUTE(key, value) {
      throw new Error('Subclass must implement GEN_ATTRIBUTE');
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
      var hints = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var indent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2;
      var tagGenerators = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
      return new this().makeMapSelectScaffold(schema, hints, indent);
    }
  }, {
    key: "makeArrayScaffold",
    value: function makeArrayScaffold(tag, content) {
      return new this().makeArrayScaffold(tag, content);
    }
  }, {
    key: "makeObjectScaffold",
    value: function makeObjectScaffold(tag, options) {
      return new this().makeObjectScaffold(tag, options);
    }
  }, {
    key: "getAttributeString",
    value: function getAttributeString(obj, hints) {
      return new this().getAttributeString(obj, hints);
    }
  }]);
}();
_AbstractIncomingParserSelectorEngine = AbstractIncomingParserSelectorEngine;
_defineProperty(AbstractIncomingParserSelectorEngine, "SKIP_ATTRIBUTE_MARKER_IN_SCAFFOLD", true);
_defineProperty(AbstractIncomingParserSelectorEngine, "NAME", 'AbstractIncomingParserSelectorEngine');
_defineProperty(AbstractIncomingParserSelectorEngine, "RESERVED_PROPERTIES", new Set(['$$tagclosed', '$$tagkey', '$$children', '$$tagname', '__isNodeObj__']));
_defineProperty(AbstractIncomingParserSelectorEngine, "GEN_ATTRIBUTE", function (key, value) {
  return new _AbstractIncomingParserSelectorEngine().GEN_ATTRIBUTE(key, value);
});
export { Node };
export default AbstractIncomingParserSelectorEngine;