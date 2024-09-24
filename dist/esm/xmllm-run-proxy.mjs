console.log('Starting Proxy');
import proxy from './xmllm-proxy.mjs';
var args = process.argv.slice(2);
var corsOrigins = args.find(function (arg) {
  return arg.startsWith('--corsOrigins=');
});
var config = {
  corsOrigins: corsOrigins ? corsOrigins.split('=')[1] : '*'
};
proxy(config);