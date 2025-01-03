"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.STRATEGIES = void 0;
exports.getStrategy = getStrategy;
var _config = require("../config.js");
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
    var _getConfig$idioSymbol = (0, _config.getConfig)().idioSymbols,
      tagPrefix = _getConfig$idioSymbol.tagPrefix,
      openBrace = _getConfig$idioSymbol.openBrace,
      closeBrace = _getConfig$idioSymbol.closeBrace,
      closePrefix = _getConfig$idioSymbol.closePrefix,
      braceSuffix = _getConfig$idioSymbol.braceSuffix;
    return "\nMETA & OUTPUT STRUCTURE RULES:\n===\n\nYou are an AI that outputs text using a simple markup language with only two rules:\n1. ".concat(tagPrefix).concat(openBrace, "nodename").concat(braceSuffix, " opens a node.\n2. ").concat(closePrefix).concat(closeBrace, "nodename").concat(braceSuffix, " closes a node.\nNodes can contain content or other nodes.\n\nExamples:\n").concat(tagPrefix).concat(openBrace, "greeting").concat(braceSuffix, "hello world").concat(closePrefix).concat(closeBrace, "greeting").concat(braceSuffix, "\n\n").concat(tagPrefix).concat(openBrace, "book").concat(braceSuffix, "\n  ").concat(tagPrefix).concat(openBrace, "chapter").concat(braceSuffix, "Once upon a time").concat(closePrefix).concat(closeBrace, "chapter").concat(braceSuffix, "\n  ").concat(tagPrefix).concat(openBrace, "chapter").concat(braceSuffix, "The end").concat(closePrefix).concat(closeBrace, "chapter").concat(braceSuffix, "\n").concat(closePrefix).concat(closeBrace, "book").concat(braceSuffix, "\n\nYou accept instructions and perform them, always following this syntax.\n\n").concat(subSystemPrompt || 'You are an AI assistant and respond to the request.').trim();
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
    var _getConfig$idioSymbol2 = (0, _config.getConfig)().idioSymbols,
      tagPrefix = _getConfig$idioSymbol2.tagPrefix,
      openBrace = _getConfig$idioSymbol2.openBrace,
      closeBrace = _getConfig$idioSymbol2.closeBrace,
      closePrefix = _getConfig$idioSymbol2.closePrefix,
      braceSuffix = _getConfig$idioSymbol2.braceSuffix;
    return "\nOUTPUT RULES:\nYou are an AI that outputs text using a simple markup language with two rules:\n1. ".concat(tagPrefix).concat(openBrace, "nodename").concat(braceSuffix, " opens a node.\n2. ").concat(closePrefix).concat(closeBrace, "nodename").concat(braceSuffix, " closes a node.\nNodes can contain content or other nodes.\n\n").concat(subSystemPrompt || 'You are an AI assistant and respond to the request.').trim();
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
    var _getConfig$idioSymbol3 = (0, _config.getConfig)().idioSymbols,
      tagPrefix = _getConfig$idioSymbol3.tagPrefix,
      openBrace = _getConfig$idioSymbol3.openBrace,
      closeBrace = _getConfig$idioSymbol3.closeBrace,
      closePrefix = _getConfig$idioSymbol3.closePrefix,
      braceSuffix = _getConfig$idioSymbol3.braceSuffix;
    return "\nOUTPUT RULES:\nYou are an AI that outputs text using a simple markup language with two rules:\n1. ".concat(tagPrefix).concat(openBrace, "nodename").concat(braceSuffix, " opens a node.\n2. ").concat(closePrefix).concat(closeBrace, "nodename").concat(braceSuffix, " closes a node.\nNodes can contain content or other nodes.\n\n").concat(subSystemPrompt || 'You are an AI assistant and respond to the request.').trim();
  },
  genUserPrompt: function genUserPrompt(scaffold, originalPrompt) {
    var _getConfig$idioSymbol4 = (0, _config.getConfig)().idioSymbols,
      tagPrefix = _getConfig$idioSymbol4.tagPrefix,
      openBrace = _getConfig$idioSymbol4.openBrace,
      closeBrace = _getConfig$idioSymbol4.closeBrace,
      braceSuffix = _getConfig$idioSymbol4.braceSuffix;
    return [{
      role: 'user',
      content: "".concat(originalPrompt, "\n\nHere is the schema to follow:\n").concat(scaffold, "\n  ").trim()
    }, {
      role: 'assistant',
      content: "```\n"
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
    var _getConfig$idioSymbol5 = (0, _config.getConfig)().idioSymbols,
      tagPrefix = _getConfig$idioSymbol5.tagPrefix,
      openBrace = _getConfig$idioSymbol5.openBrace,
      closeBrace = _getConfig$idioSymbol5.closeBrace,
      closePrefix = _getConfig$idioSymbol5.closePrefix,
      braceSuffix = _getConfig$idioSymbol5.braceSuffix;
    return "\nRESPONSE RULES:\n1. Output text using the simple markup language:\n   - ".concat(tagPrefix).concat(openBrace, "nodename").concat(braceSuffix, " opens a node.\n   - ").concat(closePrefix).concat(closeBrace, "nodename").concat(braceSuffix, " closes a node.\n2. Nodes can contain content or other nodes.\n3. For example:\n   ").concat(tagPrefix).concat(openBrace, "name").concat(braceSuffix, "Sarah").concat(closePrefix).concat(closeBrace, "name").concat(braceSuffix, "\n   ").concat(tagPrefix).concat(openBrace, "age").concat(braceSuffix, "25").concat(closePrefix).concat(closeBrace, "age").concat(braceSuffix, "\n4. Follow the provided structure exactly.\n5. Begin with the structure provided.\n\n").concat(subSystemPrompt || 'You are an AI assistant and respond to the request.').trim();
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
    var _getConfig$idioSymbol6 = (0, _config.getConfig)().idioSymbols,
      tagPrefix = _getConfig$idioSymbol6.tagPrefix,
      openBrace = _getConfig$idioSymbol6.openBrace,
      closeBrace = _getConfig$idioSymbol6.closeBrace,
      closePrefix = _getConfig$idioSymbol6.closePrefix,
      braceSuffix = _getConfig$idioSymbol6.braceSuffix;
    return "\nCRITICAL RULES:\nMUST: Output text using the simple markup language with these rules:\n- ".concat(tagPrefix).concat(openBrace, "nodename").concat(braceSuffix, " opens a node.\n- ").concat(closePrefix).concat(closeBrace, "nodename").concat(braceSuffix, " closes a node.\nMUST: Follow the provided structure exactly.\nMUST: Nodes can contain content or other nodes.\nMUST: Begin with the structure provided.\n\nExamples:\n").concat(tagPrefix).concat(openBrace, "item").concat(braceSuffix, "Content").concat(closePrefix).concat(closeBrace, "item").concat(braceSuffix, "\n").concat(tagPrefix).concat(openBrace, "container").concat(braceSuffix, "\n   ").concat(tagPrefix).concat(openBrace, "child").concat(braceSuffix, "Content").concat(closePrefix).concat(closeBrace, "child").concat(braceSuffix, "\n").concat(closePrefix).concat(closeBrace, "container").concat(braceSuffix, "\n\n").concat(subSystemPrompt || 'You are an AI assistant and respond to the request.').trim();
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
    var _getConfig$idioSymbol7 = (0, _config.getConfig)().idioSymbols,
      tagPrefix = _getConfig$idioSymbol7.tagPrefix,
      openBrace = _getConfig$idioSymbol7.openBrace,
      closeBrace = _getConfig$idioSymbol7.closeBrace,
      closePrefix = _getConfig$idioSymbol7.closePrefix,
      braceSuffix = _getConfig$idioSymbol7.braceSuffix;
    return "\nSYNTAX GUIDELINES WITH EXAMPLE:\n- Use the simple markup language:\n  - ".concat(tagPrefix).concat(openBrace, "nodename").concat(braceSuffix, " opens a node.\n  - ").concat(closePrefix).concat(closeBrace, "nodename").concat(braceSuffix, " closes a node.\n- Nodes can contain content or other nodes.\n- Follow the structure exactly.\n\nExample of compliance:\n").concat(tagPrefix).concat(openBrace, "root").concat(braceSuffix, "\n   ").concat(tagPrefix).concat(openBrace, "example").concat(braceSuffix, "Hello world").concat(closePrefix).concat(closeBrace, "example").concat(braceSuffix, "\n").concat(closePrefix).concat(closeBrace, "root").concat(braceSuffix, "\n\n").concat(subSystemPrompt || 'You are an AI assistant and respond to the request.').trim();
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
var STRATEGIES = exports.STRATEGIES = {
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
function getStrategy(id) {
  return STRATEGIES[id] || STRATEGIES['default'];
}