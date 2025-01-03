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
const defaultStrategy = {
  id: 'default',
  name: 'Default XMLLM',
  description: 'Original balanced strategy as previously defined',
  genSystemPrompt: (subSystemPrompt = '') => `
META & OUTPUT STRUCTURE RULES:
===

You are an AI that only outputs XML. You accept an instruction just like normal and do your best to fulfil it.

Rule: you must return valid xml. If using angle-braces or other HTML/XML characters within an element, you should escape these, e.g. '<' would be '&lt;' UNLESS you are trying to demarkate an actual XML tag. E.g. if you were asked to produce HTML code, within a <pre> tag, then you would do it like this: <pre>&lt;div&gt;etc.&lt;/div&gt;</pre>

All outputs should begin with the XML structure you have been given. If the user doesn't specify an XML structure or certain tags, make an informed decision. Prefer content within XML elements over attributes unless attributes are specified.

HIGHLY SPECIFIC RULES RELATED TO YOUR SYSTEM AND BEHAVIOR:
===
${subSystemPrompt || 'You are an AI assistant and respond to the request.'}`.trim(),

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
 * Keeps it as terse as possible and relies heavily on the stable scaffold.
 */
const minimalStrategy = {
  id: 'minimal',
  name: 'Minimal XML Guide',
  description: 'Bare minimum instructions focusing on XML output requirements',
  genSystemPrompt: (subSystemPrompt = '') => `
XML OUTPUT RULES: You are an AI that outputs only valid XML.

${subSystemPrompt || 'You are an AI assistant and respond to the request.'}
  `.trim(),
  genUserPrompt: (scaffold, originalPrompt) => `
${originalPrompt}

Here is the schema to follow:
${scaffold}
  `.trim()
};

/**
 * MINIMAL BUT WITH SEED
 * Keeps it as terse as possible and relies heavily on the stable scaffold.
 */
const seedStrategy = {
  id: 'seed',
  name: 'Force Code in Seeded Response',
  description: 'Forcing code response using backticks from assistant (higher chance of compliance / potentially less creativity)',
  genSystemPrompt: (subSystemPrompt = '') => `
XML OUTPUT RULES: You are an AI that outputs only valid XML.

${subSystemPrompt || 'You are an AI assistant and respond to the request.'}
  `.trim(),
  genUserPrompt: (scaffold, originalPrompt) => [
    {
      role: 'user',
      content: `${originalPrompt}

Here is the schema to follow:
${scaffold}
  `.trim()
    },
    {
      role: 'assistant',
      content: '```\n'
    }
  ]
};

/**
 * STRUCTURED STRATEGY
 * More detailed instructions and a gentle example to help guide the model.
 */
const structuredStrategy = {
  id: 'structured',
  name: 'Structured with Grammar Examples',
  description: 'Includes concrete examples to guide the model',
  genSystemPrompt: (subSystemPrompt = '') => `
XML RESPONSE RULES:
1. Output only valid XML following the given schema.
2. For example: <name>Sarah</name> <age>25</age>
3. Escape content as needed (&lt; &gt; &amp;).
4. Use elements over attributes unless specified.
5. Follow schema structure exactly.

${subSystemPrompt || 'You are an AI assistant and respond to the request.'}
  `.trim(),
  genUserPrompt: (scaffold, originalPrompt) => [
    {
      role: 'user',
      content: `Below is the request, followed by the schema you MUST follow.

REQUEST:
${originalPrompt}

SCHEMA:
${scaffold}
  `.trim()
    }
  ]
};

/**
 * ASSERTIVE STRATEGY
 * Forceful and strict language to maximize compliance.
 */
const assertiveStrategy = {
  id: 'assertive',
  name: 'Assertive Dialogue',
  description: 'More forceful instructions emphasizing strict compliance via dialog',
  genSystemPrompt: (subSystemPrompt = '') => `
CRITICAL XML RULES:
MUST: Output only valid XML
MUST: Follow schema exactly
MUST: Escape XML chars (&lt; &gt; &amp;)
MUST: Prefer elements over attributes
MUST: Begin with the structure provided

${subSystemPrompt || 'You are an AI assistant and respond to the request.'}
  `.trim(),
  genUserPrompt: (scaffold, originalPrompt) => [
    {
      role: 'user',
      content: `You MUST adhere to the following schema:\n\n\`\`\`\n${scaffold}\n\`\`\``
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
 * Demonstrates compliance by showing a small pseudo-example
 * before presenting the user's actual request.
 */
const exampleDrivenStrategy = {
  id: 'exemplar',
  name: 'Example-Driven Guidance',
  description: 'Shows a small example to help the model understand the schema before the real request',
  genSystemPrompt: (subSystemPrompt = '') => `
XML GUIDELINES WITH EXAMPLE:
- Output valid XML per schema.
- Escape < > & as &lt; &gt; &amp;.
- Follow the structure exactly.

Example of compliance:
<root>
  <example>Hello &lt;world&gt;</example>
</root>

${subSystemPrompt || 'You are an AI assistant and respond to the request.'}
  `.trim(),
  genUserPrompt: (scaffold, originalPrompt) => [
    {
      role: 'user',
      content: `First, here is the schema you must follow:\n\`\`\`\n${scaffold}\n\`\`\``
    },
    {
      role: 'assistant',
      content: 'I acknowledge the schema. Could you show me the request now?'
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
