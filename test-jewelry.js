// Test script specifically for jewelry business
const { handler } = require('./netlify/functions/generate-names.js');

async function testJewelryGeneration() {
    console.log('🧪 Testing jewelry business name generation...');
    
    const event = {
        httpMethod: 'POST',
        headers: {},
        body: JSON.stringify({
            description: 'handmade jewelry store with custom pieces',
            requestId: 'jewelry-test-456',
            clickCount: 1,
            performanceNow: Date.now()
        })
    };
    
    const context = {};
    
    try {
        const result = await handler(event, context);
        const response = JSON.parse(result.body);
        
        console.log('📊 Result Status:', result.statusCode);
        console.log('✅ Success:', response.success);
        console.log('📝 Source:', response.source);
        console.log('🔢 Number of names generated:', response.names.length);
        console.log('🎯 Generated Names:');
        
        response.names.forEach((nameObj, index) => {
            const displayDescription = nameObj.description.length > 100 
                ? nameObj.description.substring(0, 100) + '...'
                : nameObj.description;
            console.log(`${index + 1}. ${nameObj.name} - ${displayDescription}`);
        });
        
        // Check if any names contain "jewelry"
        const namesWithKeyword = response.names.filter(nameObj => 
            nameObj.name.toLowerCase().includes('jewelry')
        );
        
        if (namesWithKeyword.length > 0) {
            console.log('❌ WARNING: Found names containing "jewelry":');
            namesWithKeyword.forEach(nameObj => {
                console.log(`   - ${nameObj.name}`);
            });
        } else {
            console.log('✅ SUCCESS: No names contain the keyword "jewelry"');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testJewelryGeneration();
