#!/bin/bash

# Exit on error
set -e

echo "🚀 Setting up AI Calendar Assistant..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    echo "📚 Visit https://nodejs.org/ to download and install Node.js"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm and try again."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📄 Creating .env file..."
    cp .env.example .env
    echo "ℹ️ Please update the .env file with your OpenAI API key and other configurations."
    echo "   Don't forget to set OPENAI_API_KEY=your_api_key_here"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Set up the database
echo "💾 Setting up the database..."
npx prisma generate
npx prisma db push

echo ""
echo "✅ Setup complete!"
echo "🚀 Start the development server with: npm run dev"
echo "🌐 Then open http://localhost:3000 in your browser"
