class ValidationError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'ValidationError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

class MessageValidationError extends ValidationError {
  constructor(message, details) {
    super(message, 'MESSAGE_VALIDATION_ERROR', details);
    this.name = 'MessageValidationError';
  }
}

class ModelValidationError extends ValidationError {
  constructor(message, details) {
    super(message, 'MODEL_VALIDATION_ERROR', details);
    this.name = 'ModelValidationError';
  }
}

class ParameterValidationError extends ValidationError {
  constructor(message, details) {
    super(message, 'PARAMETER_VALIDATION_ERROR', details);
    this.name = 'ParameterValidationError';
  }
}

export {
  ValidationError,
  MessageValidationError,
  ModelValidationError,
  ParameterValidationError
}; 