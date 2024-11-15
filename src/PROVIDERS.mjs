import { config } from 'dotenv';
import { ModelValidationError } from './errors/ProviderErrors.mjs';

config({
  path: '.env'
});

const standardPayloader = ({
  messages = [],
  max_tokens = 300,
  stop = null,
  temperature = 0.52,
  top_p = 1,
  presence_penalty = 0,
  system = ''
}) => ({
  messages: [{
    role: 'system',
    content: system || ''
  }].concat(messages),
  max_tokens,
  stop,
  temperature,
  top_p,
  presence_penalty
});

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
  claude: {
    constraints: {
      rpmLimit: 200
    },
    endpoint: 'https://api.anthropic.com/v1/messages',
    key: process.env.ANTHROPIC_API_KEY,
    models: {
      superfast: {
        name: 'claude-3-haiku-20240307',
        maxContextSize: 100_000
      },
      fast: {
        name: 'claude-3-haiku-20240307',
        maxContextSize: 100_000
      },
      good: {
        name: 'claude-3-5-sonnet-20240620',
        maxContextSize: 100_000
      }
    },
    headerGen() {
      return {
        'x-api-key': this.key,
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
        maxContextSize: 1_000_000
      },
      fast: {
        name: 'gpt-4o-mini',
        maxContextSize: 1_000_000
      },
      good: {
        name: 'gpt-4o',
        maxContextSize: 128_000
      }
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
      superfast: {
        name: 'Qwen/Qwen2.5-7B-Instruct-Turbo',
      },
      fast: {
        name: 'Qwen/Qwen2.5-7B-Instruct-Turbo',
      },
      good: {
        name: 'Qwen/Qwen2.5-72B-Instruct-Turbo',
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
      },
      fast: {
        name: 'llama-3.1-sonar-small-128k-chat',
      },
      good: {
        name: 'llama-3.1-sonar-large-128k-chat', 
      }
    },
    payloader: standardPayloader
  }
};

export default providers;

export function createProvidersWithKeys(keys = {}) {
  const newProviders = { ...providers };
  
  if (keys.ANTHROPIC_API_KEY) {
    newProviders.claude.key = keys.ANTHROPIC_API_KEY;
  }
  if (keys.OPENAI_API_KEY) {
    newProviders.openai.key = keys.OPENAI_API_KEY;
  }
  if (keys.TOGETHER_API_KEY) {
    newProviders.togetherai.key = keys.TOGETHER_API_KEY;
  }
  if (keys.PERPLEXITY_API_KEY) {
    newProviders.perplexityai.key = keys.PERPLEXITY_API_KEY;
  }
  
  return newProviders;
}

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