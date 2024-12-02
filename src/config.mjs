const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4
};

let CONFIG = {
  logging: {
    level: process.env.NODE_ENV === 'production' ? 'ERROR' : 'INFO',
    customLogger: null
  },
  defaults: {
    temperature: 0.72,
    maxTokens: 4000,
    presencePenalty: 0,
    topP: 1,
    mode: 'state_open',
    model: 'claude:good',
    modelFallbacks: [
      'claude:good',
      'openai:good',
      'claude:fast',
      'openai:fast'
    ]
  }
};

// Validation helper
const validateLogLevel = (level) => {
  return LOG_LEVELS[level?.toUpperCase()] !== undefined 
    ? level.toUpperCase() 
    : 'INFO';
};

export function configure(options = {}) {

  console.log('configure()', options);
  if (options.logging) {
    CONFIG = {
      ...CONFIG,
      logging: {
        ...CONFIG.logging,
        ...(options.logging.level && {
          level: validateLogLevel(options.logging.level)
        }),
        ...(options.logging.custom !== undefined && {
          customLogger: typeof options.logging.custom === 'function' 
            ? options.logging.custom 
            : null
        })
      }
    };

    // Log configuration changes
    if (CONFIG.logging.customLogger) {
      CONFIG.logging.customLogger(
        'info',
        'Config',
        'Logging configuration updated:',
        `level=${CONFIG.logging.level}`,
        `customLogger=${CONFIG.logging.customLogger ? 'provided' : 'none'}`
      );
    }
  }

  // Allow setting global defaults
  if (options.defaults) {
    CONFIG = {
      ...CONFIG,
      defaults: {
        ...CONFIG.defaults,
        ...options.defaults
      }
    };

    // Log defaults update separately
    if (CONFIG.logging.customLogger) {
      CONFIG.logging.customLogger(
        'info',
        'Config',
        'Global defaults updated:',
        CONFIG.defaults
      );
    }
  }
}

export function getConfig() {
  const frozenConfig = { ...CONFIG };
  Object.freeze(frozenConfig);
  Object.freeze(frozenConfig.logging);
  return frozenConfig;
}

export { LOG_LEVELS }; 