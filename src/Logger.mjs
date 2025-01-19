import { LOG_LEVELS } from './LogLevels.mjs';
import { getConfig } from './config.mjs';

export class Logger {
  constructor(name) {
    this.name = name;
  }

  shouldLog(level) {
    const config = getConfig();
    return LOG_LEVELS[level] <= LOG_LEVELS[config.logging.level];
  }

  error(...args) {
    const config = getConfig();
    if (config.logging.customLogger) {
      config.logging.customLogger('error', this.name, ...args);
    } else {
      console.error(this.name, "==>", ...args);
    }
  }

  warn(...args) {
    if (!this.shouldLog('WARN')) return;
    const config = getConfig();
    if (config.logging.customLogger) {
      config.logging.customLogger('warn', this.name, ...args);
    } else {
      console.warn(this.name, "==>", ...args);
    }
  }

  info(...args) {
    if (!this.shouldLog('INFO')) return;
    const config = getConfig();
    if (config.logging.customLogger) {
      config.logging.customLogger('info', this.name, ...args);
    } else {
      console.log(this.name, "==>", ...args);
    }
  }

  debug(...args) {
    if (!this.shouldLog('DEBUG')) return;
    const config = getConfig();
    if (config.logging.customLogger) {
      config.logging.customLogger('debug', this.name, ...args);
    } else {
      console.log(this.name, "==>", ...args);
    }
  }

  log(...args) {
    this.info(...args);
  }
  
  dev(...args) {
    this.debug(...args);
  }
}
export default Logger;
