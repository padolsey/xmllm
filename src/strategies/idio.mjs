import { getConfig } from '../config.mjs';

/**
 * @typedef {Object} PromptStrategy
 * @property {string} id - Unique identifier for the strategy
 * @property {string} name - Display name of the strategy
 * @property {string} description - Description of what the strategy does
 * @property {function(string=): (string|Array<{role: string, content: string}>)} genSystemPrompt
 * @property {function(string, string, boolean=): (string|Array<{role: 'user'|'assistant', content: string}>)} genUserPrompt
 */

/**
 * DEFAULT STRATEGY
 * Balanced approach with clear instructions
 * @type {PromptStrategy}
 */
const defaultStrategy = {
  id: 'default',
  name: 'Default Syntax',
  description: 'Original balanced strategy for the custom syntax',
  genSystemPrompt: (subSystemPrompt = '') => {
    const { openTagPrefix, tagOpener, tagCloser, closeTagPrefix, tagSuffix } = getConfig().idioSymbols;
    return `
META & OUTPUT STRUCTURE RULES:
===

You are an AI that outputs text using a simple markup language with only two rules:
1. ${openTagPrefix}${tagOpener}nodename${tagSuffix} opens a node.
2. ${closeTagPrefix}${tagCloser}nodename${tagSuffix} closes a node.
Nodes can contain content or other nodes.

Examples:
${openTagPrefix}${tagOpener}greeting${tagSuffix}hello world${closeTagPrefix}${tagCloser}greeting${tagSuffix}

${openTagPrefix}${tagOpener}book${tagSuffix}
  ${openTagPrefix}${tagOpener}chapter${tagSuffix}Once upon a time${closeTagPrefix}${tagCloser}chapter${tagSuffix}
  ${openTagPrefix}${tagOpener}chapter${tagSuffix}The end${closeTagPrefix}${tagCloser}chapter${tagSuffix}
${closeTagPrefix}${tagCloser}book${tagSuffix}

You accept instructions and perform them, always following this syntax.

${subSystemPrompt || 'You are an AI assistant and respond to the request.'}`.trim();
  },

  genUserPrompt: (scaffold, originalPrompt) => {
    if (!scaffold) {
      return originalPrompt;
    }
    
    return `${originalPrompt}

IMPORTANT: The data you return should follow this structure:
${scaffold}`;
  }
};

/**
 * MINIMAL STRATEGY
 * Keeps it concise while providing necessary explanation
 */
const minimalStrategy = {
  id: 'minimal',
  name: 'Minimal Syntax Guide',
  description: 'Bare minimum instructions focusing on output requirements',
  genSystemPrompt: (subSystemPrompt = '') => {
    const { openTagPrefix, tagOpener, tagCloser, closeTagPrefix, tagSuffix } = getConfig().idioSymbols;
    return `
OUTPUT RULES:
You are an AI that outputs text using a simple markup language with two rules:
1. ${openTagPrefix}${tagOpener}nodename${tagSuffix} opens a node.
2. ${closeTagPrefix}${tagCloser}nodename${tagSuffix} closes a node.
Nodes can contain content or other nodes.

${subSystemPrompt || 'You are an AI assistant and respond to the request.'}`.trim();
  },

  genUserPrompt: (scaffold, originalPrompt) => `
${originalPrompt}

Here is the schema to follow:
${scaffold}
  `.trim()
};

/**
 * SEED STRATEGY
 * Keeps it concise but seeds the response
 */
const seedStrategy = {
  id: 'seed',
  name: 'Force Syntax in Seeded Response',
  description: 'Forcing response using seeding from assistant',
  genSystemPrompt: (subSystemPrompt = '') => {
    const { openTagPrefix, tagOpener, tagCloser, closeTagPrefix, tagSuffix } = getConfig().idioSymbols;
    return `
OUTPUT RULES:
You are an AI that outputs text using a simple markup language with two rules:
1. ${openTagPrefix}${tagOpener}nodename${tagSuffix} opens a node.
2. ${closeTagPrefix}${tagCloser}nodename${tagSuffix} closes a node.
Nodes can contain content or other nodes.

${subSystemPrompt || 'You are an AI assistant and respond to the request.'}`.trim();
  },

  genUserPrompt: (scaffold, originalPrompt) => {
    const { openTagPrefix, tagOpener, tagCloser, tagSuffix } = getConfig().idioSymbols;
    return [
      {
        role: 'user',
        content: `${originalPrompt}

Here is the schema to follow:
${scaffold}
  `.trim()
      },
      {
        role: 'assistant',
        content: `\`\`\`\n`
      }
    ];
  }
};

/**
 * STRUCTURED STRATEGY
 * Provides detailed instructions and examples
 */
