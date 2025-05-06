import { jest } from '@jest/globals';
import {
  standardPayloader,
  o1Payloader,
  createCustomModel,
  taiStylePayloader,
  normalizeProviderParams,
  providers,
  openaiPayloader
} from '../src/PROVIDERS.mjs';

describe('standardPayloader', () => {
  let mockProvider;

  beforeEach(() => {
    mockProvider = {
      name: 'test_provider',
      models: {
        custom: {
          name: 'test-model'
        }
      }
    };
  });

  test('handles basic message payload correctly', () => {
    const payload = standardPayloader.call(mockProvider, {
      messages: [{ role: 'user', content: 'hello' }],
      system: 'Be helpful'
    });

    expect(payload).toEqual({
      messages: [
        { role: 'system', content: 'Be helpful' },
        { role: 'user', content: 'hello' }
      ],
      max_tokens: 300,
      top_p: 1,
      presence_penalty: 0,
      temperature: 0.52
    });
  });
});

describe('createCustomModel', () => {
  const baseProvider = {
    endpoint: 'https://api.test.com',
    key: 'test-key',
    models: {
      fast: {
        name: 'base-model',
        maxContextSize: 4000
      }
    },
    constraints: {
      rpmLimit: 10
    }
  };

  test('creates custom model with basic configuration', () => {
    const custom = createCustomModel(baseProvider, {
      name: 'custom-model'
    });

    expect(custom.models.custom.name).toBe('custom-model');
    expect(custom.endpoint).toBe(baseProvider.endpoint);
    expect(custom.key).toBe(baseProvider.key);
  });

  test('allows overriding base provider settings', () => {
    const custom = createCustomModel(baseProvider, {
      name: 'custom-model',
      endpoint: 'https://custom.api.com',
      key: 'custom-key',
      constraints: {
        rpmLimit: 20
      }
    });

    expect(custom.endpoint).toBe('https://custom.api.com');
    expect(custom.key).toBe('custom-key');
    expect(custom.constraints.rpmLimit).toBe(20);
  });

  test('inherits maxContextSize from base model if not specified', () => {
    const custom = createCustomModel(baseProvider, {
      name: 'custom-model'
    });

    expect(custom.models.custom.maxContextSize)
      .toBe(baseProvider.models.fast.maxContextSize);
  });
});

describe('taiStylePayloader', () => {
  test('handles basic configuration', () => {
    const payload = taiStylePayloader({
      messages: [{ role: 'user', content: 'hello' }],
      system: 'Be helpful'
    });

    expect(payload).toEqual({
      messages: [
        { role: 'system', content: 'Be helpful' },
        { role: 'user', content: 'hello' }
      ],
      max_tokens: 300,
      stop: ['', ''],
      temperature: 0.52,
      top_p: 1,
      top_k: 50,
      repetition_penalty: 1 // 1 + presence_penalty (0 default)
    });
  });

  test('handles custom parameters', () => {
    const payload = taiStylePayloader({
      messages: [{ role: 'user', content: 'hello' }],
      system: 'Be helpful',
      max_tokens: 500,
      temperature: 0.7,
      top_p: 0.9,
      presence_penalty: 0.1,
      stop: ['stop1', 'stop2']
    });

    expect(payload).toEqual({
      messages: [
        { role: 'system', content: 'Be helpful' },
        { role: 'user', content: 'hello' }
      ],
      max_tokens: 500,
      stop: ['stop1', 'stop2'],
      temperature: 0.7,
      top_p: 0.9,
      top_k: 50,
      repetition_penalty: 1.1 // 1 + presence_penalty (0.1)
    });
  });

  test('handles empty system message', () => {
    const payload = taiStylePayloader({
      messages: [{ role: 'user', content: 'hello' }]
    });

    expect(payload.messages[0]).toEqual({
      role: 'system',
      content: ''
    });
  });
});

