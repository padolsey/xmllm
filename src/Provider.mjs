import Logger from './Logger.mjs';
import { 
  ProviderError,
  ProviderRateLimitError,
  ProviderAuthenticationError,
  ProviderNetworkError,
  ProviderTimeoutError,
  ModelValidationError
} from './errors/ProviderErrors.mjs';
import { createParser } from 'eventsource-parser';
import innerTruncate from './innerTruncate.mjs';
import ValidationService from './ValidationService.mjs';
import ResourceLimiter from './ResourceLimiter.mjs';

// Use native AbortController if available (modern environments), otherwise try to import
const AbortController = globalThis.AbortController || 
  (typeof window !== 'undefined' ? window.AbortController : null);

if (!AbortController) {
  throw new Error('AbortController is not available in this environment. Please use a newer version of Node.js or install the abort-controller package.');
}

function estimateTokenCount(m) { return m.length / 3; }

const logger = new Logger('Provider');

const DEFAULT_ASSUMED_MAX_CONTEXT_SIZE = 8_000;
const DEFAULT_RESPONSE_TOKEN_LENGTH = 300;
const MAX_TOKEN_HISTORICAL_MESSAGE = 600;

const VALID_ROLES = ['user', 'assistant'];

/**
 * Handles direct communication with LLM APIs.
 * 
 * Responsibilities:
 * - Makes HTTP requests to LLM endpoints
 * - Handles rate limiting and quotas
 * - Manages retries and circuit breaking
 * - Transforms payloads for specific providers
 * - Streams responses back to ProviderManager
 * 
 * Each Provider instance represents a specific LLM service (OpenAI, Claude, etc)
 * with its own configuration and constraints.
 * 
 * @example
 * const provider = new Provider('claude', {
 *   endpoint: 'https://api.anthropic.com/v1/messages',
 *   key: process.env.ANTHROPIC_API_KEY,
 *   models: { fast: { name: 'claude-3-haiku' } }
 * });
 */
class Provider {
  static _globalFetch = fetch;

  static setGlobalFetch(fetchFn) {
    Provider._globalFetch = fetchFn;
  }

  get constraints() { // backward compatibility
    const limits = {};
    for (const [name, bucket] of this.resourceLimiter.buckets) {
      const constraintName = {
        rpm: 'rpmLimit',
        tpm: 'tokensPerMinute',
        rph: 'requestsPerHour'
      }[name] || name;
      
      limits[constraintName] = bucket.limit;
    }
    return limits;
  }

  get fetch() {
    return Provider._globalFetch;
  }

  constructor(name, details, configOverrides = {}) {
    this.name = name;
    this.endpoint = details.endpoint;
    this.key = details.key;
    this.models = details.models || {};
    this.payloader = details.payloader || this.defaultPayloader;
    this.headerGen = details.headerGen || this.defaultHeaderGen;

    // Initialize resource limiter with provider constraints
    this.resourceLimiter = new ResourceLimiter({
      rpm: details.constraints?.rpmLimit ? {
        limit: details.constraints.rpmLimit,
        window: 60000 // 1 minute
      } : { limit: Infinity, window: 60000 },  // Default to unlimited
      tpm: details.constraints?.tokensPerMinute ? {
        limit: details.constraints.tokensPerMinute,
        window: 60000
      } : null,
      rph: details.constraints?.requestsPerHour ? {
        limit: details.constraints.requestsPerHour,
        window: 3600000 // 1 hour
      } : null
    });

    // Configurable properties
    this.REQUEST_TIMEOUT_MS = process.env.NODE_ENV === 'test' 
      ? 1000  // 1 second for tests
      : (configOverrides.REQUEST_TIMEOUT_MS || 50_000);
    this.MAX_RETRIES = configOverrides.MAX_RETRIES || 2;
    this.RETRY_DELAY_WHEN_OVERLOADED = configOverrides.RETRY_DELAY_WHEN_OVERLOADED || 1000;

    // Circuit breaker properties
    this.errorCount = 0;
    this.lastErrorTime = null;
    this.circuitBreakerThreshold = configOverrides.circuitBreakerThreshold || 5;
    this.circuitBreakerResetTime = configOverrides.circuitBreakerResetTime || 60000;
  }

