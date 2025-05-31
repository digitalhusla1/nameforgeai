// Test script for different business types
const generateNamesModule = require('./netlify/functions/generate-names.js');

async function testDifferentBusinessTypes() {
    const testCases = [
        {
            description: "tech startup developing AI software solutions",
            label: "Tech Startup"
        },
        {
            description: "fitness gym offering personal training and workout classes",
            label: "Fitness Gym"
        },
        {
            description: "consulting firm helping small businesses grow",
            label: "Consulting Firm"
        }
    ];
    
    for (const testCase of testCases) {
        console.log(`\n🧪 Testing: ${testCase.label}`);
        console.log(`📝 Description: "${testCase.description}"`);
        console.log('=' + '='.repeat(60));
        
        const event = {
            httpMethod: 'POST',
            body: JSON.stringify({
                description: testCase.description,
                requestId: `test-${Date.now()}`,
                performanceNow: Date.now(),
                timestamp: Date.now(),
                sessionData: { clickCount: 1 }
            })
        };
        
        try {
            const result = await generateNamesModule.handler(event, {});
            
            if (result.statusCode === 200) {
                const responseData = JSON.parse(result.body);
                console.log(`✅ Generated ${responseData.names?.length || 0} names`);
                
                if (responseData.names && responseData.names.length > 0) {
                    responseData.names.forEach((item, index) => {
                        console.log(`${index + 1}. ${item.name} - ${item.description}`);
                    });
                }
            } else {
                console.log('❌ Error:', result.body);
            }
            
        } catch (error) {
            console.error('🚨 Test failed:', error.message);
        }
        
        console.log('\n' + '-'.repeat(80));
    }
}

testDifferentBusinessTypes();