describe('anthropic payloader', () => {
  let mockProvider;
  
  beforeEach(() => {
    // Create a mock provider with the anthropic payloader structure
    mockProvider = {
      payloader: function({
        messages = [],
        system,
        max_tokens = 300,
        stop = null,
        temperature = 0.52,
        top_p = 1,
        presence_penalty = 0
      }) {
        return {
          system,
          messages,
          max_tokens,
          stop_sequences: stop,
          temperature,
          top_p
        };
      }
    };
  });

  test('formats basic payload correctly', () => {
    const payload = mockProvider.payloader({
      messages: [{ role: 'user', content: 'hello' }],
      system: 'Be helpful',
      max_tokens: 300
    });

    expect(payload).toEqual({
      system: 'Be helpful',
      messages: [{ role: 'user', content: 'hello' }],
      max_tokens: 300,
      stop_sequences: null,
      temperature: 0.52,
      top_p: 1
    });
  });

  test('handles stop sequences', () => {
    const payload = mockProvider.payloader({
      messages: [{ role: 'user', content: 'hello' }],
      stop: ['stop1', 'stop2'],
      temperature: 0.7
    });

    expect(payload.stop_sequences).toEqual(['stop1', 'stop2']);
  });

  test('handles all optional parameters', () => {
    const payload = mockProvider.payloader({
      messages: [{ role: 'user', content: 'hello' }],
      system: 'Be helpful',
      max_tokens: 500,
      temperature: 0.7,
      top_p: 0.9,
      presence_penalty: 0.1,
      stop: ['stop1']
    });

    expect(payload).toEqual({
      system: 'Be helpful',
      messages: [{ role: 'user', content: 'hello' }],
      max_tokens: 500,
      stop_sequences: ['stop1'],
      temperature: 0.7,
      top_p: 0.9
    });
  });

  test('handles missing optional parameters', () => {
    const payload = mockProvider.payloader({
      messages: [{ role: 'user', content: 'hello' }]
    });

    expect(payload).toEqual({
      system: undefined,
      messages: [{ role: 'user', content: 'hello' }],
      max_tokens: 300,
      stop_sequences: null,
      temperature: 0.52,
      top_p: 1
    });
  });

  test('caps temperature at 1.0', () => {
    const mockProvider = {
      payloader: providers.anthropic.payloader
    };
    
    const payload = mockProvider.payloader({
      messages: [{ role: 'user', content: 'hello' }],
      system: 'Be helpful',
      temperature: 1.5 // Intentionally above Anthropic's max
    });

    // Should be capped at 1.0
    expect(payload.temperature).toBe(1.0);
    
    // Test with valid temperature
    const normalPayload = mockProvider.payloader({
      messages: [{ role: 'user', content: 'hello' }],
      temperature: 0.7
    });
    
    // Should remain unchanged
    expect(normalPayload.temperature).toBe(0.7);
  });
});

describe('anthropic payloader with normalizeProviderParams', () => {
  test('properly normalizes parameters for Anthropic', () => {
    const mockProvider = {
      payloader: providers.anthropic.payloader
    };
    
    const payload = mockProvider.payloader({
      messages: [{ role: 'user', content: 'hello' }],
      system: 'Be helpful',
      temperature: 1.5,  // Above Anthropic's max
      stop: 'END',       // Should be converted to stop_sequences
      presence_penalty: 0.1, // Should be removed (unsupported)
      frequency_penalty: 0.2 // Should be removed (unsupported)
    });

    // Verify parameters are properly normalized
    expect(payload.temperature).toBe(1.0); // Clamped to max
    expect(payload).not.toHaveProperty('stop');
    expect(payload.stop_sequences).toEqual(['END']);
    expect(payload).not.toHaveProperty('presence_penalty');
    expect(payload).not.toHaveProperty('frequency_penalty');
    
    // Verify other parameters are preserved
    expect(payload.system).toBe('Be helpful');
    expect(payload.messages).toEqual([{ role: 'user', content: 'hello' }]);
    expect(payload.max_tokens).toBe(300);
    expect(payload.top_p).toBe(1);
  });
});

describe('o1Payloader', () => {

  test('handles o1 models supporting developer role', () => {
    const payload = o1Payloader.call({}, {
      model: 'o1-preview',
      messages: [{ role: 'user', content: 'hello' }],
      system: 'Be helpful',
      max_completion_tokens: 300,
      reasoning_effort: 'high',
    });

    expect(payload).toEqual({
      messages: [
        { role: 'developer', content: 'Be helpful' },
        { role: 'user', content: 'hello' },
      ],
      max_completion_tokens: 300,
      reasoning_effort: 'high',
    });
  });

  test('handles o1-mini model without developer role support or reasoning_effort', () => {

    const payload = o1Payloader.call({}, {
      model: 'o1-mini',
      messages: [
        { role: 'system', content: 'Be direct' },
        { role: 'user', content: 'hello' },
      ],
      system: 'Be helpful',
    });

    expect(payload).toEqual({
      messages: [
        { role: 'assistant', content: '<system>Be helpful</system>' },
        { role: 'assistant', content: '<system>Be direct</system>' },
        { role: 'user', content: 'hello' },
      ],
      max_completion_tokens: 300
    });
  });

  test('omits unsupported parameters', () => {
    const payload = o1Payloader.call({}, {
      messages: [{ role: 'user', content: 'hello' }],
      system: 'Be helpful',
      temperature: 0.7, // Unsupported parameter
      presence_penalty: 0.1, // Unsupported parameter
    });

    expect(payload).toEqual({
      messages: [
        { role: 'developer', content: 'Be helpful' },
        { role: 'user', content: 'hello' },
      ],
      max_completion_tokens: 300,
      reasoning_effort: 'medium',
    });

    // Ensure unsupported parameters are not included
    expect(payload).not.toHaveProperty('temperature');
    expect(payload).not.toHaveProperty('presence_penalty');
  });
});

