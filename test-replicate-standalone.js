const Replicate = require('replicate');

// Test the Replicate API with the same setup as our app
async function testReplicate() {
    try {
        // Read the API key from environment like our app does
        const apiKey = process.env.REPLICATE_API_TOKEN;
        
        console.log('🔑 API Key check:', {
            provided: !!apiKey,
            length: apiKey ? apiKey.length : 0,
            startsWithR8: apiKey ? apiKey.startsWith('r8_') : false
        });
        
        if (!apiKey) {
            console.error('❌ No API key found in REPLICATE_API_TOKEN environment variable');
            return;
        }
        
        // Test 1: Initialize with auth parameter
        console.log('\n🧪 Test 1: Initialize with auth parameter');
        const replicate1 = new Replicate({ auth: apiKey });
        
        try {
            const models = await replicate1.models.list();
            console.log('✅ Test 1 successful - can list models');
        } catch (error) {
            console.log('❌ Test 1 failed:', error.message);
        }
        
        // Test 2: Initialize without auth (environment variable)
        console.log('\n🧪 Test 2: Initialize without auth (env var)');
        process.env.REPLICATE_API_TOKEN = apiKey;
        const replicate2 = new Replicate();
        
        try {
            const models = await replicate2.models.list();
            console.log('✅ Test 2 successful - can list models');
        } catch (error) {
            console.log('❌ Test 2 failed:', error.message);
        }
        
        // Test 3: Try a simple prediction
        console.log('\n🧪 Test 3: Try a simple prediction');
        try {
            const output = await replicate2.run("meta/llama-2-7b-chat", {
                input: {
                    prompt: "Hello, say hi back to me!",
                    max_new_tokens: 50
                }
            });
            console.log('✅ Test 3 successful - prediction worked');
            console.log('Output:', output);
        } catch (error) {
            console.log('❌ Test 3 failed:', error.message);
        }
        
    } catch (error) {
        console.error('❌ Overall test failed:', error.message);
    }
}

testReplicate();
