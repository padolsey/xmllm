import express from 'express';
import cors from 'cors';
import StreamManager from './StreamManager.mjs';
import ValidationService from './ValidationService.mjs';
import Stream from './Stream.mjs';
import PROVIDERS from './PROVIDERS.mjs';
import ResourceLimiter from './ResourceLimiter.mjs';

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
  const validKeys = new Set([
    'port', 'corsOrigins', 'maxRequestSize', 'timeout',
    'debug', 'verbose', 'globalRequestsPerMinute', 'globalTokensPerMinute',
    'globalTokensPerHour', 'globalRequestsPerHour', 'rateLimitMessage',
    'listen', 'errorMessages'
  ]);

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
  if (config.timeout && config.timeout > 300000) { // 5 minutes max
    errors.push(`timeout must be <= 300000ms, got: ${config.timeout}ms`);
  }

  // CORS validation
  if (config.corsOrigins && typeof config.corsOrigins !== 'string' && !Array.isArray(config.corsOrigins)) {
    errors.push('corsOrigins must be a string or array');
  }

  // Max request size validation
  if (config.maxRequestSize) {
    validateLimit('maxRequestSize', config.maxRequestSize, 100);
    if (config.maxRequestSize > 1024 * 1024) { // 1MB max
      errors.push(`maxRequestSize must be <= 1048576 bytes, got: ${config.maxRequestSize}`);
    }
  }

  if (errors.length > 0) {
    throw new Error('Invalid proxy configuration:\n- ' + errors.join('\n- '));
  }

  return config;
}

/**
 * Express server that acts as a proxy between browser clients and LLM APIs.
 * 
 * Responsibilities:
 * - Handles HTTP/SSE connections from browsers
 * - Validates incoming requests
 * - Routes requests to StreamManager
 * - Manages CORS and security
 * - Handles graceful shutdown
 * 
 * Provides a secure way for browser clients to access LLM APIs without
 * exposing API keys.
 * 
 * @example
 * // Start proxy server
 * createServer({
 *   port: 3124,
 *   corsOrigins: '*'
 * });
 */
function createServer(config = {}) {
  // Validate configuration before proceeding
  try {
    validateProxyConfig(config);
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', error.message); // Red error text
    throw error;
  }

  const app = express();
  const port = config.port || process.env.PORT || 3124;
  const streamManager = new StreamManager(config);

  // Initialize global resource limiter with proxy-wide constraints
  const globalLimiter = new ResourceLimiter({
    rpm: config.globalRequestsPerMinute ? {
      limit: config.globalRequestsPerMinute,
      window: 60000 // 1 minute
    } : null,
    tpm: config.globalTokensPerMinute ? {
      limit: config.globalTokensPerMinute,
      window: 60000
    } : null,
    tph: config.globalTokensPerHour ? {
      limit: config.globalTokensPerHour,
      window: 3600000 // 1 hour
    } : null,
    rph: config.globalRequestsPerHour ? {
      limit: config.globalRequestsPerHour,
      window: 3600000
    } : null
  });

  const corsOptions = {
    origin: config.corsOrigins || '*', // all by default
    methods: ['GET', 'POST'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type'], // Allowed headers
    credentials: true, // Allow sending credentials (cookies, etc.)
  };

  app.use(cors(corsOptions));
  app.use(express.json());

  console.log('Starting Proxy Server with config', config, 'Port:', port);

  app.post('/api/stream', async (req, res) => {
    console.log('Stream request', req.body);
    try {
      const {
        messages,
        model = [
          'claude:good',
          'openai:good',
          'togetherai:good',
          'claude:fast',
          'openai:fast',
          'togetherai:fast'
        ],
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
      } = req.body;

      // Fall back to proxy level error message configuration
      const errorMessagesConfig = {
        ...(config.errorMessages || {}),
        ...(errorMessages || {})
      };

      const rateLimitMessage = errorMessagesConfig.rateLimitExceeded || 'Please try again later';

      try {
        // Validate all inputs
        ValidationService.validateMessages(messages);
        ValidationService.validateModel(model, PROVIDERS);
        ValidationService.validateParameters({
          temperature,
          max_tokens,
          maxTokens,
          top_p,
          topP,
          presence_penalty,
          presencePenalty,
          stream,
          cache
        });
      } catch (error) {
        return res.status(400).json({
          error: error.message,
          code: error.code || 'VALIDATION_ERROR',
          details: error.details
        });
      }

      // Check global limits before processing request
      const tokenEstimate = req.body.messages ? 
        req.body.messages.reduce((acc, m) => acc + m.content.length / 3, 0) : 0;

      const limitCheck = globalLimiter.checkLimits({
        rpm: 1,
        tpm: tokenEstimate,
        tph: tokenEstimate,
        rph: 1
      });

      if (!limitCheck.allowed) {
        return res.status(429).json({
          error: 'Global rate limit exceeded',
          code: 'GLOBAL_RATE_LIMIT',
          limits: limitCheck.limits,
          message: rateLimitMessage
        });
      }

      // Consume the resources if check passed
      globalLimiter.consume({
        rpm: 1,
        tpm: tokenEstimate,
        tph: tokenEstimate,
        rph: 1
      });

      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });

      console.log('Error messages config:', errorMessagesConfig);

      const theStream = await Stream({
        messages,
        max_tokens,
        maxTokens,
        temperature,
        top_p,
        topP,
        presence_penalty,
        presencePenalty,
        errorMessages: errorMessagesConfig,
        stop,
        fakeDelay,
        model,
        cache,
        stream: stream == null ? true : stream
      });

      await streamManager.createStream(theStream, res);

    } catch (error) {
      console.error('Error in stream request:', error);
      
      // Set error status code
      res.status(500);
      
      // Ensure proper SSE headers are set
      res.writeHead(500, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });

      const errorResponse = {
        error: 'Internal server error',
        code: error.code || 'INTERNAL_ERROR',
        message: error.message
      };
      
      // Make sure we're sending a proper SSE event
      res.write(`event: error\ndata: ${JSON.stringify(errorResponse)}\n\n`);
      res.end();
    }
  });

  // Add endpoint to check current rate limit status
  app.get('/api/limits', (req, res) => {
    const status = globalLimiter.checkLimits();
    res.json(status);
  });

  process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Closing all streams...');
    await streamManager.closeAll();
    process.exit(0);
  });

  if (config.listen !== false) { // Allow disabling listen for testing
    app.listen(port, () => {
      console.log(`Proxy server listening on port ${port}`);
    });
  }

  return app;
}

export default createServer;
