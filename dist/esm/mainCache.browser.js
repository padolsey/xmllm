// Browser-safe version - all cache operations are no-ops
export var stats = {
  hits: 0,
  misses: 0
};
export var configure = function configure() {};
export var get = function get() {
  return null;
};
export var set = function set(_, value) {
  return value;
};
export var del = function del() {};
export var setLogger = function setLogger() {};
export var resetConfig = function resetConfig() {};
export var _reset = function _reset() {};
export var getDefaultConfig = function getDefaultConfig() {
  return {};
};