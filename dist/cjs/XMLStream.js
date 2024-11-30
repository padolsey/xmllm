"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _xmllm = _interopRequireDefault(require("./xmllm.js"));
var _Logger = _interopRequireDefault(require("./Logger.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
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
var logger = new _Logger["default"]('XMLStream');
var XMLStream = /*#__PURE__*/function () {
  function XMLStream() {
    var pipeline = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    _classCallCheck(this, XMLStream);
    this.pipeline = pipeline;
    this.options = options;
  }

  // Get first matching element
  return _createClass(XMLStream, [{
    key: "first",
    value: function () {
      var _first = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
        var _yield$this$Symbol$as, value, done, errorInfo;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              _context.next = 3;
              return this[Symbol.asyncIterator]().next();
            case 3:
              _yield$this$Symbol$as = _context.sent;
              value = _yield$this$Symbol$as.value;
              done = _yield$this$Symbol$as.done;
              if (!done) {
                _context.next = 8;
                break;
              }
              return _context.abrupt("return", undefined);
            case 8:
              return _context.abrupt("return", value);
            case 11:
              _context.prev = 11;
              _context.t0 = _context["catch"](0);
              errorInfo = parseError(_context.t0);
              _context.t1 = errorInfo.type;
              _context.next = _context.t1 === 'TimeoutError' ? 17 : _context.t1 === 'NetworkError' ? 18 : 19;
              break;
            case 17:
              throw new Error("LLM request timed out: ".concat(errorInfo.message));
            case 18:
              throw new Error("Failed to connect to LLM service: ".concat(errorInfo.message));
            case 19:
              throw _context.t0;
            case 20:
            case "end":
              return _context.stop();
          }
        }, _callee, this, [[0, 11]]);
      }));
      function first() {
        return _first.apply(this, arguments);
      }
      return first;
    }()
  }, {
    key: "select",
    value: function select(selector) {
      return new XMLStream([].concat(_toConsumableArray(this.pipeline), [['select', selector]]), this.options);
    }

    // Return new XMLStream that will collect all items
  }, {
    key: "accrue",
    value: function accrue() {
      return new XMLStream([].concat(_toConsumableArray(this.pipeline), [['accrue'],
      // Collect all items into an array
      // STREAMOPS LIBRARY NOTE:
      // IMPORTANT: AFAIK the map() below is required to prevent accrue from
      // yielding items individually.
      // Without this map, accrue (being a Dam) would yield each collected
      // item separately.
      // With this map, we preserve the accumulated array as a single
      // unit because:
      // 1. accrue collects items: [a,b,c]
      // 2. map receives the whole array and passes it through intact
      // If we removed this map, we'd get individual items a,b,c instead of
      // [a,b,c]
      ['map', function (c) {
        return c;
      }]]), this.options);
    }
  }, {
    key: "map",
    value: function map(fn) {
      return new XMLStream([].concat(_toConsumableArray(this.pipeline), [['map', fn]]), this.options);
    }
  }, {
    key: "text",
    value: function text() {
      return new XMLStream([].concat(_toConsumableArray(this.pipeline), [['map', function (el) {
        return el === null || el === void 0 ? void 0 : el.$text;
      }]]), this.options);
    }
  }, {
    key: "all",
    value: function () {
      var _all = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
        var result, _iteratorAbruptCompletion, _didIteratorError, _iteratorError, _iterator, _step, value;
        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              result = [];
              _iteratorAbruptCompletion = false;
              _didIteratorError = false;
              _context2.prev = 3;
              _iterator = _asyncIterator(this);
            case 5:
              _context2.next = 7;
              return _iterator.next();
            case 7:
              if (!(_iteratorAbruptCompletion = !(_step = _context2.sent).done)) {
                _context2.next = 13;
                break;
              }
              value = _step.value;
              result.push(value);
            case 10:
              _iteratorAbruptCompletion = false;
              _context2.next = 5;
              break;
            case 13:
              _context2.next = 19;
              break;
            case 15:
              _context2.prev = 15;
              _context2.t0 = _context2["catch"](3);
              _didIteratorError = true;
              _iteratorError = _context2.t0;
            case 19:
              _context2.prev = 19;
              _context2.prev = 20;
              if (!(_iteratorAbruptCompletion && _iterator["return"] != null)) {
                _context2.next = 24;
                break;
              }
              _context2.next = 24;
              return _iterator["return"]();
            case 24:
              _context2.prev = 24;
              if (!_didIteratorError) {
                _context2.next = 27;
                break;
              }
              throw _iteratorError;
            case 27:
              return _context2.finish(24);
            case 28:
              return _context2.finish(19);
            case 29:
              return _context2.abrupt("return", result);
            case 30:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this, [[3, 15, 19, 29], [20,, 24, 28]]);
      }));
      function all() {
        return _all.apply(this, arguments);
      }
      return all;
    }()
  }, {
    key: "value",
    value: function () {
      var _value = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3() {
        return _regeneratorRuntime().wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              logger.warn('Warning: value() is deprecated. Use first() or last() instead.');
              return _context3.abrupt("return", this.first());
            case 2:
            case "end":
              return _context3.stop();
          }
        }, _callee3, this);
      }));
      function value() {
        return _value.apply(this, arguments);
      }
      return value;
    }()
  }, {
    key: "take",
    value: function take(n) {
      return new XMLStream([].concat(_toConsumableArray(this.pipeline), [['take', n]]), this.options);
    }
  }, {
    key: "skip",
    value: function skip(n) {
      return new XMLStream([].concat(_toConsumableArray(this.pipeline), [['skip', n]]), this.options);
    }
  }, {
    key: "filter",
    value: function filter(predicate) {
      return new XMLStream([].concat(_toConsumableArray(this.pipeline), [['filter', predicate]]), this.options);
    }
  }, {
    key: "mergeAggregate",
    value: function mergeAggregate() {
      return new XMLStream([].concat(_toConsumableArray(this.pipeline), [['mergeAggregate']]), this.options);
    }
  }, {
    key: "reduce",
    value: function reduce(reducer, initialValue) {
      return new XMLStream([].concat(_toConsumableArray(this.pipeline), [['reduce', {
        reducer: reducer,
        initialValue: initialValue
      }]]), this.options);
    }
  }, {
    key: "pipe",
    value: function pipe(genFn) {
      return new XMLStream([].concat(_toConsumableArray(this.pipeline), [['pipe', genFn]]), this.options);
    }
  }, {
    key: "raw",
    value: function raw() {
      return new XMLStream([].concat(_toConsumableArray(this.pipeline), [['raw']]), this.options);
    }
  }, {
    key: "debug",
    value: function debug() {
      var label = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      logger.log('Instigate debug() with label', label);
      return new XMLStream([].concat(_toConsumableArray(this.pipeline), [['map', function (value) {
        console.log("=== Debug ".concat(label ? "(".concat(label, ")") : '', " ==="));
        console.log(value);
        console.log('===================');
        return value;
      }]]), this.options);
    }
  }, {
    key: Symbol.asyncIterator,
    value: function value() {
      var iterator;
      var pipeline = this.pipeline;
      var options = this.options;
      return {
        next: function next() {
          var _this = this;
          return _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee4() {
            return _regeneratorRuntime().wrap(function _callee4$(_context4) {
              while (1) switch (_context4.prev = _context4.next) {
                case 0:
                  _context4.prev = 0;
                  if (!iterator) {
                    iterator = (0, _xmllm["default"])(function (_ref) {
                      var req = _ref.req,
                        select = _ref.select,
                        mergeAggregate = _ref.mergeAggregate,
                        map = _ref.map,
                        filter = _ref.filter,
                        accrue = _ref.accrue,
                        reduce = _ref.reduce,
                        promptComplex = _ref.promptComplex,
                        take = _ref.take,
                        skip = _ref.skip,
                        batch = _ref.batch;
                      return pipeline.map(function (_ref2) {
                        var _ref3 = _slicedToArray(_ref2, 3),
                          type = _ref3[0],
                          arg = _ref3[1],
                          arg2 = _ref3[2];
                        switch (type) {
                          case 'select':
                            return select.call(_this, arg);
                          case 'mergeAggregate':
                            return mergeAggregate.call(_this, arg);
                          case 'map':
                            return map.call(_this, arg);
                          case 'text':
                            return map.call(_this, function (_ref4) {
                              var $text = _ref4.$text;
                              return $text;
                            });
                          case 'raw':
                            return map.call(_this, function (t) {
                              return t;
                            });
                          case 'filter':
                            return filter.call(_this, arg);
                          case 'accrue':
                            return accrue.call(_this);
                          case 'reduce':
                            return reduce.call(_this, arg.reducer, arg.initialValue);
                          case 'skip':
                            return skip.call(_this, arg);
                          case 'take':
                            return take.call(_this, arg);
                          case 'batch':
                            return batch.call(_this, arg, arg2);
                          case 'req':
                            return arg.schema ? promptComplex.call(_this, arg) : req.call(_this, arg);
                        }
                        throw new Error("Unknown pipeline type: ".concat(type));
                      });
                    }, options);
                  }
                  return _context4.abrupt("return", iterator.next());
                case 5:
                  _context4.prev = 5;
                  _context4.t0 = _context4["catch"](0);
                  iterator = null;
                  logger.error('XMLStream error', _context4.t0);
                  throw _context4.t0;
                case 10:
                case "end":
                  return _context4.stop();
              }
            }, _callee4, null, [[0, 5]]);
          }))();
        },
        "return": function _return() {
          return _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee5() {
            return _regeneratorRuntime().wrap(function _callee5$(_context5) {
              while (1) switch (_context5.prev = _context5.next) {
                case 0:
                  _context5.prev = 0;
                  if (!(iterator && typeof iterator["return"] === 'function')) {
                    _context5.next = 4;
                    break;
                  }
                  _context5.next = 4;
                  return iterator["return"]();
                case 4:
                  _context5.prev = 4;
                  iterator = null;
                  return _context5.finish(4);
                case 7:
                  return _context5.abrupt("return", {
                    done: true,
                    value: undefined
                  });
                case 8:
                case "end":
                  return _context5.stop();
              }
            }, _callee5, null, [[0,, 4, 7]]);
          }))();
        }
      };
    }
  }, {
    key: "closedOnly",
    value: function closedOnly() {
      // TODO: this will not work if is south of any element derivations e.g.
      // after stream()'d schema, it may already be too late because the data
      // is strings thus not a "node". Hmmmmmmmmmmm TODO
      return new XMLStream([].concat(_toConsumableArray(this.pipeline), [
      // Only let elements pass through if they're closed
      ['filter', function (el) {
        return el !== null && el !== void 0 && el.__isNodeObj__ ? !!el.$tagclosed : true;
      }]]), this.options);
    }

    // Mark complete() as deprecated but keep it for backwards compatibility
  }, {
    key: "complete",
    value: function complete() {
      logger.warn('Warning: complete() is deprecated. Use closedOnly() instead as it better describes what this method does - it filters for closed XML elements.');
      return this.closedOnly();
    }

    // Convenience method for schema-based collection
  }, {
    key: "collect",
    value: function () {
      var _collect = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee6() {
        var results, _iteratorAbruptCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, item;
        return _regeneratorRuntime().wrap(function _callee6$(_context6) {
          while (1) switch (_context6.prev = _context6.next) {
            case 0:
              results = [];
              _iteratorAbruptCompletion2 = false;
              _didIteratorError2 = false;
              _context6.prev = 3;
              _iterator2 = _asyncIterator(this);
            case 5:
              _context6.next = 7;
              return _iterator2.next();
            case 7:
              if (!(_iteratorAbruptCompletion2 = !(_step2 = _context6.sent).done)) {
                _context6.next = 13;
                break;
              }
              item = _step2.value;
              results.push(item);
            case 10:
              _iteratorAbruptCompletion2 = false;
              _context6.next = 5;
              break;
            case 13:
              _context6.next = 19;
              break;
            case 15:
              _context6.prev = 15;
              _context6.t0 = _context6["catch"](3);
              _didIteratorError2 = true;
              _iteratorError2 = _context6.t0;
            case 19:
              _context6.prev = 19;
              _context6.prev = 20;
              if (!(_iteratorAbruptCompletion2 && _iterator2["return"] != null)) {
                _context6.next = 24;
                break;
              }
              _context6.next = 24;
              return _iterator2["return"]();
            case 24:
              _context6.prev = 24;
              if (!_didIteratorError2) {
                _context6.next = 27;
                break;
              }
              throw _iteratorError2;
            case 27:
              return _context6.finish(24);
            case 28:
              return _context6.finish(19);
            case 29:
              return _context6.abrupt("return", results);
            case 30:
            case "end":
              return _context6.stop();
          }
        }, _callee6, this, [[3, 15, 19, 29], [20,, 24, 28]]);
      }));
      function collect() {
        return _collect.apply(this, arguments);
      }
      return collect;
    }()
  }, {
    key: "merge",
    value: function merge() {
      return new XMLStream([].concat(_toConsumableArray(this.pipeline), [['accrue'],
      // Collects all items into array
      ['map', function (chunks) {
        var _deepMerge = function deepMerge(target, source) {
          // Special case: if source is a special object type (Date, RegExp, etc), return it directly
          if (source !== null && _typeof(source) === 'object' && source.constructor !== Object && source.constructor !== Array) {
            return source;
          }
          for (var key in source) {
            var sourceValue = source[key];
            if (sourceValue !== null && _typeof(sourceValue) === 'object') {
              // Special object type - pass through
              if (sourceValue.constructor !== Object && sourceValue.constructor !== Array) {
                target[key] = sourceValue;
              }
              // Array - concat
              else if (Array.isArray(sourceValue)) {
                target[key] = target[key] || [];
                target[key] = target[key].concat(sourceValue);
              }
              // Plain object - recurse
              else {
                target[key] = target[key] || {};
                _deepMerge(target[key], sourceValue);
              }
            } else {
              target[key] = sourceValue;
            }
          }
          return target;
        };
        return chunks.reduce(function (acc, chunk) {
          return _deepMerge(acc, chunk);
        }, {});
      }]]), this.options);
    }
  }, {
    key: "last",
    value: function () {
      var _last = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee7() {
        var n,
          allItems,
          _iteratorAbruptCompletion3,
          _didIteratorError3,
          _iteratorError3,
          _iterator3,
          _step3,
          value,
          errorInfo,
          _args7 = arguments;
        return _regeneratorRuntime().wrap(function _callee7$(_context7) {
          while (1) switch (_context7.prev = _context7.next) {
            case 0:
              n = _args7.length > 0 && _args7[0] !== undefined ? _args7[0] : 1;
              _context7.prev = 1;
              if (!(n < 1)) {
                _context7.next = 4;
                break;
              }
              throw new Error('n must be greater than 0');
            case 4:
              allItems = [];
              _iteratorAbruptCompletion3 = false;
              _didIteratorError3 = false;
              _context7.prev = 7;
              _iterator3 = _asyncIterator(this);
            case 9:
              _context7.next = 11;
              return _iterator3.next();
            case 11:
              if (!(_iteratorAbruptCompletion3 = !(_step3 = _context7.sent).done)) {
                _context7.next = 17;
                break;
              }
              value = _step3.value;
              allItems.push(value);
            case 14:
              _iteratorAbruptCompletion3 = false;
              _context7.next = 9;
              break;
            case 17:
              _context7.next = 23;
              break;
            case 19:
              _context7.prev = 19;
              _context7.t0 = _context7["catch"](7);
              _didIteratorError3 = true;
              _iteratorError3 = _context7.t0;
            case 23:
              _context7.prev = 23;
              _context7.prev = 24;
              if (!(_iteratorAbruptCompletion3 && _iterator3["return"] != null)) {
                _context7.next = 28;
                break;
              }
              _context7.next = 28;
              return _iterator3["return"]();
            case 28:
              _context7.prev = 28;
              if (!_didIteratorError3) {
                _context7.next = 31;
                break;
              }
              throw _iteratorError3;
            case 31:
              return _context7.finish(28);
            case 32:
              return _context7.finish(23);
            case 33:
              if (!(allItems.length === 0)) {
                _context7.next = 35;
                break;
              }
              return _context7.abrupt("return", undefined);
            case 35:
              return _context7.abrupt("return", n === 1 ? allItems[allItems.length - 1] : allItems.slice(-n));
            case 38:
              _context7.prev = 38;
              _context7.t1 = _context7["catch"](1);
              errorInfo = parseError(_context7.t1);
              _context7.t2 = errorInfo.type;
              _context7.next = _context7.t2 === 'TimeoutError' ? 44 : _context7.t2 === 'NetworkError' ? 45 : 46;
              break;
            case 44:
              throw new Error("LLM request timed out: ".concat(errorInfo.message));
            case 45:
              throw new Error("Failed to connect to LLM service: ".concat(errorInfo.message));
            case 46:
              throw _context7.t1;
            case 47:
            case "end":
              return _context7.stop();
          }
        }, _callee7, this, [[1, 38], [7, 19, 23, 33], [24,, 28, 32]]);
      }));
      function last() {
        return _last.apply(this, arguments);
      }
      return last;
    }()
    /**
     * Process stream in batches of specified size
     * @param {number} size - Size of each batch
     * @param {Object} options - Batch options
     * @param {boolean} options.yieldIncomplete - Whether to yield incomplete final batch
     */
  }, {
    key: "batch",
    value: function batch(size) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
        yieldIncomplete: true
      };
      return new XMLStream([].concat(_toConsumableArray(this.pipeline), [['batch', size, options] // Pass both size and options to existing batch operator
      ]), this.options);
    }
  }]);
}();
var _default = exports["default"] = XMLStream;
function parseError(error) {
  var _error$context;
  // Start with the raw message
  var message = error.message || '';

  // First try to get error type from context
  var type = (_error$context = error.context) === null || _error$context === void 0 ? void 0 : _error$context.name;
  if (!type) {
    // Look for [ErrorType] pattern
    var typeMatch = message.match(/\[([^\]]+)\]/);
    if (typeMatch) {
      type = typeMatch[1];
    } else {
      // If no explicit type, try to infer from message
      if (message.toLowerCase().includes('timeout')) {
        type = 'TimeoutError';
      } else if (message.toLowerCase().includes('network') || message.toLowerCase().includes('disconnect')) {
        type = 'NetworkError';
      } else {
        type = 'Error';
      }
    }
  }

  // Extract the actual message
  // Remove "Unhandled error. (" prefix if it exists
  message = message.replace(/^Unhandled error\. \(?(?:Error(?:\s+\[[^\]]+\])?\s*:\s*)?/, '');
  // Remove stack trace
  message = message.replace(/\n[\s\S]*$/, '');
  // Remove trailing parenthesis if it exists
  message = message.replace(/\)$/, '');
  return {
    type: type,
    message: message
  };
}
function isGenerator(fn) {
  var _fn$constructor, _fn$constructor2;
  return (fn === null || fn === void 0 || (_fn$constructor = fn.constructor) === null || _fn$constructor === void 0 ? void 0 : _fn$constructor.name) === 'GeneratorFunction' || (fn === null || fn === void 0 || (_fn$constructor2 = fn.constructor) === null || _fn$constructor2 === void 0 ? void 0 : _fn$constructor2.name) === 'AsyncGeneratorFunction';
}