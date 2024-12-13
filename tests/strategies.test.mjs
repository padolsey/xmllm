import { jest } from '@jest/globals';
import { resetConfig } from '../src/config.mjs';
import { stream, simple, configure } from '../src/xmllm-main.mjs';
import { STRATEGIES } from '../src/strategies.mjs';

const createMockReader = (responses) => {
  let index = 0;
  return {
    read: jest.fn(async () => {
      if (index >= responses.length) {
        return { done: true };
      }
      return {
        value: new TextEncoder().encode(responses[index++]),
        done: false
      };
    }),
    releaseLock: jest.fn()
  };
};

describe('Strategy Configuration', () => {
  beforeEach(() => {
    resetConfig();
  });

  describe('Global Strategy Configuration', () => {
    it('should use default strategy when none specified', async () => {
      const TestStream = jest.fn().mockImplementation(() => ({
        getReader: () => createMockReader(['<response>test</response>'])
      }));

      await stream('Test prompt', {
        llmStream: TestStream,
        schema: { response: String }
      }).last();

      // Verify system message matches default strategy
      expect(TestStream).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            {
              role: 'system',
              content: expect.stringContaining('You are an AI that only outputs XML')
            }
          ])
        })
      );
    });

    it('should use globally configured strategy', async () => {
      configure({
        defaults: {
          strategy: 'minimal'
        }
      });

      const TestStream = jest.fn().mockImplementation(() => ({
        getReader: () => createMockReader(['<response>test</response>'])
      }));

      await stream('Test prompt', {
        llmStream: TestStream,
        schema: { response: String }
      }).last();

      // Verify system message matches minimal strategy
      expect(TestStream).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            {
              role: 'system',
              content: expect.stringContaining('XML OUTPUT RULES')
            }
          ])
        })
      );
    });
  });

  describe('Per-Call Strategy Configuration', () => {
    it('should allow overriding strategy in stream()', async () => {
      const TestStream = jest.fn().mockImplementation(() => ({
        getReader: () => createMockReader(['<response>test</response>'])
      }));

      await stream('Test prompt', {
        llmStream: TestStream,
        strategy: 'assertive',
        schema: { response: String } 
      }).last();

      // Verify system message matches assertive strategy
      expect(TestStream).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            {
              role: 'system',
              content: expect.stringContaining('CRITICAL XML RULES')
            }
          ])
        })
      );
    });

    it('should allow overriding strategy in simple()', async () => {
      const TestStream = jest.fn().mockImplementation(() => ({
        getReader: () => createMockReader(['<response>test</response>'])
      }));

      await simple('Test prompt', 
        {
          schema: {
            response: String
          },
          llmStream: TestStream,
          strategy: 'structured'
        }
      );

      // Verify system message matches structured strategy
      expect(TestStream).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            {
              role: 'system',
              content: expect.stringContaining('XML RESPONSE RULES')
            }
          ])
        })
      );
    });
  });

  describe('Strategy Behavior', () => {

    it('should use strategy-specific scaffold formatting', async () => {
      const TestStream = jest.fn().mockImplementation(() => ({
        getReader: () => createMockReader(['<response>test</response>'])
      }));

      // Test with exemplar strategy
      await stream('Test prompt', {
        llmStream: TestStream,
        schema: { response: String },
        strategy: 'exemplar'
      }).last();

      // exemplar strategy should include example in system prompt
      const systemMessage = TestStream.mock.calls[0][0].messages[0];
      expect(systemMessage.content).toContain('XML GUIDELINES WITH EXAMPLE');
      expect(systemMessage.content).toContain('<root>');
      expect(systemMessage.content).toContain('<example>Hello &lt;world&gt;</example>');
    });
  });

  describe('Strategy Validation', () => {
    it('should fall back to default strategy if invalid strategy specified', async () => {
      const TestStream = jest.fn().mockImplementation(() => ({
        getReader: () => createMockReader(['<response>test</response>'])
      }));

      await stream('Test prompt', {
        llmStream: TestStream,
        strategy: 'nonexistent-strategy',
        // Schema is necessary if we want to use a strategy
        schema: { response: String }
      }).last();

      // Should use default strategy system message
      expect(TestStream).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            {
              role: 'system',
              content: expect.stringContaining('You are an AI that only outputs XML')
            }
          ])
        })
      );
    });
  });

  describe('Strategy List', () => {
    it('should have all expected strategies available', () => {
      const expectedStrategies = [
        'default',
        'minimal',
        'structured',
        'assertive',
        'exemplar'
      ];

      expectedStrategies.forEach(strategyId => {
        expect(STRATEGIES[strategyId]).toBeDefined();
        expect(STRATEGIES[strategyId].id).toBe(strategyId);
        expect(STRATEGIES[strategyId].genSystemPrompt).toBeInstanceOf(Function);
        expect(STRATEGIES[strategyId].genUserPrompt).toBeInstanceOf(Function);
      });
    });
  });
}); 