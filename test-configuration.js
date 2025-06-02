// Test script to verify API configuration after disabling encryption
const fetch = require('node-fetch');

async function testAPIConfiguration() {
    console.log('🧪 Testing NameForge AI after disabling encryption...\n');
    
    // Test 1: Check API status
    console.log('1️⃣ Testing API status...');
    try {
        const response = await fetch('http://localhost:3000/api/status');
        const data = await response.json();
        
        console.log('✅ API Status:', data.success ? 'Online' : 'Offline');
        console.log('🔧 Encryption:', data.status.features.encryption ? 'Enabled' : 'Disabled');
        console.log('🔑 API Keys:', data.status.apiKeys);
        console.log('🎯 Primary API:', data.status.primaryAPI);
        console.log('📊 Service Status:', data.status.serviceStatus);
    } catch (error) {
        console.log('❌ Status check failed:', error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 2: Test business name generation with keywords
    console.log('2️⃣ Testing business name generation with keywords...');
    
    const testDescriptions = [
        'coffee shop with organic beans',
        'jewelry store with custom designs',
        'tech startup developing mobile apps',
        'fitness center with personal training'
    ];
    
    for (const description of testDescriptions) {
        console.log(`\n🎯 Testing: "${description}"`);
        
        try {
            const response = await fetch('http://localhost:3000/api/generate-names', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ description })
            });
            
            const data = await response.json();
            
            if (data.success && data.names) {
                console.log('✅ Generation successful!');
                console.log('📝 Source:', data.source || 'unknown');
                console.log('🔢 Names generated:', data.names.length);
                console.log('🎨 Sample names:');
                
                data.names.slice(0, 3).forEach((nameObj, index) => {
                    console.log(`   ${index + 1}. ${nameObj.name} - ${nameObj.description.substring(0, 80)}...`);
                });
            } else {
                console.log('❌ Generation failed:', data.message || data.error);
            }
        } catch (error) {
            console.log('❌ Test failed:', error.message);
        }
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 3: Check admin panel (if APIs are configured)
    console.log('3️⃣ Testing admin panel access...');
    try {
        const response = await fetch('http://localhost:3000/api/admin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'get-active-apis',
                adminCode: 'TEMP_CODE_12345'
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Admin panel accessible');
            console.log('🔧 Active APIs:', data.activeAPIs);
            console.log('🎯 Primary API:', data.primaryAPI);
        } else {
            console.log('❌ Admin panel error:', data.message);
        }
    } catch (error) {
        console.log('❌ Admin test failed:', error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    console.log('🎉 Testing complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Add your actual API keys to .env file');
    console.log('2. Restart the server: npm start');
    console.log('3. Test the web interface at http://localhost:3000');
    console.log('4. Use admin panel at http://localhost:3000/admin.html');
}

// Only run if this file is executed directly
if (require.main === module) {
    testAPIConfiguration().catch(console.error);
}

module.exports = { testAPIConfiguration };
