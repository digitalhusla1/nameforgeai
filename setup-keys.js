// Quick API Key Setup Tool
// Run this script to easily add your API keys to the .env file

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

console.log('🔑 NameForge AI - Quick API Key Setup');
console.log('=====================================\n');

console.log('Current .env file location:', envPath);
console.log('\nTo add your API keys:');
console.log('1. Open the .env file in your text editor');
console.log('2. Replace the empty values with your actual API keys:');
console.log('\n📋 Example:');
console.log('GEMINI_API_KEY=AIzaSyYourActualGeminiAPIKeyHere');
console.log('REPLICATE_API_TOKEN=r8_your_actual_replicate_token_here');
console.log('ANTHROPIC_API_KEY=sk-ant-your_actual_anthropic_key_here');
console.log('\n💡 Tips:');
console.log('- Only add the APIs you have keys for');
console.log('- Gemini is recommended (free tier available)');
console.log('- Save the file after adding your keys');
console.log('- Restart the server: npm start');

// Check if .env file exists and read current content
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log('\n📄 Current .env file content:');
    console.log('================================');
    console.log(envContent);
    console.log('================================');
    
    // Check for any configured keys
    const hasGemini = envContent.includes('GEMINI_API_KEY=') && !envContent.match(/GEMINI_API_KEY=\s*$/m);
    const hasReplicate = envContent.includes('REPLICATE_API_TOKEN=') && !envContent.match(/REPLICATE_API_TOKEN=\s*$/m);
    const hasAnthropic = envContent.includes('ANTHROPIC_API_KEY=') && !envContent.match(/ANTHROPIC_API_KEY=\s*$/m);
    
    if (hasGemini || hasReplicate || hasAnthropic) {
        console.log('\n✅ API keys detected in .env file:');
        if (hasGemini) console.log('   - Gemini API key configured');
        if (hasReplicate) console.log('   - Replicate API token configured');
        if (hasAnthropic) console.log('   - Anthropic API key configured');
        console.log('\n🔄 If the server is still not detecting keys, restart it with: npm start');
    } else {
        console.log('\n⚠️ No API keys found in .env file');
        console.log('Please add your API keys to the .env file as shown above.');
    }
} else {
    console.log('\n❌ .env file not found!');
    console.log('Please make sure you are running this from the NameForgeAI directory.');
}

console.log('\n🌐 Get API Keys:');
console.log('- Gemini: https://makersuite.google.com/app/apikey');
console.log('- Replicate: https://replicate.com/account/api-tokens');
console.log('- Anthropic: https://console.anthropic.com/');

console.log('\n🚀 After adding keys:');
console.log('1. Save the .env file');
console.log('2. Restart server: npm start');
console.log('3. Test at: http://localhost:3000');
console.log('4. Admin panel: http://localhost:3000/admin.html');
