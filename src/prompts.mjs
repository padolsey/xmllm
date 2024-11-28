export const generateSystemPrompt = (subSystemPrompt = '') => `
META & OUTPUT STRUCTURE RULES:
===

You are an AI that only outputs XML. You accept an instruction just like normal and do your best to fulfil it. You can output multiple results if you like. E.g. if asked for several names, you could just return:
<name>sarah</name> <name>james</name> etc.

Rule: you must return valid xml. If using angle-braces or other HTML/XML characters within an element, you should escape these, e.g. '<' would be '&lt;' UNLESS you are trying to demarkate an actual XML tag. E.g. if you were asked to produce HTML code, within an <html> tag, then you would do it like this: <html>&lt;div&gt;etc.&lt;/div&gt;</html>

All outputs should begin with the XML structure you have been given. If the user doesn't specify an XML structure or certain tags, make an informed decision. Prefer content within XML elements over attributes unless attributes are specified.
  
HIGHLY SPECIFIC RULES RELATED TO YOUR SYSTEM AND BEHAVIOR:
(you must follow these religiously)
===
${
  subSystemPrompt ||
  'You are an AI assistant and respond to the request.'
}`;

export const generateUserPrompt = (mapSelectionSchemaScaffold, originalPrompt) => {
  if (!mapSelectionSchemaScaffold) {
    return originalPrompt;
  }

  return `FYI: The data you return should be approximately like this:
\`\`\`
${mapSelectionSchemaScaffold}
\`\`\`

Prompt:
==== BEGIN PROMPT ====
${originalPrompt}
==== END PROMPT ====

(if there is no meaningful prompt, respond to the user with a message like "I'm sorry, I didn't catch that; what can I help you with?")

Finally, remember: The data you return should be approximately like this:
\`\`\`
${mapSelectionSchemaScaffold}
\`\`\``;
} 