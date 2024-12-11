"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateUserPrompt = exports.generateSystemPrompt = void 0;
var _strategies = require("./strategies.js");
var defaultStrategy = (0, _strategies.getStrategy)('default');
var generateSystemPrompt = exports.generateSystemPrompt = defaultStrategy.getSystemPrompt;
var generateUserPrompt = exports.generateUserPrompt = defaultStrategy.getUserPrompt;