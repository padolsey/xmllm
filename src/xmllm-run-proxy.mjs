console.log('Starting Proxy');
import proxy from './xmllm-proxy.mjs';

const args = process.argv.slice(2);

// Helper to parse command line args
const getArg = (prefix) => {
  const arg = args.find(arg => arg.startsWith(`--${prefix}=`));
  return arg ? arg.split('=')[1] : undefined;
};

const config = {
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