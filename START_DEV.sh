#!/bin/bash
echo "🚀 Starting FixerUppera Development Server..."
echo ""
echo "📱 Open in browser:"
echo "   Local: http://localhost:3000"
echo ""
echo "📲 On mobile (same WiFi):"
IP=$(hostname -I | awk '{print $1}')
echo "   Network: http://$IP:3000"
echo ""
echo "Press Ctrl+C to stop"
echo ""
npm run dev
