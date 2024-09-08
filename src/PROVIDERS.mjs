import { config } from 'dotenv';

config({
  path: '.env'
});

const standardPayloader = ({
  messages = [],
  max_tokens = 300,
  stop = null,
  temperature = 0.5,
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
  temperature = 0.5,
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

// We anchor pricing/cost to the gpt3.5/7x8B level models
// Note that 'cost' under 'constraints' is just used for scoring
// which model to use - cheapest is best, so if we really want a model
// to be used, we just set the cost to lower. lol.

export default {
  claude: {
    //https://www.anthropic.com/api
    constraints: {
      cost: .2,
      rpmLimit: 100
    },
    endpoint: 'https://api.anthropic.com/v1/messages',
    key: process.env.ANTHROPIC_API_KEY,
    models: {
      superfast: {
        // name: 'claude-3-5-sonnet-20240620',
        name: 'claude-3-haiku-20240307',
        costPer1MTokens: 0.50, //avg? i/o...
        maxContextSize: 100_000
      },
      fast: {
        // name: 'claude-3-5-sonnet-20240620',
        name: 'claude-3-haiku-20240307',
        costPer1MTokens: 1.50,
        maxContextSize: 100_000
      },
      good: {
        // name: 'claude-3-opus-20240229',
        // name: 'claude-3-5-sonnet-20240620',
        name: 'claude-3-haiku-20240307',
        costPer1MTokens: 5.00, // avg i/o ?
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
      temperature = 0.5,
      top_p = 1,
      presence_penalty = 0
    }) {
      // const systemPrompt = messages.filter(m => m.role === 'system')?.[0];

      return {
        system,
        messages,
        max_tokens,
        stop_sequences: stop,
        temperature,
        top_p,
        // presence_penalty // not used by claude ...
      };

      const obj = {
        max_tokens,
        stop_sequences: stop,
        temperature,
        top_p,
        presence_penalty
      };

      obj.messages = messages.filter(m => m.role !== 'system').map(m => {
        return {
          role: m.role,
          content: (m.content || '').trim()
          // claude seems to complain about whitespace,
          // just with assistant role but still, may as well trim:
          // E.g. {"type":"error","error":{"type":"invalid_request_error",
          // "message":"messages: final assistant content cannot
          // end with trailing whitespace"}}
        }
      })

      return obj;
    }
  },
  openai: {
    constraints: {
      cost: .5, // approx agg cost hueristic
      rpmLimit: 20
    }, 
    endpoint: 'https://api.openai.com/v1/chat/completions',
    key: process.env.OPENAI_API_KEY,
    models: {
      superfast: {
        name: 'gpt-4o-mini',
        costPer1MTokens: 1.50,
        maxContextSize: 1_000_000
      },
      fast: {
        name: 'gpt-4o-mini',
        costPer1MTokens: 1.50,
        maxContextSize: 1_000_000
      },
      good: {
        name: 'gpt-4o-mini',
        costPer1MTokens: 15,
        maxContextSize: 128_000
      }
    },
    payloader: standardPayloader
  },
  // togetherai: {
  //   constraints: {
  //     cost: 2,
  //     rpmLimit: 10
  //   }, 
  //   endpoint: 'https://api.together.xyz/v1/chat/completions',
  //   key: process.env.TOGETHER_API_KEY,
  //   models: {
  //     superfast: {
  //       // name: 'Qwen/Qwen1.5-4B-Chat', //tiny context of 4k
  //       name: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
  //       costPer1MTokens: 0.60,
  //     },
  //     fast: {
  //       name: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
  //       costPer1MTokens: 0.60,
  //     },
  //     good: {
  //       // name: 'mistralai/Mixtral-8x22B-Instruct-v0.1',
  //       // name: 'meta-llama/Llama-2-70b-chat-hf',
  //       name: 'Qwen/Qwen1.5-72B-Chat',
  //       costPer1MTokens: 0.90
  //     }
  //   },
  //   payloader: taiStylePayloader
  // },
  // perplexityai: {
  //   constraints: {
  //     cost: 3,
  //     rpmLimit: 10
  //   }, 
  //   endpoint: 'https://api.perplexity.ai/chat/completions',
  //   key: process.env.PERPLEXITY_API_KEY,
  //   models: {
  //     superfast: {
  //       // name: 'llama-3-8b-instruct',
  //       name: 'mixtral-8x7b-instruct',
  //       costPer1MTokens: 0.60
  //     },
  //     fast: {
  //       // name: 'llama-3-8b-instruct',
  //       name: 'mixtral-8x7b-instruct',
  //       costPer1MTokens: 0.60
  //     },
  //     good: {
  //       // slightly more reliable in terms of prompting
  //       // seemingly aligns well with how we've optimized the prompt for openai
  //       name: 'llama-3-70b-instruct', 
  //       // name: 'llama-3-sonar-large-32k-chat',
  //       costPer1MTokens: 1.00
  //     }
  //   },
  //   payloader: standardPayloader
  // },
  // anyscaleai: {
  //   constraints: {
  //     cost: 10, // I've upped this like scary because anyscale is unreliable
  //     rpmLimit: 30
  //   }, 
  //   endpoint: 'https://api.endpoints.anyscale.com/v1/chat/completions',
  //   key: process.env.ANYSCALE_API_KEY,
  //   models: {
  //     superfast: {
  //       name: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
  //       costPer1MTokens: 0.001
  //     },
  //     fast: {
  //       name: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
  //       costPer1MTokens: 0.001
  //     },
  //     good: {
  //       name: 'mistralai/Mixtral-8x22B-Instruct-v0.1',
  //       costPer1MTokens: 0.001
  //     }
  //   },
  //   payloader: standardPayloader
  // }
};