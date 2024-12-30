"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = createServer;
var _ProxyBase2 = require("../ProxyBase.js");
var _xmllmMain = require("../xmllm-main.js");
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _asyncIterator(r) { var n, t, o, e = 2; for ("undefined" != typeof Symbol && (t = Symbol.asyncIterator, o = Symbol.iterator); e--;) { if (t && null != (n = r[t])) return n.call(r); if (o && null != (n = r[o])) return new AsyncFromSyncIterator(n.call(r)); t = "@@asyncIterator", o = "@@iterator"; } throw new TypeError("Object is not async iterable"); }
function AsyncFromSyncIterator(r) { function AsyncFromSyncIteratorContinuation(r) { if (Object(r) !== r) return Promise.reject(new TypeError(r + " is not an object.")); var n = r.done; return Promise.resolve(r.value).then(function (r) { return { value: r, done: n }; }); } return AsyncFromSyncIterator = function AsyncFromSyncIterator(r) { this.s = r, this.n = r.next; }, AsyncFromSyncIterator.prototype = { s: null, n: null, next: function next() { return AsyncFromSyncIteratorContinuation(this.n.apply(this.s, arguments)); }, "return": function _return(r) { var n = this.s["return"]; return void 0 === n ? Promise.resolve({ value: r, done: !0 }) : AsyncFromSyncIteratorContinuation(n.apply(this.s, arguments)); }, "throw": function _throw(r) { var n = this.s["return"]; return void 0 === n ? Promise.reject(r) : AsyncFromSyncIteratorContinuation(n.apply(this.s, arguments)); } }, new AsyncFromSyncIterator(r); }
var COT_SCHEMA = {
  thinking: String,
  draft_response: String,
  response_metrics: String,
  improvement_strategy: String,
  final_response: String
};
var SYSTEM_PROMPT = "You are a helpful AI assistant that thinks through problems step by step. You will reply in <draft_response/>, then <response_metrics/> (where you will consider appropriate ways to judge your draft), <improvement_strategy>, then finally <final_response/> which will internalize and improve upon the analysis.";
var CoTProxy = /*#__PURE__*/function (_ProxyBase) {
  function CoTProxy() {
    _classCallCheck(this, CoTProxy);
    return _callSuper(this, CoTProxy, arguments);
  }
  _inherits(CoTProxy, _ProxyBase);
  return _createClass(CoTProxy, [{
    key: "handleStreaming",
    value: function () {
      var _handleStreaming = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3(data, res) {
        var _this = this;
        var messages, _data$temperature, temperature, _data$max_tokens, max_tokens, maxTokens, system, _data$stream, stream, model, cotStream, finalResponse, _iteratorAbruptCompletion, _didIteratorError, _iteratorError, _iterator, _step, chunk, processedStream;
        return _regeneratorRuntime().wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              messages = data.messages, _data$temperature = data.temperature, temperature = _data$temperature === void 0 ? 0.7 : _data$temperature, _data$max_tokens = data.max_tokens, max_tokens = _data$max_tokens === void 0 ? 2000 : _data$max_tokens, maxTokens = data.maxTokens, system = data.system, _data$stream = data.stream, stream = _data$stream === void 0 ? false : _data$stream;
              model = ['anthropic:fast', 'openai:fast']; // Set headers based on streaming mode
              res.writeHead(200, _objectSpread({
                'Content-Type': stream ? 'text/event-stream' : 'application/json'
              }, stream && {
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
              }));
              console.log('Ending CoT payload', {
                messages: messages,
                model: model,
                temperature: temperature,
                max_tokens: max_tokens,
                maxTokens: maxTokens,
                system: system,
                stream: stream
              });

              // Process through Chain of Thought
              _context3.next = 6;
              return (0, _xmllmMain.xmllm)(function (_ref) {
                var prompt = _ref.prompt;
                return [prompt({
                  messages: messages,
                  model: model,
                  schema: COT_SCHEMA,
                  system: system || _this.getDefaultSystemPrompt(),
                  temperature: temperature,
                  max_tokens: max_tokens || maxTokens,
                  stream: stream
                }),
                /*#__PURE__*/
                // Handle streaming vs non-streaming
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
            case 6:
              cotStream = _context3.sent;
              if (stream) {
                _context3.next = 39;
                break;
              }
              // For non-streaming, collect all chunks and send final response
              finalResponse = '';
              _iteratorAbruptCompletion = false;
              _didIteratorError = false;
              _context3.prev = 11;
              _iterator = _asyncIterator(cotStream);
            case 13:
              _context3.next = 15;
              return _iterator.next();
            case 15:
              if (!(_iteratorAbruptCompletion = !(_step = _context3.sent).done)) {
                _context3.next = 21;
                break;
              }
              chunk = _step.value;
              if (typeof chunk === 'string') {
                finalResponse = chunk; // Keep last chunk as final response
              }
            case 18:
              _iteratorAbruptCompletion = false;
              _context3.next = 13;
              break;
            case 21:
              _context3.next = 27;
              break;
            case 23:
              _context3.prev = 23;
              _context3.t0 = _context3["catch"](11);
              _didIteratorError = true;
              _iteratorError = _context3.t0;
            case 27:
              _context3.prev = 27;
              _context3.prev = 28;
              if (!(_iteratorAbruptCompletion && _iterator["return"] != null)) {
                _context3.next = 32;
                break;
              }
              _context3.next = 32;
              return _iterator["return"]();
            case 32:
              _context3.prev = 32;
              if (!_didIteratorError) {
                _context3.next = 35;
                break;
              }
              throw _iteratorError;
            case 35:
              return _context3.finish(32);
            case 36:
              return _context3.finish(27);
            case 37:
              res.end(JSON.stringify({
                id: "chatcmpl-".concat(Date.now()),
                object: 'chat.completion',
                created: Math.floor(Date.now() / 1000),
                model: Array.isArray(model) ? model[0] : model,
                choices: [{
                  index: 0,
                  message: {
                    role: 'assistant',
                    content: finalResponse
                  },
                  finish_reason: 'stop'
                }]
              }));
              return _context3.abrupt("return");
            case 39:
              // For streaming responses, use ReadableStream
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
              _context3.next = 42;
              return this.streamManager.createStream(processedStream, res);
            case 42:
            case "end":
              return _context3.stop();
          }
        }, _callee3, this, [[11, 23, 27, 37], [28,, 32, 36]]);
      }));
      function handleStreaming(_x, _x2) {
        return _handleStreaming.apply(this, arguments);
      }
      return handleStreaming;
    }()
  }, {
    key: "getDefaultSystemPrompt",
    value: function getDefaultSystemPrompt() {
      return SYSTEM_PROMPT;
    }
  }]);
}(_ProxyBase2.ProxyBase);
function createServer(config) {
  return new CoTProxy(config).listen();
}