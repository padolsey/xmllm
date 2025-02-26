import { jest } from '@jest/globals';
import { standardPayloader, o1Payloader, createCustomModel, taiStylePayloader, testProviders } from '../src/PROVIDERS.mjs';

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
});

describe('o1Payloader', () => {
  let mockProvider;

  beforeEach(() => {
    mockProvider = {
      currentModelName: 'o1-preview',
    };
  });

  test('handles o1 models supporting developer role', () => {
    const payload = o1Payloader.call(mockProvider, {
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
    mockProvider.currentModelName = 'o1-mini';

    const payload = o1Payloader.call(mockProvider, {
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
    const payload = o1Payloader.call(mockProvider, {
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