"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = APIStream;
var _crypto = require("crypto");
var _mainCache = require("./mainCache.js");
var _Logger = _interopRequireDefault(require("./Logger.js"));
var _ProviderManager = _interopRequireDefault(require("./ProviderManager.js"));
var _config = require("./config.js");
var _ProviderErrors = require("./errors/ProviderErrors.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
var _PQueue = import('p-queue');
var logger = new _Logger["default"]('APIStream');
var queue;
var ongoingRequests = new Map();
var DEFAULT_CONCURRENCY = 2;
var DEFAULT_WAIT_MESSAGE = "";
var DEFAULT_WAIT_MESSAGE_DELAY = 10000; // 10 seconds
var DEFAULT_RETRY_MAX = 3;
var DEFAULT_RETRY_START_DELAY = 1000; // 1 second
var DEFAULT_RETRY_BACKOFF_MULTIPLIER = 2;

// Add this line to create a delay function
var delay = function delay(ms) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, ms);
  });
};
var CACHE_VERSION = '1.0';

/**
 * Coordinates high-level stream operations and provider management.
 * 
 * Responsibilities:
 * - Request queueing and concurrency control
 * - Response caching
 * - Provider selection via ProviderManager
 * - Stream initialization and error handling
 * 
 * Sits between the client interface and provider layer, managing the flow
 * of requests and responses.
 * 
 * @example
 * const stream = await APIStream({
 *   messages: [{role: 'user', content: 'Hello'}],
 *   model: 'anthropic:fast'
 * });
 */
