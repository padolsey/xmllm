import innerTruncate from '../src/innerTruncate.mjs';
import { estimateTokens } from '../src/utils/estimateTokens.mjs';

describe('innerTruncate', () => {
  test('returns original text when token count is within limit', () => {
    const txt = 'Short text';
    const result = innerTruncate(txt, '[...]', 2, 100);
    expect(result).toBe(txt);
  });

  test('returns original text when nSplits is zero', () => {
    const txt = 'Some longer text that exceeds token limit';
    const result = innerTruncate(txt, '[...]', 0, 10);
    expect(result).toBe(txt);
  });

  test('truncates text correctly when over token limit', () => {
    const txt = 'This is a very long text that should be truncated because it exceeds the token limit';
    const nSplits = 2;
    const totalTokensLimit = 10;

    const result = innerTruncate(txt, '[...]', nSplits, totalTokensLimit);

    const tokensCount = estimateTokens(result);
    // Allow a margin of error of +2 tokens due to estimation
    expect(tokensCount).toBeLessThanOrEqual(totalTokensLimit + 2);

    // Verify that the result contains the separator the correct number of times
    const separatorMatches = result.match(/\[\.\.\.\]/g);
    expect(separatorMatches).not.toBeNull();
    expect(separatorMatches.length).toBe(nSplits - 1);
});

  test('handles exact token limit', () => {
    const txt = '123456789';
    const nSplits = 3;
    const totalTokensLimit = 3;
    const result = innerTruncate(txt, '[...]', nSplits, totalTokensLimit);
    expect(estimateTokens(result)).toBeLessThanOrEqual(totalTokensLimit);
  });

  test('ensures desired tokens per segment works correctly', () => {
    const txt = 'A'.repeat(300);
    const totalTokensLimit = 100;
    const nSplits = 5;
    const result = innerTruncate(txt, '[...]', nSplits, totalTokensLimit);

    const tokensCount = estimateTokens(result);
    expect(tokensCount).toBeLessThanOrEqual(totalTokensLimit);
  });

  test('returns empty string when txt is empty', () => {
    const txt = '';
    const result = innerTruncate(txt, '[...]', 2, 10);
    expect(result).toBe('');
  });

  test('handles very small totalTokensLimit', () => {
    const txt = 'Some longer text';
    const totalTokensLimit = 1;

    const result = innerTruncate(txt, '[...]', 3, totalTokensLimit);

    const tokensCount = estimateTokens(result);
    // Allow a margin of error of +3 tokens due to estimation and minimum possible length
    expect(tokensCount).toBeLessThanOrEqual(totalTokensLimit + 3);

    // Verify that the result contains the separator
    const separatorMatches = result.match(/\[\.\.\.\]/g);
    expect(separatorMatches).not.toBeNull();
});
});
