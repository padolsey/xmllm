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
var config = {
  corsOrigins: getArg('corsOrigins') || '*',
  port: getArg('port') || process.env.PORT || 3124,
  maxRequestSize: getArg('maxRequestSize'),
  timeout: getArg('timeout'),
  debug: args.includes('--debug'),
  verbose: args.includes('--verbose')
};
console.log('Starting proxy with config:', config);
(0, _xmllmProxy["default"])(config);