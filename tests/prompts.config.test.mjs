import _xmllm from '../src/xmllm-main.mjs';
import { jest } from '@jest/globals';

const TestStream = (() => {
  const mockFn = jest.fn();
  mockFn.mockImplementation(() => ({
    getReader: () => ({
      read: jest.fn()
        .mockResolvedValueOnce({ value: new TextEncoder().encode('<result>test</result>'), done: false })
        .mockResolvedValueOnce({ done: true }),
      releaseLock: jest.fn()
    })
  }));
  return mockFn;
})();

const xmllm = (pipeline, opts) => {
  return _xmllm(pipeline, {
    ...(opts || {}),
    llmStream: TestStream
  });
};

describe('Custom Prompt Generators', () => {
  beforeEach(() => {
    TestStream.mockClear();
  });

  it('should use custom system prompt generator when provided at xmllm level', async () => {
    const customSystemPrompt = jest.fn((system) => `CUSTOM SYSTEM: ${system || 'default'}`);
    
    await xmllm(
      ({ promptStream }) => [
        promptStream('test prompt', { result: String })
      ],
      {
        generateSystemPrompt: customSystemPrompt
      }
    ).all();

    expect(customSystemPrompt).toHaveBeenCalled();
    expect(TestStream.mock.calls[0][0].messages[0].content).toBe('CUSTOM SYSTEM: default');
  });

  it('should use custom user prompt generator when provided at xmllm level', async () => {
    const customUserPrompt = jest.fn((scaffold, prompt) => 
      `CUSTOM USER: ${scaffold} - ${prompt}`
    );
    
    await xmllm(
      ({ promptStream }) => [
        promptStream('test prompt', { result: String })
      ],
      {
        generateUserPrompt: customUserPrompt
      }
    ).all();

    expect(customUserPrompt).toHaveBeenCalled();
    const lastMessage = TestStream.mock.calls[0][0].messages[TestStream.mock.calls[0][0].messages.length - 1];
    expect(lastMessage.content).toContain('CUSTOM USER:');
  });

  it('should allow overriding prompt generators at individual request level', async () => {
    const xmllmLevelSystemPrompt = jest.fn(system => `XMLLM LEVEL: ${system || 'default'}`);
    const requestLevelSystemPrompt = jest.fn(system => `REQUEST LEVEL: ${system || 'default'}`);
    
    await xmllm(
      ({ promptStream }) => [
        promptStream({
          messages: [{ role: 'user', content: 'test prompt' }],
          schema: { result: String },
          generateSystemPrompt: requestLevelSystemPrompt
        })
      ],
      {
        generateSystemPrompt: xmllmLevelSystemPrompt
      }
    ).all();

    expect(requestLevelSystemPrompt).toHaveBeenCalled();
    expect(xmllmLevelSystemPrompt).not.toHaveBeenCalled();
    expect(TestStream.mock.calls[0][0].messages[0].content).toBe('REQUEST LEVEL: default');
  });

  it('should fall back to default prompt generators if none provided', async () => {
    await xmllm(
      ({ promptStream }) => [
        promptStream('test prompt', { result: String })
      ]
    ).all();

    const systemMessage = TestStream.mock.calls[0][0].messages[0].content;
    expect(systemMessage).toContain('META & OUTPUT STRUCTURE RULES');
    expect(systemMessage).toContain('You are an AI that only outputs XML');
  });
}); 