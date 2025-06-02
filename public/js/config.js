// NameForge AI Configuration
window.NameForgeConfig = {
    // API Configuration
    API_BASE_URL: window.location.origin,
      // Feature flags
    FEATURES: {
        AI_GENERATION: true,
        FALLBACK_GENERATION: true,
        COPY_TO_CLIPBOARD: true,
        ADMIN_PANEL: false
    },
    
    // UI Configuration
    UI: {
        MAX_DESCRIPTION_LENGTH: 500,
        MIN_DESCRIPTION_LENGTH: 3,
        NAMES_TO_GENERATE: 10,
        ANIMATION_DURATION: 300
    },
    
    // Error messages
    MESSAGES: {
        VALIDATION: {
            REQUIRED: 'Business description is required',
            TOO_SHORT: 'Description must be at least 3 characters',
            TOO_LONG: 'Description must be less than 500 characters'
        },
        API: {
            NETWORK_ERROR: 'Network error. Please check your connection.',
            SERVER_ERROR: 'Server error. Please try again later.',
            GENERATION_FAILED: 'Failed to generate names. Please try again.'
        },
        SUCCESS: {
            NAMES_GENERATED: 'Names generated successfully!',
            COPIED_TO_CLIPBOARD: 'Copied to clipboard!'
        }
    },
    
    // Development mode detection
    isDevelopment: () => {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1';
    },
      // Get API endpoint
    getApiEndpoint: (endpoint) => {
        if (window.NameForgeConfig.isDevelopment()) {
            return `${window.NameForgeConfig.API_BASE_URL}/api/${endpoint}`;
        } else {
            return `${window.NameForgeConfig.API_BASE_URL}/.netlify/functions/${endpoint}`;
        }
    }
};

// Initialize configuration
console.log('NameForge AI Config loaded:', window.NameForgeConfig.isDevelopment() ? 'Development' : 'Production');