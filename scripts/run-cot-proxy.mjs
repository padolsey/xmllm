import createServer from '../src/proxies/cot.mjs';

createServer({
  port: 3124,
  paths: {
    stream: '/v1/chat/completions',
    limits: '/v1/rate_limits'  // optional
  }
}); 