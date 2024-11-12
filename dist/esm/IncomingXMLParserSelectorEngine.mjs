function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
import { Parser } from 'htmlparser2';
import { selectOne, selectAll } from 'css-select';
var Node = /*#__PURE__*/_createClass(function Node(name, o) {
  _classCallCheck(this, Node);
  Object.assign(this, o);
});
var IncomingXMLParserSelectorEngine = /*#__PURE__*/function () {
  function IncomingXMLParserSelectorEngine() {
    var _this = this;
    _classCallCheck(this, IncomingXMLParserSelectorEngine);
    this.buffer = '';
    this.parsedData = [];
    this.openElements = [];
    this.selectors = new Map();
    this.returnedElementSignatures = new Map();
    this.elementIndex = 0;
    this.parser = new Parser({
      onopentag: function onopentag(name, attributes) {
        var element = {
          key: _this.elementIndex++,
          type: 'tag',
          name: name,
          attributes: attributes,
          children: [],
          parent: _this.openElements[_this.openElements.length - 1] || null,
          closed: false,
          textContent: ''
        };
        if (element.parent) {
          element.parent.children.push(element);
        } else {
          _this.parsedData.push(element);
        }
        _this.openElements.push(element);
      },
      ontext: function ontext(text) {
        if (_this.openElements.length > 0) {
          var currentElement = _this.openElements[_this.openElements.length - 1];
          currentElement.children.push({
            type: 'text',
            data: text
          });
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
  }
  return _createClass(IncomingXMLParserSelectorEngine, [{
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
    key: "getElementSignature",
    value: function getElementSignature(element) {
      var forDeduping = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var ancestry = [];
      var current = element;
      while (current.parent) {
        ancestry.unshift("".concat(current.name, "[").concat(current.parent.children.indexOf(current), "]"));
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
  }, {
    key: "getTextContent",
    value: function getTextContent(element) {
      var _this2 = this;
      return (element.children || []).reduce(function (text, child) {
        if (child.type === 'text') {
          return text + child.data;
        } else if (child.type === 'tag') {
          return text + _this2.getTextContent(child);
        }
        return text;
      }, '');
    }
  }, {
    key: "select",
    value: function select(selector) {
      var results = selectAll(selector, this.parsedData).filter(function (el) {
        return el.closed;
      });
      return this.formatResults(results);
    }
  }, {
    key: "dedupeSelect",
    value: function dedupeSelect(selector) {
      var _this3 = this;
      var includeOpenTags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      if (!this.returnedElementSignatures.has(selector)) {
        this.returnedElementSignatures.set(selector, new Map());
      }
      var results = selectAll(selector, this.parsedData).filter(function (el) {
        return includeOpenTags || el.closed;
      });
      var newResults = results.filter(function (result) {
        var dedupeSignature = _this3.getElementSignature(result, true);
        var fullSignature = _this3.getElementSignature(result, false);
        var existingSignature = _this3.returnedElementSignatures.get(selector).get(dedupeSignature);
        if (!existingSignature) {
          _this3.returnedElementSignatures.get(selector).set(dedupeSignature, fullSignature);
          return true;
        }
        if (!result.closed && existingSignature !== fullSignature) {
          _this3.returnedElementSignatures.get(selector).set(dedupeSignature, fullSignature);
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
    key: "formatEle3ment",
    value: function formatEle3ment(element) {
      var _this5 = this;
      var formatted = new Node(element.name, {
        key: element.key,
        attr: _objectSpread({}, element.attributes),
        text: element.textContent
        // name: element.name
      });
      element.children.forEach(function (child) {
        if (child.type === 'tag') {
          if (!formatted[child.name]) {
            formatted[child.name] = [];
          }
          formatted[child.name].push(_this5.formatElement(child));
        }
      });
      return formatted;
    }
  }, {
    key: "formatElement",
    value: function formatElement(element) {
      var _element$children,
        _this6 = this;
      var includeOpenTags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      // If includeOpenTags is true, we will use getTextContent as that is the 
      // only way to get iterative text if 'closed' is false
      // (relevant to streaming)
      var _getTextContent = function getTextContent(el) {
        return (el.children || []).reduce(function (text, child) {
          if (child.type === 'text') {
            return text + child.data;
          } else if (child.type === 'tag') {
            return text + _getTextContent(child);
          }
          return text;
        }, '');
      };
      var formatted = new Node(element.name, {
        key: element.key,
        attr: _objectSpread({}, element.attributes),
        text: includeOpenTags ? element.closed ? element.textContent : this.getTextContent(element) : element.textContent
      });
      if ((_element$children = element.children) !== null && _element$children !== void 0 && _element$children.length) {
        element.children.forEach(function (child) {
          if (child.type === 'tag') {
            if (!formatted[child.name]) {
              formatted[child.name] = [];
            }
            if (!Array.isArray(formatted[child.name])) {
              formatted[child.name] = [formatted[child.name]];
            }
            formatted[child.name].push(_this6.formatElement(child));
          }
        });
      }
      return formatted;
    }
  }, {
    key: "mapSelectClosed",
    value: function mapSelectClosed(mapping) {
      return this.mapSelect(mapping, false);
    }
  }, {
    key: "mapSelect",
    value: function mapSelect(mapping) {
      var _this7 = this;
      var includeOpenTags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      // Helper to normalize the new [] syntax to old syntax
      var _normalizeSchema = function normalizeSchema(schema) {
        // Handle primitives and functions
        if (_typeof(schema) !== 'object' || schema === null) return schema;
        if (typeof schema === 'function') return schema;
        if (Array.isArray(schema)) return schema.map(_normalizeSchema);
        var result = {};
        for (var _i = 0, _Object$entries = Object.entries(schema); _i < _Object$entries.length; _i++) {
          var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
            key = _Object$entries$_i[0],
            value = _Object$entries$_i[1];
          if (key.endsWith('[]')) {
            var actualKey = key.slice(0, -2);
            result[actualKey] = [_normalizeSchema(value)];
          } else {
            result[key] = _normalizeSchema(value);
          }
        }
        return result;
      };
      var normalizedMapping = Array.isArray(mapping) ? mapping.map(function (m) {
        return _normalizeSchema(m);
      }) : _normalizeSchema(mapping);
      var _applyMapping = function applyMapping(element, map) {
        if (Array.isArray(map)) {
          if (map.length !== 1) {
            throw new Error('A map array must only have one element');
          }
          return Array.isArray(element) ? element.map(function (e) {
            return _applyMapping(e, map[0]);
          }) : [_applyMapping(element, map[0])];
        }
        if (typeof map === 'function') {
          return map(element.text);
        }
        if (_typeof(map) !== 'object') {
          throw new Error('Map must be an object, function, or array');
        }
        var out = {};
        for (var k in map) {
          if (k.startsWith('$')) {
            // Handle attributes
            var attrName = k.slice(1);
            if (element.attr && element.attr[attrName] !== undefined) {
              out[k] = map[k](element.attr[attrName]);
            }
          } else if (k === '_') {
            // Handle text content
            out[k] = map[k](element.text);
          } else if (!element[k]) {
            out[k] = Array.isArray(map[k]) ? [] : undefined;
          } else if (Array.isArray(map[k])) {
            out[k] = _applyMapping(element[k], map[k]);
          } else {
            out[k] = _applyMapping(Array.isArray(element[k]) ? element[k][0] : element[k], map[k]);
          }
        }
        return out;
      };
      var isArrayMapping = Array.isArray(normalizedMapping);
      if (isArrayMapping) {
        var rootSelector = Object.keys(normalizedMapping[0])[0];
        return this.dedupeSelect(rootSelector, includeOpenTags).map(function (element) {
          return _defineProperty({}, rootSelector, _applyMapping(element, normalizedMapping[0][rootSelector]));
        });
      }
      var rootSelectors = Object.keys(normalizedMapping);
      var results = {};
      rootSelectors.forEach(function (selector) {
        var elements = _this7.dedupeSelect(selector, includeOpenTags);
        if (!(elements !== null && elements !== void 0 && elements.length)) return;
        if (Array.isArray(normalizedMapping[selector])) {
          elements.forEach(function (el) {
            results[selector] = (results[selector] || []).concat(_applyMapping(el, normalizedMapping[selector]));
          });
        } else {
          results[selector] = _applyMapping(elements[0], normalizedMapping[selector]);
        }
      });
      return results;
    }
  }], [{
    key: "makeMapSelectXMLScaffold",
    value: function makeMapSelectXMLScaffold(schema) {
      var indent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;
      function processObject(obj) {
        var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        var xml = '';
        var indentation = ' '.repeat(level * indent);
        for (var key in obj) {
          var value = obj[key];
          if (key === '_') continue;
          if (key.startsWith('$')) continue;
          var attrs = getAttributes(obj[key]);
          if (typeof value === 'function' || typeof value === 'string' || value === String || value === Number || value === Boolean) {
            xml += "".concat(indentation, "<").concat(key).concat(attrs, ">...text content...</").concat(key, ">\n");
          } else if (Array.isArray(value)) {
            var item = value[0];
            if (typeof item === 'function' || typeof item === 'string' || item === String || item === Number || item === Boolean) {
              xml += "".concat(indentation, "<").concat(key, ">...text content...</").concat(key, ">\n");
              xml += "".concat(indentation, "<").concat(key, ">...text content...</").concat(key, ">\n");
              xml += "".concat(indentation, "/*etc.*/\n");
            } else {
              xml += "".concat(indentation, "<").concat(key).concat(getAttributes(item), ">\n");
              xml += processObject(item, level + 1);
              if ('_' in item) {
                xml += "".concat(indentation, "  ...text content...\n");
              }
              xml += "".concat(indentation, "</").concat(key, ">\n");
              xml += "".concat(indentation, "<").concat(key).concat(getAttributes(item), ">\n");
              xml += processObject(item, level + 1);
              if ('_' in item) {
                xml += "".concat(indentation, "  ...text content...\n");
              }
              xml += "".concat(indentation, "</").concat(key, ">\n");
              xml += "".concat(indentation, "/*etc.*/\n");
            }
          } else if (_typeof(value) === 'object') {
            xml += "".concat(indentation, "<").concat(key).concat(attrs, ">\n");
            if ('_' in value) {
              xml += "".concat(indentation, "  ...text content...\n");
            }
            xml += processObject(value, level + 1);
            xml += "".concat(indentation, "</").concat(key, ">\n");
          }
        }
        return xml;
      }
      function getAttributes(obj) {
        if (_typeof(obj) !== 'object' || obj === null) return '';
        var attrs = '';
        for (var key in obj) {
          if (key.startsWith('$')) {
            attrs += " ".concat(key.slice(1), "=\"...\"");
          }
        }
        return attrs;
      }
      return processObject(schema);
    }
  }]);
}();
export default IncomingXMLParserSelectorEngine;