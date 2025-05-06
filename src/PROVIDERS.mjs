import { config } from 'dotenv';
import { ModelValidationError } from './errors/ProviderErrors.mjs';

config({
  path: '.env'
});

const standardHeaderGen = function() {
  return {
    'Authorization': `Bearer ${this.key}`,
    'Content-Type': 'application/json'
  };
};

// Add the o1Payloader function
export const o1Payloader = function(o) {
  const {
    messages = [],
    max_completion_tokens = 300,
    max_tokens,
    maxTokens,
    stop = null,
    reasoning_effort = 'medium',
    system = '',
    model
  } = o;

  // Store model name for reference - handle case when this.models is undefined
  const modelName = (this?.models && model) ? (this.models[model]?.name || model) : model;

  // Check if the model does not support the 'developer' role
  const modelsWithoutDeveloperRole = ['o1-mini'];
  const doesNotSupportDeveloper = modelsWithoutDeveloperRole.includes(modelName);

  // Process messages
  let processedMessages;

  if (doesNotSupportDeveloper) {
    // Map 'system' and 'developer' roles to 'assistant' with specialist tags
    processedMessages = [
      ...(system ? [{ role: 'assistant', content: '<system>' + system + '</system>' }] : []),
      ...messages.map((msg) =>
        ['system', 'developer'].includes(msg.role)
          ? { ...msg, role: 'assistant', content: `<${msg.role}>${msg.content}</${msg.role}>` }
          : msg
      ),
    ];
  } else {
    // Use 'developer' role for system messages
    processedMessages = [
      ...(system ? [{ role: 'developer', content: system }] : []),
      ...messages.map((msg) =>
        msg.role === 'system' ? { ...msg, role: 'developer' } : msg
      ),
    ];
  }

  // Use max_completion_tokens, falling back to max_tokens if provided
  const finalMaxTokens = max_completion_tokens || max_tokens || maxTokens || 300;

  const payload = {
    messages: processedMessages,
    max_completion_tokens: finalMaxTokens
  };

  if (modelName !== 'o1-mini') {
    // o1-mini does not support reasoning_effort
    payload.reasoning_effort = reasoning_effort;
  }

  if (stop != null) {
    payload.stop = stop;
  }

  // Note: We intentionally ignore temperature, top_p, presence_penalty, etc.
  // as they are not supported by O1 models

  return payload;
};

// Update the OpenAI payloader to handle all model-specific logic
export const openaiPayloader = function(o) {
  const modelName = this.models[o.model]?.name || o.model;
  const isO1Model = /^(?:o1|o3|o4)/.test(modelName);

  if (isO1Model) {
    // Remove parameters that O1 models don't support
    const sanitizedOpts = { ...o };
    
    // O1 models don't support these parameters
    delete sanitizedOpts.temperature;
    delete sanitizedOpts.top_p;
    delete sanitizedOpts.presence_penalty;
    delete sanitizedOpts.frequency_penalty;
    
    return o1Payloader.call(this, sanitizedOpts);
  } else {
    return standardPayloader.call(this, o);
  }
};

export const standardPayloader = function(o) {
  const {
    messages = [],
    max_tokens = 300,
    stop = null,
    temperature = 0.52,
    top_p = 1,
    presence_penalty = 0,
    system = '',
    // Handle aliases
    maxTokens,
    topP,
    presencePenalty
  } = o;

  // Process messages
  const processedMessages = [
    { role: 'system', content: system || '' },
    ...messages,
  ];

  const payload = {
    messages: processedMessages,
    temperature
  };

  if (maxTokens || max_tokens) {
    payload.max_tokens = maxTokens || max_tokens;
  }

  // only add params that were specified:
  if (top_p != null || topP != null) {
    payload.top_p = top_p != null ? top_p : topP;
  }

  if (presence_penalty != null || presencePenalty != null) {
    payload.presence_penalty = presence_penalty != null ? presence_penalty : presencePenalty;
  }

  if (stop != null) {
    payload.stop = stop;
  }

  return payload;
};

export const taiStylePayloader = ({
  messages = [],
  max_tokens = 300,
  stop = ['',''],
  temperature = 0.52,
  top_p = 1,
  frequency_penalty = 0.01,
  presence_penalty = 0,
  system = ''
}) => ({
  messages: [{role:'system',content:system||''}].concat(messages),
  max_tokens,
  stop,
  temperature,
  top_p,
  top_k: 50,
  repetition_penalty: 1 + presence_penalty
});

