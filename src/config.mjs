import { LOG_LEVELS } from './LogLevels.mjs';
import { ClientProvider } from './ClientProvider.mjs';
import { Logger } from './Logger.mjs';

const DEFAULT_CONFIG = {
  logging: {
    level: 'ERROR',
    customLogger: null
  },
  clientProvider: null,
  globalParser: 'xml',
  idioSymbols: {
    tagPrefix: '@',
    closePrefix: '@', 
    openBrace: 'START(',
    closeBrace: 'END(',
    braceSuffix: ')'
  },
  defaults: {
    temperature: 0.72,
    maxTokens: 300,
    presencePenalty: 0,
    topP: 1,
    mode: 'state_open',
    strategy: 'default',
    model: [
      'anthropic:good',
      'openai:good',
      'anthropic:fast',
      'openai:fast'
    ],
    keys: {},
    errorMessages: {
      genericFailure: "It seems we have encountered issues responding, please try again later or get in touch with the website owner.",
      rateLimitExceeded: "Rate limit exceeded. Please try again later.",
      invalidRequest: "Invalid request. Please check your input.",
      authenticationFailed: "Authentication failed. Please check your credentials.",
      resourceNotFound: "The requested resource was not found.",
      serviceUnavailable: "The service is temporarily unavailable. Please try again later.",
      networkError: "Failed to connect to the service. Please check your connection and try again.",
      unexpectedError: "An unexpected error occurred. Please try again later."
    }
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
  
  // Validate parser type if provided
  if (options.globalParser) {
    if (!['xml', 'idio'].includes(options.globalParser)) {
      throw new Error('Invalid parser type. Must be either "xml" or "idio"');
    }
    CONFIG.globalParser = options.globalParser;
  }

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

  // Handle keys in defaults
  if (options.keys) {
    CONFIG = {
      ...CONFIG,
      defaults: {
        ...CONFIG.defaults,
        keys: {
          ...CONFIG.defaults.keys,
          ...options.keys
        }
      }
    };
  }

  // Handle idioSymbols configuration
  if (options.idioSymbols) {
    // Validate properties that must be non-empty strings
    const requiredNonEmptyProps = ['tagPrefix', 'closePrefix', 'braceSuffix'];
    const optionalProps = ['openBrace', 'closeBrace'];
    
    // Validate each provided property
    Object.entries(options.idioSymbols).forEach(([key, value]) => {
      // All properties must be strings
      if (typeof value !== 'string') {
        throw new Error(`${key} must be a non-empty string`);
      }
      // Some properties must be non-empty
      if (requiredNonEmptyProps.includes(key) && value.length === 0) {
        throw new Error(`${key} cannot be empty`);
      }
    });

    // Ensure we preserve defaults for non-provided values
    CONFIG.idioSymbols = {
      ...DEFAULT_CONFIG.idioSymbols, // Start with defaults
      ...CONFIG.idioSymbols,         // Apply any existing config
      ...options.idioSymbols         // Apply new options
    };
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