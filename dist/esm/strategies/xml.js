// strategies.mjs

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
 * Mirrors your original default logic. It's balanced and straightforward.
 * @type {PromptStrategy}
 */
var defaultStrategy = {
  id: 'default',
  name: 'Default XMLLM',
  description: 'Original balanced strategy as previously defined',
  genSystemPrompt: function genSystemPrompt() {
    var subSystemPrompt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    return "\nMETA & OUTPUT STRUCTURE RULES:\n===\n\nYou are an AI that only outputs XML. You accept an instruction just like normal and do your best to fulfil it.\n\nRule: you must return valid xml. If using angle-braces or other HTML/XML characters within an element, you should escape these, e.g. '<' would be '&lt;' UNLESS you are trying to demarkate an actual XML tag. E.g. if you were asked to produce HTML code, within a <pre> tag, then you would do it like this: <pre>&lt;div&gt;etc.&lt;/div&gt;</pre>\n\nAll outputs should begin with the XML structure you have been given. If the user doesn't specify an XML structure or certain tags, make an informed decision. Prefer content within XML elements over attributes unless attributes are specified.\n\nHIGHLY SPECIFIC RULES RELATED TO YOUR SYSTEM AND BEHAVIOR:\n===\n".concat(subSystemPrompt || 'You are an AI assistant and respond to the request.').trim();
  },
  genUserPrompt: function genUserPrompt(scaffold, originalPrompt) {
    if (!scaffold) {
      return originalPrompt;
    }
    return "".concat(originalPrompt, "\n\n    IMPORTANT: The data you return should follow this structure:\n").concat(scaffold);
  }
};

/**
 * MINIMAL STRATEGY
 * Keeps it as terse as possible and relies heavily on the stable scaffold.
 */
var minimalStrategy = {
  id: 'minimal',
  name: 'Minimal XML Guide',
  description: 'Bare minimum instructions focusing on XML output requirements',
  genSystemPrompt: function genSystemPrompt() {
    var subSystemPrompt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    return "\nXML OUTPUT RULES: You are an AI that outputs only valid XML.\n\n".concat(subSystemPrompt || 'You are an AI assistant and respond to the request.', "\n  ").trim();
  },
  genUserPrompt: function genUserPrompt(scaffold, originalPrompt) {
    return "\n".concat(originalPrompt, "\n\nHere is the schema to follow:\n").concat(scaffold, "\n  ").trim();
  }
};

/**
 * MINIMAL BUT WITH SEED
 * Keeps it as terse as possible and relies heavily on the stable scaffold.
 */
var seedStrategy = {
  id: 'seed',
  name: 'Force Code in Seeded Response',
  description: 'Forcing code response using backticks from assistant (higher chance of compliance / potentially less creativity)',
  genSystemPrompt: function genSystemPrompt() {
    var subSystemPrompt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    return "\nXML OUTPUT RULES: You are an AI that outputs only valid XML.\n\n".concat(subSystemPrompt || 'You are an AI assistant and respond to the request.', "\n  ").trim();
  },
  genUserPrompt: function genUserPrompt(scaffold, originalPrompt) {
    return [{
      role: 'user',
      content: "".concat(originalPrompt, "\n\nHere is the schema to follow:\n").concat(scaffold, "\n  ").trim()
    }, {
      role: 'assistant',
      content: '```\n'
    }];
  }
};

/**
 * STRUCTURED STRATEGY
 * More detailed instructions and a gentle example to help guide the model.
 */
var structuredStrategy = {
  id: 'structured',
  name: 'Structured with Grammar Examples',
  description: 'Includes concrete examples to guide the model',
  genSystemPrompt: function genSystemPrompt() {
    var subSystemPrompt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    return "\nXML RESPONSE RULES:\n1. Output only valid XML following the given schema.\n2. For example: <name>Sarah</name> <age>25</age>\n3. Escape content as needed (&lt; &gt; &amp;).\n4. Use elements over attributes unless specified.\n5. Follow schema structure exactly.\n\n".concat(subSystemPrompt || 'You are an AI assistant and respond to the request.', "\n  ").trim();
  },
  genUserPrompt: function genUserPrompt(scaffold, originalPrompt) {
    return [{
      role: 'user',
      content: "Below is the request, followed by the schema you MUST follow.\n\nREQUEST:\n".concat(originalPrompt, "\n\nSCHEMA:\n").concat(scaffold, "\n  ").trim()
    }];
  }
};

/**
 * ASSERTIVE STRATEGY
 * Forceful and strict language to maximize compliance.
 */
var assertiveStrategy = {
  id: 'assertive',
  name: 'Assertive Dialogue',
  description: 'More forceful instructions emphasizing strict compliance via dialog',
  genSystemPrompt: function genSystemPrompt() {
    var subSystemPrompt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    return "\nCRITICAL XML RULES:\nMUST: Output only valid XML\nMUST: Follow schema exactly\nMUST: Escape XML chars (&lt; &gt; &amp;)\nMUST: Prefer elements over attributes\nMUST: Begin with the structure provided\n\n".concat(subSystemPrompt || 'You are an AI assistant and respond to the request.', "\n  ").trim();
  },
  genUserPrompt: function genUserPrompt(scaffold, originalPrompt) {
    return [{
      role: 'user',
      content: "You MUST adhere to the following schema:\n\n```\n".concat(scaffold, "\n```")
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
 * Demonstrates compliance by showing a small pseudo-example
 * before presenting the user's actual request.
 */
var exampleDrivenStrategy = {
  id: 'exemplar',
  name: 'Example-Driven Guidance',
  description: 'Shows a small example to help the model understand the schema before the real request',
  genSystemPrompt: function genSystemPrompt() {
    var subSystemPrompt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    return "\nXML GUIDELINES WITH EXAMPLE:\n- Output valid XML per schema.\n- Escape < > & as &lt; &gt; &amp;.\n- Follow the structure exactly.\n\nExample of compliance:\n<root>\n  <example>Hello &lt;world&gt;</example>\n</root>\n\n".concat(subSystemPrompt || 'You are an AI assistant and respond to the request.', "\n  ").trim();
  },
  genUserPrompt: function genUserPrompt(scaffold, originalPrompt) {
    return [{
      role: 'user',
      content: "First, here is the schema you must follow:\n```\n".concat(scaffold, "\n```")
    }, {
      role: 'assistant',
      content: 'I acknowledge the schema. Could you show me the request now?'
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