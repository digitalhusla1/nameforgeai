# NameForge AI - Business Name Generator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v14%2B-green.svg)](https://nodejs.org/)
[![Netlify Status](https://api.netlify.com/api/v1/badges/your-badge-id/deploy-status)](https://app.netlify.com/sites/nameforgeai/deploys)

A modern, AI-powered business name generator that creates creative and professional business names using Replicate's Llama AI model. Features a beautiful responsive UI with serverless architecture optimized for Netlify deployment.

🌐 **Live Demo**: [https://nameforgeai.netlify.app](https://nameforgeai.netlify.app)

## ✨ Features

- 🤖 **Replicate AI Integration**: Uses Replicate's Llama 2 model for creative name generation
- 🎨 **Beautiful UI**: Modern, responsive design with gradient backgrounds and smooth animations
- 🔒 **Secure Serverless Architecture**: Netlify Functions keep API keys safe with environment variables
- 🛡️ **Rate Limiting**: Built-in protection against API abuse
- 📋 **Copy to Clipboard**: One-click copying of generated names
- ⚡ **Real-time Validation**: Input validation and user-friendly error messages
- 🌐 **CORS Protection**: Configurable cross-origin resource sharing
- 📱 **Mobile Responsive**: Works perfectly on all device sizes
- ☁️ **Serverless Deployment**: Optimized for Netlify with automatic scaling
- ⚡ **Fast Response**: Optimized API calls with 20-second average response time

## 🚀 Quick Start

### Prerequisites

- **Node.js** v14.0.0 or higher (for local development)
- **Replicate API Token** ([Get one here](https://replicate.com/account/api-tokens))
- **Netlify Account** for deployment ([Sign up here](https://netlify.com))

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nameforgeai.git
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
   
   # Edit .env and add your API key
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

2. **Connect to Netlify**: 
   - Go to [Netlify](https://netlify.com) 
   - Click "New site from Git"
   - Choose GitHub and select your forked repository
   - Use these build settings:
     - **Build command**: `npm install` (or leave empty)
     - **Publish directory**: `public`
     - **Functions directory**: `netlify/functions`

3. **Set Environment Variables** in Netlify Dashboard:
   - Go to Site settings → Environment variables
   - Add: `REPLICATE_API_TOKEN` with your Replicate API token
   - Add: `NODE_ENV` set to `production`

4. **Deploy**: Click "Deploy site" - Netlify will automatically build and deploy your site

5. **Custom Domain** (Optional):
   - In Site settings → Domain management
   - Add your custom domain and configure DNS

## 🔧 Configuration

### Environment Variables

The application uses Replicate AI for business name generation. Create a `.env` file with the following variables:

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `REPLICATE_API_TOKEN` | Your Replicate API token (must start with `r8_`) | - | ✅ |
| `PORT` | Server port (local development only) | `3000` | ❌ |
| `NODE_ENV` | Environment mode | `development` | ❌ |

### Example .env file
```env
# Required - Replicate API Token
REPLICATE_API_TOKEN=r8_your_replicate_token_here

# Optional - Server Configuration
PORT=3000
NODE_ENV=development
```

### API Key Setup

**Replicate API**:
- Visit [Replicate Account](https://replicate.com/account/api-tokens)
- Create an API token (starts with `r8_`)
- Add to `REPLICATE_API_TOKEN` in your `.env` file

## 📁 Project Structure

```
NameForgeAI/
├── 📁 public/                 # Static frontend files
│   ├── index.html             # Main application page
│   ├── about.html             # About page
│   ├── contact.html           # Contact page
│   ├── privacy-policy.html    # Privacy policy page
│   ├── index-local.html       # Local development version
│   ├── index-netlify.html     # Netlify-specific version
│   ├── index-universal.html   # Universal version
│   └── js/
│       └── config.js          # Frontend configuration
├── 📁 netlify/                # Netlify deployment files
│   └── functions/
│       └── generate-names.js  # Serverless function for name generation
├── 📄 netlify.toml            # Netlify deployment configuration
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

- **Static File Serving**: HTML, CSS, and JavaScript served locally for development
- **Netlify Functions**: Local simulation of serverless functions using Netlify CLI
- **Replicate AI Integration**: Uses Replicate's Llama 2 model for name generation
- **Environment Variables**: Local .env file for API key management
- **Timeout Protection**: 25-second timeout protection to prevent function timeouts

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
  "source": "replicate",
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

### Supported AI Provider

**Replicate**: Uses Llama 2-7B Chat model for creative and professional business name generation with optimized prompts for fast responses (~20 seconds average)

### Validation Rules

- **Description**: Required, 3-500 characters
- **Content Type**: Must be `application/json`
- **Rate Limit**: 100 requests per 15 minutes per IP

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Netlify development server |
| `npm run build` | Build for production (if needed) |
| `npm test` | Run tests (placeholder) |

## 🏗️ Architecture

### Backend Components

- **Netlify Functions**: Serverless function for name generation (`generate-names.js`)
- **Replicate Integration**: Communicates with Replicate's Llama 2 API
- **Timeout Protection**: 25-second timeout to prevent function timeouts
- **Input Validation**: Server-side validation of business descriptions
- **Error Handling**: Graceful error responses with user-friendly messages

### Frontend Components

- **Responsive UI**: Modern CSS with gradient backgrounds and animations
- **JavaScript API Client**: Handles form submission and API communication
- **Loading States**: Visual feedback during API calls
- **Notification System**: User-friendly error and success messages
- **Copy Functionality**: One-click clipboard integration

### Security Features

- **API Key Protection**: Keys stored securely in Netlify environment variables
- **Input Validation**: Server-side validation of all inputs
- **Timeout Protection**: Prevents function timeouts with 25-second limit
- **Error Sanitization**: Safe error messages without sensitive data
- **Serverless Security**: Built-in security features of Netlify Functions

## 🚀 Production Deployment

### Netlify Deployment (Recommended)

This application is optimized for Netlify deployment:

1. **Automatic Builds**: Push to GitHub triggers automatic deployment
2. **Environment Variables**: Set `REPLICATE_API_TOKEN` in Netlify dashboard
3. **CDN Distribution**: Global CDN for fast content delivery
4. **HTTPS**: Automatic SSL certificate provisioning
5. **Custom Domains**: Easy custom domain configuration

### Manual Deployment Steps

```bash
# 1. Build the project (if needed)
npm run build

# 2. Deploy to Netlify via CLI
npm install -g netlify-cli
netlify deploy --prod --dir=public --functions=netlify/functions

# 3. Set environment variables
netlify env:set REPLICATE_API_TOKEN your_token_here
netlify env:set NODE_ENV production
```

## 🧪 Development

### Local Development
```bash
# Install Netlify CLI for local development
npm install -g netlify-cli

# Start development server with Netlify functions
netlify dev
```

### Testing the API
```bash
# Test the Netlify function locally
curl -X POST http://localhost:8888/.netlify/functions/generate-names \
  -H "Content-Type: application/json" \
  -d '{\"description\": \"tech startup\"}'
```

## 📦 Dependencies

### Production Dependencies
- **@netlify/functions**: Netlify Functions runtime
- **replicate**: Official Replicate API client
- **dotenv**: Environment variable loader (for local development)

### Development Dependencies
- **netlify-cli**: Local development server with functions support

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Replicate](https://replicate.com/) for providing access to Llama 2 AI model
- [Netlify](https://netlify.com/) for serverless hosting and functions
- [Font Awesome](https://fontawesome.com/) for icons (if used)

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page
2. Create a new issue if your problem isn't already reported
3. Provide detailed information about your environment and the issue

---

**Made with ❤️ by [Your Name]**
