"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _Logger = _interopRequireDefault(require("./Logger.js"));
var _ProviderErrors = require("./errors/ProviderErrors.js");
var _eventsourceParser = require("eventsource-parser");
var _innerTruncate = _interopRequireDefault(require("./innerTruncate.js"));
var _ValidationService = _interopRequireDefault(require("./ValidationService.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _asyncIterator(r) { var n, t, o, e = 2; for ("undefined" != typeof Symbol && (t = Symbol.asyncIterator, o = Symbol.iterator); e--;) { if (t && null != (n = r[t])) return n.call(r); if (o && null != (n = r[o])) return new AsyncFromSyncIterator(n.call(r)); t = "@@asyncIterator", o = "@@iterator"; } throw new TypeError("Object is not async iterable"); }
function AsyncFromSyncIterator(r) { function AsyncFromSyncIteratorContinuation(r) { if (Object(r) !== r) return Promise.reject(new TypeError(r + " is not an object.")); var n = r.done; return Promise.resolve(r.value).then(function (r) { return { value: r, done: n }; }); } return AsyncFromSyncIterator = function AsyncFromSyncIterator(r) { this.s = r, this.n = r.next; }, AsyncFromSyncIterator.prototype = { s: null, n: null, next: function next() { return AsyncFromSyncIteratorContinuation(this.n.apply(this.s, arguments)); }, "return": function _return(r) { var n = this.s["return"]; return void 0 === n ? Promise.resolve({ value: r, done: !0 }) : AsyncFromSyncIteratorContinuation(n.apply(this.s, arguments)); }, "throw": function _throw(r) { var n = this.s["return"]; return void 0 === n ? Promise.reject(r) : AsyncFromSyncIteratorContinuation(n.apply(this.s, arguments)); } }, new AsyncFromSyncIterator(r); }
// Use native AbortController if available (modern environments), otherwise try to import
var AbortController = globalThis.AbortController || (typeof window !== 'undefined' ? window.AbortController : null);
if (!AbortController) {
  throw new Error('AbortController is not available in this environment. Please use a newer version of Node.js or install the abort-controller package.');
}
function estimateTokenCount(m) {
  return m.length / 3;
}
var logger = new _Logger["default"]('Provider');
var DEFAULT_ASSUMED_MAX_CONTEXT_SIZE = 8000;
var DEFAULT_RESPONSE_TOKEN_LENGTH = 300;
var MAX_TOKEN_HISTORICAL_MESSAGE = 600;
var VALID_ROLES = ['user', 'assistant'];
var Provider = /*#__PURE__*/function () {
  function Provider(name, details) {
    var _details$constraints, _details$constraints2;
    var fetchFn = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : fetch;
    var configOverrides = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    _classCallCheck(this, Provider);
    this.fetch = fetchFn;
    this.name = name;
    this.endpoint = details.endpoint;
    this.key = details.key;
    this.models = details.models || {};
    this.payloader = details.payloader || this.defaultPayloader;
    this.headerGen = details.headerGen || this.defaultHeaderGen;
    this.rpmLimit = ((_details$constraints = details.constraints) === null || _details$constraints === void 0 ? void 0 : _details$constraints.rpmLimit) || 1e6;
    this.constraints = details.constraints || {
      rpmLimit: this.rpmLimit
    };

    // Configurable properties with more sensible defaults or overrides
    this.REQUEST_TIMEOUT_MS = configOverrides.REQUEST_TIMEOUT_MS || 50000;
    this.MAX_RETRIES = configOverrides.MAX_RETRIES || 2;
    this.RETRY_DELAY_WHEN_OVERLOADED = configOverrides.RETRY_DELAY_WHEN_OVERLOADED || 1000;

    // Token Bucket Properties
    this.tokens = this.rpmLimit;
    this.lastRefill = Date.now();
    this.tokenRefillInterval = 60000; // 1 minute

    // Add circuit breaker properties
    this.errorCount = 0;
    this.lastErrorTime = null;
    this.circuitBreakerThreshold = configOverrides.circuitBreakerThreshold || 5;
    this.circuitBreakerResetTime = configOverrides.circuitBreakerResetTime || 60000; // 1 minute

    // Default RPM limit from provider config
    this.defaultRpmLimit = ((_details$constraints2 = details.constraints) === null || _details$constraints2 === void 0 ? void 0 : _details$constraints2.rpmLimit) || Infinity;
    this.currentRpmLimit = this.defaultRpmLimit;
  }
  return _createClass(Provider, [{
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
        var retries, maxRetries, lastError, result, delay;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              // Apply any request-specific constraints
              if ((_payload$constraints = payload.constraints) !== null && _payload$constraints !== void 0 && _payload$constraints.rpmLimit) {
                this.setRpmLimit(payload.constraints.rpmLimit);
              }
              if (!this.isCircuitBroken()) {
                _context.next = 3;
                break;
              }
              throw new _ProviderErrors.ProviderError("Circuit breaker is open for provider ".concat(this.name), 'CIRCUIT_BREAKER_OPEN', this.name);
            case 3:
              this.refillTokens();
              if (!(this.tokens <= 0)) {
                _context.next = 6;
                break;
              }
              throw new _ProviderErrors.ProviderRateLimitError(this.name);
            case 6:
              this.tokens--;
              retries = 0;
              maxRetries = this.MAX_RETRIES;
              lastError = null;
            case 10:
              if (!(retries <= maxRetries)) {
                _context.next = 31;
                break;
              }
              _context.prev = 11;
              _context.next = 14;
              return this.attemptRequest(payload);
            case 14:
              result = _context.sent;
              this.resetCircuitBreaker(); // Success, reset error count
              return _context.abrupt("return", result);
            case 19:
              _context.prev = 19;
              _context.t0 = _context["catch"](11);
              lastError = _context.t0;
              if (this.shouldRetry(_context.t0)) {
                _context.next = 25;
                break;
              }
              this.incrementCircuitBreaker(_context.t0);
              throw _context.t0;
            case 25:
              delay = this.calculateBackoff(retries);
              _context.next = 28;
              return this.delay(delay);
            case 28:
              retries++;
            case 29:
              _context.next = 10;
              break;
            case 31:
              throw lastError;
            case 32:
            case "end":
              return _context.stop();
          }
        }, _callee, this, [[11, 19]]);
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
              if (response.ok) {
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
        var errorBody;
        return _regeneratorRuntime().wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return response.text();
            case 2:
              errorBody = _context3.sent;
              _context3.t0 = response.status;
              _context3.next = _context3.t0 === 401 ? 6 : _context3.t0 === 403 ? 6 : _context3.t0 === 429 ? 7 : _context3.t0 === 408 ? 8 : _context3.t0 === 504 ? 8 : 9;
              break;
            case 6:
              return _context3.abrupt("return", new _ProviderErrors.ProviderAuthenticationError(this.name, errorBody));
            case 7:
              return _context3.abrupt("return", new _ProviderErrors.ProviderRateLimitError(this.name, response.headers.get('Retry-After')));
            case 8:
              return _context3.abrupt("return", new _ProviderErrors.ProviderTimeoutError(this.name, this.REQUEST_TIMEOUT_MS));
            case 9:
              return _context3.abrupt("return", new _ProviderErrors.ProviderNetworkError(this.name, response.status, errorBody));
            case 10:
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
      // Exponential backoff with jitter
      var baseDelay = 1000; // 1 second
      var maxDelay = 32000; // 32 seconds
      var exponential = Math.min(maxDelay, baseDelay * Math.pow(2, retryCount));
      var jitter = Math.random() * 0.1 * exponential; // 10% jitter
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
    key: "createStream",
    value: function () {
      var _createStream = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee6(payload) {
        var _this = this;
        var retries,
          response,
          closed,
          encoder,
          inst,
          makeSingleStream,
          _args6 = arguments;
        return _regeneratorRuntime().wrap(function _callee6$(_context6) {
          while (1) switch (_context6.prev = _context6.next) {
            case 0:
              retries = _args6.length > 1 && _args6[1] !== undefined ? _args6[1] : 0;
              this.refillTokens();
              if (!(this.tokens <= 0)) {
                _context6.next = 4;
                break;
              }
              throw new Error("RPM limit exceeded for provider ".concat(this.name));
            case 4:
              this.tokens--;
              closed = false;
              _context6.prev = 6;
              logger.log('Making STREAMING request with payload', payload);
              encoder = new TextEncoder();
              inst = this;
              payload.stream = true;
              makeSingleStream = /*#__PURE__*/function () {
                var _ref = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee5() {
                  var preparedPayload, endpoint, headers, controller, timeoutId, errorText, data, counter, _response3, _response4, _response5;
                  return _regeneratorRuntime().wrap(function _callee5$(_context5) {
                    while (1) switch (_context5.prev = _context5.next) {
                      case 0:
                        logger.log('Initiating stream request');
                        preparedPayload = _this.preparePayload(payload);
                        logger.log('Prepared payload for stream request', preparedPayload);
                        _context5.prev = 3;
                        endpoint = "".concat(_this.endpoint).concat(preparedPayload.stream ? '?stream=true' : '');
                        headers = _this.headerGen ? _this.headerGen.call(_this) : _this.getHeaders();
                        logger.log('Sending fetch request to', _this.endpoint, headers, JSON.stringify(preparedPayload));
                        controller = new AbortController();
                        timeoutId = setTimeout(function () {
                          return controller.abort();
                        }, _this.REQUEST_TIMEOUT_MS);
                        _context5.next = 11;
                        return _this.fetch(endpoint, {
                          method: 'POST',
                          headers: headers,
                          body: JSON.stringify(preparedPayload),
                          signal: controller.signal
                        });
                      case 11:
                        response = _context5.sent;
                        clearTimeout(timeoutId);
                        logger.log('Received response', response.status, response.statusText);
                        if (response.ok) {
                          _context5.next = 20;
                          break;
                        }
                        _context5.next = 17;
                        return response.text();
                      case 17:
                        errorText = _context5.sent;
                        logger.error("HTTP Error ".concat(response.status, " for ").concat(_this.name, " (stream):"), {
                          status: response.status,
                          statusText: response.statusText,
                          headers: Object.fromEntries(response.headers.entries()),
                          errorText: errorText
                        });
                        throw new Error("HTTP Error ".concat(response.status, ": ").concat(errorText));
                      case 20:
                        if (response.body) {
                          _context5.next = 23;
                          break;
                        }
                        logger.error('Response body is null', response);
                        throw new Error("No response body from ".concat(inst.name));
                      case 23:
                        data = '';
                        counter = 0;
                        return _context5.abrupt("return", new ReadableStream({
                          start: function start(controller) {
                            return _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee4() {
                              var onParse, parser, _iteratorAbruptCompletion, _didIteratorError, _iteratorError, _iterator, _step, chunk, decoded, _response;
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
                                          var _json$delta, _json$content_block, _json$choices, _json$delta2;
                                          var json = JSON.parse(eventData);

                                          // Various output formats depending on provider.
                                          var text = (json === null || json === void 0 || (_json$delta = json.delta) === null || _json$delta === void 0 ? void 0 : _json$delta.text) || (json === null || json === void 0 || (_json$content_block = json.content_block) === null || _json$content_block === void 0 ? void 0 : _json$content_block.text) || ((_json$choices = json.choices) === null || _json$choices === void 0 || (_json$choices = _json$choices[0]) === null || _json$choices === void 0 || (_json$choices = _json$choices.delta) === null || _json$choices === void 0 ? void 0 : _json$choices.content);
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
                                            return; //??? what is this for???
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
                                    logger.log('Starting to read response body', response.body);
                                    _iteratorAbruptCompletion = false;
                                    _didIteratorError = false;
                                    _context4.prev = 7;
                                    _iterator = _asyncIterator(response.body);
                                  case 9:
                                    _context4.next = 11;
                                    return _iterator.next();
                                  case 11:
                                    if (!(_iteratorAbruptCompletion = !(_step = _context4.sent).done)) {
                                      _context4.next = 20;
                                      break;
                                    }
                                    chunk = _step.value;
                                    if (!closed) {
                                      _context4.next = 15;
                                      break;
                                    }
                                    return _context4.abrupt("break", 20);
                                  case 15:
                                    decoded = new TextDecoder().decode(chunk);
                                    parser.feed(decoded);
                                  case 17:
                                    _iteratorAbruptCompletion = false;
                                    _context4.next = 9;
                                    break;
                                  case 20:
                                    _context4.next = 26;
                                    break;
                                  case 22:
                                    _context4.prev = 22;
                                    _context4.t0 = _context4["catch"](7);
                                    _didIteratorError = true;
                                    _iteratorError = _context4.t0;
                                  case 26:
                                    _context4.prev = 26;
                                    _context4.prev = 27;
                                    if (!(_iteratorAbruptCompletion && _iterator["return"] != null)) {
                                      _context4.next = 31;
                                      break;
                                    }
                                    _context4.next = 31;
                                    return _iterator["return"]();
                                  case 31:
                                    _context4.prev = 31;
                                    if (!_didIteratorError) {
                                      _context4.next = 34;
                                      break;
                                    }
                                    throw _iteratorError;
                                  case 34:
                                    return _context4.finish(31);
                                  case 35:
                                    return _context4.finish(26);
                                  case 36:
                                    _context4.next = 42;
                                    break;
                                  case 38:
                                    _context4.prev = 38;
                                    _context4.t1 = _context4["catch"](2);
                                    logger.error('Stream error:', _context4.t1);
                                    controller.error(_context4.t1);
                                  case 42:
                                    _context4.prev = 42;
                                    if (!closed) {
                                      closed = true;
                                      controller.close();
                                    }
                                    if (!((_response = response) !== null && _response !== void 0 && _response.body)) {
                                      _context4.next = 53;
                                      break;
                                    }
                                    _context4.prev = 45;
                                    _context4.next = 48;
                                    return response.body.cancel();
                                  case 48:
                                    _context4.next = 53;
                                    break;
                                  case 50:
                                    _context4.prev = 50;
                                    _context4.t2 = _context4["catch"](45);
                                    logger.error('Error cancelling response body:', _context4.t2);
                                  case 53:
                                    return _context4.finish(42);
                                  case 54:
                                  case "end":
                                    return _context4.stop();
                                }
                              }, _callee4, null, [[2, 38, 42, 54], [7, 22, 26, 36], [27,, 31, 35], [45, 50]]);
                            }))();
                          },
                          cancel: function cancel(reason) {
                            var _response2;
                            closed = true;
                            logger.log("Stream cancelled: ".concat(reason));
                            if ((_response2 = response) !== null && _response2 !== void 0 && _response2.body) {
                              response.body.cancel()["catch"](function (e) {
                                return logger.error('Error during stream cancellation:', e);
                              });
                            }
                          }
                        }));
                      case 28:
                        _context5.prev = 28;
                        _context5.t0 = _context5["catch"](3);
                        logger.error("Error in streaming from ".concat(_this.name, ":"), {
                          error: _context5.t0.message,
                          responseStatus: (_response3 = response) === null || _response3 === void 0 ? void 0 : _response3.status,
                          responseStatusText: (_response4 = response) === null || _response4 === void 0 ? void 0 : _response4.statusText
                        });
                        if (!(retries < _this.MAX_RETRIES && _this.shouldRetry(_context5.t0, (_response5 = response) === null || _response5 === void 0 ? void 0 : _response5.status))) {
                          _context5.next = 37;
                          break;
                        }
                        retries++;
                        logger.log("Retrying request for ".concat(_this.name, ", attempt ").concat(retries));
                        _context5.next = 36;
                        return _this.delay(_this.RETRY_DELAY_WHEN_OVERLOADED * Math.pow(2, retries - 1));
                      case 36:
                        return _context5.abrupt("return", _this.createStream(payload, retries));
                      case 37:
                        throw _context5.t0;
                      case 38:
                      case "end":
                        return _context5.stop();
                    }
                  }, _callee5, null, [[3, 28]]);
                }));
                return function makeSingleStream() {
                  return _ref.apply(this, arguments);
                };
              }();
              return _context6.abrupt("return", makeSingleStream());
            case 15:
              _context6.prev = 15;
              _context6.t0 = _context6["catch"](6);
              throw _context6.t0;
            case 18:
            case "end":
              return _context6.stop();
          }
        }, _callee6, this, [[6, 15]]);
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
      var transientStatusCodes = [408, 429, 500, 502, 503, 504, 520, 524];
      var transientErrorMessages = ['ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN', 'socket hang up', 'network timeout', 'connection reset', 'connection refused'];

      // Check if it's one of our custom error types
      if (error instanceof _ProviderErrors.ProviderNetworkError) {
        return transientStatusCodes.includes(error.statusCode);
      }

      // Check if it's a rate limit error (we might want to retry these)
      if (error instanceof _ProviderErrors.ProviderRateLimitError) {
        return true;
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
      if (!this.key) {
        throw new Error('Note: No key is defined');
      }
      var headers = {
        'Content-Type': 'application/json'
      };
      if (this.key !== 'NO_KEY') {
        headers.Authorization = "Bearer ".concat(this.key);
      }
      return headers;
    }
  }, {
    key: "preparePayload",
    value: function preparePayload(customPayload) {
      // Run validation and extract system message if present
      var _ValidationService$va = _ValidationService["default"].validateMessages(customPayload.messages),
        systemMessage = _ValidationService$va.systemMessage,
        messages = _ValidationService$va.messages;
      _ValidationService["default"].validateParameters(customPayload);

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

      // Determine max tokens left after sys message
      var maxAvailableContextSize = 0 | (model.maxContextSize || DEFAULT_ASSUMED_MAX_CONTEXT_SIZE) - estimateTokenCount(system) - DEFAULT_RESPONSE_TOKEN_LENGTH;
      logger.dev('maxAvailableContextSize remaining', maxAvailableContextSize);
      var historyTokenCount = 0;
      messages = messages.reverse().map(function (item) {
        // We are processing in reverse in order to prioritize
        // later parts of the chat over earlier parts
        // (i.e. short term memory)

        var truncated = (0, _innerTruncate["default"])(item.content, '[...]', 10, MAX_TOKEN_HISTORICAL_MESSAGE);
        historyTokenCount += estimateTokenCount(truncated);
        if (historyTokenCount > maxAvailableContextSize) {
          return null;
        }
        return {
          role: item.role,
          content: truncated
        };
      }).reverse().filter(Boolean);
      var modelSpecificPayload = this.payloader(_objectSpread(_objectSpread({
        system: system,
        max_tokens: customPayload.max_tokens || customPayload.maxTokens || DEFAULT_RESPONSE_TOKEN_LENGTH
      }, customPayload), {}, {
        messages: messages
      }));
      logger.dev('successfully derived model specific payload', modelSpecificPayload);
      return _objectSpread(_objectSpread({}, modelSpecificPayload), {}, {
        model: model.name,
        stream: customPayload.stream || false
      });
    }

    // Refill tokens based on elapsed time
  }, {
    key: "refillTokens",
    value: function refillTokens() {
      var now = Date.now();
      var elapsed = now - this.lastRefill;
      if (elapsed >= this.tokenRefillInterval) {
        // Calculate number of complete intervals elapsed
        var intervals = Math.floor(elapsed / this.tokenRefillInterval);
        // Reset tokens to the limit (full refill)
        this.tokens = this.currentRpmLimit;
        // Update last refill time to the start of the current interval
        this.lastRefill = now - elapsed % this.tokenRefillInterval;
      }
    }

    // Add method to update RPM limit
  }, {
    key: "setRpmLimit",
    value: function setRpmLimit(limit) {
      this.currentRpmLimit = limit || this.defaultRpmLimit;
      this.lastRefill = Date.now();
    }
  }]);
}();
var _default = exports["default"] = Provider;