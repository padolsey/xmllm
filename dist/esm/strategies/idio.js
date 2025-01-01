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
var defaultStrategy = {
  id: 'default',
  name: 'Default Syntax',
  description: 'Original balanced strategy for the custom syntax',
  genSystemPrompt: function genSystemPrompt() {
    var subSystemPrompt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var symbol = getConfig().idioSymbol;
    return "\nMETA & OUTPUT STRUCTURE RULES:\n===\n\nYou are an AI that outputs text using a simple markup language with only two rules:\n1. ".concat(symbol, "START(nodename) opens a node.\n2. ").concat(symbol, "END(nodename) closes a node.\nNodes can contain content or other nodes.\n\nExamples:\n").concat(symbol, "START(greeting)hello world").concat(symbol, "END(greeting)\n\n").concat(symbol, "START(book)\n  ").concat(symbol, "START(chapter)Once upon a time").concat(symbol, "END(chapter)\n  ").concat(symbol, "START(chapter)The end").concat(symbol, "END(chapter)\n").concat(symbol, "END(book)\n\nYou accept instructions and perform them, always following this syntax.\n\n").concat(subSystemPrompt || 'You are an AI assistant and respond to the request.').trim();
  },
  genUserPrompt: function genUserPrompt(scaffold, originalPrompt) {
    if (!scaffold) {
      return originalPrompt;
    }
    return "".concat(originalPrompt, "\n\nIMPORTANT: The data you return should follow this structure:\n").concat(scaffold);
  }
};

/**
 * MINIMAL STRATEGY
 * Keeps it concise while providing necessary explanation
 */
var minimalStrategy = {
  id: 'minimal',
  name: 'Minimal Syntax Guide',
  description: 'Bare minimum instructions focusing on output requirements',
  genSystemPrompt: function genSystemPrompt() {
    var subSystemPrompt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var symbol = getConfig().idioSymbol;
    return "\nOUTPUT RULES:\nYou are an AI that outputs text using a simple markup language with two rules:\n1. ".concat(symbol, "START(nodename) opens a node.\n2. ").concat(symbol, "END(nodename) closes a node.\nNodes can contain content or other nodes.\n\n").concat(subSystemPrompt || 'You are an AI assistant and respond to the request.').trim();
  },
  genUserPrompt: function genUserPrompt(scaffold, originalPrompt) {
    return "\n".concat(originalPrompt, "\n\nHere is the schema to follow:\n").concat(scaffold, "\n  ").trim();
  }
};

/**
 * SEED STRATEGY
 * Keeps it concise but seeds the response
 */
var seedStrategy = {
  id: 'seed',
  name: 'Force Syntax in Seeded Response',
  description: 'Forcing response using seeding from assistant',
  genSystemPrompt: function genSystemPrompt() {
    var subSystemPrompt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var symbol = getConfig().idioSymbol;
    return "\nOUTPUT RULES:\nYou are an AI that outputs text using a simple markup language with two rules:\n1. ".concat(symbol, "START(nodename) opens a node.\n2. ").concat(symbol, "END(nodename) closes a node.\nNodes can contain content or other nodes.\n\n").concat(subSystemPrompt || 'You are an AI assistant and respond to the request.').trim();
  },
  genUserPrompt: function genUserPrompt(scaffold, originalPrompt) {
    var symbol = getConfig().idioSymbol;
    return [{
      role: 'user',
      content: "".concat(originalPrompt, "\n\nHere is the schema to follow:\n").concat(scaffold, "\n  ").trim()
    }, {
      role: 'assistant',
      content: "".concat(symbol, "START(response)\n")
    }];
  }
};

/**
 * STRUCTURED STRATEGY
 * Provides detailed instructions and examples
 */
