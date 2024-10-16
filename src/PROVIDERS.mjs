import { config } from 'dotenv';

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
  stop = ['</s>','[/INST]'],
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

export default {
  claude: {
    constraints: {
      rpmLimit: 100
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
      rpmLimit: 20
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
      rpmLimit: 10
    }, 
    endpoint: 'https://api.together.xyz/v1/chat/completions',
    key: process.env.TOGETHER_API_KEY,
    models: {
      superfast: {
        name: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      },
      fast: {
        name: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      },
      good: {
        name: 'Qwen/Qwen1.5-72B-Chat',
      }
    },
    payloader: taiStylePayloader
  },
  perplexityai: {
    constraints: {
      rpmLimit: 10
    }, 
    endpoint: 'https://api.perplexity.ai/chat/completions',
    key: process.env.PERPLEXITY_API_KEY,
    models: {
      superfast: {
        name: 'mixtral-8x7b-instruct',
      },
      fast: {
        name: 'mixtral-8x7b-instruct',
      },
      good: {
        name: 'llama-3-70b-instruct', 
      }
    },
    payloader: standardPayloader
  },
  anyscaleai: {
    constraints: {
      rpmLimit: 30
    }, 
    endpoint: 'https://api.endpoints.anyscale.com/v1/chat/completions',
    key: process.env.ANYSCALE_API_KEY,
    models: {
      superfast: {
        name: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      },
      fast: {
        name: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      },
      good: {
        name: 'mistralai/Mixtral-8x22B-Instruct-v0.1',
      }
    },
    payloader: standardPayloader
  }
};