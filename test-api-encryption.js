// Test API encryption endpoints
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000';
const ADMIN_CODE = 'TEMP_CODE_12345';

async function testEncryptedAPI(apiType, apiKey, additionalData = {}) {
    console.log(`\n🧪 Testing ${apiType.toUpperCase()} API with encryption...`);
    
    try {
        const response = await fetch(`${API_BASE}/api/admin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: `test-${apiType}`,
                adminCode: ADMIN_CODE,
                apiKey: apiKey,
                ...additionalData
            })
        });

        const result = await response.json();
        
        console.log(`📊 Response Status: ${response.status}`);
        console.log(`✅ Success: ${result.success}`);
        console.log(`📝 Message: ${result.message}`);
        if (result.details) {
            console.log(`🔍 Details: ${result.details}`);
        }
        
        return result;
        
    } catch (error) {
        console.error(`❌ Error testing ${apiType}: ${error.message}`);
        return { success: false, error: error.message };
    }
}

async function runTests() {
    console.log('🔐 Testing API Encryption Endpoints\n');
    
    // Test data (fake API keys for testing)
    const testKeys = {
        gemini: 'AIzaSyBtest123456789ABCDEF_fake_key_for_testing',
        anthropic: 'sk-ant-api03-test123456789ABCDEF_fake_key_for_testing',
        replicate: 'r8_test123456789ABCDEF_fake_key_for_testing'
    };
    
    // Test Gemini API
    await testEncryptedAPI('gemini', testKeys.gemini, {
        apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
    });
    
    // Test Anthropic API
    await testEncryptedAPI('anthropic', testKeys.anthropic, {
        model: 'claude-3-5-sonnet-20241022'
    });
    
    // Test Replicate API
    await testEncryptedAPI('replicate', testKeys.replicate, {
        model: 'meta/llama-2-7b-chat'
    });
    
    // Test API key storage
    console.log('\n🔐 Testing API Key Storage...');
    try {
        const response = await fetch(`${API_BASE}/api/admin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'store-api-keys',
                adminCode: ADMIN_CODE,
                geminiKey: testKeys.gemini,
                anthropicKey: testKeys.anthropic,
                replicateKey: testKeys.replicate
            })
        });

        const result = await response.json();
        
        console.log(`📊 Storage Response Status: ${response.status}`);
        console.log(`✅ Success: ${result.success}`);
        console.log(`📝 Message: ${result.message}`);
        if (result.stored) {
            console.log(`🗃️ Stored APIs: ${result.stored.join(', ')}`);
        }
        
    } catch (error) {
        console.error(`❌ Error testing storage: ${error.message}`);
    }
    
    console.log('\n🎉 Encryption testing completed!');
}

// Run the tests
runTests().catch(console.error);
