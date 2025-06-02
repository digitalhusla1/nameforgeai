const Replicate = require('replicate');

// Validation function
const validateBusinessDescription = (description) => {
    if (!description) {
        throw new Error('Business description is required');
    }
    
    if (typeof description !== 'string') {
        throw new Error('Business description must be a string');
    }
    
    if (description.trim().length < 3) {
        throw new Error('Business description must be at least 3 characters long');
    }
    
    if (description.length > 500) {
        throw new Error('Business description must be less than 500 characters');
    }
    
    return description.trim().replace(/[<>]/g, '');
};

// Enhanced keyword extraction function
function extractKeywords(description) {
    // Convert to lowercase and split into words
    const words = description.toLowerCase().split(/\s+/);
    
    // Common stop words to filter out
    const stopWords = new Set(['a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'with', 'will']);
    
    // Industry-specific keywords that should be prioritized
    const industryKeywords = new Set(['coffee', 'cafe', 'restaurant', 'food', 'tech', 'consulting', 'startup', 'fitness', 'health', 'beauty', 'fashion', 'retail', 'education', 'finance', 'medical', 'legal', 'creative', 'design', 'marketing', 'digital', 'software', 'app', 'web', 'mobile', 'AI', 'data', 'cloud', 'security', 'analytics', 'blockchain', 'eco', 'green', 'sustainable', 'organic', 'handmade', 'artisan', 'luxury', 'premium', 'boutique', 'studio', 'lab', 'workshop', 'academy', 'institute', 'agency', 'firm', 'group', 'solutions', 'services', 'systems']);
    
    // Extract meaningful keywords
    const keywords = words.filter(word => 
        word.length > 2 && 
        !stopWords.has(word) &&
        /^[a-zA-Z]+$/.test(word)
    );
    
    // Prioritize industry keywords
    const priorityKeywords = keywords.filter(word => industryKeywords.has(word));
    const regularKeywords = keywords.filter(word => !industryKeywords.has(word));
    
    return {
        primary: priorityKeywords.length > 0 ? priorityKeywords[0] : (regularKeywords[0] || 'business'),
        secondary: priorityKeywords.length > 1 ? priorityKeywords[1] : (regularKeywords[1] || null),
        all: [...priorityKeywords, ...regularKeywords].slice(0, 5)
    };
}

// Enhanced Replicate API function for business name generation
async function generateBusinessNamesWithReplicate(description, requestId = null, clickCount = 1, performanceNow = 0) {
    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
    
    if (!REPLICATE_API_TOKEN) {
        console.error('❌ REPLICATE_API_TOKEN not found in environment variables');
        throw new Error('Replicate API token is required');
    }
    
    try {
        const replicate = new Replicate({
            auth: REPLICATE_API_TOKEN,
        });
        
        // Extract keywords from the business description
        const keywordData = extractKeywords(description);
        console.log(`🔍 Replicate using keywords:`, keywordData);
        
        // Generate unique variations for each request
        const timestamp = Date.now();
        const randomSeed = Math.floor(Math.random() * 100000);
        const microSeed = Math.floor(Math.random() * 1000000);
        const requestIdentifier = requestId || `replicate-req-${timestamp}-${randomSeed}-${microSeed}`;
          // Optimized prompt for faster generation
        const prompt = `Generate exactly 10 business names for: "${description}".

Focus on "${keywordData.primary}" business. Mix of direct and creative names.

Examples:
- Direct: Use business type in name
- Creative: Memorable, brandable names

Format:
1. Name - Brief explanation
2. Name - Brief explanation
...continue for 10 names

Request: ${requestIdentifier}`;

        console.log(`🔄 Calling Replicate API with request ID: ${requestIdentifier}...`);
        
        const input = {
            top_p: 0.8,
            prompt: prompt,
            temperature: 0.7,
            max_new_tokens: 800,
            system_prompt: "You are a business naming expert. Generate exactly 10 creative business names with brief explanations. Be concise and follow the format exactly."
        };        // Use faster model and optimized settings for quicker response
        const output = await Promise.race([
            replicate.run("replicate/llama-2-7b-chat:13c3cdee13ee059ab779f0291d29054dab00a47dad8261375654de5540165fb0", { input }),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('API call timed out after 25 seconds')), 25000)
            )
        ]);
          console.log('📝 Generated response received from Replicate');
        
        // Handle array response from Replicate API
        let generatedText = '';
        if (Array.isArray(output)) {
            generatedText = output.join('');
        } else if (typeof output === 'string') {
            generatedText = output;
        } else {
            console.warn('⚠️ Unexpected response format from Replicate API:', typeof output);
            throw new Error('Invalid response format from Replicate API');
        }
        
        console.log('📄 Processed text length:', generatedText.length);
        console.log('📄 Sample text:', generatedText.substring(0, 200) + '...');
        
        const parsedNames = parseTextResponse(generatedText);
        
        if (parsedNames.length === 0) {
            console.warn('⚠️ Failed to parse names from Replicate response');
            console.log('📄 Full response text for debugging:', generatedText);
            throw new Error('Failed to parse business names from AI response');
        }
        
        console.log(`✅ Successfully generated ${parsedNames.length} names with Replicate API`);
        return parsedNames;
        
    } catch (error) {
        console.error('❌ Replicate API error:', error.message);
        throw error;
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
    
    return names.slice(0, 10);
}

// Netlify Function Handler
exports.handler = async (event, context) => {// Handle CORS with maximum anti-caching
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Cache-Control, X-Request-ID, X-Session-ID, X-User-Agent, Pragma, Expires',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Cache-Control': 'no-cache, no-store, must-revalidate, private, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Vary': 'Accept-Encoding, User-Agent',
        'X-Content-Type-Options': 'nosniff'
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

        // Validate business description
        let description;
        try {
            description = validateBusinessDescription(body.description);
        } catch (error) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Validation error',
                    message: error.message
                })
            };
        }        console.log(`🎯 Generating names for: "${description}"`);
        
        // Generate unique request ID for this generation, use frontend ID if provided
        const frontendRequestId = body.requestId;
        const sessionData = body.sessionData || {};
        const clickCount = sessionData.clickCount || 1;
        const performanceNow = body.performanceNow || Date.now();
        
        const requestId = frontendRequestId || `gen-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
        
        console.log(`📝 Request ID: ${requestId}`);
        console.log(`🔢 Click Count: ${clickCount}, Performance: ${performanceNow}`);
        console.log(`🕒 Timestamp: ${body.timestamp || 'not provided'}`);        // Enhanced API calling with Replicate only
        console.log('🚀 Starting business name generation with Replicate API...');
        
        try {
            const generatedNames = await generateBusinessNamesWithReplicate(description, requestId, clickCount, performanceNow);
            
            console.log(`✅ Successfully generated ${generatedNames.length} names with Replicate API`);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    names: generatedNames,
                    source: 'replicate-api',
                    requestId: requestId
                })
            };
            
        } catch (error) {
            console.error('❌ Replicate API failed:', error.message);
            
            return {
                statusCode: 503,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Name generation service unavailable',
                    message: 'Our AI naming service is currently experiencing issues. Please try again in a few minutes.',
                    requestId: requestId,
                    details: error.message
                })
            };
        }
        
    } catch (error) {
        console.error('❌ Error in generate-names:', error);
          // Return error instead of fallback
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Service error',
                message: 'Unable to generate business names. Please try again later.',
                details: error.message
            })
        };
    }
};
