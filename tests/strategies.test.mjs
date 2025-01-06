import { jest } from '@jest/globals';
import { resetConfig } from '../src/config.mjs';
import { stream, simple, configure } from '../src/xmllm-main.mjs';
import { getStrategy } from '../src/strategies/index.mjs';

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
        getReader: () => createMockReader(['@START(response)test@END(response)'])
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
        getReader: () => createMockReader(['@START(response)test@END(response)'])
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
        getReader: () => createMockReader(['@START(response)test@END(response)'])
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
        getReader: () => createMockReader(['@START(response)test@END(response)'])
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
        getReader: () => createMockReader(['@START(response)test@END(response)'])
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

describe('Prompt Strategies with Custom Symbols', () => {
  beforeEach(() => {
    resetConfig();
  });

  test('default strategy should use configured idioSymbols', () => {
    configure({
      globalParser: 'idio',
      idioSymbols: {
        openTagPrefix: '<',
        closeTagPrefix: '</',
        tagOpener: '',
        tagCloser: '',
        tagSuffix: '>'
      }
    });

    const strategy = getStrategy('default');
    const systemPrompt = strategy.genSystemPrompt();

    expect(systemPrompt).toContain('<nodename> opens a node');
    expect(systemPrompt).toContain('</nodename> closes a node');
    expect(systemPrompt).toContain('<greeting>hello world</greeting>');
  });

  test('seed strategy should use three backticks to insinuate code response', () => {
    configure({
      globalParser: 'idio',
      idioSymbols: {
        openTagPrefix: '[[',
        closeTagPrefix: '[[',
        tagOpener: 'BEGIN(',
        tagCloser: 'END(',
        tagSuffix: ')]]'
      }
    });

    const strategy = getStrategy('seed');
    const messages = strategy.genUserPrompt('scaffold', 'prompt');

    expect(messages[1].content).toBe('```\n');
  });

  test('structured strategy should show correct examples with custom symbols', () => {
    configure({
      globalParser: 'idio',
      idioSymbols: {
        openTagPrefix: '-->',
        closeTagPrefix: '<--',
        tagOpener: '{{',
        tagCloser: '{{',
        tagSuffix: '}}!!'
      }
    });

    const strategy = getStrategy('structured');
    const systemPrompt = strategy.genSystemPrompt();

    expect(systemPrompt).toContain('-->{{name}}!!Sarah<--{{name}}!!');
    expect(systemPrompt).toContain('-->{{age}}!!25<--{{age}}!!');
  });

  test('exemplar strategy should show correct example with markdown-like syntax', () => {
    configure({
      globalParser: 'idio',
      idioSymbols: {
        openTagPrefix: '#',
        closeTagPrefix: '#',
        tagOpener: '[',
        tagCloser: '[/',
        tagSuffix: ']'
      }
    });

    const strategy = getStrategy('exemplar');
    const systemPrompt = strategy.genSystemPrompt();

    expect(systemPrompt).toContain('#[root]');
    expect(systemPrompt).toContain('#[example]Hello world#[/example]');
    expect(systemPrompt).toContain('#[/root]');
  });

  test('assertive strategy should show correct examples with emoji syntax', () => {
    configure({
      globalParser: 'idio',
      idioSymbols: {
        openTagPrefix: '🔵',
        closeTagPrefix: '🔴',
        tagOpener: '(',
        tagCloser: '(',
        tagSuffix: ')'
      }
    });

    const strategy = getStrategy('assertive');
    const systemPrompt = strategy.genSystemPrompt();

    expect(systemPrompt).toContain('🔵(item)Content🔴(item)');
    expect(systemPrompt).toContain('🔵(container)');
    expect(systemPrompt).toContain('🔵(child)Content🔴(child)');
    expect(systemPrompt).toContain('🔴(container)');
  });

  test('minimal strategy should work with whitespace-heavy syntax', () => {
    configure({
      globalParser: 'idio',
      idioSymbols: {
        openTagPrefix: '   ',
        closeTagPrefix: '   ',
        tagOpener: '>>>',
        tagCloser: '<<<',
        tagSuffix: '^^^'
      }
    });

    const strategy = getStrategy('minimal');
    const systemPrompt = strategy.genSystemPrompt();

    expect(systemPrompt).toContain('   >>>nodename^^^ opens a node');
    expect(systemPrompt).toContain('   <<<nodename^^^ closes a node');
  });

  test('strategies should handle mixed symbols correctly', () => {
    configure({
      globalParser: 'idio',
      idioSymbols: {
        openTagPrefix: '<!--',
        closeTagPrefix: '<!--/',
        tagOpener: '[',
        tagCloser: '[',
        tagSuffix: ']-->'
      }
    });

    const strategy = getStrategy('default');
    const systemPrompt = strategy.genSystemPrompt();

    expect(systemPrompt).toContain('<!--[nodename]-->');
    expect(systemPrompt).toContain('<!--/[nodename]-->');
  });

  test('strategies should handle single character symbols', () => {
    configure({
      globalParser: 'idio',
      idioSymbols: {
        openTagPrefix: '$',
        closeTagPrefix: '$',
        tagOpener: '',
        tagCloser: '/',
        tagSuffix: '>>>'
      }
    });

    const strategy = getStrategy('structured');
    const systemPrompt = strategy.genSystemPrompt();

    console.log('systemPrompt', systemPrompt);

    expect(systemPrompt).toContain('$name');
    expect(systemPrompt).toContain('$/name');
  });

  test('all strategies should handle the same symbol configuration consistently', () => {
    configure({
      globalParser: 'idio',
      idioSymbols: {
        openTagPrefix: '::',
        closeTagPrefix: '&&',
        tagOpener: '(',
        tagCloser: '(',
        tagSuffix: ')'
      }
    });

    const strategies = ['default', 'minimal', 'structured', 'assertive', 'exemplar', 'seed'];
    
    strategies.forEach(strategyName => {
      const strategy = getStrategy(strategyName);
      const systemPrompt = strategy.genSystemPrompt();
      
      expect(systemPrompt).toContain('::(nodename)');
      expect(systemPrompt).toContain('&&(nodename)');
    });
  });
}); 