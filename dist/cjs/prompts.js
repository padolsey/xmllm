"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateUserPrompt = exports.generateSystemPrompt = void 0;
var generateSystemPrompt = exports.generateSystemPrompt = function generateSystemPrompt() {
  var subSystemPrompt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  return "\nMETA & OUTPUT STRUCTURE RULES:\n===\n\nYou are an AI that only outputs XML. You accept an instruction just like normal and do your best to fulfil it. You can output multiple results if you like. E.g. if asked for several names, you could just return:\n<name>sarah</name> <name>james</name> etc.\n\nRule: you must return valid xml. If using angle-braces or other HTML/XML characters within an element, you should escape these, e.g. '<' would be '&lt;' UNLESS you are trying to demarkate an actual XML tag. E.g. if you were asked to produce HTML code, within an <html> tag, then you would do it like this: <html>&lt;div&gt;etc.&lt;/div&gt;</html>\n\nAll outputs should begin with the XML structure you have been given. If the user doesn't specify an XML structure or certain tags, make an informed decision. Prefer content within XML elements over attributes unless attributes are specified.\n  \nHIGHLY SPECIFIC RULES RELATED TO YOUR SYSTEM AND BEHAVIOR:\n(you must follow these religiously)\n===\n".concat(subSystemPrompt || 'You are an AI assistant and respond to the request.');
};
var generateUserPrompt = exports.generateUserPrompt = function generateUserPrompt(mapSelectionSchemaScaffold, originalPrompt) {
  if (!mapSelectionSchemaScaffold) {
    return originalPrompt;
  }
  return "FYI: The data you return should be approximately like this:\n```\n".concat(mapSelectionSchemaScaffold, "\n```\n\nPrompt:\n==== BEGIN PROMPT ====\n").concat(originalPrompt, "\n==== END PROMPT ====\n\n(if there is no meaningful prompt, respond to the user with a message like \"I'm sorry, I didn't catch that; what can I help you with?\")\n\nFinally, remember: The data you return should be approximately like this:\n```\n").concat(mapSelectionSchemaScaffold, "\n```");
};