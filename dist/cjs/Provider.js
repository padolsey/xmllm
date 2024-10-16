"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _Logger = _interopRequireDefault(require("./Logger.js"));
var _eventsourceParser = require("eventsource-parser");
var _innerTruncate = _interopRequireDefault(require("./innerTruncate.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
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
function estimateTokenCount(m) {
  return m.length / 3;
}
var logger = new _Logger["default"]('Provider');
var DEFAULT_ASSUMED_MAX_CONTEXT_SIZE = 8000;
var DEFAULT_RESPONSE_TOKEN_LENGTH = 300;
var MAX_TOKEN_HISTORICAL_MESSAGE = 600;
var Provider = /*#__PURE__*/function () {
  function Provider(name, details) {
    var _details$constraints;
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
    this.rpmLimit = ((_details$constraints = details.constraints) === null || _details$constraints === void 0 ? void 0 : _details$constraints.rpmLimit) || Infinity; // Default to Infinity if not provided
    this.currentRPM = 0;

    // Configurable properties with more sensible defaults or overrides
    this.REQUEST_TIMEOUT_MS = configOverrides.REQUEST_TIMEOUT_MS || 50000;
    this.MAX_RETRIES = configOverrides.MAX_RETRIES || 2;
    this.RETRY_DELAY_WHEN_OVERLOADED = configOverrides.RETRY_DELAY_WHEN_OVERLOADED || 1000;
    this.RPM_RESET_TIME = configOverrides.RPM_RESET_TIME || 60000;
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
      var _makeRequest = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2(payload) {
        var _this = this;
        var retries, _makeSingleRequest;
        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              retries = 0;
              _makeSingleRequest = /*#__PURE__*/function () {
                var _ref = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
                  var preparedPayload, response, _data$content, _data$content2, _data$choices, errorText, data, _response, _response2, _response3, _response4;
                  return _regeneratorRuntime().wrap(function _callee$(_context) {
                    while (1) switch (_context.prev = _context.next) {
                      case 0:
                        preparedPayload = _this.preparePayload(payload);
                        logger.log('Making request with payload', _this.name, preparedPayload);
                        _context.prev = 2;
                        _context.next = 5;
                        return Promise.race([_this.fetch(_this.endpoint, {
                          method: 'POST',
                          headers: _this.headerGen ? _this.headerGen.call(_this) : _this.getHeaders(),
                          body: JSON.stringify(preparedPayload)
                        }), _this.timeout(_this.REQUEST_TIMEOUT_MS)]);
                      case 5:
                        response = _context.sent;
                        if (response.ok) {
                          _context.next = 12;
                          break;
                        }
                        _context.next = 9;
                        return response.text();
                      case 9:
                        errorText = _context.sent;
                        logger.error("HTTP Error ".concat(response.status, " for ").concat(_this.name, ":"), {
                          status: response.status,
                          statusText: response.statusText,
                          headers: Object.fromEntries(response.headers.entries()),
                          errorText: errorText
                        });
                        throw new Error("HTTP Error ".concat(response.status, ": ").concat(errorText));
                      case 12:
                        _context.next = 14;
                        return response.json();
                      case 14:
                        data = _context.sent;
                        return _context.abrupt("return", data !== null && data !== void 0 && (_data$content = data.content) !== null && _data$content !== void 0 && (_data$content = _data$content[0]) !== null && _data$content !== void 0 && _data$content.text ? {
                          content: data === null || data === void 0 || (_data$content2 = data.content) === null || _data$content2 === void 0 || (_data$content2 = _data$content2[0]) === null || _data$content2 === void 0 ? void 0 : _data$content2.text
                        } : data === null || data === void 0 || (_data$choices = data.choices) === null || _data$choices === void 0 || (_data$choices = _data$choices[0]) === null || _data$choices === void 0 ? void 0 : _data$choices.message);
                      case 18:
                        _context.prev = 18;
                        _context.t0 = _context["catch"](2);
                        _context.t1 = logger;
                        _context.t2 = "Provider ".concat(_this.name, " encountered an error:");
                        _context.t3 = _context.t0.message;
                        _context.t4 = _context.t0.stack;
                        _context.t5 = (_response = response) === null || _response === void 0 ? void 0 : _response.status;
                        _context.t6 = (_response2 = response) === null || _response2 === void 0 ? void 0 : _response2.statusText;
                        _context.t7 = response ? Object.fromEntries(response.headers.entries()) : null;
                        _context.next = 29;
                        return (_response3 = response) === null || _response3 === void 0 ? void 0 : _response3.text()["catch"](function () {
                          return 'Unable to read response body';
                        });
                      case 29:
                        _context.t8 = _context.sent;
                        _context.t9 = {
                          error: _context.t3,
                          stack: _context.t4,
                          responseStatus: _context.t5,
                          responseStatusText: _context.t6,
                          responseHeaders: _context.t7,
                          responseBody: _context.t8
                        };
                        _context.t1.error.call(_context.t1, _context.t2, _context.t9);
                        logger.log('Errored payload, FYI: ', preparedPayload);
                        if (!(retries < _this.MAX_RETRIES && _this.shouldRetry(_context.t0, (_response4 = response) === null || _response4 === void 0 ? void 0 : _response4.status))) {
                          _context.next = 39;
                          break;
                        }
                        retries++;
                        logger.log("Retrying request for ".concat(_this.name, ", attempt ").concat(retries));
                        _context.next = 38;
                        return _this.delay(_this.RETRY_DELAY_WHEN_OVERLOADED);
                      case 38:
                        return _context.abrupt("return", _makeSingleRequest());
                      case 39:
                        throw _context.t0;
                      case 40:
                      case "end":
                        return _context.stop();
                    }
                  }, _callee, null, [[2, 18]]);
                }));
                return function makeSingleRequest() {
                  return _ref.apply(this, arguments);
                };
              }();
              return _context2.abrupt("return", _makeSingleRequest());
            case 3:
            case "end":
              return _context2.stop();
          }
        }, _callee2);
      }));
      function makeRequest(_x) {
        return _makeRequest.apply(this, arguments);
      }
      return makeRequest;
    }()
  }, {
    key: "createStream",
    value: function () {
      var _createStream = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee5(payload) {
        var _this2 = this;
        var retries,
          encoder,
          inst,
          response,
          timerId,
          makeSingleStream,
          _args5 = arguments;
        return _regeneratorRuntime().wrap(function _callee5$(_context5) {
          while (1) switch (_context5.prev = _context5.next) {
            case 0:
              retries = _args5.length > 1 && _args5[1] !== undefined ? _args5[1] : 0;
              logger.log('Making STREAMING request with payload', payload);
              encoder = new TextEncoder();
              inst = this;
              this.currentRPM++;
              payload.stream = true;
              timerId = setTimeout(function () {
                return _this2.currentRPM--;
              }, this.RPM_RESET_TIME);
              makeSingleStream = /*#__PURE__*/function () {
                var _ref2 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee4() {
                  var preparedPayload, endpoint, headers, errorText, data, counter, closed, _response5, _response6, _response7, _response8;
                  return _regeneratorRuntime().wrap(function _callee4$(_context4) {
                    while (1) switch (_context4.prev = _context4.next) {
                      case 0:
                        logger.log('Initiating stream request');
                        preparedPayload = _this2.preparePayload(payload);
                        logger.log('Prepared payload for stream request', preparedPayload);
                        _context4.prev = 3;
                        endpoint = "".concat(_this2.endpoint).concat(preparedPayload.stream ? '?stream=true' : '');
                        headers = _this2.headerGen ? _this2.headerGen.call(_this2) : _this2.getHeaders();
                        logger.log('Sending fetch request to', _this2.endpoint, headers, JSON.stringify(preparedPayload));
                        _context4.next = 9;
                        return Promise.race([_this2.fetch(endpoint, {
                          method: 'POST',
                          headers: headers,
                          body: JSON.stringify(preparedPayload)
                        }), _this2.timeout(_this2.REQUEST_TIMEOUT_MS)]);
                      case 9:
                        response = _context4.sent;
                        logger.log('Received response', response.status, response.statusText);
                        if (response.ok) {
                          _context4.next = 17;
                          break;
                        }
                        _context4.next = 14;
                        return response.text();
                      case 14:
                        errorText = _context4.sent;
                        logger.error("HTTP Error ".concat(response.status, " for ").concat(_this2.name, " (stream):"), {
                          status: response.status,
                          statusText: response.statusText,
                          headers: Object.fromEntries(response.headers.entries()),
                          errorText: errorText
                        });
                        throw new Error("HTTP Error ".concat(response.status, ": ").concat(errorText));
                      case 17:
                        if (response.body) {
                          _context4.next = 20;
                          break;
                        }
                        logger.error('Response body is null', response);
                        throw new Error("No response body from ".concat(inst.name));
                      case 20:
                        data = '';
                        counter = 0;
                        closed = false;
                        return _context4.abrupt("return", new ReadableStream({
                          start: function start(controller) {
                            return _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3() {
                              var onParse, parser, _iteratorAbruptCompletion, _didIteratorError, _iteratorError, _iterator, _step, chunk, decoded, _json$choices2, json, _json$choices3;
                              return _regeneratorRuntime().wrap(function _callee3$(_context3) {
                                while (1) switch (_context3.prev = _context3.next) {
                                  case 0:
                                    onParse = function _onParse(event) {
                                      if (closed) return;
                                      if (event.type === 'event') {
                                        var eventData = event.data;
                                        if (eventData === '[DONE]') {
                                          clearTimeout(timerId);
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
                                            clearTimeout(timerId);
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
                                          clearTimeout(timerId);
                                          closed = true;
                                          controller.error(e);
                                        }
                                      }
                                    };
                                    logger.log('Starting readable stream');
                                    parser = (0, _eventsourceParser.createParser)(onParse);
                                    logger.log('Starting to read response body', response.body);
                                    _iteratorAbruptCompletion = false;
                                    _didIteratorError = false;
                                    _context3.prev = 6;
                                    _iterator = _asyncIterator(response.body);
                                  case 8:
                                    _context3.next = 10;
                                    return _iterator.next();
                                  case 10:
                                    if (!(_iteratorAbruptCompletion = !(_step = _context3.sent).done)) {
                                      _context3.next = 28;
                                      break;
                                    }
                                    chunk = _step.value;
                                    decoded = new TextDecoder().decode(chunk);
                                    if (!((decoded === null || decoded === void 0 ? void 0 : decoded[0]) === '{')) {
                                      _context3.next = 24;
                                      break;
                                    }
                                    _context3.prev = 14;
                                    json = JSON.parse(decoded);
                                    if (!((_json$choices2 = json.choices) !== null && _json$choices2 !== void 0 && (_json$choices2 = _json$choices2[0]) !== null && _json$choices2 !== void 0 && (_json$choices2 = _json$choices2.message) !== null && _json$choices2 !== void 0 && _json$choices2.content)) {
                                      _context3.next = 20;
                                      break;
                                    }
                                    controller.enqueue((_json$choices3 = json.choices) === null || _json$choices3 === void 0 || (_json$choices3 = _json$choices3[0]) === null || _json$choices3 === void 0 || (_json$choices3 = _json$choices3.message) === null || _json$choices3 === void 0 ? void 0 : _json$choices3.content);
                                    controller.close();
                                    return _context3.abrupt("return");
                                  case 20:
                                    _context3.next = 24;
                                    break;
                                  case 22:
                                    _context3.prev = 22;
                                    _context3.t0 = _context3["catch"](14);
                                  case 24:
                                    parser.feed(decoded);
                                  case 25:
                                    _iteratorAbruptCompletion = false;
                                    _context3.next = 8;
                                    break;
                                  case 28:
                                    _context3.next = 34;
                                    break;
                                  case 30:
                                    _context3.prev = 30;
                                    _context3.t1 = _context3["catch"](6);
                                    _didIteratorError = true;
                                    _iteratorError = _context3.t1;
                                  case 34:
                                    _context3.prev = 34;
                                    _context3.prev = 35;
                                    if (!(_iteratorAbruptCompletion && _iterator["return"] != null)) {
                                      _context3.next = 39;
                                      break;
                                    }
                                    _context3.next = 39;
                                    return _iterator["return"]();
                                  case 39:
                                    _context3.prev = 39;
                                    if (!_didIteratorError) {
                                      _context3.next = 42;
                                      break;
                                    }
                                    throw _iteratorError;
                                  case 42:
                                    return _context3.finish(39);
                                  case 43:
                                    return _context3.finish(34);
                                  case 44:
                                    logger.log('Finished reading response body');
                                  case 45:
                                  case "end":
                                    return _context3.stop();
                                }
                              }, _callee3, null, [[6, 30, 34, 44], [14, 22], [35,, 39, 43]]);
                            }))();
                          }
                        }));
                      case 26:
                        _context4.prev = 26;
                        _context4.t0 = _context4["catch"](3);
                        _context4.t1 = logger;
                        _context4.t2 = "Error in streaming from ".concat(_this2.name, ":");
                        _context4.t3 = _context4.t0.message;
                        _context4.t4 = _context4.t0.stack;
                        _context4.t5 = (_response5 = response) === null || _response5 === void 0 ? void 0 : _response5.status;
                        _context4.t6 = (_response6 = response) === null || _response6 === void 0 ? void 0 : _response6.statusText;
                        _context4.t7 = response ? Object.fromEntries(response.headers.entries()) : null;
                        _context4.next = 37;
                        return (_response7 = response) === null || _response7 === void 0 ? void 0 : _response7.text()["catch"](function () {
                          return 'Unable to read response body';
                        });
                      case 37:
                        _context4.t8 = _context4.sent;
                        _context4.t9 = {
                          error: _context4.t3,
                          stack: _context4.t4,
                          responseStatus: _context4.t5,
                          responseStatusText: _context4.t6,
                          responseHeaders: _context4.t7,
                          responseBody: _context4.t8
                        };
                        _context4.t1.error.call(_context4.t1, _context4.t2, _context4.t9);
                        clearTimeout(timerId);
                        if (!(retries < _this2.MAX_RETRIES && _this2.shouldRetry(_context4.t0, (_response8 = response) === null || _response8 === void 0 ? void 0 : _response8.status))) {
                          _context4.next = 47;
                          break;
                        }
                        retries++;
                        logger.log("Retrying request for ".concat(_this2.name, ", attempt ").concat(retries));
                        _context4.next = 46;
                        return _this2.delay(_this2.RETRY_DELAY_WHEN_OVERLOADED * Math.pow(2, retries - 1));
                      case 46:
                        return _context4.abrupt("return", _this2.createStream(payload, retries));
                      case 47:
                        throw _context4.t0;
                      case 48:
                      case "end":
                        return _context4.stop();
                    }
                  }, _callee4, null, [[3, 26]]);
                }));
                return function makeSingleStream() {
                  return _ref2.apply(this, arguments);
                };
              }();
              return _context5.abrupt("return", makeSingleStream());
            case 9:
            case "end":
              return _context5.stop();
          }
        }, _callee5, this);
      }));
      function createStream(_x2) {
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
        return setTimeout(resolve, ms);
      });
    }
  }, {
    key: "shouldRetry",
    value: function shouldRetry(error, status) {
      // Use error codes and more explicit checks instead of message content
      return (status === 500 || error.message.includes('time')) && status !== 401;
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
      // Ensure context-size limits are respected

      // First, try to use the model specified in the preference
      // If not found, fall back to 'fast', then to the first available model
      var modelType = customPayload.model || 'fast';
      var model = this.models[modelType] || this.models['fast'] || Object.values(this.models)[0];
      if (!model) {
        throw new Error("No valid model found for provider: ".concat(this.name));
      }
      var messages = _toConsumableArray(customPayload.messages);
      var systemMessage = messages.shift();
      if (systemMessage.role !== 'system') {
        throw new Error('Expected system message!');
      }

      // Determine max tokens left after sys message
      var maxAvailableContextSize = 0 | (model.maxContextSize || DEFAULT_ASSUMED_MAX_CONTEXT_SIZE) - estimateTokenCount(systemMessage.content) - DEFAULT_RESPONSE_TOKEN_LENGTH;
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
      logger.dev('m12 done');
      logger.dev('deriving model specific payload');
      var modelSpecificPayload = this.payloader(_objectSpread(_objectSpread({
        system: systemMessage.content,
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
  }, {
    key: "getAvailable",
    value: function getAvailable() {
      return this.currentRPM < this.rpmLimit;
    }
  }]);
}();
var _default = exports["default"] = Provider;