import { generateSystemPrompt, generateUserPrompt } from '../src/prompts.mjs';
import { expect, describe, it } from '@jest/globals';

describe('Prompts', () => {
  describe('generateSystemPrompt', () => {
    it('should include default system message when no subSystemPrompt provided', () => {
      const result = generateSystemPrompt();
      expect(result.toLowerCase()).toContain('you are an ai assistant and respond to the request');
    });

    it('should include custom system message when provided', () => {
      const customPrompt = 'you are a helpful coding assistant';
      const result = generateSystemPrompt(customPrompt);
      expect(result).toContain(customPrompt);
    });

    it('should include essential XML instructions', () => {
      const result = generateSystemPrompt();
      expect(result).toContain('You are an AI that only outputs XML');
      expect(result).toContain('Rule: you must return valid xml');
    });
  });

  describe('generateUserPrompt', () => {
    it('should return original prompt when no schema scaffold provided', () => {
      const originalPrompt = 'Tell me a joke';
      const result = generateUserPrompt(null, originalPrompt);
      expect(result).toBe(originalPrompt);
    });

    it('should wrap prompt with schema information when scaffold provided', () => {
      const scaffold = '<joke><setup>...</setup><punchline>...</punchline></joke>';
      const originalPrompt = 'Tell me a joke';
      const result = generateUserPrompt(scaffold, originalPrompt);
      
      expect(result).toContain(scaffold);
      expect(result).toContain('BEGIN PROMPT');
      expect(result).toContain('END PROMPT');
      expect(result).toContain(originalPrompt);
    });
  });
}); 