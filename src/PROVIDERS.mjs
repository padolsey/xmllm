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

const standardPayloader = ({
  messages = [],
  max_tokens = 300,
  stop = null,
  temperature = 0.52,
  top_p = 1,
  presence_penalty = 0,
  system = ''
}) => {

  const payload = {
    messages: [{
      role: 'system',
      content: system || ''
    }].concat(messages)
  };

  if (max_tokens != null) {
    payload.max_tokens = max_tokens;
  }

  if (stop != null) {
    payload.stop = stop;
  }

  if (temperature != null) {
    payload.temperature = temperature;
  }

  if (top_p != null) {
    payload.top_p = top_p;
  }

  if (presence_penalty != null) {
    payload.presence_penalty = presence_penalty;
  }

  return payload;
};

const taiStylePayloader = ({
  messages = [],
  max_tokens = 300,
  stop = ['',''],
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

const providers = {
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
    payloader({
      messages = [],
      system,
      max_tokens = 300,
      stop = null,
      temperature = 0.52,
      top_p = 1,
      presence_penalty = 0
    }) {
      return {
        system,
        messages,
        max_tokens,
        stop_sequences: stop,
        temperature,
        top_p,
      };
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
    payloader: standardPayloader
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
  togetherai: {
    constraints: {
      rpmLimit: 100
    }, 
    endpoint: 'https://api.together.xyz/v1/chat/completions',
    key: process.env.TOGETHER_API_KEY || process.env.TOGETHERAI_API_KEY,
    models: {
      superfast: {
        name: 'Qwen/Qwen2.5-7B-Instruct-Turbo',
        maxContextSize: 32000
      },
      fast: {
        name: 'Qwen/Qwen2.5-7B-Instruct-Turbo',
        maxContextSize: 32000
      },
      good: {
        name: 'Qwen/Qwen2.5-72B-Instruct-Turbo',
        maxContextSize: 32000
      }
    },
    payloader: taiStylePayloader
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
    payloader: standardPayloader
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