function APIStream(_x, _x2) {
  return _APIStream.apply(this, arguments);
}
function _APIStream() {
  _APIStream = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee4(payload, injectedProviderManager) {
    var PQueue, providerManager;
    return _regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return _PQueue;
        case 2:
          PQueue = _context4.sent["default"];
          providerManager = injectedProviderManager || new _ProviderManager["default"]();
          queue = queue || new PQueue({
            concurrency: payload.forcedConcurrency || DEFAULT_CONCURRENCY
          });
          return _context4.abrupt("return", queue.add(/*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3() {
            var encoder, content, cacheKeyParams, hash, cachedData, ongoingRequest, ongoingRequestStream, _ongoingRequestStream, _ongoingRequestStream2, stream1, stream2, waitMessageString, waitMessageDelay, retryMax, retryStartDelay, retryBackoffMultiplier;
            return _regeneratorRuntime().wrap(function _callee3$(_context3) {
              while (1) switch (_context3.prev = _context3.next) {
                case 0:
                  encoder = new TextEncoder();
                  content = '';
                  payload.stream = true;
                  if (typeof payload.model === 'string') {
                    payload.model = [payload.model];
                  }

                  // Extract relevant parameters for cache key
                  cacheKeyParams = _objectSpread({
                    _v: CACHE_VERSION,
                    messages: payload.messages,
                    model: payload.model,
                    temperature: payload.temperature || 0,
                    top_p: payload.top_p || 1,
                    presence_penalty: payload.presence_penalty || 0,
                    frequency_penalty: payload.frequency_penalty || 0
                  }, payload.system && {
                    system: payload.system
                  });
                  hash = (0, _crypto.createHash)('md5').update(JSON.stringify(cacheKeyParams)).digest('hex'); // Only check cache if caching is explicitly enabled
                  if (!(payload.cache === true)) {
                    _context3.next = 14;
                    break;
                  }
                  _context3.next = 9;
                  return (0, _mainCache.get)(hash);
                case 9:
                  cachedData = _context3.sent;
                  if (!cachedData) {
                    _context3.next = 14;
                    break;
                  }
                  cachedData = cachedData.value;
                  logger.log('OpenAIStream: cached', hash);
                  return _context3.abrupt("return", new ReadableStream({
                    start: function start(controller) {
                      controller.enqueue(encoder.encode(cachedData));
                      controller.close();
                    }
                  }));
                case 14:
                  ongoingRequest = ongoingRequests.get(hash);
                  if (!ongoingRequest) {
                    _context3.next = 23;
                    break;
                  }
                  logger.log('Request currently ongoing: we are awaiting and tee\'ing the stream', hash);
                  _context3.next = 19;
                  return ongoingRequest;
                case 19:
                  ongoingRequestStream = _context3.sent;
                  _ongoingRequestStream = ongoingRequestStream.tee(), _ongoingRequestStream2 = _slicedToArray(_ongoingRequestStream, 2), stream1 = _ongoingRequestStream2[0], stream2 = _ongoingRequestStream2[1];
                  ongoingRequests.set(hash, stream2);
                  return _context3.abrupt("return", stream1);
                case 23:
                  waitMessageString = payload.waitMessageString || DEFAULT_WAIT_MESSAGE;
                  waitMessageDelay = payload.waitMessageDelay || DEFAULT_WAIT_MESSAGE_DELAY;
                  retryMax = payload.retryMax || DEFAULT_RETRY_MAX;
                  retryStartDelay = payload.retryStartDelay || DEFAULT_RETRY_START_DELAY;
                  retryBackoffMultiplier = payload.retryBackoffMultiplier || DEFAULT_RETRY_BACKOFF_MULTIPLIER;
                  return _context3.abrupt("return", new ReadableStream({
                    start: function start(controller) {
                      return _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
                        var waitMessageSent, waitMessageTimer, stream, reader, _yield$reader$read, done, value, decodedValue, contentSize, _payload$errorMessage, _payload$errorMessage2, config, errorMessage;
                        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
                          while (1) switch (_context2.prev = _context2.next) {
                            case 0:
                              waitMessageSent = false;
                              if (waitMessageString && waitMessageDelay) {
                                waitMessageTimer = setTimeout(/*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
                                  return _regeneratorRuntime().wrap(function _callee$(_context) {
                                    while (1) switch (_context.prev = _context.next) {
                                      case 0:
                                        if (!waitMessageSent) {
                                          waitMessageSent = true;
                                          controller.enqueue(encoder.encode(waitMessageString));
                                        }
                                      case 1:
                                      case "end":
                                        return _context.stop();
                                    }
                                  }, _callee);
                                })), waitMessageDelay);
                              }
                              _context2.prev = 2;
                              if (!payload.fakeDelay) {
                                _context2.next = 6;
                                break;
                              }
                              _context2.next = 6;
                              return delay(payload.fakeDelay);
                            case 6:
                              _context2.next = 8;
                              return providerManager.streamRequest(_objectSpread(_objectSpread({}, payload), {}, {
                                retryMax: retryMax,
                                retryStartDelay: retryStartDelay,
                                retryBackoffMultiplier: retryBackoffMultiplier
                              }));
                            case 8:
                              stream = _context2.sent;
                              reader = stream.getReader();
                              if (waitMessageTimer) clearTimeout(waitMessageTimer);
                            case 11:
                              if (!true) {
                                _context2.next = 24;
                                break;
                              }
                              _context2.next = 14;
                              return reader.read();
                            case 14:
                              _yield$reader$read = _context2.sent;
                              done = _yield$reader$read.done;
                              value = _yield$reader$read.value;
                              if (!done) {
                                _context2.next = 19;
                                break;
                              }
                              return _context2.abrupt("break", 24);
                            case 19:
                              decodedValue = new TextDecoder().decode(value);
                              content += decodedValue; // Accumulate content
                              controller.enqueue(value);
                              _context2.next = 11;
                              break;
                            case 24:
                              if (!(payload.cache === true)) {
                                _context2.next = 32;
                                break;
                              }
                              contentSize = content.length;
                              if (!(contentSize <= _mainCache.DEFAULT_CONFIG.maxEntrySize)) {
                                _context2.next = 31;
                                break;
                              }
                              _context2.next = 29;
                              return (0, _mainCache.set)(hash, content);
                            case 29:
                              _context2.next = 32;
                              break;
                            case 31:
                              logger.warn("Content too large to cache (".concat(contentSize, " chars)"));
                            case 32:
                              _context2.next = 39;
                              break;
                            case 34:
                              _context2.prev = 34;
                              _context2.t0 = _context2["catch"](2);
                              logger.error('Error in stream:', _context2.t0);
                              if (waitMessageTimer) clearTimeout(waitMessageTimer);
                              if (!waitMessageSent) {
                                config = (0, _config.getConfig)();
                                errorMessage = _context2.t0 instanceof _ProviderErrors.ProviderRateLimitError ? (payload === null || payload === void 0 || (_payload$errorMessage = payload.errorMessages) === null || _payload$errorMessage === void 0 ? void 0 : _payload$errorMessage.rateLimitExceeded) || config.defaults.errorMessages.rateLimitExceeded : (payload === null || payload === void 0 || (_payload$errorMessage2 = payload.errorMessages) === null || _payload$errorMessage2 === void 0 ? void 0 : _payload$errorMessage2.genericFailure) || config.defaults.errorMessages.genericFailure;
                                controller.enqueue(encoder.encode(errorMessage));
                              }
                            case 39:
                              _context2.prev = 39;
                              controller.close();
                              return _context2.finish(39);
                            case 42:
                            case "end":
                              return _context2.stop();
                          }
                        }, _callee2, null, [[2, 34, 39, 42]]);
                      }))();
                    }
                  }));
                case 29:
                case "end":
                  return _context3.stop();
              }
            }, _callee3);
          }))));
        case 6:
        case "end":
          return _context4.stop();
      }
    }, _callee4);
  }));
  return _APIStream.apply(this, arguments);
}