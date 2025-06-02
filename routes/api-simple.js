const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

// Utility to mask API key for logging (show only first 8 and last 4 characters)
function maskApiKey(apiKey) {
    if (!apiKey || apiKey.length < 12) return '***masked***';
    return apiKey.substring(0, 8) + '...' + apiKey.substring(apiKey.length - 4);
}

// Validation middleware
const validateBusinessDescription = (req, res, next) => {
    const { description } = req.body;
    
    if (!description) {
        return res.status(400).json({
            error: 'Validation error',
            message: 'Business description is required'
        });
    }
    
    if (typeof description !== 'string') {
        return res.status(400).json({
            error: 'Validation error',
            message: 'Business description must be a string'
        });
    }
    
    if (description.trim().length < 3) {
        return res.status(400).json({
            error: 'Validation error',
            message: 'Business description must be at least 3 characters long'
        });
    }
    
    if (description.length > 500) {
        return res.status(400).json({
            error: 'Validation error',
            message: 'Business description must be less than 500 characters'
        });
    }
    
    // Sanitize input
    req.body.description = description.trim().replace(/[<>]/g, '');
    next();
};

// Generate business names endpoint
router.post('/generate-names', validateBusinessDescription, async (req, res) => {
    try {
        const { description } = req.body;
        
        console.log(`🎯 Generating names for: "${description}"`);
        
        // Try Gemini API first
        const names = await callGeminiAPI(description);
        
        if (names && names.length > 0) {
            console.log(`✅ Successfully generated ${names.length} names`);
            res.json({
                success: true,
                names: names,
                source: 'gemini-api'
            });
        } else {
            // Fallback to local generation
            console.log('🔄 Using fallback name generation');
            const fallbackNames = generateFallbackNames(description);
            res.json({
                success: true,
                names: fallbackNames,
                source: 'fallback',
                message: 'Generated using fallback method due to API unavailability'
            });
        }
        
    } catch (error) {
        console.error('❌ Error in generate-names:', error);
        
        // Always provide fallback names
        try {
            const fallbackNames = generateFallbackNames(req.body.description);
            res.json({
                success: true,
                names: fallbackNames,
                source: 'fallback',
                message: 'Generated using fallback method due to API error'
            });
        } catch (fallbackError) {
            console.error('❌ Fallback generation failed:', fallbackError);
            res.status(500).json({
                error: 'Generation failed',
                message: 'Unable to generate business names at this time'
            });
        }
    }
});

// Gemini API function
async function callGeminiAPI(description) {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const GEMINI_API_URL = process.env.GEMINI_API_URL;
    
    if (!GEMINI_API_KEY) {
        console.warn('⚠️ GEMINI_API_KEY not found in environment variables');
        return null;
    }
    
    const prompt = `Generate 6 creative and professional business names for: "${description}". 

For each name, provide a brief explanation of why it works well for this business type.

Please format your response exactly like this:
1. BusinessName - Brief explanation of why this name works
2. AnotherName - Brief explanation of why this name works
3. ThirdName - Brief explanation of why this name works
4. FourthName - Brief explanation of why this name works
5. FifthName - Brief explanation of why this name works
6. SixthName - Brief explanation of why this name works

Make sure the names are memorable, relevant, professional, and easy to pronounce.`;

    const requestBody = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
            topP: 0.8,
            topK: 40
        }
    };

    try {
        console.log('🔄 Calling Gemini API...');
        
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            timeout: 30000 // 30 seconds timeout
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Gemini API Error:', response.status, errorText);
            return null;
        }

        const data = await response.json();
        
        if (!data.candidates || data.candidates.length === 0) {
            console.warn('⚠️ No candidates returned from Gemini API');
            return null;
        }
        
        if (!data.candidates[0].content || !data.candidates[0].content.parts || data.candidates[0].content.parts.length === 0) {
            console.warn('⚠️ Invalid response structure from Gemini API');
            return null;
        }
        
        const generatedText = data.candidates[0].content.parts[0].text;
        console.log('📝 Generated text received');
        
        const parsedNames = parseTextResponse(generatedText);
        
        if (parsedNames.length === 0) {
            console.warn('⚠️ Failed to parse names from Gemini response');
            return null;
        }
        
        return parsedNames;
        
    } catch (error) {
        console.error('❌ Gemini API fetch error:', error.message);
        return null;
    }
}

