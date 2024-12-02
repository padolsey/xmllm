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

const config = {
  corsOrigins: getArg('corsOrigins') || '*',
  port: getArg('port') || process.env.PORT || 3124,
  maxRequestSize: getArg('maxRequestSize'),
  timeout: getArg('timeout'),
  debug: args.includes('--debug'),
  verbose: args.includes('--verbose')
};

console.log('Starting proxy with config:', config);
proxy(config);