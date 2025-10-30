#!/bin/bash

# Build script for Netlify deployment testing
# This script mimics what Netlify will do during deployment

set -e

echo "🚀 Building HarvestLedger for Netlify deployment..."

# Navigate to frontend directory
cd frontend

echo "📦 Installing dependencies..."
npm ci

echo "🏗️ Building Next.js application..."
NODE_ENV=production npm run build

echo "📁 Checking output directory..."
if [ -d "out" ]; then
    echo "✅ Static export successful! Output directory created."
    echo "📊 Build statistics:"
    du -sh out/
    echo "📄 Files in output:"
    find out -type f -name "*.html" | head -10
else
    echo "❌ Build failed - no output directory found"
    exit 1
fi

echo "🎉 Netlify build simulation complete!"
echo "💡 To deploy: Push to GitHub and connect to Netlify"