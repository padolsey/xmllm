import APIStream from './Stream.mjs';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function runTestCase(testCase, index) {
  console.log(`\n========== Running test case ${index + 1} ==========`);
  console.log('Payload:', JSON.stringify(testCase, null, 2));

  try {
    const stream = await APIStream(testCase);
    const reader = stream.getReader();
    const decoder = new TextDecoder();

    let startTime = Date.now();
    let firstChunkTime = null;
    let totalChunks = 0;
    let content = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const decodedValue = decoder.decode(value);
      content += decodedValue;
      totalChunks++;

      if (totalChunks === 1) {
        firstChunkTime = Date.now();
        console.log(`Time to first chunk: ${firstChunkTime - startTime}ms`);
      }

      console.log(`Chunk ${totalChunks}:`, decodedValue);
    }

    const endTime = Date.now();
    console.log('\nTest case summary:');
    console.log(`Total time: ${endTime - startTime}ms`);
    console.log(`Total chunks: ${totalChunks}`);
    console.log(`Full content:\n${content}`);

    return { success: true, content, totalChunks, totalTime: endTime - startTime };
  } catch (error) {
    console.error(`Error in test case ${index + 1}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function testStream() {
  const testCases = [
    // {
    //   messages: [
    //     { role: 'system', content: 'You are a helpful assistant.' },
    //     { role: 'user', content: 'Hello, how are you?' }
    //   ],
    //   model: 'claude'
    // },
    // {
    //   messages: [
    //     { role: 'system', content: 'You are a helpful assistant.' },
    //     { role: 'user', content: 'What is the capital of France?' }
    //   ],
    //   model: ['openai:good', 'claude:good', 'togetherai:fast']
    // },
    // {
    //   messages: [
    //     { role: 'system', content: 'You are a helpful assistant.' },
    //     { role: 'user', content: 'Explain quantum computing in simple terms.' }
    //   ]
    // },
    {
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'This request should trigger the wait message.' }
      ],
      model: 'claude:superfast',
      waitMessageString: 'Wait...',
      waitMessageDelay: 5000,
      fakeDelay: 15000  // 15 seconds fake delay
    }
  ];

  const results = [];

  for (let i = 0; i < testCases.length; i++) {
    const result = await runTestCase(testCases[i], i);
    results.push(result);
    
    // Add a delay between test cases to avoid rate limiting
    if (i < testCases.length - 1) {
      console.log('\nWaiting 5 seconds before next test case...');
      await delay(5000);
    }
  }

  console.log('\n========== Test Summary ==========');
  results.forEach((result, index) => {
    console.log(`Test case ${index + 1}: ${result.success ? 'SUCCESS' : 'FAILURE'}`);
    if (result.success) {
      console.log(`  Chunks: ${result.totalChunks}`);
      console.log(`  Total time: ${result.totalTime}ms`);
    } else {
      console.log(`  Error: ${result.error}`);
    }
  });
}

testStream();
