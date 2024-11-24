"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.simple = simple;
exports.stream = stream;
var _XMLStream = _interopRequireDefault(require("./XMLStream.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function stream(prompt) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return new _XMLStream["default"]([['req', prompt]], options);
}
function simple(prompt) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  // Return the XMLStream instance directly
  return stream(prompt, options);
}

// Add a new method to XMLStream class to get final value