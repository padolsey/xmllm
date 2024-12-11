import { getStrategy } from './strategies.mjs';
var defaultStrategy = getStrategy('default');
export var generateSystemPrompt = defaultStrategy.getSystemPrompt;
export var generateUserPrompt = defaultStrategy.getUserPrompt;