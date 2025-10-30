# HarvestLedger Frontend Deployment Guide

This frontend is configured for dual deployment: **Vercel for production** and **Docker for development**.

## 🚀 Vercel Deployment (Production)

### Prerequisites
1. Vercel account
2. Backend API deployed and accessible
3. Environment variables configured

### Setup Steps

1. **Connect Repository to Vercel**
   ```bash
   # Install Vercel CLI (optional)
   npm i -g vercel
   
   # Deploy from repository root/frontend
   cd frontend
   vercel
   ```

2. **Configure Environment Variables in Vercel Dashboard**
   ```
   NEXT_PUBLIC_BACKEND_URL=https://your-backend-domain.com
   NEXT_PUBLIC_GRAPHQL_URL=https://your-backend-domain.com/graphql
   BACKEND_URL=https://your-backend-domain.com
   ```

3. **Build Configuration**
   - Framework: Next.js
   - Build Command: `npm run build:vercel`
   - Output Directory: `.next`
   - Install Command: `npm install`

### Features in Production
- ✅ Standalone output for optimal performance
- ✅ API proxy routes (`/api/proxy/*`) for backend calls
- ✅ Automatic CORS handling
- ✅ Environment-based configuration
- ✅ Optimized images and assets

## 🐳 Docker Development

### Local Development
```bash
# Start development server
docker-compose up frontend

# Or run directly
cd frontend
npm run dev
```

### Production Docker Build
```bash
# Build production Docker image
docker-compose -f docker-compose.prod.yml up frontend

# Or build manually
cd frontend
docker build -f Dockerfile.prod -t harvest-ledger-frontend .
docker run -p 3000:3000 harvest-ledger-frontend
```

## 🔧 Configuration Details

### Environment Detection
The app automatically detects the deployment environment:

- **Vercel Production**: Uses `/api/proxy/*` routes and standalone output
- **Docker Development**: Uses static export and direct backend URLs
- **Local Development**: Direct backend connection

### API Routing
- **Development**: Direct calls to `http://localhost:8000`
- **Docker**: Direct calls to `http://backend:8000`
- **Vercel**: Proxied through `/api/proxy/*` routes

### Build Outputs
- **Vercel**: `.next/standalone` (optimized server)
- **Docker**: `out/` (static export)
- **Development**: `.next/` (development build)

## 📁 Key Files

```
frontend/
├── next.config.mjs          # Environment-aware Next.js config
├── vercel.json              # Vercel deployment configuration
├── src/app/api/proxy/       # API proxy routes for Vercel
├── src/lib/api.ts           # Environment-aware API utilities
├── Dockerfile               # Development Docker setup
├── Dockerfile.prod          # Production Docker setup
└── .env.local.example       # Environment variables template
```

## 🔄 Deployment Workflow

### For Vercel
1. Push to main branch
2. Vercel auto-deploys
3. Uses standalone output
4. API calls go through proxy

### For Docker
1. Build with `DOCKER_BUILD=true`
2. Generates static export
3. Serves with static file server
4. Direct backend connection

## 🛠 Troubleshooting

### Vercel Issues
- Check environment variables in dashboard
- Verify backend URL is accessible
- Check function logs for proxy errors

### Docker Issues
- Ensure backend service is running
- Check network connectivity between containers
- Verify environment variables in docker-compose

### API Proxy Issues
- Check `/api/proxy/[...path]/route.ts` logs
- Verify CORS headers
- Ensure backend accepts requests from frontend domain

## 📊 Performance

### Vercel Benefits
- Edge deployment
- Automatic scaling
- Optimized builds
- CDN distribution

### Docker Benefits
- Consistent environment
- Local development
- Full stack integration
- Hot reload support