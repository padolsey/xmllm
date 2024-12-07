#!/usr/bin/env node

console.log('Starting Proxy');
import proxy from './xmllm-proxy.mjs';
import dotenv from 'dotenv';

// Load environment variables from .env file if present
dotenv.config();

const args = process.argv.slice(2);

// Helper to parse command line args
const getArg = (prefix) => {
  const arg = args.find(arg => arg.startsWith(`--${prefix}=`));
  return arg ? arg.split('=')[1] : undefined;
};

// Helper to safely parse numeric values
const safeParseInt = (value, name) => {
  if (value === undefined) return undefined;
  const parsed = parseInt(value);
  if (isNaN(parsed)) {
    console.error(`\x1b[31mError: Invalid value for ${name}: "${value}". Must be a number.\x1b[0m`);
    process.exit(1);
  }
  return parsed;
};

try {
  const config = {
    corsOrigins: getArg('corsOrigins') || '*',
    port: safeParseInt(getArg('port') || process.env.PORT, 'port') || 3124,
    maxRequestSize: safeParseInt(getArg('maxRequestSize'), 'maxRequestSize'),
    timeout: safeParseInt(getArg('timeout'), 'timeout'),
    debug: args.includes('--debug'),
    verbose: args.includes('--verbose'),
    globalRequestsPerMinute: safeParseInt(
      getArg('globalRequestsPerMinute') || process.env.GLOBAL_RATE_LIMIT,
      'globalRequestsPerMinute'
    ),
    globalTokensPerMinute: safeParseInt(
      getArg('globalTokensPerMinute') || process.env.GLOBAL_TOKENS_PER_MINUTE,
      'globalTokensPerMinute'
    ),
    globalTokensPerHour: safeParseInt(
      getArg('globalTokensPerHour') || process.env.GLOBAL_TOKENS_PER_HOUR,
      'globalTokensPerHour'
    ),
    globalRequestsPerHour: safeParseInt(
      getArg('globalRequestsPerHour') || process.env.GLOBAL_REQUESTS_PER_HOUR,
      'globalRequestsPerHour'
    ),
    rateLimitMessage: getArg('rateLimitMessage'),
  };

  console.log('Starting proxy with config:', config);
  proxy(config);

} catch (error) {
  console.error('\x1b[31mFailed to start proxy:\x1b[0m');
  console.error(error.message);
  process.exit(1);
}