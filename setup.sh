#!/bin/bash

# Setup script for Sistema Repartidores

echo "🚀 Setting up Sistema de Repartidores..."
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v14 or higher."
    exit 1
fi

echo "✅ Node.js $(node --version) found"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm $(npm --version) found"

# Check MongoDB
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not installed or not in PATH."
    echo "   Please ensure MongoDB is installed and running."
else
    echo "✅ MongoDB found"
fi

echo ""
echo "📦 Installing server dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install server dependencies"
    exit 1
fi

echo ""
echo "📦 Installing client dependencies..."
cd client
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install client dependencies"
    exit 1
fi

cd ..

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration"
fi

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Edit .env file with your MongoDB connection string"
echo "   2. Start MongoDB: sudo systemctl start mongodb (Linux) or net start MongoDB (Windows)"
echo "   3. Start the backend server: npm run dev"
echo "   4. In another terminal, start the frontend: cd client && npm run dev"
echo ""
echo "🌐 Access the application at http://localhost:3000"
echo ""