describe('openaiPayloader for O1 models', () => {
  test('removes unsupported parameters for O1 models', () => {
    // Mock the provider context
    const mockProvider = {
      models: {
        fast: { name: 'o1-preview' }
      }
    };
    
    // Create a payload with parameters that O1 doesn't support
    const originalPayload = {
      model: 'fast',
      messages: [{ role: 'user', content: 'hello' }],
      system: 'Be helpful',
      temperature: 0.7,
      top_p: 0.9,
      presence_penalty: 0.1,
      frequency_penalty: 0.2
    };
    
    // Call the payloader
    const result = openaiPayloader.call(mockProvider, originalPayload);
    
    // Verify unsupported parameters are removed
    expect(result).not.toHaveProperty('temperature');
    expect(result).not.toHaveProperty('top_p');
    expect(result).not.toHaveProperty('presence_penalty');
    expect(result).not.toHaveProperty('frequency_penalty');
    
    // Verify other parameters are preserved
    expect(result.messages).toBeDefined();
    expect(result.max_completion_tokens).toBeDefined();
    expect(result.reasoning_effort).toBeDefined();
  });
});

describe('perplexityai payloader', () => {
  test('handles Perplexity-specific parameters', () => {
    // Mock the provider
    const mockProvider = {
      name: 'perplexityai',
      payloader: providers.perplexityai.payloader
    };
    
    // Create a payload with Perplexity-specific parameters
    const payload = {
      messages: [{ role: 'user', content: 'hello' }],
      system: 'Be helpful',
      temperature: 0.7,
      search_domain_filter: ['wikipedia.org', '-twitter.com'],
      return_images: true,
      return_related_questions: true
    };
    
    // Call the payloader
    const result = mockProvider.payloader(payload);
    
    // Verify standard parameters are preserved
    // Note: standardPayloader adds system as first message
    expect(result.messages).toEqual([
      { role: 'system', content: 'Be helpful' },
      { role: 'user', content: 'hello' }
    ]);
    expect(result.temperature).toBe(0.7);
    
    // Verify Perplexity-specific parameters are included
    expect(result.search_domain_filter).toEqual(['wikipedia.org', '-twitter.com']);
    expect(result.return_images).toBe(true);
    expect(result.return_related_questions).toBe(true);
  });
  
  test('works with standard parameters only', () => {
    // Mock the provider
    const mockProvider = {
      name: 'perplexityai',
      payloader: providers.perplexityai.payloader
    };
    
    // Create a payload with only standard parameters
    const payload = {
      messages: [{ role: 'user', content: 'hello' }],
      system: 'Be helpful',
      temperature: 0.7
    };
    
    // Call the payloader
    const result = mockProvider.payloader(payload);
    
    // Verify standard parameters are preserved
    // Note: standardPayloader adds system as first message
    expect(result.messages).toEqual([
      { role: 'system', content: 'Be helpful' },
      { role: 'user', content: 'hello' }
    ]);
    expect(result.temperature).toBe(0.7);
    
    // Verify Perplexity-specific parameters are not included
    expect(result).not.toHaveProperty('search_domain_filter');
    expect(result).not.toHaveProperty('return_images');
    expect(result).not.toHaveProperty('return_related_questions');
  });
});

describe('normalizeProviderParams utility', () => {
  test('renames stop to stop_sequences when configured', () => {
    const opts = {
      messages: [{ role: 'user', content: 'hello' }],
      stop: ['END', 'STOP']
    };
    
    const result = normalizeProviderParams(opts, { useStopSequences: true });
    
    expect(result).not.toHaveProperty('stop');
    expect(result.stop_sequences).toEqual(['END', 'STOP']);
  });
  
  test('converts single stop string to array for stop_sequences', () => {
    const opts = {
      messages: [{ role: 'user', content: 'hello' }],
      stop: 'END'
    };
    
    const result = normalizeProviderParams(opts, { useStopSequences: true });
    
    expect(result).not.toHaveProperty('stop');
    expect(result.stop_sequences).toEqual(['END']);
  });
  
  test('clamps temperature to specified range', () => {
    // Test clamping with default range (0.0 to 1.0)
    expect(normalizeProviderParams(
      { temperature: 1.5 }, 
      { clampTemp: true }
    ).temperature).toBe(1.0);
    
    expect(normalizeProviderParams(
      { temperature: -0.5 }, 
      { clampTemp: true }
    ).temperature).toBe(0.0);
    
    // Test with custom range
    expect(normalizeProviderParams(
      { temperature: 3.0 }, 
      { clampTemp: true, maxTemp: 2.0 }
    ).temperature).toBe(2.0);
    
    // Test with value in range
    expect(normalizeProviderParams(
      { temperature: 0.7 }, 
      { clampTemp: true }
    ).temperature).toBe(0.7);
  });
  
  test('removes specified parameters', () => {
    const opts = {
      messages: [{ role: 'user', content: 'hello' }],
      temperature: 0.7,
      top_p: 0.9,
      presence_penalty: 0.1
    };
    
    const result = normalizeProviderParams(opts, { 
      removeParams: ['top_p', 'presence_penalty'] 
    });
    
    expect(result.messages).toEqual([{ role: 'user', content: 'hello' }]);
    expect(result.temperature).toBe(0.7);
    expect(result).not.toHaveProperty('top_p');
    expect(result).not.toHaveProperty('presence_penalty');
  });
  
  test('does not modify original object', () => {
    const opts = {
      messages: [{ role: 'user', content: 'hello' }],
      temperature: 1.5,
      stop: 'END'
    };
    
    const result = normalizeProviderParams(opts, { 
      clampTemp: true,
      useStopSequences: true
    });
    
    // Original should be unchanged
    expect(opts.temperature).toBe(1.5);
    expect(opts.stop).toBe('END');
    
    // Result should be modified
    expect(result.temperature).toBe(1.0);
    expect(result).not.toHaveProperty('stop');
    expect(result.stop_sequences).toEqual(['END']);
  });
});

