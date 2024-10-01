import APIStream from './Stream.mjs';

async function testStream() {
  const payload = {
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Hello, how are you?' }
    ],
    model: 'good'
  };

  // const preferredProviders = ['claude:good', 'openai:good', 'openai:fast', 'claude:fast'];
// 
  const preferredProviders = ['togetherai:superfast'];

  try {
    const stream = await APIStream(payload, preferredProviders);
    const reader = stream.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      console.log(decoder.decode(value));
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testStream();