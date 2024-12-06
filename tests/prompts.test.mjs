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

    it('should generate complex conversation flow when complex mode is enabled', () => {
      const scaffold = '<joke><setup>...</setup><punchline>...</punchline></joke>';
      const originalPrompt = 'Tell me a joke';
      const result = generateUserPrompt(scaffold, originalPrompt, true);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(3);

      // Check first message (user explaining structure)
      expect(result[0].role).toBe('user');
      expect(result[0].content).toContain(scaffold);

      // Check assistant acknowledgment
      expect(result[1].role).toBe('assistant');
      expect(result[1].content).toContain('I will abide by that XML structure in my response');

      // Check final prompt message
      expect(result[2].role).toBe('user');
      expect(result[2].content).toContain('Tell me a joke');
    });

    it('should return original behavior when complex mode is disabled', () => {
      const scaffold = '<joke><setup>...</setup><punchline>...</punchline></joke>';
      const originalPrompt = 'Tell me a joke';

      const complexResult = generateUserPrompt(scaffold, originalPrompt, true);
      const standardResult = generateUserPrompt(scaffold, originalPrompt, false);
      const defaultResult = generateUserPrompt(scaffold, originalPrompt);

      expect(Array.isArray(complexResult)).toBe(true);
      expect(typeof standardResult).toBe('string');
      expect(typeof defaultResult).toBe('string');
      expect(standardResult).toBe(defaultResult);
    });
  });
}); 