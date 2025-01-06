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
      openTagPrefix = _getConfig$idioSymbol.openTagPrefix,
      tagOpener = _getConfig$idioSymbol.tagOpener,
      tagCloser = _getConfig$idioSymbol.tagCloser,
      closeTagPrefix = _getConfig$idioSymbol.closeTagPrefix,
      tagSuffix = _getConfig$idioSymbol.tagSuffix;
    return "\nMETA & OUTPUT STRUCTURE RULES:\n===\n\nYou are an AI that outputs text using a simple markup language with only two rules:\n1. ".concat(openTagPrefix).concat(tagOpener, "nodename").concat(tagSuffix, " opens a node.\n2. ").concat(closeTagPrefix).concat(tagCloser, "nodename").concat(tagSuffix, " closes a node.\nNodes can contain content or other nodes.\n\nExamples:\n").concat(openTagPrefix).concat(tagOpener, "greeting").concat(tagSuffix, "hello world").concat(closeTagPrefix).concat(tagCloser, "greeting").concat(tagSuffix, "\n\n").concat(openTagPrefix).concat(tagOpener, "book").concat(tagSuffix, "\n  ").concat(openTagPrefix).concat(tagOpener, "chapter").concat(tagSuffix, "Once upon a time").concat(closeTagPrefix).concat(tagCloser, "chapter").concat(tagSuffix, "\n  ").concat(openTagPrefix).concat(tagOpener, "chapter").concat(tagSuffix, "The end").concat(closeTagPrefix).concat(tagCloser, "chapter").concat(tagSuffix, "\n").concat(closeTagPrefix).concat(tagCloser, "book").concat(tagSuffix, "\n\nYou accept instructions and perform them, always following this syntax.\n\n").concat(subSystemPrompt || 'You are an AI assistant and respond to the request.').trim();
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
      openTagPrefix = _getConfig$idioSymbol2.openTagPrefix,
      tagOpener = _getConfig$idioSymbol2.tagOpener,
      tagCloser = _getConfig$idioSymbol2.tagCloser,
      closeTagPrefix = _getConfig$idioSymbol2.closeTagPrefix,
      tagSuffix = _getConfig$idioSymbol2.tagSuffix;
    return "\nOUTPUT RULES:\nYou are an AI that outputs text using a simple markup language with two rules:\n1. ".concat(openTagPrefix).concat(tagOpener, "nodename").concat(tagSuffix, " opens a node.\n2. ").concat(closeTagPrefix).concat(tagCloser, "nodename").concat(tagSuffix, " closes a node.\nNodes can contain content or other nodes.\n\n").concat(subSystemPrompt || 'You are an AI assistant and respond to the request.').trim();
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
      openTagPrefix = _getConfig$idioSymbol3.openTagPrefix,
      tagOpener = _getConfig$idioSymbol3.tagOpener,
      tagCloser = _getConfig$idioSymbol3.tagCloser,
      closeTagPrefix = _getConfig$idioSymbol3.closeTagPrefix,
      tagSuffix = _getConfig$idioSymbol3.tagSuffix;
    return "\nOUTPUT RULES:\nYou are an AI that outputs text using a simple markup language with two rules:\n1. ".concat(openTagPrefix).concat(tagOpener, "nodename").concat(tagSuffix, " opens a node.\n2. ").concat(closeTagPrefix).concat(tagCloser, "nodename").concat(tagSuffix, " closes a node.\nNodes can contain content or other nodes.\n\n").concat(subSystemPrompt || 'You are an AI assistant and respond to the request.').trim();
  },
  genUserPrompt: function genUserPrompt(scaffold, originalPrompt) {
    var _getConfig$idioSymbol4 = (0, _config.getConfig)().idioSymbols,
      openTagPrefix = _getConfig$idioSymbol4.openTagPrefix,
      tagOpener = _getConfig$idioSymbol4.tagOpener,
      tagCloser = _getConfig$idioSymbol4.tagCloser,
      tagSuffix = _getConfig$idioSymbol4.tagSuffix;
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
      openTagPrefix = _getConfig$idioSymbol5.openTagPrefix,
      tagOpener = _getConfig$idioSymbol5.tagOpener,
      tagCloser = _getConfig$idioSymbol5.tagCloser,
      closeTagPrefix = _getConfig$idioSymbol5.closeTagPrefix,
      tagSuffix = _getConfig$idioSymbol5.tagSuffix;
    return "\nRESPONSE RULES:\n1. Output text using the simple markup language:\n   - ".concat(openTagPrefix).concat(tagOpener, "nodename").concat(tagSuffix, " opens a node.\n   - ").concat(closeTagPrefix).concat(tagCloser, "nodename").concat(tagSuffix, " closes a node.\n2. Nodes can contain content or other nodes.\n3. For example:\n   ").concat(openTagPrefix).concat(tagOpener, "name").concat(tagSuffix, "Sarah").concat(closeTagPrefix).concat(tagCloser, "name").concat(tagSuffix, "\n   ").concat(openTagPrefix).concat(tagOpener, "age").concat(tagSuffix, "25").concat(closeTagPrefix).concat(tagCloser, "age").concat(tagSuffix, "\n4. Follow the provided structure exactly.\n5. Begin with the structure provided.\n\n").concat(subSystemPrompt || 'You are an AI assistant and respond to the request.').trim();
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
      openTagPrefix = _getConfig$idioSymbol6.openTagPrefix,
      tagOpener = _getConfig$idioSymbol6.tagOpener,
      tagCloser = _getConfig$idioSymbol6.tagCloser,
      closeTagPrefix = _getConfig$idioSymbol6.closeTagPrefix,
      tagSuffix = _getConfig$idioSymbol6.tagSuffix;
    return "\nCRITICAL RULES:\nMUST: Output text using the simple markup language with these rules:\n- ".concat(openTagPrefix).concat(tagOpener, "nodename").concat(tagSuffix, " opens a node.\n- ").concat(closeTagPrefix).concat(tagCloser, "nodename").concat(tagSuffix, " closes a node.\nMUST: Follow the provided structure exactly.\nMUST: Nodes can contain content or other nodes.\nMUST: Begin with the structure provided.\n\nExamples:\n").concat(openTagPrefix).concat(tagOpener, "item").concat(tagSuffix, "Content").concat(closeTagPrefix).concat(tagCloser, "item").concat(tagSuffix, "\n").concat(openTagPrefix).concat(tagOpener, "container").concat(tagSuffix, "\n   ").concat(openTagPrefix).concat(tagOpener, "child").concat(tagSuffix, "Content").concat(closeTagPrefix).concat(tagCloser, "child").concat(tagSuffix, "\n").concat(closeTagPrefix).concat(tagCloser, "container").concat(tagSuffix, "\n\n").concat(subSystemPrompt || 'You are an AI assistant and respond to the request.').trim();
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
      openTagPrefix = _getConfig$idioSymbol7.openTagPrefix,
      tagOpener = _getConfig$idioSymbol7.tagOpener,
      tagCloser = _getConfig$idioSymbol7.tagCloser,
      closeTagPrefix = _getConfig$idioSymbol7.closeTagPrefix,
      tagSuffix = _getConfig$idioSymbol7.tagSuffix;
    return "\nSYNTAX GUIDELINES WITH EXAMPLE:\n- Use the simple markup language:\n  - ".concat(openTagPrefix).concat(tagOpener, "nodename").concat(tagSuffix, " opens a node.\n  - ").concat(closeTagPrefix).concat(tagCloser, "nodename").concat(tagSuffix, " closes a node.\n- Nodes can contain content or other nodes.\n- Follow the structure exactly.\n\nExample of compliance:\n").concat(openTagPrefix).concat(tagOpener, "root").concat(tagSuffix, "\n   ").concat(openTagPrefix).concat(tagOpener, "example").concat(tagSuffix, "Hello world").concat(closeTagPrefix).concat(tagCloser, "example").concat(tagSuffix, "\n").concat(closeTagPrefix).concat(tagCloser, "root").concat(tagSuffix, "\n\n").concat(subSystemPrompt || 'You are an AI assistant and respond to the request.').trim();
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