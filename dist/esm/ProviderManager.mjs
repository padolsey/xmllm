function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import PROVIDERS, { createCustomModel } from './PROVIDERS.mjs';
import Provider from './Provider.mjs';
import Logger from './Logger.mjs';
import { ProviderAuthenticationError } from './errors/ProviderErrors.mjs';
var logger = new Logger('ProviderManager');
// Default preferred providers list (only used if payload.model is not provided)
var DEFAULT_PREFERRED_PROVIDERS = ['claude:good', 'openai:good', 'claude:fast', 'openai:fast'];

/**
 * Orchestrates multiple Provider instances and handles provider selection.
 * 
 * 
 * ponsibilities:
 * - Manages provider pool and initialization
 * - Handles provider fallback logic
 * - Creates custom provider configurations
 * - Routes requests to appropriate providers
 * - Manages provider-level error handling
 * 
 * Acts as a facade for the Provider layer, abstracting provider complexity
 * from the Stream layer.
 * 
 * @example
 * const manager = new ProviderManager();
 * const stream = await manager.streamRequest({
 *   messages: [...],
 *   model: ['claude:fast', 'openai:fast']
 * });
 */
var ProviderManager = /*#__PURE__*/function () {
  function ProviderManager() {
    _classCallCheck(this, ProviderManager);
    this.providers = {};
    this.fallbackConfig = {
      maxRetriesPerProvider: 3,
      baseRetryDelay: 1000,
      backoffMultiplier: 2,
      fatalErrorCodes: ['AUTH_ERROR'],
      maxRetries500: 1,
      // Max retries for 500 errors
      skipProviderOn500: true // Whether to skip to next provider on 500
    };
    for (var _i = 0, _Object$entries = Object.entries(PROVIDERS); _i < _Object$entries.length; _i++) {
      var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
        name = _Object$entries$_i[0],
        details = _Object$entries$_i[1];
      this.providers[name] = new Provider(name, details);
    }
  }
  return _createClass(ProviderManager, [{
    key: "getProviderByPreference",
    value: function getProviderByPreference(preference) {
      logger.log('getProviderByPreference', preference);
      if (_typeof(preference) === 'object' && preference.inherit) {
        return this.createCustomProvider(preference);
      }
      var _preference$split = preference.split(':'),
        _preference$split2 = _slicedToArray(_preference$split, 2),
        providerName = _preference$split2[0],
        modelName = _preference$split2[1];
      var provider = this.providers[providerName];
      if (!provider) {
        throw new Error("Provider ".concat(providerName, " not found"));
      }

      // Add check for missing API key
      if (!provider.key) {
        logger.error("No API key found for provider \"".concat(providerName, "\". Add ").concat(providerName.toUpperCase(), "_API_KEY to your environment variables or pass it in your configuration."));
      }

      // If it's a predefined model type (fast, good, etc)
      if (provider.models[modelName]) {
        return {
          provider: provider,
          modelType: modelName
        };
      }

      // If it's a custom model name, create a custom provider
      return this.createCustomProvider({
        inherit: providerName,
        name: modelName
      });
    }
  }, {
    key: "pickProviderWithFallback",
    value: function () {
      var _pickProviderWithFallback = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee(payload, action) {
        var _lastError;
        var preferredProviders, lastError, MAX_RETRIES_PER_PROVIDER, retryDelay, backoffMultiplier, _iterator, _step, preference, _this$getProviderByPr, provider, modelType, consecutiveServerErrors, isOnlyProvider, _loop, _ret, retry;
        return _regeneratorRuntime().wrap(function _callee$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              preferredProviders = payload.model ? Array.isArray(payload.model) ? payload.model : [payload.model] : DEFAULT_PREFERRED_PROVIDERS;
              lastError = null;
              MAX_RETRIES_PER_PROVIDER = payload.retryMax || 3;
              retryDelay = process.env.NODE_ENV === 'test' ? 100 // Much shorter in tests
              : payload.retryStartDelay || 1000;
              backoffMultiplier = process.env.NODE_ENV === 'test' ? 1.5 // Slower growth in tests
              : payload.retryBackoffMultiplier || 2;
              _iterator = _createForOfIteratorHelper(preferredProviders);
              _context2.prev = 6;
              _iterator.s();
            case 8:
              if ((_step = _iterator.n()).done) {
                _context2.next = 35;
                break;
              }
              preference = _step.value;
              _context2.prev = 10;
              _this$getProviderByPr = this.getProviderByPreference(preference), provider = _this$getProviderByPr.provider, modelType = _this$getProviderByPr.modelType;
              logger.log('Trying provider', provider.name, 'with model', modelType);
              consecutiveServerErrors = 0;
              isOnlyProvider = preferredProviders.length === 1;
              _loop = /*#__PURE__*/_regeneratorRuntime().mark(function _loop() {
                var currentDelay;
                return _regeneratorRuntime().wrap(function _loop$(_context) {
                  while (1) switch (_context.prev = _context.next) {
                    case 0:
                      _context.prev = 0;
                      _context.next = 3;
                      return action(provider, _objectSpread(_objectSpread({}, payload), {}, {
                        model: modelType
                      }));
                    case 3:
                      _context.t0 = _context.sent;
                      return _context.abrupt("return", {
                        v: _context.t0
                      });
                    case 7:
                      _context.prev = 7;
                      _context.t1 = _context["catch"](0);
                      logger.error("Error from provider ".concat(provider.name, " (attempt ").concat(retry + 1, "):"), _context.t1);
                      lastError = _context.t1;

                      // Don't retry auth errors regardless of fallback availability
                      if (!(_context.t1 instanceof ProviderAuthenticationError)) {
                        _context.next = 14;
                        break;
                      }
                      logger.warn("Authentication error for ".concat(provider.name, ", skipping retries"));
                      return _context.abrupt("return", 0);
                    case 14:
                      if (!(_context.t1.statusCode === 500)) {
                        _context.next = 27;
                        break;
                      }
                      consecutiveServerErrors++;

                      // If this is our only provider option, be more persistent
                      if (!isOnlyProvider) {
                        _context.next = 22;
                        break;
                      }
                      if (!(consecutiveServerErrors >= 5)) {
                        _context.next = 20;
                        break;
                      }
                      logger.warn("Provider ".concat(provider.name, " returned 5 consecutive 500 errors with no fallback available"));
                      return _context.abrupt("return", 0);
                    case 20:
                      _context.next = 25;
                      break;
                    case 22:
                      if (!(consecutiveServerErrors >= 2)) {
                        _context.next = 25;
                        break;
                      }
                      logger.warn("Provider ".concat(provider.name, " returned multiple 500 errors, trying next provider"));
                      return _context.abrupt("return", 0);
                    case 25:
                      _context.next = 28;
                      break;
                    case 27:
                      consecutiveServerErrors = 0; // Reset counter for non-500 errors
                    case 28:
                      if (!(retry < MAX_RETRIES_PER_PROVIDER - 1)) {
                        _context.next = 34;
                        break;
                      }
                      currentDelay = isOnlyProvider ? Math.min(retryDelay, 5000) // Cap delay at 5s if it's our only option
                      : retryDelay;
                      logger.log("Retrying ".concat(provider.name, " in ").concat(currentDelay, "ms... (").concat(isOnlyProvider ? 'no fallbacks available' : 'has fallbacks', ")"));
                      _context.next = 33;
                      return new Promise(function (resolve) {
                        return setTimeout(resolve, currentDelay);
                      });
                    case 33:
                      retryDelay *= backoffMultiplier;
                    case 34:
                    case "end":
                      return _context.stop();
                  }
                }, _loop, null, [[0, 7]]);
              });
              retry = 0;
            case 17:
              if (!(retry < MAX_RETRIES_PER_PROVIDER)) {
                _context2.next = 27;
                break;
              }
              return _context2.delegateYield(_loop(), "t0", 19);
            case 19:
              _ret = _context2.t0;
              if (!(_ret === 0)) {
                _context2.next = 22;
                break;
              }
              return _context2.abrupt("break", 27);
            case 22:
              if (!_ret) {
                _context2.next = 24;
                break;
              }
              return _context2.abrupt("return", _ret.v);
            case 24:
              retry++;
              _context2.next = 17;
              break;
            case 27:
              if (isOnlyProvider) {
                logger.error("All retries failed for ".concat(provider.name, " with no fallback options available"));
              } else {
                logger.warn("All retries failed for provider ".concat(provider.name, ", moving to next provider"));
              }
              _context2.next = 33;
              break;
            case 30:
              _context2.prev = 30;
              _context2.t1 = _context2["catch"](10);
              logger.error("Error picking preferred provider: ".concat(_context2.t1.message));
            case 33:
              _context2.next = 8;
              break;
            case 35:
              _context2.next = 40;
              break;
            case 37:
              _context2.prev = 37;
              _context2.t2 = _context2["catch"](6);
              _iterator.e(_context2.t2);
            case 40:
              _context2.prev = 40;
              _iterator.f();
              return _context2.finish(40);
            case 43:
              throw new Error(((_lastError = lastError) === null || _lastError === void 0 ? void 0 : _lastError.message) || "All providers failed to fulfill the request".concat(preferredProviders.length === 1 ? ' (no fallbacks were available)' : ''));
            case 44:
            case "end":
              return _context2.stop();
          }
        }, _callee, this, [[6, 37, 40, 43], [10, 30]]);
      }));
      function pickProviderWithFallback(_x, _x2) {
        return _pickProviderWithFallback.apply(this, arguments);
      }
      return pickProviderWithFallback;
    }()
  }, {
    key: "request",
    value: function () {
      var _request = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2(payload) {
        return _regeneratorRuntime().wrap(function _callee2$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              return _context3.abrupt("return", this.pickProviderWithFallback(payload, function (provider, updatedPayload) {
                return provider.makeRequest(updatedPayload);
              }));
            case 1:
            case "end":
              return _context3.stop();
          }
        }, _callee2, this);
      }));
      function request(_x3) {
        return _request.apply(this, arguments);
      }
      return request;
    }()
  }, {
    key: "streamRequest",
    value: function () {
      var _streamRequest = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3(payload) {
        return _regeneratorRuntime().wrap(function _callee3$(_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              return _context4.abrupt("return", this.pickProviderWithFallback(payload, function (provider, updatedPayload) {
                return provider.createStream(updatedPayload);
              }));
            case 1:
            case "end":
              return _context4.stop();
          }
        }, _callee3, this);
      }));
      function streamRequest(_x4) {
        return _streamRequest.apply(this, arguments);
      }
      return streamRequest;
    }()
  }, {
    key: "createCustomProvider",
    value: function createCustomProvider(customConfig) {
      var inherit = customConfig.inherit,
        name = customConfig.name,
        endpoint = customConfig.endpoint,
        key = customConfig.key,
        maxContextSize = customConfig.maxContextSize,
        headerGen = customConfig.headerGen,
        payloader = customConfig.payloader,
        constraints = customConfig.constraints;
      var baseProvider = this.providers[inherit];
      if (!baseProvider) {
        throw new Error("Base provider ".concat(inherit, " not found for custom configuration"));
      }

      // Add key check here
      if (!key && !baseProvider.key) {
        logger.error("No API key found for provider \"".concat(inherit, "\". Add ").concat(inherit.toUpperCase(), "_API_KEY to your environment variables or pass it in your configuration."));
      }

      // Create a new provider instance with custom settings
      var customProvider = new Provider("".concat(inherit, "_custom"), createCustomModel(baseProvider, {
        name: name,
        endpoint: endpoint,
        key: key,
        maxContextSize: maxContextSize,
        headerGen: headerGen,
        payloader: payloader,
        constraints: constraints
      }));
      return {
        provider: customProvider,
        modelType: 'custom'
      };
    }
  }]);
}();
export default ProviderManager;