export const providers = {
  anthropic: {
    constraints: {
      rpmLimit: 200
    },
    endpoint: 'https://api.anthropic.com/v1/messages',
    key: process.env.ANTHROPIC_API_KEY,
    models: {
      superfast: {
        name: 'claude-3-haiku-20240307',
        maxContextSize: 200_000
      },
      fast: {
        name: 'claude-3-haiku-20240307',
        maxContextSize: 200_000
      },
      good: {
        name: 'claude-3-5-sonnet-20240620',
        maxContextSize: 200_000
      }
    },
    headerGen() {
      return {
        'x-api-key': this.key || process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      };
    },
    payloader(opts) {
      // Use the utility to normalize parameters for Anthropic
      const normalized = normalizeProviderParams(opts, {
        useStopSequences: true,  // Convert 'stop' to 'stop_sequences'
        clampTemp: true,         // Clamp temperature to 0.0-1.0
        maxTemp: 1.0,            // Anthropic's max temperature
        removeParams: ['presence_penalty', 'frequency_penalty'] // Unsupported by Anthropic
      });
      
      // Extract the parameters we need
      const {
        messages = [],
        system,
        max_tokens = 300,
        stop_sequences = null,
        temperature = 0.52,
        top_p = 1
      } = normalized;

      const payload = {
        messages,
        system,
        max_tokens,
        temperature,
        top_p
      };

      // Only add if explicitly set, to avoid nulls -- which will error...
      if (stop_sequences) {
        payload.stop_sequences = stop_sequences;
      }
      
      return payload;
    }
  },
  openai: {
    constraints: {
      rpmLimit: 200
    }, 
    endpoint: 'https://api.openai.com/v1/chat/completions',
    key: process.env.OPENAI_API_KEY,
    models: {
      superfast: {
        name: 'gpt-4o-mini',
        maxContextSize: 128_000
      },
      fast: {
        name: 'gpt-4o-mini',
        maxContextSize: 128_000
      },
      good: {
        name: 'gpt-4o',
        maxContextSize: 128_000
      }
    },
    payloader: openaiPayloader
  },
  openrouter: {
    constraints: {
      rpmLimit: 100
    },
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    key: process.env.OPENROUTER_API_KEY,
    models: {
      superfast: {
        name: 'mistralai/ministral-3b',
        maxContextSize: 128000
      },
      fast: {
        name: 'mistralai/ministral-8b',
        maxContextSize: 128000
      },
      good: {
        name: 'mistralai/mistral-large-2411',
        maxContextSize: 128000
      }
    },
    headerGen() {
      return {
        Authorization: `Bearer ${this.key || process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      };
    },
    payloader: standardPayloader
  },
  x: {
    constraints: {
      rpmLimit: 100
    },
    endpoint: 'https://api.x.ai/v1/chat/completions',
    key: process.env.X_API_KEY,
    models: {
      fast: {
        name: 'grok-2-latest',
        maxContextSize: 131000
      },
      good: {
        name: 'grok-2-latest',
        maxContextSize: 131000
      }
    },
    headerGen() {
      return {
        Authorization: `Bearer ${this.key || process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      };
    },
    payloader: standardPayloader
  },
  togetherai: {
    constraints: {
      rpmLimit: 100
    },
    endpoint: 'https://api.together.xyz/v1/chat/completions',
    key: process.env.TOGETHER_API_KEY,
    models: {
      fast: {
        name: 'meta-llama/Llama-3-8b-instruct',
        maxContextSize: 8192
      },
      good: {
        name: 'meta-llama/Llama-3-70b-instruct',
        maxContextSize: 8192
      },
      best: {
        name: 'meta-llama/Meta-Llama-3.1-70B-Instruct',
        maxContextSize: 8192
      }
    },
    headerGen() {
      return {
        'Authorization': `Bearer ${this.key}`,
        'Content-Type': 'application/json'
      };
    },
    payloader: standardPayloader
  },
  perplexityai: {
    constraints: {
      rpmLimit: 100
    }, 
    endpoint: 'https://api.perplexity.ai/chat/completions',
    key: process.env.PERPLEXITY_API_KEY,
    models: {
      superfast: {
        name: 'llama-3.1-sonar-small-128k-chat',
        maxContextSize: 128000
      },
      fast: {
        name: 'llama-3.1-sonar-small-128k-chat',
        maxContextSize: 128000
      },
      good: {
        name: 'llama-3.1-sonar-large-128k-chat', 
        maxContextSize: 128000
      }
    },
    payloader(opts) {
      // Extract Perplexity-specific parameters
      const {
        search_domain_filter,
        return_images,
        return_related_questions,
        ...standardOpts
      } = opts;
      
      // Process standard parameters
      const standardPayload = standardPayloader.call(this, standardOpts);
      
      // Add Perplexity-specific parameters if provided
      if (search_domain_filter !== undefined) {
        standardPayload.search_domain_filter = search_domain_filter;
      }
      
      if (return_images !== undefined) {
        standardPayload.return_images = return_images;
      }
      
      if (return_related_questions !== undefined) {
        standardPayload.return_related_questions = return_related_questions;
      }
      
      return standardPayload;
    }
  },
  mistralai: {
    constraints: {
      rpmLimit: 100
    },
    endpoint: 'https://api.mistral.ai/v1/chat/completions',
    key: process.env.MISTRAL_API_KEY,
    models: {
      superfast: {
        name: 'mistral-tiny',
        maxContextSize: 32000
      },
      fast: {
        name: 'mistral-small',
        maxContextSize: 32000
      },
      good: {
        name: 'mistral-medium',
        maxContextSize: 32000
      },
      best: {
        name: 'mistral-large-latest',
        maxContextSize: 32000
      }
    },
    headerGen() {
      return {
        'Authorization': `Bearer ${this.key}`,
        'Content-Type': 'application/json'
      };
    },
    payloader(opts) {
      // Mistral is very OpenAI-compatible, but has some unique parameters
      const {
        random_seed,
        safe_prompt,
        response_format,
        ...standardOpts
      } = opts;
      
      // Process standard parameters
      const standardPayload = standardPayloader.call(this, standardOpts);
      
      // Add Mistral-specific parameters if provided
      if (random_seed !== undefined) {
        standardPayload.random_seed = random_seed;
      }
      
      if (safe_prompt !== undefined) {
        standardPayload.safe_prompt = safe_prompt;
      }
      
      if (response_format !== undefined) {
        standardPayload.response_format = response_format;
      }
      
      return standardPayload;
    }
  },
  deepseek: {
    constraints: {
      rpmLimit: 100
    },
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    key: process.env.DEEPSEEK_API_KEY,
    models: {
      fast: {
        name: 'deepseek-chat',
        maxContextSize: 64000
      },
      best: {
        name: 'deepseek-reasoner',
        maxContextSize: 64000
      }
    },
    headerGen() {
      return {
        'Authorization': `Bearer ${this.key}`,
        'Content-Type': 'application/json'
      };
    },
    payloader(opts) {
      // DeepSeek is OpenAI-compatible, but has some unique parameters
      const {
        response_format,
        ...standardOpts
      } = opts;
      
      // Process standard parameters
      const standardPayload = standardPayloader.call(this, standardOpts);
      
      // Add DeepSeek-specific parameters if provided
      if (response_format !== undefined) {
        standardPayload.response_format = response_format;
      }
      
      return standardPayload;
    }
  }
};

providers.claude = providers.anthropic;

export const PROVIDER_ALIASES = {
  claude: 'anthropic'
};

export default providers;

export function createCustomModel(baseProvider, config) {

  // Required fields
  if (!config.name) {
    throw new ModelValidationError(
      'Model name is required',
      { provider: baseProvider.name }
    );
  }

  // Validate maxContextSize
  if (config.maxContextSize !== undefined) {
    if (typeof config.maxContextSize !== 'number' || config.maxContextSize <= 0) {
      throw new ModelValidationError(
        'maxContextSize must be a positive number',
        { 
          provider: baseProvider.name,
          value: config.maxContextSize 
        }
      );
    }
  }

  // Validate constraints
  if (config.constraints) {
    if (typeof config.constraints !== 'object') {
      throw new ModelValidationError(
        'constraints must be an object',
        { provider: baseProvider.name }
      );
    }
    if (config.constraints.rpmLimit !== undefined) {
      if (typeof config.constraints.rpmLimit !== 'number' || config.constraints.rpmLimit <= 0) {
        throw new ModelValidationError(
          'rpmLimit must be a positive number',
          { 
            provider: baseProvider.name,
            value: config.constraints.rpmLimit 
          }
        );
      }
    }
  }

  // Validate endpoint if provided
  if (config.endpoint !== undefined) {
    try {
      new URL(config.endpoint);
    } catch (e) {
      throw new ModelValidationError(
        'Invalid endpoint URL',
        { 
          provider: baseProvider.name,
          value: config.endpoint 
        }
      );
    }
  }

  // Validate functions
  if (config.headerGen && typeof config.headerGen !== 'function') {
    throw new ModelValidationError(
      'headerGen must be a function',
      { provider: baseProvider.name }
    );
  }
  if (config.payloader && typeof config.payloader !== 'function') {
    throw new ModelValidationError(
      'payloader must be a function',
      { provider: baseProvider.name }
    );
  }

  return {
    ...baseProvider,
    endpoint: config.endpoint || baseProvider.endpoint,
    key: config.key || baseProvider.key,
    headerGen: config.headerGen || baseProvider.headerGen,
    payloader: config.payloader || baseProvider.payloader,
    constraints: {
      ...baseProvider.constraints,
      ...(config.constraints || {})
    },
    models: {
      custom: {
        name: config.name,
        maxContextSize: config.maxContextSize || baseProvider.models?.fast?.maxContextSize
      }
    }
  };
}

export function registerProvider(name, config) {
  // Validate required fields
  if (!name || typeof name !== 'string') {
    throw new ModelValidationError('Provider name is required');
  }
  
  if (!config || typeof config !== 'object') {
    throw new ModelValidationError('Provider configuration is required');
  }

  if (!config.endpoint) {
    throw new ModelValidationError(
      'Provider endpoint is required',
      { provider: name }
    );
  }

  // Validate models configuration
  if (!config.models || Object.keys(config.models).length === 0) {
    throw new ModelValidationError(
      'Provider must define at least one model',
      { provider: name }
    );
  }

  // Add URL validation
  try {
    new URL(config.endpoint);
  } catch (e) {
    throw new ModelValidationError(
      'Invalid endpoint URL',
      { provider: name, endpoint: config.endpoint }
    );
  }

  // Validate model names
  Object.entries(config.models).forEach(([alias, model]) => {
    if (!model.name) {
      throw new ModelValidationError(
        'Each model must have a name',
        { provider: name, alias }
      );
    }
  });

  // Add to providers registry
  providers[name] = {
    constraints: {
      rpmLimit: config.constraints?.rpmLimit || 100,
      tokensPerMinute: config.constraints?.tokensPerMinute,
      requestsPerHour: config.constraints?.requestsPerHour
    },
    endpoint: config.endpoint,
    key: config.key || process.env[`${name.toUpperCase()}_API_KEY`] || process.env[`${name.toUpperCase().replace(/-/g, '_')}_API_KEY`],
    models: config.models,
    headerGen: config.headerGen || standardHeaderGen,
    payloader: config.payloader || standardPayloader
  };

  // Add any aliases
  if (config.aliases) {
    config.aliases.forEach(alias => {
      PROVIDER_ALIASES[alias] = name;
    });
  }

  return providers[name];
}

/**
 * Utility function to normalize and clean up parameters for different providers
 * 
 * @param {Object} opts - The original options object
 * @param {Object} config - Configuration for parameter handling
 * @param {boolean} config.useStopSequences - Whether to rename 'stop' to 'stop_sequences'
 * @param {boolean} config.clampTemp - Whether to clamp temperature to provider's range
 * @param {number} config.maxTemp - Maximum temperature value (default: 1.0)
 * @param {number} config.minTemp - Minimum temperature value (default: 0.0)
 * @returns {Object} - Cleaned up options object
 */
export function normalizeProviderParams(opts, config = {}) {
  const result = { ...opts };
  
  // Handle stop sequences
  if (config.useStopSequences && (
    typeof result.stop === 'string' ||
    Array.isArray(result.stop)
  )) {
    result.stop_sequences = Array.isArray(result.stop) ? result.stop : [result.stop];
    delete result.stop;
  }
  
  // Handle temperature clamping
  if (config.clampTemp && typeof result.temperature === 'number') {
    const maxTemp = config.maxTemp ?? 1.0;
    const minTemp = config.minTemp ?? 0.0;
    result.temperature = Math.min(maxTemp, Math.max(minTemp, result.temperature));
  }
  
  // Remove unsupported parameters if specified
  if (Array.isArray(config.removeParams)) {
    for (const param of config.removeParams) {
      delete result[param];
    }
  }
  
  return result;
}