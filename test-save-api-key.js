// Test script to verify admin panel API key saving functionality
const fetch = require('node-fetch');

async function testSaveAPIKey() {
    console.log('🧪 Testing Admin Panel API Key Saving...\n');
    
    const baseUrl = 'http://localhost:3000/api/admin';
    const adminCode = 'TEMP_CODE_12345'; // Default admin code from .env
    
    // Test 1: Try to save a test Gemini API key
    console.log('1️⃣ Testing Gemini API key save...');
    try {
        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'set-api-key',
                adminCode: adminCode,
                apiType: 'gemini',
                key: 'AIzaSyDummyTestKeyFor_Testing_Purposes_Only_123456789'
            })
        });
        
        const result = await response.json();
        console.log('Result:', result);
        
        if (result.success) {
            console.log('✅ Gemini API key save: SUCCESS');
        } else {
            console.log('❌ Gemini API key save: FAILED -', result.message);
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 2: Try to save a test Replicate API token
    console.log('2️⃣ Testing Replicate API token save...');
    try {
        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'set-api-key',
                adminCode: adminCode,
                apiType: 'replicate',
                key: 'r8_DummyTestTokenFor_Testing_Purposes_Only_123456789'
            })
        });
        
        const result = await response.json();
        console.log('Result:', result);
        
        if (result.success) {
            console.log('✅ Replicate API token save: SUCCESS');
        } else {
            console.log('❌ Replicate API token save: FAILED -', result.message);
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 3: Check status after saving
    console.log('3️⃣ Checking API status after saves...');
    try {
        const response = await fetch('http://localhost:3000/api/status', {
            method: 'GET'
        });
        
        const result = await response.json();
        console.log('Current API Status:');
        console.log('- Gemini:', result.apiKeys?.gemini || 'unknown');
        console.log('- Anthropic:', result.apiKeys?.anthropic || 'unknown');
        console.log('- Replicate:', result.apiKeys?.replicate || 'unknown');
        console.log('- Primary API:', result.primaryAPI || 'none');
        console.log('- Service Status:', result.serviceStatus || 'unknown');
    } catch (error) {
        console.log('❌ Status check error:', error.message);
    }
    
    console.log('\n🧪 Test Complete! Check the .env file to see if keys were saved.');
}

// Run the test
testSaveAPIKey().catch(console.error);
