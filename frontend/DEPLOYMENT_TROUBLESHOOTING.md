# Vercel Deployment Troubleshooting

## 🚨 Common Issues and Solutions

### Issue: Function Runtime Error
```
Error: Function Runtimes must have a valid version, for example `now-php@1.0.0`.
```

**Solution**: 
- ✅ **Fixed**: Removed `vercel.json` file to use Next.js framework defaults
- Vercel auto-detects and configures Next.js properly
- No custom function runtime configuration needed

### Issue: Environment Variables Not Found
```
Environment Variable "NEXT_PUBLIC_BACKEND_URL" references Secret "backend-url", which does not exist.
```

**Solution**: 
- Set environment variables directly in Vercel dashboard
- Don't use secret references (`@secret-name`)
- Go to Project Settings → Environment Variables

### Issue: Build Command Not Found
```
Error: Command "npm run build:vercel" not found
```

**Solution**: 
- Leave Build Command empty in Vercel settings
- Vercel will use the default `npm run build`
- Or ensure `build:vercel` script exists in package.json

## ✅ Correct Vercel Project Settings

### Import Settings
- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `frontend`
- **Build Command**: Leave empty (auto-detected)
- **Output Directory**: Leave empty (auto-detected)
- **Install Command**: `npm install` (default)

### Environment Variables Required
```
NEXT_PUBLIC_BACKEND_URL=https://your-backend-api.com
NEXT_PUBLIC_GRAPHQL_URL=https://your-backend-api.com/graphql
BACKEND_URL=https://your-backend-api.com
```

Set these for: **Production**, **Preview**, and **Development**

## 🔍 Verification Steps

### 1. Check Build Logs
- Go to Vercel Dashboard → Deployments
- Click on latest deployment
- Check "Build Logs" for errors

### 2. Test API Proxy
After deployment, test in browser console:
```javascript
// Should work without CORS errors
fetch('/api/proxy/health')
  .then(r => r.json())
  .then(console.log)
```

### 3. Verify Environment Variables
In your deployed app, check if variables are loaded:
```javascript
console.log(process.env.NEXT_PUBLIC_BACKEND_URL)
```

## 🛠 Manual Deployment Steps

If automatic deployment fails:

1. **Clear Vercel Cache**
   ```bash
   # In Vercel dashboard
   Settings → General → Clear Build Cache
   ```

2. **Redeploy from Dashboard**
   - Go to Deployments tab
   - Click "Redeploy" on latest deployment

3. **Force New Deployment**
   ```bash
   # Make a small change and push
   git commit --allow-empty -m "trigger deployment"
   git push origin vecel-deploy
   ```

## 📊 Expected Build Output

Successful build should show:
```
✓ Creating an optimized production build
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (4/4)
✓ Collecting build traces
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    12.4 kB         105 kB
├ ○ /_not-found                          870 B          84.9 kB
└ λ /api/proxy/[...path]                 0 B                0 B
```

## 🔄 If All Else Fails

1. **Create New Vercel Project**
   - Delete current project in Vercel
   - Re-import from GitHub
   - Use framework defaults

2. **Check Repository Structure**
   ```
   HarvestLedger/
   └── frontend/          ← Set this as Root Directory
       ├── package.json
       ├── next.config.mjs
       └── src/
   ```

3. **Contact Support**
   - Vercel has excellent support
   - Include build logs and error messages
   - Mention it's a Next.js 14 App Router project

---

**Still having issues?** Check the main [VERCEL_SETUP.md](./VERCEL_SETUP.md) guide.