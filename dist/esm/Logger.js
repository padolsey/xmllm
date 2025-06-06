function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { LOG_LEVELS } from './LogLevels.mjs';
import { getConfig } from './config.mjs';
export var Logger = /*#__PURE__*/function () {
  function Logger(name) {
    _classCallCheck(this, Logger);
    this.name = name;
  }
  return _createClass(Logger, [{
    key: "shouldLog",
    value: function shouldLog(level) {
      var config = getConfig();
      return LOG_LEVELS[level] <= LOG_LEVELS[config.logging.level];
    }
  }, {
    key: "error",
    value: function error() {
      var config = getConfig();
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      if (config.logging.customLogger) {
        var _config$logging;
        (_config$logging = config.logging).customLogger.apply(_config$logging, ['error', this.name].concat(args));
      } else {
        var _console;
        (_console = console).error.apply(_console, [this.name, "==>"].concat(args));
      }
    }
  }, {
    key: "warn",
    value: function warn() {
      if (!this.shouldLog('WARN')) return;
      var config = getConfig();
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      if (config.logging.customLogger) {
        var _config$logging2;
        (_config$logging2 = config.logging).customLogger.apply(_config$logging2, ['warn', this.name].concat(args));
      } else {
        var _console2;
        (_console2 = console).warn.apply(_console2, [this.name, "==>"].concat(args));
      }
    }
  }, {
    key: "info",
    value: function info() {
      if (!this.shouldLog('INFO')) return;
      var config = getConfig();
      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }
      if (config.logging.customLogger) {
        var _config$logging3;
        (_config$logging3 = config.logging).customLogger.apply(_config$logging3, ['info', this.name].concat(args));
      } else {
        var _console3;
        (_console3 = console).log.apply(_console3, [this.name, "==>"].concat(args));
      }
    }
  }, {
    key: "debug",
    value: function debug() {
      if (!this.shouldLog('DEBUG')) return;
      var config = getConfig();
      for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }
      if (config.logging.customLogger) {
        var _config$logging4;
        (_config$logging4 = config.logging).customLogger.apply(_config$logging4, ['debug', this.name].concat(args));
      } else {
        var _console4;
        (_console4 = console).log.apply(_console4, [this.name, "==>"].concat(args));
      }
    }
  }, {
    key: "log",
    value: function log() {
      this.info.apply(this, arguments);
    }
  }, {
    key: "dev",
    value: function dev() {
      this.debug.apply(this, arguments);
    }
  }]);
}();
export default Logger;