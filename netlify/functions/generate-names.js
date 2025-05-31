const fetch = require('node-fetch');

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
    
    // Add random business context elements
    const businessContexts = [
        'with strong market appeal',
        'that stands out from competitors',
        'with global scalability potential',
        'that resonates with target audience',
        'with premium brand positioning',
        'that suggests growth and success',
        'with memorable brand identity',
        'that conveys trust and reliability'
    ];    const businessContext = businessContexts[(randomSeed + microSeed) % businessContexts.length];
    
    // Create keyword-focused variations
    const keywordIntegrations = [
        `that prominently features the concept of "${keywordData.primary}"`,
        `that creatively incorporates "${keywordData.primary}" in the name`,
        `that reflects the essence of "${keywordData.primary}" business`,
        `that cleverly plays with "${keywordData.primary}" terminology`,
        `that suggests expertise in "${keywordData.primary}" industry`,
        `that evokes the spirit of "${keywordData.primary}" culture`,
        `that modernizes the "${keywordData.primary}" experience`,
        `that represents innovation in "${keywordData.primary}" sector`
    ];
    const keywordIntegration = keywordIntegrations[(randomSeed + clickCount) % keywordIntegrations.length];
      const prompt = `Generate AT LEAST 10 simple, clear, and readable business names for: "${description}" ${businessContext} ${keywordIntegration}.

CRITICAL KEYWORD REQUIREMENTS:
- Primary keyword: "${keywordData.primary}" - MUST be the foundation of ALL business names
- Names should be SIMPLE, CLEAR, and EASY TO UNDERSTAND
- Avoid complicated, abstract, or hard-to-pronounce names
- Focus on straightforward combinations that clearly relate to "${keywordData.primary}"
- Each name should immediately convey what the business does

SIMPLICITY GUIDELINES:
- Use common, everyday words that people can easily read and remember
- Keep names between 1-3 words maximum
- Avoid complex wordplay, made-up words, or abstract concepts
- Choose names that customers can easily spell and pronounce
- Ensure the connection to "${keywordData.primary}" is obvious and direct

NAMING APPROACHES (use variety but keep simple):
1. "${keywordData.primary}" + descriptive word (e.g., "Coffee House", "Fresh Coffee")
2. Location + "${keywordData.primary}" (e.g., "Downtown Coffee", "Corner Coffee")
3. Quality + "${keywordData.primary}" (e.g., "Premium Coffee", "Pure Coffee")
4. Action + "${keywordData.primary}" (e.g., "Brew Coffee", "Roast Coffee")
5. Time/Experience + "${keywordData.primary}" (e.g., "Daily Coffee", "Morning Coffee")
6. Simple compound names (e.g., "CoffeeSpot", "CoffeePlus")

CRITICAL UNIQUENESS REQUIREMENTS:
- This is generation attempt #${clickCount} for this user
- Use ${clickVariation} compared to any previous suggestions  
- Each name must be completely unique and never been suggested before
- Generate AT LEAST 10 different name suggestions
- ENSURE each name clearly connects to the "${keywordData.primary}" business

Context: ${timeContext} and ${dayContext} creativity session
Request ID: ${requestIdentifier}
Performance Marker: ${performanceNow}
Random Seeds: ${randomSeed}-${microSeed}

For each name, provide a short, engaging description (1-2 sentences) that explains the reasoning behind the name and captures the essence of a business with that name.

Please format your response exactly like this:
1. BusinessName - Brief explanation of why this name works
2. AnotherName - Brief explanation of why this name works  
3. ThirdName - Brief explanation of why this name works
4. FourthName - Brief explanation of why this name works
5. FifthName - Brief explanation of why this name works
6. SixthName - Brief explanation of why this name works
7. SeventhName - Brief explanation of why this name works
8. EighthName - Brief explanation of why this name works
9. NinthName - Brief explanation of why this name works
10. TenthName - Brief explanation of why this name works

Make sure ALL names are simple, memorable, relevant, professional, and easy to pronounce. Ensure strong connection to "${keywordData.primary}" business.`;

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

