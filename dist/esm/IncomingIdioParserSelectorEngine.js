var _excluded = ["text", "children", "key", "closed"];
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
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
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var s = Object.getOwnPropertySymbols(e); for (r = 0; r < s.length; r++) o = s[r], t.includes(o) || {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (e.includes(n)) continue; t[n] = r[n]; } return t; }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
import { Type, EnumType, StringType, NumberType, BooleanType } from './types.mjs';
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
var IncomingIdioParserSelectorEngine = /*#__PURE__*/function () {
  function IncomingIdioParserSelectorEngine() {
    _classCallCheck(this, IncomingIdioParserSelectorEngine);
    this.buffer = '';
    this.position = 0;
    this.parsedData = [];
    this.openElements = [];
    this.elementIndex = 0;
    this.returnedElementSignatures = new Map();
  }
  return _createClass(IncomingIdioParserSelectorEngine, [{
    key: "add",
    value: function add(chunk) {
      this.buffer += chunk;
      this.parseBuffer();
    }
  }, {
    key: "parseBuffer",
    value: function parseBuffer() {
      while (this.position < this.buffer.length) {
        if (this.buffer.startsWith('⁂START(', this.position)) {
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
        } else if (this.buffer.startsWith('⁂END(', this.position)) {
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
          if (this.buffer[this.position] === '⁂') {
            // Potential partial marker
            var remaining = this.buffer.substring(this.position);
            if (remaining.startsWith('⁂START(') || remaining.startsWith('⁂END(')) {
              // Should have been handled above
              // This case shouldn't occur, but to be safe
              continue;
            } else if (remaining.length < 7) {
              // Possible partial marker, wait for more data
              break;
            } else {
              // Invalid marker, treat '⁂' as text
              this.addTextToCurrentElement('⁂');
              this.position++;
            }
          } else {
            // Collect text content up to the next '⁂'
            var nextMarkerPos = this.buffer.indexOf('⁂', this.position);
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
    key: "formatResults",
    value: function formatResults(results) {
      var _this2 = this;
      var includeOpenTags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      return results.map(function (r) {
        return _this2.formatElement(r, includeOpenTags);
      }).filter(Boolean);
    }
  }, {
    key: "formatElement",
    value: function formatElement(element) {
      var _element$children,
        _this3 = this;
      var includeOpenTags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
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

      // Format children recursively
      var formattedChildren = ((_element$children = element.children) === null || _element$children === void 0 ? void 0 : _element$children.map(function (child) {
        return _this3.formatElement(child, includeOpenTags);
      }).filter(Boolean)) || [];

      // Get all text content including from child nodes
      var allText = this.getTextContent(element);
      var formatted = new Node(element.name, {
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
  }, {
    key: "mapSelect",
    value: function mapSelect(mapping) {
      var _this4 = this;
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
        console.log('map>>>', map instanceof Type, map);

        // Handle Type instances
        if (map instanceof Type) {
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
        var elements = doDedupe ? _this4.dedupeSelect(selector, includeOpenTags) : _this4.select(selector, includeOpenTags);
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
    key: "mapSelect_0",
    value: function mapSelect_0(mapping) {
      var _this5 = this;
      var includeOpenTags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var doDedupe = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      var normalizedMapping = this.normalizeSchemaWithCache(mapping);
      var _applyMapping2 = function applyMapping(element, map) {
        // Handle arrays first
        if (Array.isArray(map)) {
          if (map.length !== 1) {
            throw new Error('A map array must only have one element');
          }
          return Array.isArray(element) ? element.map(function (e) {
            return _applyMapping2(e, map[0]);
          }) : [_applyMapping2(element, map[0])];
        }

        // Handle non-Node values
        if (!(element !== null && element !== void 0 && element.__isNodeObj__) && element != null) {
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
          var value = element === null || element === void 0 ? void 0 : element.$text;

          // Parse the value using the Type's parse method
          value = map.parse(value);

          // Apply validation if defined
          if (map.validate && !map.validate(value)) {
            value = map["default"];
          }

          // Handle default values
          if ((value === undefined || value === '') && map["default"] !== undefined) {
            value = map["default"];
          }

          // Apply transform if defined
          if (map.transform) {
            value = map.transform(value);
          }
          return value;
        }

        // Handle built-in constructors
        if (typeof map === 'function') {
          if (map === Number) {
            var _element$$text3, _element$$text3$trim;
            return parseFloat(((_element$$text3 = element.$text) === null || _element$$text3 === void 0 || (_element$$text3$trim = _element$$text3.trim) === null || _element$$text3$trim === void 0 ? void 0 : _element$$text3$trim.call(_element$$text3)) || '');
          }
          if (map === String) {
            return String(element.$text || '');
          }
          if (map === Boolean) {
            var _element$$text4, _element$$text4$trim;
            var text = ((_element$$text4 = element.$text) === null || _element$$text4 === void 0 || (_element$$text4$trim = _element$$text4.trim) === null || _element$$text4$trim === void 0 ? void 0 : _element$$text4$trim.call(_element$$text4).toLowerCase()) || '';
            var isWordedAsFalse = ['false', 'no', 'null'].includes(text);
            var isEssentiallyFalsey = text === '' || isWordedAsFalse || parseFloat(text) === 0;
            return !isEssentiallyFalsey;
          }
          return map(element);
        }

        // Handle objects (nested schemas)
        if (_typeof(map) === 'object') {
          var out = {};
          var _loop = function _loop() {
            var mapItem = map[key];
            if (key === '_' || key === '$text') {
              var _value6 = _applyMapping2(element === null || element === void 0 ? void 0 : element.$text, mapItem);
              if (_value6 !== undefined) out[key] = _value6;
            } else {
              // For nested elements, we need to look them up in the formatted element
              var childElements = element === null || element === void 0 ? void 0 : element[key];
              if (!childElements) {
                if (mapItem instanceof Type && mapItem["default"] !== undefined) {
                  out[key] = mapItem["default"];
                }
                return 1; // continue
              }

              // Handle array mappings
              if (Array.isArray(mapItem)) {
                // If we have an array of child elements, map each one
                if (Array.isArray(childElements)) {
                  out[key] = childElements.map(function (child) {
                    return _applyMapping2(child, mapItem[0]);
                  });
                }
              } else {
                // For single elements, always take the first one if it's an array
                var childElement = Array.isArray(childElements) ? childElements[0] : childElements;
                // For String/Number/Boolean/Type, we want the $text value
                if (mapItem === String || mapItem === Number || mapItem === Boolean || mapItem instanceof Type) {
                  var _value7 = _applyMapping2(childElement.$text, mapItem);
                  if (_value7 !== undefined) {
                    out[key] = _value7;
                  }
                } else {
                  var _value8 = _applyMapping2(childElement, mapItem);
                  if (_value8 !== undefined) {
                    out[key] = _value8;
                  }
                }
              }
            }
          };
          for (var key in map) {
            if (_loop()) continue;
          }
          return Object.keys(out).length > 0 ? out : undefined;
        }
        throw new Error('Invalid mapping type');
      };
      var isArrayMapping = Array.isArray(normalizedMapping);
      if (isArrayMapping) {
        var rootSelector = Object.keys(normalizedMapping[0])[0];
        return (doDedupe ? this.dedupeSelect(rootSelector, includeOpenTags) : this.select(rootSelector, includeOpenTags)).map(function (element) {
          return _defineProperty({}, rootSelector, _applyMapping2(element, normalizedMapping[0][rootSelector]));
        });
      } else {
        var rootSelectors = Object.keys(normalizedMapping);
        var results = {};
        rootSelectors.forEach(function (selector) {
          var elements = doDedupe ? _this5.dedupeSelect(selector, includeOpenTags) : _this5.select(selector, includeOpenTags);
          if (!(elements !== null && elements !== void 0 && elements.length)) return;

          // Get the first matching element
          var element = elements[0];

          // Apply the mapping to the element
          var mappedResult = _applyMapping2(element, normalizedMapping[selector]);

          // Only set the result if we got a value back
          if (mappedResult !== undefined) {
            results[selector] = mappedResult;
          }
        });
        return results;
      }
    }
  }, {
    key: "normalizeSchemaWithCache",
    value: function normalizeSchemaWithCache(schema) {
      return schema;
      if (!this.normalizedSchemaCache) {
        this.normalizedSchemaCache = new WeakMap();
      }
      if (this.normalizedSchemaCache.has(schema)) {
        return this.normalizedSchemaCache.get(schema);
      }
      var normalized = JSON.parse(JSON.stringify(schema));
      this.normalizedSchemaCache.set(schema, normalized);
      return normalized;
    }
  }]);
}();
_defineProperty(IncomingIdioParserSelectorEngine, "RESERVED_PROPERTIES", new Set(['$tagclosed', '$tagkey', '$children', '$tagname', '__isNodeObj__']));
export { Node };
export default IncomingIdioParserSelectorEngine;