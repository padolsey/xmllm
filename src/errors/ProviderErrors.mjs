class ProviderError extends Error {
  constructor(message, code, provider) {
    super(message);
    console.log('err debug', message, code, provider)
    this.name = 'ProviderError';
    this.code = code;
    this.provider = provider;
    this.timestamp = new Date().toISOString();
  }
}

class ProviderRateLimitError extends ProviderError {
  constructor(provider, resetInMs, limits) {
    super(
      `Rate limit exceeded for provider ${provider}`, 
      'RATE_LIMIT_ERROR',
      provider
    );
    this.name = 'ProviderRateLimitError';
    this.resetInMs = resetInMs;
    this.limits = limits;
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