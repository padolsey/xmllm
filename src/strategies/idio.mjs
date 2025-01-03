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
    const { tagPrefix, openBrace, closeBrace, closePrefix, braceSuffix } = getConfig().idioSymbols;
    return `
META & OUTPUT STRUCTURE RULES:
===

You are an AI that outputs text using a simple markup language with only two rules:
1. ${tagPrefix}${openBrace}nodename${braceSuffix} opens a node.
2. ${closePrefix}${closeBrace}nodename${braceSuffix} closes a node.
Nodes can contain content or other nodes.

Examples:
${tagPrefix}${openBrace}greeting${braceSuffix}hello world${closePrefix}${closeBrace}greeting${braceSuffix}

${tagPrefix}${openBrace}book${braceSuffix}
  ${tagPrefix}${openBrace}chapter${braceSuffix}Once upon a time${closePrefix}${closeBrace}chapter${braceSuffix}
  ${tagPrefix}${openBrace}chapter${braceSuffix}The end${closePrefix}${closeBrace}chapter${braceSuffix}
${closePrefix}${closeBrace}book${braceSuffix}

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
    const { tagPrefix, openBrace, closeBrace, closePrefix, braceSuffix } = getConfig().idioSymbols;
    return `
OUTPUT RULES:
You are an AI that outputs text using a simple markup language with two rules:
1. ${tagPrefix}${openBrace}nodename${braceSuffix} opens a node.
2. ${closePrefix}${closeBrace}nodename${braceSuffix} closes a node.
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
    const { tagPrefix, openBrace, closeBrace, closePrefix, braceSuffix } = getConfig().idioSymbols;
    return `
OUTPUT RULES:
You are an AI that outputs text using a simple markup language with two rules:
1. ${tagPrefix}${openBrace}nodename${braceSuffix} opens a node.
2. ${closePrefix}${closeBrace}nodename${braceSuffix} closes a node.
Nodes can contain content or other nodes.

${subSystemPrompt || 'You are an AI assistant and respond to the request.'}`.trim();
  },

  genUserPrompt: (scaffold, originalPrompt) => {
    const { tagPrefix, openBrace, closeBrace, braceSuffix } = getConfig().idioSymbols;
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
    const { tagPrefix, openBrace, closeBrace, closePrefix, braceSuffix } = getConfig().idioSymbols;
    return `
RESPONSE RULES:
1. Output text using the simple markup language:
   - ${tagPrefix}${openBrace}nodename${braceSuffix} opens a node.
   - ${closePrefix}${closeBrace}nodename${braceSuffix} closes a node.
2. Nodes can contain content or other nodes.
3. For example:
   ${tagPrefix}${openBrace}name${braceSuffix}Sarah${closePrefix}${closeBrace}name${braceSuffix}
   ${tagPrefix}${openBrace}age${braceSuffix}25${closePrefix}${closeBrace}age${braceSuffix}
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
    const { tagPrefix, openBrace, closeBrace, closePrefix, braceSuffix } = getConfig().idioSymbols;
    return `
CRITICAL RULES:
MUST: Output text using the simple markup language with these rules:
- ${tagPrefix}${openBrace}nodename${braceSuffix} opens a node.
- ${closePrefix}${closeBrace}nodename${braceSuffix} closes a node.
MUST: Follow the provided structure exactly.
MUST: Nodes can contain content or other nodes.
MUST: Begin with the structure provided.

Examples:
${tagPrefix}${openBrace}item${braceSuffix}Content${closePrefix}${closeBrace}item${braceSuffix}
${tagPrefix}${openBrace}container${braceSuffix}
   ${tagPrefix}${openBrace}child${braceSuffix}Content${closePrefix}${closeBrace}child${braceSuffix}
${closePrefix}${closeBrace}container${braceSuffix}

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
    const { tagPrefix, openBrace, closeBrace, closePrefix, braceSuffix } = getConfig().idioSymbols;
    return `
SYNTAX GUIDELINES WITH EXAMPLE:
- Use the simple markup language:
  - ${tagPrefix}${openBrace}nodename${braceSuffix} opens a node.
  - ${closePrefix}${closeBrace}nodename${braceSuffix} closes a node.
- Nodes can contain content or other nodes.
- Follow the structure exactly.

Example of compliance:
${tagPrefix}${openBrace}root${braceSuffix}
   ${tagPrefix}${openBrace}example${braceSuffix}Hello world${closePrefix}${closeBrace}example${braceSuffix}
${closePrefix}${closeBrace}root${braceSuffix}

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