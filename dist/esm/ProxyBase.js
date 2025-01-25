function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _asyncIterator(r) { var n, t, o, e = 2; for ("undefined" != typeof Symbol && (t = Symbol.asyncIterator, o = Symbol.iterator); e--;) { if (t && null != (n = r[t])) return n.call(r); if (o && null != (n = r[o])) return new AsyncFromSyncIterator(n.call(r)); t = "@@asyncIterator", o = "@@iterator"; } throw new TypeError("Object is not async iterable"); }
function AsyncFromSyncIterator(r) { function AsyncFromSyncIteratorContinuation(r) { if (Object(r) !== r) return Promise.reject(new TypeError(r + " is not an object.")); var n = r.done; return Promise.resolve(r.value).then(function (r) { return { value: r, done: n }; }); } return AsyncFromSyncIterator = function AsyncFromSyncIterator(r) { this.s = r, this.n = r.next; }, AsyncFromSyncIterator.prototype = { s: null, n: null, next: function next() { return AsyncFromSyncIteratorContinuation(this.n.apply(this.s, arguments)); }, "return": function _return(r) { var n = this.s["return"]; return void 0 === n ? Promise.resolve({ value: r, done: !0 }) : AsyncFromSyncIteratorContinuation(n.apply(this.s, arguments)); }, "throw": function _throw(r) { var n = this.s["return"]; return void 0 === n ? Promise.reject(r) : AsyncFromSyncIteratorContinuation(n.apply(this.s, arguments)); } }, new AsyncFromSyncIterator(r); }
import http from 'http';
import { configure } from './config.mjs';
import StreamManager from './StreamManager.mjs';
import ValidationService from './ValidationService.mjs';
import ResourceLimiter from './ResourceLimiter.mjs';
import PROVIDERS from './PROVIDERS.mjs';
configure({
  logging: {
    level: 'INFO'
  }
});
function validateProxyConfig(config) {
  var errors = [];
  var validateLimit = function validateLimit(name, value) {
    var min = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
    if (value !== undefined && value !== null) {
      if (typeof value !== 'number' || isNaN(value)) {
        errors.push("".concat(name, " must be a number, got: ").concat(_typeof(value)));
      } else if (value < min) {
        errors.push("".concat(name, " must be >= ").concat(min, ", got: ").concat(value));
      }
    }
  };
  var validKeys = new Set(['port', 'corsOrigins', 'maxRequestSize', 'timeout', 'debug', 'verbose', 'globalRequestsPerMinute', 'globalTokensPerMinute', 'globalTokensPerHour', 'globalRequestsPerHour', 'rateLimitMessage', 'listen', 'errorMessages', 'paths', 'cache']);
  Object.keys(config).forEach(function (key) {
    if (!validKeys.has(key)) {
      errors.push("Unknown configuration key: \"".concat(key, "\""));
    }
  });
  validateLimit('port', config.port, 1);
  if (config.port > 65535) {
    errors.push("port must be <= 65535, got: ".concat(config.port));
  }
  validateLimit('globalRequestsPerMinute', config.globalRequestsPerMinute);
  validateLimit('globalTokensPerMinute', config.globalTokensPerMinute);
  validateLimit('globalTokensPerHour', config.globalTokensPerHour);
  validateLimit('globalRequestsPerHour', config.globalRequestsPerHour);

  // Timeout validation
  if (config.timeout) {
    validateLimit('timeout', config.timeout, 100);
    if (config.timeout > 300000) {
      errors.push("timeout must be <= 300000ms, got: ".concat(config.timeout, "ms"));
    }
  }

  // CORS validation
  if (config.corsOrigins && typeof config.corsOrigins !== 'string' && !Array.isArray(config.corsOrigins)) {
    errors.push('corsOrigins must be a string or array');
  }

  // Path validation
  if (config.paths) {
    if (_typeof(config.paths) !== 'object') {
      errors.push('paths must be an object');
    } else {
      if (config.paths.stream && typeof config.paths.stream !== 'string') {
        errors.push('paths.stream must be a string');
      }
      if (config.paths.limits && typeof config.paths.limits !== 'string') {
        errors.push('paths.limits must be a string');
      }
    }
  }

  // Add cache validation
  if (config.cache) {
    validateLimit('cache.maxSize', config.cache.maxSize);
    validateLimit('cache.maxEntries', config.cache.maxEntries);
    validateLimit('cache.maxEntrySize', config.cache.maxEntrySize);
    validateLimit('cache.persistInterval', config.cache.persistInterval, 1000);
    validateLimit('cache.ttl', config.cache.ttl);

    // Validate cache file options
    if (config.cache.cacheDir && typeof config.cache.cacheDir !== 'string') {
      errors.push('cache.dir must be a string');
    }
    if (config.cache.cacheFilename && typeof config.cache.cacheFilename !== 'string') {
      errors.push('cache.filename must be a string');
    }
  }
  if (errors.length > 0) {
    throw new Error('Invalid proxy configuration:\n- ' + errors.join('\n- '));
  }
  return config;
}
export var ProxyBase = /*#__PURE__*/function () {
  function ProxyBase() {
    var _this$config, _this$config2;
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    _classCallCheck(this, ProxyBase);
    this.config = validateProxyConfig(config);
    this.port = this.config.port || process.env.PORT || 3124;
    this.streamManager = new StreamManager(this.config);
    this.maxRequestSize = this.config.maxRequestSize || 1048576;
    this.timeout = this.config.timeout || 30000;
    this.globalLimiter = new ResourceLimiter({
      rpm: this.config.globalRequestsPerMinute ? {
        limit: this.config.globalRequestsPerMinute,
        window: 60000
      } : null,
      tpm: this.config.globalTokensPerMinute ? {
        limit: this.config.globalTokensPerMinute,
        window: 60000
      } : null,
      tph: this.config.globalTokensPerHour ? {
        limit: this.config.globalTokensPerHour,
        window: 3600000
      } : null,
      rph: this.config.globalRequestsPerHour ? {
        limit: this.config.globalRequestsPerHour,
        window: 3600000
      } : null
    });
    this.paths = {
      stream: '/api/stream',
      limits: '/api/limits'
    };
    if ((_this$config = this.config) !== null && _this$config !== void 0 && (_this$config = _this$config.paths) !== null && _this$config !== void 0 && _this$config.stream) {
      this.paths.stream = this.config.paths.stream;
    }
    if ((_this$config2 = this.config) !== null && _this$config2 !== void 0 && (_this$config2 = _this$config2.paths) !== null && _this$config2 !== void 0 && _this$config2.limits) {
      this.paths.limits = this.config.paths.limits;
    }
  }
  return _createClass(ProxyBase, [{
    key: "handleCORS",
    value: function handleCORS(req, res) {
      var requestOrigin = req.headers.origin;
      var allowedOrigins = Array.isArray(this.config.corsOrigins) ? this.config.corsOrigins : [this.config.corsOrigins || '*'];
      if (allowedOrigins.includes('*')) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin || '*');
        res.setHeader('Access-Control-Allow-Credentials', 'false');
      } else if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      } else {
        res.setHeader('Access-Control-Allow-Origin', 'null');
        res.setHeader('Access-Control-Allow-Credentials', 'false');
      }
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }
  }, {
    key: "parseRequestBody",
    value: function () {
      var _parseRequestBody = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee(req, res) {
        var buffers, totalSize, _iteratorAbruptCompletion, _didIteratorError, _iteratorError, _iterator, _step, chunk;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              buffers = [];
              totalSize = 0;
              _context.prev = 2;
              _iteratorAbruptCompletion = false;
              _didIteratorError = false;
              _context.prev = 5;
              _iterator = _asyncIterator(req);
            case 7:
              _context.next = 9;
              return _iterator.next();
            case 9:
              if (!(_iteratorAbruptCompletion = !(_step = _context.sent).done)) {
                _context.next = 20;
                break;
              }
              chunk = _step.value;
              totalSize += chunk.length;
              if (!(totalSize > this.maxRequestSize)) {
                _context.next = 16;
                break;
              }
              res.writeHead(413, {
                'Content-Type': 'application/json'
              });
              res.end(JSON.stringify({
                error: 'Request entity too large',
                code: 'PAYLOAD_TOO_LARGE',
                maxSize: this.maxRequestSize
              }));
              return _context.abrupt("return", null);
            case 16:
              buffers.push(chunk);
            case 17:
              _iteratorAbruptCompletion = false;
              _context.next = 7;
              break;
            case 20:
              _context.next = 26;
              break;
            case 22:
              _context.prev = 22;
              _context.t0 = _context["catch"](5);
              _didIteratorError = true;
              _iteratorError = _context.t0;
            case 26:
              _context.prev = 26;
              _context.prev = 27;
              if (!(_iteratorAbruptCompletion && _iterator["return"] != null)) {
                _context.next = 31;
                break;
              }
              _context.next = 31;
              return _iterator["return"]();
            case 31:
              _context.prev = 31;
              if (!_didIteratorError) {
                _context.next = 34;
                break;
              }
              throw _iteratorError;
            case 34:
              return _context.finish(31);
            case 35:
              return _context.finish(26);
            case 36:
              _context.next = 43;
              break;
            case 38:
              _context.prev = 38;
              _context.t1 = _context["catch"](2);
              res.writeHead(400, {
                'Content-Type': 'application/json'
              });
              res.end(JSON.stringify({
                error: 'Error reading request body',
                code: 'INVALID_REQUEST'
              }));
              return _context.abrupt("return", null);
            case 43:
              _context.prev = 43;
              return _context.abrupt("return", JSON.parse(Buffer.concat(buffers).toString()));
            case 47:
              _context.prev = 47;
              _context.t2 = _context["catch"](43);
              res.writeHead(400, {
                'Content-Type': 'application/json'
              });
              res.end(JSON.stringify({
                error: 'Invalid JSON in request body',
                code: 'INVALID_JSON'
              }));
              return _context.abrupt("return", null);
            case 52:
            case "end":
              return _context.stop();
          }
        }, _callee, this, [[2, 38], [5, 22, 26, 36], [27,, 31, 35], [43, 47]]);
      }));
      function parseRequestBody(_x, _x2) {
        return _parseRequestBody.apply(this, arguments);
      }
      return parseRequestBody;
    }()
  }, {
    key: "checkRateLimits",
    value: function checkRateLimits(data) {
      var tokenEstimate = data.messages ? data.messages.reduce(function (acc, m) {
        return acc + m.content.length / 3;
      }, 0) : 0;
      return this.globalLimiter.checkLimits({
        rpm: 1,
        tpm: tokenEstimate,
        tph: tokenEstimate,
        rph: 1
      });
    }
  }, {
    key: "handleError",
    value: function handleError(error, res) {
      if (!res.headersSent) {
        res.writeHead(500, {
          'Content-Type': 'application/json'
        });
        res.end(JSON.stringify({
          error: 'Internal server error',
          code: error.code || 'INTERNAL_ERROR',
          message: error.message
        }));
        return;
      }
      res.write("event: error\ndata: ".concat(JSON.stringify({
        error: 'Stream error',
        code: error.code || 'STREAM_ERROR',
        message: error.message
      }), "\n\n"));
      res.end();
    }
  }, {
    key: "handleRequest",
    value: function () {
      var _handleRequest = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2(req, res) {
        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              req.setTimeout(this.timeout);
              this.handleCORS(req, res);
              if (!(req.method === 'OPTIONS')) {
                _context2.next = 6;
                break;
              }
              res.writeHead(204);
              res.end();
              return _context2.abrupt("return");
            case 6:
              if (!(req.url === this.paths.limits)) {
                _context2.next = 8;
                break;
              }
              return _context2.abrupt("return", this.handleLimitsRequest(req, res));
            case 8:
              if (!(req.url === this.paths.stream)) {
                _context2.next = 10;
                break;
              }
              return _context2.abrupt("return", this.handleStreamRequest(req, res));
            case 10:
              res.writeHead(404, {
                'Content-Type': 'application/json'
              });
              res.end(JSON.stringify({
                error: 'Not found',
                code: 'NOT_FOUND'
              }));
            case 12:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this);
      }));
      function handleRequest(_x3, _x4) {
        return _handleRequest.apply(this, arguments);
      }
      return handleRequest;
    }()
  }, {
    key: "handleLimitsRequest",
    value: function () {
      var _handleLimitsRequest = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3(req, res) {
        var status;
        return _regeneratorRuntime().wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              if (!(req.method !== 'GET')) {
                _context3.next = 4;
                break;
              }
              res.writeHead(405, {
                'Content-Type': 'application/json'
              });
              res.end(JSON.stringify({
                error: 'Method not allowed',
                code: 'METHOD_NOT_ALLOWED'
              }));
              return _context3.abrupt("return");
            case 4:
              status = this.globalLimiter.checkLimits();
              res.writeHead(200, {
                'Content-Type': 'application/json'
              });
              res.end(JSON.stringify(status));
            case 7:
            case "end":
              return _context3.stop();
          }
        }, _callee3, this);
      }));
      function handleLimitsRequest(_x5, _x6) {
        return _handleLimitsRequest.apply(this, arguments);
      }
      return handleLimitsRequest;
    }()
  }, {
    key: "handleStreamRequest",
    value: function () {
      var _handleStreamRequest = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee4(req, res) {
        var _data$messages, _data$messages2, data, limitCheck, rateLimitMessage;
        return _regeneratorRuntime().wrap(function _callee4$(_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              if (!(req.method !== 'POST')) {
                _context4.next = 4;
                break;
              }
              res.writeHead(405, {
                'Content-Type': 'application/json'
              });
              res.end(JSON.stringify({
                error: 'Method not allowed',
                code: 'METHOD_NOT_ALLOWED'
              }));
              return _context4.abrupt("return");
            case 4:
              _context4.prev = 4;
              _context4.next = 7;
              return this.parseRequestBody(req, res);
            case 7:
              data = _context4.sent;
              if (data) {
                _context4.next = 10;
                break;
              }
              return _context4.abrupt("return");
            case 10:
              // Check rate limits first
              limitCheck = this.checkRateLimits(data);
              console.log('limitCheck', limitCheck);
              if (limitCheck.allowed) {
                _context4.next = 17;
                break;
              }
              rateLimitMessage =
              // First check request-level error messages
              (data.errorMessages || {}).rateLimitExceeded ||
              // Then check proxy-level error messages
              this.config.rateLimitMessage || (this.config.errorMessages || {}).rateLimitExceeded || 'Rate limit exceeded';
              res.writeHead(429, {
                'Content-Type': 'application/json'
              });
              res.end(JSON.stringify({
                error: 'Global rate limit exceeded',
                code: 'GLOBAL_RATE_LIMIT',
                limits: limitCheck.limits,
                message: rateLimitMessage
              }));
              return _context4.abrupt("return");
            case 17:
              _context4.prev = 17;
              ValidationService.validateMessages(data.messages);
              ValidationService.validateModel(data.model, PROVIDERS);
              if (!(data.temperature !== undefined)) {
                _context4.next = 23;
                break;
              }
              if (!(typeof data.temperature !== 'number' || data.temperature < 0 || data.temperature > 1)) {
                _context4.next = 23;
                break;
              }
              throw {
                message: 'Temperature must be between 0 and 1',
                code: 'INVALID_TEMPERATURE'
              };
            case 23:
              _context4.next = 30;
              break;
            case 25:
              _context4.prev = 25;
              _context4.t0 = _context4["catch"](17);
              res.writeHead(400, {
                'Content-Type': 'application/json'
              });
              res.end(JSON.stringify({
                error: _context4.t0.message,
                code: _context4.t0.code || 'VALIDATION_ERROR'
              }));
              return _context4.abrupt("return");
            case 30:
              // Consume the rate limits
              this.globalLimiter.consume({
                rpm: 1,
                tpm: ((_data$messages = data.messages) === null || _data$messages === void 0 ? void 0 : _data$messages.reduce(function (acc, m) {
                  return acc + m.content.length / 3;
                }, 0)) || 0,
                tph: ((_data$messages2 = data.messages) === null || _data$messages2 === void 0 ? void 0 : _data$messages2.reduce(function (acc, m) {
                  return acc + m.content.length / 3;
                }, 0)) || 0,
                rph: 1
              });
              _context4.next = 33;
              return this.handleStreaming(data, res);
            case 33:
              _context4.next = 38;
              break;
            case 35:
              _context4.prev = 35;
              _context4.t1 = _context4["catch"](4);
              this.handleError(_context4.t1, res);
            case 38:
            case "end":
              return _context4.stop();
          }
        }, _callee4, this, [[4, 35], [17, 25]]);
      }));
      function handleStreamRequest(_x7, _x8) {
        return _handleStreamRequest.apply(this, arguments);
      }
      return handleStreamRequest;
    }()
  }, {
    key: "handleStreaming",
    value: function () {
      var _handleStreaming = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee5(data, res) {
        return _regeneratorRuntime().wrap(function _callee5$(_context5) {
          while (1) switch (_context5.prev = _context5.next) {
            case 0:
              throw new Error('handleStreaming must be implemented by the proxy class');
            case 1:
            case "end":
              return _context5.stop();
          }
        }, _callee5);
      }));
      function handleStreaming(_x9, _x10) {
        return _handleStreaming.apply(this, arguments);
      }
      return handleStreaming;
    }()
  }, {
    key: "listen",
    value: function listen() {
      var _this = this;
      var server = http.createServer(function (req, res) {
        return _this.handleRequest(req, res);
      });
      server.on('error', function (error) {
        console.error('Server error:', error);
      });
      process.on('SIGTERM', /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee6() {
        return _regeneratorRuntime().wrap(function _callee6$(_context6) {
          while (1) switch (_context6.prev = _context6.next) {
            case 0:
              console.log('SIGTERM received. Closing all streams...');
              _context6.next = 3;
              return _this.streamManager.closeAll();
            case 3:
              process.exit(0);
            case 4:
            case "end":
              return _context6.stop();
          }
        }, _callee6);
      })));
      if (this.config.listen !== false) {
        try {
          server.listen(this.port, function () {
            console.log("Proxy server listening on port ".concat(_this.port));
          });
        } catch (error) {
          console.error('Failed to listen on port', this.port, error);
        }
      }
      return server;
    }
  }]);
}();