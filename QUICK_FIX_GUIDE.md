# Quick Fix Guide - If Still Having Issues

## 🚨 User Object Empty on Complete Registration?

### Quick Checks (Do these in browser console)

```javascript
// 1. Check if you have an auth token
localStorage.getItem("auth_token");
// Should return a long string (JWT token)

// 2. Decode the token to see what's inside
const token = localStorage.getItem("auth_token");
if (token) {
  const payload = JSON.parse(atob(token.split(".")[1]));
  console.log("Token payload:", payload);
  // Should show: sub, hedera_account_id, wallet_type, etc.
}

// 3. Check current URL parameters
console.log("URL params:", window.location.search);
// Should show: ?email=...&wallet=...&walletType=...
```

### Quick Fixes

#### Fix 1: Clear Everything and Start Fresh

```javascript
// In browser console:
localStorage.clear();
sessionStorage.clear();
// Then refresh page and go through auth flow again
```

#### Fix 2: Manually Add URL Parameters

If you know your wallet address and type, navigate to:

```
/auth/complete-registration?email=YOUR_EMAIL&wallet=YOUR_WALLET_ADDRESS&walletType=LACE
```

Replace:

- `YOUR_EMAIL` with your email
- `YOUR_WALLET_ADDRESS` with your Lace wallet address
- `LACE` with your wallet type (LACE, HASHPACK, METAMASK, NAMI, etc.)

#### Fix 3: Check Backend Response

```javascript
// In browser console:
fetch("http://localhost:8000/auth/me", {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
  },
})
  .then((r) => r.json())
  .then((data) => console.log("User from backend:", data));
```

This should return your user object with all fields.

### Expected Flow

1. **Connect Wallet** → Creates user, stores JWT token
2. **Verify Email** → Links email to user
3. **Complete Registration** → Updates profile

At step 3, you should have:

- ✅ JWT token in localStorage
- ✅ User object in auth context
- ✅ URL params with wallet info
- ✅ OR ability to decode JWT for wallet info

### Debug Logs to Look For

When you load the complete-registration page, you should see:

```
✅ Auth check successful, user data: {id: "...", email: "...", ...}
Pre-filling form with user data: {fullName: "...", ...}
```

If you see:

```
User object empty but token exists, calling refreshUser
```

That's OK - it will fetch the user data.

If you see:

```
Missing wallet info: {user: {}, walletAddress: undefined, walletType: undefined}
```

Then the fallbacks aren't working. Check:

1. Is there a token in localStorage?
2. Does the URL have wallet params?
3. Does the JWT contain wallet info?

### Still Not Working?

1. **Check backend logs**:

   ```bash
   docker logs harvest_backend --tail 100 | grep -i "auth\|wallet"
   ```

2. **Restart backend**:

   ```bash
   docker compose restart backend
   ```

3. **Clear browser cache completely**:

   - Chrome: Ctrl+Shift+Delete → Clear all
   - Firefox: Ctrl+Shift+Delete → Clear all

4. **Try incognito/private mode**:

   - Fresh session without cached data

5. **Check network tab**:
   - Open DevTools → Network
   - Look for `/auth/me` request
   - Check if it returns user data

### Contact Support

If none of these work, provide:

1. Browser console logs
2. Network tab screenshot showing `/auth/me` response
3. JWT token payload (decoded)
4. URL you're trying to access

## 🎯 Expected Working State

After all fixes, you should be able to:

1. Connect Lace wallet ✅
2. Verify email ✅
3. See complete-registration form pre-filled ✅
4. Submit form successfully ✅
5. Redirect to dashboard ✅

The system now has 3 layers of fallback to get wallet info, so it should work!