  defaultPayloader(payload) {
    return payload;
  }

  defaultHeaderGen() {
    return this.getHeaders();
  }

  async makeRequest(payload) {
    logger.log('Starting makeRequest');

    // Apply any request-specific constraints
    if (payload.constraints?.rpmLimit) {
      logger.log('Applying request-specific RPM limit:', payload.constraints.rpmLimit);
      this.resourceLimiter.setLimits({
        rpm: {
          limit: payload.constraints.rpmLimit,
          window: 60000
        }
      });
    }

    if (this.isCircuitBroken()) {
      throw new ProviderError(
        `Circuit breaker is open for provider ${this.name}`,
        'CIRCUIT_BREAKER_OPEN',
        this.name
      );
    }

    // Check resource limits
    const limitCheck = this.resourceLimiter.consume({
      rpm: 1,
      ...(payload.messages ? {
        tpm: estimateTokenCount(payload.messages.join(''))
      } : {})
    });

    logger.log('Resource limit check result:', limitCheck);

    if (!limitCheck.allowed) {
      logger.log('Resource limit exceeded, throwing error');
      throw new ProviderRateLimitError(
        this.name,
        limitCheck.limits.rpm.resetInMs,
        Object.entries(limitCheck.limits)
          .filter(([_, status]) => !status.allowed)
          .map(([name, status]) => ({
            type: name,
            resetInMs: status.resetInMs
          }))
      );
    }

    let retries = 0;
    const maxRetries = this.MAX_RETRIES;
    let lastError = null;

    while (retries <= maxRetries) {
      try {
        const result = await this.attemptRequest(payload);
        this.resetCircuitBreaker(); // Success, reset error count
        return result;
      } catch (error) {
        lastError = error;
        
        if (!this.shouldRetry(error)) {
          this.incrementCircuitBreaker(error);
          throw error;
        }

        const delay = this.calculateBackoff(retries);
        await this.delay(delay);
        retries++;
      }
    }

    throw lastError;
  }

  async attemptRequest(payload) {
    const preparedPayload = this.preparePayload(payload);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT_MS);

