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
var _AbstractIncomingParserSelectorEngine = _interopRequireDefault(require("./AbstractIncomingParserSelectorEngine.js"));
var _Node = _interopRequireDefault(require("./Node.js"));
var _config = require("../config.js");
var _IncomingIdioParserSelectorEngine;
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
    var _ref, _config$tagPrefix, _globalConfig$idioSym, _ref2, _config$closePrefix, _globalConfig$idioSym2, _ref3, _config$openBrace, _globalConfig$idioSym3, _ref4, _config$closeBrace, _globalConfig$idioSym4, _ref5, _config$braceSuffix, _globalConfig$idioSym5;
    var _this;
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    _classCallCheck(this, IncomingIdioParserSelectorEngine);
    _this = _callSuper(this, IncomingIdioParserSelectorEngine);
    var globalConfig = (0, _config.getConfig)();

    // Precedence: instance config > global config > class defaults
    _this.config = {
      tagPrefix: (_ref = (_config$tagPrefix = config.tagPrefix) !== null && _config$tagPrefix !== void 0 ? _config$tagPrefix : (_globalConfig$idioSym = globalConfig.idioSymbols) === null || _globalConfig$idioSym === void 0 ? void 0 : _globalConfig$idioSym.tagPrefix) !== null && _ref !== void 0 ? _ref : IncomingIdioParserSelectorEngine.DEFAULT_START_MARKER,
      closePrefix: (_ref2 = (_config$closePrefix = config.closePrefix) !== null && _config$closePrefix !== void 0 ? _config$closePrefix : (_globalConfig$idioSym2 = globalConfig.idioSymbols) === null || _globalConfig$idioSym2 === void 0 ? void 0 : _globalConfig$idioSym2.closePrefix) !== null && _ref2 !== void 0 ? _ref2 : IncomingIdioParserSelectorEngine.DEFAULT_END_MARKER,
      openBrace: (_ref3 = (_config$openBrace = config.openBrace) !== null && _config$openBrace !== void 0 ? _config$openBrace : (_globalConfig$idioSym3 = globalConfig.idioSymbols) === null || _globalConfig$idioSym3 === void 0 ? void 0 : _globalConfig$idioSym3.openBrace) !== null && _ref3 !== void 0 ? _ref3 : IncomingIdioParserSelectorEngine.DEFAULT_START_WRAPPER,
      closeBrace: (_ref4 = (_config$closeBrace = config.closeBrace) !== null && _config$closeBrace !== void 0 ? _config$closeBrace : (_globalConfig$idioSym4 = globalConfig.idioSymbols) === null || _globalConfig$idioSym4 === void 0 ? void 0 : _globalConfig$idioSym4.closeBrace) !== null && _ref4 !== void 0 ? _ref4 : IncomingIdioParserSelectorEngine.DEFAULT_END_WRAPPER,
      braceSuffix: (_ref5 = (_config$braceSuffix = config.braceSuffix) !== null && _config$braceSuffix !== void 0 ? _config$braceSuffix : (_globalConfig$idioSym5 = globalConfig.idioSymbols) === null || _globalConfig$idioSym5 === void 0 ? void 0 : _globalConfig$idioSym5.braceSuffix) !== null && _ref5 !== void 0 ? _ref5 : IncomingIdioParserSelectorEngine.DEFAULT_CLOSE_WRAPPER
    };
    return _this;
  }
  _inherits(IncomingIdioParserSelectorEngine, _AbstractIncomingPars);
  return _createClass(IncomingIdioParserSelectorEngine, [{
    key: "add",
    value: function add(chunk) {
      this.buffer += chunk;
      while (this.position < this.buffer.length) {
        var startPattern = "".concat(this.config.tagPrefix).concat(this.config.openBrace);
        var endPattern = "".concat(this.config.closePrefix).concat(this.config.closeBrace);

        // Check for end tag first since it's more specific
        if (this.buffer.startsWith(endPattern, this.position)) {
          var tagStart = this.position + endPattern.length;
          var endOfEndTag = this.buffer.indexOf(this.config.braceSuffix, tagStart);
          if (endOfEndTag === -1) {
            // Incomplete end tag; wait for more input
            break;
          }
          var tagName = this.buffer.slice(tagStart, endOfEndTag);

          // Close the element (with fallback)
          this.closeElement(tagName);
          this.position = endOfEndTag + this.config.braceSuffix.length;
        } else if (this.buffer.startsWith(startPattern, this.position)) {
          var _tagStart = this.position + startPattern.length;
          var endOfStartTag = this.buffer.indexOf(this.config.braceSuffix, _tagStart);
          if (endOfStartTag === -1) {
            // Incomplete start tag; wait for more input
            break;
          }
          var _tagName = this.buffer.slice(_tagStart, endOfStartTag);

          // Create new element
          var element = {
            type: 'tag',
            key: this.elementIndex++,
            name: _tagName,
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
          this.position = endOfStartTag + this.config.braceSuffix.length;
        } else {
          // Update text handling to use config markers
          if (this.buffer[this.position] === this.config.tagPrefix[0] || this.buffer[this.position] === this.config.closePrefix[0]) {
            // Potential partial marker
            var remaining = this.buffer.substring(this.position);
            if (remaining.startsWith(startPattern) || remaining.startsWith(endPattern)) {
              // Should have been handled above
              // This case shouldn't occur, but to be safe
              continue;
            } else if (remaining.length < Math.max(this.config.tagPrefix.length + this.config.openBrace.length, this.config.closePrefix.length + this.config.closeBrace.length)) {
              // Possible partial marker, wait for more data
              break;
            } else {
              // Invalid marker, treat as text
              this.addTextToCurrentElement(this.buffer[this.position]);
              this.position++;
            }
          } else {
            // Collect text content up to the next marker
            var nexttagPrefixPos = this.buffer.indexOf(this.config.tagPrefix, this.position + 1);
            var nextclosePrefixPos = this.buffer.indexOf(this.config.closePrefix, this.position + 1);
            var nextMarkerPos = nexttagPrefixPos === -1 ? nextclosePrefixPos : nextclosePrefixPos === -1 ? nexttagPrefixPos : Math.min(nexttagPrefixPos, nextclosePrefixPos);
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
      var foundIndex = -1;
      for (var i = this.openElements.length - 1; i >= 0; i--) {
        var element = this.openElements[i];
        if (element.name === name) {
          foundIndex = i;
          break;
        }
      }
      if (foundIndex !== -1) {
        // Close the element and any open attribute nodes above it
        while (this.openElements.length > foundIndex) {
          var elem = this.openElements.pop();
          elem.closed = true;
        }
      } else {
        // Fallback: close the most recently opened element
        if (this.openElements.length > 0) {
          var _elem = this.openElements.pop();
          _elem.closed = true;
        }
      }
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
      var _this2 = this;
      var includeOpenTags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      // For aggregateText, we want all text including attributes
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

      // Collect attributes from @-prefixed elements
      var attrs = {};
      var regularChildren = [];
      var _iterator4 = _createForOfIteratorHelper(element.children || []),
        _step4;
      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var child = _step4.value;
          if (child.type === 'tag' && child.name.startsWith('@')) {
            // Store as attribute
            var attrName = child.name.substring(1);
            attrs[attrName] = this.getTextContent(child);
          } else {
            regularChildren.push(child);
          }
        }

        // Format remaining children recursively
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }
      var formattedChildren = regularChildren.map(function (child) {
        return _this2.formatElement(child, includeOpenTags);
      }).filter(Boolean);

      // Get text content excluding attribute nodes for the main node text
      var allText = this.getTextContent(element, function (child) {
        return !(child.type === 'tag' && child.name.startsWith('@'));
      });

      // Create the formatted node with collected attributes
      var formatted = new _Node["default"](element.name, {
        key: element.key,
        text: allText,
        closed: element.closed,
        children: formattedChildren,
        attr: attrs
      });

      // Group children by name
      var childrenByName = new Map();
      var _iterator5 = _createForOfIteratorHelper(formattedChildren),
        _step5;
      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var _child = _step5.value;
          if (_child.$$tagname !== 'TEXT_NODE') {
            if (!childrenByName.has(_child.$$tagname)) {
              childrenByName.set(_child.$$tagname, []);
            }
            childrenByName.get(_child.$$tagname).push(_child);
          }
        }

        // Assign child arrays to formatted node
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }
      var _iterator6 = _createForOfIteratorHelper(childrenByName),
        _step6;
      try {
        for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
          var _step6$value = _slicedToArray(_step6.value, 2),
            name = _step6$value[0],
            children = _step6$value[1];
          formatted[name] = children;
        }
      } catch (err) {
        _iterator6.e(err);
      } finally {
        _iterator6.f();
      }
      return formatted;
    }
  }]);
}(_AbstractIncomingParserSelectorEngine["default"]);
_IncomingIdioParserSelectorEngine = IncomingIdioParserSelectorEngine;
_defineProperty(IncomingIdioParserSelectorEngine, "NAME", 'idioParser');
_defineProperty(IncomingIdioParserSelectorEngine, "GEN_ATTRIBUTE_MARKER", function () {
  return '$';
});
_defineProperty(IncomingIdioParserSelectorEngine, "SKIP_ATTRIBUTE_MARKER_IN_SCAFFOLD", false);
_defineProperty(IncomingIdioParserSelectorEngine, "DEFAULT_START_MARKER", '@');
_defineProperty(IncomingIdioParserSelectorEngine, "DEFAULT_END_MARKER", '@');
_defineProperty(IncomingIdioParserSelectorEngine, "DEFAULT_START_WRAPPER", 'START(');
_defineProperty(IncomingIdioParserSelectorEngine, "DEFAULT_END_WRAPPER", 'END(');
_defineProperty(IncomingIdioParserSelectorEngine, "DEFAULT_CLOSE_WRAPPER", ')');
_defineProperty(IncomingIdioParserSelectorEngine, "GEN_OPEN_TAG", function (name, attrs, hints) {
  name = name.replace(/^\$/, '@');
  // Get the global config for scaffold generation
  var globalConfig = (0, _config.getConfig)();
  var symbols = globalConfig.idioSymbols || {
    tagPrefix: _IncomingIdioParserSelectorEngine.DEFAULT_START_MARKER,
    openBrace: _IncomingIdioParserSelectorEngine.DEFAULT_START_WRAPPER,
    braceSuffix: _IncomingIdioParserSelectorEngine.DEFAULT_CLOSE_WRAPPER
  };
  return "".concat(symbols.tagPrefix).concat(symbols.openBrace).concat(name).concat(symbols.braceSuffix);
});
_defineProperty(IncomingIdioParserSelectorEngine, "GEN_CLOSE_TAG", function (name) {
  name = name.replace(/^\$/, '@');
  // Get the global config for scaffold generation
  var globalConfig = (0, _config.getConfig)();
  var symbols = globalConfig.idioSymbols || {
    closePrefix: _IncomingIdioParserSelectorEngine.DEFAULT_END_MARKER,
    closeBrace: _IncomingIdioParserSelectorEngine.DEFAULT_END_WRAPPER,
    braceSuffix: _IncomingIdioParserSelectorEngine.DEFAULT_CLOSE_WRAPPER
  };
  return "".concat(symbols.closePrefix).concat(symbols.closeBrace).concat(name).concat(symbols.braceSuffix);
});
_defineProperty(IncomingIdioParserSelectorEngine, "GEN_TYPE_HINT", function (type) {
  var enumValues = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  return "...".concat(type, "...");
});
var _default = exports["default"] = IncomingIdioParserSelectorEngine;