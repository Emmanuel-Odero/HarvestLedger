# Vercel Deployment Setup Guide

## 🚀 Quick Vercel Deployment

### Step 1: Connect Repository to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your Git repository
4. Select the `frontend` folder as the root directory

### Step 2: Configure Project Settings

Vercel will auto-detect Next.js. Verify these settings in your project:

- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `frontend`
- **Build Command**: Leave empty (uses `npm run build:vercel` from package.json)
- **Output Directory**: Leave empty (auto-detected)
- **Install Command**: `npm install` (default)
- **Node.js Version**: 18.x (recommended)

> **Note**: We're using Next.js framework defaults without a custom `vercel.json` file for maximum compatibility.

### Step 3: Set Environment Variables

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add the following variables for **Production**, **Preview**, and **Development**:

```
NEXT_PUBLIC_BACKEND_URL=https://your-backend-api.com
NEXT_PUBLIC_GRAPHQL_URL=https://your-backend-api.com/graphql
BACKEND_URL=https://your-backend-api.com
```

**Replace `https://your-backend-api.com` with your actual backend URL**

### Step 4: Deploy

1. Click **Deploy**
2. Vercel will build and deploy automatically
3. Your app will be available at `https://your-project.vercel.app`

## 🔧 Environment Variable Examples

### For Development/Testing Backend
```
NEXT_PUBLIC_BACKEND_URL=https://your-staging-api.herokuapp.com
NEXT_PUBLIC_GRAPHQL_URL=https://your-staging-api.herokuapp.com/graphql
BACKEND_URL=https://your-staging-api.herokuapp.com
```

### For Production Backend
```
NEXT_PUBLIC_BACKEND_URL=https://api.harvestledger.com
NEXT_PUBLIC_GRAPHQL_URL=https://api.harvestledger.com/graphql
BACKEND_URL=https://api.harvestledger.com
```

### For Local Backend (Preview/Development)
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:8000/graphql
BACKEND_URL=http://localhost:8000
```

## ✅ Verification

After deployment, verify:

1. **Frontend loads**: Visit your Vercel URL
2. **API proxy works**: Check browser network tab for `/api/proxy/*` calls
3. **GraphQL connects**: Verify GraphQL queries work
4. **No CORS errors**: Check browser console

## 🐛 Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Verify all dependencies are in `package.json`
- Ensure TypeScript types are correct

### API Calls Fail
- Verify `BACKEND_URL` is set correctly
- Check if backend accepts requests from Vercel domain
- Verify backend CORS configuration

### Environment Variables Not Working
- Ensure variables are set for correct environment (Production/Preview/Development)
- Variables starting with `NEXT_PUBLIC_` are exposed to browser
- `BACKEND_URL` is server-side only (for API proxy)

## 🔄 Redeployment

To redeploy:
1. Push changes to your Git repository
2. Vercel automatically rebuilds and deploys
3. Or manually trigger deployment in Vercel dashboard

## 📊 Monitoring

Use Vercel's built-in analytics:
- **Functions**: Monitor API proxy performance
- **Web Vitals**: Track frontend performance
- **Real Experience Score**: Monitor user experience

---

**Need help?** Check the [main deployment guide](./DEPLOYMENT.md) or [README](./README.md) for more details.