function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
import { LRUCache } from 'lru-cache';
import { promises as fsPromises, path as fsPath } from './fs.mjs';

// Provides filesystem operations with error handling and logging
export var defaultFileOps = {
  promises: {
    mkdir: function () {
      var _mkdir = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee(dirPath, options) {
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              _context.next = 3;
              return fsPromises.mkdir(dirPath, options);
            case 3:
              return _context.abrupt("return", true);
            case 6:
              _context.prev = 6;
              _context.t0 = _context["catch"](0);
              logger.error('Failed to create directory:', _context.t0);
              return _context.abrupt("return", false);
            case 10:
            case "end":
              return _context.stop();
          }
        }, _callee, null, [[0, 6]]);
      }));
      function mkdir(_x, _x2) {
        return _mkdir.apply(this, arguments);
      }
      return mkdir;
    }(),
    writeFile: function () {
      var _writeFile = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2(filePath, data) {
        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              _context2.prev = 0;
              _context2.next = 3;
              return fsPromises.writeFile(filePath, data);
            case 3:
              return _context2.abrupt("return", true);
            case 6:
              _context2.prev = 6;
              _context2.t0 = _context2["catch"](0);
              logger.error('Failed to write file:', _context2.t0);
              return _context2.abrupt("return", false);
            case 10:
            case "end":
              return _context2.stop();
          }
        }, _callee2, null, [[0, 6]]);
      }));
      function writeFile(_x3, _x4) {
        return _writeFile.apply(this, arguments);
      }
      return writeFile;
    }(),
    readFile: function () {
      var _readFile = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3(filePath) {
        return _regeneratorRuntime().wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              _context3.prev = 0;
              _context3.next = 3;
              return fsPromises.readFile(filePath, 'utf8');
            case 3:
              return _context3.abrupt("return", _context3.sent);
            case 6:
              _context3.prev = 6;
              _context3.t0 = _context3["catch"](0);
              logger.dev('Failed to read file:', _context3.t0);
              return _context3.abrupt("return", null);
            case 10:
            case "end":
              return _context3.stop();
          }
        }, _callee3, null, [[0, 6]]);
      }));
      function readFile(_x5) {
        return _readFile.apply(this, arguments);
      }
      return readFile;
    }(),
    rename: function () {
      var _rename = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee4(oldPath, newPath) {
        return _regeneratorRuntime().wrap(function _callee4$(_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              _context4.prev = 0;
              _context4.next = 3;
              return fsPromises.rename(oldPath, newPath);
            case 3:
              return _context4.abrupt("return", true);
            case 6:
              _context4.prev = 6;
              _context4.t0 = _context4["catch"](0);
              logger.error('Failed to rename file:', _context4.t0);
              return _context4.abrupt("return", false);
            case 10:
            case "end":
              return _context4.stop();
          }
        }, _callee4, null, [[0, 6]]);
      }));
      function rename(_x6, _x7) {
        return _rename.apply(this, arguments);
      }
      return rename;
    }()
  },
  path: fsPath
};

// Use default implementation initially
var fileOps = defaultFileOps;

// Export method to override fileOps (for testing)
export function setFileOps(mockFileOps) {
  fileOps = mockFileOps;
  // Update CACHE_FILE when fileOps changes
  updateCachePath(CACHE_DIR, CACHE_FILENAME);
}

// Use fileOps.path instead of direct path import
var CACHE_DIR = fileOps.path.join(process.cwd(), '.cache');
var CACHE_FILENAME = 'llm-cache.json';
var CACHE_FILE = fileOps.path.join(CACHE_DIR, CACHE_FILENAME);
var getDefaultConfig = function getDefaultConfig() {
  return {
    maxSize: 5000000,
    maxEntries: 100000,
    persistInterval: 5 * 60 * 1000,
    ttl: 5 * 24 * 60 * 60 * 1000,
    maxEntrySize: 10000,
    cacheDir: CACHE_DIR,
    cacheFilename: CACHE_FILENAME
  };
};
var CONFIG = getDefaultConfig();

