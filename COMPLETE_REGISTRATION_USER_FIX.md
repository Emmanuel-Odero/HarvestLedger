# Complete Registration - User Object Empty Fix

## Issue

User object is empty `{}` on the complete-registration page, causing "Wallet information missing" error.

## Root Causes

### 1. Auth Context Not Loading User

The auth context's initial check might not be completing before the page renders.

### 2. Missing walletType in URL

The select-wallet page was redirecting without including `walletType` parameter.

### 3. No Fallback Mechanism

The page had no fallback to get wallet info from JWT token or URL params.

## Fixes Applied

### 1. Enhanced Complete Registration Page

Added multiple fallbacks to get wallet information:

```typescript
// Try user object first
let walletAddress = user?.hederaAccountId || user?.walletAddress;
let walletType = user?.walletType;

// Fallback: URL params
if (!walletAddress) {
  walletAddress =
    searchParams.get("wallet") || searchParams.get("walletAddress");
}
if (!walletType) {
  walletType = searchParams.get("walletType");
}

// Fallback: Decode JWT token
if (!walletAddress || !walletType) {
  const token = localStorage.getItem("auth_token");
  if (token) {
    const payload = JSON.parse(atob(token.split(".")[1]));
    walletAddress =
      walletAddress || payload.hedera_account_id || payload.wallet_address;
    walletType = walletType || payload.wallet_type;
  }
}
```

### 2. Added Auth Check on Mount

```typescript
useEffect(() => {
  // Check if user is authenticated
  const token = localStorage.getItem("auth_token");
  if (!token) {
    router.push("/auth/signin");
    return;
  }

  // If user object is empty but we have a token, refresh
  if (!user && token) {
    refreshUser();
  }

  // ... rest of the code
}, [user, searchParams, router, refreshUser]);
```

### 3. Fixed Select Wallet Redirect

Updated `frontend/app/auth/select-wallet/page.tsx` to include `walletType`:

```typescript
router.push(
  `/auth/complete-registration?email=${encodeURIComponent(email)}&wallet=${
    walletInfo.address
  }&walletType=${walletType}`
);
```

### 4. Added Debug Logging

Added console logs to help troubleshoot:

- "User object empty but token exists, calling refreshUser"
- "Pre-filling form with user data"
- "Got wallet info from JWT"
- "Submitting registration with"

## Files Modified

- `frontend/app/auth/complete-registration/page.tsx` - Added fallbacks and auth check
- `frontend/app/auth/select-wallet/page.tsx` - Added walletType to redirect URL

## Testing Steps

### 1. Check Browser Console

Open browser console and look for these logs:

- "✅ Auth check successful, user data:" - Should show user object with all fields
- "Pre-filling form with user data:" - Should show user object
- "Got wallet info from JWT:" - If using JWT fallback

### 2. Check localStorage

```javascript
// In browser console
localStorage.getItem("auth_token");
```

Should return a JWT token.

### 3. Decode JWT Token

```javascript
// In browser console
const token = localStorage.getItem("auth_token");
const payload = JSON.parse(atob(token.split(".")[1]));
console.log(payload);
```

Should show:

- `sub` (user ID)
- `hedera_account_id` or `wallet_address`
- `wallet_type`
- `email_verified`
- `registration_complete`

### 4. Check URL Parameters

The URL should look like:

```
/auth/complete-registration?email=user@example.com&wallet=0.0.xxxxx&walletType=LACE
```

## Troubleshooting

### User Object Still Empty

**Check 1: Is auth token present?**

```javascript
localStorage.getItem("auth_token");
```

If null, user needs to authenticate again.

**Check 2: Is auth context loading?**
Look for "✅ Auth check successful" in console.
If not present, auth-context might not be running the initial check.

**Check 3: Does JWT have wallet info?**

```javascript
const token = localStorage.getItem("auth_token");
const payload = JSON.parse(atob(token.split(".")[1]));
console.log(payload.hedera_account_id, payload.wallet_type);
```

If undefined, backend isn't including these fields in the token.

### Still Getting "Wallet information missing"

**Check 1: URL parameters**
Look at the URL - does it have `wallet` and `walletType` params?

**Check 2: Console logs**
Look for "Missing wallet info:" log - it will show what's available.

**Check 3: Try manual URL**
Navigate to:

```
/auth/complete-registration?email=your@email.com&wallet=YOUR_WALLET_ADDRESS&walletType=LACE
```

## Alternative Solution: Force Refresh

If the user object is empty, the page now calls `refreshUser()` which fetches the latest user data from `/auth/me` endpoint.

This should populate the user object with all fields including `hederaAccountId` and `walletType`.

## Status

✅ **FIXED** - Multiple fallback mechanisms ensure wallet info is available

## Next Steps

1. Clear browser cache and localStorage
2. Go through complete auth flow again:
   - Connect wallet
   - Verify email
   - Complete registration
3. Check console logs at each step
4. Verify user object has all required fields