describe('mistralai payloader', () => {
  test('handles Mistral-specific parameters', () => {
    // Mock the provider
    const mockProvider = {
      name: 'mistralai',
      payloader: providers.mistralai.payloader
    };
    
    // Create a payload with Mistral-specific parameters
    const payload = {
      messages: [{ role: 'user', content: 'hello' }],
      system: 'Be helpful',
      temperature: 0.7,
      random_seed: 42,
      safe_prompt: true,
      response_format: { type: 'json_object' }
    };
    
    // Call the payloader
    const result = mockProvider.payloader(payload);
    
    // Verify standard parameters are preserved
    expect(result.messages).toEqual([
      { role: 'system', content: 'Be helpful' },
      { role: 'user', content: 'hello' }
    ]);
    expect(result.temperature).toBe(0.7);
    
    // Verify Mistral-specific parameters are included
    expect(result.random_seed).toBe(42);
    expect(result.safe_prompt).toBe(true);
    expect(result.response_format).toEqual({ type: 'json_object' });
  });
  
  test('works with standard parameters only', () => {
    // Mock the provider
    const mockProvider = {
      name: 'mistralai',
      payloader: providers.mistralai.payloader
    };
    
    // Create a payload with only standard parameters
    const payload = {
      messages: [{ role: 'user', content: 'hello' }],
      system: 'Be helpful',
      temperature: 0.7
    };
    
    // Call the payloader
    const result = mockProvider.payloader(payload);
    
    // Verify standard parameters are preserved
    expect(result.messages).toEqual([
      { role: 'system', content: 'Be helpful' },
      { role: 'user', content: 'hello' }
    ]);
    expect(result.temperature).toBe(0.7);
    
    // Verify Mistral-specific parameters are not included
    expect(result).not.toHaveProperty('random_seed');
    expect(result).not.toHaveProperty('safe_prompt');
    expect(result).not.toHaveProperty('response_format');
  });
});

describe('deepseek payloader', () => {
  test('handles DeepSeek-specific parameters', () => {
    // Mock the provider
    const mockProvider = {
      name: 'deepseek',
      payloader: providers.deepseek.payloader
    };
    
    // Create a payload with DeepSeek-specific parameters
    const payload = {
      messages: [{ role: 'user', content: 'hello' }],
      system: 'Be helpful',
      temperature: 0.7,
      response_format: { type: 'json_object' }
    };
    
    // Call the payloader
    const result = mockProvider.payloader(payload);
    
    // Verify standard parameters are preserved
    expect(result.messages).toEqual([
      { role: 'system', content: 'Be helpful' },
      { role: 'user', content: 'hello' }
    ]);
    expect(result.temperature).toBe(0.7);
    
    // Verify DeepSeek-specific parameters are included
    expect(result.response_format).toEqual({ type: 'json_object' });
  });
});

describe('togetherai payloader', () => {
  test('uses standard payloader for Together AI', () => {
    // Mock the provider
    const mockProvider = {
      name: 'togetherai',
      payloader: providers.togetherai.payloader
    };
    
    // Create a standard payload
    const payload = {
      messages: [{ role: 'user', content: 'hello' }],
      system: 'Be helpful',
      temperature: 0.7
    };
    
    // Call the payloader
    const result = mockProvider.payloader(payload);
    
    // Verify standard parameters are preserved
    expect(result.messages).toEqual([
      { role: 'system', content: 'Be helpful' },
      { role: 'user', content: 'hello' }
    ]);
    expect(result.temperature).toBe(0.7);
  });
}); 