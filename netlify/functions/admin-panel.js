// Admin Panel for API Management - Secure Backend
const crypto = require('crypto');

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
        // Parse request body
        let body;
        try {
            body = JSON.parse(event.body);
        } catch (e) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Invalid JSON',
                    message: 'Request body must be valid JSON'
                })
            };
        }

        const { action, adminCode } = body;

        // Admin code validation (you'll provide this)
        const ADMIN_CODE = process.env.ADMIN_CODE || 'TEMP_CODE_12345';
        
        if (!adminCode || adminCode !== ADMIN_CODE) {
            console.log(`❌ Invalid admin access attempt: ${adminCode}`);
            return {
                statusCode: 403,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Access denied',
                    message: 'Invalid admin code'
                })
            };
        }

        console.log(`🔐 Admin access granted for action: ${action}`);

        switch (action) {
            case 'status':
                return await getAPIStatus(headers);
            
            case 'test-gemini':
                return await testGeminiAPI(headers);
            
            case 'test-replicate':
                return await testReplicateAPI(headers);
                
            case 'switch-primary':
                return await switchPrimaryAPI(body.primaryAPI, headers);
                
            default:
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'Invalid action',
                        message: 'Supported actions: status, test-gemini, test-replicate, switch-primary'
                    })
                };
        }

    } catch (error) {
        console.error('❌ Admin panel error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Server error',
                message: 'Internal server error occurred'
            })
        };
    }
};

// Get current API status
async function getAPIStatus(headers) {
    const status = {
        timestamp: new Date().toISOString(),
        apis: {
            gemini: {
                configured: !!process.env.GEMINI_API_KEY,
                keyPresent: process.env.GEMINI_API_KEY ? `${process.env.GEMINI_API_KEY.substring(0, 8)}...` : 'Not set',
                url: process.env.GEMINI_API_URL || 'Default URL'
            },
            replicate: {
                configured: !!process.env.REPLICATE_API_TOKEN,
                keyPresent: process.env.REPLICATE_API_TOKEN ? `${process.env.REPLICATE_API_TOKEN.substring(0, 8)}...` : 'Not set'
            }
        },
        environment: {
            nodeVersion: process.version,
            platform: process.platform
        }
    };

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            success: true,
            data: status
        })
    };
}

// Test Gemini API connection
async function testGeminiAPI(headers) {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const GEMINI_API_URL = process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    
    if (!GEMINI_API_KEY) {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: false,
                test: 'gemini',
                result: 'API key not configured'
            })
        };
    }

    try {
        const testPrompt = {
            contents: [{
                parts: [{
                    text: "Generate one creative business name for a coffee shop. Format: 1. Name - Description"
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 200
            }
        };

        const fetch = require('node-fetch');
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testPrompt),
            timeout: 10000
        });

        if (response.ok) {
            const data = await response.json();
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    test: 'gemini',
                    result: 'API connection successful',
                    details: 'Gemini API is responding correctly'
                })
            };
        } else {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: false,
                    test: 'gemini',
                    result: 'API connection failed',
                    details: `HTTP ${response.status}: ${response.statusText}`
                })
            };
        }

    } catch (error) {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: false,
                test: 'gemini',
                result: 'API test failed',
                details: error.message
            })
        };
    }
}

// Test Replicate API connection
async function testReplicateAPI(headers) {
    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
    
    if (!REPLICATE_API_TOKEN) {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: false,
                test: 'replicate',
                result: 'API token not configured'
            })
        };
    }

    try {
        const Replicate = require('replicate');
        const replicate = new Replicate({
            auth: REPLICATE_API_TOKEN,
        });

        // Test with a simple prompt
        const input = {
            prompt: "Generate one creative business name for a coffee shop",
            max_new_tokens: 50,
            temperature: 0.7
        };

        let response = '';
        let hasResponse = false;
        
        // Set timeout for the test
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Test timeout after 15 seconds')), 15000);
        });

        const testPromise = (async () => {
            for await (const event of replicate.stream("meta/llama-2-7b-chat", { input })) {
                response += event;
                hasResponse = true;
                // Break after getting some response for testing
                if (response.length > 20) break;
            }
        })();

        await Promise.race([testPromise, timeoutPromise]);

        if (hasResponse) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    test: 'replicate',
                    result: 'API connection successful',
                    details: 'Replicate API is responding correctly'
                })
            };
        } else {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: false,
                    test: 'replicate',
                    result: 'No response received',
                    details: 'API did not return any data'
                })
            };
        }

    } catch (error) {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: false,
                test: 'replicate',
                result: 'API test failed',
                details: error.message
            })
        };
    }
}

// Switch primary API (for future implementation)
async function switchPrimaryAPI(primaryAPI, headers) {
    const validAPIs = ['gemini', 'replicate'];
    
    if (!validAPIs.includes(primaryAPI)) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Invalid API',
                message: 'Primary API must be either "gemini" or "replicate"'
            })
        };
    }

    // For now, just return success - you can implement actual switching logic later
    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            success: true,
            action: 'switch-primary',
            result: `Primary API preference noted: ${primaryAPI}`,
            details: 'API switching functionality can be implemented based on your needs'
        })
    };
}
