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
    const secondaryKeyword = keywordData.secondary;    // Creative word banks that evoke the essence of different industries
    const getCreativeWords = (keyword) => {
        const industryMaps = {
            coffee: {
                direct: ['Roastery', 'Bean Co', 'Brew House', 'Coffee Works', 'Grind Studio', 'Café Central', 'Roast & Co'],
                emotions: ['Ember', 'Dawn', 'Spark', 'Glow', 'Warmth', 'Comfort', 'Ritual'],
                nature: ['Bean', 'Roast', 'Steam', 'Aroma', 'Grove', 'Harvest', 'Origin'],
                experiences: ['Morning', 'Awaken', 'Gather', 'Social', 'Pause', 'Moment', 'Connect'],
                abstract: ['Essence', 'Craft', 'Culture', 'Tradition', 'Art', 'Journey', 'Story']
            },
            jewelry: {
                direct: ['Gem Studio', 'Silver & Stone', 'Precious Works', 'Jewel Craft', 'Gold & Grace', 'Crystal Co', 'Fine Jewelry'],
                emotions: ['Radiance', 'Elegance', 'Grace', 'Allure', 'Brilliance', 'Charm', 'Mystique'],
                nature: ['Crystal', 'Pearl', 'Gold', 'Silver', 'Stone', 'Gem', 'Mineral'],
                experiences: ['Adorn', 'Celebrate', 'Honor', 'Cherish', 'Treasure', 'Memory', 'Gift'],
                abstract: ['Legacy', 'Heritage', 'Artistry', 'Vision', 'Beauty', 'Wonder', 'Magic']
            },
            tech: {
                direct: ['Tech Solutions', 'Code Studio', 'Digital Works', 'Tech Labs', 'Innovation Hub', 'Software Co', 'Data Systems'],
                emotions: ['Innovation', 'Progress', 'Discovery', 'Wonder', 'Curiosity', 'Ambition', 'Vision'],
                nature: ['Circuit', 'Code', 'Data', 'Logic', 'Network', 'System', 'Platform'],
                experiences: ['Connect', 'Create', 'Build', 'Transform', 'Evolve', 'Advance', 'Explore'],
                abstract: ['Future', 'Digital', 'Virtual', 'Intelligence', 'Algorithm', 'Innovation', 'Solution']
            },
            fitness: {
                direct: ['Fitness Studio', 'Gym Works', 'Training Center', 'Fitness Co', 'Workout Hub', 'Health Club', 'Fit Studio'],
                emotions: ['Strength', 'Power', 'Energy', 'Vitality', 'Confidence', 'Determination', 'Spirit'],
                nature: ['Core', 'Peak', 'Summit', 'Flow', 'Balance', 'Rhythm', 'Motion'],
                experiences: ['Transform', 'Achieve', 'Overcome', 'Push', 'Strive', 'Excel', 'Triumph'],
                abstract: ['Journey', 'Challenge', 'Goal', 'Progress', 'Discipline', 'Focus', 'Mindset']
            },
            consulting: {
                direct: ['Consulting Group', 'Advisory Partners', 'Strategy Co', 'Business Solutions', 'Consulting Works', 'Expert Partners', 'Advisory Group'],
                emotions: ['Wisdom', 'Trust', 'Insight', 'Clarity', 'Confidence', 'Authority', 'Expertise'],
                nature: ['Path', 'Bridge', 'Foundation', 'Compass', 'Guide', 'Direction', 'Strategy'],
                experiences: ['Guide', 'Lead', 'Advise', 'Navigate', 'Transform', 'Empower', 'Enable'],
                abstract: ['Vision', 'Strategy', 'Solution', 'Knowledge', 'Method', 'Approach', 'Framework']
            },
            food: {
                direct: ['Food Co', 'Kitchen Works', 'Culinary Studio', 'Food House', 'Kitchen Craft', 'Cuisine Co', 'Food Partners'],
                emotions: ['Nourish', 'Comfort', 'Joy', 'Satisfaction', 'Delight', 'Pleasure', 'Warmth'],
                nature: ['Harvest', 'Garden', 'Farm', 'Fresh', 'Organic', 'Natural', 'Pure'],
                experiences: ['Taste', 'Savor', 'Enjoy', 'Share', 'Celebrate', 'Gather', 'Feast'],
                abstract: ['Culture', 'Tradition', 'Heritage', 'Craft', 'Art', 'Passion', 'Love']
            }
        };
        
        return industryMaps[keyword] || {
            direct: ['Business Co', 'Professional Works', 'Expert Studio', 'Premier Group', 'Quality Partners', 'Elite Co', 'Prime Solutions'],
            emotions: ['Passion', 'Excellence', 'Quality', 'Innovation', 'Dedication', 'Craft', 'Vision'],
            nature: ['Element', 'Essence', 'Core', 'Foundation', 'Root', 'Source', 'Origin'],
            experiences: ['Create', 'Build', 'Design', 'Craft', 'Make', 'Shape', 'Form'],
            abstract: ['Art', 'Skill', 'Method', 'Way', 'Style', 'Approach', 'Philosophy']
        };
    };    const creativeWords = getCreativeWords(primaryKeyword);
    
    // Shuffle all creative word categories for maximum variety
    const shuffleDirect = [...creativeWords.direct].sort(() => Math.random() - 0.5);
    const shuffleEmotions = [...creativeWords.emotions].sort(() => Math.random() - 0.5);
    const shuffleNature = [...creativeWords.nature].sort(() => Math.random() - 0.5);
    const shuffleExperiences = [...creativeWords.experiences].sort(() => Math.random() - 0.5);
    const shuffleAbstract = [...creativeWords.abstract].sort(() => Math.random() - 0.5);
    
    // Balanced naming approaches - mix of direct and creative
    const namingApproaches = [
        'direct_name',         // Direct industry-related names
        'direct_variation',    // Variations of direct names
        'single_emotion',      // Creative emotional words
        'single_nature',       // Creative nature-inspired words
        'single_experience',   // Creative experience words
        'single_abstract',     // Creative abstract concepts
        'emotion_nature',      // Creative combinations
        'nature_experience',   // Creative combinations
        'abstract_emotion',    // Creative combinations
        'creative_compound'    // Creative compound words
    ];
    
    const names = [];
    const usedNames = new Set();
    
    // Generate a balanced mix of direct and creative names
    for (let i = 0; i < 50 && names.length < 10; i++) {
        const directIndex = (i * randomSeed) % shuffleDirect.length;
        const emotionIndex = (i * randomSeed + microSeed) % shuffleEmotions.length;
        const natureIndex = (i * microSeed + timestamp % 1000) % shuffleNature.length;
        const experienceIndex = (i + randomSeed + microSeed) % shuffleExperiences.length;
        const abstractIndex = (i + randomSeed) % shuffleAbstract.length;
        
        const direct = shuffleDirect[directIndex];
        const emotion = shuffleEmotions[emotionIndex];
        const nature = shuffleNature[natureIndex];
        const experience = shuffleExperiences[experienceIndex];
        const abstract = shuffleAbstract[abstractIndex];
        
        let name;
        let nameType = i % 10; // Use index for balanced distribution
        
        switch (nameType) {
            case 0:
            case 1:
                // Direct names (20% of names)
                name = direct;
                break;
            case 2:
                // Direct variations
                name = direct.replace(' Co', '').replace(' Works', '').replace(' Studio', '').replace(' Group', '').replace(' Partners', '');
                break;
            case 3:
                // Single emotional word (e.g., "Ember", "Radiance")
                name = emotion;
                break;
            case 4:
                // Single nature-inspired word (e.g., "Crystal", "Grove")
                name = nature;
                break;
            case 5:
                // Single experience word (e.g., "Flourish", "Transform")
                name = experience;
                break;
            case 6:
                // Single abstract concept (e.g., "Vision", "Legacy")
                name = abstract;
                break;
            case 7:
                // Emotion + Nature (e.g., "Ember Grove", "Radiant Crystal")
                name = `${emotion} ${nature}`;
                break;
            case 8:
                // Nature + Experience (e.g., "Crystal Flow", "Grove Rise")
                name = `${nature} ${experience}`;
                break;
            default:
                // Abstract + Emotion (e.g., "Vision Spark", "Legacy Glow")
                name = `${abstract} ${emotion}`;
        }
        
        // Skip duplicates entirely to ensure only unique names
        if (!usedNames.has(name.toLowerCase()) && name.length <= 30) {
            usedNames.add(name.toLowerCase());
            
            // Generate descriptions that explain the connection to the business type
            const getBusinessDescription = (name, nameType, keyword) => {
                if (nameType <= 2) {
                    // Direct name descriptions
                    return `${name} clearly communicates your ${keyword} business focus, making it easy for customers to understand your services. This professional name builds immediate trust and industry recognition while maintaining a modern, sophisticated appeal.`;
                } else {
                    // Creative name descriptions
                    const creativeDescriptions = [
                        `${name} captures the essence and emotional appeal of the ${keyword} industry, creating a memorable brand that resonates with customers. This sophisticated name suggests quality, craftsmanship, and a premium experience.`,
                        `${name} evokes the transformative power and beauty associated with ${keyword} businesses, appealing to customers seeking something special. The name conveys elegance, expertise, and attention to detail.`,
                        `${name} represents the artistry and passion behind great ${keyword} experiences, creating an emotional connection with your target audience. This distinctive name suggests innovation while honoring traditional craftsmanship.`,
                        `${name} embodies the spirit of excellence and creativity that defines the best ${keyword} businesses. The name appeals to discerning customers who appreciate quality and authentic experiences.`,
                        `${name} reflects the journey and transformation that ${keyword} businesses provide to their customers. This evocative name suggests growth, discovery, and meaningful experiences.`,
                        `${name} captures the sensory richness and emotional satisfaction that characterizes exceptional ${keyword} businesses. The name conveys luxury, comfort, and genuine care for customers.`
                    ];
                    
                    return creativeDescriptions[(i + randomSeed) % creativeDescriptions.length];
                }
            };
            
            names.push({
                name: name,
                description: getBusinessDescription(name, nameType, primaryKeyword)
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
