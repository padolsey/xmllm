"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formatErrorForStream = formatErrorForStream;
function formatErrorForStream(error, config) {
  var _error$limits;
  if (!error) {
    return config.errorMessages["default"];
  }
  switch (error.code) {
    case 'RATE_LIMIT_ERROR':
      return config.errorMessages.rateLimit.replace('{provider}', error.provider).replace('{resetInMs}', error.resetInMs).replace('{limits}', (_error$limits = error.limits) === null || _error$limits === void 0 ? void 0 : _error$limits.map(function (l) {
        return "".concat(l.type, "=").concat(l.resetInMs, "ms");
      }).join(', '));
    case 'AUTH_ERROR':
      return config.errorMessages.authError.replace('{provider}', error.provider).replace('{details}', error.details);
    case 'TIMEOUT_ERROR':
      return config.errorMessages.timeout.replace('{provider}', error.provider).replace('{timeoutMs}', error.timeoutMs);
    case 'NETWORK_ERROR':
      return config.errorMessages.networkError.replace('{provider}', error.provider).replace('{status}', error.statusCode || '').replace('{details}', error.details || '');
    case 'CIRCUIT_BREAKER_OPEN':
      return config.errorMessages.networkError.replace('{provider}', error.provider);
    default:
      // If it has a message use it, otherwise use default error message
      return error.message || config.errorMessages["default"];
  }
}