"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _http = _interopRequireDefault(require("http"));
var _xmllmMain = require("../src/xmllm-main.js");
var _StreamManager = _interopRequireDefault(require("../src/StreamManager.js"));
var _ValidationService = _interopRequireDefault(require("../src/ValidationService.js"));
var _Stream = _interopRequireDefault(require("../src/Stream.js"));
var _PROVIDERS = _interopRequireDefault(require("../src/PROVIDERS.js"));
var _ResourceLimiter = _interopRequireDefault(require("../src/ResourceLimiter.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _asyncIterator(r) { var n, t, o, e = 2; for ("undefined" != typeof Symbol && (t = Symbol.asyncIterator, o = Symbol.iterator); e--;) { if (t && null != (n = r[t])) return n.call(r); if (o && null != (n = r[o])) return new AsyncFromSyncIterator(n.call(r)); t = "@@asyncIterator", o = "@@iterator"; } throw new TypeError("Object is not async iterable"); }
function AsyncFromSyncIterator(r) { function AsyncFromSyncIteratorContinuation(r) { if (Object(r) !== r) return Promise.reject(new TypeError(r + " is not an object.")); var n = r.done; return Promise.resolve(r.value).then(function (r) { return { value: r, done: n }; }); } return AsyncFromSyncIterator = function AsyncFromSyncIterator(r) { this.s = r, this.n = r.next; }, AsyncFromSyncIterator.prototype = { s: null, n: null, next: function next() { return AsyncFromSyncIteratorContinuation(this.n.apply(this.s, arguments)); }, "return": function _return(r) { var n = this.s["return"]; return void 0 === n ? Promise.resolve({ value: r, done: !0 }) : AsyncFromSyncIteratorContinuation(n.apply(this.s, arguments)); }, "throw": function _throw(r) { var n = this.s["return"]; return void 0 === n ? Promise.reject(r) : AsyncFromSyncIteratorContinuation(n.apply(this.s, arguments)); } }, new AsyncFromSyncIterator(r); }
(0, _xmllmMain.configure)({
  logging: {
    level: 'INFO'
  }
});

// Chain of Thought schema for processing requests
var COT_SCHEMA = {
  thinking: {
    step: [{
      $number: Number,
      $text: String
    }]
  },
  draft_response: String,
  response_metrics: {
    clarity: Number,
    relevance: Number,
    completeness: Number,
    analysis: String
  },
  improvement_strategy: {
    point: [String]
  },
  final_response: String
};
function createServer() {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var port = config.port || process.env.PORT || 3124;
  var streamManager = new _StreamManager["default"](config);
  var maxRequestSize = config.maxRequestSize || 1048576; // Default 1MB
  var timeout = config.timeout || 30000; // Default 30s

  // Initialize global resource limiter
  var globalLimiter = new _ResourceLimiter["default"]({
    rpm: config.globalRequestsPerMinute ? {
      limit: config.globalRequestsPerMinute,
      window: 60000
    } : null,
    tpm: config.globalTokensPerMinute ? {
      limit: config.globalTokensPerMinute,
      window: 60000
    } : null
  });
  var server = _http["default"].createServer(/*#__PURE__*/function () {
    var _ref = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3(req, res) {
      var buffers, totalSize, _iteratorAbruptCompletion, _didIteratorError, _iteratorError, _iterator, _step, chunk, data, messages, model, _data$temperature, temperature, max_tokens, maxTokens, system, limitCheck, cotStream, processedStream;
      return _regeneratorRuntime().wrap(function _callee3$(_context3) {
        while (1) switch (_context3.prev = _context3.next) {
          case 0:
            // Set timeout
            req.setTimeout(timeout);

            // Handle CORS
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            if (!(req.method === 'OPTIONS')) {
              _context3.next = 8;
              break;
            }
            res.writeHead(204);
            res.end();
            return _context3.abrupt("return");
          case 8:
            if (!(req.url === '/api/stream' && req.method === 'POST')) {
              _context3.next = 70;
              break;
            }
            _context3.prev = 9;
            // Parse JSON body with size limit
            buffers = [];
            totalSize = 0;
            _iteratorAbruptCompletion = false;
            _didIteratorError = false;
            _context3.prev = 14;
            _iterator = _asyncIterator(req);
          case 16:
            _context3.next = 18;
            return _iterator.next();
          case 18:
            if (!(_iteratorAbruptCompletion = !(_step = _context3.sent).done)) {
              _context3.next = 29;
              break;
            }
            chunk = _step.value;
            totalSize += chunk.length;
            if (!(totalSize > maxRequestSize)) {
              _context3.next = 25;
              break;
            }
            res.writeHead(413, {
              'Content-Type': 'application/json'
            });
            res.end(JSON.stringify({
              error: 'Request entity too large',
              maxSize: maxRequestSize
            }));
            return _context3.abrupt("return");
          case 25:
            buffers.push(chunk);
          case 26:
            _iteratorAbruptCompletion = false;
            _context3.next = 16;
            break;
          case 29:
            _context3.next = 35;
            break;
          case 31:
            _context3.prev = 31;
            _context3.t0 = _context3["catch"](14);
            _didIteratorError = true;
            _iteratorError = _context3.t0;
          case 35:
            _context3.prev = 35;
            _context3.prev = 36;
            if (!(_iteratorAbruptCompletion && _iterator["return"] != null)) {
              _context3.next = 40;
              break;
            }
            _context3.next = 40;
            return _iterator["return"]();
          case 40:
            _context3.prev = 40;
            if (!_didIteratorError) {
              _context3.next = 43;
              break;
            }
            throw _iteratorError;
          case 43:
            return _context3.finish(40);
          case 44:
            return _context3.finish(35);
          case 45:
            data = JSON.parse(Buffer.concat(buffers).toString());
            messages = data.messages, model = data.model, _data$temperature = data.temperature, temperature = _data$temperature === void 0 ? 0.7 : _data$temperature, max_tokens = data.max_tokens, maxTokens = data.maxTokens, system = data.system; // Check rate limits
            limitCheck = globalLimiter.checkLimits({
              rpm: 1,
              tpm: messages.reduce(function (acc, m) {
                return acc + m.content.length / 3;
              }, 0)
            });
            if (limitCheck.allowed) {
              _context3.next = 52;
              break;
            }
            res.writeHead(429, {
              'Content-Type': 'application/json'
            });
            res.end(JSON.stringify({
              error: 'Rate limit exceeded',
              limits: limitCheck.limits
            }));
            return _context3.abrupt("return");
          case 52:
            // Set SSE headers
            res.writeHead(200, {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive'
            });

            // Process through Chain of Thought
            _context3.next = 55;
            return (0, _xmllmMain.xmllm)(function (_ref2) {
              var prompt = _ref2.prompt;
              return [prompt({
                messages: messages,
                model: model,
                schema: COT_SCHEMA,
                system: "You are a helpful AI assistant that thinks through problems step by step.\n\nIMPORTANT: For every response, follow this exact process in order:\n\n1. <thinking>\n   - Break down the problem into clear steps\n   - Number each step with the $number attribute\n   - Think through implications and edge cases\n   - Consider relevant context and constraints\n</thinking>\n\n2. <draft_response>\n   - Write an initial response based on your thinking\n   - Be direct and clear\n   - Focus on addressing the core question\n</draft_response>\n\n3. <response_metrics>\n   - Evaluate your draft on these scales (0-1):\n     * clarity: How clear and understandable is it?\n     * relevance: How well does it address the question?\n     * completeness: How thorough is the response?\n   - Provide a brief analysis of strengths/weaknesses\n</response_metrics>\n\n4. <improvement_strategy>\n   - List specific points for improving the response\n   - Consider what's missing or could be clearer\n   - Think about what would make it more helpful\n</improvement_strategy>\n\n5. <final_response>\n   - Incorporate the improvements\n   - Ensure it's complete and well-structured\n   - Make it as helpful as possible while being concise\n</final_response>\n\nRemember: Each section builds on the previous ones to create a thorough, well-reasoned response.",
                temperature: temperature,
                max_tokens: max_tokens || maxTokens
              }),
              /*#__PURE__*/
              // Only stream the final response
              _regeneratorRuntime().mark(function _callee(result) {
                return _regeneratorRuntime().wrap(function _callee$(_context) {
                  while (1) switch (_context.prev = _context.next) {
                    case 0:
                      if (!result.final_response) {
                        _context.next = 3;
                        break;
                      }
                      _context.next = 3;
                      return result.final_response;
                    case 3:
                    case "end":
                      return _context.stop();
                  }
                }, _callee);
              })];
            });
          case 55:
            cotStream = _context3.sent;
            // Stream the processed response
            processedStream = new ReadableStream({
              start: function start(controller) {
                return _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
                  var _iteratorAbruptCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, _chunk;
                  return _regeneratorRuntime().wrap(function _callee2$(_context2) {
                    while (1) switch (_context2.prev = _context2.next) {
                      case 0:
                        _context2.prev = 0;
                        _iteratorAbruptCompletion2 = false;
                        _didIteratorError2 = false;
                        _context2.prev = 3;
                        _iterator2 = _asyncIterator(cotStream);
                      case 5:
                        _context2.next = 7;
                        return _iterator2.next();
                      case 7:
                        if (!(_iteratorAbruptCompletion2 = !(_step2 = _context2.sent).done)) {
                          _context2.next = 13;
                          break;
                        }
                        _chunk = _step2.value;
                        if (typeof _chunk === 'string') {
                          controller.enqueue(new TextEncoder().encode(_chunk));
                        }
                      case 10:
                        _iteratorAbruptCompletion2 = false;
                        _context2.next = 5;
                        break;
                      case 13:
                        _context2.next = 19;
                        break;
                      case 15:
                        _context2.prev = 15;
                        _context2.t0 = _context2["catch"](3);
                        _didIteratorError2 = true;
                        _iteratorError2 = _context2.t0;
                      case 19:
                        _context2.prev = 19;
                        _context2.prev = 20;
                        if (!(_iteratorAbruptCompletion2 && _iterator2["return"] != null)) {
                          _context2.next = 24;
                          break;
                        }
                        _context2.next = 24;
                        return _iterator2["return"]();
                      case 24:
                        _context2.prev = 24;
                        if (!_didIteratorError2) {
                          _context2.next = 27;
                          break;
                        }
                        throw _iteratorError2;
                      case 27:
                        return _context2.finish(24);
                      case 28:
                        return _context2.finish(19);
                      case 29:
                        controller.close();
                        _context2.next = 35;
                        break;
                      case 32:
                        _context2.prev = 32;
                        _context2.t1 = _context2["catch"](0);
                        controller.error(_context2.t1);
                      case 35:
                      case "end":
                        return _context2.stop();
                    }
                  }, _callee2, null, [[0, 32], [3, 15, 19, 29], [20,, 24, 28]]);
                }))();
              }
            });
            _context3.next = 59;
            return streamManager.createStream(processedStream, res);
          case 59:
            _context3.next = 69;
            break;
          case 61:
            _context3.prev = 61;
            _context3.t1 = _context3["catch"](9);
            if (res.headersSent) {
              _context3.next = 67;
              break;
            }
            res.writeHead(500, {
              'Content-Type': 'application/json'
            });
            res.end(JSON.stringify({
              error: 'Internal server error',
              message: _context3.t1.message
            }));
            return _context3.abrupt("return");
          case 67:
            res.write("event: error\ndata: ".concat(JSON.stringify({
              error: 'Stream error',
              message: _context3.t1.message
            }), "\n\n"));
            res.end();
          case 69:
            return _context3.abrupt("return");
          case 70:
            // Handle unknown endpoints
            res.writeHead(404, {
              'Content-Type': 'application/json'
            });
            res.end(JSON.stringify({
              error: 'Not found'
            }));
          case 72:
          case "end":
            return _context3.stop();
        }
      }, _callee3, null, [[9, 61], [14, 31, 35, 45], [36,, 40, 44]]);
    }));
    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }());

  // Handle server errors
  server.on('error', function (error) {
    console.error('Server error:', error);
  });
  if (config.listen !== false) {
    server.listen(port, function () {
      console.log("Chain of Thought proxy server listening on port ".concat(port));
    });
  }
  return server;
}
var _default = exports["default"] = createServer;