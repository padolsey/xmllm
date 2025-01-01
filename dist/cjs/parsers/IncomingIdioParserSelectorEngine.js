"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
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
var _types = require("../types.js");
var _AbstractIncomingParserSelectorEngine = _interopRequireDefault(require("./AbstractIncomingParserSelectorEngine.js"));
var _Node = _interopRequireDefault(require("./Node.js"));
var _config = require("../config.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
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
var IncomingIdioParserSelectorEngine = /*#__PURE__*/function (_AbstractIncomingPars) {
  function IncomingIdioParserSelectorEngine() {
    _classCallCheck(this, IncomingIdioParserSelectorEngine);
    return _callSuper(this, IncomingIdioParserSelectorEngine);
  }
  _inherits(IncomingIdioParserSelectorEngine, _AbstractIncomingPars);
  return _createClass(IncomingIdioParserSelectorEngine, [{
    key: "add",
    value: function add(chunk) {
      var config = (0, _config.getConfig)();
      this.buffer += chunk;

      // Update the parsing logic to use the configured symbol
      while (this.position < this.buffer.length) {
        var symbol = config.idioSymbol;
        if (this.buffer.startsWith("".concat(symbol, "START("), this.position)) {
          // Attempt to parse a start tag
          var endOfStartTag = this.buffer.indexOf(')', this.position + 7);
          if (endOfStartTag === -1) {
            // Incomplete start tag; wait for more input
            break;
          }
          var name = this.buffer.substring(this.position + 7, endOfStartTag);

          // Create new element
          var element = {
            type: 'tag',
            key: this.elementIndex++,
            name: name,
            children: [],
            parent: this.openElements[this.openElements.length - 1] || null,
            closed: false
          };
          if (element.parent) {
            element.parent.children.push(element);
          } else {
            this.parsedData.push(element);
          }
          this.openElements.push(element);
          this.position = endOfStartTag + 1;
        } else if (this.buffer.startsWith("".concat(symbol, "END("), this.position)) {
          // Attempt to parse an end tag
          var endOfEndTag = this.buffer.indexOf(')', this.position + 5);
          if (endOfEndTag === -1) {
            // Incomplete end tag; wait for more input
            break;
          }
          var tagName = this.buffer.substring(this.position + 5, endOfEndTag);
          this.closeElement(tagName);
          this.position = endOfEndTag + 1;
        } else {
          var _symbol = config.idioSymbol;
          if (this.buffer[this.position] === _symbol) {
            // Potential partial marker
            var remaining = this.buffer.substring(this.position);
            if (remaining.startsWith("".concat(_symbol, "START(")) || remaining.startsWith("".concat(_symbol, "END("))) {
              // Should have been handled above
              // This case shouldn't occur, but to be safe
              continue;
            } else if (remaining.length < 7) {
              // Possible partial marker, wait for more data
              break;
            } else {
              // Invalid marker, treat symbol as text
              this.addTextToCurrentElement(_symbol);
              this.position++;
            }
          } else {
            // Collect text content up to the next symbol
            var nextMarkerPos = this.buffer.indexOf(_symbol, this.position);
            var text = void 0;
            if (nextMarkerPos === -1) {
              text = this.buffer.substring(this.position);
              this.position = this.buffer.length;
            } else {
              text = this.buffer.substring(this.position, nextMarkerPos);
              this.position = nextMarkerPos;
            }
            this.addTextToCurrentElement(text);
          }
        }
      }

      // Clean up the buffer
      if (this.position > 0) {
        this.buffer = this.buffer.substring(this.position);
        this.position = 0;
      }
    }
  }, {
    key: "closeElement",
    value: function closeElement(name) {
      // Find the most recent unclosed element with the given name
      for (var i = this.openElements.length - 1; i >= 0; i--) {
        var element = this.openElements[i];
        if (element.name === name) {
          element.closed = true;
          this.openElements.splice(i, 1);
          return;
        }
      }
      // Ignore unmatched end tags
    }
  }, {
    key: "addTextToCurrentElement",
    value: function addTextToCurrentElement(text) {
      if (this.openElements.length > 0) {
        var currentElement = this.openElements[this.openElements.length - 1];
        var textNode = {
          type: 'text',
          data: text,
          parent: currentElement
        };
        currentElement.children.push(textNode);
      } else {
        // If there's no open element, add text to root level
        if (text.trim()) {
          var _textNode = {
            type: 'text',
            data: text,
            parent: null
          };
          this.parsedData.push(_textNode);
        }
      }
    }

    /**
     * Finds elements matching the given selector
     */
  }, {
    key: "findElements",
    value: function findElements(elements, selector) {
      var includeOpenTags = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      if (!selector) return [];

      // Split selector into parts for descendant matching
      var selectorParts = selector.trim().split(/\s+/);
      var results = elements;

      // Process each part of the selector
      var _iterator = _createForOfIteratorHelper(selectorParts),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var part = _step.value;
          var matchingResults = [];

          // For each current result, find matching children
          var _iterator2 = _createForOfIteratorHelper(results),
            _step2;
          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              var element = _step2.value;
              if (element.type === 'tag') {
                // Direct match at current level
                if (element.name === part && (includeOpenTags || element.closed)) {
                  matchingResults.push(element);
                }

                // Search through children recursively
                if (element.children && element.children.length > 0) {
                  matchingResults.push.apply(matchingResults, _toConsumableArray(this.findElements(element.children, part, includeOpenTags)));
                }
              }
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
          }
          results = matchingResults;
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return results;
    }
  }, {
    key: "select",
    value: function select(selector) {
      var includeOpenTags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      if (!selector) return [];
      var elements = this.findElements(this.parsedData, selector, includeOpenTags);
      return this.formatResults(elements, includeOpenTags);
    }
  }, {
    key: "dedupeSelect",
    value: function dedupeSelect(selector) {
      var includeOpenTags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var matchingElements = this.findElements(this.parsedData, selector, includeOpenTags);
      var dedupedElements = [];
      var _iterator3 = _createForOfIteratorHelper(matchingElements),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var element = _step3.value;
          var dedupeSignature = this.getElementSignature(element, true);
          var fullSignature = this.getElementSignature(element, false);
          var existingSignature = this.returnedElementSignatures.get(dedupeSignature);
          if (!existingSignature || !element.closed && existingSignature !== fullSignature) {
            this.returnedElementSignatures.set(dedupeSignature, fullSignature);
            dedupedElements.push(element);
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
      return this.formatResults(dedupedElements, includeOpenTags);
    }
  }, {
    key: "formatElement",
    value: function formatElement(element) {
      var _element$children,
        _this = this;
      var includeOpenTags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      element.aggregateText = element.aggregateText || this.getTextContent(element);

      // Base case for text nodes
      if (element.type === 'text') {
        return new _Node["default"]('TEXT_NODE', {
          key: -1,
          text: element.data,
          closed: true,
          children: []
        });
      }

      // Skip open tags if not included
      if (!includeOpenTags && !element.closed) return null;

      // Format children recursively
      var formattedChildren = ((_element$children = element.children) === null || _element$children === void 0 ? void 0 : _element$children.map(function (child) {
        return _this.formatElement(child, includeOpenTags);
      }).filter(Boolean)) || [];

      // Get all text content including from child nodes
      var allText = this.getTextContent(element);
      var formatted = new _Node["default"](element.name, {
        key: element.key,
        text: allText,
        closed: element.closed,
        children: formattedChildren
      });
      formatted.length = 0;

      // Group children by name
      var childrenByName = new Map();
      var _iterator4 = _createForOfIteratorHelper(formattedChildren),
        _step4;
      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var child = _step4.value;
          if (child.$tagname !== 'TEXT_NODE') {
            if (!childrenByName.has(child.$tagname)) {
              childrenByName.set(child.$tagname, []);
            }
            childrenByName.get(child.$tagname).push(child);
          }
        }

        // Assign child arrays to formatted node
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }
      var _iterator5 = _createForOfIteratorHelper(childrenByName),
        _step5;
      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var _step5$value = _slicedToArray(_step5.value, 2),
            name = _step5$value[0],
            children = _step5$value[1];
          formatted[name] = children;
        }
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }
      return formatted;
    }
  }]);
}(_AbstractIncomingParserSelectorEngine["default"]);
_defineProperty(IncomingIdioParserSelectorEngine, "GEN_ATTRIBUTE_MARKER", function () {
  return null;
});
_defineProperty(IncomingIdioParserSelectorEngine, "GEN_OPEN_TAG", function (name) {
  var config = (0, _config.getConfig)();
  return "".concat(config.idioSymbol, "START(").concat(name, ")");
});
_defineProperty(IncomingIdioParserSelectorEngine, "GEN_CLOSE_TAG", function (name) {
  var config = (0, _config.getConfig)();
  return "".concat(config.idioSymbol, "END(").concat(name, ")");
});
var _default = exports["default"] = IncomingIdioParserSelectorEngine;