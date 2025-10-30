#!/bin/bash

# Frontend Refactor Commit Script
# This script commits all changes from the Vercel deployment refactor

echo "🚀 Committing HarvestLedger Frontend Refactor for Vercel Deployment..."

# Stage and commit configuration changes
echo "📝 Committing configuration changes..."
git add frontend/next.config.mjs
git add frontend/vercel.json
git add frontend/.env.local.example
git rm frontend/next.config.js
git commit -m "feat: add Vercel deployment configuration

- Replace next.config.js with next.config.mjs for ES modules
- Add vercel.json with deployment settings and environment variables
- Add .env.local.example template for environment configuration
- Configure standalone output for Vercel and export for Docker
- Add environment-aware rewrites for API proxy"

# Stage and commit API proxy implementation
echo "🔄 Committing API proxy implementation..."
git add frontend/src/app/api/proxy/[...path]/route.ts
git add frontend/src/lib/api.ts
git commit -m "feat: implement API proxy system for Vercel deployment

- Add /api/proxy/[...path]/route.ts for backend API proxying in Vercel
- Create environment-aware API client in src/lib/api.ts
- Support automatic routing: direct calls in Docker, proxy in Vercel
- Add CORS headers and error handling for proxy requests
- Enable seamless backend communication across environments"

# Stage and commit Apollo GraphQL updates
echo "🔗 Committing GraphQL client updates..."
git add frontend/src/lib/apollo-wrapper.tsx
git commit -m "feat: update Apollo client for environment-aware GraphQL

- Modify apollo-wrapper.tsx to use proxy in Vercel production
- Maintain direct GraphQL connection for Docker development
- Add client-side environment detection for GraphQL endpoint
- Preserve existing authentication and error handling"

# Stage and commit build system changes
echo "🏗️ Committing build system updates..."
git add frontend/package.json
git add frontend/scripts/build-docker.js
git commit -m "feat: implement dual build system for Vercel and Docker

- Add build:vercel script for standalone output
- Add build:docker script with API directory exclusion
- Create build-docker.js script to handle static export builds
- Maintain separate build processes for different deployment targets
- Preserve existing development and production scripts"

# Stage and commit Docker configuration updates
echo "🐳 Committing Docker configuration updates..."
git add frontend/Dockerfile
git add frontend/Dockerfile.prod
git commit -m "feat: update Docker configuration for dual deployment

- Add DOCKER_BUILD environment variable to development Dockerfile
- Update production Dockerfile for static export serving
- Maintain hot reload capability for development
- Optimize production Docker build with multi-stage process
- Add serve package for static file serving in production"

# Stage and commit gitignore updates
echo "📁 Committing gitignore updates..."
git add frontend/.gitignore
git commit -m "chore: update .gitignore for Vercel deployment

- Add Vercel-specific ignore patterns
- Include backup file patterns from build process
- Maintain existing ignore rules for development"

# Stage and commit documentation
echo "📚 Committing documentation..."
git add frontend/README.md
git add frontend/DEPLOYMENT.md
git add FRONTEND_REFACTOR_SUMMARY.md
git commit -m "docs: add comprehensive deployment documentation

- Create detailed README.md with usage instructions
- Add DEPLOYMENT.md with step-by-step deployment guide
- Include FRONTEND_REFACTOR_SUMMARY.md with complete change overview
- Document environment configuration and API routing
- Add troubleshooting guides and performance metrics"

echo "✅ All frontend refactor changes committed successfully!"
echo ""
echo "📋 Summary of commits:"
echo "1. Configuration changes (next.config.mjs, vercel.json, env template)"
echo "2. API proxy implementation (proxy routes, API client)"
echo "3. GraphQL client updates (environment-aware Apollo)"
echo "4. Build system updates (dual build scripts)"
echo "5. Docker configuration updates (development and production)"
echo "6. Gitignore updates (Vercel patterns)"
echo "7. Documentation (README, deployment guide, summary)"
echo ""
echo "🚀 Ready for Vercel deployment!"
echo "Next steps:"
echo "1. Push to repository: git push origin vecel-deploy"
echo "2. Connect repository to Vercel"
echo "3. Set environment variables in Vercel dashboard"
echo "4. Deploy!"