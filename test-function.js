// Test script for the generate-names function
const generateNamesModule = require('./netlify/functions/generate-names.js');

async function testFunction() {
    const event = {
        httpMethod: 'POST',
        body: JSON.stringify({
            description: 'coffee shop in downtown area',
            requestId: 'test-123',
            performanceNow: Date.now(),
            timestamp: Date.now(),
            sessionData: { clickCount: 1 }
        })
    };
    
    const context = {};
    
    try {
        console.log('🧪 Testing name generation function...');
        const result = await generateNamesModule.handler(event, context);
        
        console.log('\n📊 Result Status:', result.statusCode);
        
        if (result.statusCode === 200) {
            const responseData = JSON.parse(result.body);
            console.log('\n✅ Success:', responseData.success);
            console.log('📝 Source:', responseData.source);
            console.log('🔢 Number of names generated:', responseData.names?.length || 0);
            
            if (responseData.names && responseData.names.length > 0) {
                console.log('\n🎯 Generated Names:');
                responseData.names.forEach((item, index) => {
                    console.log(`${index + 1}. ${item.name} - ${item.description}`);
                });
            }
        } else {
            console.log('\n❌ Error:', result.body);
        }
        
    } catch (error) {
        console.error('🚨 Test failed:', error.message);
    }
}

testFunction();
