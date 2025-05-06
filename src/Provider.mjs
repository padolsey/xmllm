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
import { 
  estimateTokens, 
  estimateMessageTokens, 
  estimateMessagesTokens 
} from './utils/estimateTokens.mjs';

// Use native AbortController if available (modern environments), otherwise try to import
const AbortController = globalThis.AbortController || 
  (typeof window !== 'undefined' ? window.AbortController : null);

if (!AbortController) {
  throw new Error('AbortController is not available in this environment. Please use a newer version of Node.js or install the abort-controller package.');
}

const logger = new Logger('Provider');

const DEFAULT_ASSUMED_MAX_CONTEXT_SIZE = 8_000; // input token size
const DEFAULT_RESPONSE_TOKEN_LENGTH = 300; // max_tokens

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
        tpm: estimateTokens(payload.messages.join(''))
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
      logger.log('Attempting request', this.endpoint, preparedPayload);

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
    
    // Try to parse JSON response if possible
    let errorJson = null;
    try {
      errorJson = JSON.parse(errorBody);
    } catch (e) {
      // Not JSON, continue with text body
    }
    
    // Check for standard HTTP auth error codes
    if (response.status === 401 || response.status === 403) {
      throw new ProviderAuthenticationError(this.name, errorBody);
    }
    
    // Check for auth errors in response body (even with 200 status)
    if (errorJson) {
      const errorType = errorJson.error?.type || errorJson.type || '';
      const errorMessage = errorJson.error?.message || errorJson.message || '';
      
      const authErrorKeywords = ['auth', 'unauthorized', 'unauthenticated', 'invalid key', 'invalid api key'];
      
      if (authErrorKeywords.some(keyword => 
          errorType.toLowerCase().includes(keyword) || 
          errorMessage.toLowerCase().includes(keyword))) {
        throw new ProviderAuthenticationError(this.name, errorBody);
      }
    }
    
    // Continue with other error types...

    switch (response.status) {
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
    let reader = null;

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

              // Handle non-streaming response (complete JSON response)
              if (json.choices?.[0]?.text && !json.choices?.[0]?.delta) {
                const text = json.choices[0].text;
                controller.enqueue(encoder.encode(text));
                controller.close();
                closed = true;
                return;
              }

              // Handle streaming response formats
              let text =
                json?.delta?.text ||
                json?.content_block?.text ||
                json.choices?.[0]?.delta?.content ||
                json.choices?.[0]?.text;

              if (json?.delta?.stop_reason) {
                logger.log('[done] Closing readable stream');
                data += '\n';
                controller.enqueue(encoder.encode('\n'));
                controller.close();
                closed = true;
                return;
              }

              text = text || '';

              if (counter < 2 && (text.match(/\n/) || []).length) {
                counter++;
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
          
          // Get reader once and store it
          reader = response.body.getReader();
          
          // Handle non-streaming response
          const firstChunk = await reader.read();
          if (firstChunk.value) {
            const decoded = new TextDecoder().decode(firstChunk.value);
            try {
              // Attempt to parse it as JSON
              // (if it's parseable and has a final choices' text prop
              //  then it's likely a non-streaming (final) response)
              const json = JSON.parse(decoded);
              if (json.choices?.[0]?.text && !json.choices?.[0]?.delta) {
                // Non-streaming response
                const text = json.choices[0].text;
                controller.enqueue(encoder.encode(text));
                controller.close();
                closed = true;
                return;
              } else {
                // Streaming response - feed to parser
                parser.feed(decoded);
              }
            } catch (e) {
              // Not JSON or other error - treat as streaming
              parser.feed(decoded);
            }
          }

          // Continue reading rest of stream if not closed
          if (!closed) {
            do {
              const { done, value } = await reader.read();
              if (done) break;
              
              const decoded = new TextDecoder().decode(value);
              parser.feed(decoded);
            } while (!closed);
          }
        } catch (e) {
          logger.error('Stream error:', e);
          controller.error(e);
        } finally {
          if (!closed) {
            closed = true;
            controller.close();
          }
          if (reader) {
            try {
              reader.releaseLock();
            } catch (e) {
              logger.error('Error releasing reader lock:', e);
            }
          }
        }
      },
      cancel(reason) {
        closed = true;
        logger.log(`Stream cancelled: ${reason}`);
        if (reader) {
          try {
            reader.cancel().catch(e => 
              logger.error('Error during reader cancellation:', e)
            );
          } catch (e) {
            logger.error('Error during reader cancellation:', e);
          }
        }
      }
    });
  }

  async createStream(payload, retries = 0) {

    logger.log('createStream', this.endpoint, payload);

    // Check resource limits
    const limitCheck = this.resourceLimiter.consume({
      rpm: 1,
      ...(payload.messages ? {
        tpm: estimateTokens(payload.messages.join(''))
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

      const fetchOptions = {
        method: 'POST',
        headers: this.headerGen ? this.headerGen.call(this) : this.getHeaders(),
        body: JSON.stringify(preparedPayload),
        signal: controller.signal
      };

      logger.log('fetch()', this.endpoint, fetchOptions);

      const response = await this.fetch(this.endpoint, fetchOptions);

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
    const headers = {
      'Content-Type': 'application/json'
    };

    if (this.key !== 'NO_KEY' && this.key !== '') {
      headers.Authorization = `Bearer ${this.key}`;
    } else  if (this.key == null) {
      throw new Error('Note: No key is defined');
    }
    return headers;
  }

  preparePayload(customPayload) {
    // Run validation and extract system message if present
    let { systemMessage, messages } = ValidationService.validateMessages(customPayload.messages);
    ValidationService.validateLLMPayload(customPayload);

    // Use extracted system message or the one from payload
    const system = systemMessage || customPayload.system || '';

    // First, try to use the model specified in the preference
    const modelType = customPayload.model || 'fast';
    
    // Handle the case where modelType is a string like 'fast', 'good', or 'custom'
    const model = this.models[modelType] || this.models['fast'] || Object.values(this.models)[0];

    if (!model) {
      throw new ModelValidationError(
        `No valid model found for provider: ${this.name}`,
        { provider: this.name, availableModels: Object.keys(this.models) }
      );
    }

    // Detect if the model is an 'o1' model
    const isO1Model = /^(?:o1|o3)/.test(model.name);
    
    // We have to go this here in order to manage our truncation logic 
    // (but _knowing_ about o1 here in Provider is not ideal as it should really be a per-provider/payloader thing to handle) (TODO!)
    const maxTokensParam = isO1Model ? 'max_completion_tokens' : 'max_tokens';
    const maxTokensValue =
      customPayload[maxTokensParam] ||
      customPayload.max_tokens ||
      customPayload.maxTokens ||
      DEFAULT_RESPONSE_TOKEN_LENGTH;

    // Calculate system message and latest user message token counts
    const systemTokens = estimateTokens(system);
    const latestUserMessage = messages[messages.length - 1]?.content || '';
    const latestUserTokens = estimateTokens(latestUserMessage);
    const responseTokens = customPayload.max_tokens || DEFAULT_RESPONSE_TOKEN_LENGTH;

    // Calculate minimum required tokens
    const minRequiredTokens = systemTokens + latestUserTokens + responseTokens;

    // Handle autoTruncateMessages
    const maxContextSize = customPayload.autoTruncateMessages === true ? 
      (model.maxContextSize || DEFAULT_ASSUMED_MAX_CONTEXT_SIZE) :
      (typeof customPayload.autoTruncateMessages === 'number' ? 
        customPayload.autoTruncateMessages : 
        (model.maxContextSize || DEFAULT_ASSUMED_MAX_CONTEXT_SIZE));

    if (isNaN(maxContextSize)) {
      throw new ModelValidationError(
        'Invalid autoTruncateMessages value',
        { value: JSON.stringify({
          autoTruncateMessages: customPayload.autoTruncateMessages,
          model: model.name,
          maxContextSize: model.maxContextSize
        }) }
      );
    }

    // Throw early if context size is too small
    if (minRequiredTokens > maxContextSize) {
      throw new ModelValidationError(
        'Context size too small for system message, latest user message, and response',
        { 
          provider: this.name,
          required: minRequiredTokens,
          maxSize: maxContextSize,
          systemTokens,
          latestUserTokens,
          responseTokens
        }
      );
    }

    // Calculate remaining space for historical messages
    const availableForHistory = maxContextSize - minRequiredTokens;

    // Process historical messages (excluding the latest one)
    const historicalMessages = messages.slice(0, -1);

    // Estimate total tokens used by historical messages
    const totalHistoricalTokens = estimateMessagesTokens(historicalMessages);

    const truncatedMessages = [];

    if (totalHistoricalTokens <= availableForHistory) {
      // Include all historical messages as-is
      truncatedMessages.push(...historicalMessages);
    } else {
      // Start with an optimistic ratio
      let ratio = availableForHistory / totalHistoricalTokens;
      let attempts = 0;
      const MAX_ATTEMPTS = 3;

      while (attempts < MAX_ATTEMPTS) {
        const tempMessages = [];
        let currentTotal = 0;

        for (const msg of historicalMessages) {
          const originalTokens = estimateMessageTokens(msg);
          const desiredTokens = Math.max(1, Math.floor(originalTokens * ratio));

          const truncatedContent = innerTruncate(
            msg.content,
            '[...]',
            10,
            desiredTokens
          );

          const actualTokens = estimateTokens(truncatedContent);
          currentTotal += actualTokens;

          tempMessages.push({
            role: msg.role,
            content: truncatedContent
          });
        }

        if (currentTotal <= availableForHistory) {
          truncatedMessages.push(...tempMessages);
          break;
        }

        // Reduce ratio and try again
        ratio *= 0.75;
        attempts++;
      }

      // If we couldn't get under the limit, use minimal messages
      if (attempts === MAX_ATTEMPTS) {
        for (const msg of historicalMessages) {
          truncatedMessages.push({
            role: msg.role,
            content: '[...]'
          });
        }
      }
    }

    // Always add the latest message last
    if (messages.length > 0) {
      truncatedMessages.push(messages[messages.length - 1]);
    }

    // Prepare model specific payload
    const modelSpecificPayload = this.payloader({
      system,
      [maxTokensParam]: maxTokensValue,
      ...customPayload,
      messages: truncatedMessages,
      model: model.name
    });

    // If the payloader didn't set a model, use the one from our configuration
    if (!modelSpecificPayload.model) {
      modelSpecificPayload.model = model.name;
    }

    return {
      ...modelSpecificPayload,
      stream: customPayload.stream || false
    };
  }
}

export default Provider;