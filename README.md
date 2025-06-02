# NameForge AI - Business Name Generator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v14%2B-green.svg)](https://nodejs.org/)
[![Netlify Status](https://api.netlify.com/api/v1/badges/your-badge-id/deploy-status)](https://app.netlify.com/sites/nameforgeai/deploys)

A modern, AI-powered business name generator that creates creative and professional business names using multiple AI providers including Google Gemini and Replicate. Features a beautiful responsive UI with serverless architecture optimized for Netlify deployment.

🌐 **Live Demo**: [https://nameforgeai.netlify.app](https://nameforgeai.netlify.app)

## ✨ Features

- 🤖 **Multi-AI Integration**: Uses Google Gemini and Replicate APIs for diverse name suggestions
- 🎨 **Beautiful UI**: Modern, responsive design with gradient backgrounds and smooth animations
- 🔒 **Secure Serverless Architecture**: Netlify Functions keep API keys safe with environment variables
- 🛡️ **Rate Limiting**: Built-in protection against API abuse
- 📋 **Copy to Clipboard**: One-click copying of generated names
- 🔄 **Smart Fallback System**: Multiple AI providers ensure high availability
- ⚡ **Real-time Validation**: Input validation and user-friendly error messages
- 🌐 **CORS Protection**: Configurable cross-origin resource sharing
- 📱 **Mobile Responsive**: Works perfectly on all device sizes
- ☁️ **Serverless Deployment**: Optimized for Netlify with automatic scaling

## 🚀 Quick Start

### Prerequisites

- **Node.js** v14.0.0 or higher (for local development)
- **Google Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey))
- **Netlify Account** for deployment ([Sign up here](https://netlify.com))

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/digitalhusla1/nameforgeai.git
   cd nameforgeai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env
     # Edit .env and add your API keys
   GEMINI_API_KEY=your_actual_api_key_here
   REPLICATE_API_TOKEN=r8_your_replicate_token_here
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000` and start generating business names!

### Netlify Deployment

1. **Fork this repository** to your GitHub account
2. **Connect to Netlify**: Go to [Netlify](https://netlify.com) and connect your GitHub repo
3. **Set Environment Variables** in Netlify Dashboard:
   - `GEMINI_API_KEY`
   - `REPLICATE_API_TOKEN`
   - `NODE_ENV=production`
4. **Deploy**: Netlify will automatically build and deploy your site

## 🔧 Configuration

### Environment Variables

The application supports multiple AI providers. Create a `.env` file with the following variables:

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `GEMINI_API_KEY` | Your Google Gemini API key | - | ✅ |
| `REPLICATE_API_TOKEN` | Your Replicate API token (must start with `r8_`) | - | ❌ |
| `GEMINI_API_URL` | Gemini API endpoint | `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent` | ❌ |
| `PORT` | Server port | `3000` | ❌ |
| `NODE_ENV` | Environment mode | `development` | ❌ |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | `http://localhost:3000,http://127.0.0.1:3000` | ❌ |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in milliseconds | `900000` (15 min) | ❌ |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` | ❌ |

### Example .env file
```env
# Required
GEMINI_API_KEY=your_actual_gemini_api_key_here

# Optional (for enhanced functionality)
REPLICATE_API_TOKEN=r8_your_replicate_token_here

# Server Configuration
PORT=3000
NODE_ENV=development
```

### API Key Setup

1. **Google Gemini API**:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy and add to `GEMINI_API_KEY`

2. **Anthropic Claude API** (Optional):
   - Visit [Anthropic Console](https://console.anthropic.com/)2. **Replicate API** (Optional):
   - Visit [Replicate Account](https://replicate.com/account/api-tokens)
   - Create an API token (starts with `r8_`)
   - Add to `REPLICATE_API_TOKEN`

## 📁 Project Structure

```
NameForgeAI/
├── 📁 public/                 # Static frontend files
│   ├── index.html             # Main application page
│   ├── about.html             # About page
│   ├── contact.html           # Contact page
│   ├── privacy-policy.html    # Privacy policy page
│   └── js/
│       └── config.js          # Frontend configuration
├── 📁 netlify/                # Netlify deployment files
│   └── functions/
│       └── generate-names.js  # Serverless function for name generation
├── 📄 netlify.toml            # Netlify deployment configuration
├── 📄 server.js               # Express.js server (for local development)
├── 📄 package.json            # Node.js dependencies and scripts
├── 📄 .env.example            # Environment variables template
├── 📄 .gitignore              # Git ignore rules
└── 📄 README.md               # Project documentation
```

## 🏗️ Architecture

### Serverless Architecture (Production)

- **Netlify Functions**: Handles API requests serverlessly
- **Static Site Hosting**: HTML, CSS, and JavaScript served via Netlify CDN
- **Environment Variables**: Secure API key storage in Netlify
- **Automatic Deployments**: Git-based deployment pipeline

### Local Development Architecture

- **Express.js Server**: Handles HTTP requests and serves static files during development
- **API Routes**: RESTful endpoints for name generation
- **Multi-AI Integration**: Supports Gemini, Anthropic, and Replicate APIs
- **Security Middleware**: CORS, rate limiting, input validation

## 🌐 API Documentation

### Generate Business Names

**Endpoint:** `/.netlify/functions/generate-names` (Production) or `POST /api/generate-names` (Local)

**Request Body:**
```json
{
  "description": "eco-friendly coffee shop"
}
```

**Response (Success):**
```json
{
  "success": true,
  "names": [
    {
      "name": "GreenBean Collective",
      "description": "A name that emphasizes environmental consciousness and community"
    },
    {
      "name": "EcoBrews",
      "description": "Simple, memorable name combining eco-friendliness with coffee culture"
    }
  ],
  "source": "gemini",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**Response (Error):**
```json
{
  "error": "Validation error",
  "message": "Business description is required",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### Supported AI Providers

1. **Google Gemini** (Primary): High-quality creative name generation
2. **Anthropic Claude** (Fallback): Sophisticated reasoning and creativity
3. **Replicate** (Fallback): Access to various open-source models

### Validation Rules

- **Description**: Required, 3-500 characters
- **Content Type**: Must be `application/json`
- **Rate Limit**: 100 requests per 15 minutes per IP

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start the production server |
| `npm run dev` | Start development server with nodemon |
| `npm test` | Run tests (placeholder) |

## 🏗️ Architecture

### Backend Components

- **Express.js Server**: Handles HTTP requests and serves static files
- **API Routes**: RESTful endpoints for name generation
- **Gemini Integration**: Communicates with Google's AI API
- **Security Middleware**: CORS, rate limiting, input validation
- **Error Handling**: Graceful error responses and fallback generation

### Frontend Components

- **Responsive UI**: Modern CSS with gradient backgrounds and animations
- **JavaScript API Client**: Handles form submission and API communication
- **Loading States**: Visual feedback during API calls
- **Notification System**: User-friendly error and success messages
- **Copy Functionality**: One-click clipboard integration

### Security Features

- **API Key Protection**: Keys stored securely on backend
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Server-side validation of all inputs
- **CORS Configuration**: Controlled cross-origin access
- **Error Sanitization**: Safe error messages without sensitive data

## 🚀 Production Deployment

### 1. Environment Setup
```bash
# Set production environment
export NODE_ENV=production

# Use production port
export PORT=80
```

### 2. Process Management (PM2)
```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start server.js --name "nameforge-ai"

# Save PM2 configuration
pm2 save

# Enable startup script
pm2 startup
```

### 3. Reverse Proxy (Nginx)
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. SSL Configuration
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com
```

## 🧪 Development

### Local Development
```bash
# Install nodemon for development
npm install -g nodemon

# Start development server with auto-reload
npm run dev
```

### Testing the API
```bash
# Test the API endpoint
curl -X POST http://localhost:3000/api/generate-names \
  -H "Content-Type: application/json" \
  -d '{"description": "tech startup"}'
```

## 📦 Dependencies

### Production Dependencies
- **express**: Fast, minimalist web framework
- **cors**: Cross-Origin Resource Sharing middleware
- **dotenv**: Environment variable loader
- **express-rate-limit**: Rate limiting middleware
- **helmet**: Security middleware (optional)
- **body-parser**: Request body parsing middleware
- **node-fetch**: HTTP client for API requests

### Development Dependencies
- **nodemon**: Development server with auto-reload

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Google Gemini AI](https://deepmind.google/technologies/gemini/) for providing the AI capabilities
- [Express.js](https://expressjs.com/) for the web framework
- [Font Awesome](https://fontawesome.com/) for icons (if used)

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page
2. Create a new issue if your problem isn't already reported
3. Provide detailed information about your environment and the issue

---

**Made with ❤️ by [Your Name]**
