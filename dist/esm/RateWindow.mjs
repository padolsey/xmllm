function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var RateWindow = /*#__PURE__*/function () {
  function RateWindow(period, limit) {
    var timeProvider = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Date;
    _classCallCheck(this, RateWindow);
    this.period = period;
    this.limit = limit;
    this.timeProvider = timeProvider;
    this.requests = [];
    this.windows = {
      minute: 60 * 1000,
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000
    };
  }
  return _createClass(RateWindow, [{
    key: "canMakeRequest",
    value: function canMakeRequest() {
      this.pruneOldRequests();
      return this.requests.length < this.limit;
    }
  }, {
    key: "recordRequest",
    value: function recordRequest() {
      this.requests.push(this.timeProvider.now());
    }
  }, {
    key: "pruneOldRequests",
    value: function pruneOldRequests() {
      var windowSize = this.windows[this.period];
      var cutoff = this.timeProvider.now() - windowSize;
      this.requests = this.requests.filter(function (time) {
        return time > cutoff;
      });
    }
  }, {
    key: "getStats",
    value: function getStats() {
      this.pruneOldRequests();
      return {
        limit: this.limit,
        current: this.requests.length,
        remaining: this.limit - this.requests.length
      };
    }
  }]);
}();
export { RateWindow as default };