const structuredStrategy = {
  id: 'structured',
  name: 'Structured with Syntax Examples',
  description: 'Includes concrete examples to guide the model',
  genSystemPrompt: (subSystemPrompt = '') => {
    const { openTagPrefix, tagOpener, tagCloser, closeTagPrefix, tagSuffix } = getConfig().idioSymbols;
    return `
RESPONSE RULES:
1. Output text using the simple markup language:
   - ${openTagPrefix}${tagOpener}nodename${tagSuffix} opens a node.
   - ${closeTagPrefix}${tagCloser}nodename${tagSuffix} closes a node.
2. Nodes can contain content or other nodes.
3. For example:
   ${openTagPrefix}${tagOpener}name${tagSuffix}Sarah${closeTagPrefix}${tagCloser}name${tagSuffix}
   ${openTagPrefix}${tagOpener}age${tagSuffix}25${closeTagPrefix}${tagCloser}age${tagSuffix}
4. Follow the provided structure exactly.
5. Begin with the structure provided.

${subSystemPrompt || 'You are an AI assistant and respond to the request.'}`.trim();
  },

  genUserPrompt: (scaffold, originalPrompt) => [
    {
      role: 'user',
      content: `Below is the request, followed by the structure you MUST follow.

REQUEST:
${originalPrompt}

STRUCTURE:
${scaffold}
  `.trim()
    }
  ]
};

/**
 * ASSERTIVE STRATEGY
 * Uses forceful language to maximize compliance
 */
const assertiveStrategy = {
  id: 'assertive',
  name: 'Assertive Instructions',
  description: 'Forceful instructions emphasizing strict compliance',
  genSystemPrompt: (subSystemPrompt = '') => {
    const { openTagPrefix, tagOpener, tagCloser, closeTagPrefix, tagSuffix } = getConfig().idioSymbols;
    return `
CRITICAL RULES:
MUST: Output text using the simple markup language with these rules:
- ${openTagPrefix}${tagOpener}nodename${tagSuffix} opens a node.
- ${closeTagPrefix}${tagCloser}nodename${tagSuffix} closes a node.
MUST: Follow the provided structure exactly.
MUST: Nodes can contain content or other nodes.
MUST: Begin with the structure provided.

Examples:
${openTagPrefix}${tagOpener}item${tagSuffix}Content${closeTagPrefix}${tagCloser}item${tagSuffix}
${openTagPrefix}${tagOpener}container${tagSuffix}
   ${openTagPrefix}${tagOpener}child${tagSuffix}Content${closeTagPrefix}${tagCloser}child${tagSuffix}
${closeTagPrefix}${tagCloser}container${tagSuffix}

${subSystemPrompt || 'You are an AI assistant and respond to the request.'}`.trim();
  },

  genUserPrompt: (scaffold, originalPrompt) => [
    {
      role: 'user',
      content: `You MUST adhere to the following structure:\n\n\`\`\`\n${scaffold}\n\`\`\``
    },
    {
      role: 'assistant',
      content: 'Understood. I will follow it exactly. What is your request?'
    },
    {
      role: 'user',
      content: originalPrompt
    }
  ]
};

/**
 * EXEMPLAR STRATEGY
 * Demonstrates compliance with examples
 */
const exampleDrivenStrategy = {
  id: 'exemplar',
  name: 'Example-Driven Guidance',
  description: 'Provides examples to help the model understand the syntax before the real request',
  genSystemPrompt: (subSystemPrompt = '') => {
    const { openTagPrefix, tagOpener, tagCloser, closeTagPrefix, tagSuffix } = getConfig().idioSymbols;
    return `
SYNTAX GUIDELINES WITH EXAMPLE:
- Use the simple markup language:
  - ${openTagPrefix}${tagOpener}nodename${tagSuffix} opens a node.
  - ${closeTagPrefix}${tagCloser}nodename${tagSuffix} closes a node.
- Nodes can contain content or other nodes.
- Follow the structure exactly.

Example of compliance:
${openTagPrefix}${tagOpener}root${tagSuffix}
   ${openTagPrefix}${tagOpener}example${tagSuffix}Hello world${closeTagPrefix}${tagCloser}example${tagSuffix}
${closeTagPrefix}${tagCloser}root${tagSuffix}

${subSystemPrompt || 'You are an AI assistant and respond to the request.'}`.trim();
  },

  genUserPrompt: (scaffold, originalPrompt) => [
    {
      role: 'user',
      content: `First, here is the structure you must follow:\n\`\`\`\n${scaffold}\n\`\`\``
    },
    {
      role: 'assistant',
      content: 'I acknowledge the structure. Could you show me the request now?'
    },
    {
      role: 'user',
      content: `${originalPrompt}`
    }
  ]
};

/**
 * @type {Object.<string, PromptStrategy>}
 */
export const STRATEGIES = {
  default: defaultStrategy,
  minimal: minimalStrategy,
  structured: structuredStrategy,
  assertive: assertiveStrategy,
  exemplar: exampleDrivenStrategy,
  seed: seedStrategy
};

/**
 * Get a prompt strategy by ID, falling back to default if not found
 * @param {string} id - The strategy ID to retrieve
 * @returns {PromptStrategy} The requested strategy or default strategy
 */
export function getStrategy(id) {
  return STRATEGIES[id] || STRATEGIES['default'];
} 