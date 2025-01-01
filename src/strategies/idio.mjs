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
    const symbol = getConfig().idioSymbol;
    return `
META & OUTPUT STRUCTURE RULES:
===

You are an AI that outputs text using a simple markup language with only two rules:
1. ${symbol}START(nodename) opens a node.
2. ${symbol}END(nodename) closes a node.
Nodes can contain content or other nodes.

Examples:
${symbol}START(greeting)hello world${symbol}END(greeting)

${symbol}START(book)
  ${symbol}START(chapter)Once upon a time${symbol}END(chapter)
  ${symbol}START(chapter)The end${symbol}END(chapter)
${symbol}END(book)

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
    const symbol = getConfig().idioSymbol;
    return `
OUTPUT RULES:
You are an AI that outputs text using a simple markup language with two rules:
1. ${symbol}START(nodename) opens a node.
2. ${symbol}END(nodename) closes a node.
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
    const symbol = getConfig().idioSymbol;
    return `
OUTPUT RULES:
You are an AI that outputs text using a simple markup language with two rules:
1. ${symbol}START(nodename) opens a node.
2. ${symbol}END(nodename) closes a node.
Nodes can contain content or other nodes.

${subSystemPrompt || 'You are an AI assistant and respond to the request.'}`.trim();
  },

  genUserPrompt: (scaffold, originalPrompt) => {
    const symbol = getConfig().idioSymbol;
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
        content: `${symbol}START(response)\n`
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
    const symbol = getConfig().idioSymbol;
    return `
RESPONSE RULES:
1. Output text using the simple markup language:
   - ${symbol}START(nodename) opens a node.
   - ${symbol}END(nodename) closes a node.
2. Nodes can contain content or other nodes.
3. For example:
   ${symbol}START(name)Sarah${symbol}END(name)
   ${symbol}START(age)25${symbol}END(age)
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
    const symbol = getConfig().idioSymbol;
    return `
CRITICAL RULES:
MUST: Output text using the simple markup language with these rules:
- ${symbol}START(nodename) opens a node.
- ${symbol}END(nodename) closes a node.
MUST: Follow the provided structure exactly.
MUST: Nodes can contain content or other nodes.
MUST: Begin with the structure provided.

Examples:
${symbol}START(item)Content${symbol}END(item)
${symbol}START(container)
   ${symbol}START(child)Content${symbol}END(child)
${symbol}END(container)

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
    const symbol = getConfig().idioSymbol;
    return `
SYNTAX GUIDELINES WITH EXAMPLE:
- Use the simple markup language:
  - ${symbol}START(nodename) opens a node.
  - ${symbol}END(nodename) closes a node.
- Nodes can contain content or other nodes.
- Follow the structure exactly.

Example of compliance:
${symbol}START(root)
   ${symbol}START(example)Hello world${symbol}END(example)
${symbol}END(root)

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