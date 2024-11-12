class Logger {
  constructor(name) {
    this.name = name;
  }

  log(...args) {
    if (process.env.NODE_ENV !== 'test' || process.env.ENABLE_TEST_LOGS) {
      console.log(this.name, '==>', ...args);
    }
  }

  error(...args) {
    if (process.env.NODE_ENV !== 'test' || process.env.ENABLE_TEST_LOGS) {
      console.error(this.name, '==>', ...args);
    }
  }

  warn(...args) {
    if (process.env.NODE_ENV !== 'test' || process.env.ENABLE_TEST_LOGS) {
      console.warn(this.name, '==>', ...args);
    }
  }

  dev(...args) {
    if (process.env.NODE_ENV === 'development' || process.env.ENABLE_TEST_LOGS) {
      console.log('DEV! ', this.name, '==>', ...args);
    }
  }
}

export default Logger;