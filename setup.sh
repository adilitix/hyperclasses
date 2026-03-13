#!/bin/bash

# Load NVM (Node Version Manager) if it exists
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Check if node is available
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not detected."
    echo "Please restart your terminal to load the new settings, then try again."
    exit 1
fi

echo "✅ Node.js detected: $(node -v)"

echo "Installing Server Dependencies..."
cd server
npm install
cd ..

echo "Installing Client Dependencies..."
cd client
npm install
cd ..

echo "Installing Adilitix Dependencies..."
cd adilitix
npm install
cd ..

echo "-----------------------------------"
echo "✅ Setup Complete!"
echo "-----------------------------------"
echo "To run the app, OPEN TWO TERMINALS:"
echo ""
echo "1️⃣  Terminal 1: Start Server"
echo "    cd server"
echo "    npm run dev" 

echo ""
echo "2️⃣  Terminal 2: Start Client"
echo "    cd client"
echo "    npm run dev"
echo "-----------------------------------"
