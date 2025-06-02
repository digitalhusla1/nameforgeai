const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Function to update .env file with new API key
function updateEnvFile(apiType, apiKey) {
    try {
        const envPath = path.join(__dirname, '..', '.env');
        
        // Read current .env file content
        let envContent = '';
        if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, 'utf8');
        }
        
        // Determine the environment variable name
        let envVarName = '';
        switch (apiType) {
            case 'gemini':
                envVarName = 'GEMINI_API_KEY';
                break;
            case 'anthropic':
                envVarName = 'ANTHROPIC_API_KEY';
                break;
            case 'replicate':
                envVarName = 'REPLICATE_API_TOKEN';
                break;
            default:
                throw new Error('Unknown API type');
        }
        
        // Update or add the API key
        const envVarPattern = new RegExp(`^${envVarName}=.*$`, 'm');
        const newEnvLine = `${envVarName}=${apiKey}`;
        
        if (envVarPattern.test(envContent)) {
            // Replace existing line
            envContent = envContent.replace(envVarPattern, newEnvLine);
        } else {
            // Add new line if it doesn't exist
            envContent += `\n${newEnvLine}\n`;
        }
        
        // Write updated content back to .env file
        fs.writeFileSync(envPath, envContent, 'utf8');
        
        // Update process.env immediately for current session
        process.env[envVarName] = apiKey;
        
        return true;
    } catch (error) {
        console.error('Error updating .env file:', error);
        return false;
    }
}