// Add stats object early
var stats = {
  hits: 0,
  misses: 0
};
var cache = null;
var cachePromise = null;
var cacheModified = false;
var persistInterval = null;
var purgeInterval = null;
var memoryCheckInterval = null;
var memoryPressure = false;
var _logger = null;
var logger = {
  error: function error() {
    var _logger2;
    if (_logger) (_logger2 = _logger).error.apply(_logger2, arguments);
  },
  dev: function dev() {
    var _logger3;
    if (_logger) (_logger3 = _logger).dev.apply(_logger3, arguments);
  }
};
export function setLogger(logger) {
  _logger = logger;
}

// Add internal file operation methods that can be mocked in tests
export var fileOperations = {
  ensureDir: function ensureDir(dirPath) {
    return _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee5() {
      return _regeneratorRuntime().wrap(function _callee5$(_context5) {
        while (1) switch (_context5.prev = _context5.next) {
          case 0:
            _context5.prev = 0;
            _context5.next = 3;
            return fileOps.promises.mkdir(dirPath, {
              recursive: true
            });
          case 3:
            return _context5.abrupt("return", true);
          case 6:
            _context5.prev = 6;
            _context5.t0 = _context5["catch"](0);
            logger.error('Failed to create directory:', _context5.t0);
            return _context5.abrupt("return", false);
          case 10:
          case "end":
            return _context5.stop();
        }
      }, _callee5, null, [[0, 6]]);
    }))();
  },
  writeFile: function writeFile(filePath, data) {
    return _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee6() {
      return _regeneratorRuntime().wrap(function _callee6$(_context6) {
        while (1) switch (_context6.prev = _context6.next) {
          case 0:
            _context6.prev = 0;
            _context6.next = 3;
            return fileOps.promises.writeFile(filePath, data);
          case 3:
            return _context6.abrupt("return", true);
          case 6:
            _context6.prev = 6;
            _context6.t0 = _context6["catch"](0);
            logger.error('Failed to write file:', _context6.t0);
            return _context6.abrupt("return", false);
          case 10:
          case "end":
            return _context6.stop();
        }
      }, _callee6, null, [[0, 6]]);
    }))();
  },
  readFile: function readFile(filePath) {
    return _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee7() {
      return _regeneratorRuntime().wrap(function _callee7$(_context7) {
        while (1) switch (_context7.prev = _context7.next) {
          case 0:
            _context7.prev = 0;
            _context7.next = 3;
            return fileOps.promises.readFile(filePath);
          case 3:
            return _context7.abrupt("return", _context7.sent);
          case 6:
            _context7.prev = 6;
            _context7.t0 = _context7["catch"](0);
            logger.dev('Failed to read file:', _context7.t0);
            return _context7.abrupt("return", null);
          case 10:
          case "end":
            return _context7.stop();
        }
      }, _callee7, null, [[0, 6]]);
    }))();
  },
  rename: function rename(oldPath, newPath) {
    return _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee8() {
      return _regeneratorRuntime().wrap(function _callee8$(_context8) {
        while (1) switch (_context8.prev = _context8.next) {
          case 0:
            _context8.prev = 0;
            _context8.next = 3;
            return fileOps.promises.rename(oldPath, newPath);
          case 3:
            return _context8.abrupt("return", true);
          case 6:
            _context8.prev = 6;
            _context8.t0 = _context8["catch"](0);
            logger.error('Failed to rename file:', _context8.t0);
            return _context8.abrupt("return", false);
          case 10:
          case "end":
            return _context8.stop();
        }
      }, _callee8, null, [[0, 6]]);
    }))();
  }
};

// Add validation helpers
function validatePositiveNumber(value, name) {
  if (value !== undefined && (typeof value !== 'number' || value <= 0)) {
    throw new Error("".concat(name, " must be a positive number"));
  }
}
function validateCacheConfig(config) {
  validatePositiveNumber(config.maxSize, 'maxSize');
  validatePositiveNumber(config.maxEntries, 'maxEntries');
  validatePositiveNumber(config.maxEntrySize, 'maxEntrySize');
  validatePositiveNumber(config.ttl, 'ttl');
  validatePositiveNumber(config.persistInterval, 'persistInterval');
}

// Add helper for TTL calculation
function calculateExpiry(ttl) {
  if (!ttl && !CONFIG.ttl) return undefined;
  return Date.now() + (ttl || CONFIG.ttl);
}

