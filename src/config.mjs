import { LOG_LEVELS } from './LogLevels.mjs';
import { ClientProvider } from './ClientProvider.mjs';
import { Logger } from './Logger.mjs';
import { configure as configureCache, setLogger } from './mainCache.mjs';

const DEFAULT_CONFIG = {
  logging: {
    level: 'ERROR',
    customLogger: null
  },
  clientProvider: null,
  globalParser: 'xml',
  idioSymbols: {
    // openTagPrefix, closeTagPrefix, openTag, closeTag, tagSuffix
    openTagPrefix: ['@'],
    closeTagPrefix: ['@'],
    tagOpener: ['START('],
    tagCloser: ['END('],
    tagSuffix: [')']
  },
  defaults: {
    temperature: 0.72,
    maxTokens: 300,
    presencePenalty: 0,
    topP: 1,
    mode: 'state_open',
    strategy: 'default',
    buffer: false,
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
  },
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
    // Convert single values to arrays for validation
    const normalizeToArray = value => Array.isArray(value) ? value : [value];
    
    const symbols = {
      openTagPrefix: normalizeToArray(
        options.idioSymbols.openTagPrefix ??
        DEFAULT_CONFIG.idioSymbols.openTagPrefix
      ),
      closeTagPrefix: normalizeToArray(
        options.idioSymbols.closeTagPrefix ??
        DEFAULT_CONFIG.idioSymbols.closeTagPrefix
      ),
      tagOpener: normalizeToArray(
        options.idioSymbols.tagOpener ??
        DEFAULT_CONFIG.idioSymbols.tagOpener
      ),
      tagCloser: normalizeToArray(
        options.idioSymbols.tagCloser ??
        DEFAULT_CONFIG.idioSymbols.tagCloser
      ),
      tagSuffix: normalizeToArray(
        options.idioSymbols.tagSuffix ??
        DEFAULT_CONFIG.idioSymbols.tagSuffix
      )
    };

    // 1. Basic non-empty string validation
    for (const tagSuffix of symbols.tagSuffix) {
      if (typeof tagSuffix !== 'string' || tagSuffix.length === 0) {
        throw new Error('tagSuffix must be a non-empty string');
      }
    }

    for (const openTagPrefix of symbols.openTagPrefix) {
      if (typeof openTagPrefix !== 'string' || openTagPrefix.length === 0) {
        throw new Error('openTagPrefix must be a non-empty string');
      }
    }

    for (const closeTagPrefix of symbols.closeTagPrefix) {
      if (typeof closeTagPrefix !== 'string' || closeTagPrefix.length === 0) {
        throw new Error('closeTagPrefix must be a non-empty string');
      }
    }

    // 2. Prefix Containment Rule
    if (symbols.openTagPrefix.every(open => 
      symbols.closeTagPrefix.includes(open)) &&
      symbols.tagOpener.every(opener => 
      symbols.tagCloser.includes(opener))) {
    throw new Error('Configuration must provide way to distinguish opening from closing tags');
  }

    // 3. Recursive Definition Rule
    if (symbols.openTagPrefix.some(prefix => 
        symbols.tagSuffix.some(suffix => 
          prefix.includes(suffix) || suffix.includes(prefix))) ||
        symbols.closeTagPrefix.some(prefix => 
        symbols.tagSuffix.some(suffix => 
          prefix.includes(suffix) || suffix.includes(prefix)))) {
      throw new Error('Prefixes and suffixes cannot contain each other');
    }

    // 4. Complete Ambiguity Rule
    if (symbols.openTagPrefix.every(open => 
        symbols.closeTagPrefix.includes(open)) &&
        symbols.tagOpener.every(opener => 
        symbols.tagCloser.includes(opener)) &&
        symbols.tagOpener.length === 0) {
      throw new Error('Configuration creates completely ambiguous parsing');
    }

    // 5. Suffix Dependency Rule
    if (symbols.tagSuffix.some(suffix => !suffix)) {
      throw new Error('Tag suffix is required for unambiguous parsing');
    }

    // Apply validated configuration
    CONFIG.idioSymbols = {
      ...DEFAULT_CONFIG.idioSymbols,
      ...CONFIG.idioSymbols,
      ...symbols
    };
  }

  // Handle cache configuration by delegating to mainCache
  if (options.cache) {
    configureCache({ cache: options.cache });
  }
}

export function getConfig() {
  const frozenConfig = { ...CONFIG };
  Object.freeze(frozenConfig);
  Object.freeze(frozenConfig.logging);
  return frozenConfig;
}

export { LOG_LEVELS, setLogger as setCacheLogger };
export function resetConfig() {
  CONFIG = { ...DEFAULT_CONFIG };
} 