// Parse Gemini API response
function parseTextResponse(text) {
    const lines = text.split('\n').filter(line => line.trim());
    const names = [];
    
    lines.forEach((line, index) => {
        // Try multiple patterns to match the response format
        let match = line.match(/^\d+\.\s*([^-]+?)\s*-\s*(.+)$/);
        if (!match) {
            match = line.match(/^([A-Z][a-zA-Z\s&]+?)\s*-\s*(.+)$/);
        }
        if (!match) {
            match = line.match(/^\*\s*([^-]+?)\s*-\s*(.+)$/);
        }
        
        if (match && match[1] && match[2]) {
            const name = match[1].trim();
            const description = match[2].trim();
            
            // Validate that name looks like a business name
            if (name.length > 1 && name.length < 50 && /^[A-Za-z0-9\s&.-]+$/.test(name)) {
                names.push({ name, description });
            }
        }
    });
    
    return names.slice(0, 6);
}

// Fallback name generation
function generateFallbackNames(description) {
    console.log('🎲 Generating fallback names');
    
    const keywords = description.toLowerCase().split(' ').filter(word => word.length > 2);
    const prefixes = ['Pro', 'Elite', 'Prime', 'Smart', 'Swift', 'Bold', 'Next', 'Peak', 'Core', 'Max'];
    const suffixes = ['Hub', 'Works', 'Lab', 'Studio', 'Co', 'Solutions', 'Group', 'Partners', 'Plus', 'Zone'];
    const connectors = ['', ' ', '-'];
    
    const names = [];
    const usedNames = new Set();
    
    // Generate creative combinations
    for (let i = 0; i < 12 && names.length < 6; i++) {
        const prefix = prefixes[i % prefixes.length];
        const suffix = suffixes[i % suffixes.length];
        const keyword = keywords[0] ? keywords[0].charAt(0).toUpperCase() + keywords[0].slice(1) : 'Business';
        const connector = connectors[i % connectors.length];
        
        let name;
        switch (i % 6) {
            case 0:
                name = `${prefix}${keyword}`;
                break;
            case 1:
                name = `${keyword}${suffix}`;
                break;
            case 2:
                name = `${prefix}${connector}${suffix}`;
                break;
            case 3:
                name = `${keyword}${connector}${prefixes[(i+1) % prefixes.length]}`;
                break;
            case 4:
                name = `${suffixes[(i+2) % suffixes.length]}${connector}${keyword}`;
                break;
            default:
                name = `${prefix}${connector}${keyword}${connector}${suffix}`;
        }
        
        // Avoid duplicates
        if (!usedNames.has(name.toLowerCase())) {
            usedNames.add(name.toLowerCase());
            names.push({
                name: name,
                description: `A professional name that combines creativity with your business focus on ${description.substring(0, 50)}${description.length > 50 ? '...' : ''}`
            });
        }
    }
    
    return names;
}

// Admin panel endpoint
router.post('/admin', async (req, res) => {
    try {
        const { action, adminCode } = req.body;
        
        // Verify admin code
        const validAdminCode = process.env.ADMIN_CODE || 'TEMP_CODE_12345';
        if (adminCode !== validAdminCode) {
            return res.status(401).json({
                success: false,
                error: 'Invalid admin code',
                message: 'Authentication failed'
            });
        }
        
        switch (action) {
            case 'status':
                // Return system status
                res.json({
                    success: true,
                    message: 'Authentication successful',
                    data: {
                        timestamp: new Date().toISOString(),
                        apis: {
                            gemini: {
                                configured: !!process.env.GEMINI_API_KEY,
                                keyPresent: process.env.GEMINI_API_KEY ? 'Configured' : 'Not Set'
                            },
                            anthropic: {
                                configured: false,
                                keyPresent: 'User Configured'
                            },
                            replicate: {
                                configured: !!process.env.REPLICATE_API_TOKEN,
                                keyPresent: process.env.REPLICATE_API_TOKEN ? 'Configured' : 'Not Set'
                            }
                        }
                    }
                });
                break;
                
            case 'test-gemini':
                // Test Gemini API directly with user-provided key
                try {
                    const { apiKey, apiUrl } = req.body;
                    if (!apiKey) {
                        return res.json({
                            success: false,
                            message: 'Gemini API key required for testing'
                        });
                    }
                    
                    console.log(`🔄 Testing Gemini API with key: ${maskApiKey(apiKey)}`);
                    const testResult = await testGeminiAPIWithKey(apiKey, apiUrl);
                    res.json(testResult);
                } catch (error) {
                    console.error('❌ Gemini API test error:', error.message);
                    res.json({
                        success: false,
                        message: 'Gemini API test failed',
                        details: error.message
                    });
                }
                break;
                
            case 'test-anthropic':
                // Test Anthropic API directly with user-provided key
                try {
                    const { apiKey, model } = req.body;
                    if (!apiKey) {
                        return res.json({
                            success: false,
                            message: 'Anthropic API key required for testing'
                        });
                    }
                    
                    console.log(`🔄 Testing Anthropic API with key: ${maskApiKey(apiKey)}`);
                    const testResult = await testAnthropicAPIWithKey(apiKey, model);
                    res.json(testResult);
                } catch (error) {
                    console.error('❌ Anthropic API test error:', error.message);
                    res.json({
                        success: false,
                        message: 'Anthropic API test failed',
                        details: error.message
                    });
                }
                break;
                
            case 'test-replicate':
                // Test Replicate API directly with user-provided key
                try {
                    const { apiKey, model } = req.body;
                    if (!apiKey) {
                        return res.json({
                            success: false,
                            message: 'Replicate API token required for testing'
                        });
                    }
                    
                    console.log(`🔄 Testing Replicate API with token: ${maskApiKey(apiKey)}`);
                    const testResult = await testReplicateAPIWithKey(apiKey, model);
                    res.json(testResult);
                } catch (error) {
                    console.error('❌ Replicate API test error:', error.message);
                    res.json({
                        success: false,
                        message: 'Replicate API test failed',
                        details: error.message
                    });
                }
                break;
                
            default:
                res.status(400).json({
                    success: false,
                    error: 'Invalid action',
                    message: 'Unknown action requested'
                });
        }
        
    } catch (error) {
        console.error('Admin endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Admin operation failed'
        });
    }
});