var structuredStrategy = {
  id: 'structured',
  name: 'Structured with Syntax Examples',
  description: 'Includes concrete examples to guide the model',
  genSystemPrompt: function genSystemPrompt() {
    var subSystemPrompt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var symbol = getConfig().idioSymbol;
    return "\nRESPONSE RULES:\n1. Output text using the simple markup language:\n   - ".concat(symbol, "START(nodename) opens a node.\n   - ").concat(symbol, "END(nodename) closes a node.\n2. Nodes can contain content or other nodes.\n3. For example:\n   ").concat(symbol, "START(name)Sarah").concat(symbol, "END(name)\n   ").concat(symbol, "START(age)25").concat(symbol, "END(age)\n4. Follow the provided structure exactly.\n5. Begin with the structure provided.\n\n").concat(subSystemPrompt || 'You are an AI assistant and respond to the request.').trim();
  },
  genUserPrompt: function genUserPrompt(scaffold, originalPrompt) {
    return [{
      role: 'user',
      content: "Below is the request, followed by the structure you MUST follow.\n\nREQUEST:\n".concat(originalPrompt, "\n\nSTRUCTURE:\n").concat(scaffold, "\n  ").trim()
    }];
  }
};

/**
 * ASSERTIVE STRATEGY
 * Uses forceful language to maximize compliance
 */
var assertiveStrategy = {
  id: 'assertive',
  name: 'Assertive Instructions',
  description: 'Forceful instructions emphasizing strict compliance',
  genSystemPrompt: function genSystemPrompt() {
    var subSystemPrompt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var symbol = getConfig().idioSymbol;
    return "\nCRITICAL RULES:\nMUST: Output text using the simple markup language with these rules:\n- ".concat(symbol, "START(nodename) opens a node.\n- ").concat(symbol, "END(nodename) closes a node.\nMUST: Follow the provided structure exactly.\nMUST: Nodes can contain content or other nodes.\nMUST: Begin with the structure provided.\n\nExamples:\n").concat(symbol, "START(item)Content").concat(symbol, "END(item)\n").concat(symbol, "START(container)\n   ").concat(symbol, "START(child)Content").concat(symbol, "END(child)\n").concat(symbol, "END(container)\n\n").concat(subSystemPrompt || 'You are an AI assistant and respond to the request.').trim();
  },
  genUserPrompt: function genUserPrompt(scaffold, originalPrompt) {
    return [{
      role: 'user',
      content: "You MUST adhere to the following structure:\n\n```\n".concat(scaffold, "\n```")
    }, {
      role: 'assistant',
      content: 'Understood. I will follow it exactly. What is your request?'
    }, {
      role: 'user',
      content: originalPrompt
    }];
  }
};

/**
 * EXEMPLAR STRATEGY
 * Demonstrates compliance with examples
 */
var exampleDrivenStrategy = {
  id: 'exemplar',
  name: 'Example-Driven Guidance',
  description: 'Provides examples to help the model understand the syntax before the real request',
  genSystemPrompt: function genSystemPrompt() {
    var subSystemPrompt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var symbol = getConfig().idioSymbol;
    return "\nSYNTAX GUIDELINES WITH EXAMPLE:\n- Use the simple markup language:\n  - ".concat(symbol, "START(nodename) opens a node.\n  - ").concat(symbol, "END(nodename) closes a node.\n- Nodes can contain content or other nodes.\n- Follow the structure exactly.\n\nExample of compliance:\n").concat(symbol, "START(root)\n   ").concat(symbol, "START(example)Hello world").concat(symbol, "END(example)\n").concat(symbol, "END(root)\n\n").concat(subSystemPrompt || 'You are an AI assistant and respond to the request.').trim();
  },
  genUserPrompt: function genUserPrompt(scaffold, originalPrompt) {
    return [{
      role: 'user',
      content: "First, here is the structure you must follow:\n```\n".concat(scaffold, "\n```")
    }, {
      role: 'assistant',
      content: 'I acknowledge the structure. Could you show me the request now?'
    }, {
      role: 'user',
      content: "".concat(originalPrompt)
    }];
  }
};

/**
 * @type {Object.<string, PromptStrategy>}
 */
export var STRATEGIES = {
  "default": defaultStrategy,
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