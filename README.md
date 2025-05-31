# NameForge AI - Business Name Generator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v14%2B-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.18.2-blue.svg)](https://expressjs.com/)

A modern, AI-powered business name generator that creates creative and professional business names using Google Gemini AI. Features a beautiful responsive UI with secure backend architecture.

![NameForge AI Screenshot](https://via.placeholder.com/800x400?text=NameForge+AI+Screenshot)

## ✨ Features

- 🤖 **AI-Powered Generation**: Uses Google Gemini 2.0 Flash model for intelligent name suggestions
- 🎨 **Beautiful UI**: Modern, responsive design with gradient backgrounds and smooth animations
- 🔒 **Secure Architecture**: Backend API keeps your API keys safe from frontend exposure
- 🛡️ **Rate Limiting**: Built-in protection against API abuse
- 📋 **Copy to Clipboard**: One-click copying of generated names
- 🔄 **Fallback System**: Smart fallback name generation when API is unavailable
- ⚡ **Real-time Validation**: Input validation and user-friendly error messages
- 🌐 **CORS Protection**: Configurable cross-origin resource sharing
- 📱 **Mobile Responsive**: Works perfectly on all device sizes

## 🚀 Quick Start

### Prerequisites

- **Node.js** v14.0.0 or higher
- **npm** or **yarn** package manager
- **Google Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd NameForgeAI
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
   GEMINI_API_KEY=your_actual_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000` and start generating business names!

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `GEMINI_API_KEY` | Your Google Gemini API key | - | ✅ |
| `GEMINI_API_URL` | Gemini API endpoint | `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent` | ❌ |
| `PORT` | Server port | `3000` | ❌ |
| `NODE_ENV` | Environment mode | `development` | ❌ |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | `http://localhost:3000,http://127.0.0.1:3000` | ❌ |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in milliseconds | `900000` (15 min) | ❌ |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` | ❌ |

### Example .env file
```env
GEMINI_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📁 Project Structure

```
NameForgeAI/
├── 📁 public/                 # Static frontend files
│   ├── index.html             # Main application page
│   └── test.html              # Simple test page
├── 📁 routes/                 # Express.js routes
│   └── api.js                 # API endpoints and Gemini integration
├── 📄 server.js               # Express.js server configuration
├── 📄 package.json            # Node.js dependencies and scripts
├── 📄 .env.example            # Environment variables template
├── 📄 .gitignore              # Git ignore rules
└── 📄 README.md               # Project documentation
```

## 🌐 API Documentation

### Generate Business Names

**Endpoint:** `POST /api/generate-names`

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
  "source": "gemini"
}
```

**Response (Error):**
```json
{
  "error": "Validation error",
  "message": "Business description is required"
}
```

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
