var _excluded = ["mapper"];
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var s = Object.getOwnPropertySymbols(e); for (r = 0; r < s.length; r++) o = s[r], t.includes(o) || {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (e.includes(n)) continue; t[n] = r[n]; } return t; }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function _wrapAsyncGenerator(e) { return function () { return new AsyncGenerator(e.apply(this, arguments)); }; }
function AsyncGenerator(e) { var r, t; function resume(r, t) { try { var n = e[r](t), o = n.value, u = o instanceof _OverloadYield; Promise.resolve(u ? o.v : o).then(function (t) { if (u) { var i = "return" === r ? "return" : "next"; if (!o.k || t.done) return resume(i, t); t = e[i](t).value; } settle(n.done ? "return" : "normal", t); }, function (e) { resume("throw", e); }); } catch (e) { settle("throw", e); } } function settle(e, n) { switch (e) { case "return": r.resolve({ value: n, done: !0 }); break; case "throw": r.reject(n); break; default: r.resolve({ value: n, done: !1 }); } (r = r.next) ? resume(r.key, r.arg) : t = null; } this._invoke = function (e, n) { return new Promise(function (o, u) { var i = { key: e, arg: n, resolve: o, reject: u, next: null }; t ? t = t.next = i : (r = t = i, resume(e, n)); }); }, "function" != typeof e["return"] && (this["return"] = void 0); }
AsyncGenerator.prototype["function" == typeof Symbol && Symbol.asyncIterator || "@@asyncIterator"] = function () { return this; }, AsyncGenerator.prototype.next = function (e) { return this._invoke("next", e); }, AsyncGenerator.prototype["throw"] = function (e) { return this._invoke("throw", e); }, AsyncGenerator.prototype["return"] = function (e) { return this._invoke("return", e); };
function _awaitAsyncGenerator(e) { return new _OverloadYield(e, 0); }
function _asyncGeneratorDelegate(t) { var e = {}, n = !1; function pump(e, r) { return n = !0, r = new Promise(function (n) { n(t[e](r)); }), { done: !1, value: new _OverloadYield(r, 1) }; } return e["undefined" != typeof Symbol && Symbol.iterator || "@@iterator"] = function () { return this; }, e.next = function (t) { return n ? (n = !1, t) : pump("next", t); }, "function" == typeof t["throw"] && (e["throw"] = function (t) { if (n) throw n = !1, t; return pump("throw", t); }), "function" == typeof t["return"] && (e["return"] = function (t) { return n ? (n = !1, t) : pump("return", t); }), e; }
function _OverloadYield(e, d) { this.v = e, this.k = d; }
function _asyncIterator(r) { var n, t, o, e = 2; for ("undefined" != typeof Symbol && (t = Symbol.asyncIterator, o = Symbol.iterator); e--;) { if (t && null != (n = r[t])) return n.call(r); if (o && null != (n = r[o])) return new AsyncFromSyncIterator(n.call(r)); t = "@@asyncIterator", o = "@@iterator"; } throw new TypeError("Object is not async iterable"); }
function AsyncFromSyncIterator(r) { function AsyncFromSyncIteratorContinuation(r) { if (Object(r) !== r) return Promise.reject(new TypeError(r + " is not an object.")); var n = r.done; return Promise.resolve(r.value).then(function (r) { return { value: r, done: n }; }); } return AsyncFromSyncIterator = function AsyncFromSyncIterator(r) { this.s = r, this.n = r.next; }, AsyncFromSyncIterator.prototype = { s: null, n: null, next: function next() { return AsyncFromSyncIteratorContinuation(this.n.apply(this.s, arguments)); }, "return": function _return(r) { var n = this.s["return"]; return void 0 === n ? Promise.resolve({ value: r, done: !0 }) : AsyncFromSyncIteratorContinuation(n.apply(this.s, arguments)); }, "throw": function _throw(r) { var n = this.s["return"]; return void 0 === n ? Promise.reject(r) : AsyncFromSyncIteratorContinuation(n.apply(this.s, arguments)); } }, new AsyncFromSyncIterator(r); }
import createStreaming from 'streamops';
import IncomingXMLParserSelectorEngine from './IncomingXMLParserSelectorEngine.mjs';
import Logger from './Logger.mjs';
import { generateSystemPrompt as defaultSystemPrompt, generateUserPrompt as defaultUserPrompt } from './prompts.mjs';
var logger = new Logger('xmllm');
var DEFAULT_TEMPERATURE = 0.72;
var text = function text(fn) {
  return function (_ref5) {
    var $text = _ref5.$text;
    return fn ? fn($text) : $text;
  };
};
var withAttrs = function withAttrs(fn) {
  return function (_ref6) {
    var $text = _ref6.$text,
      $attr = _ref6.$attr;
    return fn($text, $attr);
  };
};
var whenClosed = function whenClosed(fn) {
  return function (el) {
    return el.$tagclosed ? fn(el) : undefined;
  };
};
var parserStack = new WeakMap();
function xmllmGen(_x) {
  return _xmllmGen.apply(this, arguments);
}
function _xmllmGen() {
  _xmllmGen = _wrapAsyncGenerator(function (pipelineFn) {
    var _ref7 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      timeout = _ref7.timeout,
      llmStream = _ref7.llmStream,
      _ref7$generateSystemP = _ref7.generateSystemPrompt,
      generateSystemPrompt = _ref7$generateSystemP === void 0 ? defaultSystemPrompt : _ref7$generateSystemP,
      _ref7$generateUserPro = _ref7.generateUserPrompt,
      generateUserPrompt = _ref7$generateUserPro === void 0 ? defaultUserPrompt : _ref7$generateUserPro;
    return /*#__PURE__*/_regeneratorRuntime().mark(function _callee12() {
      var streamops, context, xmlps, pipeline, stream, getCurrentParser, pushNewParser, req, xmlReq, promptClosed, promptStream, promptComplex, mapSelect, mapSelectClosed, select;
      return _regeneratorRuntime().wrap(function _callee12$(_context12) {
        while (1) switch (_context12.prev = _context12.next) {
          case 0:
            select = function _select(selector) {
              var mapperFn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (x) {
                return x;
              };
              return /*#__PURE__*/_regeneratorRuntime().mark(function _callee11(chunk) {
                var currentParser, selection;
                return _regeneratorRuntime().wrap(function _callee11$(_context11) {
                  while (1) switch (_context11.prev = _context11.next) {
                    case 0:
                      currentParser = getCurrentParser();
                      if (currentParser) {
                        _context11.next = 4;
                        break;
                      }
                      logger.warn('No active parser found for select()');
                      return _context11.abrupt("return");
                    case 4:
                      selection = currentParser.dedupeSelect(selector, true);
                      if (!(selection !== null && selection !== void 0 && selection.length)) {
                        _context11.next = 7;
                        break;
                      }
                      return _context11.delegateYield(selection.map(mapperFn), "t0", 7);
                    case 7:
                    case "end":
                      return _context11.stop();
                  }
                }, _callee11);
              });
            };
            mapSelectClosed = function _mapSelectClosed(schema) {
              return /*#__PURE__*/_regeneratorRuntime().mark(function _callee10(chunk) {
                var currentParser, selection;
                return _regeneratorRuntime().wrap(function _callee10$(_context10) {
                  while (1) switch (_context10.prev = _context10.next) {
                    case 0:
                      currentParser = getCurrentParser();
                      if (currentParser) {
                        _context10.next = 4;
                        break;
                      }
                      logger.warn('No active parser found for mapSelectClosed()');
                      return _context10.abrupt("return");
                    case 4:
                      selection = currentParser.mapSelectClosed(schema);
                      if (!(selection && Object.keys(selection).length)) {
                        _context10.next = 8;
                        break;
                      }
                      _context10.next = 8;
                      return selection;
                    case 8:
                    case "end":
                      return _context10.stop();
                  }
                }, _callee10);
              });
            };
            mapSelect = function _mapSelect(schema) {
              var includeOpenTags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
              var doDedupe = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
              return /*#__PURE__*/_regeneratorRuntime().mark(function _callee9(chunk) {
                var currentParser, selection;
                return _regeneratorRuntime().wrap(function _callee9$(_context9) {
                  while (1) switch (_context9.prev = _context9.next) {
                    case 0:
                      currentParser = getCurrentParser();
                      if (currentParser) {
                        _context9.next = 4;
                        break;
                      }
                      logger.warn('No active parser found for mapSelect()');
                      return _context9.abrupt("return");
                    case 4:
                      selection = currentParser.mapSelect(schema, includeOpenTags, doDedupe);
                      if (!(selection && Object.keys(selection).length)) {
                        _context9.next = 8;
                        break;
                      }
                      _context9.next = 8;
                      return selection;
                    case 8:
                    case "end":
                      return _context9.stop();
                  }
                }, _callee9);
              });
            };
            promptComplex = function _promptComplex(config) {
              var additionalOverrides = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
              return /*#__PURE__*/function () {
                var _ref3 = _wrapAsyncGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee8(input) {
                  var _config, messages, schema, hints, mapper, system, max_tokens, maxTokens, top_p, topP, stop, presence_penalty, presencePenalty, temperature, fakeResponse, _config$doMapSelectCl, doMapSelectClosed, _config$includeOpenTa, includeOpenTags, _config$doDedupe, doDedupe, model, fakeDelay, waitMessageString, waitMessageDelay, retryMax, onChunk, retryStartDelay, retryBackoffMultiplier, cache, generateSystemPrompt, generateUserPrompt, reqPipeline, pipeline, _iteratorAbruptCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, item;
                  return _regeneratorRuntime().wrap(function _callee8$(_context8) {
                    while (1) switch (_context8.prev = _context8.next) {
                      case 0:
                        if (typeof config === 'function') {
                          config = config(input);
                          config = _objectSpread(_objectSpread({}, config), additionalOverrides);
                        }
                        if (typeof config === 'string') {
                          config = {
                            messages: [{
                              role: 'user',
                              content: config
                            }]
                          };
                        }
                        _config = config, messages = _config.messages, schema = _config.schema, hints = _config.hints, mapper = _config.mapper, system = _config.system, max_tokens = _config.max_tokens, maxTokens = _config.maxTokens, top_p = _config.top_p, topP = _config.topP, stop = _config.stop, presence_penalty = _config.presence_penalty, presencePenalty = _config.presencePenalty, temperature = _config.temperature, fakeResponse = _config.fakeResponse, _config$doMapSelectCl = _config.doMapSelectClosed, doMapSelectClosed = _config$doMapSelectCl === void 0 ? false : _config$doMapSelectCl, _config$includeOpenTa = _config.includeOpenTags, includeOpenTags = _config$includeOpenTa === void 0 ? true : _config$includeOpenTa, _config$doDedupe = _config.doDedupe, doDedupe = _config$doDedupe === void 0 ? false : _config$doDedupe, model = _config.model, fakeDelay = _config.fakeDelay, waitMessageString = _config.waitMessageString, waitMessageDelay = _config.waitMessageDelay, retryMax = _config.retryMax, onChunk = _config.onChunk, retryStartDelay = _config.retryStartDelay, retryBackoffMultiplier = _config.retryBackoffMultiplier, cache = _config.cache, generateSystemPrompt = _config.generateSystemPrompt, generateUserPrompt = _config.generateUserPrompt;
                        if (!(mapper && !schema)) {
                          _context8.next = 5;
                          break;
                        }
                        throw new Error('You cannot have a schema with a mapper; it makes no sense.');
                      case 5:
                        if (schema) {
                          _context8.next = 7;
                          break;
                        }
                        return _context8.abrupt("return", xmlReq({
                          system: system,
                          messages: messages,
                          model: model,
                          hints: hints,
                          max_tokens: max_tokens,
                          maxTokens: maxTokens,
                          top_p: top_p,
                          topP: topP,
                          presence_penalty: presence_penalty,
                          presencePenalty: presencePenalty,
                          temperature: temperature,
                          stop: stop,
                          schema: schema,
                          generateSystemPrompt: generateSystemPrompt,
                          generateUserPrompt: generateUserPrompt
                        }));
                      case 7:
                        reqPipeline = [/*#__PURE__*/_regeneratorRuntime().mark(function _callee4() {
                          return _regeneratorRuntime().wrap(function _callee4$(_context4) {
                            while (1) switch (_context4.prev = _context4.next) {
                              case 0:
                                if (!isComplexIterable(input)) {
                                  _context4.next = 4;
                                  break;
                                }
                                return _context4.delegateYield(input, "t0", 2);
                              case 2:
                                _context4.next = 6;
                                break;
                              case 4:
                                _context4.next = 6;
                                return input;
                              case 6:
                              case "end":
                                return _context4.stop();
                            }
                          }, _callee4);
                        }), /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(x) {
                          return _regeneratorRuntime().wrap(function _callee5$(_context5) {
                            while (1) switch (_context5.prev = _context5.next) {
                              case 0:
                                _context5.next = 2;
                                return x;
                              case 2:
                              case "end":
                                return _context5.stop();
                            }
                          }, _callee5);
                        }), fakeResponse ? /*#__PURE__*/_regeneratorRuntime().mark(function _callee6() {
                          return _regeneratorRuntime().wrap(function _callee6$(_context6) {
                            while (1) switch (_context6.prev = _context6.next) {
                              case 0:
                                // If it's a fakeResponse we still want to ensure it's added
                                // to the parser, otherwise selections won't work and there's
                                // no point...
                                getCurrentParser().add(fakeResponse);
                                return _context6.delegateYield([fakeResponse], "t0", 2);
                              case 2:
                              case "end":
                                return _context6.stop();
                            }
                          }, _callee6);
                        }) : xmlReq({
                          system: system,
                          messages: messages,
                          max_tokens: max_tokens || maxTokens,
                          schema: schema,
                          hints: hints,
                          model: model,
                          fakeDelay: fakeDelay,
                          waitMessageString: waitMessageString,
                          waitMessageDelay: waitMessageDelay,
                          retryMax: retryMax,
                          temperature: temperature,
                          top_p: top_p,
                          topP: topP,
                          presence_penalty: presence_penalty,
                          presencePenalty: presencePenalty,
                          stop: stop,
                          onChunk: onChunk,
                          retryStartDelay: retryStartDelay,
                          retryBackoffMultiplier: retryBackoffMultiplier,
                          cache: cache,
                          generateSystemPrompt: generateSystemPrompt,
                          generateUserPrompt: generateUserPrompt
                        }),
                        // function*(x) {
                        //   yield x;
                        // },

                        // doMapSelectClosed ? mapSelectClosed(schema) : mapSelect(schema),
                        doMapSelectClosed ? mapSelectClosed(schema) : mapSelect(schema, includeOpenTags, doDedupe)

                        // function*(x) {
                        //   yield x;
                        // },
                        ];
                        pipeline = [xmllmGen(function () {
                          return reqPipeline;
                        }, {
                          llmStream: llmStream
                        }), (/*#__PURE__*/function () {
                          var _ref4 = _wrapAsyncGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee7(output) {
                            var _iteratorAbruptCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, x, _iteratorAbruptCompletion6, _didIteratorError6, _iteratorError6, _iterator6, _step6, _x6, _iteratorAbruptCompletion7, _didIteratorError7, _iteratorError7, _iterator7, _step7, y;
                            return _regeneratorRuntime().wrap(function _callee7$(_context7) {
                              while (1) switch (_context7.prev = _context7.next) {
                                case 0:
                                  if (isComplexIterable(input)) {
                                    _context7.next = 36;
                                    break;
                                  }
                                  if (!isComplexIterable(output)) {
                                    _context7.next = 33;
                                    break;
                                  }
                                  _iteratorAbruptCompletion5 = false;
                                  _didIteratorError5 = false;
                                  _context7.prev = 4;
                                  _iterator5 = _asyncIterator(output);
                                case 6:
                                  _context7.next = 8;
                                  return _awaitAsyncGenerator(_iterator5.next());
                                case 8:
                                  if (!(_iteratorAbruptCompletion5 = !(_step5 = _context7.sent).done)) {
                                    _context7.next = 15;
                                    break;
                                  }
                                  x = _step5.value;
                                  _context7.next = 12;
                                  return mapper ? mapper(input, x) : x;
                                case 12:
                                  _iteratorAbruptCompletion5 = false;
                                  _context7.next = 6;
                                  break;
                                case 15:
                                  _context7.next = 21;
                                  break;
                                case 17:
                                  _context7.prev = 17;
                                  _context7.t0 = _context7["catch"](4);
                                  _didIteratorError5 = true;
                                  _iteratorError5 = _context7.t0;
                                case 21:
                                  _context7.prev = 21;
                                  _context7.prev = 22;
                                  if (!(_iteratorAbruptCompletion5 && _iterator5["return"] != null)) {
                                    _context7.next = 26;
                                    break;
                                  }
                                  _context7.next = 26;
                                  return _awaitAsyncGenerator(_iterator5["return"]());
                                case 26:
                                  _context7.prev = 26;
                                  if (!_didIteratorError5) {
                                    _context7.next = 29;
                                    break;
                                  }
                                  throw _iteratorError5;
                                case 29:
                                  return _context7.finish(26);
                                case 30:
                                  return _context7.finish(21);
                                case 31:
                                  _context7.next = 35;
                                  break;
                                case 33:
                                  _context7.next = 35;
                                  return mapper ? mapper(input, output) : output;
                                case 35:
                                  return _context7.abrupt("return");
                                case 36:
                                  _iteratorAbruptCompletion6 = false;
                                  _didIteratorError6 = false;
                                  _context7.prev = 38;
                                  _iterator6 = _asyncIterator(input);
                                case 40:
                                  _context7.next = 42;
                                  return _awaitAsyncGenerator(_iterator6.next());
                                case 42:
                                  if (!(_iteratorAbruptCompletion6 = !(_step6 = _context7.sent).done)) {
                                    _context7.next = 81;
                                    break;
                                  }
                                  _x6 = _step6.value;
                                  if (!isComplexIterable(output)) {
                                    _context7.next = 76;
                                    break;
                                  }
                                  _iteratorAbruptCompletion7 = false;
                                  _didIteratorError7 = false;
                                  _context7.prev = 47;
                                  _iterator7 = _asyncIterator(output);
                                case 49:
                                  _context7.next = 51;
                                  return _awaitAsyncGenerator(_iterator7.next());
                                case 51:
                                  if (!(_iteratorAbruptCompletion7 = !(_step7 = _context7.sent).done)) {
                                    _context7.next = 58;
                                    break;
                                  }
                                  y = _step7.value;
                                  _context7.next = 55;
                                  return mapper ? mapper(_x6, y) : _x6;
                                case 55:
                                  _iteratorAbruptCompletion7 = false;
                                  _context7.next = 49;
                                  break;
                                case 58:
                                  _context7.next = 64;
                                  break;
                                case 60:
                                  _context7.prev = 60;
                                  _context7.t1 = _context7["catch"](47);
                                  _didIteratorError7 = true;
                                  _iteratorError7 = _context7.t1;
                                case 64:
                                  _context7.prev = 64;
                                  _context7.prev = 65;
                                  if (!(_iteratorAbruptCompletion7 && _iterator7["return"] != null)) {
                                    _context7.next = 69;
                                    break;
                                  }
                                  _context7.next = 69;
                                  return _awaitAsyncGenerator(_iterator7["return"]());
                                case 69:
                                  _context7.prev = 69;
                                  if (!_didIteratorError7) {
                                    _context7.next = 72;
                                    break;
                                  }
                                  throw _iteratorError7;
                                case 72:
                                  return _context7.finish(69);
                                case 73:
                                  return _context7.finish(64);
                                case 74:
                                  _context7.next = 78;
                                  break;
                                case 76:
                                  _context7.next = 78;
                                  return mapper ? mapper(_x6, output) : output;
                                case 78:
                                  _iteratorAbruptCompletion6 = false;
                                  _context7.next = 40;
                                  break;
                                case 81:
                                  _context7.next = 87;
                                  break;
                                case 83:
                                  _context7.prev = 83;
                                  _context7.t2 = _context7["catch"](38);
                                  _didIteratorError6 = true;
                                  _iteratorError6 = _context7.t2;
                                case 87:
                                  _context7.prev = 87;
                                  _context7.prev = 88;
                                  if (!(_iteratorAbruptCompletion6 && _iterator6["return"] != null)) {
                                    _context7.next = 92;
                                    break;
                                  }
                                  _context7.next = 92;
                                  return _awaitAsyncGenerator(_iterator6["return"]());
                                case 92:
                                  _context7.prev = 92;
                                  if (!_didIteratorError6) {
                                    _context7.next = 95;
                                    break;
                                  }
                                  throw _iteratorError6;
                                case 95:
                                  return _context7.finish(92);
                                case 96:
                                  return _context7.finish(87);
                                case 97:
                                case "end":
                                  return _context7.stop();
                              }
                            }, _callee7, null, [[4, 17, 21, 31], [22,, 26, 30], [38, 83, 87, 97], [47, 60, 64, 74], [65,, 69, 73], [88,, 92, 96]]);
                          }));
                          return function (_x5) {
                            return _ref4.apply(this, arguments);
                          };
                        }())];
                        _iteratorAbruptCompletion4 = false;
                        _didIteratorError4 = false;
                        _context8.prev = 11;
                        _iterator4 = _asyncIterator(xmllmGen(function () {
                          return pipeline;
                        }, {
                          llmStream: llmStream
                        }));
                      case 13:
                        _context8.next = 15;
                        return _awaitAsyncGenerator(_iterator4.next());
                      case 15:
                        if (!(_iteratorAbruptCompletion4 = !(_step4 = _context8.sent).done)) {
                          _context8.next = 22;
                          break;
                        }
                        item = _step4.value;
                        _context8.next = 19;
                        return item;
                      case 19:
                        _iteratorAbruptCompletion4 = false;
                        _context8.next = 13;
                        break;
                      case 22:
                        _context8.next = 28;
                        break;
                      case 24:
                        _context8.prev = 24;
                        _context8.t0 = _context8["catch"](11);
                        _didIteratorError4 = true;
                        _iteratorError4 = _context8.t0;
                      case 28:
                        _context8.prev = 28;
                        _context8.prev = 29;
                        if (!(_iteratorAbruptCompletion4 && _iterator4["return"] != null)) {
                          _context8.next = 33;
                          break;
                        }
                        _context8.next = 33;
                        return _awaitAsyncGenerator(_iterator4["return"]());
                      case 33:
                        _context8.prev = 33;
                        if (!_didIteratorError4) {
                          _context8.next = 36;
                          break;
                        }
                        throw _iteratorError4;
                      case 36:
                        return _context8.finish(33);
                      case 37:
                        return _context8.finish(28);
                      case 38:
                      case "end":
                        return _context8.stop();
                    }
                  }, _callee8, null, [[11, 24, 28, 38], [29,, 33, 37]]);
                }));
                return function (_x4) {
                  return _ref3.apply(this, arguments);
                };
              }();
            };
            promptStream = function _promptStream(prompt, schema) {
              var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
              var fakeResponse = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
              var transformedConfig = prompt;
              if (typeof transformedConfig == 'function') {
                return promptComplex(prompt, {
                  doMapSelectClosed: false
                });
              }
              if (typeof transformedConfig === 'string') {
                transformedConfig = {
                  system: '',
                  doMapSelectClosed: false,
                  messages: [{
                    role: 'user',
                    content: transformedConfig
                  }]
                };
              }
              return promptComplex(_objectSpread(_objectSpread(_objectSpread({
                schema: schema,
                fakeResponse: fakeResponse
              }, transformedConfig), options), {}, {
                doMapSelectClosed: false
              }));
            };
            promptClosed = function _promptClosed(prompt, schema) {
              var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
              var fakeResponse = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
              var transformedConfig = prompt;
              if (typeof transformedConfig == 'function') {
                return promptComplex(prompt, {
                  doMapSelectClosed: true
                });
              }
              if (typeof transformedConfig === 'string') {
                transformedConfig = {
                  system: '',
                  doMapSelectClosed: true,
                  messages: [{
                    role: 'user',
                    content: transformedConfig
                  }]
                };
              }
              var mapper = options.mapper,
                restOptions = _objectWithoutProperties(options, _excluded);
              return promptComplex(_objectSpread(_objectSpread(_objectSpread({
                schema: schema,
                mapper: mapper,
                fakeResponse: fakeResponse
              }, transformedConfig), restOptions), {}, {
                doMapSelectClosed: true
              }));
            };
            xmlReq = function _xmlReq(_ref8) {
              var _messages;
              var schema = _ref8.schema,
                hints = _ref8.hints,
                system = _ref8.system,
                messages = _ref8.messages,
                max_tokens = _ref8.max_tokens,
                maxTokens = _ref8.maxTokens,
                model = _ref8.model,
                temperature = _ref8.temperature,
                stop = _ref8.stop,
                top_p = _ref8.top_p,
                topP = _ref8.topP,
                presence_penalty = _ref8.presence_penalty,
                presencePenalty = _ref8.presencePenalty,
                cache = _ref8.cache,
                fakeDelay = _ref8.fakeDelay,
                waitMessageString = _ref8.waitMessageString,
                waitMessageDelay = _ref8.waitMessageDelay,
                retryMax = _ref8.retryMax,
                retryStartDelay = _ref8.retryStartDelay,
                retryBackoffMultiplier = _ref8.retryBackoffMultiplier,
                onChunk = _ref8.onChunk,
                localSystemPrompt = _ref8.generateSystemPrompt,
                localUserPrompt = _ref8.generateUserPrompt;
              messages = (messages || []).slice();
              var prompt = '';
              if ((_messages = messages) !== null && _messages !== void 0 && _messages.length) {
                var _messages2;
                if (((_messages2 = messages[messages.length - 1]) === null || _messages2 === void 0 ? void 0 : _messages2.role) !== 'user') {
                  throw new Error('Last message should have role of "user"');
                }
                if (!messages[messages.length - 1].content) {
                  throw new Error('Last message should have a non-empty content property');
                }
                prompt = messages.pop().content;
              }
              var useSystemPrompt = localSystemPrompt || generateSystemPrompt;
              var useUserPrompt = localUserPrompt || generateUserPrompt;
              return /*#__PURE__*/function () {
                var _ref2 = _wrapAsyncGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3(thing) {
                  var _messages3;
                  var parser, transformedPrompt, mapSelectionSchemaScaffold, systemPrompt, stream, reader, accrued, cancelled, _yield$_awaitAsyncGen2, done, value, _text2;
                  return _regeneratorRuntime().wrap(function _callee3$(_context3) {
                    while (1) switch (_context3.prev = _context3.next) {
                      case 0:
                        parser = pushNewParser();
                        transformedPrompt = prompt;
                        mapSelectionSchemaScaffold = schema && IncomingXMLParserSelectorEngine.makeMapSelectXMLScaffold(schema, hints);
                        if (typeof transformedPrompt == 'function') {
                          transformedPrompt = transformedPrompt(thing);
                        }
                        if (mapSelectionSchemaScaffold) {
                          transformedPrompt = useUserPrompt(mapSelectionSchemaScaffold, transformedPrompt);
                        }
                        systemPrompt = useSystemPrompt(system);
                        if (!(typeof transformedPrompt !== 'string')) {
                          _context3.next = 8;
                          break;
                        }
                        throw new Error('transformedPrompt must be a string');
                      case 8:
                        if (transformedPrompt.trim()) {
                          _context3.next = 10;
                          break;
                        }
                        throw new Error('we need a prompt');
                      case 10:
                        _context3.next = 12;
                        return _awaitAsyncGenerator(llmStream({
                          max_tokens: max_tokens || maxTokens || 4000,
                          temperature: temperature == null ? 0.5 : temperature,
                          top_p: top_p || topP || null,
                          stop: stop || null,
                          presence_penalty: presence_penalty || presencePenalty || null,
                          messages: [{
                            role: 'system',
                            content: systemPrompt
                          }].concat(_toConsumableArray(((_messages3 = messages) === null || _messages3 === void 0 ? void 0 : _messages3.length) && messages || []), [{
                            role: 'user',
                            content: transformedPrompt
                          }]),
                          model: model,
                          fakeDelay: fakeDelay,
                          waitMessageString: waitMessageString,
                          waitMessageDelay: waitMessageDelay,
                          retryMax: retryMax,
                          retryStartDelay: retryStartDelay,
                          retryBackoffMultiplier: retryBackoffMultiplier,
                          cache: cache
                        }));
                      case 12:
                        stream = _context3.sent;
                        reader = stream.getReader();
                        accrued = '';
                        cancelled = false;
                        _context3.next = 18;
                        return accrued;
                      case 18:
                        _context3.prev = 18;
                      case 19:
                        if (!true) {
                          _context3.next = 35;
                          break;
                        }
                        _context3.next = 22;
                        return _awaitAsyncGenerator(reader.read());
                      case 22:
                        _yield$_awaitAsyncGen2 = _context3.sent;
                        done = _yield$_awaitAsyncGen2.done;
                        value = _yield$_awaitAsyncGen2.value;
                        if (!(cancelled || done)) {
                          _context3.next = 27;
                          break;
                        }
                        return _context3.abrupt("break", 35);
                      case 27:
                        _text2 = new TextDecoder().decode(value);
                        if (onChunk) {
                          try {
                            onChunk(_text2);
                          } catch (err) {
                            logger.error('onChunk err', err);
                          }
                        }
                        parser.add(_text2);
                        accrued += _text2;
                        _context3.next = 33;
                        return _text2;
                      case 33:
                        _context3.next = 19;
                        break;
                      case 35:
                        _context3.next = 40;
                        break;
                      case 37:
                        _context3.prev = 37;
                        _context3.t0 = _context3["catch"](18);
                        logger.error("Error reading stream:", _context3.t0);
                      case 40:
                        _context3.prev = 40;
                        reader.releaseLock();
                        return _context3.finish(40);
                      case 43:
                      case "end":
                        return _context3.stop();
                    }
                  }, _callee3, null, [[18, 37, 40, 43]]);
                }));
                return function (_x3) {
                  return _ref2.apply(this, arguments);
                };
              }();
            };
            req = function _req(config) {
              return /*#__PURE__*/function () {
                var _ref = _wrapAsyncGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2(thing) {
                  var parser, transformedConfig, _transformedConfig, system, model, cache, max_tokens, maxTokens, temperature, top_p, topP, presence_penalty, presencePenalty, stop, messages, stream, reader, accrued, cancelled, _yield$_awaitAsyncGen, done, value, _text;
                  return _regeneratorRuntime().wrap(function _callee2$(_context2) {
                    while (1) switch (_context2.prev = _context2.next) {
                      case 0:
                        parser = pushNewParser();
                        transformedConfig = config;
                        if (typeof transformedConfig == 'function') {
                          transformedConfig = transformedConfig(thing);
                        }
                        if (typeof transformedConfig === 'string') {
                          transformedConfig = {
                            system: '',
                            messages: [{
                              role: 'user',
                              content: transformedConfig
                            }]
                          };
                        }
                        _transformedConfig = transformedConfig, system = _transformedConfig.system, model = _transformedConfig.model, cache = _transformedConfig.cache, max_tokens = _transformedConfig.max_tokens, maxTokens = _transformedConfig.maxTokens, temperature = _transformedConfig.temperature, top_p = _transformedConfig.top_p, topP = _transformedConfig.topP, presence_penalty = _transformedConfig.presence_penalty, presencePenalty = _transformedConfig.presencePenalty, stop = _transformedConfig.stop, messages = _transformedConfig.messages;
                        if (messages.length) {
                          _context2.next = 7;
                          break;
                        }
                        throw new Error('Must be at least one message');
                      case 7:
                        _context2.next = 9;
                        return _awaitAsyncGenerator(llmStream({
                          max_tokens: max_tokens || maxTokens || 4000,
                          temperature: temperature == null ? DEFAULT_TEMPERATURE : temperature,
                          fakeDelay: transformedConfig.fakeDelay,
                          top_p: top_p || topP,
                          presence_penalty: presence_penalty || presencePenalty,
                          stop: stop,
                          messages: [{
                            role: 'system',
                            content: system || ''
                          }].concat(_toConsumableArray(messages || [])),
                          model: model,
                          cache: cache
                        }));
                      case 9:
                        stream = _context2.sent;
                        reader = stream.getReader();
                        accrued = config.accrued || '';
                        cancelled = false;
                        if (!accrued) {
                          _context2.next = 16;
                          break;
                        }
                        _context2.next = 16;
                        return accrued;
                      case 16:
                        _context2.prev = 16;
                      case 17:
                        if (!true) {
                          _context2.next = 32;
                          break;
                        }
                        _context2.next = 20;
                        return _awaitAsyncGenerator(reader.read());
                      case 20:
                        _yield$_awaitAsyncGen = _context2.sent;
                        done = _yield$_awaitAsyncGen.done;
                        value = _yield$_awaitAsyncGen.value;
                        if (!(cancelled || done)) {
                          _context2.next = 25;
                          break;
                        }
                        return _context2.abrupt("break", 32);
                      case 25:
                        _text = new TextDecoder().decode(value);
                        parser.add(_text);
                        accrued += _text;
                        _context2.next = 30;
                        return _text;
                      case 30:
                        _context2.next = 17;
                        break;
                      case 32:
                        _context2.next = 37;
                        break;
                      case 34:
                        _context2.prev = 34;
                        _context2.t0 = _context2["catch"](16);
                        logger.error("Error reading stream:", _context2.t0);
                      case 37:
                        _context2.prev = 37;
                        reader.releaseLock();
                        return _context2.finish(37);
                      case 40:
                      case "end":
                        return _context2.stop();
                    }
                  }, _callee2, null, [[16, 34, 37, 40]]);
                }));
                return function (_x2) {
                  return _ref.apply(this, arguments);
                };
              }();
            };
            pushNewParser = function _pushNewParser() {
              var parser = new IncomingXMLParserSelectorEngine();
              var stack = parserStack.get(context);
              stack.push(parser);
              return parser;
            };
            getCurrentParser = function _getCurrentParser() {
              var stack = parserStack.get(context);
              return stack[stack.length - 1];
            };
            streamops = createStreaming({
              timeout: timeout || 1e6
            });
            context = {};
            parserStack.set(context, []);
            pushNewParser(); // ensure there's at least one
            if (!(typeof pipelineFn !== 'function')) {
              _context12.next = 16;
              break;
            }
            throw new Error('You must pass a function to xmllm - and that function must return a pipeline array.');
          case 16:
            xmlps = new IncomingXMLParserSelectorEngine();
            pipeline = pipelineFn({
              // Convenience aliases
              p: promptClosed,
              pc: promptClosed,
              //legacy
              ps: promptStream,
              r: req,
              prompt: promptStream,
              promptStream: promptStream,
              promptClosed: promptClosed,
              promptComplex: promptComplex,
              select: select,
              mapSelect: mapSelect,
              mapSelectClosed: mapSelectClosed,
              req: req,
              // Manually add things to parser
              // Useful for testing or adding HTML/XML from other non req/xmlReq
              // sources.
              parse: function parse(str) {
                return /*#__PURE__*/_regeneratorRuntime().mark(function _callee(incoming) {
                  return _regeneratorRuntime().wrap(function _callee$(_context) {
                    while (1) switch (_context.prev = _context.next) {
                      case 0:
                        getCurrentParser().add(String(str));
                        _context.next = 3;
                        return incoming;
                      case 3:
                      case "end":
                        return _context.stop();
                    }
                  }, _callee);
                });
              },
              map: streamops.map,
              filter: streamops.filter,
              reduce: streamops.reduce,
              accrue: streamops.accrue,
              tap: streamops.tap,
              waitUntil: streamops.waitUntil,
              mergeAggregate: streamops.mergeAggregate,
              take: streamops.take,
              batch: streamops.batch,
              // batch: (n, ops) => {
              //   console.log('xmllm: batch', n, ops);
              //   return streamops.batch.call(this, n, ops);
              // },
              skip: streamops.skip,
              text: text,
              val: text,
              value: text,
              v: text,
              withAttrs: withAttrs,
              whenClosed: whenClosed
            });
            if (Array.isArray(pipeline)) {
              _context12.next = 20;
              break;
            }
            throw new Error('Pipeline creator function must return an array.');
          case 20:
            stream = streamops(pipeline);
            return _context12.delegateYield(_asyncGeneratorDelegate(_asyncIterator(stream), _awaitAsyncGenerator), "t0", 22);
          case 22:
          case "end":
            return _context12.stop();
        }
      }, _callee12);
    })();
  });
  return _xmllmGen.apply(this, arguments);
}
function isComplexIterable(obj) {
  return obj != null && (typeof obj[Symbol.iterator] === 'function' || typeof obj[Symbol.asyncIterator] === 'function') && typeof obj !== 'string' && typeof obj !== 'number' && typeof obj !== 'boolean' && _typeof(obj) !== 'symbol';
}
function xmllm(pipelineFn) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var g = xmllmGen(pipelineFn, options);
  g.all = /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee13() {
    var results, _iteratorAbruptCompletion, _didIteratorError, _iteratorError, _iterator, _step, item;
    return _regeneratorRuntime().wrap(function _callee13$(_context13) {
      while (1) switch (_context13.prev = _context13.next) {
        case 0:
          results = [];
          _iteratorAbruptCompletion = false;
          _didIteratorError = false;
          _context13.prev = 3;
          _iterator = _asyncIterator(this);
        case 5:
          _context13.next = 7;
          return _iterator.next();
        case 7:
          if (!(_iteratorAbruptCompletion = !(_step = _context13.sent).done)) {
            _context13.next = 13;
            break;
          }
          item = _step.value;
          results.push(item);
        case 10:
          _iteratorAbruptCompletion = false;
          _context13.next = 5;
          break;
        case 13:
          _context13.next = 19;
          break;
        case 15:
          _context13.prev = 15;
          _context13.t0 = _context13["catch"](3);
          _didIteratorError = true;
          _iteratorError = _context13.t0;
        case 19:
          _context13.prev = 19;
          _context13.prev = 20;
          if (!(_iteratorAbruptCompletion && _iterator["return"] != null)) {
            _context13.next = 24;
            break;
          }
          _context13.next = 24;
          return _iterator["return"]();
        case 24:
          _context13.prev = 24;
          if (!_didIteratorError) {
            _context13.next = 27;
            break;
          }
          throw _iteratorError;
        case 27:
          return _context13.finish(24);
        case 28:
          return _context13.finish(19);
        case 29:
          return _context13.abrupt("return", results);
        case 30:
        case "end":
          return _context13.stop();
      }
    }, _callee13, this, [[3, 15, 19, 29], [20,, 24, 28]]);
  }));
  g.first = /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee14() {
    var n,
      results,
      _iteratorAbruptCompletion2,
      _didIteratorError2,
      _iteratorError2,
      _iterator2,
      _step2,
      item,
      _args14 = arguments;
    return _regeneratorRuntime().wrap(function _callee14$(_context14) {
      while (1) switch (_context14.prev = _context14.next) {
        case 0:
          n = _args14.length > 0 && _args14[0] !== undefined ? _args14[0] : 1;
          results = [];
          _iteratorAbruptCompletion2 = false;
          _didIteratorError2 = false;
          _context14.prev = 4;
          _iterator2 = _asyncIterator(this);
        case 6:
          _context14.next = 8;
          return _iterator2.next();
        case 8:
          if (!(_iteratorAbruptCompletion2 = !(_step2 = _context14.sent).done)) {
            _context14.next = 16;
            break;
          }
          item = _step2.value;
          results.push(item);
          if (!(results.length >= n)) {
            _context14.next = 13;
            break;
          }
          return _context14.abrupt("break", 16);
        case 13:
          _iteratorAbruptCompletion2 = false;
          _context14.next = 6;
          break;
        case 16:
          _context14.next = 22;
          break;
        case 18:
          _context14.prev = 18;
          _context14.t0 = _context14["catch"](4);
          _didIteratorError2 = true;
          _iteratorError2 = _context14.t0;
        case 22:
          _context14.prev = 22;
          _context14.prev = 23;
          if (!(_iteratorAbruptCompletion2 && _iterator2["return"] != null)) {
            _context14.next = 27;
            break;
          }
          _context14.next = 27;
          return _iterator2["return"]();
        case 27:
          _context14.prev = 27;
          if (!_didIteratorError2) {
            _context14.next = 30;
            break;
          }
          throw _iteratorError2;
        case 30:
          return _context14.finish(27);
        case 31:
          return _context14.finish(22);
        case 32:
          return _context14.abrupt("return", n === 1 ? results[0] : results);
        case 33:
        case "end":
          return _context14.stop();
      }
    }, _callee14, this, [[4, 18, 22, 32], [23,, 27, 31]]);
  }));
  g.last = /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee15() {
    var n,
      results,
      _iteratorAbruptCompletion3,
      _didIteratorError3,
      _iteratorError3,
      _iterator3,
      _step3,
      item,
      lastN,
      _args15 = arguments;
    return _regeneratorRuntime().wrap(function _callee15$(_context15) {
      while (1) switch (_context15.prev = _context15.next) {
        case 0:
          n = _args15.length > 0 && _args15[0] !== undefined ? _args15[0] : 1;
          results = [];
          _iteratorAbruptCompletion3 = false;
          _didIteratorError3 = false;
          _context15.prev = 4;
          _iterator3 = _asyncIterator(this);
        case 6:
          _context15.next = 8;
          return _iterator3.next();
        case 8:
          if (!(_iteratorAbruptCompletion3 = !(_step3 = _context15.sent).done)) {
            _context15.next = 14;
            break;
          }
          item = _step3.value;
          results.push(item);
        case 11:
          _iteratorAbruptCompletion3 = false;
          _context15.next = 6;
          break;
        case 14:
          _context15.next = 20;
          break;
        case 16:
          _context15.prev = 16;
          _context15.t0 = _context15["catch"](4);
          _didIteratorError3 = true;
          _iteratorError3 = _context15.t0;
        case 20:
          _context15.prev = 20;
          _context15.prev = 21;
          if (!(_iteratorAbruptCompletion3 && _iterator3["return"] != null)) {
            _context15.next = 25;
            break;
          }
          _context15.next = 25;
          return _iterator3["return"]();
        case 25:
          _context15.prev = 25;
          if (!_didIteratorError3) {
            _context15.next = 28;
            break;
          }
          throw _iteratorError3;
        case 28:
          return _context15.finish(25);
        case 29:
          return _context15.finish(20);
        case 30:
          lastN = results.slice(-n);
          return _context15.abrupt("return", n === 1 ? lastN[0] : lastN);
        case 32:
        case "end":
          return _context15.stop();
      }
    }, _callee15, this, [[4, 16, 20, 30], [21,, 25, 29]]);
  }));
  return g;
}
export default xmllm;
export { xmllm };