// Test encryption functionality
const crypto = require('crypto');
require('dotenv').config();

// Encryption utilities (copied from api.js)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'nameforge-secure-encryption-key-2025!'; // 32 characters
const ALGORITHM = 'aes-256-cbc';

function encryptApiKey(apiKey) {
    try {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.substring(0, 32)), iv);
        let encrypted = cipher.update(apiKey, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return {
            encrypted: encrypted,
            iv: iv.toString('hex')
        };
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt API key');
    }
}

function decryptApiKey(encryptedData) {
    try {
        const iv = Buffer.from(encryptedData.iv, 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.substring(0, 32)), iv);
        let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt API key');
    }
}

function maskApiKey(apiKey) {
    if (!apiKey || apiKey.length < 12) return '***masked***';
    return apiKey.substring(0, 8) + '...' + apiKey.substring(apiKey.length - 4);
}

// Test the encryption/decryption
console.log('🧪 Testing API Key Encryption/Decryption\n');

const testApiKeys = [
    'AIzaSyBtest123456789ABCDEF', // Gemini format
    'sk-ant-api03-test123456789ABCDEF', // Anthropic format
    'r8_test123456789ABCDEF' // Replicate format
];

testApiKeys.forEach((originalKey, index) => {
    console.log(`Test ${index + 1}:`);
    console.log(`Original: ${maskApiKey(originalKey)}`);
    
    try {
        // Encrypt
        const encrypted = encryptApiKey(originalKey);
        console.log(`Encrypted: ${encrypted.encrypted.substring(0, 16)}...`);
        console.log(`IV: ${encrypted.iv}`);
        
        // Decrypt
        const decrypted = decryptApiKey(encrypted);
        console.log(`Decrypted: ${maskApiKey(decrypted)}`);
        
        // Verify
        const isMatch = originalKey === decrypted;
        console.log(`✅ Match: ${isMatch ? 'SUCCESS' : 'FAILED'}`);
        
        if (!isMatch) {
            console.error(`❌ MISMATCH: Original "${originalKey}" vs Decrypted "${decrypted}"`);
        }
        
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
    }
    
    console.log('---\n');
});

console.log('🔐 Encryption test completed!');
