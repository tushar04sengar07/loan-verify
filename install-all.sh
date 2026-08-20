#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "🏦 LOANVERIFY — ONE-COMMAND DEPENDENCY INSTALLER"
echo "=========================================================="
echo ""

echo "📦 1/4 Installing Local Server Dependencies (server/)..."
cd server && npm install && cd ..
echo "✓ Local Server dependencies installed."
echo ""

echo "📦 2/4 Installing Web Dashboard Dependencies (web-dashboard/)..."
cd web-dashboard && npm install && cd ..
echo "✓ Web Dashboard dependencies installed."
echo ""

echo "📦 3/4 Installing Mobile App Dependencies (mobile/)..."
cd mobile && npm install && cd ..
echo "✓ Mobile App dependencies installed."
echo ""

echo "📦 4/4 Installing Cloud Functions Dependencies (functions/)..."
cd functions && npm install && cd ..
echo "✓ Cloud Functions dependencies installed."
echo ""

echo "=========================================================="
echo "✅ ALL DEPENDENCIES INSTALLED SUCCESSFULLY!"
echo "=========================================================="
echo ""
echo "To start the application, run in 3 separate terminals:"
echo "  Terminal 1: cd server && npm start"
echo "  Terminal 2: cd web-dashboard && npm run dev"
echo "  Terminal 3: cd mobile && npm run web"
echo "=========================================================="
