import { jest } from '@jest/globals';
import { resetConfig } from '../src/config.mjs';
import { stream, simple, configure } from '../src/xmllm-main.mjs';

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

  describe('XML Parser Strategy Configuration', () => {
    it('should use default XML strategy when none specified', async () => {
      const TestStream = jest.fn().mockImplementation(() => ({
        getReader: () => createMockReader(['<response>test</response>'])
      }));

      await stream('Test prompt', {
        llmStream: TestStream,
        schema: { response: String }
      }).last();

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

    it('should use globally configured strategy with XML parser', async () => {
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

  describe('Simple Markup Language Strategy Configuration', () => {
    beforeEach(() => {
      configure({
        globalParser: 'idio'
      });
    });

    it('should use default simple markup strategy when none specified', async () => {
      const TestStream = jest.fn().mockImplementation(() => ({
        getReader: () => createMockReader(['⁂START(response)test⁂END(response)'])
      }));

      await stream('Test prompt', {
        llmStream: TestStream,
        schema: { response: String }
      }).last();

      expect(TestStream).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            {
              role: 'system',
              content: expect.stringContaining('simple markup language with only two rules')
            }
          ])
        })
      );
    });

    it('should use globally configured strategy with simple markup', async () => {
      configure({
        globalParser: 'idio',
        defaults: {
          strategy: 'minimal'
        }
      });

      const TestStream = jest.fn().mockImplementation(() => ({
        getReader: () => createMockReader(['⁂START(response)test⁂END(response)'])
      }));

      await stream('Test prompt', {
        llmStream: TestStream,
        schema: { response: String }
      }).last();

      expect(TestStream).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            {
              role: 'system',
              content: expect.stringContaining('OUTPUT RULES')
            }
          ])
        })
      );
    });
  });

  describe('Strategy Override Behavior', () => {
    it('should allow overriding strategy in stream() with XML parser', async () => {
      const TestStream = jest.fn().mockImplementation(() => ({
        getReader: () => createMockReader(['<response>test</response>'])
      }));

      await stream('Test prompt', {
        llmStream: TestStream,
        strategy: 'assertive',
        schema: { response: String } 
      }).last();

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

    it('should allow overriding strategy in stream() with simple markup', async () => {
      configure({
        globalParser: 'idio'
      });

      const TestStream = jest.fn().mockImplementation(() => ({
        getReader: () => createMockReader(['⁂START(response)test⁂END(response)'])
      }));

      await stream('Test prompt', {
        llmStream: TestStream,
        strategy: 'assertive',
        schema: { response: String } 
      }).last();

      expect(TestStream).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            {
              role: 'system',
              content: expect.stringContaining('CRITICAL RULES')
            }
          ])
        })
      );
    });

    it('should allow overriding strategy in simple() with either parser', async () => {
      // Test with XML parser
      const XMLTestStream = jest.fn().mockImplementation(() => ({
        getReader: () => createMockReader(['<response>test</response>'])
      }));

      await simple({
        prompt: 'Test prompt',
        llmStream: XMLTestStream,
        strategy: 'structured',
        schema: { response: String }
      });

      expect(XMLTestStream).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            {
              role: 'system',
              content: expect.stringContaining('XML RESPONSE RULES')
            }
          ])
        })
      );

      // Test with simple markup
      configure({
        globalParser: 'idio'
      });

      const IdioTestStream = jest.fn().mockImplementation(() => ({
        getReader: () => createMockReader(['⁂START(response)test⁂END(response)'])
      }));

      await simple({
        prompt: 'Test prompt',
        llmStream: IdioTestStream,
        strategy: 'structured',
        schema: { response: String }
      });

      expect(IdioTestStream).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            {
              role: 'system',
              content: expect.stringContaining('RESPONSE RULES')
            }
          ])
        })
      );
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
        schema: { response: String }
      }).last();

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

    it('should fall back to default strategy with simple markup', async () => {
      configure({
        globalParser: 'idio'
      });

      const TestStream = jest.fn().mockImplementation(() => ({
        getReader: () => createMockReader(['⁂START(response)test⁂END(response)'])
      }));

      await stream('Test prompt', {
        llmStream: TestStream,
        strategy: 'nonexistent-strategy',
        schema: { response: String }
      }).last();

      expect(TestStream).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            {
              role: 'system',
              content: expect.stringContaining('simple markup language with only two rules')
            }
          ])
        })
      );
    });
  });
}); 