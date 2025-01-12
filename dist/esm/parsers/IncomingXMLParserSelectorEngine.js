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
function _superPropGet(t, o, e, r) { var p = _get(_getPrototypeOf(1 & r ? t.prototype : t), o, e); return 2 & r && "function" == typeof p ? function (t) { return p.apply(e, t); } : p; }
function _get() { return _get = "undefined" != typeof Reflect && Reflect.get ? Reflect.get.bind() : function (e, t, r) { var p = _superPropBase(e, t); if (p) { var n = Object.getOwnPropertyDescriptor(p, t); return n.get ? n.get.call(arguments.length < 3 ? e : r) : n.value; } }, _get.apply(null, arguments); }
function _superPropBase(t, o) { for (; !{}.hasOwnProperty.call(t, o) && null !== (t = _getPrototypeOf(t));); return t; }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { Parser } from 'htmlparser2';
import { selectAll } from 'css-select';
import { Type } from '../types.mjs';
import AbstractIncomingParserSelectorEngine from './AbstractIncomingParserSelectorEngine.mjs';
import Node from './Node.mjs';
var IncomingXMLParserSelectorEngine = /*#__PURE__*/function (_AbstractIncomingPars) {
  function IncomingXMLParserSelectorEngine() {
    var _this;
    _classCallCheck(this, IncomingXMLParserSelectorEngine);
    _this = _callSuper(this, IncomingXMLParserSelectorEngine);
    _defineProperty(_this, "GEN_ATTRIBUTE_MARKER", function () {
      return '$';
    });
    _this.parser = new Parser({
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
    key: "GEN_TYPE_HINT",
    value: function GEN_TYPE_HINT(type, hint) {
      // If we have a hint, use it
      if (hint !== null && hint !== void 0 && hint.$$text) {
        return hint.$$text;
      }

      // Otherwise use type formatting
      if (type === 'String') return "{String}".concat(hint ? " ".concat(hint) : '');
      if (type === 'Number') return "{Number}".concat(hint ? " ".concat(hint) : '');
      if (type === 'Boolean') return "{Boolean}".concat(hint ? " ".concat(hint) : '');
      return "{".concat(type, "}");
    }
  }, {
    key: "GEN_OPEN_TAG",
    value: function GEN_OPEN_TAG(name, attrs, hints) {
      return "<".concat(name).concat(attrs ? this.getAttributeString(attrs, hints) : '', ">");
    }
  }, {
    key: "GEN_CLOSE_TAG",
    value: function GEN_CLOSE_TAG(name) {
      return "</".concat(name, ">");
    }
  }, {
    key: "GEN_CDATA_OPEN",
    value: function GEN_CDATA_OPEN() {
      return '<![CDATA[';
    }
  }, {
    key: "GEN_CDATA_CLOSE",
    value: function GEN_CDATA_CLOSE() {
      return ']]>';
    }
  }, {
    key: "getAttributeString",
    value: function getAttributeString(obj) {
      var hints = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      if (_typeof(obj) !== 'object' || obj === null) return '';
      var attrs = '';
      for (var key in obj) {
        if (key.startsWith(this.GEN_ATTRIBUTE_MARKER()) && key !== '$$text') {
          var attrName = key.slice(1);
          var value = obj[key];
          var hint = hints === null || hints === void 0 ? void 0 : hints[key];

          // Use the hint text if available
          if (hint) {
            attrs += " ".concat(attrName, "=\"").concat(hint, "\"");
            continue;
          }

          // Handle functions (including primitives)
          if (typeof value === 'function') {
            attrs += " ".concat(attrName, "=\"").concat(this.GEN_TYPE_HINT(value.name, hint), "\"");
            continue;
          }

          // Handle string literals
          if (typeof value === 'string') {
            attrs += " ".concat(attrName, "=\"").concat(value, "\"");
            continue;
          }

          // Default case
          attrs += " ".concat(attrName, "=\"...\"");
        }
      }
      return attrs;
    }
  }, {
    key: "GEN_ATTRIBUTE",
    value: function GEN_ATTRIBUTE(key, value) {
      return "".concat(key, "=\"").concat(value, "\""); // XML style: key="value"
    }
  }, {
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
        if (schema instanceof Type) {
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
      var results = selectAll(selector, this.parsedData).map(_decorateWithAggregateText);
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
      var unfilteredResults = selectAll(selector, this.parsedData);
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
        return new Node('TEXT_NODE', {
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

      var formatted = new Node(element.name, {
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

    // Override processValue to skip attribute processing
  }, {
    key: "processValue",
    value: function processValue(value, key, hint, indentation, level, indent, processObject) {
      // Skip if this is an attribute
      if (key.startsWith(this.GEN_ATTRIBUTE_MARKER())) {
        return ''; // Attributes are handled by getAttributeString
      }
      return _superPropGet(IncomingXMLParserSelectorEngine, "processValue", this, 3)([value, key, hint, indentation, level, indent, processObject]);
    }
  }]);
}(AbstractIncomingParserSelectorEngine);
_defineProperty(IncomingXMLParserSelectorEngine, "NAME", 'xmlParser');
_defineProperty(IncomingXMLParserSelectorEngine, "SKIP_ATTRIBUTE_MARKER_IN_SCAFFOLD", true);
_defineProperty(IncomingXMLParserSelectorEngine, "RESERVED_PROPERTIES", new Set(['$$tagclosed', '$$tagkey', '$$children', '$$tagname', '$$attr', '__isNodeObj__']));
export { Node };
export default IncomingXMLParserSelectorEngine;