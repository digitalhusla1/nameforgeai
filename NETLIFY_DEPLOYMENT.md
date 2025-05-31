# Netlify Deployment Guide for NameForge AI

## 🚀 Deployment Steps

### 1. Prepare Your Repository
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit - NameForge AI ready for Netlify"

# Push to GitHub (create a new repository on GitHub first)
git remote add origin https://github.com/yourusername/your-repo-name.git
git branch -M main
git push -u origin main
```

### 2. Deploy on Netlify

#### Option A: Via Netlify Dashboard (Recommended)
1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click "New site from Git"
3. Connect your GitHub account
4. Select your repository
5. Configure build settings:
   - **Build command:** `npm install`
   - **Publish directory:** `public`
   - **Functions directory:** `netlify/functions`

#### Option B: Via Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy from your project directory
netlify deploy

# For production deployment
netlify deploy --prod
```

### 3. Configure Environment Variables
In your Netlify dashboard:
1. Go to Site settings > Environment variables
2. Add these variables:
   - `GEMINI_API_KEY` = your_actual_gemini_api_key
   - `GEMINI_API_URL` = https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent
   - `NODE_ENV` = production

### 4. Test Your Deployment
1. Wait for build to complete
2. Visit your Netlify URL (e.g., https://your-app-name.netlify.app)
3. Test the business name generation feature
4. Check browser console for any errors

## 🔧 Troubleshooting

### Common Issues:
1. **Function not found (404):** 
   - Check that `netlify/functions/generate-names.js` exists
   - Verify `netlify.toml` configuration

2. **API Key issues:**
   - Ensure `GEMINI_API_KEY` is set in Netlify environment variables
   - Check the API key is valid in Google AI Studio

3. **CORS errors:**
   - The function handles CORS automatically
   - If issues persist, check the function's CORS headers

4. **Build failures:**
   - Check build logs in Netlify dashboard
   - Ensure all dependencies are in package.json

### Local Testing with Netlify Dev:
```bash
# Install netlify CLI if not already installed
npm install -g netlify-cli

# Test functions locally
netlify dev
```

## 📁 Final File Structure
```
NameForgeAI/
├── netlify/
│   └── functions/
│       └── generate-names.js     # Serverless function
├── public/
│   ├── index.html               # Updated with Netlify endpoints
│   └── test.html
├── routes/
│   └── api.js                   # Original Express routes (not used in Netlify)
├── netlify.toml                 # Netlify configuration
├── package.json                 # Dependencies
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore rules
└── README.md
```

## 🎉 Success!
Once deployed, your NameForge AI app will be live with:
- ✅ AI-powered business name generation
- ✅ Serverless backend on Netlify Functions
- ✅ Global CDN delivery
- ✅ Automatic HTTPS
- ✅ Fallback name generation when API is unavailable
