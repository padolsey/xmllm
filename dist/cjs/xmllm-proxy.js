"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _express = _interopRequireDefault(require("express"));
var _cors = _interopRequireDefault(require("cors"));
var _StreamManager = _interopRequireDefault(require("./StreamManager.js"));
var _ValidationService = _interopRequireDefault(require("./ValidationService.js"));
var _Stream = _interopRequireDefault(require("./Stream.js"));
var _PROVIDERS = _interopRequireDefault(require("./PROVIDERS.js"));
var _ResourceLimiter = _interopRequireDefault(require("./ResourceLimiter.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
// Add configuration validation
function validateProxyConfig(config) {
  var errors = [];

  // Helper to validate numeric limits
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

  // Check for unknown configuration keys
  var validKeys = new Set(['port', 'corsOrigins', 'maxRequestSize', 'timeout', 'debug', 'verbose', 'globalRequestsPerMinute', 'globalTokensPerMinute', 'globalTokensPerHour', 'globalRequestsPerHour', 'rateLimitMessage', 'listen', 'errorMessages']);
  Object.keys(config).forEach(function (key) {
    if (!validKeys.has(key)) {
      errors.push("Unknown configuration key: \"".concat(key, "\". Did you mean one of: ").concat(Array.from(validKeys).join(', '), "?"));
    }
  });

  // Port validation
  validateLimit('port', config.port, 1);
  if (config.port > 65535) {
    errors.push("port must be <= 65535, got: ".concat(config.port));
  }

  // Rate limit validations
  validateLimit('globalRequestsPerMinute', config.globalRequestsPerMinute);
  validateLimit('globalTokensPerMinute', config.globalTokensPerMinute);
  validateLimit('globalTokensPerHour', config.globalTokensPerHour);
  validateLimit('globalRequestsPerHour', config.globalRequestsPerHour);

  // Timeout validation
  validateLimit('timeout', config.timeout, 100);
  if (config.timeout && config.timeout > 300000) {
    // 5 minutes max
    errors.push("timeout must be <= 300000ms, got: ".concat(config.timeout, "ms"));
  }

  // CORS validation
  if (config.corsOrigins && typeof config.corsOrigins !== 'string' && !Array.isArray(config.corsOrigins)) {
    errors.push('corsOrigins must be a string or array');
  }

  // Max request size validation
  if (config.maxRequestSize) {
    validateLimit('maxRequestSize', config.maxRequestSize, 100);
    if (config.maxRequestSize > 1024 * 1024) {
      // 1MB max
      errors.push("maxRequestSize must be <= 1048576 bytes, got: ".concat(config.maxRequestSize));
    }
  }
  if (errors.length > 0) {
    throw new Error('Invalid proxy configuration:\n- ' + errors.join('\n- '));
  }
  return config;
}

/**
 * Express server that acts as a proxy between browser clients and LLM APIs.
 * 
 * Responsibilities:
 * - Handles HTTP/SSE connections from browsers
 * - Validates incoming requests
 * - Routes requests to StreamManager
 * - Manages CORS and security
 * - Handles graceful shutdown
 * 
 * Provides a secure way for browser clients to access LLM APIs without
 * exposing API keys.
 * 
 * @example
 * // Start proxy server
 * createServer({
 *   port: 3124,
 *   corsOrigins: '*'
 * });
 */
function createServer() {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  // Validate configuration before proceeding
  try {
    validateProxyConfig(config);
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', error.message); // Red error text
    throw error;
  }
  var app = (0, _express["default"])();
  var port = config.port || process.env.PORT || 3124;
  var streamManager = new _StreamManager["default"](config);

  // Initialize global resource limiter with proxy-wide constraints
  var globalLimiter = new _ResourceLimiter["default"]({
    rpm: config.globalRequestsPerMinute ? {
      limit: config.globalRequestsPerMinute,
      window: 60000 // 1 minute
    } : null,
    tpm: config.globalTokensPerMinute ? {
      limit: config.globalTokensPerMinute,
      window: 60000
    } : null,
    tph: config.globalTokensPerHour ? {
      limit: config.globalTokensPerHour,
      window: 3600000 // 1 hour
    } : null,
    rph: config.globalRequestsPerHour ? {
      limit: config.globalRequestsPerHour,
      window: 3600000
    } : null
  });
  var corsOptions = {
    origin: config.corsOrigins || '*',
    // all by default
    methods: ['GET', 'POST'],
    // Allowed HTTP methods
    allowedHeaders: ['Content-Type'],
    // Allowed headers
    credentials: true // Allow sending credentials (cookies, etc.)
  };
  app.use((0, _cors["default"])(corsOptions));
  app.use(_express["default"].json());
  console.log('Starting Proxy Server with config', config, 'Port:', port);
  app.post('/api/stream', /*#__PURE__*/function () {
    var _ref = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee(req, res) {
      var _req$body, messages, _req$body$model, model, max_tokens, maxTokens, temperature, top_p, topP, presence_penalty, presencePenalty, errorMessages, fakeDelay, stop, cache, stream, errorMessagesConfig, rateLimitMessage, tokenEstimate, limitCheck, theStream, errorResponse;
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            console.log('Stream request', req.body);
            _context.prev = 1;
            _req$body = req.body, messages = _req$body.messages, _req$body$model = _req$body.model, model = _req$body$model === void 0 ? ['claude:good', 'openai:good', 'togetherai:good', 'claude:fast', 'openai:fast', 'togetherai:fast'] : _req$body$model, max_tokens = _req$body.max_tokens, maxTokens = _req$body.maxTokens, temperature = _req$body.temperature, top_p = _req$body.top_p, topP = _req$body.topP, presence_penalty = _req$body.presence_penalty, presencePenalty = _req$body.presencePenalty, errorMessages = _req$body.errorMessages, fakeDelay = _req$body.fakeDelay, stop = _req$body.stop, cache = _req$body.cache, stream = _req$body.stream; // Fall back to proxy level error message configuration
            errorMessagesConfig = _objectSpread(_objectSpread({}, config.errorMessages || {}), errorMessages || {});
            rateLimitMessage = errorMessagesConfig.rateLimitExceeded || 'Please try again later';
            _context.prev = 5;
            // Validate all inputs
            _ValidationService["default"].validateMessages(messages);
            _ValidationService["default"].validateModel(model, _PROVIDERS["default"]);
            _ValidationService["default"].validateParameters({
              temperature: temperature,
              max_tokens: max_tokens,
              maxTokens: maxTokens,
              top_p: top_p,
              topP: topP,
              presence_penalty: presence_penalty,
              presencePenalty: presencePenalty,
              stream: stream,
              cache: cache
            });
            _context.next = 14;
            break;
          case 11:
            _context.prev = 11;
            _context.t0 = _context["catch"](5);
            return _context.abrupt("return", res.status(400).json({
              error: _context.t0.message,
              code: _context.t0.code || 'VALIDATION_ERROR',
              details: _context.t0.details
            }));
          case 14:
            // Check global limits before processing request
            tokenEstimate = req.body.messages ? req.body.messages.reduce(function (acc, m) {
              return acc + m.content.length / 3;
            }, 0) : 0;
            limitCheck = globalLimiter.checkLimits({
              rpm: 1,
              tpm: tokenEstimate,
              tph: tokenEstimate,
              rph: 1
            });
            if (limitCheck.allowed) {
              _context.next = 18;
              break;
            }
            return _context.abrupt("return", res.status(429).json({
              error: 'Global rate limit exceeded',
              code: 'GLOBAL_RATE_LIMIT',
              limits: limitCheck.limits,
              message: rateLimitMessage
            }));
          case 18:
            // Consume the resources if check passed
            globalLimiter.consume({
              rpm: 1,
              tpm: tokenEstimate,
              tph: tokenEstimate,
              rph: 1
            });
            res.writeHead(200, {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive'
            });
            console.log('Error messages config:', errorMessagesConfig);
            _context.next = 23;
            return (0, _Stream["default"])({
              messages: messages,
              max_tokens: max_tokens,
              maxTokens: maxTokens,
              temperature: temperature,
              top_p: top_p,
              topP: topP,
              presence_penalty: presence_penalty,
              presencePenalty: presencePenalty,
              errorMessages: errorMessagesConfig,
              stop: stop,
              fakeDelay: fakeDelay,
              model: model,
              cache: cache,
              stream: stream == null ? true : stream
            });
          case 23:
            theStream = _context.sent;
            _context.next = 26;
            return streamManager.createStream(theStream, res);
          case 26:
            _context.next = 36;
            break;
          case 28:
            _context.prev = 28;
            _context.t1 = _context["catch"](1);
            console.error('Error in stream request:', _context.t1);

            // Set error status code
            res.status(500);

            // Ensure proper SSE headers are set
            res.writeHead(500, {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive'
            });
            errorResponse = {
              error: 'Internal server error',
              code: _context.t1.code || 'INTERNAL_ERROR',
              message: _context.t1.message
            }; // Make sure we're sending a proper SSE event
            res.write("event: error\ndata: ".concat(JSON.stringify(errorResponse), "\n\n"));
            res.end();
          case 36:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[1, 28], [5, 11]]);
    }));
    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }());

  // Add endpoint to check current rate limit status
  app.get('/api/limits', function (req, res) {
    var status = globalLimiter.checkLimits();
    res.json(status);
  });
  process.on('SIGTERM', /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          console.log('SIGTERM received. Closing all streams...');
          _context2.next = 3;
          return streamManager.closeAll();
        case 3:
          process.exit(0);
        case 4:
        case "end":
          return _context2.stop();
      }
    }, _callee2);
  })));
  if (config.listen !== false) {
    // Allow disabling listen for testing
    app.listen(port, function () {
      console.log("Proxy server listening on port ".concat(port));
    });
  }
  return app;
}
var _default = exports["default"] = createServer;