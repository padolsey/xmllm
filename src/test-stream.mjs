import APIStream from './Stream.mjs';

async function testStream() {
  // Test case 1: Using a single model
  const payload1 = {
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Hello, how are you?' }
    ],
    model: 'togetherai:superfast'
  };

  // Test case 2: Using multiple models in order of preference
  const payload2 = {
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'What is the capital of France?' }
    ],
    model: ['openai', 'claude:good', 'openai:good', 'togetherai:fast']
  };

  // Test case 3: Without specifying a model (will use DEFAULT_PREFERRED_PROVIDERS)
  const payload3 = {
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Explain quantum computing in simple terms.' }
    ]
  };

  const testCases = [payload1, payload2, payload3];

  for (let i = 0; i < testCases.length; i++) {
    console.log(`\nRunning test case ${i + 1}:`);
    try {
      const stream = await APIStream(testCases[i]);
      const reader = stream.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        console.log(decoder.decode(value));
      }
    } catch (error) {
      console.error(`Error in test case ${i + 1}:`, error.message);
    }
  }
}

testStream();