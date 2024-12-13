# Prompt Strategies

In xmllm, **prompt strategies** are different ways of structuring prompts and system messages sent to the AI model. While they can influence how the AI interprets your instructions, their effectiveness varies significantly depending on the model, schema complexity, and specific prompt.

## The `strategy` Option

```javascript
import { stream } from 'xmllm';

const result = await stream('Your prompt here', {
  strategy: 'minimal',  // Choose a strategy
  schema: { /* your schema */ }
}).last();
```

If no strategy is specified, the **`default` strategy** is used.

## Available Strategies and How to Choose

Different strategies represent various approaches to guiding the AI's output. The key trade-offs typically involve:
- Token usage (shorter vs longer prompts)
- Compliance with schema structure
- Creative freedom vs strict adherence
- Model-specific performance

Here's a brief overview of each strategy:

- **Default (`default`):** A balanced approach that's generally reliable across models and use cases—a good starting point.

- **Minimal (`minimal`):** Uses minimal instructions, which can work well with more advanced models and saves on token usage.

- **Structured (`structured`):** Provides detailed instructions, sometimes beneficial for complex schemas, but may over-constrain responses.

- **Assertive (`assertive`):** Employs forceful language to enhance compliance, though it might reduce response quality with some models.

- **Exemplar (`exemplar`):** Includes examples in prompts; effective in certain cases but can increase token usage and potentially confuse the model.

- **Seed (`seed`):** Same as `minimal`, but encourages XML with `assistant` role seeding. I.e. making the LLM believe its already used certain tokens to begin a code block response.

## Experimentation

Rather than assuming any strategy will be "best" for a particular use case:

1. Start with the **default** strategy
2. If you need to reduce token usage, try the **minimal** strategy
3. Experiment with other strategies if you're not getting desired results
4. Test with and without hints in your schema
5. Consider how different models respond to each strategy

Remember that what works best can change as models are updated or when switching between providers.

## Example Usage

```javascript
// Global configuration
configure({
  defaults: {
    strategy: 'minimal'  // Set default strategy
  }
});

// Override per request
const result = await stream('Analyze this text', {
  strategy: 'structured',  // Override for this call
  schema: {
    analysis: {
      sentiment: String,
      keywords: [String]
    }
  }
}).last();
```

## Custom Strategies

You can create your own strategies by implementing the `genSystemPrompt` and `genUserPrompt` functions:

```javascript
const customStrategy = {
  id: 'custom',
  name: 'Custom Strategy',
  description: 'Custom prompt strategy',
  genSystemPrompt: (subSystemPrompt = '') => `
    XML OUTPUT RULES:
    ${subSystemPrompt}
  `.trim(),
  genUserPrompt: (scaffold, originalPrompt) => `
    ${originalPrompt}
    SCHEMA: ${scaffold}
  `.trim()
};

// Use custom strategy
const result = await stream('Query', {
  strategy: 'custom',
  strategies: { custom: customStrategy },
  schema: { /* your schema */ }
}).last();
```

Remember that the effectiveness of any strategy—including custom ones—can vary significantly between models and use cases. Experiment to find what works best for your specific needs. 