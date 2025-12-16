#!/bin/bash

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "📦 Building Frontend for Production..."
cd client
npm run build
cd ..

echo "---------------------------------------------------"
echo "✅ Build Complete!"
echo "🚀 Starting High-Performance Server..."
echo "---------------------------------------------------"
echo "📡 Wi-Fi Access: Connect to the IP below on Port 3000"
# Try to find local IP (works on Mac)
ipconfig getifaddr en0 || ipconfig getifaddr en1 || echo "Check your Network Settings for IP"
echo "---------------------------------------------------"


cd server
node index.js
