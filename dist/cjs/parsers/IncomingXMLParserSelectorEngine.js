"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Node", {
  enumerable: true,
  get: function get() {
    return _Node["default"];
  }
});
exports["default"] = void 0;
var _htmlparser = require("htmlparser2");
var _cssSelect = require("css-select");
var _types = require("../types.js");
var _AbstractIncomingParserSelectorEngine = _interopRequireDefault(require("./AbstractIncomingParserSelectorEngine.js"));
var _Node = _interopRequireDefault(require("./Node.js"));
var _IncomingXMLParserSelectorEngine;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
// class Node {
//   constructor(name, o) {
//     // super();
//     this.length = 0;
//     this.__isNodeObj__ = true;
//     if (o) {
//       this.$tagkey = o.key;
//       this.$attr = o.attr;
//       this.$text = o.aggregateText;
//       this.$tagclosed = o.closed;
//       this.$children = o.children || [];
//       this.$tagname = name;
//       const { key, attr, text, closed, children, ...rest } = o;
//       Object.assign(this, rest);
//     }
//   }
// }
var IncomingXMLParserSelectorEngine = /*#__PURE__*/function (_AbstractIncomingPars) {
  function IncomingXMLParserSelectorEngine() {
    var _this;
    _classCallCheck(this, IncomingXMLParserSelectorEngine);
    _this = _callSuper(this, IncomingXMLParserSelectorEngine);
    _this.parser = new _htmlparser.Parser({
      onopentag: function onopentag(name, attributes) {
        var element = {
          key: _this.elementIndex++,
          type: 'tag',
          name: name,
          attribs: attributes,
          children: [],
          parent: _this.openElements[_this.openElements.length - 1] || null,
          closed: false,
          textContent: '',
          prev: null,
          next: null
        };
        if (element.parent) {
          var siblings = element.parent.children;
          element.prev = siblings[siblings.length - 1] || null;
          if (element.prev) {
            element.prev.next = element;
          }
          element.parent.children.push(element);
        } else {
          _this.parsedData.push(element);
        }
        _this.openElements.push(element);
      },
      ontext: function ontext(text) {
        if (_this.openElements.length > 0) {
          var currentElement = _this.openElements[_this.openElements.length - 1];
          var textNode = {
            type: 'text',
            data: text,
            parent: currentElement,
            prev: currentElement.children[currentElement.children.length - 1] || null,
            next: null
          };
          if (textNode.prev) {
            textNode.prev.next = textNode;
          }
          currentElement.children.push(textNode);
        }
      },
      onclosetag: function onclosetag(name) {
        var closedElement = _this.openElements.pop();
        if (closedElement) {
          closedElement.closed = true;
          _this.updateTextContent(closedElement);
        }
      }
    }, {
      xmlMode: true
    });

    // Add cache for normalized schemas
    _this.normalizedSchemaCache = new WeakMap();
    return _this;
  }

  // Helper to normalize and cache schemas
  _inherits(IncomingXMLParserSelectorEngine, _AbstractIncomingPars);
  return _createClass(IncomingXMLParserSelectorEngine, [{
    key: "normalizeSchemaWithCache",
    value: function normalizeSchemaWithCache(schema) {
      // Check cache first
      // let cached = this.normalizedSchemaCache.get(schema);
      // if (cached) return cached;

      // Helper to validate and normalize schema
      var _validateAndNormalizeSchema = function validateAndNormalizeSchema(schema) {
        var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
        // Handle primitives and functions
        if (_typeof(schema) !== 'object' || schema === null) return schema;
        if (typeof schema === 'function') return schema;
        if (Array.isArray(schema)) return schema.map(function (s) {
          return _validateAndNormalizeSchema(s, "".concat(path, "[]"));
        });

        // Check for reserved properties
        Object.keys(schema).forEach(function (key) {
          if (IncomingXMLParserSelectorEngine.RESERVED_PROPERTIES.has(key)) {
            throw new Error("Invalid schema: \"".concat(key, "\" at \"").concat(path, "\" is a reserved node property and cannot be used in schemas"));
          }
        });
        if (schema instanceof _types.Type) {
          return schema;
        }
        var result = {};
        for (var _i = 0, _Object$entries = Object.entries(schema); _i < _Object$entries.length; _i++) {
          var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
            key = _Object$entries$_i[0],
            value = _Object$entries$_i[1];
          result[key] = _validateAndNormalizeSchema(value, path ? "".concat(path, ".").concat(key) : key);
        }
        return result;
      };

      // Normalize and validate
      var normalized = Array.isArray(schema) ? schema.map(function (m) {
        return _validateAndNormalizeSchema(m);
      }) : _validateAndNormalizeSchema(schema);
      this.normalizedSchemaCache.set(schema, normalized);
      return normalized;
    }
  }, {
    key: "updateTextContent",
    value: function updateTextContent(element) {
      element.textContent = this.getTextContent(element);
      if (element.parent) {
        this.updateTextContent(element.parent);
      }
    }
  }, {
    key: "add",
    value: function add(chunk) {
      this.buffer += chunk;
      this.parser.write(chunk);
    }

    // getElementSignature(element, forDeduping = false) {
    //   const ancestry = [];
    //   let current = element;

    //   while (current.parent) {
    //     ancestry.unshift(`${current.name}[${current.parent.children.indexOf(current)}]`);
    //     current = current.parent;
    //   }

    //   const signature = {
    //     ancestry: ancestry.join('/'),
    //     name: element.name,
    //     key: element.key,
    //     closed: element.closed
    //   };

    //   if (!forDeduping) {
    //     signature.textContent = this.getTextContent(element);
    //   }

    //   return JSON.stringify(signature);
    // }
  }, {
    key: "select",
    value: function select(selector) {
      var _this2 = this;
      var includeOpenTags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      function isClosed(el) {
        var _el$children;
        return el.closed || ((_el$children = el.children) === null || _el$children === void 0 ? void 0 : _el$children.length) && el.children.every(isClosed);
      }
      var _decorateWithAggregateText = function decorateWithAggregateText(el) {
        var _el$children2;
        el.aggregateText = _this2.getTextContent(el);
        if ((_el$children2 = el.children) !== null && _el$children2 !== void 0 && _el$children2.length) {
          el.children.map(_decorateWithAggregateText);
        }
        return el;
      };
      var results = (0, _cssSelect.selectAll)(selector, this.parsedData).map(_decorateWithAggregateText);
      var filteredResults = results.filter(function (el) {
        return includeOpenTags || isClosed(el);
      });
      return this.formatResults(filteredResults, includeOpenTags);
    }
  }, {
    key: "dedupeSelect",
    value: function dedupeSelect(selector) {
      var _this3 = this;
      var includeOpenTags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var doDedupeChildren = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      var unfilteredResults = (0, _cssSelect.selectAll)(selector, this.parsedData);
      var results = unfilteredResults.filter(function (el) {
        if (includeOpenTags) {
          return true;
        }
        return el.closed;
      });
      var _dedupeElement = function dedupeElement(el) {
        var _el$children3;
        var dedupeSignature = _this3.getElementSignature(el, true);
        var fullSignature = _this3.getElementSignature(el, false);
        el.aggregateText = _this3.getTextContent(el);
        if (!el.closed) {
          return el; // if it's open, we don't dedupe it
        }
        if (el.type !== 'tag') {
          return el;
        }
        var existingSignature = _this3.returnedElementSignatures.get(dedupeSignature);
        if ((_el$children3 = el.children) !== null && _el$children3 !== void 0 && _el$children3.length) {
          el.children.map(function (child) {
            child.aggregateText = _this3.getTextContent(child);
            return child;
          });
          el.dedupedChildren = el.children.map(function (child) {
            child.aggregateText = _this3.getTextContent(child);

            // If the child has not yet been returned, we can return it:
            // TODO: the meaning of 'deduped' is confusing now as it's
            // morphed from normalizaation/canonicalization to actual
            // removal from result-sets based on existing in previous
            // result-sets (intentional but still not fitting to the name)
            var dedupedChild = _dedupeElement(child);
            if (dedupedChild) {
              // I.e. child has not been returned yet, so:
              return dedupedChild;
            }
            // Also!! If it is open and we're flagged to include open tags,
            // then we can return it too:
            if (includeOpenTags && !child.closed) {
              return child;
            }

            // Otherwise, we don't return it:
            return null;

            // If we are not de-duping children, then happily return:
            // return child;
          }).filter(Boolean);
          if (doDedupeChildren) {
            el.children = el.dedupedChildren;
          }
        }
        if (!existingSignature) {
          _this3.returnedElementSignatures.set(dedupeSignature, fullSignature);
          return el;
        }
        if (!el.closed && existingSignature !== fullSignature) {
          _this3.returnedElementSignatures.set(dedupeSignature, fullSignature);
          return el;
        }
        return null;
      };
      var newResults = results.filter(function (result) {
        var dedupedElement = _dedupeElement(result);
        if (dedupedElement) {
          return true;
        }
        return false;
      });
      return this.formatResults(newResults, includeOpenTags);
    }
  }, {
    key: "formatResults",
    value: function formatResults(results) {
      var _this4 = this;
      var includeOpenTags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      return results.map(function (r) {
        return _this4.formatElement(r, includeOpenTags);
      });
    }
  }, {
    key: "formatElement",
    value: function formatElement(element) {
      var _element$children,
        _this5 = this,
        _element$children2;
      var includeOpenTags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      element.aggregateText = element.aggregateText || this.getTextContent(element);
      // Special case for text nodes
      if (element.type === 'text') {
        return new _Node["default"]('TEXT_NODE', {
          key: -1,
          // Text nodes don't need unique keys
          text: element.data,
          closed: true,
          // Text nodes are always "closed"
          children: [],
          attr: {}
        });
      }

      // Skip any non-text, non-tag nodes
      if (element.type !== 'tag' && element.type !== 'text') {
        return null;
      }

      // First format all children recursively
      var formattedChildren = ((_element$children = element.children) === null || _element$children === void 0 ? void 0 : _element$children.map(function (child) {
        return _this5.formatElement(child, includeOpenTags);
      }).filter(Boolean)) || []; // Filter out null results from skipped nodes

      var formatted = new _Node["default"](element.name, {
        key: element.key,
        attr: _objectSpread({}, element.attribs),
        aggregateText: element.aggregateText,
        //???? NOTE TODO
        text: includeOpenTags ? element.closed ? element.textContent : this.getTextContent(element) : element.textContent,
        closed: element.closed,
        children: formattedChildren
      });
      formatted.length = 0;
      if ((_element$children2 = element.children) !== null && _element$children2 !== void 0 && _element$children2.length) {
        element.children.forEach(function (child) {
          if (child.type === 'tag') {
            if (!formatted[child.name]) {
              formatted[child.name] = [];
            }
            if (!Array.isArray(formatted[child.name])) {
              formatted[child.name] = [formatted[child.name]];
            }
            var formattedChild = _this5.formatElement(child, includeOpenTags);
            if (formattedChild) {
              formatted[child.name].push(formattedChild);
            }
          }
        });
      }
      return formatted;
    }

    /**
     * Maps schema to elements, yielding only newly completed elements.
     * This is "delta mode" - you only see elements once, when they complete.
     */
  }, {
    key: "mapSelectClosed",
    value: function mapSelectClosed(schema) {
      // Add JSDoc to clarify this is "delta mode"
      return this.mapSelect(schema, false, true); // includeOpen=false, dedupe=true
    }

    /**
     * Maps schema to elements. Can operate in different modes:
     * - State mode: (includeOpen=true, dedupe=false) - Shows growing state including partials
     * - RootOnce mode: (includeOpen=false, dedupe=true) - Shows only new complete elements
     * - Snapshot mode: (includeOpen=false, dedupe=false) - Shows current complete state
     */
  }, {
    key: "mapSelect_0",
    value: function mapSelect_0(mapping) {
      var _this6 = this;
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
        console.log('map>>>', map instanceof _types.Type, map);

        // Handle Type instances
        if (map instanceof _types.Type) {
          // Apply validation if present
          // if (map.validate && element) {
          //   const value = element.$text?.trim() || '';
          //   if (!map.validate(value)) {
          //     throw new Error(`Validation failed for value: ${value}`);
          //   }
          // }

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
            } else if (k.startsWith('$')) {
              var attrName = k.slice(1);
              if (element !== null && element !== void 0 && element.$attr && element.$attr[attrName] != null) {
                var _value2 = _applyMapping(element.$attr[attrName], mapItem);
                if (_value2 !== undefined) out[k] = _value2;
              }
            } else {
              var childElement = element === null || element === void 0 ? void 0 : element[k];
              if (!childElement) {
                // Handle unfulfilled schema parts
                if (mapItem instanceof _types.Type && mapItem["default"] !== undefined) {
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
        var elements = doDedupe ? _this6.dedupeSelect(selector, includeOpenTags) : _this6.select(selector, includeOpenTags);
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
  }], [{
    key: "getAttributeString",
    value: function getAttributeString(obj) {
      var hints = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      if (_typeof(obj) !== 'object' || obj === null) return '';
      var attrs = '';
      for (var key in obj) {
        if (key.startsWith(this.GEN_ATTRIBUTE_MARKER()) && key !== '$text') {
          var attrName = key.slice(1);
          var value = obj[key];
          var hint = hints === null || hints === void 0 ? void 0 : hints[key];

          // Handle string literals as pure hints
          if (typeof value === 'string') {
            attrs += " ".concat(attrName, "=\"").concat(value, "\"");
            continue;
          }

          // Handle functions (including primitives) with optional hints
          if (typeof value === 'function') {
            var typeHint = value === String ? '{String}' : value === Number ? '{Number}' : value === Boolean ? '{Boolean}' : '';
            var content = hint ? hint : typeHint || '...';
            attrs += " ".concat(attrName, "=\"").concat(content, "\"");
            continue;
          }

          // Default case
          attrs += " ".concat(attrName, "=\"").concat(hint || '...', "\"");
        }
      }
      return attrs;
    }
  }]);
}(_AbstractIncomingParserSelectorEngine["default"]);
_IncomingXMLParserSelectorEngine = IncomingXMLParserSelectorEngine;
_defineProperty(IncomingXMLParserSelectorEngine, "GEN_ATTRIBUTE_MARKER", function () {
  return '$';
});
_defineProperty(IncomingXMLParserSelectorEngine, "RESERVED_PROPERTIES", new Set(['$tagclosed', '$tagkey', '$children', '$tagname', '$attr', '__isNodeObj__']));
_defineProperty(IncomingXMLParserSelectorEngine, "GEN_OPEN_TAG", function (name, attrs, hints) {
  return "<".concat(name).concat(attrs ? _IncomingXMLParserSelectorEngine.getAttributeString(attrs, hints) : '', ">");
});
_defineProperty(IncomingXMLParserSelectorEngine, "GEN_CLOSE_TAG", function (name) {
  return "</".concat(name, ">");
});
var _default = exports["default"] = IncomingXMLParserSelectorEngine;