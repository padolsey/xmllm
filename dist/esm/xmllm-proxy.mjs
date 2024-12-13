function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _asyncIterator(r) { var n, t, o, e = 2; for ("undefined" != typeof Symbol && (t = Symbol.asyncIterator, o = Symbol.iterator); e--;) { if (t && null != (n = r[t])) return n.call(r); if (o && null != (n = r[o])) return new AsyncFromSyncIterator(n.call(r)); t = "@@asyncIterator", o = "@@iterator"; } throw new TypeError("Object is not async iterable"); }
function AsyncFromSyncIterator(r) { function AsyncFromSyncIteratorContinuation(r) { if (Object(r) !== r) return Promise.reject(new TypeError(r + " is not an object.")); var n = r.done; return Promise.resolve(r.value).then(function (r) { return { value: r, done: n }; }); } return AsyncFromSyncIterator = function AsyncFromSyncIterator(r) { this.s = r, this.n = r.next; }, AsyncFromSyncIterator.prototype = { s: null, n: null, next: function next() { return AsyncFromSyncIteratorContinuation(this.n.apply(this.s, arguments)); }, "return": function _return(r) { var n = this.s["return"]; return void 0 === n ? Promise.resolve({ value: r, done: !0 }) : AsyncFromSyncIteratorContinuation(n.apply(this.s, arguments)); }, "throw": function _throw(r) { var n = this.s["return"]; return void 0 === n ? Promise.reject(r) : AsyncFromSyncIteratorContinuation(n.apply(this.s, arguments)); } }, new AsyncFromSyncIterator(r); }
import http from 'http';
import StreamManager from './StreamManager.mjs';
import ValidationService from './ValidationService.mjs';
import Stream from './Stream.mjs';
import PROVIDERS from './PROVIDERS.mjs';
import ResourceLimiter from './ResourceLimiter.mjs';
import { pipeline } from './xmllm.mjs';

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
 * HTTP server that acts as a proxy between browser clients and LLM APIs.
 * Uses Node's built-in http module instead of Express.
 */