// Simple API Testing Functions (no encryption)

// Test Gemini API with user key
async function testGeminiAPIWithKey(apiKey, apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent') {
    try {
        console.log(`🔄 Making Gemini API request...`);
        
        const response = await fetch(`${apiUrl}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: 'Generate one creative business name for a coffee shop. Just the name, nothing else.'
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 100
                }
            })
        });

        const result = await response.json();
        
        if (response.ok && result.candidates) {
            const generatedText = result.candidates[0]?.content?.parts[0]?.text || 'No response';
            console.log('✅ Gemini API test successful');
            return {
                success: true,
                message: 'Gemini API test successful',
                details: `Generated: ${generatedText}`,
                result: 'API connection successful'
            };
        } else {
            console.error('❌ Gemini API error:', result.error?.message || 'Unknown error');
            return {
                success: false,
                message: 'Gemini API test failed',
                details: result.error?.message || 'API request failed',
                result: 'API connection failed'
            };
        }
    } catch (error) {
        console.error('❌ Gemini API test failed:', error.message);
        return {
            success: false,
            message: 'Gemini API test failed',
            details: error.message,
            result: 'API test failed'
        };
    }
}

// Test Anthropic API with user key
async function testAnthropicAPIWithKey(apiKey, model = 'claude-3-5-sonnet-20241022') {
    try {
        console.log(`🔄 Making Anthropic API request...`);
        
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: model,
                max_tokens: 100,
                messages: [{
                    role: 'user',
                    content: 'Generate one creative business name for a coffee shop. Just the name, nothing else.'
                }]
            })
        });

        const result = await response.json();
        
        if (response.ok && result.content) {
            const generatedText = result.content[0]?.text || 'No response';
            console.log('✅ Anthropic API test successful');
            return {
                success: true,
                message: 'Anthropic API test successful',
                details: `Generated: ${generatedText}`,
                result: 'API connection successful'
            };
        } else {
            console.error('❌ Anthropic API error:', result.error?.message || 'Unknown error');
            return {
                success: false,
                message: 'Anthropic API test failed',
                details: result.error?.message || 'API request failed',
                result: 'API connection failed'
            };
        }
    } catch (error) {
        console.error('❌ Anthropic API test failed:', error.message);
        return {
            success: false,
            message: 'Anthropic API test failed',
            details: error.message,
            result: 'API test failed'
        };
    }
}

// Test Replicate API with user key
async function testReplicateAPIWithKey(apiKey, model = 'meta/llama-2-7b-chat') {
    try {
        console.log(`🔄 Making Replicate API request...`);
        
        const response = await fetch('https://api.replicate.com/v1/predictions', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                version: model,
                input: {
                    prompt: 'Generate one creative business name for a coffee shop. Just the name, nothing else.',
                    max_new_tokens: 50
                }
            })
        });

        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ Replicate API test successful');
            return {
                success: true,
                message: 'Replicate API test successful',
                details: `Prediction created: ${result.id}`,
                result: 'API connection successful'
            };
        } else {
            console.error('❌ Replicate API error:', result.detail || 'Unknown error');
            return {
                success: false,
                message: 'Replicate API test failed',
                details: result.detail || 'API request failed',
                result: 'API connection failed'
            };
        }
    } catch (error) {
        console.error('❌ Replicate API test failed:', error.message);
        return {
            success: false,
            message: 'Replicate API test failed',
            details: error.message,
            result: 'API test failed'
        };
    }
}

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

module.exports = router;