// AI-powered name generation with Gemini
async function generateNamesWithAI(description, apiKey) {
    const apiUrl = process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    
    const prompt = `Generate 10 creative and professional business names for: "${description}"

Requirements:
- Names should be memorable, brandable, and professional
- Include a mix of creative and descriptive names
- Avoid generic or overly complex names
- Names should be suitable for the business type described
- Each name should be unique and distinctive

Return the response as a JSON array with this exact format:
[
  {"name": "Example Name", "description": "Brief explanation of why this name works"},
  {"name": "Another Name", "description": "Brief explanation of why this name works"}
]

Only return the JSON array, no other text.`;

    const response = await fetch(`${apiUrl}?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: prompt
                }]
            }]
        })
    });

    if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response from Gemini API');
    }

    const text = data.candidates[0].content.parts[0].text;
    
    try {
        // Extract JSON from the response
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error('No JSON array found in response');
        }
        
        const names = JSON.parse(jsonMatch[0]);
        
        // Validate the structure
        if (!Array.isArray(names) || names.length === 0) {
            throw new Error('Invalid names array structure');
        }
        
        // Ensure each name has the required properties
        return names.map(item => ({
            name: item.name || 'Generated Name',
            description: item.description || 'AI-generated business name'
        })).slice(0, 10); // Limit to 10 names
          } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        throw new Error('Failed to parse AI-generated names');
    }
}

// AI-powered name generation with Replicate (Direct REST API)
async function generateNamesWithReplicate(description, apiKey) {
    try {
        console.log('🔑 Replicate REST API approach starting...');
        
        if (!apiKey) {
            throw new Error('Replicate API key not provided');
        }
        
        const prompt = `Generate exactly 10 creative and professional business names for: "${description}"

Requirements:
- Names should be memorable, brandable, and professional
- Include a mix of creative and descriptive names
- Avoid generic or overly complex names
- Names should be suitable for the business type described
- Each name should be unique and distinctive

Format your response as a numbered list:
1. BusinessName - Brief explanation of why this name works
2. AnotherName - Brief explanation of why this name works
3. ThirdName - Brief explanation of why this name works
(continue for all 10 names)

Only return the numbered list, no other text.`;

        console.log('🔄 Creating Replicate prediction...');
        
        // Step 1: Create a prediction using Replicate REST API
        const createResponse = await fetch('https://api.replicate.com/v1/predictions', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${apiKey}`,
                'Content-Type': 'application/json',
                'User-Agent': 'NameForgeAI/1.0'
            },
            body: JSON.stringify({
                version: "13c3cdee13ee059ab779f0291d29054dab00a47dad8261375654de5540165fb0", // meta/llama-2-7b-chat
                input: {
                    prompt: prompt,
                    max_new_tokens: 800,
                    temperature: 0.75,
                    top_p: 0.9,
                    repetition_penalty: 1.1
                }
            })
        });

        if (!createResponse.ok) {
            const errorText = await createResponse.text();
            console.error('❌ Failed to create prediction:', createResponse.status, errorText);
            throw new Error(`Failed to create prediction: ${createResponse.status} ${createResponse.statusText}`);
        }

        const prediction = await createResponse.json();
        console.log('✅ Prediction created:', prediction.id);

        // Step 2: Poll for completion
        let pollAttempts = 0;
        const maxPollAttempts = 60; // 5 minutes max (5 second intervals)
        
        while (pollAttempts < maxPollAttempts) {
            console.log(`🔄 Polling attempt ${pollAttempts + 1}/${maxPollAttempts}...`);
            
            const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
                headers: {
                    'Authorization': `Token ${apiKey}`,
                    'User-Agent': 'NameForgeAI/1.0'
                }
            });

            if (!pollResponse.ok) {
                throw new Error(`Failed to poll prediction: ${pollResponse.status} ${pollResponse.statusText}`);
            }

            const pollResult = await pollResponse.json();
            
            if (pollResult.status === 'succeeded') {
                console.log('✅ Prediction completed successfully');
                
                // Step 3: Process the output
                const output = pollResult.output;
                const outputText = Array.isArray(output) ? output.join('') : output;
                
                console.log('📝 Processing generated text...');
                
                // Parse the numbered list response
                const lines = outputText.split('\n').filter(line => line.trim());
                const names = [];
                
                lines.forEach((line) => {
                    // Match numbered list format: "1. Name - Description"
                    const match = line.match(/^\d+\.\s*([^-]+?)\s*-\s*(.+)$/);
                    if (match && match[1] && match[2]) {
                        const name = match[1].trim();
                        const description = match[2].trim();
                        
                        // Validate that name looks like a business name
                        if (name.length > 1 && name.length < 50 && /^[A-Za-z0-9\s&.-]+$/.test(name)) {
                            names.push({ name, description });
                        }
                    }
                });
                
                if (names.length === 0) {
                    throw new Error('Failed to parse names from Replicate response');
                }
                
                console.log(`✅ Successfully parsed ${names.length} names from Replicate`);
                return names.slice(0, 10); // Limit to 10 names
                
            } else if (pollResult.status === 'failed') {
                throw new Error(`Prediction failed: ${pollResult.error || 'Unknown error'}`);
            } else if (pollResult.status === 'canceled') {
                throw new Error('Prediction was canceled');
            }
            
            // Still processing, wait and try again
            pollAttempts++;
            if (pollAttempts < maxPollAttempts) {
                await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
            }
        }
        
        throw new Error('Prediction timed out after 5 minutes');
        
    } catch (error) {
        console.error('❌ Replicate REST API error:', error.message);
        throw new Error(`Replicate API failed: ${error.message}`);
    }
}