// Add helper for size calculation
function calculateSize(value) {
  return JSON.stringify(value).length;
}

// Add reinitialize function
function reinitializeCache() {
  return _reinitializeCache.apply(this, arguments);
} // Add function to update cache file path
function _reinitializeCache() {
  _reinitializeCache = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee9() {
    var entries, newCache, validEntries, _iterator2, _step2, _step2$value, key, value;
    return _regeneratorRuntime().wrap(function _callee9$(_context9) {
      while (1) switch (_context9.prev = _context9.next) {
        case 0:
          if (cache) {
            entries = Array.from(cache.entries());
            newCache = new LRUCache({
              max: CONFIG.maxEntries,
              maxSize: CONFIG.maxSize,
              sizeCalculation: function sizeCalculation(entry) {
                return entry.size;
              },
              dispose: function dispose(value, key) {
                logger.dev('Disposed old cache entry', key);
              }
            }); // Sort entries by time (most recent first)
            entries.sort(function (a, b) {
              return b[1].time - a[1].time;
            });

            // Only restore up to max entries, filtering expired
            validEntries = entries.filter(function (_ref) {
              var _ref2 = _slicedToArray(_ref, 2),
                _ = _ref2[0],
                value = _ref2[1];
              return !value.expires || value.expires > Date.now();
            }).slice(0, CONFIG.maxEntries);
            _iterator2 = _createForOfIteratorHelper(validEntries);
            try {
              for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                _step2$value = _slicedToArray(_step2.value, 2), key = _step2$value[0], value = _step2$value[1];
                newCache.set(key, value);
              }
            } catch (err) {
              _iterator2.e(err);
            } finally {
              _iterator2.f();
            }
            cache = newCache;
            cacheModified = true;
          }
        case 1:
        case "end":
          return _context9.stop();
      }
    }, _callee9);
  }));
  return _reinitializeCache.apply(this, arguments);
}
function updateCachePath(dir, filename) {
  if (dir) CACHE_DIR = dir;
  if (filename) CACHE_FILENAME = filename;
  CACHE_FILE = fileOps.path.join(CACHE_DIR, CACHE_FILENAME);
}

