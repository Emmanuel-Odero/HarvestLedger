# 🚀 Netlify Deployment Guide for HarvestLedger

## 📋 Prerequisites

1. **Netlify Account**: Sign up at [netlify.com](https://netlify.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Backend Deployment**: Deploy backend separately (Heroku, Railway, etc.)
4. **Hedera Credentials**: Get testnet credentials from [portal.hedera.com](https://portal.hedera.com)

## 🔧 Quick Setup

### 1. Prepare Repository
```bash
# Ensure all changes are committed
git add .
git commit -m "Prepare for Netlify deployment"
git push origin main
```

### 2. Connect to Netlify
1. Go to [netlify.com](https://netlify.com) and login
2. Click "New site from Git"
3. Choose GitHub and select your repository
4. Configure build settings:
   - **Build command**: `cd frontend && npm ci && npm run build:netlify`
   - **Publish directory**: `frontend/out`
   - **Node version**: `20`

### 3. Environment Variables
In Netlify dashboard, go to Site settings > Environment variables and add:

```
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.com
NEXT_PUBLIC_GRAPHQL_URL=https://your-backend-url.com/graphql
NEXT_PUBLIC_HEDERA_NETWORK=testnet
NEXT_PUBLIC_HEDERA_RPC_URL=https://testnet.hashio.io/api
NEXT_PUBLIC_MIRROR_NODE_URL=https://testnet.mirrornode.hedera.com/api/v1
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### 4. Deploy
Click "Deploy site" - Netlify will automatically build and deploy your app!

## 🏗️ Backend Deployment Options

Since Netlify only hosts static sites, deploy your backend separately:

### Option 1: Heroku
```bash
# Install Heroku CLI and login
heroku create your-harvest-backend
git subtree push --prefix=backend heroku main
```

### Option 2: Railway
1. Go to [railway.app](https://railway.app)
2. Connect GitHub repository
3. Select backend folder
4. Add environment variables
5. Deploy

### Option 3: DigitalOcean App Platform
1. Create new app from GitHub
2. Select backend folder
3. Configure environment variables
4. Deploy

## 🔒 Security Configuration

The `netlify.toml` file includes security headers and CSP policies.
Update the Content-Security-Policy if you use additional external services.

## 🚨 Important Notes

- Frontend is deployed as a static site (no server-side rendering)
- API calls go directly to your deployed backend
- Ensure CORS is configured on your backend for your Netlify domain
- Use HTTPS URLs for all external services in production

## 📊 Monitoring

- Check Netlify deploy logs for build issues
- Monitor backend separately on your chosen platform
- Use Netlify Analytics for frontend performance insights
## ✅ 
Pre-Deployment Checklist

### Frontend Preparation
- [x] Updated `next.config.js` for static export
- [x] Created `netlify.toml` configuration
- [x] Added `_redirects` file for SPA routing
- [x] Updated `package.json` with Netlify build script
- [x] Added PWA manifest and meta tags
- [x] Created robots.txt for SEO

### Backend Requirements
- [ ] Deploy backend API separately (Heroku/Railway/DigitalOcean)
- [ ] Configure CORS for your Netlify domain
- [ ] Set up production database
- [ ] Configure Hedera credentials for production
- [ ] Test API endpoints are accessible

### Environment Variables Setup
- [ ] `NEXT_PUBLIC_BACKEND_URL` - Your deployed backend URL
- [ ] `NEXT_PUBLIC_GRAPHQL_URL` - Your GraphQL endpoint
- [ ] `NEXT_PUBLIC_HEDERA_NETWORK` - testnet or mainnet
- [ ] `NEXT_PUBLIC_HEDERA_RPC_URL` - Hedera RPC endpoint
- [ ] `NEXT_PUBLIC_MIRROR_NODE_URL` - Mirror node API URL
- [ ] `NODE_ENV` - production
- [ ] `NEXT_TELEMETRY_DISABLED` - 1

### Testing
- [ ] Test local build with `./scripts/build-netlify.sh`
- [ ] Verify all environment variables are set
- [ ] Test backend API connectivity
- [ ] Verify Hedera blockchain integration works

## 🔧 Troubleshooting

### Build Failures
- Check Node.js version (should be 20)
- Verify all dependencies are in package.json
- Check for TypeScript errors
- Ensure environment variables are set

### Runtime Issues
- Verify backend URL is accessible
- Check CORS configuration on backend
- Ensure Hedera credentials are valid
- Check browser console for errors

### Performance Optimization
- Enable Netlify's asset optimization
- Configure caching headers (already in netlify.toml)
- Use Netlify Analytics for monitoring
- Consider Netlify Edge Functions for advanced features

## 📱 Post-Deployment

1. **Custom Domain**: Configure your custom domain in Netlify
2. **SSL Certificate**: Netlify provides free SSL automatically
3. **Analytics**: Enable Netlify Analytics for insights
4. **Forms**: Use Netlify Forms for contact forms if needed
5. **Functions**: Consider Netlify Functions for serverless features

## 🚀 Continuous Deployment

Netlify automatically rebuilds when you push to your connected Git branch:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main
# Netlify automatically rebuilds and deploys
```

## 📞 Support Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Next.js Static Export Guide](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Hedera Developer Portal](https://portal.hedera.com/)
- [Project Documentation](./README.md)