// AI-powered name generation with Anthropic Claude
async function generateNamesWithAnthropic(description, apiKey) {
    const prompt = `Generate exactly 10 creative and professional business names for: "${description}"

Requirements:
- Names should be memorable, brandable, and professional
- Include a mix of creative and descriptive names
- Avoid generic or overly complex names
- Names should be suitable for the business type described
- Each name should be unique and distinctive

Return the response as a JSON array with this exact format:
[
  {"name": "Example Name", "description": "Brief explanation of why this name works"},
  {"name": "Another Name", "description": "Brief explanation of why this name works"}
]

Only return the JSON array, no other text.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 2000,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ]
        })
    });

    if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.content || !data.content[0] || !data.content[0].text) {
        throw new Error('Invalid response from Anthropic API');
    }

    const text = data.content[0].text;
    
    try {
        // Extract JSON from the response
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error('No JSON array found in Anthropic response');
        }
        
        const names = JSON.parse(jsonMatch[0]);
        
        // Validate the structure
        if (!Array.isArray(names) || names.length === 0) {
            throw new Error('Invalid names array structure from Anthropic');
        }
        
        // Ensure each name has the required properties
        return names.map(item => ({
            name: item.name || 'Generated Name',
            description: item.description || 'AI-generated business name'
        })).slice(0, 10); // Limit to 10 names
        
    } catch (parseError) {
        console.error('Error parsing Anthropic response:', parseError);
        throw new Error('Failed to parse Anthropic-generated names');
    }
}

// Generate business names endpoint
router.post('/generate-names', async (req, res) => {
    try {
        const { description } = req.body;
        
        if (!description || description.trim().length < 3) {
            return res.status(400).json({
                error: 'Business description is required and must be at least 3 characters'
            });
        }        console.log(`🎯 Generating names for: "${description}"`);
        
        // Check which API services are configured and prioritize based on availability
        const geminiApiKey = process.env.GEMINI_API_KEY;
        const replicateApiKey = process.env.REPLICATE_API_TOKEN;
        const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
        
        console.log('🔍 Checking available APIs:', {
            gemini: !!geminiApiKey,
            replicate: !!replicateApiKey,
            anthropic: !!anthropicApiKey
        });
        
        if (!geminiApiKey && !replicateApiKey && !anthropicApiKey) {
            console.error('❌ No AI API keys configured');
            return res.status(503).json({
                error: 'Service unavailable',
                message: 'No AI services are configured. Please use the admin panel to configure an API key.'
            });
        }
        
        // Try APIs in order of availability (admin can control which ones are set)
        const availableAPIs = [];
        if (geminiApiKey) availableAPIs.push({ name: 'gemini', key: geminiApiKey, fn: generateNamesWithAI });
        if (anthropicApiKey) availableAPIs.push({ name: 'anthropic', key: anthropicApiKey, fn: generateNamesWithAnthropic });
        if (replicateApiKey) availableAPIs.push({ name: 'replicate', key: replicateApiKey, fn: generateNamesWithReplicate });
        
        console.log(`🚀 Will try ${availableAPIs.length} API(s): ${availableAPIs.map(api => api.name).join(', ')}`);
        
        // Try each available API
        for (const api of availableAPIs) {
            try {
                console.log(`🔄 Trying ${api.name} API...`);
                const aiNames = await api.fn(description.trim(), api.key);
                console.log(`✅ ${api.name} AI generation successful`);
                return res.json({
                    success: true,
                    names: aiNames,
                    source: `${api.name}-ai`,
                    message: `Generated using ${api.name.charAt(0).toUpperCase() + api.name.slice(1)} AI`
                });
            } catch (apiError) {
                console.warn(`⚠️ ${api.name} AI failed:`, apiError.message);
                // Continue to next API
            }
        }
        
        // All available APIs failed
        console.error('❌ All configured AI services failed');
        return res.status(500).json({
            error: 'All AI services failed',
            message: 'Unable to generate business names. All configured AI services are currently unavailable.',
            availableServices: availableAPIs.map(api => api.name)
        });
        
    } catch (error) {
        console.error('❌ Error in generate-names:', error);
        res.status(500).json({
            error: 'Generation failed',
            message: 'Unable to generate business names at this time'
        });
    }
});

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
                break;            case 'test-replicate':
                if (!apiKey) {
                    return res.json({ success: false, message: 'API key required' });
                }
                
                try {
                    console.log('🧪 Testing Replicate API with REST approach...');
                    
                    const response = await fetch('https://api.replicate.com/v1/predictions', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Token ${apiKey}`,
                            'Content-Type': 'application/json',
                            'User-Agent': 'NameForgeAI/1.0'
                        },
                        body: JSON.stringify({
                            version: "13c3cdee13ee059ab779f0291d29054dab00a47dad8261375654de5540165fb0", // meta/llama-2-7b-chat
                            input: {
                                prompt: 'Hello, this is a test message. Please respond briefly.',
                                max_new_tokens: 50,
                                temperature: 0.5
                            }
                        })
                    });
                    
                    if (response.ok) {
                        const result = await response.json();
                        console.log('✅ Replicate test prediction created:', result.id);
                        res.json({ 
                            success: true, 
                            message: 'Replicate API working! Prediction created successfully.',
                            predictionId: result.id 
                        });
                    } else {
                        const errorText = await response.text();
                        console.error('❌ Replicate test failed:', response.status, errorText);
                        res.json({ 
                            success: false, 
                            message: `Replicate API failed: ${response.status} ${response.statusText}`,
                            details: errorText 
                        });
                    }
                } catch (error) {
                    console.error('❌ Replicate test error:', error);
                    res.json({ success: false, message: 'Replicate test failed: ' + error.message });
                }
                break;
                  case 'set-api-key':
                const { apiType, key } = req.body;
                
                if (!apiType || !key) {
                    return res.json({ success: false, message: 'API type and key are required' });
                }
                
                // Validate API key format first
                let isValid = false;
                let message = '';
                
                switch (apiType) {
                    case 'gemini':
                        isValid = key.length > 20;
                        message = isValid ? 'Gemini API key format appears valid' : 'Invalid Gemini API key format';
                        break;
                    case 'anthropic':
                        isValid = key.startsWith('sk-ant-');
                        message = isValid ? 'Anthropic API key format appears valid' : 'Anthropic API keys should start with "sk-ant-"';
                        break;
                    case 'replicate':
                        isValid = key.startsWith('r8_') && key.length > 20;
                        message = isValid ? 'Replicate API token format appears valid' : 'Replicate API tokens should start with "r8_"';
                        break;
                    default:
                        return res.json({ success: false, message: 'Unknown API type' });
                }
                
                if (!isValid) {
                    return res.json({ success: false, message: message });
                }
                
                // Save API key to .env file
                console.log(`💾 Saving ${apiType} API key to .env file...`);
                const saveSuccess = updateEnvFile(apiType, key);
                
                if (saveSuccess) {
                    console.log(`✅ ${apiType} API key saved successfully`);
                    res.json({
                        success: true,
                        message: `${message}. API key has been saved and is now active!`,
                        note: 'API key saved to .env file and loaded into current session. You can start generating business names immediately!'
                    });
                } else {
                    console.error(`❌ Failed to save ${apiType} API key`);
                    res.json({
                        success: false,
                        message: 'Failed to save API key to .env file. Please check file permissions.',
                        note: 'The API key format is valid but could not be saved to the configuration file.'
                    });
                }
                break;
                
            case 'get-active-apis':
                const activeAPIs = {
                    gemini: !!process.env.GEMINI_API_KEY,
                    anthropic: !!process.env.ANTHROPIC_API_KEY,
                    replicate: !!process.env.REPLICATE_API_TOKEN
                };
                
                res.json({
                    success: true,
                    activeAPIs: activeAPIs,
                    primaryAPI: process.env.GEMINI_API_KEY ? 'gemini' : 
                              process.env.ANTHROPIC_API_KEY ? 'anthropic' :
                              process.env.REPLICATE_API_TOKEN ? 'replicate' : 'none',
                    message: 'Currently active API configurations'
                });
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

