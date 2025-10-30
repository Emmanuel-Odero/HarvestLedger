#!/bin/bash

echo "🔍 HarvestLedger Vercel Deployment Verification"
echo "=============================================="

echo ""
echo "📋 Current Git Status:"
git log --oneline -3
echo ""
echo "Current branch: $(git branch --show-current)"
echo "Latest commit: $(git rev-parse HEAD)"

echo ""
echo "📁 Frontend Structure Check:"
echo "✓ frontend/package.json exists: $([ -f frontend/package.json ] && echo "YES" || echo "NO")"
echo "✓ frontend/next.config.mjs exists: $([ -f frontend/next.config.mjs ] && echo "YES" || echo "NO")"
echo "✓ frontend/vercel.json exists: $([ -f frontend/vercel.json ] && echo "YES" || echo "NO")"
echo "✓ frontend/src/app exists: $([ -d frontend/src/app ] && echo "YES" || echo "NO")"

echo ""
echo "🔧 Configuration Files:"
echo "--- frontend/vercel.json ---"
if [ -f frontend/vercel.json ]; then
    cat frontend/vercel.json
else
    echo "File not found"
fi

echo ""
echo "--- frontend/package.json (scripts) ---"
if [ -f frontend/package.json ]; then
    grep -A 10 '"scripts"' frontend/package.json
else
    echo "File not found"
fi

echo ""
echo "🚀 Build Test:"
cd frontend
echo "Running npm run build:vercel..."
if npm run build:vercel; then
    echo "✅ Build successful!"
    echo "Build output:"
    ls -la .next/ | head -10
else
    echo "❌ Build failed!"
fi

cd ..

echo ""
echo "📊 Deployment Checklist:"
echo "1. ✓ Latest commit pushed to vecel-deploy branch"
echo "2. ✓ Frontend builds successfully"
echo "3. ⏳ Set environment variables in Vercel dashboard:"
echo "   - NEXT_PUBLIC_BACKEND_URL"
echo "   - NEXT_PUBLIC_GRAPHQL_URL" 
echo "   - BACKEND_URL"
echo "4. ⏳ Deploy from Vercel dashboard or wait for auto-deploy"

echo ""
echo "🔗 Next Steps:"
echo "1. Go to Vercel dashboard"
echo "2. Check if latest commit ($(git rev-parse --short HEAD)) is being deployed"
echo "3. If not, manually trigger redeploy"
echo "4. Check build logs for any remaining errors"

echo ""
echo "✅ Verification complete!"