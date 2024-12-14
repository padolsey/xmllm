"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _Logger = _interopRequireDefault(require("./Logger.js"));
var _ProviderErrors = require("./errors/ProviderErrors.js");
var _eventsourceParser = require("eventsource-parser");
var _innerTruncate = _interopRequireDefault(require("./innerTruncate.js"));
var _ValidationService = _interopRequireDefault(require("./ValidationService.js"));
var _ResourceLimiter = _interopRequireDefault(require("./ResourceLimiter.js"));
var _estimateTokens = require("./utils/estimateTokens.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
// Use native AbortController if available (modern environments), otherwise try to import
var AbortController = globalThis.AbortController || (typeof window !== 'undefined' ? window.AbortController : null);
if (!AbortController) {
  throw new Error('AbortController is not available in this environment. Please use a newer version of Node.js or install the abort-controller package.');
}
var logger = new _Logger["default"]('Provider');
var DEFAULT_ASSUMED_MAX_CONTEXT_SIZE = 8000; // input token size
var DEFAULT_RESPONSE_TOKEN_LENGTH = 300; // max_tokens
var MAX_TOKEN_HISTORICAL_MESSAGE = 600;

/**
 * Handles direct communication with LLM APIs.
 * 
 * Responsibilities:
 * - Makes HTTP requests to LLM endpoints
 * - Handles rate limiting and quotas
 * - Manages retries and circuit breaking
 * - Transforms payloads for specific providers
 * - Streams responses back to ProviderManager
 * 
 * Each Provider instance represents a specific LLM service (OpenAI, Claude, etc)
 * with its own configuration and constraints.
 * 
 * @example
 * const provider = new Provider('claude', {
 *   endpoint: 'https://api.anthropic.com/v1/messages',
 *   key: process.env.ANTHROPIC_API_KEY,
 *   models: { fast: { name: 'claude-3-haiku' } }
 * });
 */
var Provider = /*#__PURE__*/function () {
  function Provider(name, details) {
    var _details$constraints, _details$constraints2, _details$constraints3;
    var configOverrides = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    _classCallCheck(this, Provider);
    this.name = name;
    this.endpoint = details.endpoint;
    this.key = details.key;
    this.models = details.models || {};
    this.payloader = details.payloader || this.defaultPayloader;
    this.headerGen = details.headerGen || this.defaultHeaderGen;

    // Initialize resource limiter with provider constraints
    this.resourceLimiter = new _ResourceLimiter["default"]({
      rpm: (_details$constraints = details.constraints) !== null && _details$constraints !== void 0 && _details$constraints.rpmLimit ? {
        limit: details.constraints.rpmLimit,
        window: 60000 // 1 minute
      } : {
        limit: Infinity,
        window: 60000
      },
      // Default to unlimited
      tpm: (_details$constraints2 = details.constraints) !== null && _details$constraints2 !== void 0 && _details$constraints2.tokensPerMinute ? {
        limit: details.constraints.tokensPerMinute,
        window: 60000
      } : null,
      rph: (_details$constraints3 = details.constraints) !== null && _details$constraints3 !== void 0 && _details$constraints3.requestsPerHour ? {
        limit: details.constraints.requestsPerHour,
        window: 3600000 // 1 hour
      } : null
    });

    // Configurable properties
    this.REQUEST_TIMEOUT_MS = process.env.NODE_ENV === 'test' ? 1000 // 1 second for tests
    : configOverrides.REQUEST_TIMEOUT_MS || 50000;
    this.MAX_RETRIES = configOverrides.MAX_RETRIES || 2;
    this.RETRY_DELAY_WHEN_OVERLOADED = configOverrides.RETRY_DELAY_WHEN_OVERLOADED || 1000;

    // Circuit breaker properties
    this.errorCount = 0;
    this.lastErrorTime = null;
    this.circuitBreakerThreshold = configOverrides.circuitBreakerThreshold || 5;
    this.circuitBreakerResetTime = configOverrides.circuitBreakerResetTime || 60000;
  }
  return _createClass(Provider, [{
    key: "constraints",
    get: function get() {
      // backward compatibility
      var limits = {};
      var _iterator = _createForOfIteratorHelper(this.resourceLimiter.buckets),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var _step$value = _slicedToArray(_step.value, 2),
            name = _step$value[0],
            bucket = _step$value[1];
          var constraintName = {
            rpm: 'rpmLimit',
            tpm: 'tokensPerMinute',
            rph: 'requestsPerHour'
          }[name] || name;
          limits[constraintName] = bucket.limit;
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return limits;
    }
  }, {
    key: "fetch",
    get: function get() {
      return Provider._globalFetch;
    }
  }, {
    key: "defaultPayloader",
    value: function defaultPayloader(payload) {
      return payload;
    }
  }, {
    key: "defaultHeaderGen",
    value: function defaultHeaderGen() {
      return this.getHeaders();
    }
  }, {
    key: "makeRequest",
    value: function () {
      var _makeRequest = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee(payload) {
        var _payload$constraints;
        var limitCheck, retries, maxRetries, lastError, result, delay;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              logger.log('Starting makeRequest');

              // Apply any request-specific constraints
              if ((_payload$constraints = payload.constraints) !== null && _payload$constraints !== void 0 && _payload$constraints.rpmLimit) {
                logger.log('Applying request-specific RPM limit:', payload.constraints.rpmLimit);
                this.resourceLimiter.setLimits({
                  rpm: {
                    limit: payload.constraints.rpmLimit,
                    window: 60000
                  }
                });
              }
              if (!this.isCircuitBroken()) {
                _context.next = 4;
                break;
              }
              throw new _ProviderErrors.ProviderError("Circuit breaker is open for provider ".concat(this.name), 'CIRCUIT_BREAKER_OPEN', this.name);
            case 4:
              // Check resource limits
              limitCheck = this.resourceLimiter.consume(_objectSpread({
                rpm: 1
              }, payload.messages ? {
                tpm: (0, _estimateTokens.estimateTokens)(payload.messages.join(''))
              } : {}));
              logger.log('Resource limit check result:', limitCheck);
              if (limitCheck.allowed) {
                _context.next = 9;
                break;
              }
              logger.log('Resource limit exceeded, throwing error');
              throw new _ProviderErrors.ProviderRateLimitError(this.name, limitCheck.limits.rpm.resetInMs, Object.entries(limitCheck.limits).filter(function (_ref) {
                var _ref2 = _slicedToArray(_ref, 2),
                  _ = _ref2[0],
                  status = _ref2[1];
                return !status.allowed;
              }).map(function (_ref3) {
                var _ref4 = _slicedToArray(_ref3, 2),
                  name = _ref4[0],
                  status = _ref4[1];
                return {
                  type: name,
                  resetInMs: status.resetInMs
                };
              }));
            case 9:
              retries = 0;
              maxRetries = this.MAX_RETRIES;
              lastError = null;
            case 12:
              if (!(retries <= maxRetries)) {
                _context.next = 33;
                break;
              }
              _context.prev = 13;
              _context.next = 16;
              return this.attemptRequest(payload);
            case 16:
              result = _context.sent;
              this.resetCircuitBreaker(); // Success, reset error count
              return _context.abrupt("return", result);
            case 21:
              _context.prev = 21;
              _context.t0 = _context["catch"](13);
              lastError = _context.t0;
              if (this.shouldRetry(_context.t0)) {
                _context.next = 27;
                break;
              }
              this.incrementCircuitBreaker(_context.t0);
              throw _context.t0;
            case 27:
              delay = this.calculateBackoff(retries);
              _context.next = 30;
              return this.delay(delay);
            case 30:
              retries++;
            case 31:
              _context.next = 12;
              break;
            case 33:
              throw lastError;
            case 34:
            case "end":
              return _context.stop();
          }
        }, _callee, this, [[13, 21]]);
      }));
      function makeRequest(_x) {
        return _makeRequest.apply(this, arguments);
      }
      return makeRequest;
    }()
  }, {
    key: "attemptRequest",
    value: function () {
      var _attemptRequest = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2(payload) {
        var preparedPayload, controller, timeoutId, _data$content, _data$content2, _data$choices, response, data;
        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              preparedPayload = this.preparePayload(payload);
              controller = new AbortController();
              timeoutId = setTimeout(function () {
                return controller.abort();
              }, this.REQUEST_TIMEOUT_MS);
              _context2.prev = 3;
              _context2.next = 6;
              return this.fetch(this.endpoint, {
                method: 'POST',
                headers: this.headerGen ? this.headerGen.call(this) : this.getHeaders(),
                body: JSON.stringify(preparedPayload),
                signal: controller.signal
              });
            case 6:
              response = _context2.sent;
              clearTimeout(timeoutId);
              if (response !== null && response !== void 0 && response.ok) {
                _context2.next = 12;
                break;
              }
              _context2.next = 11;
              return this.handleErrorResponse(response);
            case 11:
              throw _context2.sent;
            case 12:
              _context2.next = 14;
              return response.json();
            case 14:
              data = _context2.sent;
              return _context2.abrupt("return", data !== null && data !== void 0 && (_data$content = data.content) !== null && _data$content !== void 0 && (_data$content = _data$content[0]) !== null && _data$content !== void 0 && _data$content.text ? {
                content: data === null || data === void 0 || (_data$content2 = data.content) === null || _data$content2 === void 0 || (_data$content2 = _data$content2[0]) === null || _data$content2 === void 0 ? void 0 : _data$content2.text
              } : data === null || data === void 0 || (_data$choices = data.choices) === null || _data$choices === void 0 || (_data$choices = _data$choices[0]) === null || _data$choices === void 0 ? void 0 : _data$choices.message);
            case 18:
              _context2.prev = 18;
              _context2.t0 = _context2["catch"](3);
              if (!(_context2.t0.name === 'AbortError')) {
                _context2.next = 22;
                break;
              }
              throw new _ProviderErrors.ProviderTimeoutError(this.name, this.REQUEST_TIMEOUT_MS);
            case 22:
              throw _context2.t0;
            case 23:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this, [[3, 18]]);
      }));
      function attemptRequest(_x2) {
        return _attemptRequest.apply(this, arguments);
      }
      return attemptRequest;
    }()
  }, {
    key: "handleErrorResponse",
    value: function () {
      var _handleErrorResponse = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3(response) {
        var _response$headers;
        var errorBody, retryAfter;
        return _regeneratorRuntime().wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              logger.log('Handling error response:', {
                status: response === null || response === void 0 ? void 0 : response.status,
                headers: response !== null && response !== void 0 && (_response$headers = response.headers) !== null && _response$headers !== void 0 && _response$headers.get ? {
                  'Retry-After': response.headers.get('Retry-After')
                } : null
              });
              if (response) {
                _context3.next = 3;
                break;
              }
              throw new _ProviderErrors.ProviderNetworkError(this.name, undefined, 'No response received');
            case 3:
              _context3.next = 5;
              return response.text();
            case 5:
              errorBody = _context3.sent;
              logger.log('Error body:', errorBody);
              _context3.t0 = response.status;
              _context3.next = _context3.t0 === 401 ? 10 : _context3.t0 === 403 ? 10 : _context3.t0 === 429 ? 11 : _context3.t0 === 408 ? 15 : _context3.t0 === 504 ? 15 : 16;
              break;
            case 10:
              throw new _ProviderErrors.ProviderAuthenticationError(this.name, errorBody);
            case 11:
              logger.log('Detected 429 rate limit response');
              retryAfter = response.headers.get('Retry-After');
              logger.log('Retry-After header:', retryAfter);
              throw new _ProviderErrors.ProviderRateLimitError(this.name, parseInt(retryAfter) * 1000, [{
                type: 'rpm',
                resetInMs: parseInt(retryAfter) * 1000
              }]);
            case 15:
              throw new _ProviderErrors.ProviderTimeoutError(this.name, this.REQUEST_TIMEOUT_MS);
            case 16:
              throw new _ProviderErrors.ProviderNetworkError(this.name, response.status, errorBody);
            case 17:
            case "end":
              return _context3.stop();
          }
        }, _callee3, this);
      }));
      function handleErrorResponse(_x3) {
        return _handleErrorResponse.apply(this, arguments);
      }
      return handleErrorResponse;
    }()
  }, {
    key: "calculateBackoff",
    value: function calculateBackoff(retryCount) {
      if (process.env.NODE_ENV === 'test') {
        // Much shorter delays for tests
        var _baseDelay = 100; // 100ms instead of 1000ms
        var _maxDelay = 500; // 500ms instead of 32000ms
        var _exponential = Math.min(_maxDelay, _baseDelay * Math.pow(2, retryCount));
        var _jitter = Math.random() * 0.1 * _exponential;
        return _exponential + _jitter;
      }

      // Original delays for production
      var baseDelay = 1000;
      var maxDelay = 32000;
      var exponential = Math.min(maxDelay, baseDelay * Math.pow(2, retryCount));
      var jitter = Math.random() * 0.1 * exponential;
      return exponential + jitter;
    }
  }, {
    key: "isCircuitBroken",
    value: function isCircuitBroken() {
      if (this.errorCount >= this.circuitBreakerThreshold) {
        var timeSinceLastError = Date.now() - this.lastErrorTime;
        if (timeSinceLastError < this.circuitBreakerResetTime) {
          return true;
        }
        this.resetCircuitBreaker();
      }
      return false;
    }
  }, {
    key: "incrementCircuitBreaker",
    value: function incrementCircuitBreaker(error) {
      this.errorCount++;
      this.lastErrorTime = Date.now();
      logger.error("Provider ".concat(this.name, " error count: ").concat(this.errorCount), error);
    }
  }, {
    key: "resetCircuitBreaker",
    value: function resetCircuitBreaker() {
      this.errorCount = 0;
      this.lastErrorTime = null;
    }
  }, {
    key: "createReadableStream",
    value: function createReadableStream(response) {
      if (!(response !== null && response !== void 0 && response.body)) {
        logger.error('Response body is null', response);
        throw new Error("No response body from ".concat(this.name));
      }
      var encoder = new TextEncoder();
      var closed = false;
      var data = '';
      var counter = 0;
      var reader = null;
      return new ReadableStream({
        start: function start(controller) {
          return _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee4() {
            var onParse, parser, firstChunk, decoded, _json$choices5, _json$choices6, json, text, _yield$reader$read, done, value, _decoded;
            return _regeneratorRuntime().wrap(function _callee4$(_context4) {
              while (1) switch (_context4.prev = _context4.next) {
                case 0:
                  onParse = function _onParse(event) {
                    if (closed) return;
                    if (event.type === 'event') {
                      var eventData = event.data;
                      if (eventData === '[DONE]') {
                        logger.log('[done] Closing readable stream');
                        data += '\n';
                        controller.enqueue(encoder.encode('\n'));
                        controller.close();
                        closed = true;
                        return;
                      }
                      try {
                        var _json$choices, _json$choices2, _json$delta, _json$content_block, _json$choices3, _json$choices4, _json$delta2;
                        var json = JSON.parse(eventData);

                        // Handle non-streaming response (complete JSON response)
                        if ((_json$choices = json.choices) !== null && _json$choices !== void 0 && (_json$choices = _json$choices[0]) !== null && _json$choices !== void 0 && _json$choices.text && !((_json$choices2 = json.choices) !== null && _json$choices2 !== void 0 && (_json$choices2 = _json$choices2[0]) !== null && _json$choices2 !== void 0 && _json$choices2.delta)) {
                          var _text = json.choices[0].text;
                          controller.enqueue(encoder.encode(_text));
                          controller.close();
                          closed = true;
                          return;
                        }

                        // Handle streaming response formats
                        var text = (json === null || json === void 0 || (_json$delta = json.delta) === null || _json$delta === void 0 ? void 0 : _json$delta.text) || (json === null || json === void 0 || (_json$content_block = json.content_block) === null || _json$content_block === void 0 ? void 0 : _json$content_block.text) || ((_json$choices3 = json.choices) === null || _json$choices3 === void 0 || (_json$choices3 = _json$choices3[0]) === null || _json$choices3 === void 0 || (_json$choices3 = _json$choices3.delta) === null || _json$choices3 === void 0 ? void 0 : _json$choices3.content) || ((_json$choices4 = json.choices) === null || _json$choices4 === void 0 || (_json$choices4 = _json$choices4[0]) === null || _json$choices4 === void 0 ? void 0 : _json$choices4.text);
                        if (json !== null && json !== void 0 && (_json$delta2 = json.delta) !== null && _json$delta2 !== void 0 && _json$delta2.stop_reason) {
                          logger.log('[ANTHROPIC:CLAUDE done] Closing readable stream');
                          data += '\n';
                          controller.enqueue(encoder.encode('\n'));
                          controller.close();
                          closed = true;
                          return;
                        }
                        text = text || '';
                        if (counter < 2 && (text.match(/\n/) || []).length) {
                          counter++;
                        }
                        data += text;
                        var queue = encoder.encode(text);
                        controller.enqueue(queue);
                        counter++;
                      } catch (e) {
                        logger.error('controller error', e);
                        closed = true;
                        controller.error(e);
                      }
                    }
                  };
                  logger.log('Starting readable stream');
                  _context4.prev = 2;
                  parser = (0, _eventsourceParser.createParser)(onParse);
                  logger.log('Starting to read response body', response === null || response === void 0 ? void 0 : response.body);

                  // Get reader once and store it
                  reader = response.body.getReader();

                  // Handle non-streaming response
                  _context4.next = 8;
                  return reader.read();
                case 8:
                  firstChunk = _context4.sent;
                  if (!firstChunk.value) {
                    _context4.next = 27;
                    break;
                  }
                  decoded = new TextDecoder().decode(firstChunk.value);
                  _context4.prev = 11;
                  // Attempt to parse it as JSON
                  // (if it's parseable and has a final choices' text prop
                  //  then it's likely a non-streaming (final) response)
                  json = JSON.parse(decoded);
                  if (!((_json$choices5 = json.choices) !== null && _json$choices5 !== void 0 && (_json$choices5 = _json$choices5[0]) !== null && _json$choices5 !== void 0 && _json$choices5.text && !((_json$choices6 = json.choices) !== null && _json$choices6 !== void 0 && (_json$choices6 = _json$choices6[0]) !== null && _json$choices6 !== void 0 && _json$choices6.delta))) {
                    _context4.next = 21;
                    break;
                  }
                  // Non-streaming response
                  text = json.choices[0].text;
                  controller.enqueue(encoder.encode(text));
                  controller.close();
                  closed = true;
                  return _context4.abrupt("return");
                case 21:
                  // Streaming response - feed to parser
                  parser.feed(decoded);
                case 22:
                  _context4.next = 27;
                  break;
                case 24:
                  _context4.prev = 24;
                  _context4.t0 = _context4["catch"](11);
                  // Not JSON or other error - treat as streaming
                  parser.feed(decoded);
                case 27:
                  if (closed) {
                    _context4.next = 38;
                    break;
                  }
                case 28:
                  _context4.next = 30;
                  return reader.read();
                case 30:
                  _yield$reader$read = _context4.sent;
                  done = _yield$reader$read.done;
                  value = _yield$reader$read.value;
                  if (!done) {
                    _context4.next = 35;
                    break;
                  }
                  return _context4.abrupt("break", 38);
                case 35:
                  _decoded = new TextDecoder().decode(value);
                  parser.feed(_decoded);
                case 37:
                  if (!closed) {
                    _context4.next = 28;
                    break;
                  }
                case 38:
                  _context4.next = 44;
                  break;
                case 40:
                  _context4.prev = 40;
                  _context4.t1 = _context4["catch"](2);
                  logger.error('Stream error:', _context4.t1);
                  controller.error(_context4.t1);
                case 44:
                  _context4.prev = 44;
                  if (!closed) {
                    closed = true;
                    controller.close();
                  }
                  if (reader) {
                    try {
                      reader.releaseLock();
                    } catch (e) {
                      logger.error('Error releasing reader lock:', e);
                    }
                  }
                  return _context4.finish(44);
                case 48:
                case "end":
                  return _context4.stop();
              }
            }, _callee4, null, [[2, 40, 44, 48], [11, 24]]);
          }))();
        },
        cancel: function cancel(reason) {
          closed = true;
          logger.log("Stream cancelled: ".concat(reason));
          if (reader) {
            try {
              reader.cancel()["catch"](function (e) {
                return logger.error('Error during reader cancellation:', e);
              });
            } catch (e) {
              logger.error('Error during reader cancellation:', e);
            }
          }
        }
      });
    }
  }, {
    key: "createStream",
    value: function () {
      var _createStream = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee5(payload) {
        var retries,
          limitCheck,
          preparedPayload,
          controller,
          timeoutId,
          response,
          delay,
          _args5 = arguments;
        return _regeneratorRuntime().wrap(function _callee5$(_context5) {
          while (1) switch (_context5.prev = _context5.next) {
            case 0:
              retries = _args5.length > 1 && _args5[1] !== undefined ? _args5[1] : 0;
              // Check resource limits
              limitCheck = this.resourceLimiter.consume(_objectSpread({
                rpm: 1
              }, payload.messages ? {
                tpm: (0, _estimateTokens.estimateTokens)(payload.messages.join(''))
              } : {}));
              if (limitCheck.allowed) {
                _context5.next = 4;
                break;
              }
              throw new _ProviderErrors.ProviderRateLimitError(this.name, limitCheck.limits.rpm.resetInMs, Object.entries(limitCheck.limits).filter(function (_ref5) {
                var _ref6 = _slicedToArray(_ref5, 2),
                  _ = _ref6[0],
                  status = _ref6[1];
                return !status.allowed;
              }).map(function (_ref7) {
                var _ref8 = _slicedToArray(_ref7, 2),
                  name = _ref8[0],
                  status = _ref8[1];
                return {
                  type: name,
                  resetInMs: status.resetInMs
                };
              }));
            case 4:
              _context5.prev = 4;
              preparedPayload = this.preparePayload(_objectSpread(_objectSpread({}, payload), {}, {
                stream: true
              }));
              controller = new AbortController();
              timeoutId = setTimeout(function () {
                return controller.abort();
              }, this.REQUEST_TIMEOUT_MS);
              _context5.next = 10;
              return this.fetch(this.endpoint, {
                method: 'POST',
                headers: this.headerGen ? this.headerGen.call(this) : this.getHeaders(),
                body: JSON.stringify(preparedPayload),
                signal: controller.signal
              });
            case 10:
              response = _context5.sent;
              clearTimeout(timeoutId);
              if (response.ok) {
                _context5.next = 16;
                break;
              }
              _context5.next = 15;
              return this.handleErrorResponse(response);
            case 15:
              throw _context5.sent;
            case 16:
              return _context5.abrupt("return", this.createReadableStream(response));
            case 19:
              _context5.prev = 19;
              _context5.t0 = _context5["catch"](4);
              if (!(_context5.t0.name === 'AbortError')) {
                _context5.next = 23;
                break;
              }
              throw new _ProviderErrors.ProviderTimeoutError(this.name, this.REQUEST_TIMEOUT_MS);
            case 23:
              if (!(this.shouldRetry(_context5.t0) && retries < this.MAX_RETRIES)) {
                _context5.next = 28;
                break;
              }
              delay = this.calculateBackoff(retries);
              _context5.next = 27;
              return this.delay(delay);
            case 27:
              return _context5.abrupt("return", this.createStream(payload, retries + 1));
            case 28:
              throw _context5.t0;
            case 29:
            case "end":
              return _context5.stop();
          }
        }, _callee5, this, [[4, 19]]);
      }));
      function createStream(_x4) {
        return _createStream.apply(this, arguments);
      }
      return createStream;
    }()
  }, {
    key: "timeout",
    value: function timeout(ms) {
      return new Promise(function (_, reject) {
        return setTimeout(function () {
          return reject(new Error("Request timed out after ".concat(ms, "ms")));
        }, ms);
      });
    }
  }, {
    key: "delay",
    value: function delay(ms) {
      return new Promise(function (resolve) {
        if (process.env.NODE_ENV === 'test') {
          // In test environment, resolve immediately to avoid hanging
          resolve();
        } else {
          setTimeout(resolve, ms);
        }
      });
    }
  }, {
    key: "shouldRetry",
    value: function shouldRetry(error) {
      // Expanded list of transient errors
      var transientStatusCodes = [408, 500, 502, 503, 504, 520, 524];
      var transientErrorMessages = ['ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN', 'socket hang up', 'network timeout', 'connection reset', 'connection refused'];

      // Check if it's one of our custom error types
      if (error instanceof _ProviderErrors.ProviderNetworkError) {
        return transientStatusCodes.includes(error.statusCode);
      }

      // Don't retry authentication errors
      if (error instanceof _ProviderErrors.ProviderAuthenticationError) {
        return false;
      }

      // For generic errors, check the message
      var isNetworkError = transientErrorMessages.some(function (msg) {
        return error.message.toLowerCase().includes(msg.toLowerCase());
      });
      return isNetworkError;
    }
  }, {
    key: "getHeaders",
    value: function getHeaders() {
      var headers = {
        'Content-Type': 'application/json'
      };
      if (this.key !== 'NO_KEY' && this.key !== '') {
        headers.Authorization = "Bearer ".concat(this.key);
      } else if (this.key == null) {
        throw new Error('Note: No key is defined');
      }
      return headers;
    }
  }, {
    key: "preparePayload",
    value: function preparePayload(customPayload) {
      var _messages;
      // Run validation and extract system message if present
      var _ValidationService$va = _ValidationService["default"].validateMessages(customPayload.messages),
        systemMessage = _ValidationService$va.systemMessage,
        messages = _ValidationService$va.messages;
      _ValidationService["default"].validateLLMPayload(customPayload);

      // Use extracted system message or the one from payload
      var system = systemMessage || customPayload.system || '';

      // First, try to use the model specified in the preference
      var modelType = customPayload.model || 'fast';
      var model = this.models[modelType] || this.models['fast'] || Object.values(this.models)[0];
      if (!model) {
        throw new _ProviderErrors.ModelValidationError("No valid model found for provider: ".concat(this.name), {
          provider: this.name,
          availableModels: Object.keys(this.models)
        });
      }

      // Calculate system message and latest user message token counts
      var systemTokens = (0, _estimateTokens.estimateTokens)(system);
      var latestUserMessage = ((_messages = messages[messages.length - 1]) === null || _messages === void 0 ? void 0 : _messages.content) || '';
      var latestUserTokens = (0, _estimateTokens.estimateTokens)(latestUserMessage);
      var responseTokens = customPayload.max_tokens || DEFAULT_RESPONSE_TOKEN_LENGTH;

      // Calculate minimum required tokens
      var minRequiredTokens = systemTokens + latestUserTokens + responseTokens;

      // Handle autoTruncateMessages
      var maxContextSize = customPayload.autoTruncateMessages === true ? model.maxContextSize || DEFAULT_ASSUMED_MAX_CONTEXT_SIZE : typeof customPayload.autoTruncateMessages === 'number' ? customPayload.autoTruncateMessages : model.maxContextSize || DEFAULT_ASSUMED_MAX_CONTEXT_SIZE;
      if (isNaN(maxContextSize)) {
        throw new _ProviderErrors.ModelValidationError('Invalid autoTruncateMessages value', {
          value: JSON.stringify({
            autoTruncateMessages: customPayload.autoTruncateMessages,
            model: model.name,
            maxContextSize: model.maxContextSize
          })
        });
      }

      // Throw early if context size is too small
      if (minRequiredTokens > maxContextSize) {
        throw new _ProviderErrors.ModelValidationError('Context size too small for system message, latest user message, and response', {
          provider: this.name,
          required: minRequiredTokens,
          maxSize: maxContextSize,
          systemTokens: systemTokens,
          latestUserTokens: latestUserTokens,
          responseTokens: responseTokens
        });
      }

      // Calculate remaining space for historical messages
      var availableForHistory = maxContextSize - minRequiredTokens;

      // Process historical messages (excluding the latest one)
      var historicalMessages = messages.slice(0, -1);

      // Estimate total tokens used by historical messages
      var totalHistoricalTokens = (0, _estimateTokens.estimateMessagesTokens)(historicalMessages);
      var truncatedMessages = [];
      if (totalHistoricalTokens <= availableForHistory) {
        // Include all historical messages as-is
        truncatedMessages.push.apply(truncatedMessages, _toConsumableArray(historicalMessages));
      } else {
        // Start with an optimistic ratio
        var ratio = availableForHistory / totalHistoricalTokens;
        var attempts = 0;
        var MAX_ATTEMPTS = 3;
        while (attempts < MAX_ATTEMPTS) {
          var tempMessages = [];
          var currentTotal = 0;
          var _iterator2 = _createForOfIteratorHelper(historicalMessages),
            _step2;
          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              var msg = _step2.value;
              var originalTokens = (0, _estimateTokens.estimateMessageTokens)(msg);
              var desiredTokens = Math.max(1, Math.floor(originalTokens * ratio));
              var truncatedContent = (0, _innerTruncate["default"])(msg.content, '[...]', 10, desiredTokens);
              var actualTokens = (0, _estimateTokens.estimateTokens)(truncatedContent);
              currentTotal += actualTokens;
              tempMessages.push({
                role: msg.role,
                content: truncatedContent
              });
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
          }
          if (currentTotal <= availableForHistory) {
            truncatedMessages.push.apply(truncatedMessages, tempMessages);
            break;
          }

          // Reduce ratio and try again
          ratio *= 0.75;
          attempts++;
        }

        // If we couldn't get under the limit, use minimal messages
        if (attempts === MAX_ATTEMPTS) {
          var _iterator3 = _createForOfIteratorHelper(historicalMessages),
            _step3;
          try {
            for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
              var _msg = _step3.value;
              truncatedMessages.push({
                role: _msg.role,
                content: '[...]'
              });
            }
          } catch (err) {
            _iterator3.e(err);
          } finally {
            _iterator3.f();
          }
        }
      }

      // Always add the latest message last
      if (messages.length > 0) {
        truncatedMessages.push(messages[messages.length - 1]);
      }

      // Prepare model specific payload
      var modelSpecificPayload = this.payloader(_objectSpread(_objectSpread({
        system: system,
        max_tokens: customPayload.max_tokens || customPayload.maxTokens || DEFAULT_RESPONSE_TOKEN_LENGTH
      }, customPayload), {}, {
        messages: truncatedMessages
      }));
      return _objectSpread(_objectSpread({}, modelSpecificPayload), {}, {
        model: model.name,
        stream: customPayload.stream || false
      });
    }
  }], [{
    key: "setGlobalFetch",
    value: function setGlobalFetch(fetchFn) {
      Provider._globalFetch = fetchFn;
    }
  }]);
}();
_defineProperty(Provider, "_globalFetch", fetch);
var _default = exports["default"] = Provider;