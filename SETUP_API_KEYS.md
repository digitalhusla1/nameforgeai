# NameForge AI - API Keys Setup Guide

## ✅ Encryption Disabled
Encryption has been disabled as requested. API keys are now stored and used directly from environment variables.

## 🔑 API Keys Configuration

### 1. Google Gemini API (Recommended - Free tier available)
1. Visit: https://makersuite.google.com/app/apikey
2. Create a new API key
3. Copy the key and paste it in `.env` file:
   ```
   GEMINI_API_KEY=your_actual_gemini_key_here
   ```

### 2. Replicate API (For advanced models)
1. Visit: https://replicate.com/account/api-tokens
2. Create a new API token
3. Copy the token (starts with `r8_`) and paste it in `.env` file:
   ```
   REPLICATE_API_TOKEN=r8_your_actual_token_here
   ```

### 3. Anthropic Claude API (Optional)
1. Visit: https://console.anthropic.com/
2. Create a new API key
3. Copy the key (starts with `sk-ant-`) and paste it in `.env` file:
   ```
   ANTHROPIC_API_KEY=sk-ant-your_actual_key_here
   ```

## 🚀 After Setting Up API Keys

1. **Restart the server** to load new environment variables:
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart:
   npm start
   ```

2. **Test the APIs** using the admin panel:
   - Visit: http://localhost:3000/admin.html
   - Use admin code: `TEMP_CODE_12345`
   - Test each API to ensure they're working

## 🔧 Environment Variables Reference

Your `.env` file should look like this:
```env
# Google Gemini API Configuration
GEMINI_API_KEY=your_actual_gemini_key_here
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent

# Admin Panel Configuration
ADMIN_CODE=TEMP_CODE_12345

# API Key Encryption Configuration (DISABLED)
# ENCRYPTION_KEY=nameforge-secure-encryption-key-2025!

# Replicate API Configuration
REPLICATE_API_TOKEN=r8_your_actual_token_here

# Anthropic API Configuration (Optional)
ANTHROPIC_API_KEY=sk-ant-your_actual_key_here

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost,http://127.0.0.1,http://localhost:3000,http://localhost:80

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🧪 Testing

1. **Quick API Test**: Visit http://localhost:3000/api/status to see which APIs are configured
2. **Full Test**: Use the business name generator with a test description
3. **Admin Panel**: Use the admin panel to test individual APIs

## 🛠️ Troubleshooting

### Common Issues:
1. **401 Unauthorized**: Check if API key is correctly set in `.env`
2. **Service Unavailable**: Ensure at least one API key is configured
3. **Server not restarted**: Restart server after changing `.env`

### Debug Steps:
1. Check server console for error messages
2. Verify API keys in admin panel
3. Test individual APIs using admin panel
4. Check network connectivity

## 💡 Priority Configuration

For best results, configure APIs in this order:
1. **Gemini** (Free tier, good quality)
2. **Replicate** (Advanced models, pay-per-use)
3. **Anthropic** (High quality, paid)

The system will automatically use available APIs based on configuration.
