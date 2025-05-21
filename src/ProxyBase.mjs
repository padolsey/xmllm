import http from 'http';
import { configure } from './config.mjs';
import StreamManager from './StreamManager.mjs';
import ValidationService from './ValidationService.mjs';
import ResourceLimiter from './ResourceLimiter.mjs';
import PROVIDERS from './PROVIDERS.mjs';

configure({
  logging: {
    level: 'INFO'
  }
});

function validateProxyConfig(config) {
  const errors = [];
  
  const validateLimit = (name, value, min = 1) => {
    if (value !== undefined && value !== null) {
      if (typeof value !== 'number' || isNaN(value)) {
        errors.push(`${name} must be a number, got: ${typeof value}`);
      } else if (value < min) {
        errors.push(`${name} must be >= ${min}, got: ${value}`);
      }
    }
  };

  const validKeys = new Set([
    'port', 'corsOrigins', 'maxRequestSize', 'timeout',
    'debug', 'verbose', 'globalRequestsPerMinute', 'globalTokensPerMinute',
    'globalTokensPerHour', 'globalRequestsPerHour', 'rateLimitMessage',
    'listen', 'errorMessages', 'paths', 'cache'
  ]);

  Object.keys(config).forEach(key => {
    if (!validKeys.has(key)) {
      errors.push(`Unknown configuration key: "${key}"`);
    }
  });

  validateLimit('port', config.port, 1);
  if (config.port > 65535) {
    errors.push(`port must be <= 65535, got: ${config.port}`);
  }

  validateLimit('globalRequestsPerMinute', config.globalRequestsPerMinute);
  validateLimit('globalTokensPerMinute', config.globalTokensPerMinute);
  validateLimit('globalTokensPerHour', config.globalTokensPerHour);
  validateLimit('globalRequestsPerHour', config.globalRequestsPerHour);

  // Timeout validation
  if (config.timeout) {
    validateLimit('timeout', config.timeout, 100);
    if (config.timeout > 300000) {
      errors.push(`timeout must be <= 300000ms, got: ${config.timeout}ms`);
    }
  }

  // CORS validation
  if (config.corsOrigins && typeof config.corsOrigins !== 'string' && !Array.isArray(config.corsOrigins)) {
    errors.push('corsOrigins must be a string or array');
  }

  // Path validation
  if (config.paths) {
    if (typeof config.paths !== 'object') {
      errors.push('paths must be an object');
    } else {
      if (config.paths.stream && typeof config.paths.stream !== 'string') {
        errors.push('paths.stream must be a string');
      }
      if (config.paths.limits && typeof config.paths.limits !== 'string') {
        errors.push('paths.limits must be a string');
      }
    }
  }

  // Add cache validation
  if (config.cache) {
    validateLimit('cache.maxSize', config.cache.maxSize);
    validateLimit('cache.maxEntries', config.cache.maxEntries);
    validateLimit('cache.maxEntrySize', config.cache.maxEntrySize);
    validateLimit('cache.persistInterval', config.cache.persistInterval, 1000);
    validateLimit('cache.ttl', config.cache.ttl);
    
    // Validate cache file options
    if (config.cache.cacheDir && typeof config.cache.cacheDir !== 'string') {
      errors.push('cache.dir must be a string');
    }
    if (config.cache.cacheFilename && typeof config.cache.cacheFilename !== 'string') {
      errors.push('cache.filename must be a string');
    }
  }

  if (errors.length > 0) {
    throw new Error('Invalid proxy configuration:\n- ' + errors.join('\n- '));
  }

  return config;
}

export class ProxyBase {
  constructor(config = {}) {
    this.config = validateProxyConfig(config);
    this.port = this.config.port || process.env.PORT || 3124;
    this.streamManager = new StreamManager(this.config);
    this.maxRequestSize = this.config.maxRequestSize || 1048576;
    this.timeout = this.config.timeout || 30000;
    
    this.globalLimiter = new ResourceLimiter({
      rpm: this.config.globalRequestsPerMinute ? {
        limit: this.config.globalRequestsPerMinute,
        window: 60000
      } : null,
      tpm: this.config.globalTokensPerMinute ? {
        limit: this.config.globalTokensPerMinute,
        window: 60000
      } : null,
      tph: this.config.globalTokensPerHour ? {
        limit: this.config.globalTokensPerHour,
        window: 3600000
      } : null,
      rph: this.config.globalRequestsPerHour ? {
        limit: this.config.globalRequestsPerHour,
        window: 3600000
      } : null
    });

    this.paths = {
      stream: '/api/stream',
      limits: '/api/limits'
    };

    if (this.config?.paths?.stream) {
      this.paths.stream = this.config.paths.stream;
    }

    if (this.config?.paths?.limits) {
      this.paths.limits = this.config.paths.limits;
    }
  }

