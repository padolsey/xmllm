import http from 'http';
import { configure } from '../src/config.mjs';
configure({
  logging: {
    level: 'INFO'
  }
});
import StreamManager from '../src/StreamManager.mjs';
import ValidationService from '../src/ValidationService.mjs';
import Stream from '../src/Stream.mjs';
import PROVIDERS from '../src/PROVIDERS.mjs';
import ResourceLimiter from '../src/ResourceLimiter.mjs';

// Add configuration validation
function validateProxyConfig(config) {
  const errors = [];

  // Helper to validate numeric limits
  const validateLimit = (name, value, min = 1) => {
    if (value !== undefined && value !== null) {
      if (typeof value !== 'number' || isNaN(value)) {
        errors.push(`${name} must be a number, got: ${typeof value}`);
      } else if (value < min) {
        errors.push(`${name} must be >= ${min}, got: ${value}`);
      }
    }
  };

  // Check for unknown configuration keys
  const validKeys = new Set(['port', 'corsOrigins', 'maxRequestSize', 'timeout', 'debug', 'verbose', 'globalRequestsPerMinute', 'globalTokensPerMinute', 'globalTokensPerHour', 'globalRequestsPerHour', 'rateLimitMessage', 'listen', 'errorMessages']);
  Object.keys(config).forEach(key => {
    if (!validKeys.has(key)) {
      errors.push(`Unknown configuration key: "${key}". Did you mean one of: ${Array.from(validKeys).join(', ')}?`);
    }
  });

  // Port validation
  validateLimit('port', config.port, 1);
  if (config.port > 65535) {
    errors.push(`port must be <= 65535, got: ${config.port}`);
  }

  // Rate limit validations
  validateLimit('globalRequestsPerMinute', config.globalRequestsPerMinute);
  validateLimit('globalTokensPerMinute', config.globalTokensPerMinute);
  validateLimit('globalTokensPerHour', config.globalTokensPerHour);
  validateLimit('globalRequestsPerHour', config.globalRequestsPerHour);

  // Timeout validation
  validateLimit('timeout', config.timeout, 100);
  if (config.timeout && config.timeout > 300000) {
    // 5 minutes max
    errors.push(`timeout must be <= 300000ms, got: ${config.timeout}ms`);
  }

  // CORS validation
  if (config.corsOrigins && typeof config.corsOrigins !== 'string' && !Array.isArray(config.corsOrigins)) {
    errors.push('corsOrigins must be a string or array');
  }

  // Max request size validation
  if (config.maxRequestSize) {
    validateLimit('maxRequestSize', config.maxRequestSize, 100);
    if (config.maxRequestSize > 1024 * 1024) {
      // 1MB max
      errors.push(`maxRequestSize must be <= 1048576 bytes, got: ${config.maxRequestSize}`);
    }
  }
  if (errors.length > 0) {
    throw new Error('Invalid proxy configuration:\n- ' + errors.join('\n- '));
  }
  return config;
}

/**
 * HTTP server that acts as a proxy between browser clients and LLM APIs.
 * Uses Node's built-in http module instead of Express.
 */
