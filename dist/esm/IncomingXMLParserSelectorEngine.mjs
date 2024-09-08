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
      element.textContent = element.children.reduce(function (text, child) {
        if (child.type === 'text') {
          return text + child.data;
        } else if (child.type === 'tag') {
          var childText = child.textContent || '';
          return text + (childText ? childText : ' ');
        }
        return text;
      }, '');
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
      var ancestry = [];
      var current = element;
      while (current.parent) {
        ancestry.unshift("".concat(current.name, "[").concat(current.parent.children.indexOf(current), "]"));
        current = current.parent;
      }
      var signature = {
        ancestry: ancestry.join('/'),
        name: element.name,
        attributes: element.attributes,
        textContent: element.textContent || '',
        hasChildren: element.children.some(function (child) {
          return child.type === 'tag';
        }),
        closed: element.closed
      };
      return JSON.stringify(signature);
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
      var _this2 = this;
      if (!this.returnedElementSignatures.has(selector)) {
        this.returnedElementSignatures.set(selector, new Set());
      }
      var results = selectAll(selector, this.parsedData).filter(function (el) {
        return el.closed;
      });
      var newResults = results.filter(function (result) {
        var signature = _this2.getElementSignature(result);
        if (_this2.returnedElementSignatures.get(selector).has(signature)) {
          return false;
        }
        _this2.returnedElementSignatures.get(selector).add(signature);
        return true;
      });
      return this.formatResults(newResults);
    }
  }, {
    key: "formatResults",
    value: function formatResults(results) {
      return results.map(this.formatElement.bind(this));
    }
  }, {
    key: "formatElement",
    value: function formatElement(element) {
      var _this3 = this;
      var formatted = new Node(element.name, {
        key: element.key,
        attr: _objectSpread({}, element.attributes),
        text: element.textContent
        // name: element.name
      });
      element.children.forEach(function (child) {
        if (child.type === 'tag') {
          // console.log('formatted[child.name]', formatted[child.name]);
          if (!formatted[child.name]) {
            formatted[child.name] = [];
          }
          // if (typeof formatted[child.name] == 'string') {
          //   formatted[child.name] = [formatted[child.name]];
          // }
          formatted[child.name].push(_this3.formatElement(child));
        }
      });
      return formatted;
    }
  }, {
    key: "mapSelect",
    value: function mapSelect(mapping) {
      var _this4 = this;
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
      var isArrayMapping = Array.isArray(mapping);
      if (isArrayMapping) {
        var rootSelector = Object.keys(mapping[0])[0];
        return this.dedupeSelect(rootSelector).map(function (element) {
          return _defineProperty({}, rootSelector, _applyMapping(element, mapping[0][rootSelector]));
        });
      }
      var rootSelectors = Object.keys(mapping);
      var results = {};
      rootSelectors.forEach(function (selector) {
        var elements = _this4.dedupeSelect(selector);
        if (!(elements !== null && elements !== void 0 && elements.length)) {
          return;
        }
        if (Array.isArray(mapping[selector])) {
          elements.forEach(function (el) {
            results[selector] = (results[selector] || []).concat(_applyMapping(el, mapping[selector]));
          });
        } else {
          results[selector] = _applyMapping(elements[0], mapping[selector]);
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