const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

// Generate business names endpoint
router.post('/generate-names', async (req, res) => {
    try {
        const { description } = req.body;
        
        if (!description || description.trim().length < 3) {
            return res.status(400).json({
                error: 'Business description is required and must be at least 3 characters'
            });
        }

        console.log(`🎯 Generating names for: "${description}"`);
        
        // Generate fallback names (simple but working)
        const fallbackNames = generateFallbackNames(description.trim());
        res.json({
            success: true,
            names: fallbackNames,
            source: 'simple-generator'
        });
        
    } catch (error) {
        console.error('❌ Error in generate-names:', error);
        res.status(500).json({
            error: 'Generation failed',
            message: 'Unable to generate business names at this time'
        });
    }
});

// Simple name generation
function generateFallbackNames(description) {
    console.log('🎲 Generating simple names');
    
    const keywords = description.toLowerCase().split(' ').filter(word => word.length > 2);
    const prefixes = ['Pro', 'Elite', 'Prime', 'Smart', 'Swift', 'Bold', 'Next', 'Peak', 'Core', 'Max'];
    const suffixes = ['Hub', 'Works', 'Lab', 'Studio', 'Co', 'Solutions', 'Group', 'Partners', 'Plus', 'Zone'];
    
    const names = [];
    const usedNames = new Set();
    
    for (let i = 0; i < 12 && names.length < 6; i++) {
        const prefix = prefixes[i % prefixes.length];
        const suffix = suffixes[i % suffixes.length];
        const keyword = keywords[0] ? keywords[0].charAt(0).toUpperCase() + keywords[0].slice(1) : 'Business';
        
        let name;
        switch (i % 6) {
            case 0: name = `${prefix}${keyword}`; break;
            case 1: name = `${keyword}${suffix}`; break;
            case 2: name = `${prefix} ${suffix}`; break;
            case 3: name = `${keyword} ${prefix}`; break;
            case 4: name = `${suffix} ${keyword}`; break;
            default: name = `${prefix} ${keyword} ${suffix}`;
        }
        
        if (!usedNames.has(name.toLowerCase())) {
            usedNames.add(name.toLowerCase());
            names.push({
                name: name,
                description: `Professional name for ${description.substring(0, 50)}`
            });
        }
    }
    
    return names;
}

// Admin panel endpoint - SIMPLE VERSION
router.post('/admin', async (req, res) => {
    try {
        const { action, adminCode, apiKey, model, apiUrl } = req.body;
        
        // Simple admin code check
        if (adminCode !== 'TEMP_CODE_12345') {
            return res.status(401).json({
                success: false,
                message: 'Invalid admin code'
            });
        }
        
        switch (action) {
            case 'status':
                res.json({
                    success: true,
                    message: 'Admin panel working',
                    data: {
                        timestamp: new Date().toISOString(),
                        status: 'online'
                    }
                });
                break;
                
            case 'test-gemini':
                if (!apiKey) {
                    return res.json({ success: false, message: 'API key required' });
                }
                
                try {
                    const testUrl = apiUrl || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
                    const response = await fetch(`${testUrl}?key=${apiKey}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: 'Hello, test message' }] }]
                        })
                    });
                    
                    if (response.ok) {
                        res.json({ success: true, message: 'Gemini API working!' });
                    } else {
                        res.json({ success: false, message: 'Gemini API failed' });
                    }
                } catch (error) {
                    res.json({ success: false, message: 'Gemini test failed: ' + error.message });
                }
                break;
                
            case 'test-anthropic':
                if (!apiKey) {
                    return res.json({ success: false, message: 'API key required' });
                }
                
                try {
                    const response = await fetch('https://api.anthropic.com/v1/messages', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-api-key': apiKey,
                            'anthropic-version': '2023-06-01'
                        },
                        body: JSON.stringify({
                            model: model || 'claude-3-5-sonnet-20241022',
                            max_tokens: 100,
                            messages: [{ role: 'user', content: 'Hello, test message' }]
                        })
                    });
                    
                    if (response.ok) {
                        res.json({ success: true, message: 'Anthropic API working!' });
                    } else {
                        res.json({ success: false, message: 'Anthropic API failed' });
                    }
                } catch (error) {
                    res.json({ success: false, message: 'Anthropic test failed: ' + error.message });
                }
                break;
                
            case 'test-replicate':
                if (!apiKey) {
                    return res.json({ success: false, message: 'API key required' });
                }
                
                try {
                    const response = await fetch('https://api.replicate.com/v1/predictions', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Token ${apiKey}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            version: model || 'meta/llama-2-7b-chat',
                            input: { prompt: 'Hello, test message' }
                        })
                    });
                    
                    if (response.ok) {
                        res.json({ success: true, message: 'Replicate API working!' });
                    } else {
                        res.json({ success: false, message: 'Replicate API failed' });
                    }
                } catch (error) {
                    res.json({ success: false, message: 'Replicate test failed: ' + error.message });
                }
                break;
                
            default:
                res.json({ success: false, message: 'Unknown action' });
        }
        
    } catch (error) {
        console.error('Admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Admin operation failed'
        });
    }
});

// Health check
router.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

module.exports = router;
