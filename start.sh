#!/bin/bash

# Production deployment script for NameForge AI

echo "🚀 Starting NameForge AI deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Set environment variables
export NODE_ENV=production
export PORT=${PORT:-3000}

# Start the application
echo "🌟 Starting NameForge AI server..."
node server.js
