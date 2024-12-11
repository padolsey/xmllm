/**
 * Estimates token count for text using multiple heuristics.
 * This is a rough approximation - actual token counts will vary by model.
 * 
 * @param {string} text - Input text to estimate tokens for
 * @returns {number} Estimated token count
 */
export function estimateTokens(text) {
  // Trim and handle empty or very short cases
  const trimmed = text?.trim() || '';
  if (trimmed.length === 0) return 0;
  if (trimmed.length === 1) return 1;  // Single character = 1 token
  
  const charCount = trimmed.length;
  
  // Word count heuristic: split on whitespace
  const words = trimmed.split(/\s+/);
  const wordCount = words.length;
  
  // Count CJK characters
  const cjkRegex = /[\u4E00-\u9FFF]/g;
  const cjkMatches = trimmed.match(cjkRegex);
  const cjkCount = cjkMatches ? cjkMatches.length : 0;
  const cjkRatio = cjkCount / charCount;

  // Heuristic 1: Word-based (~1.3 tokens/word)
  const tokenEstimateWord = wordCount * 1.3;
  
  // Heuristic 2: Character-based (~4 chars/token)
  const tokenEstimateChar = charCount / 4;
  
  // Heuristic 3: CJK-aware estimate
  let tokenEstimateCJK;
  if (cjkRatio > 0.2) {
    // Heavy CJK: ~2 chars/token
    tokenEstimateCJK = charCount / 2;
  } else {
    // Mixed/non-CJK: middle ground
    tokenEstimateCJK = charCount / 3;
  }

  // Take maximum of heuristics and round up
  // Ensure minimum of 1 token
  return Math.max(1, Math.ceil(Math.max(
    tokenEstimateWord, 
    tokenEstimateChar, 
    tokenEstimateCJK
  )));
}

/**
 * Estimates token count for a message object
 * @param {Object} message - Message object with content property
 * @returns {number} Estimated token count
 */
export function estimateMessageTokens(message) {
  if (!message?.content) return 0;
  return estimateTokens(message.content);
}

/**
 * Estimates total tokens for an array of messages
 * @param {Array} messages - Array of message objects
 * @returns {number} Total estimated tokens
 */
export function estimateMessagesTokens(messages) {
  if (!Array.isArray(messages)) return 0;
  return messages.reduce((sum, msg) => 
    sum + estimateMessageTokens(msg), 
  0);
} 