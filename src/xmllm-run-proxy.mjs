#!/usr/bin/env node

console.log('Starting Proxy');
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

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
  const proxyPath = join(dirname(dirname(fileURLToPath(import.meta.url))), 'src/proxies', `${proxyType}.mjs`);

  console.log(`Loading proxy: ${proxyType} from ${proxyPath}`);

  let createProxy;
  try {
    const module = await import(proxyPath);
    createProxy = module.default;
    if (typeof createProxy !== 'function') {
      throw new Error(`Proxy module '${proxyType}' does not export a default function`);
    }
  } catch (importError) {
    if (importError.code === 'ERR_MODULE_NOT_FOUND') {
      throw new Error(
        `Proxy type '${proxyType}' not found. Available proxies are in the 'proxies' directory.\n` +
        `Try:\n` +
        `  - default (standard proxy)\n` +
        `  - cot (chain of thought proxy)\n` +
        `Or create a new one at: src/proxies/${proxyType}.mjs`
      );
    }
    throw importError;
  }

  const config = {
    corsOrigins: getArg('corsOrigins') || '*',
    port: safeParseInt(getArg('port') || process.env.PORT, 'port') || 3124,
    maxRequestSize: safeParseInt(getArg('maxRequestSize'), 'maxRequestSize'),
    timeout: safeParseInt(getArg('timeout'), 'timeout'),
    debug: args.includes('--debug'),
    verbose: args.includes('--verbose'),
    paths: {
      stream: getArg('paths.stream'),  // Will be a string or undefined
      limits: getArg('paths.limits')   // Will be a string or undefined
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
  };

  console.log('Starting proxy with config:', config);

  createProxy(config);

} catch (error) {
  console.error('\x1b[31mFailed to start proxy:\x1b[0m');
  console.error(error.message);
  process.exit(1);
}