  handleCORS(req, res) {
    const requestOrigin = req.headers.origin;
    const allowedOrigins = Array.isArray(this.config.corsOrigins) 
      ? this.config.corsOrigins 
      : [this.config.corsOrigins || '*'];

    if (allowedOrigins.includes('*')) {
      res.setHeader('Access-Control-Allow-Origin', requestOrigin || '*');
      res.setHeader('Access-Control-Allow-Credentials', 'false');
    } else if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
      res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    } else {
      res.setHeader('Access-Control-Allow-Origin', 'null');
      res.setHeader('Access-Control-Allow-Credentials', 'false');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  async parseRequestBody(req, res) {
    const buffers = [];
    let totalSize = 0;

    try {
      for await (const chunk of req) {
        totalSize += chunk.length;
        if (totalSize > this.maxRequestSize) {
          res.writeHead(413, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'Request entity too large',
            code: 'PAYLOAD_TOO_LARGE',
            maxSize: this.maxRequestSize
          }));
          return null;
        }
        buffers.push(chunk);
      }
    } catch (readError) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Error reading request body',
        code: 'INVALID_REQUEST'
      }));
      return null;
    }

    try {
      return JSON.parse(Buffer.concat(buffers).toString());
    } catch (parseError) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Invalid JSON in request body',
        code: 'INVALID_JSON'
      }));
      return null;
    }
  }

  checkRateLimits(data) {
    const tokenEstimate = data.messages ? 
      data.messages.reduce((acc, m) => acc + m.content.length / 3, 0) : 0;

    return this.globalLimiter.checkLimits({
      rpm: 1,
      tpm: tokenEstimate,
      tph: tokenEstimate,
      rph: 1
    });
  }

  handleError(error, res) {
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Internal server error',
        code: error.code || 'INTERNAL_ERROR',
        message: error.message
      }));
      return;
    }

    res.write(`event: error\ndata: ${JSON.stringify({
      error: 'Stream error',
      code: error.code || 'STREAM_ERROR',
      message: error.message
    })}\n\n`);
    res.end();
  }

  async handleRequest(req, res) {
    req.setTimeout(this.timeout);
    this.handleCORS(req, res);

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.url === this.paths.limits) {
      return this.handleLimitsRequest(req, res);
    }

    if (req.url === this.paths.stream) {
      return this.handleStreamRequest(req, res);
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      error: 'Not found',
      code: 'NOT_FOUND'
    }));
  }

  async handleLimitsRequest(req, res) {
    if (req.method !== 'GET') {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Method not allowed',
        code: 'METHOD_NOT_ALLOWED'
      }));
      return;
    }

    const status = this.globalLimiter.checkLimits();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(status));
  }

  async handleStreamRequest(req, res) {
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Method not allowed',
        code: 'METHOD_NOT_ALLOWED'
      }));
      return;
    }

    try {
      const data = await this.parseRequestBody(req, res);
      if (!data) return;

      // Check rate limits first
      const limitCheck = this.checkRateLimits(data);

      if (!limitCheck.allowed) {
        const rateLimitMessage = 
          // First check request-level error messages
          (data.errorMessages || {}).rateLimitExceeded ||
          // Then check proxy-level error messages
          this.config.rateLimitMessage || 
          (this.config.errorMessages || {}).rateLimitExceeded || 
          'Rate limit exceeded';

        res.writeHead(429, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: 'Global rate limit exceeded',
          code: 'GLOBAL_RATE_LIMIT',
          limits: limitCheck.limits,
          message: rateLimitMessage
        }));
        return;
      }

      // Then validate request payload
      try {
        ValidationService.validateMessages(data.messages);
        ValidationService.validateModel(data.model, PROVIDERS);
        
        if (data.temperature !== undefined) {
          if (typeof data.temperature !== 'number' || 
              data.temperature < 0 || 
              data.temperature > 1) {
            throw {
              message: 'Temperature must be between 0 and 1',
              code: 'INVALID_TEMPERATURE'
            };
          }
        }
      } catch (validationError) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: validationError.message,
          code: validationError.code || 'VALIDATION_ERROR'
        }));
        return;
      }

      // Consume the rate limits
      this.globalLimiter.consume({
        rpm: 1,
        tpm: data.messages?.reduce((acc, m) => acc + m.content.length / 3, 0) || 0,
        tph: data.messages?.reduce((acc, m) => acc + m.content.length / 3, 0) || 0,
        rph: 1
      });

      await this.handleStreaming(data, res);

    } catch (error) {
      this.handleError(error, res);
    }
  }

  async handleStreaming(data, res) {
    throw new Error('handleStreaming must be implemented by the proxy class');
  }

  listen() {
    const server = http.createServer((req, res) => this.handleRequest(req, res));
    
    server.on('error', (error) => {
      console.error('Server error:', error);
    });

    process.on('SIGTERM', async () => {
      console.log('SIGTERM received. Closing all streams...');
      await this.streamManager.closeAll();
      process.exit(0);
    });

    if (this.config.listen !== false) {
      try {
        server.listen(this.port, () => {
          console.log(`Proxy server listening on port ${this.port}`);
        });
      } catch (error) {
        console.error('Failed to listen on port', this.port, error);
      }
    }

    return server;
  }
} 