    try {
      const response = await this.fetch(this.endpoint, {
        method: 'POST',
        headers: this.headerGen ? this.headerGen.call(this) : this.getHeaders(),
        body: JSON.stringify(preparedPayload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response?.ok) {
        throw await this.handleErrorResponse(response);
      }

      const data = await response.json();
      return data?.content?.[0]?.text
        ? {content: data?.content?.[0]?.text}
        : data?.choices?.[0]?.message;

    } catch (error) {
      if (error.name === 'AbortError') {
        throw new ProviderTimeoutError(this.name, this.REQUEST_TIMEOUT_MS);
      }
      throw error;
    }
  }

  async handleErrorResponse(response) {
    logger.log('Handling error response:', {
      status: response?.status,
      headers: response?.headers?.get ? {
        'Retry-After': response.headers.get('Retry-After')
      } : null
    });

    if (!response) {
      throw new ProviderNetworkError(
        this.name,
        undefined,
        'No response received'
      );
    }

    const errorBody = await response.text();
    logger.log('Error body:', errorBody);
    
    switch (response.status) {
      case 401:
      case 403:
        throw new ProviderAuthenticationError(this.name, errorBody);
      case 429:
        logger.log('Detected 429 rate limit response');
        const retryAfter = response.headers.get('Retry-After');
        logger.log('Retry-After header:', retryAfter);
        throw new ProviderRateLimitError(
          this.name,
          parseInt(retryAfter) * 1000,
          [{
            type: 'rpm',
            resetInMs: parseInt(retryAfter) * 1000
          }]
        );
      case 408:
      case 504:
        throw new ProviderTimeoutError(this.name, this.REQUEST_TIMEOUT_MS);
      default:
        throw new ProviderNetworkError(
          this.name,
          response.status,
          errorBody
        );
    }
  }

  calculateBackoff(retryCount) {
    if (process.env.NODE_ENV === 'test') {
      // Much shorter delays for tests
      const baseDelay = 100; // 100ms instead of 1000ms
      const maxDelay = 500;  // 500ms instead of 32000ms
      const exponential = Math.min(maxDelay, baseDelay * Math.pow(2, retryCount));
      const jitter = Math.random() * 0.1 * exponential;
      return exponential + jitter;
    }

    // Original delays for production
    const baseDelay = 1000;
    const maxDelay = 32000;
    const exponential = Math.min(maxDelay, baseDelay * Math.pow(2, retryCount));
    const jitter = Math.random() * 0.1 * exponential;
    return exponential + jitter;
  }

  isCircuitBroken() {
    if (this.errorCount >= this.circuitBreakerThreshold) {
      const timeSinceLastError = Date.now() - this.lastErrorTime;
      if (timeSinceLastError < this.circuitBreakerResetTime) {
        return true;
      }
      this.resetCircuitBreaker();
    }
    return false;
  }

  incrementCircuitBreaker(error) {
    this.errorCount++;
    this.lastErrorTime = Date.now();
    logger.error(`Provider ${this.name} error count: ${this.errorCount}`, error);
  }

  resetCircuitBreaker() {
    this.errorCount = 0;
    this.lastErrorTime = null;
  }

  createReadableStream(response) {
    if (!response?.body) {
      logger.error('Response body is null', response);
      throw new Error(`No response body from ${this.name}`);
    }

    const encoder = new TextEncoder();
    let closed = false;
    let data = '';
    let counter = 0;

    return new ReadableStream({
      async start(controller) {
        logger.log('Starting readable stream');

        function onParse(event) {
          if (closed) return;

          if (event.type === 'event') {
            const eventData = event.data;
            if (eventData === '[DONE]') {
              logger.log('[done] Closing readable stream');
              data += '\n';
              controller.enqueue(encoder.encode('\n'));
              controller.close();
              closed = true;
              return;
            }
            try {
              const json = JSON.parse(eventData);

              // Various output formats depending on provider.
              let text =
                json?.delta?.text 
                ||
                json?.content_block?.text
                ||
                json.choices?.[0]?.delta?.content;

              if (json?.delta?.stop_reason) {
                logger.log('[ANTHROPIC:CLAUDE done] Closing readable stream');
                data += '\n';
                controller.enqueue(encoder.encode('\n'));
                controller.close();
                closed = true;
                return;
              }

              text = text || '';

              if (counter < 2 && (text.match(/\n/) || []).length) {
                return; //??? what is this for???
              }

              data += text;
              const queue = encoder.encode(text);
              controller.enqueue(queue);
              counter++;
            } catch (e) {
              logger.error('controller error', e);
              closed = true;
              controller.error(e);
            }
          }
        }

        try {
          const parser = createParser(onParse);

          logger.log('Starting to read response body', response?.body);
          for await (const chunk of response?.body) {
            if (closed) break;
            const decoded = new TextDecoder().decode(chunk);
            parser.feed(decoded);
          }
        } catch (e) {
          logger.error('Stream error:', e);
          controller.error(e);
        } finally {
          if (!closed) {
            closed = true;
            controller.close();
          }
          if (response?.body) {
            try {
              await response.body.cancel();
            } catch (e) {
              logger.error('Error cancelling response body:', e);
            }
          }
        }
      },
      cancel(reason) {
        closed = true;
        logger.log(`Stream cancelled: ${reason}`);
        if (response?.body) {
          response.body.cancel().catch(e => 
            logger.error('Error during stream cancellation:', e)
          );
        }
      }
    });
  }

  async createStream(payload, retries = 0) {
    // Check resource limits
    const limitCheck = this.resourceLimiter.consume({
      rpm: 1,
      ...(payload.messages ? {
        tpm: estimateTokenCount(payload.messages.join(''))
      } : {})
    });

    if (!limitCheck.allowed) {
      throw new ProviderRateLimitError(
        this.name,
        limitCheck.limits.rpm.resetInMs,
        Object.entries(limitCheck.limits)
          .filter(([_, status]) => !status.allowed)
          .map(([name, status]) => ({
            type: name,
            resetInMs: status.resetInMs
          }))
      );
    }

    try {
      const preparedPayload = this.preparePayload({
        ...payload,
        stream: true
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT_MS);

      const response = await this.fetch(this.endpoint, {
        method: 'POST',
        headers: this.headerGen ? this.headerGen.call(this) : this.getHeaders(),
        body: JSON.stringify(preparedPayload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      return this.createReadableStream(response);

    } catch (error) {
      if (error.name === 'AbortError') {
        throw new ProviderTimeoutError(this.name, this.REQUEST_TIMEOUT_MS);
      }

      // Handle retries for transient errors
      if (this.shouldRetry(error) && retries < this.MAX_RETRIES) {
        const delay = this.calculateBackoff(retries);
        await this.delay(delay);
        return this.createStream(payload, retries + 1);
      }

      throw error;
    }
  }

  timeout(ms) {
    return new Promise((_, reject) => setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms));
  }

  delay(ms) {
    return new Promise(resolve => {
      if (process.env.NODE_ENV === 'test') {
        // In test environment, resolve immediately to avoid hanging
        resolve();
      } else {
        setTimeout(resolve, ms);
      }
    });
  }

  shouldRetry(error) {
    // Expanded list of transient errors
    const transientStatusCodes = [408, 500, 502, 503, 504, 520, 524];
    const transientErrorMessages = [
      'ECONNRESET',
      'ETIMEDOUT',
      'EAI_AGAIN',
      'socket hang up',
      'network timeout',
      'connection reset',
      'connection refused'
    ];

    // Check if it's one of our custom error types
    if (error instanceof ProviderNetworkError) {
      return transientStatusCodes.includes(error.statusCode);
    }

    // Don't retry authentication errors
    if (error instanceof ProviderAuthenticationError) {
      return false;
    }

    // For generic errors, check the message
    const isNetworkError = transientErrorMessages.some(msg => 
      error.message.toLowerCase().includes(msg.toLowerCase())
    );

    return isNetworkError;
  }

  getHeaders() {
    if (!this.key) {
      throw new Error('Note: No key is defined');
    }
    const headers = {
      'Content-Type': 'application/json'
    };
    if (this.key !== 'NO_KEY') {
      headers.Authorization = `Bearer ${this.key}`;
    }
    return headers;
  }

  preparePayload(customPayload) {
    // Run validation and extract system message if present
    let { systemMessage, messages } = ValidationService.validateMessages(customPayload.messages);
    ValidationService.validateParameters(customPayload);

    // Use extracted system message or the one from payload
    const system = systemMessage || customPayload.system || '';

    // First, try to use the model specified in the preference
    const modelType = customPayload.model || 'fast';
    const model = this.models[modelType] || this.models['fast'] || Object.values(this.models)[0];

    if (!model) {
      throw new ModelValidationError(
        `No valid model found for provider: ${this.name}`,
        { provider: this.name, availableModels: Object.keys(this.models) }
      );
    }

    // Determine max tokens left after sys message
    const maxAvailableContextSize = 0 |
      (
        model.maxContextSize || DEFAULT_ASSUMED_MAX_CONTEXT_SIZE
      )
      - estimateTokenCount(system)
      - DEFAULT_RESPONSE_TOKEN_LENGTH;

    logger.dev('maxAvailableContextSize remaining', maxAvailableContextSize);

    let historyTokenCount = 0;

    messages = messages.reverse().map((item) => {
      // We are processing in reverse in order to prioritize
      // later parts of the chat over earlier parts
      // (i.e. short term memory)

      const truncated = innerTruncate(
        item.content,
        '[...]',
        10,
        MAX_TOKEN_HISTORICAL_MESSAGE
      );

      historyTokenCount += estimateTokenCount(truncated);

      if (historyTokenCount > maxAvailableContextSize) {
        return null;
      }

      return {
        role: item.role,
        content: truncated
      }
    }).reverse().filter(Boolean);

    const modelSpecificPayload = this.payloader({
      system,
      max_tokens: customPayload.max_tokens || customPayload.maxTokens || DEFAULT_RESPONSE_TOKEN_LENGTH,
      ...customPayload,
      messages,
    });
    
    logger.dev('successfully derived model specific payload', modelSpecificPayload);

    return {
      ...modelSpecificPayload,
      model: model.name,
      stream: customPayload.stream || false
    };
  }
}

export default Provider;