console.log('Starting Proxy');
import proxy from './xmllm-proxy.mjs';

const args = process.argv.slice(2);
const corsOrigins = args.find(arg => arg.startsWith('--corsOrigins='));

const config = {
  corsOrigins: corsOrigins ? corsOrigins.split('=')[1] : '*'
};

proxy(config);