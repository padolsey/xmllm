var _IncomingIdioParserSelectorEngine;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
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
import AbstractIncomingParserSelectorEngine from './AbstractIncomingParserSelectorEngine.mjs';
import Node from './Node.mjs';
import { getConfig } from '../config.mjs';
var IncomingIdioParserSelectorEngine = /*#__PURE__*/function (_AbstractIncomingPars) {
  function IncomingIdioParserSelectorEngine() {
    var _ref, _config$openTagPrefix, _globalConfig$idioSym, _ref2, _config$closeTagPrefi, _globalConfig$idioSym2, _ref3, _config$tagOpener, _globalConfig$idioSym3, _ref4, _config$tagCloser, _globalConfig$idioSym4, _ref5, _config$tagSuffix, _globalConfig$idioSym5;
    var _this;
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    _classCallCheck(this, IncomingIdioParserSelectorEngine);
    _this = _callSuper(this, IncomingIdioParserSelectorEngine);
    var globalConfig = getConfig();

    // Convert to arrays and validate lengths
    var normalizeToArray = function normalizeToArray(value) {
      return Array.isArray(value) ? value : [value];
    };
    var symbols = {
      openTagPrefix: normalizeToArray((_ref = (_config$openTagPrefix = config.openTagPrefix) !== null && _config$openTagPrefix !== void 0 ? _config$openTagPrefix : (_globalConfig$idioSym = globalConfig.idioSymbols) === null || _globalConfig$idioSym === void 0 ? void 0 : _globalConfig$idioSym.openTagPrefix) !== null && _ref !== void 0 ? _ref : IncomingIdioParserSelectorEngine.DEFAULT_START_MARKER),
      closeTagPrefix: normalizeToArray((_ref2 = (_config$closeTagPrefi = config.closeTagPrefix) !== null && _config$closeTagPrefi !== void 0 ? _config$closeTagPrefi : (_globalConfig$idioSym2 = globalConfig.idioSymbols) === null || _globalConfig$idioSym2 === void 0 ? void 0 : _globalConfig$idioSym2.closeTagPrefix) !== null && _ref2 !== void 0 ? _ref2 : IncomingIdioParserSelectorEngine.DEFAULT_END_MARKER),
      tagOpener: normalizeToArray((_ref3 = (_config$tagOpener = config.tagOpener) !== null && _config$tagOpener !== void 0 ? _config$tagOpener : (_globalConfig$idioSym3 = globalConfig.idioSymbols) === null || _globalConfig$idioSym3 === void 0 ? void 0 : _globalConfig$idioSym3.tagOpener) !== null && _ref3 !== void 0 ? _ref3 : IncomingIdioParserSelectorEngine.DEFAULT_START_WRAPPER),
      tagCloser: normalizeToArray((_ref4 = (_config$tagCloser = config.tagCloser) !== null && _config$tagCloser !== void 0 ? _config$tagCloser : (_globalConfig$idioSym4 = globalConfig.idioSymbols) === null || _globalConfig$idioSym4 === void 0 ? void 0 : _globalConfig$idioSym4.tagCloser) !== null && _ref4 !== void 0 ? _ref4 : IncomingIdioParserSelectorEngine.DEFAULT_END_WRAPPER),
      tagSuffix: normalizeToArray((_ref5 = (_config$tagSuffix = config.tagSuffix) !== null && _config$tagSuffix !== void 0 ? _config$tagSuffix : (_globalConfig$idioSym5 = globalConfig.idioSymbols) === null || _globalConfig$idioSym5 === void 0 ? void 0 : _globalConfig$idioSym5.tagSuffix) !== null && _ref5 !== void 0 ? _ref5 : IncomingIdioParserSelectorEngine.DEFAULT_CLOSE_WRAPPER)
    };
    _this.config = symbols;
    return _this;
  }
  _inherits(IncomingIdioParserSelectorEngine, _AbstractIncomingPars);
  return _createClass(IncomingIdioParserSelectorEngine, [{
    key: "add",
    value: function add(chunk) {
      var _this2 = this;
      this.buffer += chunk;
      while (this.position < this.buffer.length) {
        var startPatterns = this.config.openTagPrefix.flatMap(function (prefix) {
          return _this2.config.tagOpener.map(function (brace) {
            return prefix + brace;
          });
        });
        var endPatterns = this.config.closeTagPrefix.flatMap(function (prefix) {
          return _this2.config.tagCloser.map(function (brace) {
            return prefix + brace;
          });
        });

        // Check for end tag first
        var endMatch = this.findFirstMatch(this.buffer, this.position, endPatterns);
        if (endMatch !== null && endMatch !== void 0 && endMatch.partial) {
          break;
        }
        if (endMatch) {
          var tagStart = this.position + endMatch.length;
          var suffixMatch = this.findFirstSuffix(this.buffer, tagStart);
          if (!suffixMatch) {
            break;
          }
          var tagName = this.buffer.slice(tagStart, suffixMatch.pos);
          this.closeElement(tagName);
          this.position = suffixMatch.pos + suffixMatch.suffix.length;
          continue;
        }

        // Check for start tag
        var startMatch = this.findFirstMatch(this.buffer, this.position, startPatterns);
        if (startMatch !== null && startMatch !== void 0 && startMatch.partial) {
          break;
        }
        if (startMatch) {
          var _tagStart = this.position + startMatch.length;
          var _suffixMatch = void 0;
          if (startMatch.emptyOpener) {
            // For empty tagOpener, we already found the suffix
            var _tagName = this.buffer.slice(startMatch.nameStart, startMatch.suffixPos - this.config.tagSuffix[0].length);
            _suffixMatch = {
              pos: startMatch.suffixPos - this.config.tagSuffix[0].length,
              suffix: this.config.tagSuffix[0]
            };
          } else {
            _suffixMatch = this.findFirstSuffix(this.buffer, _tagStart);
          }
          if (!_suffixMatch) {
            break;
          }
          var _tagName2 = this.buffer.slice(_tagStart, _suffixMatch.pos);
          var element = {
            type: 'tag',
            key: this.elementIndex++,
            name: _tagName2,
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
          this.position = _suffixMatch.pos + _suffixMatch.suffix.length;
          continue;
        }

        // Look ahead for potential markers
        var nextMarkerPos = this.findNextMarkerPosition(this.buffer, this.position + 1, [].concat(_toConsumableArray(startPatterns), _toConsumableArray(endPatterns)));
        if (nextMarkerPos === -1) {
          // No markers found - check if last character could be start of marker
          var lastChar = this.buffer[this.buffer.length - 1];
          var couldBeMarker = [].concat(_toConsumableArray(this.config.openTagPrefix), _toConsumableArray(this.config.closeTagPrefix)).includes(lastChar);
          if (this.position < this.buffer.length) {
            var endPos = couldBeMarker ? this.buffer.length - 1 : this.buffer.length;
            this.addTextToCurrentElement(this.buffer.substring(this.position, endPos));
            this.position = endPos;
          }
          break;
        } else {
          this.addTextToCurrentElement(this.buffer.substring(this.position, nextMarkerPos));
          this.position = nextMarkerPos;
        }
      }

      // Clean up buffer
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
      var _this3 = this;
      var includeOpenTags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      // For aggregateText, we want all text including attributes
      element.aggregateText = element.aggregateText || this.getTextContent(element);

      // Base case for text nodes
      if (element.type === 'text') {
        return new Node('TEXT_NODE', {
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
        return _this3.formatElement(child, includeOpenTags);
      }).filter(Boolean);

      // Get text content excluding attribute nodes for the main node text
      var allText = this.getTextContent(element, function (child) {
        return !(child.type === 'tag' && child.name.startsWith('@'));
      });

      // Create the formatted node with collected attributes
      var formatted = new Node(element.name, {
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

    // Add helper methods for finding markers
  }, {
    key: "findFirstMatch",
    value: function findFirstMatch(buffer, position, patterns) {
      var _this4 = this;
      // First check for complete patterns
      var _iterator7 = _createForOfIteratorHelper(patterns),
        _step7;
      try {
        var _loop = function _loop() {
            var pattern = _step7.value;
            if (buffer.startsWith(pattern, position)) {
              // For empty tagOpener/tagCloser, we need to include the suffix in the pattern
              if (pattern === _this4.config.openTagPrefix[0] || pattern === _this4.config.closeTagPrefix[0]) {
                var afterPrefix = buffer.substring(position + pattern.length);
                var isClosing = _this4.config.tagCloser.some(function (closer) {
                  return afterPrefix.startsWith(closer);
                });
                var nameStart = position + pattern.length + (isClosing ? 1 : 0);
                var suffixPos = buffer.indexOf(_this4.config.tagSuffix[0], nameStart);
                if (suffixPos !== -1) {
                  return {
                    v: {
                      pattern: pattern,
                      length: pattern.length,
                      emptyOpener: true,
                      isClosing: isClosing,
                      nameStart: nameStart,
                      suffixPos: suffixPos + _this4.config.tagSuffix[0].length
                    }
                  };
                }
              }
              return {
                v: {
                  pattern: pattern,
                  length: pattern.length
                }
              };
            }
          },
          _ret;
        for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
          _ret = _loop();
          if (_ret) return _ret.v;
        }

        // If at start of buffer, check for partial matches
      } catch (err) {
        _iterator7.e(err);
      } finally {
        _iterator7.f();
      }
      if (position === 0) {
        var _iterator8 = _createForOfIteratorHelper(patterns),
          _step8;
        try {
          for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
            var pattern = _step8.value;
            // Check if buffer could be start of pattern
            if (pattern.startsWith(buffer)) {
              return {
                partial: true
              };
            }
            // Check if buffer content could be start of pattern
            var bufferContent = buffer.substring(position);
            if (pattern.startsWith(bufferContent)) {
              return {
                partial: true
              };
            }
          }
        } catch (err) {
          _iterator8.e(err);
        } finally {
          _iterator8.f();
        }
      }
      return null;
    }
  }, {
    key: "findFirstSuffix",
    value: function findFirstSuffix(buffer, position) {
      var earliest = {
        pos: -1,
        suffix: null
      };
      var _iterator9 = _createForOfIteratorHelper(this.config.tagSuffix),
        _step9;
      try {
        for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
          var suffix = _step9.value;
          var pos = buffer.indexOf(suffix, position);
          if (pos !== -1 && (earliest.pos === -1 || pos < earliest.pos)) {
            earliest = {
              pos: pos,
              suffix: suffix
            };
          }
        }
      } catch (err) {
        _iterator9.e(err);
      } finally {
        _iterator9.f();
      }
      return earliest.suffix ? earliest : null;
    }
  }, {
    key: "findNextMarkerPosition",
    value: function findNextMarkerPosition(buffer, startPos, patterns) {
      // Find the earliest occurrence of any marker pattern
      var positions = patterns.map(function (pattern) {
        var prefixChar = pattern[0]; // Usually '@'
        var pos = buffer.indexOf(prefixChar, startPos);
        while (pos !== -1) {
          // Verify it's actually a marker
          if (patterns.some(function (p) {
            return buffer.startsWith(p, pos);
          })) {
            return pos;
          }
          pos = buffer.indexOf(prefixChar, pos + 1);
        }
        return -1;
      }).filter(function (pos) {
        return pos !== -1;
      });
      return positions.length ? Math.min.apply(Math, _toConsumableArray(positions)) : -1;
    }
  }]);
}(AbstractIncomingParserSelectorEngine);
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
  var globalConfig = getConfig();
  var symbols = globalConfig.idioSymbols || {
    openTagPrefix: [_IncomingIdioParserSelectorEngine.DEFAULT_START_MARKER],
    tagOpener: [_IncomingIdioParserSelectorEngine.DEFAULT_START_WRAPPER],
    tagSuffix: [_IncomingIdioParserSelectorEngine.DEFAULT_CLOSE_WRAPPER]
  };
  return "".concat(symbols.openTagPrefix[0]).concat(symbols.tagOpener[0]).concat(name).concat(symbols.tagSuffix[0]);
});
_defineProperty(IncomingIdioParserSelectorEngine, "GEN_CLOSE_TAG", function (name) {
  name = name.replace(/^\$/, '@');
  var globalConfig = getConfig();
  var symbols = globalConfig.idioSymbols || {
    closeTagPrefix: [_IncomingIdioParserSelectorEngine.DEFAULT_END_MARKER],
    tagCloser: [_IncomingIdioParserSelectorEngine.DEFAULT_END_WRAPPER],
    tagSuffix: [_IncomingIdioParserSelectorEngine.DEFAULT_CLOSE_WRAPPER]
  };
  return "".concat(symbols.closeTagPrefix[0]).concat(symbols.tagCloser[0]).concat(name).concat(symbols.tagSuffix[0]);
});
_defineProperty(IncomingIdioParserSelectorEngine, "GEN_TYPE_HINT", function (type) {
  var enumValues = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  return "...".concat(type, "...");
});
export { Node };
export default IncomingIdioParserSelectorEngine;