// System status endpoint
router.get('/status', (req, res) => {
    const hasGeminiKey = !!process.env.GEMINI_API_KEY;
    const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY;
    const hasReplicateKey = !!process.env.REPLICATE_API_TOKEN;
    
    const configuredAPIs = [];
    if (hasGeminiKey) configuredAPIs.push('gemini');
    if (hasAnthropicKey) configuredAPIs.push('anthropic');
    if (hasReplicateKey) configuredAPIs.push('replicate');
    
    const primaryAPI = hasGeminiKey ? 'gemini' : 
                      hasAnthropicKey ? 'anthropic' :
                      hasReplicateKey ? 'replicate' : 'none';
    
    res.json({
        success: true,
        status: {
            server: 'online',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            nodeVersion: process.version,
            environment: process.env.NODE_ENV || 'development',
            features: {
                aiGeneration: configuredAPIs.length > 0,
                fallbackGeneration: false,
                multipleAIProviders: configuredAPIs.length > 1,
                encryption: false, // Encryption disabled
                adminPanel: true
            },
            apiKeys: {
                gemini: hasGeminiKey ? 'configured' : 'missing',
                anthropic: hasAnthropicKey ? 'configured' : 'missing',
                replicate: hasReplicateKey ? 'configured' : 'missing'
            },
            activeAPIs: configuredAPIs,
            primaryAPI: primaryAPI,
            serviceStatus: configuredAPIs.length > 0 ? 'ready' : 'configuration_required',
            aiServiceCount: configuredAPIs.length
        }
    });
});

// Health check
router.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

module.exports = router;