// Fallback name generation with maximum randomization and keyword focus
function generateFallbackNames(description, requestId = null) {
    console.log('🎲 Generating fallback names with maximum uniqueness and keyword focus');
    
    const timestamp = Date.now();
    const randomSeed = Math.floor(Math.random() * 100000);
    const microSeed = Math.floor(Math.random() * 1000000);
    
    // Extract keywords using the same function as AI generation
    const keywordData = extractKeywords(description);
    console.log(`🔍 Fallback using keywords:`, keywordData);
    
    const primaryKeyword = keywordData.primary;
    const secondaryKeyword = keywordData.secondary;
      // Simple keyword-focused words based on industry
    const getSimpleWords = (keyword) => {
        const industryMaps = {
            coffee: {
                descriptors: ['Fresh', 'Daily', 'Morning', 'Premium', 'Local', 'Pure', 'Best'],
                locations: ['Corner', 'Downtown', 'Central', 'Main', 'Street'],
                simple: ['House', 'Shop', 'Spot', 'Place', 'Co']
            },
            tech: {
                descriptors: ['Smart', 'Digital', 'Pro', 'Quick', 'Modern', 'Easy', 'Simple'],
                locations: ['Hub', 'Center', 'Lab', 'Studio'],
                simple: ['Solutions', 'Systems', 'Works', 'Group', 'Plus']
            },
            consulting: {
                descriptors: ['Expert', 'Pro', 'Prime', 'Best', 'Top', 'Smart', 'Trusted'],
                locations: ['Group', 'Partners', 'Associates'],
                simple: ['Advisors', 'Solutions', 'Services', 'Help', 'Plus']
            },
            fitness: {
                descriptors: ['Strong', 'Fit', 'Active', 'Peak', 'Pro', 'Elite', 'Pure'],
                locations: ['Studio', 'Center', 'Zone', 'Club'],
                simple: ['Gym', 'Training', 'Health', 'Plus', 'Works']
            },
            food: {
                descriptors: ['Fresh', 'Pure', 'Local', 'Best', 'Daily', 'Good', 'Fine'],
                locations: ['Kitchen', 'Table', 'Corner', 'Street'],
                simple: ['Bistro', 'Cafe', 'Market', 'House', 'Co']
            }
        };
        
        return industryMaps[keyword] || {
            descriptors: ['Pro', 'Best', 'Smart', 'Quick', 'Modern', 'Pure', 'Top'],
            locations: ['Hub', 'Center', 'Studio', 'Group'],
            simple: ['Works', 'Plus', 'Solutions', 'Co', 'Services']
        };
    };
    
    const simpleWords = getSimpleWords(primaryKeyword);
      // Multiple randomization strategies for simple words
    const shuffleDescriptors = [...simpleWords.descriptors].sort(() => Math.random() - 0.5);
    const shuffleLocations = [...simpleWords.locations].sort(() => Math.random() - 0.5);
    const shuffleSimple = [...simpleWords.simple].sort(() => Math.random() - 0.5);
    
    // Simple connectors
    const connectors = [' ', ''];
    
    // Prepare primary keyword for use in names (capitalize first letter)
    const keywordCapitalized = primaryKeyword.charAt(0).toUpperCase() + primaryKeyword.slice(1);
    
    const names = [];
    const usedNames = new Set();
      // Generate simple, keyword-focused combinations
    for (let i = 0; i < 100 && names.length < 10; i++) {
        const descriptorIndex = (i * randomSeed + microSeed) % shuffleDescriptors.length;
        const locationIndex = (i * microSeed + timestamp % 1000) % shuffleLocations.length;
        const simpleIndex = (i + randomSeed + microSeed) % shuffleSimple.length;
        
        const descriptor = shuffleDescriptors[descriptorIndex];
        const location = shuffleLocations[locationIndex];
        const simple = shuffleSimple[simpleIndex];
        const connector = connectors[i % connectors.length];
        
        let name;
        const nameType = (i + randomSeed + microSeed) % 8; // Simple naming patterns only
        
        switch (nameType) {
            case 0:
                // Descriptor + Keyword (e.g., "Fresh Coffee")
                name = `${descriptor}${connector}${keywordCapitalized}`;
                break;
            case 1:
                // Keyword + Simple (e.g., "Coffee House")
                name = `${keywordCapitalized}${connector}${simple}`;
                break;
            case 2:
                // Location + Keyword (e.g., "Corner Coffee")
                name = `${location}${connector}${keywordCapitalized}`;
                break;
            case 3:
                // Keyword + Location (e.g., "Coffee Corner")
                name = `${keywordCapitalized}${connector}${location}`;
                break;
            case 4:
                // Just Keyword + descriptor as one word (e.g., "CoffeePlus")
                name = `${keywordCapitalized}${simple}`;
                break;
            case 5:
                // Descriptor + keyword as one word (e.g., "FreshCoffee")
                name = `${descriptor}${keywordCapitalized}`;
                break;
            case 6:
                // Daily/Daily-like + keyword (e.g., "Daily Coffee")
                const dailyWords = ['Daily', 'Local', 'Quick', 'Best'];
                const dailyWord = dailyWords[i % dailyWords.length];
                name = `${dailyWord}${connector}${keywordCapitalized}`;
                break;
            default:
                // Simple keyword combinations (e.g., "The Coffee Shop")
                const articles = ['The', ''];
                const article = articles[i % articles.length];
                name = article ? `${article} ${keywordCapitalized} ${simple}` : `${keywordCapitalized} ${simple}`;
        }
          // Skip duplicates entirely to ensure only unique names
        if (!usedNames.has(name.toLowerCase()) && name.length <= 25) {
            usedNames.add(name.toLowerCase());
            
            // Generate simple, keyword-focused descriptions
            const descriptionOptions = [
                `A simple and memorable name that clearly represents your ${primaryKeyword} business.`,
                `Straightforward ${primaryKeyword} business name that customers will easily remember.`,
                `Clean and professional name perfect for a ${primaryKeyword} company.`,
                `Easy-to-pronounce ${primaryKeyword} business name with clear market appeal.`,
                `Simple ${primaryKeyword} name that directly communicates what you do.`
            ];
            
            const description = descriptionOptions[i % descriptionOptions.length];
              names.push({
                name: name,
                description: description
            });
        }
    }
    
    return names;
}

