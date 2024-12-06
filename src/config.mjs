import { LOG_LEVELS } from './LogLevels.mjs';
import { ClientProvider } from './ClientProvider.mjs';
import { Logger } from './Logger.mjs';

const DEFAULT_CONFIG = {
  logging: {
    level: process.env.NODE_ENV === 'production' ? 'ERROR' : 'INFO',
    customLogger: null
  },
  clientProvider: null,
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

let CONFIG = { ...DEFAULT_CONFIG };

// Validation helper
const validateLogLevel = (level) => {
  return LOG_LEVELS[level?.toUpperCase()] !== undefined 
    ? level.toUpperCase() 
    : 'INFO';
};

export function configure(options = {}) {
  
  // Handle clientProvider string -> ClientProvider conversion
  if (options.clientProvider) {
    const provider = typeof options.clientProvider === 'string' 
      ? new ClientProvider(options.clientProvider)
      : options.clientProvider;
    
    // Set logger on provider
    const logger = new Logger('ClientProvider');
    provider.setLogger(logger);

    CONFIG = {
      ...CONFIG,
      clientProvider: provider
    };
  }

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
export function resetConfig() {
  CONFIG = { ...DEFAULT_CONFIG };
} 