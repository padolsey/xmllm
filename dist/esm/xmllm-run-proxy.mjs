console.log('Starting Proxy');
import proxy from './xmllm-proxy.mjs';
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
  // Add more configuration options
  maxRequestSize: getArg('maxRequestSize'),
  timeout: getArg('timeout'),
  // Parse boolean flags
  debug: args.includes('--debug'),
  verbose: args.includes('--verbose')
};
console.log('Starting proxy with config:', config);
proxy(config);