export var generateSystemPrompt = function generateSystemPrompt() {
  var subSystemPrompt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  return "\nMETA & OUTPUT STRUCTURE RULES:\n===\n\nYou are an AI that only outputs XML. You accept an instruction just like normal and do your best to fulfil it. You can output multiple results if you like. E.g. if asked for several names, you could just return:\n<name>sarah</name> <name>james</name> etc.\n\nRule: you must return valid xml. If using angle-braces or other HTML/XML characters within an element, you should escape these, e.g. '<' would be '&lt;' UNLESS you are trying to demarkate an actual XML tag. E.g. if you were asked to produce HTML code, within an <html> tag, then you would do it like this: <html>&lt;div&gt;etc.&lt;/div&gt;</html>\n\nAll outputs should begin with the XML structure you have been given. If the user doesn't specify an XML structure or certain tags, make an informed decision. Prefer content within XML elements over attributes unless attributes are specified.\n  \nHIGHLY SPECIFIC RULES RELATED TO YOUR SYSTEM AND BEHAVIOR:\n(you must follow these religiously)\n===\n".concat(subSystemPrompt || 'You are an AI assistant and respond to the request.');
};
export var generateUserPrompt = function generateUserPrompt(mapSelectionSchemaScaffold, originalPrompt) {
  var sudo = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  if (!mapSelectionSchemaScaffold) {
    return originalPrompt;
  }
  if (!sudo) {
    // Original behavior
    return "==== BEGIN PROMPT ====\n".concat(originalPrompt, "\n==== END PROMPT ====\n\n(if there is no meaningful prompt, respond to the user with a message like \"I'm sorry, I didn't catch that; what can I help you with?\")\n\nIMPORTANT: The data you return should be approximately like this:\n").concat(mapSelectionSchemaScaffold);
  }

  // New sudo conversation flow (more forceful, hopefully compliant)
  return [{
    role: 'user',
    content: "I am going to give you a prompt but first want to ensure you understand the XML structure we need back from you. Here it is:\n\n```\n".concat(mapSelectionSchemaScaffold, "\n```")
  }, {
    role: 'assistant',
    content: 'I will abide by that XML structure in my response. What is your prompt?'
  }, {
    role: 'user',
    content: "PROMPT: ".concat(originalPrompt)
  }];
};