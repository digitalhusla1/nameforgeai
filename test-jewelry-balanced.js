// Test script specifically for jewelry business with better keyword detection
const { handler } = require('./netlify/functions/generate-names.js');

async function testJewelryGeneration() {
    console.log('🧪 Testing jewelry business name generation...');
    
    const event = {
        httpMethod: 'POST',
        headers: {},
        body: JSON.stringify({
            description: 'jewelry business selling rings and necklaces',
            requestId: 'jewelry-test-789',
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
        
        // Analyze name types
        const directNames = response.names.filter(nameObj => 
            nameObj.name.includes('Jewelry') || nameObj.name.includes('Gem') || 
            nameObj.name.includes('Silver') || nameObj.name.includes('Gold') ||
            nameObj.name.includes('Crystal') || nameObj.name.includes('Stone')
        );
        
        const creativeNames = response.names.filter(nameObj => 
            !directNames.includes(nameObj)
        );
        
        console.log(`📈 Direct/Industry Names: ${directNames.length}`);
        console.log(`🎨 Creative/Conceptual Names: ${creativeNames.length}`);
        
        if (directNames.length > 0) {
            console.log('📋 Direct Names:');
            directNames.forEach(nameObj => console.log(`   - ${nameObj.name}`));
        }
        
        if (creativeNames.length > 0) {
            console.log('🎨 Creative Names:');
            creativeNames.forEach(nameObj => console.log(`   - ${nameObj.name}`));
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testJewelryGeneration();
