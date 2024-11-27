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

class Provider {
  constructor(name, details, fetchFn = fetch, configOverrides = {}) {
    this.fetch = fetchFn;
    this.name = name;
    this.endpoint = details.endpoint;
    this.key = details.key;
    this.models = details.models || {};
    this.payloader = details.payloader || this.defaultPayloader;
    this.headerGen = details.headerGen || this.defaultHeaderGen;
    this.rpmLimit = details.constraints?.rpmLimit || 1e6;

    this.constraints = details.constraints || { rpmLimit: this.rpmLimit };

    // Configurable properties with more sensible defaults or overrides
    this.REQUEST_TIMEOUT_MS = configOverrides.REQUEST_TIMEOUT_MS || 50_000; 
    this.MAX_RETRIES = configOverrides.MAX_RETRIES || 2; 
    this.RETRY_DELAY_WHEN_OVERLOADED = configOverrides.RETRY_DELAY_WHEN_OVERLOADED || 1000;

    // Token Bucket Properties
    this.tokens = this.rpmLimit;
    this.lastRefill = Date.now();
    this.tokenRefillInterval = 60000; // 1 minute

    // Add circuit breaker properties
    this.errorCount = 0;
    this.lastErrorTime = null;
    this.circuitBreakerThreshold = configOverrides.circuitBreakerThreshold || 5;
    this.circuitBreakerResetTime = configOverrides.circuitBreakerResetTime || 60000; // 1 minute

    // Default RPM limit from provider config
    this.defaultRpmLimit = details.constraints?.rpmLimit || Infinity;
    this.currentRpmLimit = this.defaultRpmLimit;
  }

  defaultPayloader(payload) {
    return payload;
  }

  defaultHeaderGen() {
    return this.getHeaders();
  }

  async makeRequest(payload) {
    // Apply any request-specific constraints
    if (payload.constraints?.rpmLimit) {
      this.setRpmLimit(payload.constraints.rpmLimit);
    }

    if (this.isCircuitBroken()) {
      throw new ProviderError(
        `Circuit breaker is open for provider ${this.name}`,
        'CIRCUIT_BREAKER_OPEN',
        this.name
      );
    }

    this.refillTokens();
    if (this.tokens <= 0) {
      throw new ProviderRateLimitError(this.name);
    }

    this.tokens--;

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

      if (!response.ok) {
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
    const errorBody = await response.text();
    
    switch (response.status) {
      case 401:
      case 403:
        return new ProviderAuthenticationError(this.name, errorBody);
      case 429:
        return new ProviderRateLimitError(
          this.name,
          response.headers.get('Retry-After')
        );
      case 408:
      case 504:
        return new ProviderTimeoutError(this.name, this.REQUEST_TIMEOUT_MS);
      default:
        return new ProviderNetworkError(
          this.name,
          response.status,
          errorBody
        );
    }
  }

  calculateBackoff(retryCount) {
    // Exponential backoff with jitter
    const baseDelay = 1000; // 1 second
    const maxDelay = 32000; // 32 seconds
    const exponential = Math.min(maxDelay, baseDelay * Math.pow(2, retryCount));
    const jitter = Math.random() * 0.1 * exponential; // 10% jitter
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

  async createStream(payload, retries = 0) {
    this.refillTokens();
    if (this.tokens <= 0) {
      throw new Error(`RPM limit exceeded for provider ${this.name}`);
    }
    this.tokens--;

    let response;
    let closed = false;

    try {
      logger.log('Making STREAMING request with payload', payload);
      
      const encoder = new TextEncoder();
      const inst = this;

      payload.stream = true;

      const makeSingleStream = async () => {
        logger.log('Initiating stream request');

        const preparedPayload = this.preparePayload(payload);

        logger.log('Prepared payload for stream request', preparedPayload);
        try {
          const endpoint = `${this.endpoint}${preparedPayload.stream?'?stream=true':''}`;
          const headers = this.headerGen ? this.headerGen.call(this) : this.getHeaders();

          logger.log('Sending fetch request to', this.endpoint, headers, JSON.stringify(preparedPayload));

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT_MS);

          response = await this.fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(preparedPayload),
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          logger.log('Received response', response.status, response.statusText);

          if (!response.ok) {
            const errorText = await response.text();
            logger.error(`HTTP Error ${response.status} for ${this.name} (stream):`, {
              status: response.status,
              statusText: response.statusText,
              headers: Object.fromEntries(response.headers.entries()),
              errorText: errorText
            });
            throw new Error(`HTTP Error ${response.status}: ${errorText}`);
          }

          if (!response.body) {
            logger.error('Response body is null', response);
            throw new Error(`No response body from ${inst.name}`);
          }

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

                logger.log('Starting to read response body', response.body);
                for await (const chunk of response.body) {
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
        } catch (error) {
          logger.error(`Error in streaming from ${this.name}:`, {
            error: error.message,
            responseStatus: response?.status,
            responseStatusText: response?.statusText
          });

          if (retries < this.MAX_RETRIES && this.shouldRetry(error, response?.status)) {
            retries++;
            logger.log(`Retrying request for ${this.name}, attempt ${retries}`);
            await this.delay(this.RETRY_DELAY_WHEN_OVERLOADED * Math.pow(2, retries - 1)); // Exponential backoff
            return this.createStream(payload, retries);
          }

          throw error;
        }
      };

      return makeSingleStream();
    } catch (error) {
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
    const transientStatusCodes = [408, 429, 500, 502, 503, 504, 520, 524];
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

    // Check if it's a rate limit error (we might want to retry these)
    if (error instanceof ProviderRateLimitError) {
      return true;
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

  // Refill tokens based on elapsed time
  refillTokens() {
    const now = Date.now();
    const elapsed = now - this.lastRefill;

    if (elapsed >= this.tokenRefillInterval) {
      // Calculate number of complete intervals elapsed
      const intervals = Math.floor(elapsed / this.tokenRefillInterval);
      // Reset tokens to the limit (full refill)
      this.tokens = this.currentRpmLimit;
      // Update last refill time to the start of the current interval
      this.lastRefill = now - (elapsed % this.tokenRefillInterval);
    }
  }

  // Add method to update RPM limit
  setRpmLimit(limit) {
    this.currentRpmLimit = limit || this.defaultRpmLimit;
    this.lastRefill = Date.now();
  }
}

export default Provider;