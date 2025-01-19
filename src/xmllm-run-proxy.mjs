#!/usr/bin/env node

console.log('Starting Proxy');
import dotenv from 'dotenv';
import createDefaultProxy from './proxies/default.mjs';
import createCoTProxy from './proxies/cot.mjs';
import { configure as configureCache } from './mainCache.mjs';

// Load environment variables from .env file if present
dotenv.config();

const args = process.argv.slice(2);

// Helper to parse command line args with support for nested properties
const getArg = (prefix) => {
  const arg = args.find(arg => arg.startsWith(`--${prefix}=`));
  if (!arg) return undefined;

  const value = arg.split('=')[1];
  return value;
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
  // Get proxy type from command line or default to 'default'
  const proxyType = getArg('type') || 'default';
  
  // Simple mapping of proxy types to their create functions
  const proxyCreators = {
    default: createDefaultProxy,
    cot: createCoTProxy
  };

  const createProxy = proxyCreators[proxyType];
  if (!createProxy) {
    throw new Error(
      `Proxy type '${proxyType}' not found. Available proxies are:\n` +
      `  - default (standard proxy)\n` +
      `  - cot (chain of thought proxy)`
    );
  }

  const config = {
    corsOrigins: getArg('corsOrigins') || '*',
    port: safeParseInt(getArg('port') || process.env.PORT, 'port') || 3124,
    maxRequestSize: safeParseInt(getArg('maxRequestSize'), 'maxRequestSize'),
    timeout: safeParseInt(getArg('timeout'), 'timeout'),
    debug: args.includes('--debug'),
    verbose: args.includes('--verbose'),
    paths: {
      stream: getArg('paths.stream'),
      limits: getArg('paths.limits')
    },
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
    cache: {
      maxSize: safeParseInt(getArg('cache.maxSize'), 'cache.maxSize'),
      maxEntries: safeParseInt(getArg('cache.maxEntries'), 'cache.maxEntries'),
      maxEntrySize: safeParseInt(getArg('cache.maxEntrySize'), 'cache.maxEntrySize'),
      persistInterval: safeParseInt(getArg('cache.persistInterval'), 'cache.persistInterval'),
      ttl: safeParseInt(getArg('cache.ttl'), 'cache.ttl'),
      cacheDir: getArg('cache.dir'),
      cacheFilename: getArg('cache.filename')
    }
  };

  // Configure cache if options provided
  if (Object.values(config.cache).some(v => v !== undefined)) {
    configureCache({ cache: config.cache });
  }

  console.log('Starting proxy with config:', config);

  createProxy(config);

} catch (error) {
  console.error('\x1b[31mFailed to start proxy:\x1b[0m');
  console.error(error.message);
  process.exit(1);
}