import APIStream from './Stream.mjs';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function runTest(payload) {
    console.log('Running test with payload:', JSON.stringify(payload, null, 2));

    try {
        const stream = await APIStream(payload);
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
        console.log('\nTest Summary:');
        console.log(`Total time: ${endTime - startTime}ms`);
        console.log(`Total chunks: ${totalChunks}`);
        console.log(`Full content:\n${content}`);

        return { success: true, content, totalChunks, totalTime: endTime - startTime };
    } catch (error) {
        console.error('Test Error:', error.message);
        return { success: false, error: error.message };
    }
}

// Test Definitions
const tests = {
    waiting: async () => {
        return runTest({
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: 'What is purple?' }
            ],
            model: 'anthropic:superfast',
            waitMessageString: 'Wait...',
            waitMessageDelay: 5000,
            fakeDelay: 15000
        });
    },

    defaultCaching: async () => {
        // First request
        console.log("Making first request...");
        const payload = {
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: 'Write a short problem and then solve it.' }
            ],
            model: 'anthropic:fast'
        };
        
        await runTest(payload);
        
        // Second request with same payload should hit cache
        console.log("\nMaking second request (should be cached)...");
        await delay(1000);
        return runTest(payload);
    },

    story: async () => {
        return runTest({
            messages: [
                { role: 'system', content: 'You are a creative storyteller.' },
                { role: 'user', content: 'Write a short story about a magical library.' }
            ],
            model: 'anthropic:good'
        });
    },

    concurrent: async () => {
        console.log("Testing concurrent requests...");
        const payload = {
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: 'Count from 1 to 5 slowly.' }
            ],
            model: 'anthropic:fast'
        };

        return Promise.all([
            runTest(payload),
            runTest(payload)
        ]);
    },

    nonCaching: async () => {
        console.log("Testing with caching disabled (default behavior)...");
        const payload = {
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: 'What is 2+2?' }
            ],
            model: 'anthropic:fast',
            temperature: 0.7,
            max_tokens: 100
        };
        
        console.log("First request...");
        const result1 = await runTest(payload);
        
        console.log("\nSecond request (should NOT be cached)...");
        await delay(1000);
        return runTest(payload);
    },

    trueCaching: async () => {
        console.log("Testing with caching explicitly enabled...");
        const payload = {
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: 'What is 2+2? explain the epistemology of the answer.' }
            ],
            model: 'anthropic:fast',
            temperature: 0.7,
            max_tokens: 100,
            cache: true  // Explicitly enable caching
        };
        
        console.log("First request...");
        const result1 = await runTest(payload);
        
        console.log("\nSecond request (should be cached)...");
        await delay(1000);
        const result2 = await runTest(payload);

        // Return both results for comparison
        return {
            firstRequest: result1,
            secondRequest: result2
        };
    }
};

// Main execution
async function main() {
    const args = process.argv.slice(2);
    const testFlag = args.find(arg => arg.startsWith('--test='));
    
    if (!testFlag) {
        console.log('Available tests:');
        Object.keys(tests).forEach(test => console.log(`  --test=${test}`));
        process.exit(1);
    }

    const testName = testFlag.split('=')[1];
    const testFn = tests[testName];

    if (!testFn) {
        console.error(`Unknown test: ${testName}`);
        console.log('Available tests:');
        Object.keys(tests).forEach(test => console.log(`  --test=${test}`));
        process.exit(1);
    }

    console.log(`\n========== Running ${testName} test ==========\n`);
    const result = await testFn();
    
    console.log('\n========== Test Complete ==========');
    if (result.firstRequest && result.secondRequest) {
        console.log('\nFirst Request:');
        console.log(`Result: ${result.firstRequest.success ? 'SUCCESS' : 'FAILURE'}`);
        if (result.firstRequest.success) {
            console.log(`Chunks: ${result.firstRequest.totalChunks}`);
            console.log(`Total time: ${result.firstRequest.totalTime}ms`);
        }
        
        console.log('\nSecond Request:');
        console.log(`Result: ${result.secondRequest.success ? 'SUCCESS' : 'FAILURE'}`);
        if (result.secondRequest.success) {
            console.log(`Chunks: ${result.secondRequest.totalChunks}`);
            console.log(`Total time: ${result.secondRequest.totalTime}ms`);
        }
    } else if (Array.isArray(result)) {
        result.forEach((r, i) => {
            console.log(`\nConcurrent request ${i + 1}: ${r.success ? 'SUCCESS' : 'FAILURE'}`);
            if (r.success) {
                console.log(`  Chunks: ${r.totalChunks}`);
                console.log(`  Total time: ${r.totalTime}ms`);
            } else {
                console.log(`  Error: ${r.error}`);
            }
        });
    } else {
        console.log(`Result: ${result.success ? 'SUCCESS' : 'FAILURE'}`);
        if (result.success) {
            console.log(`Chunks: ${result.totalChunks}`);
            console.log(`Total time: ${result.totalTime}ms`);
        } else {
            console.log(`Error: ${result.error}`);
        }
    }
}

main().catch(console.error);
