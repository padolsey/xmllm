function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * Wraps a parser instance to provide buffering capabilities.
 * This helps reduce CPU overhead by batching small chunks before parsing.
 */
var BufferedParserWrapper = /*#__PURE__*/function () {
  function BufferedParserWrapper(parser) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    _classCallCheck(this, BufferedParserWrapper);
    this.parser = parser;

    // Handle buffer config
    if (options.buffer === false) {
      this.timeout = 0;
      this.maxSize = 0;
    } else {
      var _bufferConfig$timeout, _bufferConfig$maxSize;
      var bufferConfig = options.buffer === true ? {} : options.buffer || {};
      // Enforce minimum timeout to prevent race conditions
      this.timeout = Math.max((_bufferConfig$timeout = bufferConfig.timeout) !== null && _bufferConfig$timeout !== void 0 ? _bufferConfig$timeout : 10, 1); // Minimum 1ms timeout

      // Enforce reasonable maxSize 
      this.maxSize = Math.min(Math.max((_bufferConfig$maxSize = bufferConfig.maxSize) !== null && _bufferConfig$maxSize !== void 0 ? _bufferConfig$maxSize : 1024, 10),
      // Minimum 10 bytes
      1024 * 1024 // Maximum 1MB
      );
    }
    this.buffer = '';
    this.timeoutHandle = null;
  }
  return _createClass(BufferedParserWrapper, [{
    key: "add",
    value: function add(chunk) {
      var _this = this;
      // Guard against null/undefined
      if (chunk == null) return false;

      // Convert to string and check if empty
      var str = String(chunk);
      if (!str) return false;
      try {
        this.buffer += str;
        if (this.buffer.length >= this.maxSize) {
          var flushed = this.flush();
          return flushed; // Return the flushed content
        } else {
          if (this.timeoutHandle) {
            clearTimeout(this.timeoutHandle);
          }
          this.timeoutHandle = setTimeout(function () {
            return _this.flush();
          }, this.timeout);
          return false; // Indicate we buffered
        }
      } catch (err) {
        // Clear buffer on error
        this.buffer = '';
        throw err;
      }
    }
  }, {
    key: "flush",
    value: function flush() {
      if (this.buffer) {
        try {
          this.parser.add(this.buffer);
          var flushed = this.buffer;
          this.buffer = '';
          return flushed;
        } catch (err) {
          this.buffer = '';
          throw err;
        }
      }
      if (this.timeoutHandle) {
        clearTimeout(this.timeoutHandle);
        this.timeoutHandle = null;
      }
      return false; // Nothing to flush
    }
  }, {
    key: "makeMapSelectScaffold",
    value: function makeMapSelectScaffold(schema, hints) {
      return this.parser.makeMapSelectScaffold(schema, hints);
    }

    // Proxy all parser methods
  }, {
    key: "select",
    value: function select() {
      var _this$parser;
      return (_this$parser = this.parser).select.apply(_this$parser, arguments);
    }
  }, {
    key: "dedupeSelect",
    value: function dedupeSelect() {
      var _this$parser2;
      return (_this$parser2 = this.parser).dedupeSelect.apply(_this$parser2, arguments);
    }
  }, {
    key: "mapSelect",
    value: function mapSelect() {
      var _this$parser3;
      return (_this$parser3 = this.parser).mapSelect.apply(_this$parser3, arguments);
    }
  }, {
    key: "mapSelectClosed",
    value: function mapSelectClosed() {
      var _this$parser4;
      return (_this$parser4 = this.parser).mapSelectClosed.apply(_this$parser4, arguments);
    }
  }, {
    key: "formatElement",
    value: function formatElement() {
      var _this$parser5;
      return (_this$parser5 = this.parser).formatElement.apply(_this$parser5, arguments);
    }
  }, {
    key: "formatResults",
    value: function formatResults() {
      var _this$parser6;
      return (_this$parser6 = this.parser).formatResults.apply(_this$parser6, arguments);
    }
  }, {
    key: "getTextContent",
    value: function getTextContent() {
      var _this$parser7;
      return (_this$parser7 = this.parser).getTextContent.apply(_this$parser7, arguments);
    }
  }]);
}();
BufferedParserWrapper.makeMapSelectScaffold = function (schema, hints) {
  return this.parser.makeMapSelectScaffold(schema, hints);
};
export default BufferedParserWrapper;