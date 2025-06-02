// API Testing Function for Netlify Environment

exports.handler = async (event, context) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({
                error: 'Method not allowed',
                message: 'Only POST requests are allowed'
            })
        };
    }

    try {
        const { service, apiKey } = JSON.parse(event.body);

        console.log(`Testing ${service} API...`);

        if (!service || !apiKey) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    message: 'Service and API key are required'
                })
            };
        }

        let testResult = false;
        let errorMessage = '';

        // Test the specific service
        switch (service) {
            case 'gemini':
                testResult = await testGeminiAPI(apiKey);
                break;
            case 'anthropic':
                testResult = await testAnthropicAPI(apiKey);
                break;
            case 'replicate':
                testResult = await testReplicateAPI(apiKey);
                break;
            default:
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        message: 'Invalid service specified'
                    })
                };
        }

        if (testResult.success) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: `${service} API test successful`,
                    data: testResult.data
                })
            };
        } else {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    message: testResult.message || `${service} API test failed`
                })
            };
        }

    } catch (error) {
        console.error('API test error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                message: 'Internal server error during API test',
                error: error.message
            })
        };
    }
};

// Test Gemini API
async function testGeminiAPI(apiKey) {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: "Test connection. Please respond with 'API test successful'"
                    }]
                }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            return {
                success: false,
                message: `Gemini API error: ${errorData.error?.message || 'Unknown error'}`
            };
        }

        const data = await response.json();
        return {
            success: true,
            message: 'Gemini API connection successful',
            data: data.candidates?.[0]?.content?.parts?.[0]?.text || 'Test successful'
        };
    } catch (error) {
        return {
            success: false,
            message: `Gemini API test failed: ${error.message}`
        };
    }
}

// Test Anthropic API
async function testAnthropicAPI(apiKey) {
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-haiku-20240307',
                max_tokens: 100,
                messages: [{
                    role: 'user',
                    content: "Test connection. Please respond with 'API test successful'"
                }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            return {
                success: false,
                message: `Anthropic API error: ${errorData.error?.message || 'Unknown error'}`
            };
        }

        const data = await response.json();
        return {
            success: true,
            message: 'Anthropic API connection successful',
            data: data.content?.[0]?.text || 'Test successful'
        };
    } catch (error) {
        return {
            success: false,
            message: `Anthropic API test failed: ${error.message}`
        };
    }
}

// Test Replicate API
async function testReplicateAPI(apiKey) {
    try {
        // Simple model list request to test authentication
        const response = await fetch('https://api.replicate.com/v1/models', {
            method: 'GET',
            headers: {
                'Authorization': `Token ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            return {
                success: false,
                message: `Replicate API error: ${errorData.detail || 'Authentication failed'}`
            };
        }

        const data = await response.json();
        return {
            success: true,
            message: 'Replicate API connection successful',
            data: `Found ${data.results?.length || 0} models`
        };
    } catch (error) {
        return {
            success: false,
            message: `Replicate API test failed: ${error.message}`
        };
    }
}
