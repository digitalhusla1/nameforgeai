// Admin Panel Access Tool
// Usage: node admin-tool.js [action] [admin-code]

const fetch = require('node-fetch');

async function adminAccess(action = 'status', adminCode = 'SET_YOUR_CODE') {
    const url = 'https://nameforgeai.netlify.app/.netlify/functions/admin-panel';
    
    console.log(`🔐 Admin Panel Access`);
    console.log(`📝 Action: ${action}`);
    console.log(`🔒 Code: ${adminCode.substring(0, 3)}***`);
    
    if (adminCode === 'SET_YOUR_CODE') {
        console.log('⚠️ Please set your admin code!');
        console.log('Usage: node admin-tool.js [action] [admin-code]');
        console.log('Example: node admin-tool.js status MyCode123');
        return;
    }
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, adminCode })
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Success!');
            console.log('📊 Result:', JSON.stringify(result, null, 2));
        } else {
            console.log('❌ Failed:', result.message || 'Unknown error');
        }
        
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

const [action, adminCode] = process.argv.slice(2);
adminAccess(action, adminCode);
