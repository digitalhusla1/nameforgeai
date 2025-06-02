const fetch = require('node-fetch');
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

// Gemini API function with enhanced uniqueness and keyword focus
async function callGeminiAPI(description, requestId = null, clickCount = 1, performanceNow = 0) {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const GEMINI_API_URL = process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    
    if (!GEMINI_API_KEY) {
        console.warn('⚠️ GEMINI_API_KEY not found in environment variables');
        return null;
    }
    
    // Extract keywords from the business description
    const keywordData = extractKeywords(description);
    console.log(`🔍 Extracted keywords:`, keywordData);
    
    // Generate unique variations for each request to ensure different results
    const timestamp = Date.now();
    const randomSeed = Math.floor(Math.random() * 100000); // Increased range
    const microSeed = Math.floor(Math.random() * 1000000); // Additional randomness
    const requestIdentifier = requestId || `req-${timestamp}-${randomSeed}-${microSeed}`;
    
    // Expanded variation words to make each prompt significantly different
    const styleVariations = [
        'unique and innovative',
        'creative and memorable',
        'distinctive and catchy',
        'original and professional',
        'fresh and modern',
        'clever and brandable',
        'bold and impactful',
        'sophisticated and elegant',
        'dynamic and energetic',
        'cutting-edge and futuristic',
        'inspiring and visionary',
        'powerful and commanding',
        'sleek and contemporary',
        'vibrant and engaging',
        'authentic and trustworthy'
    ];
    
    const approachVariations = [
        'Think outside the box and create',
        'Use your creativity to generate',
        'Brainstorm and develop',
        'Imagine and craft',
        'Innovate and design',
        'Conceptualize and build',
        'Envision and create',
        'Invent and formulate'
    ];
    
    const styleVariation = styleVariations[randomSeed % styleVariations.length];
    const approachVariation = approachVariations[microSeed % approachVariations.length];
      // Add timestamp-based context variations
    const hourOfDay = new Date().getHours();
    const dayOfWeek = new Date().getDay();
    const timeContext = hourOfDay < 12 ? 'morning-inspired' : hourOfDay < 18 ? 'afternoon-energized' : 'evening-sophisticated';
    const dayContext = ['sunday-relaxed', 'monday-motivated', 'tuesday-focused', 'wednesday-creative', 'thursday-dynamic', 'friday-innovative', 'saturday-vibrant'][dayOfWeek];
    
    // Add click-based variations for users who generate multiple times
    const clickVariations = [
        'completely fresh perspective',
        'entirely new creative direction',
        'totally different approach',
        'brand new innovative angle',
        'completely original viewpoint',
        'fresh creative breakthrough',
        'revolutionary new concept',
        'groundbreaking creative vision'
    ];
    const clickVariation = clickVariations[(clickCount - 1) % clickVariations.length];
      // Create variations for business context
    const businessContexts = [
        'with strong market appeal',
        'that stands out from competitors',
        'with global scalability potential',
        'that resonates with target audience',
        'with premium brand positioning',
        'that suggests growth and success',
        'with memorable brand identity',
        'that conveys trust and reliability'
    ];
    const businessContext = businessContexts[(randomSeed + microSeed) % businessContexts.length];    const prompt = `Generate exactly 10 creative, meaningful business names for: "${description}" ${businessContext}.

CRITICAL NAMING REQUIREMENTS:
- Primary keyword: "${keywordData.primary}" - Create names that are MEANINGFULLY CONNECTED to this keyword
- Generate a BALANCED MIX of direct and creative names that all relate to "${keywordData.primary}"
- ALL names must have a clear connection to the "${keywordData.primary}" industry/concept
- Create names that customers will immediately understand relate to this business type

NAMING STRATEGY - Generate a balanced mix of:
1. DIRECT NAMES (3-4 names): Modern, sophisticated names that clearly connect to "${keywordData.primary}"
   - Use elegant variations of the keyword or related industry terms
   - Examples: For "coffee" → "Roastery", "Bean & Co", "Brew House"
   - Examples: For "jewelry" → "Gem Studio", "Silver & Stone", "Precious Works"
   - Examples: For "tech" → "Code Lab", "Digital Core", "Tech Studio"
   - Examples: For "fitness" → "Strength Lab", "Fit Studio", "Performance Center"
   
2. CREATIVE CONCEPTUAL NAMES (6-7 names): Poetic names inspired by "${keywordData.primary}" essence
   - Use metaphors, emotions, and symbolism related to "${keywordData.primary}"
   - Examples: For "coffee" → "Morning Ritual", "Ember", "Awakening"
   - Examples: For "jewelry" → "Radiance", "Eternal Sparkle", "Crystal Dreams"
   - Examples: For "tech" → "Nexus", "Velocity", "Quantum Leap"
   - Examples: For "fitness" → "Forge", "Ignite", "Ascend"

CREATIVE APPROACHES FOR "${keywordData.primary}":
1. Emotional Connection: What feelings does "${keywordData.primary}" evoke?
2. Natural Elements: What in nature reflects "${keywordData.primary}"?
3. Transformation Words: How does "${keywordData.primary}" change people?
4. Abstract Concepts: What deeper ideas relate to "${keywordData.primary}"?
5. Sensory Words: What senses does "${keywordData.primary}" engage?
6. Industry Evolution: Modern takes on traditional "${keywordData.primary}" concepts

QUALITY REQUIREMENTS:
- Names should be 1-3 words maximum, elegant and professional
- Each name must be brandable, memorable, and unique
- Names should sound premium and trustworthy
- All names must have clear relevance to "${keywordData.primary}" business
- This is generation attempt #${clickCount} for this user
- Use ${clickVariation} compared to any previous suggestions

Context: ${timeContext} and ${dayContext} creativity session
Request ID: ${requestIdentifier}
Performance Marker: ${performanceNow}
Random Seeds: ${randomSeed}-${microSeed}

For each name, provide a compelling description (2-3 sentences) that explains:
- HOW the name connects to the "${keywordData.primary}" business
- WHY it would appeal to customers
- For DIRECT names: Emphasize industry relevance and professional appeal
- For CREATIVE names: Emphasize emotional connection and brand personality

Please format your response exactly like this:
1. BusinessName - Explanation of connection to ${keywordData.primary} business and customer appeal
2. AnotherName - Explanation of connection to ${keywordData.primary} business and customer appeal
3. ThirdName - Explanation of connection to ${keywordData.primary} business and customer appeal
4. FourthName - Explanation of connection to ${keywordData.primary} business and customer appeal
5. FifthName - Explanation of connection to ${keywordData.primary} business and customer appeal
6. SixthName - Explanation of connection to ${keywordData.primary} business and customer appeal
7. SeventhName - Explanation of connection to ${keywordData.primary} business and customer appeal
8. EighthName - Explanation of connection to ${keywordData.primary} business and customer appeal
9. NinthName - Explanation of connection to ${keywordData.primary} business and customer appeal
10. TenthName - Deep explanation of the meaning and emotional connection

Ensure the mix includes both direct industry-connected names AND creative conceptual names, with ALL names maintaining meaningful relevance to "${keywordData.primary}".`;

    const requestBody = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }],        generationConfig: {
            temperature: 0.95, // Maximum creativity for unique results
            maxOutputTokens: 1200,
            topP: 0.95, // Maximum diversity in word selection
            topK: 60, // Expanded vocabulary choices
            candidateCount: 1,
            // Add additional randomness parameters
            presencePenalty: 0.6, // Reduce repetition
            frequencyPenalty: 0.7 // Discourage common patterns
        }
    };    try {
        console.log(`🔄 Calling Gemini API with request ID: ${requestIdentifier}...`);
        
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache', // Prevent caching
                'X-Request-ID': requestIdentifier // Add unique header
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

// Replicate API function as backup
async function callReplicateAPI(description, requestId = null, clickCount = 1, performanceNow = 0) {
    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
    
    if (!REPLICATE_API_TOKEN) {
        console.warn('⚠️ REPLICATE_API_TOKEN not found in environment variables');
        return null;
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
        const requestIdentifier = requestId || `replicate-req-${timestamp}-${randomSeed}`;
        
        const prompt = `Generate exactly 10 creative, meaningful business names for: "${description}".

CRITICAL NAMING REQUIREMENTS:
- Primary keyword: "${keywordData.primary}" - Create names that are MEANINGFULLY CONNECTED to this keyword
- Generate a BALANCED MIX of direct and creative names that all relate to "${keywordData.primary}"
- ALL names must have a clear connection to the "${keywordData.primary}" industry/concept

NAMING STRATEGY - Generate a balanced mix of:
1. DIRECT NAMES (3-4 names): Modern, sophisticated names that clearly connect to "${keywordData.primary}"
   - Examples: For "coffee" → "Roastery", "Bean & Co", "Brew House"
   - Examples: For "jewelry" → "Gem Studio", "Silver & Stone", "Precious Works"
   
2. CREATIVE CONCEPTUAL NAMES (6-7 names): Poetic names inspired by "${keywordData.primary}" essence
   - Examples: For "coffee" → "Morning Ritual", "Ember", "Awakening"
   - Examples: For "jewelry" → "Radiance", "Eternal Sparkle", "Crystal Dreams"

QUALITY REQUIREMENTS:
- Names should be 1-3 words maximum, elegant and professional
- Each name must be brandable, memorable, and unique
- Names should sound premium and trustworthy
- All names must have clear relevance to "${keywordData.primary}" business

For each name, provide a compelling description (2-3 sentences) that explains:
- HOW the name connects to the "${keywordData.primary}" business
- WHY it would appeal to customers

Please format your response exactly like this:
1. BusinessName - Explanation of connection to ${keywordData.primary} business and customer appeal
2. AnotherName - Explanation of connection to ${keywordData.primary} business and customer appeal
3. ThirdName - Explanation of connection to ${keywordData.primary} business and customer appeal
(continue for all 10 names)

Request ID: ${requestIdentifier}`;        console.log(`🔄 Calling Replicate API with request ID: ${requestIdentifier}...`);
        
        const input = {
            top_p: 0.9,
            prompt: prompt,
            temperature: 0.8,
            max_new_tokens: 1200,
            system_prompt: "You are a creative business naming expert who generates sophisticated, brandable business names with meaningful connections to the industry."
        };

        // Use replicate.run instead of stream for better response handling
        const output = await replicate.run("meta/llama-2-7b-chat", { input });
        
        console.log('📝 Generated response received from Replicate');
        
        // Handle array response from Replicate API
        let generatedText = '';
        if (Array.isArray(output)) {
            generatedText = output.join('');
        } else if (typeof output === 'string') {
            generatedText = output;
        } else {
            console.warn('⚠️ Unexpected response format from Replicate API:', typeof output);
            return null;
        }
        
        console.log('📄 Processed text length:', generatedText.length);
        
        const parsedNames = parseTextResponse(generatedText);
        
        if (parsedNames.length === 0) {
            console.warn('⚠️ Failed to parse names from Replicate response');
            return null;
        }
        
        return parsedNames;
        
    } catch (error) {
        console.error('❌ Replicate API error:', error.message);
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
        console.log(`🕒 Timestamp: ${body.timestamp || 'not provided'}`);        // Enhanced API calling with multiple providers and better error handling
        console.log('🚀 Starting API generation process...');
        
        // Try Gemini API first
        console.log('🔄 Attempting Gemini API...');
        const geminiNames = await callGeminiAPI(description, requestId, clickCount, performanceNow);
        
        if (geminiNames && geminiNames.length > 0) {
            console.log(`✅ Successfully generated ${geminiNames.length} names with Gemini API`);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    names: geminiNames,
                    source: 'gemini-api',
                    requestId: requestId
                })
            };
        }
        
        // Gemini failed, try Replicate API as backup
        console.log('🔄 Gemini API failed, attempting Replicate API as backup...');
        const replicateNames = await callReplicateAPI(description, requestId, clickCount, performanceNow);
        
        if (replicateNames && replicateNames.length > 0) {
            console.log(`✅ Successfully generated ${replicateNames.length} names with Replicate API`);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    names: replicateNames,
                    source: 'replicate-api',
                    requestId: requestId,
                    message: 'Generated using backup API due to primary API being unavailable'
                })
            };
        }
        
        // Both APIs failed
        console.log('❌ All AI APIs failed to generate names');
        return {
            statusCode: 503,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'All AI services unavailable',
                message: 'Our AI naming services are currently experiencing high demand. Please try again in a few minutes.',
                requestId: requestId,
                details: 'Both primary and backup AI services are temporarily unavailable'
            })
        };
        
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