function createServer() {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  // Validate configuration before proceeding
  try {
    validateProxyConfig(config);
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', error.message);
    throw error;
  }
  var port = config.port || process.env.PORT || 3124;
  var streamManager = new StreamManager(config);
  var maxRequestSize = config.maxRequestSize || 1048576; // Default 1MB
  var timeout = config.timeout || 30000; // Default 30s

  // Initialize global resource limiter
  var globalLimiter = new ResourceLimiter({
    rpm: config.globalRequestsPerMinute ? {
      limit: config.globalRequestsPerMinute,
      window: 60000
    } : null,
    tpm: config.globalTokensPerMinute ? {
      limit: config.globalTokensPerMinute,
      window: 60000
    } : null,
    tph: config.globalTokensPerHour ? {
      limit: config.globalTokensPerHour,
      window: 3600000
    } : null,
    rph: config.globalRequestsPerHour ? {
      limit: config.globalRequestsPerHour,
      window: 3600000
    } : null
  });
  var server = http.createServer(/*#__PURE__*/function () {
    var _ref = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee(req, res) {
      var requestOrigin, allowedOrigins, status, buffers, totalSize, _iteratorAbruptCompletion, _didIteratorError, _iteratorError, _iterator, _step, chunk, data, _data, messages, _data$model, model, max_tokens, maxTokens, temperature, top_p, topP, presence_penalty, presencePenalty, errorMessages, fakeDelay, stop, cache, stream, normalizedParams, errorMessagesConfig, rateLimitMessage, tokenEstimate, limitCheck, theStream, errorResponse;
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            // Set timeout
            req.setTimeout(timeout);

            // Handle CORS with proper origin checking
            requestOrigin = req.headers.origin;
            allowedOrigins = Array.isArray(config.corsOrigins) ? config.corsOrigins : [config.corsOrigins || '*'];
            if (allowedOrigins.includes('*')) {
              // For wildcard, echo back the requesting origin but don't allow credentials
              res.setHeader('Access-Control-Allow-Origin', requestOrigin || '*');
              res.setHeader('Access-Control-Allow-Credentials', 'false');
            } else if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
              // For specific allowed origins, allow credentials
              res.setHeader('Access-Control-Allow-Origin', requestOrigin);
              res.setHeader('Access-Control-Allow-Credentials', 'true');
            } else {
              // For disallowed origins
              res.setHeader('Access-Control-Allow-Origin', 'null');
              res.setHeader('Access-Control-Allow-Credentials', 'false');
            }
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

            // Handle preflight requests
            if (!(req.method === 'OPTIONS')) {
              _context.next = 10;
              break;
            }
            res.writeHead(204);
            res.end();
            return _context.abrupt("return");
          case 10:
            if (!(req.url === '/api/limits')) {
              _context.next = 19;
              break;
            }
            if (!(req.method !== 'GET')) {
              _context.next = 15;
              break;
            }
            res.writeHead(405, {
              'Content-Type': 'application/json'
            });
            res.end(JSON.stringify({
              error: 'Method not allowed',
              code: 'METHOD_NOT_ALLOWED'
            }));
            return _context.abrupt("return");
          case 15:
            status = globalLimiter.checkLimits();
            res.writeHead(200, {
              'Content-Type': 'application/json'
            });
            res.end(JSON.stringify(status));
            return _context.abrupt("return");
          case 19:
            if (!(req.url === '/api/stream')) {
              _context.next = 117;
              break;
            }
            if (!(req.method !== 'POST')) {
              _context.next = 24;
              break;
            }
            res.writeHead(405, {
              'Content-Type': 'application/json'
            });
            res.end(JSON.stringify({
              error: 'Method not allowed',
              code: 'METHOD_NOT_ALLOWED'
            }));
            return _context.abrupt("return");
          case 24:
            _context.prev = 24;
            // Parse JSON body with size limit
            buffers = [];
            totalSize = 0;
            _context.prev = 27;
            _iteratorAbruptCompletion = false;
            _didIteratorError = false;
            _context.prev = 30;
            _iterator = _asyncIterator(req);
          case 32:
            _context.next = 34;
            return _iterator.next();
          case 34:
            if (!(_iteratorAbruptCompletion = !(_step = _context.sent).done)) {
              _context.next = 45;
              break;
            }
            chunk = _step.value;
            totalSize += chunk.length;
            if (!(totalSize > maxRequestSize)) {
              _context.next = 41;
              break;
            }
            res.writeHead(413, {
              'Content-Type': 'application/json'
            });
            res.end(JSON.stringify({
              error: 'Request entity too large',
              code: 'PAYLOAD_TOO_LARGE',
              maxSize: maxRequestSize
            }));
            return _context.abrupt("return");
          case 41:
            buffers.push(chunk);
          case 42:
            _iteratorAbruptCompletion = false;
            _context.next = 32;
            break;
          case 45:
            _context.next = 51;
            break;
          case 47:
            _context.prev = 47;
            _context.t0 = _context["catch"](30);
            _didIteratorError = true;
            _iteratorError = _context.t0;
          case 51:
            _context.prev = 51;
            _context.prev = 52;
            if (!(_iteratorAbruptCompletion && _iterator["return"] != null)) {
              _context.next = 56;
              break;
            }
            _context.next = 56;
            return _iterator["return"]();
          case 56:
            _context.prev = 56;
            if (!_didIteratorError) {
              _context.next = 59;
              break;
            }
            throw _iteratorError;
          case 59:
            return _context.finish(56);
          case 60:
            return _context.finish(51);
          case 61:
            _context.next = 68;
            break;
          case 63:
            _context.prev = 63;
            _context.t1 = _context["catch"](27);
            res.writeHead(400, {
              'Content-Type': 'application/json'
            });
            res.end(JSON.stringify({
              error: 'Error reading request body',
              code: 'INVALID_REQUEST'
            }));
            return _context.abrupt("return");
          case 68:
            _context.prev = 68;
            data = JSON.parse(Buffer.concat(buffers).toString());
            _context.next = 77;
            break;
          case 72:
            _context.prev = 72;
            _context.t2 = _context["catch"](68);
            res.writeHead(400, {
              'Content-Type': 'application/json'
            });
            res.end(JSON.stringify({
              error: 'Invalid JSON in request body',
              code: 'INVALID_JSON'
            }));
            return _context.abrupt("return");
          case 77:
            _data = data, messages = _data.messages, _data$model = _data.model, model = _data$model === void 0 ? ['claude:good', 'openai:good', 'togetherai:good', 'claude:fast', 'openai:fast', 'togetherai:fast'] : _data$model, max_tokens = _data.max_tokens, maxTokens = _data.maxTokens, temperature = _data.temperature, top_p = _data.top_p, topP = _data.topP, presence_penalty = _data.presence_penalty, presencePenalty = _data.presencePenalty, errorMessages = _data.errorMessages, fakeDelay = _data.fakeDelay, stop = _data.stop, cache = _data.cache, stream = _data.stream; // Normalize parameters
            normalizedParams = {
              max_tokens: max_tokens || maxTokens,
              top_p: top_p || topP,
              presence_penalty: presence_penalty || presencePenalty
            }; // Fall back to proxy level error message configuration
            errorMessagesConfig = _objectSpread(_objectSpread({}, config.errorMessages || {}), errorMessages || {});
            rateLimitMessage = errorMessagesConfig.rateLimitExceeded || 'Please try again later';
            _context.prev = 81;
            // Validate inputs
            ValidationService.validateMessages(messages);
            ValidationService.validateModel(model, PROVIDERS);
            ValidationService.validateLLMPayload(_objectSpread(_objectSpread({
              temperature: temperature
            }, normalizedParams), {}, {
              stream: stream,
              cache: cache
            }));
            _context.next = 92;
            break;
          case 87:
            _context.prev = 87;
            _context.t3 = _context["catch"](81);
            res.writeHead(400, {
              'Content-Type': 'application/json'
            });
            res.end(JSON.stringify({
              error: _context.t3.message,
              code: _context.t3.code || 'VALIDATION_ERROR',
              details: _context.t3.details
            }));
            return _context.abrupt("return");
          case 92:
            // Check global limits
            tokenEstimate = messages ? messages.reduce(function (acc, m) {
              return acc + m.content.length / 3;
            }, 0) : 0;
            limitCheck = globalLimiter.checkLimits({
              rpm: 1,
              tpm: tokenEstimate,
              tph: tokenEstimate,
              rph: 1
            });
            if (limitCheck.allowed) {
              _context.next = 98;
              break;
            }
            res.writeHead(429, {
              'Content-Type': 'application/json'
            });
            res.end(JSON.stringify({
              error: 'Global rate limit exceeded',
              code: 'GLOBAL_RATE_LIMIT',
              limits: limitCheck.limits,
              message: rateLimitMessage
            }));
            return _context.abrupt("return");
          case 98:
            // Consume resources
            globalLimiter.consume({
              rpm: 1,
              tpm: tokenEstimate,
              tph: tokenEstimate,
              rph: 1
            });

            // Set SSE headers
            res.writeHead(200, {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive'
            });
            _context.next = 102;
            return Stream(_objectSpread(_objectSpread({
              messages: messages
            }, normalizedParams), {}, {
              temperature: temperature,
              errorMessages: errorMessagesConfig,
              stop: stop,
              fakeDelay: fakeDelay,
              model: model,
              cache: cache,
              stream: stream == null ? true : stream
            }));
          case 102:
            theStream = _context.sent;
            _context.next = 105;
            return streamManager.createStream(theStream, res);
          case 105:
            _context.next = 116;
            break;
          case 107:
            _context.prev = 107;
            _context.t4 = _context["catch"](24);
            if (res.headersSent) {
              _context.next = 113;
              break;
            }
            res.writeHead(500, {
              'Content-Type': 'application/json'
            });
            res.end(JSON.stringify({
              error: 'Internal server error',
              code: _context.t4.code || 'INTERNAL_ERROR',
              message: _context.t4.message
            }));
            return _context.abrupt("return");
          case 113:
            // If headers were sent (SSE started), send error event
            errorResponse = {
              error: 'Stream error',
              code: _context.t4.code || 'STREAM_ERROR',
              message: _context.t4.message
            };
            res.write("event: error\ndata: ".concat(JSON.stringify(errorResponse), "\n\n"));
            res.end();
          case 116:
            return _context.abrupt("return");
          case 117:
            // Handle unknown endpoints
            res.writeHead(404, {
              'Content-Type': 'application/json'
            });
            res.end(JSON.stringify({
              error: 'Not found',
              code: 'NOT_FOUND'
            }));
          case 119:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[24, 107], [27, 63], [30, 47, 51, 61], [52,, 56, 60], [68, 72], [81, 87]]);
    }));
    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }());

  // Handle server errors
  server.on('error', function (error) {
    console.error('Server error:', error);
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
    server.listen(port, function () {
      console.log("Proxy server listening on port ".concat(port));
    });
  }
  return server;
}
export default createServer;