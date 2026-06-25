import { deriveCacheKey } from '../src/Stream.mjs';

describe('BUG-02: cache key includes max_tokens and stop', () => {
  const base = { messages: [{ role: 'user', content: 'hi' }], model: ['m'], temperature: 0.5 };

  test('different max_tokens => different cache key', () => {
    expect(deriveCacheKey({ ...base, max_tokens: 50 }))
      .not.toBe(deriveCacheKey({ ...base, max_tokens: 2000 }));
  });

  test('maxTokens (camelCase alias) is also part of the key', () => {
    expect(deriveCacheKey({ ...base, maxTokens: 50 }))
      .not.toBe(deriveCacheKey({ ...base, maxTokens: 2000 }));
  });

  test('different max_completion_tokens (o-series alias) => different cache key', () => {
    expect(deriveCacheKey({ ...base, max_completion_tokens: 50 }))
      .not.toBe(deriveCacheKey({ ...base, max_completion_tokens: 2000 }));
  });

  test('different stop sequences => different cache key', () => {
    expect(deriveCacheKey({ ...base, stop: ['X'] }))
      .not.toBe(deriveCacheKey({ ...base, stop: ['Y'] }));
  });

  test('identical params => identical key', () => {
    expect(deriveCacheKey({ ...base, max_tokens: 50, stop: ['X'] }))
      .toBe(deriveCacheKey({ ...base, max_tokens: 50, stop: ['X'] }));
  });
});
