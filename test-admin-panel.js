// Test script for admin panel functionality
const fetch = require('node-fetch');

async function testAdminPanel() {
    console.log('🔐 Testing Admin Panel...');
    
    const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://nameforgeai.netlify.app/.netlify/functions/admin-panel'
        : 'http://localhost:8888/.netlify/functions/admin-panel';
    
    // Test 1: Invalid admin code
    console.log('\n1️⃣ Testing invalid admin code...');
    try {
        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'status',
                adminCode: 'wrong_code'
            })
        });
        
        const result = await response.json();
        console.log('Result:', result.success ? '✅ Unexpected success' : '❌ Correctly denied access');
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
    
    // Test 2: Valid admin code - status check
    console.log('\n2️⃣ Testing status check with valid code...');
    try {
        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'status',
                adminCode: 'TEMP_CODE_12345' // Default code
            })
        });
        
        const result = await response.json();
        console.log('Status:', result.success ? '✅ Success' : '❌ Failed');
        if (result.success) {
            console.log('API Status:', JSON.stringify(result.data.apis, null, 2));
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
    
    console.log('\n🔐 Admin Panel Test Complete!');
    console.log('\n📝 Usage Instructions:');
    console.log('POST to: /.netlify/functions/admin-panel');
    console.log('Body: { "action": "status", "adminCode": "YOUR_CODE" }');
    console.log('Actions: status, test-gemini, test-replicate, switch-primary');
}

// Run the test
testAdminPanel().catch(console.error);
