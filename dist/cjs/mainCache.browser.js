"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.stats = exports.setLogger = exports.set = exports.resetConfig = exports.getDefaultConfig = exports.get = exports.del = exports.configure = exports._reset = void 0;
// Browser-safe version - all cache operations are no-ops
var stats = exports.stats = {
  hits: 0,
  misses: 0
};
var configure = exports.configure = function configure() {};
var get = exports.get = function get() {
  return null;
};
var set = exports.set = function set(_, value) {
  return value;
};
var del = exports.del = function del() {};
var setLogger = exports.setLogger = function setLogger() {};
var resetConfig = exports.resetConfig = function resetConfig() {};
var _reset = exports._reset = function _reset() {};
var getDefaultConfig = exports.getDefaultConfig = function getDefaultConfig() {
  return {};
};