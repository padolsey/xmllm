# Error Handling

xmllm provides a comprehensive error handling system with specific error types and customizable error messages.

## Error Types

### Provider Errors

Errors that occur when interacting with AI providers:

```javascript
import { ProviderError } from 'xmllm';

// Base provider error
class ProviderError extends Error {
  name: string;        // Error name
  code: string;        // Error code
  provider: string;    // Provider name (e.g., 'anthropic')
}

// Rate limiting
class ProviderRateLimitError extends ProviderError {
  code: 'RATE_LIMIT_EXCEEDED'
}

// Authentication
class ProviderAuthenticationError extends ProviderError {
  code: 'AUTHENTICATION_FAILED'
}

// Timeout
class ProviderTimeoutError extends ProviderError {
  code: 'TIMEOUT'
}

// Network issues
class ProviderNetworkError extends ProviderError {
  code: 'NETWORK_ERROR'
}
```

### Validation Errors

Errors related to input validation:

```javascript
import { ValidationError } from 'xmllm';

// Base validation error
class ValidationError extends Error {
  code: string;        // Error code
  details: any;        // Additional error details
  timestamp: string;   // Error timestamp
}

// Message format validation
class MessageValidationError extends ValidationError {
  name: 'MessageValidationError';
  code: 'MESSAGE_VALIDATION_ERROR';
}

// Model configuration validation
class ModelValidationError extends ValidationError {
  name: 'ModelValidationError';
  code: 'MODEL_VALIDATION_ERROR';
}

// Request payload validation
class PayloadValidationError extends ValidationError {
  name: 'PayloadValidationError';
  code: 'PAYLOAD_VALIDATION_ERROR';
}
```

## Error Messages

Error messages can be customized at three levels:

### 1. Global Defaults

Set default error messages for all requests:

```javascript
import { configure } from 'xmllm';

configure({
  defaults: {
    errorMessages: {
      genericFailure: "An error occurred while processing your request.",
      rateLimitExceeded: "Rate limit exceeded. Please try again later.",
      invalidRequest: "Invalid request format or parameters.",
      authenticationFailed: "Authentication failed. Check your API key.",
      resourceNotFound: "The requested resource was not found.",
      serviceUnavailable: "Service is temporarily unavailable.",
      networkError: "Network connection error.",
      unexpectedError: "An unexpected error occurred."
    }
  }
});
```

### 2. Per-Request Configuration

Override error messages for specific requests:

```javascript
const result = await stream('Query', {
  errorMessages: {
    rateLimitExceeded: "Custom rate limit message for this request",
    networkError: "Custom network error for this request"
  }
});
```

### 3. Client Configuration

Set error messages for client/browser usage:

```javascript
import { configure as clientConfigure } from 'xmllm/client';

clientConfigure({
  clientProvider: 'http://localhost:3000',
  defaults: {
    errorMessages: {
      networkError: "Failed to connect to AI service",
      serviceUnavailable: "AI service is currently unavailable"
    }
  }
});
```

## Error Handling Patterns

### Basic Try-Catch

```javascript
try {
  const result = await simple(
    "What is 2+2?",
    { answer: types.number() }
  );
} catch (error) {
  if (error instanceof ProviderError) {
    console.error('Provider error:', error.message);
    console.error('Provider:', error.provider);
    console.error('Code:', error.code);
  } else if (error instanceof ValidationError) {
    console.error('Validation error:', error.message);
    console.error('Details:', error.details);
  }
}
```

### Pipeline Error Handling

```javascript
const robustPipeline = xmllm(({ prompt, map, tap }) => [
  // Error boundary
  async function*(input) {
    try {
      const result = await prompt('Process this', {
        output: types.string()
      });
      yield result;
    } catch (error) {
      if (error instanceof ProviderRateLimitError) {
        // Handle rate limiting
        yield { error: 'rate_limit', retry: true };
      } else if (error instanceof ProviderNetworkError) {
        // Handle network issues
        yield { error: 'network', retry: true };
      } else {
        // Handle other errors
        yield { error: error.message, retry: false };
      }
    }
  },
  
  // Handle retry logic
  map(result => {
    if (result.error && result.retry) {
      // Implement retry logic
      return { status: 'retrying', error: result.error };
    }
    return result;
  })
]);
```

### Retry Configuration

Configure retry behavior for transient errors:

```javascript
const result = await stream('Query', {
  // Retry configuration
  retryMax: 3,                    // Maximum retry attempts
  retryStartDelay: 1000,          // Initial retry delay (ms)
  retryBackoffMultiplier: 2,      // Exponential backoff multiplier
  
  // Custom error messages
  errorMessages: {
    rateLimitExceeded: "Rate limit exceeded, retrying...",
    networkError: "Network error, retrying..."
  }
});
```

### Client-Side Error Handling

```javascript
import { stream } from 'xmllm/client';

try {
  const result = await stream('Query', {
    clientProvider: 'http://localhost:3000',
    errorMessages: {
      networkError: "Failed to connect to AI service. Check your internet connection.",
      serviceUnavailable: "AI service is temporarily unavailable. Please try again later."
    },
    onError: (error) => {
      // Custom error handling
      if (error instanceof ProviderNetworkError) {
        showNetworkErrorUI();
      } else if (error instanceof ProviderRateLimitError) {
        showRateLimitUI();
      }
    }
  });
} catch (error) {
  handleError(error);
}
``` 