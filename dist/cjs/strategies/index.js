"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getStrategy = getStrategy;
var _config = require("../config.js");
var xmlStrategies = _interopRequireWildcard(require("./xml.js"));
var idioStrategies = _interopRequireWildcard(require("./idio.js"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
/**
 * Get the appropriate strategies based on the global parser configuration
 */
function getStrategies() {
  var config = (0, _config.getConfig)();
  var parserType = config.globalParser || 'xml';
  if (parserType === 'xml') {
    return xmlStrategies;
  } else if (parserType === 'idio') {
    return idioStrategies;
  } else {
    throw new Error("Unknown parser type: ".concat(parserType));
  }
}

/**
 * Get a prompt strategy by ID, falling back to default if not found
 * @param {string} id - The strategy ID to retrieve
 * @returns {PromptStrategy} The requested strategy or default strategy
 */
function getStrategy(id) {
  var strategiesModule = getStrategies();
  return strategiesModule.getStrategy(id);
}