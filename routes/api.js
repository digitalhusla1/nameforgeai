const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

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

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

module.exports = router;
