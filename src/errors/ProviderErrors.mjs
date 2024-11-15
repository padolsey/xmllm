class ProviderError extends Error {
  constructor(message, code, provider) {
    super(message);
    this.name = 'ProviderError';
    this.code = code;
    this.provider = provider;
    this.timestamp = new Date().toISOString();
  }
}

class ProviderRateLimitError extends ProviderError {
  constructor(provider, retryAfter) {
    super(
      `Rate limit exceeded for provider ${provider}`, 
      'RATE_LIMIT_ERROR',
      provider
    );
    this.name = 'ProviderRateLimitError';
    this.retryAfter = retryAfter;
  }
}

class ProviderAuthenticationError extends ProviderError {
  constructor(provider, details) {
    super(
      `Authentication failed for provider ${provider}`, 
      'AUTH_ERROR',
      provider
    );
    this.name = 'ProviderAuthenticationError';
    this.details = details;
  }
}

class ProviderNetworkError extends ProviderError {
  constructor(provider, statusCode, details) {
    super(
      `Network error with provider ${provider}`, 
      'NETWORK_ERROR',
      provider
    );
    this.name = 'ProviderNetworkError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

class ProviderTimeoutError extends ProviderError {
  constructor(provider, timeoutMs) {
    super(
      `Request to provider ${provider} timed out after ${timeoutMs}ms`, 
      'TIMEOUT_ERROR',
      provider
    );
    this.name = 'ProviderTimeoutError';
    this.timeoutMs = timeoutMs;
  }
}

export class ModelValidationError extends ProviderError {
  constructor(message, details) {
    super(message, 'MODEL_VALIDATION_ERROR', details?.provider);
    this.name = 'ModelValidationError';
    this.details = details;
  }
}

export {
  ProviderError,
  ProviderRateLimitError,
  ProviderAuthenticationError,
  ProviderNetworkError,
  ProviderTimeoutError
}; 