#!/usr/bin/env node
"use strict";

var _xmllmProxy = _interopRequireDefault(require("./xmllm-proxy.js"));
var _dotenv = _interopRequireDefault(require("dotenv"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
console.log('Starting Proxy');
// Load environment variables from .env file if present
_dotenv["default"].config();
var args = process.argv.slice(2);

// Helper to parse command line args
var getArg = function getArg(prefix) {
  var arg = args.find(function (arg) {
    return arg.startsWith("--".concat(prefix, "="));
  });
  return arg ? arg.split('=')[1] : undefined;
};

// Helper to safely parse numeric values
var safeParseInt = function safeParseInt(value, name) {
  if (value === undefined) return undefined;
  var parsed = parseInt(value);
  if (isNaN(parsed)) {
    console.error("\x1B[31mError: Invalid value for ".concat(name, ": \"").concat(value, "\". Must be a number.\x1B[0m"));
    process.exit(1);
  }
  return parsed;
};
try {
  var config = {
    corsOrigins: getArg('corsOrigins') || '*',
    port: safeParseInt(getArg('port') || process.env.PORT, 'port') || 3124,
    maxRequestSize: safeParseInt(getArg('maxRequestSize'), 'maxRequestSize'),
    timeout: safeParseInt(getArg('timeout'), 'timeout'),
    debug: args.includes('--debug'),
    verbose: args.includes('--verbose'),
    globalRequestsPerMinute: safeParseInt(getArg('globalRequestsPerMinute') || process.env.GLOBAL_RATE_LIMIT, 'globalRequestsPerMinute'),
    globalTokensPerMinute: safeParseInt(getArg('globalTokensPerMinute') || process.env.GLOBAL_TOKENS_PER_MINUTE, 'globalTokensPerMinute'),
    globalTokensPerHour: safeParseInt(getArg('globalTokensPerHour') || process.env.GLOBAL_TOKENS_PER_HOUR, 'globalTokensPerHour'),
    globalRequestsPerHour: safeParseInt(getArg('globalRequestsPerHour') || process.env.GLOBAL_REQUESTS_PER_HOUR, 'globalRequestsPerHour'),
    rateLimitMessage: getArg('rateLimitMessage')
  };
  console.log('Starting proxy with config:', config);
  (0, _xmllmProxy["default"])(config);
} catch (error) {
  console.error('\x1b[31mFailed to start proxy:\x1b[0m');
  console.error(error.message);
  process.exit(1);
}