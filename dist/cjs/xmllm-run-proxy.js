"use strict";

var _xmllmProxy = _interopRequireDefault(require("./xmllm-proxy.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
console.log('Starting Proxy');
var args = process.argv.slice(2);
var corsOrigins = args.find(function (arg) {
  return arg.startsWith('--corsOrigins=');
});
var config = {
  corsOrigins: corsOrigins ? corsOrigins.split('=')[1] : '*'
};
(0, _xmllmProxy["default"])(config);