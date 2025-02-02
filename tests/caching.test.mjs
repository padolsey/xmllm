import { jest } from '@jest/globals';

// Mock ProviderManager before imports
const mockStreamRequest = jest.fn();

const mockFactory = () => ({
  default: jest.fn().mockImplementation(() => ({
    streamRequest: mockStreamRequest
  }))
});

jest.unstable_mockModule('./src/ProviderManager.mjs', mockFactory);

// Import after mocking
const { stream } = await import('../src/xmllm-main.mjs');
const { _reset } = await import('../src/mainCache.mjs');

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

describe('Caching', () => {
  beforeEach(async () => {
    await _reset(); // Reset cache between tests
    mockStreamRequest.mockClear();
  });

  it('should cache responses and reuse them', async () => {
    // Setup mock response
    mockStreamRequest.mockImplementation(() => ({
      getReader: () => createMockReader(['<answer>42</answer>'])
    }));

    // First request - should hit LLM
    const result1 = await stream('What is 6 x 7?', {
      schema: { answer: Number },
      cache: true
    }).last();

    // Second request - should use cache
    const result2 = await stream('What is 6 x 7?', {
      schema: { answer: Number },
      cache: true
    }).last();

    expect(result1).toEqual({ answer: 42 });
    expect(result2).toEqual({ answer: 42 });
    expect(mockStreamRequest).toHaveBeenCalledTimes(1); // Only one LLM call
  });

  it('should support granular cache control', async () => {
    mockStreamRequest
      .mockImplementationOnce(() => ({
        getReader: () => createMockReader(['<answer>42</answer>'])
      }))
      .mockImplementationOnce(() => ({
        getReader: () => createMockReader(['<answer>43</answer>'])
      }));

    // Write-only request
    const result1 = await stream('What is 6 x 7?', {
      schema: { answer: Number },
      cache: { read: false, write: true }
    }).last();

    // Another write-only request - should make new LLM call
    const result2 = await stream('What is 6 x 7?', {
      schema: { answer: Number },
      cache: { read: false, write: true }
    }).last();

    // Read-only request - should get last cached value
    const result3 = await stream('What is 6 x 7?', {
      schema: { answer: Number },
      cache: { read: true, write: false }
    }).last();

    expect(result1).toEqual({ answer: 42 });
    expect(result2).toEqual({ answer: 43 });
    expect([result1, result2]).toContainEqual(result3); // Should match one of the cached results
    expect(mockStreamRequest).toHaveBeenCalledTimes(2); // Two LLM calls
  });

  it('should handle cache misses gracefully', async () => {
    mockStreamRequest.mockImplementation(() => ({
      getReader: () => createMockReader(['<answer>42</answer>'])
    }));

    // Try to read from empty cache
    const result = await stream('What is 6 x 7?', {
      schema: { answer: Number },
      cache: { read: true, write: false }
    }).last();

    expect(result).toEqual({ answer: 42 });
    expect(mockStreamRequest).toHaveBeenCalledTimes(1); // Should make LLM call on cache miss
  });

  it('should respect cache: false', async () => {
    mockStreamRequest
      .mockImplementationOnce(() => ({
        getReader: () => createMockReader(['<answer>42</answer>'])
      }))
      .mockImplementationOnce(() => ({
        getReader: () => createMockReader(['<answer>43</answer>'])
      }));

    // First request
    const result1 = await stream('What is 6 x 7?', {
      schema: { answer: Number },
      cache: false
    }).last();

    // Second request - should bypass cache
    const result2 = await stream('What is 6 x 7?', {
      schema: { answer: Number },
      cache: false
    }).last();

    expect(result1).toEqual({ answer: 42 });
    expect(result2).toEqual({ answer: 43 });
    expect(mockStreamRequest).toHaveBeenCalledTimes(2); // Should make LLM call each time
  });

  it('should use different cache keys for different prompts', async () => {
    mockStreamRequest.mockImplementation(() => ({
      getReader: () => createMockReader(['<answer>42</answer>'])
    }));

    // Same schema, different prompts
    await stream('What is 6 x 7?', {
      schema: { answer: Number },
      cache: true
    }).last();

    await stream('What is 7 x 6?', {  // Different prompt
      schema: { answer: Number },
      cache: true
    }).last();

    expect(mockStreamRequest).toHaveBeenCalledTimes(2);
  });

  it('should use different cache keys for different schemas', async () => {
    mockStreamRequest.mockImplementation(() => ({
      getReader: () => createMockReader(['<answer>42</answer>'])
    }));

    // Same prompt, different schemas
    await stream('What is 6 x 7?', {
      schema: { answer: Number },
      cache: true
    }).last();

    await stream('What is 6 x 7?', {
      schema: { answer: String },  // Different schema
      cache: true
    }).last();

    expect(mockStreamRequest).toHaveBeenCalledTimes(2);
  });

  it('should persist cache between stream instances', async () => {
    mockStreamRequest.mockImplementation(() => ({
      getReader: () => createMockReader(['<answer>42</answer>'])
    }));

    // First request
    await stream('What is 6 x 7?', {
      schema: { answer: Number },
      cache: true
    }).last();

    mockStreamRequest.mockClear();

    // Reset everything except cache
    const { resetConfig } = await import('../src/config.mjs');
    await resetConfig();

    // Try same request after reset
    const result = await stream('What is 6 x 7?', {
      schema: { answer: Number },
      cache: true
    }).last();

    expect(result).toEqual({ answer: 42 });
    expect(mockStreamRequest).not.toHaveBeenCalled(); // Should use persisted cache
  });

  it('should respect cache size limits', async () => {
    const longResponse = '<answer>' + 'x'.repeat(1000000) + '</answer>';
    
    mockStreamRequest.mockImplementation(() => ({
      getReader: () => createMockReader([longResponse])
    }));

    // Try to cache a very large response
    const result1 = await stream('Generate long text', {
      schema: { answer: String },
      cache: true
    }).last();

    mockStreamRequest.mockClear();

    // Try same request again
    const result2 = await stream('Generate long text', {
      schema: { answer: String },
      cache: true
    }).last();

    // Should make new request since first was too large to cache
    expect(mockStreamRequest).toHaveBeenCalledTimes(1);
  });

  it('should handle cache expiry', async () => {
    const { configure } = await import('../src/config.mjs');
    
    // Set short TTL
    configure({
      cache: {
        ttl: 100 // 100ms
      }
    });

    mockStreamRequest.mockImplementation(() => ({
      getReader: () => createMockReader(['<answer>42</answer>'])
    }));

    // First request
    await stream('What is 6 x 7?', {
      schema: { answer: Number },
      cache: true
    }).last();

    // Wait for cache to expire
    await new Promise(resolve => setTimeout(resolve, 150));

    // Try same request after expiry
    await stream('What is 6 x 7?', {
      schema: { answer: Number },
      cache: true
    }).last();

    expect(mockStreamRequest).toHaveBeenCalledTimes(2); // Should make new request
  });
}); 