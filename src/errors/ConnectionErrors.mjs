class ConnectionError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'ConnectionError';
    this.code = code;
  }
}

class ConnectionTimeoutError extends ConnectionError {
  constructor() {
    super('Connection request timeout', 'CONNECTION_TIMEOUT');
    this.name = 'ConnectionTimeoutError';
  }
}

export {
  ConnectionError,
  ConnectionTimeoutError
}; 