// Netlify Function Handler
exports.handler = async (event, context) => {    // Handle CORS with maximum anti-caching
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
        console.log(`🕒 Timestamp: ${body.timestamp || 'not provided'}`);
        
        // Try Gemini API first with enhanced uniqueness
        const names = await callGeminiAPI(description, requestId, clickCount, performanceNow);
          if (names && names.length > 0) {
            console.log(`✅ Successfully generated ${names.length} names with request ID: ${requestId}`);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    names: names,
                    source: 'gemini-api',
                    requestId: requestId
                })
            };
        } else {
            // Fallback to local generation
            console.log('🔄 Using fallback name generation');
            const fallbackNames = generateFallbackNames(description, requestId);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    names: fallbackNames,
                    source: 'fallback',
                    requestId: requestId,
                    message: 'Generated using fallback method due to API unavailability'
                })
            };
        }
        
    } catch (error) {
        console.error('❌ Error in generate-names:', error);
          // Always provide fallback names
        try {
            const requestId = `fallback-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
            const fallbackNames = generateFallbackNames(body?.description || 'business', requestId);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    names: fallbackNames,
                    source: 'fallback',
                    requestId: requestId,
                    message: 'Generated using fallback method due to API error'
                })
            };
        } catch (fallbackError) {
            console.error('❌ Fallback generation failed:', fallbackError);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({
                    error: 'Generation failed',
                    message: 'Unable to generate business names at this time'
                })
            };
        }
    }
};