function createServer(config = {}) {
  // Validate configuration before proceeding
  try {
    validateProxyConfig(config);
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', error.message);
    throw error;
  }
  const port = config.port || process.env.PORT || 3124;
  const streamManager = new StreamManager(config);
  const maxRequestSize = config.maxRequestSize || 1048576; // Default 1MB
  const timeout = config.timeout || 30000; // Default 30s

  // Initialize global resource limiter
  const globalLimiter = new ResourceLimiter({
    rpm: config.globalRequestsPerMinute ? {
      limit: config.globalRequestsPerMinute,
      window: 60000
    } : null,
    tpm: config.globalTokensPerMinute ? {
      limit: config.globalTokensPerMinute,
      window: 60000
    } : null,
    tph: config.globalTokensPerHour ? {
      limit: config.globalTokensPerHour,
      window: 3600000
    } : null,
    rph: config.globalRequestsPerHour ? {
      limit: config.globalRequestsPerHour,
      window: 3600000
    } : null
  });
  const server = http.createServer(async (req, res) => {
    // Set timeout
    req.setTimeout(timeout);

    // Handle CORS with proper origin checking
    const requestOrigin = req.headers.origin;
    const allowedOrigins = Array.isArray(config.corsOrigins) ? config.corsOrigins : [config.corsOrigins || '*'];
    if (allowedOrigins.includes('*')) {
      // For wildcard, echo back the requesting origin but don't allow credentials
      res.setHeader('Access-Control-Allow-Origin', requestOrigin || '*');
      res.setHeader('Access-Control-Allow-Credentials', 'false');
    } else if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
      // For specific allowed origins, allow credentials
      res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    } else {
      // For disallowed origins
      res.setHeader('Access-Control-Allow-Origin', 'null');
      res.setHeader('Access-Control-Allow-Credentials', 'false');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // Handle rate limit status endpoint
    if (req.url === '/api/limits') {
      if (req.method !== 'GET') {
        res.writeHead(405, {
          'Content-Type': 'application/json'
        });
        res.end(JSON.stringify({
          error: 'Method not allowed',
          code: 'METHOD_NOT_ALLOWED'
        }));
        return;
      }
      const status = globalLimiter.checkLimits();
      res.writeHead(200, {
        'Content-Type': 'application/json'
      });
      res.end(JSON.stringify(status));
      return;
    }

    // Handle stream endpoint
    if (req.url === '/api/stream') {
      if (req.method !== 'POST') {
        res.writeHead(405, {
          'Content-Type': 'application/json'
        });
        res.end(JSON.stringify({
          error: 'Method not allowed',
          code: 'METHOD_NOT_ALLOWED'
        }));
        return;
      }
      try {
        // Parse JSON body with size limit
        const buffers = [];
        let totalSize = 0;
        try {
          for await (const chunk of req) {
            totalSize += chunk.length;
            if (totalSize > maxRequestSize) {
              res.writeHead(413, {
                'Content-Type': 'application/json'
              });
              res.end(JSON.stringify({
                error: 'Request entity too large',
                code: 'PAYLOAD_TOO_LARGE',
                maxSize: maxRequestSize
              }));
              return;
            }
            buffers.push(chunk);
          }
        } catch (readError) {
          res.writeHead(400, {
            'Content-Type': 'application/json'
          });
          res.end(JSON.stringify({
            error: 'Error reading request body',
            code: 'INVALID_REQUEST'
          }));
          return;
        }
        let data;
        try {
          data = JSON.parse(Buffer.concat(buffers).toString());
        } catch (parseError) {
          res.writeHead(400, {
            'Content-Type': 'application/json'
          });
          res.end(JSON.stringify({
            error: 'Invalid JSON in request body',
            code: 'INVALID_JSON'
          }));
          return;
        }
        const {
          messages,
          model = ['anthropic:good', 'openai:good', 'togetherai:good', 'anthropic:fast', 'openai:fast', 'togetherai:fast'],
          max_tokens,
          maxTokens,
          temperature,
          top_p,
          topP,
          presence_penalty,
          presencePenalty,
          errorMessages,
          fakeDelay,
          stop,
          cache,
          stream
        } = data;

        // Normalize parameters
        const normalizedParams = {
          max_tokens: max_tokens || maxTokens,
          top_p: top_p || topP,
          presence_penalty: presence_penalty || presencePenalty
        };

        // Fall back to proxy level error message configuration
        const errorMessagesConfig = {
          ...(config.errorMessages || {}),
          ...(errorMessages || {})
        };
        const rateLimitMessage = errorMessagesConfig.rateLimitExceeded || 'Please try again later';
        try {
          // Validate inputs
          ValidationService.validateMessages(messages);
          ValidationService.validateModel(model, PROVIDERS);
          ValidationService.validateLLMPayload({
            temperature,
            ...normalizedParams,
            stream,
            cache
          });
        } catch (error) {
          res.writeHead(400, {
            'Content-Type': 'application/json'
          });
          res.end(JSON.stringify({
            error: error.message,
            code: error.code || 'VALIDATION_ERROR',
            details: error.details
          }));
          return;
        }

        // Check global limits
        const tokenEstimate = messages ? messages.reduce((acc, m) => acc + m.content.length / 3, 0) : 0;
        const limitCheck = globalLimiter.checkLimits({
          rpm: 1,
          tpm: tokenEstimate,
          tph: tokenEstimate,
          rph: 1
        });
        if (!limitCheck.allowed) {
          res.writeHead(429, {
            'Content-Type': 'application/json'
          });
          res.end(JSON.stringify({
            error: 'Global rate limit exceeded',
            code: 'GLOBAL_RATE_LIMIT',
            limits: limitCheck.limits,
            message: rateLimitMessage
          }));
          return;
        }

        // Consume resources
        globalLimiter.consume({
          rpm: 1,
          tpm: tokenEstimate,
          tph: tokenEstimate,
          rph: 1
        });

        // Set SSE headers
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        });
        const theStream = await Stream({
          messages,
          ...normalizedParams,
          temperature,
          errorMessages: errorMessagesConfig,
          stop,
          fakeDelay,
          model,
          cache,
          stream: stream == null ? true : stream
        });
        await streamManager.createStream(theStream, res);
      } catch (error) {
        // If headers haven't been sent, send JSON error
        if (!res.headersSent) {
          res.writeHead(500, {
            'Content-Type': 'application/json'
          });
          res.end(JSON.stringify({
            error: 'Internal server error',
            code: error.code || 'INTERNAL_ERROR',
            message: error.message
          }));
          return;
        }

        // If headers were sent (SSE started), send error event
        const errorResponse = {
          error: 'Stream error',
          code: error.code || 'STREAM_ERROR',
          message: error.message
        };
        res.write(`event: error\ndata: ${JSON.stringify(errorResponse)}\n\n`);
        res.end();
      }
      return;
    }

    // Handle unknown endpoints
    res.writeHead(404, {
      'Content-Type': 'application/json'
    });
    res.end(JSON.stringify({
      error: 'Not found',
      code: 'NOT_FOUND'
    }));
  });

  // Handle server errors
  server.on('error', error => {
    console.error('Server error:', error);
  });
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Closing all streams...');
    await streamManager.closeAll();
    process.exit(0);
  });
  if (config.listen !== false) {
    server.listen(port, () => {
      console.log(`Proxy server listening on port ${port}`);
    });
  }
  return server;
}
export default createServer;