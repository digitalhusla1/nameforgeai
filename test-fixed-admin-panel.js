// Test script to verify the FIXED admin panel API key saving functionality
const fetch = require('node-fetch');

async function testFixedAdminPanel() {
    console.log('🔧 Testing FIXED Admin Panel API Key Saving...\n');
    
    const baseUrl = 'http://localhost:3000/api/admin';
    const adminCode = 'TEMP_CODE_12345'; // Default admin code from .env
    
    // Test 1: Save a real-format Gemini API key
    console.log('1️⃣ Testing FIXED Gemini API key save...');
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
                key: 'AIzaSyTestKey_For_Demo_Purposes_Only_1234567890'
            })
        });
        
        const result = await response.json();
        console.log('Backend Response:', result);
        
        if (result.success) {
            console.log('✅ Gemini API key save: SUCCESS');
            console.log('✅ Message:', result.message);
        } else {
            console.log('❌ Gemini API key save: FAILED -', result.message);
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Test 2: Save a real-format Replicate API token  
    console.log('2️⃣ Testing FIXED Replicate API token save...');
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
                key: 'r8_TestToken_For_Demo_Purposes_Only_1234567890123456'
            })
        });
        
        const result = await response.json();
        console.log('Backend Response:', result);
        
        if (result.success) {
            console.log('✅ Replicate API token save: SUCCESS');
            console.log('✅ Message:', result.message);
        } else {
            console.log('❌ Replicate API token save: FAILED -', result.message);
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Test 3: Check .env file was updated
    console.log('3️⃣ Checking if .env file was updated...');
    const fs = require('fs');
    const path = require('path');
    
    try {
        const envPath = path.join(__dirname, '.env');
        const envContent = fs.readFileSync(envPath, 'utf8');
        
        console.log('📄 Current .env file contents:');
        console.log(envContent);
        
        // Check for our test keys
        if (envContent.includes('AIzaSyTestKey_For_Demo_Purposes_Only_1234567890')) {
            console.log('✅ Gemini test key found in .env file');
        } else {
            console.log('❌ Gemini test key NOT found in .env file');
        }
        
        if (envContent.includes('r8_TestToken_For_Demo_Purposes_Only_1234567890123456')) {
            console.log('✅ Replicate test token found in .env file');
        } else {
            console.log('❌ Replicate test token NOT found in .env file');
        }
        
    } catch (error) {
        console.log('❌ Error reading .env file:', error.message);
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Test 4: Check system status
    console.log('4️⃣ Checking system status after saves...');
    try {
        const response = await fetch('http://localhost:3000/api/status', {
            method: 'GET'
        });
        
        const result = await response.json();
        console.log('📊 API Status:');
        console.log('- Gemini:', result.apiKeys?.gemini || 'unknown');
        console.log('- Anthropic:', result.apiKeys?.anthropic || 'unknown');
        console.log('- Replicate:', result.apiKeys?.replicate || 'unknown');
        console.log('- Primary API:', result.primaryAPI || 'none');
        console.log('- Service Status:', result.serviceStatus || 'unknown');
        console.log('- AI Service Count:', result.aiServiceCount || 0);
        
        if (result.apiKeys?.gemini === 'configured' && result.apiKeys?.replicate === 'configured') {
            console.log('✅ System correctly recognizes configured APIs');
        } else {
            console.log('❌ System may not be recognizing the saved APIs');
        }
        
    } catch (error) {
        console.log('❌ Status check error:', error.message);
    }
    
    console.log('\n🎉 Admin Panel Fix Test Complete!');
    console.log('\n📝 NEXT STEPS:');
    console.log('1. Open http://localhost:3000/admin.html');
    console.log('2. Enter admin code: TEMP_CODE_12345');
    console.log('3. Enter your REAL API keys');
    console.log('4. Click "Save" - keys will now be saved to .env file!');
    console.log('5. Test business name generation with your real keys');
}

// Run the test
testFixedAdminPanel().catch(console.error);