// Update configure function to handle new options
function configure() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  if (options.cache) {
    validateCacheConfig(options.cache);
    CONFIG = _objectSpread(_objectSpread({}, CONFIG), options.cache);

    // Update cache file path if specified
    if (options.cache.cacheDir || options.cache.cacheFilename) {
      updateCachePath(options.cache.cacheDir, options.cache.cacheFilename);
    }

    // Force cache reinitialization
    if (cache) {
      reinitializeCache();
    }
  }
}
function ensureCacheDir() {
  return _ensureCacheDir.apply(this, arguments);
}
function _ensureCacheDir() {
  _ensureCacheDir = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee10() {
    return _regeneratorRuntime().wrap(function _callee10$(_context10) {
      while (1) switch (_context10.prev = _context10.next) {
        case 0:
          return _context10.abrupt("return", fileOperations.ensureDir(fileOps.path.dirname(CACHE_FILE)));
        case 1:
        case "end":
          return _context10.stop();
      }
    }, _callee10);
  }));
  return _ensureCacheDir.apply(this, arguments);
}
function loadPersistedCache() {
  return _loadPersistedCache.apply(this, arguments);
}
function _loadPersistedCache() {
  _loadPersistedCache = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee11() {
    var data;
    return _regeneratorRuntime().wrap(function _callee11$(_context11) {
      while (1) switch (_context11.prev = _context11.next) {
        case 0:
          _context11.next = 2;
          return fileOperations.readFile(CACHE_FILE);
        case 2:
          data = _context11.sent;
          if (data) {
            _context11.next = 5;
            break;
          }
          return _context11.abrupt("return", {});
        case 5:
          _context11.prev = 5;
          return _context11.abrupt("return", JSON.parse(data));
        case 9:
          _context11.prev = 9;
          _context11.t0 = _context11["catch"](5);
          logger.dev('Failed to parse cache file:', _context11.t0);
          return _context11.abrupt("return", {});
        case 13:
        case "end":
          return _context11.stop();
      }
    }, _callee11, null, [[5, 9]]);
  }));
  return _loadPersistedCache.apply(this, arguments);
}
function persistCache(_x8) {
  return _persistCache.apply(this, arguments);
}
function _persistCache() {
  _persistCache = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee12(cache) {
    var entries, serialized, tempFile;
    return _regeneratorRuntime().wrap(function _callee12$(_context12) {
      while (1) switch (_context12.prev = _context12.next) {
        case 0:
          if (!(!cache || !cacheModified)) {
            _context12.next = 3;
            break;
          }
          logger.dev('Skip persisting cache - no changes');
          return _context12.abrupt("return");
        case 3:
          _context12.prev = 3;
          entries = Array.from(cache.entries()).filter(function (_ref3) {
            var _ref4 = _slicedToArray(_ref3, 2),
              _ = _ref4[0],
              value = _ref4[1];
            return value && (!value.expires || value.expires > Date.now());
          });
          serialized = JSON.stringify(Object.fromEntries(entries));
          tempFile = "".concat(CACHE_FILE, ".tmp");
          _context12.next = 9;
          return fileOperations.writeFile(tempFile, serialized);
        case 9:
          _context12.next = 11;
          return fileOperations.rename(tempFile, CACHE_FILE);
        case 11:
          cacheModified = false;
          logger.dev('Cache persisted to disk');
          _context12.next = 18;
          break;
        case 15:
          _context12.prev = 15;
          _context12.t0 = _context12["catch"](3);
          logger.error('Failed to persist cache:', _context12.t0);
        case 18:
        case "end":
          return _context12.stop();
      }
    }, _callee12, null, [[3, 15]]);
  }));
  return _persistCache.apply(this, arguments);
}
function initializeCache() {
  return _initializeCache.apply(this, arguments);
}
function _initializeCache() {
  _initializeCache = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee14() {
    var dirCreated, persistedData, cacheOptions, _i, _Object$entries, _Object$entries$_i, key, value;
    return _regeneratorRuntime().wrap(function _callee14$(_context14) {
      while (1) switch (_context14.prev = _context14.next) {
        case 0:
          if (cache) {
            _context14.next = 16;
            break;
          }
          _context14.next = 3;
          return ensureCacheDir();
        case 3:
          dirCreated = _context14.sent;
          if (dirCreated) {
            _context14.next = 7;
            break;
          }
          logger.error('Failed to create cache directory');
          return _context14.abrupt("return", null);
        case 7:
          _context14.next = 9;
          return loadPersistedCache();
        case 9:
          persistedData = _context14.sent;
          cacheOptions = {
            // Ensure we always have at least one limiting option
            max: CONFIG.maxEntries || 100000,
            // Use default if not set
            ttl: CONFIG.ttl,
            // Include TTL from config
            dispose: function dispose(value, key) {
              logger.dev('Disposed old cache entry', key);
            }
          }; // Only add size-related options if maxSize is set
          if (CONFIG.maxSize) {
            cacheOptions.maxSize = CONFIG.maxSize;
            cacheOptions.sizeCalculation = function (entry) {
              return entry.size;
            };
          }
          cache = new LRUCache(_objectSpread({}, cacheOptions));

          // Restore persisted data
          for (_i = 0, _Object$entries = Object.entries(persistedData); _i < _Object$entries.length; _i++) {
            _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2), key = _Object$entries$_i[0], value = _Object$entries$_i[1];
            if (!value.expires || value.expires > Date.now()) {
              cache.set(key, value);
            }
          }

          // Set up intervals
          if (!persistInterval) {
            persistInterval = setInterval(/*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee13() {
              return _regeneratorRuntime().wrap(function _callee13$(_context13) {
                while (1) switch (_context13.prev = _context13.next) {
                  case 0:
                    _context13.next = 2;
                    return persistCache(cache);
                  case 2:
                  case "end":
                    return _context13.stop();
                }
              }, _callee13);
            })), CONFIG.persistInterval);
          }

          // Mark as modified to ensure first persistence
          cacheModified = true;
        case 16:
          return _context14.abrupt("return", cache);
        case 17:
        case "end":
          return _context14.stop();
      }
    }, _callee14);
  }));
  return _initializeCache.apply(this, arguments);
}
export function getCacheInstance() {
  return _getCacheInstance.apply(this, arguments);
}
function _getCacheInstance() {
  _getCacheInstance = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee15() {
    return _regeneratorRuntime().wrap(function _callee15$(_context15) {
      while (1) switch (_context15.prev = _context15.next) {
        case 0:
          if (!cachePromise) {
            cachePromise = initializeCache();
          }
          return _context15.abrupt("return", cachePromise);
        case 2:
        case "end":
          return _context15.stop();
      }
    }, _callee15);
  }));
  return _getCacheInstance.apply(this, arguments);
}
function get(_x9) {
  return _get.apply(this, arguments);
} // Update set function to use calculateExpiry
function _get() {
  _get = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee16(key) {
    var cacheInstance, entry;
    return _regeneratorRuntime().wrap(function _callee16$(_context16) {
      while (1) switch (_context16.prev = _context16.next) {
        case 0:
          console.log('get', key);
          _context16.next = 3;
          return getCacheInstance();
        case 3:
          cacheInstance = _context16.sent;
          if (cacheInstance) {
            _context16.next = 6;
            break;
          }
          return _context16.abrupt("return", null);
        case 6:
          entry = cacheInstance.get(key);
          console.log('entry', entry);
          if (entry) {
            _context16.next = 11;
            break;
          }
          stats.misses++;
          return _context16.abrupt("return", null);
        case 11:
          if (!(entry.expires && entry.expires < Date.now())) {
            _context16.next = 15;
            break;
          }
          cacheInstance["delete"](key);
          stats.misses++;
          return _context16.abrupt("return", null);
        case 15:
          stats.hits++;
          return _context16.abrupt("return", entry);
        case 17:
        case "end":
          return _context16.stop();
      }
    }, _callee16);
  }));
  return _get.apply(this, arguments);
}
function set(_x10, _x11, _x12) {
  return _set.apply(this, arguments);
}
function _set() {
  _set = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee17(key, value, ttl) {
    var cacheInstance, size, entry;
    return _regeneratorRuntime().wrap(function _callee17$(_context17) {
      while (1) switch (_context17.prev = _context17.next) {
        case 0:
          _context17.next = 2;
          return getCacheInstance();
        case 2:
          cacheInstance = _context17.sent;
          if (cacheInstance) {
            _context17.next = 5;
            break;
          }
          return _context17.abrupt("return", null);
        case 5:
          if (!(value === undefined || value === null)) {
            _context17.next = 8;
            break;
          }
          logger.dev('Skipping null/undefined value');
          return _context17.abrupt("return", null);
        case 8:
          _context17.prev = 8;
          size = calculateSize(value); // Check size limit before storing
          if (!(size > CONFIG.maxEntrySize)) {
            _context17.next = 13;
            break;
          }
          logger.dev("Value exceeds maxEntrySize (".concat(size, " > ").concat(CONFIG.maxEntrySize, ")"));
          return _context17.abrupt("return", null);
        case 13:
          entry = {
            value: value,
            time: Date.now(),
            size: size,
            expires: calculateExpiry(ttl)
          };
          cacheInstance.set(key, entry);
          cacheModified = true;
          return _context17.abrupt("return", entry);
        case 19:
          _context17.prev = 19;
          _context17.t0 = _context17["catch"](8);
          logger.error('Failed to set cache entry', key, _context17.t0);
          return _context17.abrupt("return", null);
        case 23:
        case "end":
          return _context17.stop();
      }
    }, _callee17, null, [[8, 19]]);
  }));
  return _set.apply(this, arguments);
}
function del(_x13) {
  return _del.apply(this, arguments);
}
function _del() {
  _del = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee18(key) {
    var cacheInstance;
    return _regeneratorRuntime().wrap(function _callee18$(_context18) {
      while (1) switch (_context18.prev = _context18.next) {
        case 0:
          _context18.next = 2;
          return getCacheInstance();
        case 2:
          cacheInstance = _context18.sent;
          if (cacheInstance.has(key)) {
            _context18.next = 6;
            break;
          }
          logger.error('Attempted to delete a non-existent cache entry', key);
          return _context18.abrupt("return");
        case 6:
          try {
            cacheInstance["delete"](key);
            cacheModified = true;
            logger.dev('Successfully deleted cache entry', key);
          } catch (e) {
            logger.error('Failed to delete cache entry', key, e);
          }
        case 7:
        case "end":
          return _context18.stop();
      }
    }, _callee18);
  }));
  return _del.apply(this, arguments);
}
function purgeOldEntries() {
  if (!cache) return;
  var OLD_TIME_PERIOD = 1000 * 60 * 60 * 24 * 5; // 5 days
  try {
    var _iterator = _createForOfIteratorHelper(cache.entries()),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var _step$value = _slicedToArray(_step.value, 2),
          key = _step$value[0],
          value = _step$value[1];
        if (Date.now() - value.time > OLD_TIME_PERIOD) {
          cache["delete"](key);
          logger.dev('Purged old entry', key);
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  } catch (err) {
    logger.error('Failed to purge old entries', err);
  }
}
function checkMemoryPressure() {
  return _checkMemoryPressure.apply(this, arguments);
}
function _checkMemoryPressure() {
  _checkMemoryPressure = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee19() {
    var used, heapUsedPercent;
    return _regeneratorRuntime().wrap(function _callee19$(_context19) {
      while (1) switch (_context19.prev = _context19.next) {
        case 0:
          used = process.memoryUsage();
          heapUsedPercent = used.heapUsed / used.heapTotal * 100;
          if (!(heapUsedPercent > 85)) {
            _context19.next = 8;
            break;
          }
          memoryPressure = true;
          _context19.next = 6;
          return clearLeastRecentlyUsed(20);
        case 6:
          _context19.next = 9;
          break;
        case 8:
          memoryPressure = false;
        case 9:
        case "end":
          return _context19.stop();
      }
    }, _callee19);
  }));
  return _checkMemoryPressure.apply(this, arguments);
}
function clearLeastRecentlyUsed(_x14) {
  return _clearLeastRecentlyUsed.apply(this, arguments);
}
function _clearLeastRecentlyUsed() {
  _clearLeastRecentlyUsed = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee20(percentage) {
    var cacheInstance, entriesToRemove, entries, _iterator3, _step3, _step3$value, key;
    return _regeneratorRuntime().wrap(function _callee20$(_context20) {
      while (1) switch (_context20.prev = _context20.next) {
        case 0:
          _context20.next = 2;
          return getCacheInstance();
        case 2:
          cacheInstance = _context20.sent;
          entriesToRemove = Math.floor(cacheInstance.size * (percentage / 100));
          entries = Array.from(cacheInstance.entries()).sort(function (a, b) {
            return a[1].time - b[1].time;
          }).slice(0, entriesToRemove);
          _iterator3 = _createForOfIteratorHelper(entries);
          try {
            for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
              _step3$value = _slicedToArray(_step3.value, 1), key = _step3$value[0];
              cacheInstance["delete"](key);
            }
          } catch (err) {
            _iterator3.e(err);
          } finally {
            _iterator3.f();
          }
        case 7:
        case "end":
          return _context20.stop();
      }
    }, _callee20);
  }));
  return _clearLeastRecentlyUsed.apply(this, arguments);
}
function _reset() {
  return _reset2.apply(this, arguments);
}
function _reset2() {
  _reset2 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee21() {
    return _regeneratorRuntime().wrap(function _callee21$(_context21) {
      while (1) switch (_context21.prev = _context21.next) {
        case 0:
          if (persistInterval) {
            clearInterval(persistInterval);
            persistInterval = null;
          }
          if (purgeInterval) {
            clearInterval(purgeInterval);
            purgeInterval = null;
          }
          if (memoryCheckInterval) {
            clearInterval(memoryCheckInterval);
            memoryCheckInterval = null;
          }
          cache = null;
          cachePromise = null;
          cacheModified = false;
        case 6:
        case "end":
          return _context21.stop();
      }
    }, _callee21);
  }));
  return _reset2.apply(this, arguments);
}
function cleanup() {
  return _cleanup.apply(this, arguments);
}
function _cleanup() {
  _cleanup = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee22() {
    return _regeneratorRuntime().wrap(function _callee22$(_context22) {
      while (1) switch (_context22.prev = _context22.next) {
        case 0:
          _context22.prev = 0;
          if (!cache) {
            _context22.next = 5;
            break;
          }
          cacheModified = true; // Force final persistence
          _context22.next = 5;
          return persistCache(cache);
        case 5:
          _context22.next = 10;
          break;
        case 7:
          _context22.prev = 7;
          _context22.t0 = _context22["catch"](0);
          logger.error('Error during cleanup:', _context22.t0);
        case 10:
          _context22.prev = 10;
          _context22.next = 13;
          return _reset();
        case 13:
          return _context22.finish(10);
        case 14:
        case "end":
          return _context22.stop();
      }
    }, _callee22, null, [[0, 7, 10, 14]]);
  }));
  return _cleanup.apply(this, arguments);
}
function getStats() {
  return _getStats.apply(this, arguments);
}
function _getStats() {
  _getStats = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee23() {
    var cacheInstance, entries, totalSize, largestEntry;
    return _regeneratorRuntime().wrap(function _callee23$(_context23) {
      while (1) switch (_context23.prev = _context23.next) {
        case 0:
          _context23.next = 2;
          return getCacheInstance();
        case 2:
          cacheInstance = _context23.sent;
          if (cacheInstance) {
            _context23.next = 5;
            break;
          }
          return _context23.abrupt("return", null);
        case 5:
          entries = Array.from(cacheInstance.entries());
          totalSize = entries.reduce(function (acc, _ref6) {
            var _ref7 = _slicedToArray(_ref6, 2),
              _ = _ref7[0],
              value = _ref7[1];
            return acc + (value.size || 0);
          }, 0);
          largestEntry = entries.reduce(function (max, _ref8) {
            var _ref9 = _slicedToArray(_ref8, 2),
              key = _ref9[0],
              value = _ref9[1];
            return (value.size || 0) > (max.size || 0) ? {
              key: key,
              size: value.size
            } : max;
          }, {
            size: 0
          });
          return _context23.abrupt("return", _objectSpread(_objectSpread({}, stats), {}, {
            entryCount: cacheInstance.size,
            totalSize: totalSize,
            largestEntry: largestEntry,
            maxSize: CONFIG.maxSize,
            maxEntries: CONFIG.maxEntries
          }));
        case 9:
        case "end":
          return _context23.stop();
      }
    }, _callee23);
  }));
  return _getStats.apply(this, arguments);
}
function clearExpired() {
  return _clearExpired.apply(this, arguments);
} // Add function to force cache modification (for testing)
function _clearExpired() {
  _clearExpired = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee24() {
    var cacheInstance, now, cleared, _iterator4, _step4, _step4$value, key, value;
    return _regeneratorRuntime().wrap(function _callee24$(_context24) {
      while (1) switch (_context24.prev = _context24.next) {
        case 0:
          _context24.next = 2;
          return getCacheInstance();
        case 2:
          cacheInstance = _context24.sent;
          if (cacheInstance) {
            _context24.next = 5;
            break;
          }
          return _context24.abrupt("return");
        case 5:
          now = Date.now();
          cleared = 0;
          _iterator4 = _createForOfIteratorHelper(cacheInstance.entries());
          try {
            for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
              _step4$value = _slicedToArray(_step4.value, 2), key = _step4$value[0], value = _step4$value[1];
              if (value.expires && value.expires < now) {
                cacheInstance["delete"](key);
                cleared++;
              }
            }
          } catch (err) {
            _iterator4.e(err);
          } finally {
            _iterator4.f();
          }
          return _context24.abrupt("return", cleared);
        case 10:
        case "end":
          return _context24.stop();
      }
    }, _callee24);
  }));
  return _clearExpired.apply(this, arguments);
}
export function _setModified(value) {
  cacheModified = value;
}
export function getConfig() {
  return _objectSpread({}, CONFIG); // Return a copy to prevent mutation
}
export { get, set, del, stats, getStats, clearExpired, configure, cleanup, checkMemoryPressure, _reset };
export function resetConfig() {
  CONFIG = getDefaultConfig();
  // Recalculate CACHE_DIR and CACHE_FILE
  CACHE_DIR = fileOps.path.join(process.cwd(), '.cache');
  CACHE_FILENAME = 'llm-cache.json';
  CACHE_FILE = fileOps.path.join(CACHE_DIR, CACHE_FILENAME);
  cacheModified = true;
}