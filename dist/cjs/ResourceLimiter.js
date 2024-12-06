"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * @typedef {Object} LimitConfig
 * @property {number} limit - Maximum value allowed
 * @property {number} window - Time window in milliseconds
 */
/**
 * @typedef {Object} LimitStatus
 * @property {boolean} allowed - Whether action is allowed
 * @property {number} remaining - Resources remaining
 * @property {number} limit - Maximum limit
 * @property {number} resetInMs - Milliseconds until reset
 */
/**
 * Manages multiple types of resource limits with customizable time windows
 */
var ResourceLimiter = /*#__PURE__*/function () {
  function ResourceLimiter() {
    var limits = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    _classCallCheck(this, ResourceLimiter);
    this.buckets = new Map();
    this.setLimits(limits);
  }

  /**
   * Set or update limits
   * @param {Object.<string, LimitConfig|null>} limits - Map of limit names to configs
   */
  return _createClass(ResourceLimiter, [{
    key: "setLimits",
    value: function setLimits(limits) {
      for (var _i = 0, _Object$entries = Object.entries(limits); _i < _Object$entries.length; _i++) {
        var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
          name = _Object$entries$_i[0],
          config = _Object$entries$_i[1];
        if (config === null || config.limit === null || config.limit === Infinity) {
          this.buckets["delete"](name);
          continue;
        }
        if (config.limit < 0 || config.window <= 0) {
          throw new Error("Invalid limit config for ".concat(name, ": limit must be >= 0 and window must be > 0"));
        }
        this.buckets.set(name, {
          name: name,
          limit: config.limit,
          window: config.window,
          remaining: config.limit,
          resetTime: Date.now() + config.window
        });
      }
    }

    /**
     * Check if consuming resources would exceed any limits
     * @param {Object} amounts - Resources to consume
     * @returns {Object} Status of all limits
     */
  }, {
    key: "checkLimits",
    value: function checkLimits() {
      var amounts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var now = Date.now();
      var status = {
        allowed: true,
        limits: {}
      };
      var _iterator = _createForOfIteratorHelper(this.buckets),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var _step$value = _slicedToArray(_step.value, 2),
            name = _step$value[0],
            bucket = _step$value[1];
          // Reset if window expired
          if (now >= bucket.resetTime) {
            bucket.remaining = bucket.limit;
            bucket.resetTime = now + bucket.window;
          }
          var amount = amounts[name] || 0;
          var wouldExceed = bucket.remaining < amount;
          status.limits[name] = {
            allowed: !wouldExceed,
            remaining: bucket.remaining,
            limit: bucket.limit,
            resetInMs: Math.max(0, bucket.resetTime - now)
          };
          if (wouldExceed) {
            status.allowed = false;
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return status;
    }

    /**
     * Attempt to consume resources
     * @param {Object} amounts - Resources to consume
     * @returns {Object} Success status and limit details
     */
  }, {
    key: "consume",
    value: function consume() {
      var amounts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var status = this.checkLimits(amounts);
      if (!status.allowed) {
        return status;
      }

      // Actually consume the resources
      var _iterator2 = _createForOfIteratorHelper(this.buckets),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var _step2$value = _slicedToArray(_step2.value, 2),
            name = _step2$value[0],
            bucket = _step2$value[1];
          if (name in amounts) {
            bucket.remaining -= amounts[name] || 0;
          }
        }

        // Return post-consumption state
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      return {
        allowed: true,
        limits: Object.fromEntries(Array.from(this.buckets).map(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2),
            name = _ref2[0],
            bucket = _ref2[1];
          return [name, {
            allowed: true,
            remaining: bucket.remaining,
            limit: bucket.limit,
            resetInMs: Math.max(0, bucket.resetTime - Date.now())
          }];
        }))
      };
    }

    /**
     * Clear all limits and free memory
     */
  }, {
    key: "reset",
    value: function reset() {
      this.buckets.clear();
    }
  }]);
}();
var _default = exports["default"] = ResourceLimiter;