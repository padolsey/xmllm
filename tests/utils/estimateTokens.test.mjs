import { 
  estimateTokens, 
  estimateMessageTokens, 
  estimateMessagesTokens 
} from '../../src/utils/estimateTokens.mjs';

describe('estimateTokens', () => {
  describe('basic text handling', () => {
    test('handles empty string', () => {
      expect(estimateTokens('')).toBe(0);
    });

    test('handles null/undefined', () => {
      expect(estimateTokens(null)).toBe(0);
      expect(estimateTokens(undefined)).toBe(0);
    });

    test('handles whitespace', () => {
      expect(estimateTokens('   ')).toBe(0);
      expect(estimateTokens('\n\t  \r')).toBe(0);
    });

    test('returns minimum 1 token for non-empty content', () => {
      expect(estimateTokens('a')).toBe(1);
      expect(estimateTokens('.')).toBe(1);
      expect(estimateTokens(' . ')).toBe(1);
    });

    test('always returns whole numbers', () => {
      const result = estimateTokens('Some test text');
      expect(Number.isInteger(result)).toBe(true);
    });
  });

  describe('English text estimation', () => {
    test('estimates short English phrases', () => {
      const result = estimateTokens('Hello world');
      expect(result).toBeGreaterThanOrEqual(2);
      expect(result).toBeLessThanOrEqual(6);
      expect(Number.isInteger(result)).toBe(true);
    });

    test('estimates medium English sentences', () => {
      const result = estimateTokens(
        'This is a test sentence to estimate token count.'
      );
      expect(result).toBeGreaterThanOrEqual(8);
      expect(result).toBeLessThanOrEqual(18);
      expect(Number.isInteger(result)).toBe(true);
    });

    test('estimates longer English text', () => {
      const result = estimateTokens(
        'The quick brown fox jumps over the lazy dog. ' +
        'This pangram contains every letter of the English alphabet.'
      );
      expect(result).toBeGreaterThanOrEqual(15);
      expect(result).toBeLessThanOrEqual(35);
      expect(Number.isInteger(result)).toBe(true);
    });
  });

  describe('CJK text estimation', () => {
    test('estimates pure Chinese text', () => {
      const result = estimateTokens('这是一个中文句子。');
      expect(result).toBeGreaterThanOrEqual(4);
      expect(result).toBeLessThanOrEqual(8);
      expect(Number.isInteger(result)).toBe(true);
    });

    test('estimates mixed English-Chinese text', () => {
      const result = estimateTokens('Here is some text: 这是中文。');
      expect(result).toBeGreaterThanOrEqual(5);
      expect(result).toBeLessThanOrEqual(15);
      expect(Number.isInteger(result)).toBe(true);
    });

    test('applies CJK heuristic appropriately', () => {
      const highCJK = estimateTokens('全是中文字符的句子在这里。');
      const nonCJK = estimateTokens('This is a normal English sentence.');
      
      expect(highCJK).toBeGreaterThanOrEqual(6);
      expect(Number.isInteger(highCJK)).toBe(true);
      expect(Number.isInteger(nonCJK)).toBe(true);
    });
  });

  describe('special cases', () => {
    test('handles numbers', () => {
      const result = estimateTokens('123 456 789');
      expect(result).toBeGreaterThanOrEqual(3);
      expect(result).toBeLessThanOrEqual(6);
      expect(Number.isInteger(result)).toBe(true);
    });

    test('handles special characters', () => {
      const result = estimateTokens('!@#$%^&*()');
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(5);
      expect(Number.isInteger(result)).toBe(true);
    });

    test('handles repeated characters', () => {
      const result = estimateTokens('AAAAAAAAAA');
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(5);
      expect(Number.isInteger(result)).toBe(true);
    });
  });
});

describe('estimateMessageTokens', () => {
  test('handles message objects', () => {
    const message = {
      role: 'user',
      content: 'Hello world'
    };
    const result = estimateMessageTokens(message);
    expect(result).toBeGreaterThan(0);
    expect(Number.isInteger(result)).toBe(true);
  });

  test('handles invalid messages', () => {
    expect(estimateMessageTokens(null)).toBe(0);
    expect(estimateMessageTokens({})).toBe(0);
    expect(estimateMessageTokens({ content: '' })).toBe(0);
  });
});

describe('estimateMessagesTokens', () => {
  test('estimates total tokens for message array', () => {
    const messages = [
      { role: 'system', content: 'You are helpful.' },
      { role: 'user', content: 'Hello!' },
      { role: 'assistant', content: 'Hi there!' }
    ];
    const result = estimateMessagesTokens(messages);
    expect(result).toBeGreaterThan(0);
    expect(Number.isInteger(result)).toBe(true);
  });

  test('handles invalid message arrays', () => {
    expect(estimateMessagesTokens(null)).toBe(0);
    expect(estimateMessagesTokens([])).toBe(0);
    expect(estimateMessagesTokens([{}, { content: '' }])).toBe(0);
  });
}); 