# User Object Mapping Fix

## Issue

Error: "Wallet information missing. Please connect your wallet first."

The complete-registration page was checking for `user.hederaAccountId` and `user.walletType`, but these properties were not being set when the user object was created after wallet authentication.

## Root Cause

The user object mapping in `auth-context.tsx` was incomplete. After wallet authentication and on initial auth check, the user object was missing several critical fields:

- `hederaAccountId`
- `walletType`
- `fullName`
- `phone`
- `address`
- `farmName`
- `companyName`

## Fixes Applied

### 1. Enhanced User Mapping After Wallet Authentication

Updated `connectWallet` function in `frontend/lib/auth-context.tsx`:

```typescript
const mappedUser = {
  id: graphqlUser.id,
  email: graphqlUser.email,
  name: graphqlUser.fullName,
  fullName: graphqlUser.fullName,
  walletAddress: graphqlUser.walletAddress || graphqlUser.hederaAccountId,
  hederaAccountId: graphqlUser.hederaAccountId || graphqlUser.walletAddress,
  walletType: walletType, // ✅ Now included from connection
  role: graphqlUser.role,
  isEmailVerified:
    graphqlUser.isEmailVerified || graphqlUser.emailVerified || false,
  phone: graphqlUser.phone,
  address: graphqlUser.address,
  farmName: graphqlUser.farmName,
  companyName: graphqlUser.companyName,
};
```

### 2. Enhanced Initial Auth Check

Updated the auth check on mount to include all fields:

```typescript
setUser({
  id: userData.id,
  email: userData.email,
  name: userData.full_name,
  fullName: userData.full_name,
  walletAddress: userData.hedera_account_id || "",
  hederaAccountId: userData.hedera_account_id, // ✅ Now included
  walletType: userData.wallet_type, // ✅ Now included
  role: userData.role,
  isEmailVerified: userData.is_verified || false,
  phone: userData.phone,
  address: userData.address,
  farmName: userData.farm_name,
  companyName: userData.company_name,
});
```

### 3. Enhanced refreshUser Method

The `refreshUser()` method already had all fields mapped correctly.

### 4. Improved Complete Registration Validation

Updated `frontend/app/auth/complete-registration/page.tsx` to:

- Use fallback: `user?.hederaAccountId || user?.walletAddress`
- Add debug logging to help troubleshoot
- Use local variables for mutation call

```typescript
const walletAddress = user?.hederaAccountId || user?.walletAddress;
const walletType = user?.walletType;

if (!walletAddress || !walletType) {
  console.error("Missing wallet info:", { user, walletAddress, walletType });
  setError("Wallet information missing. Please connect your wallet first.");
  setLoading(false);
  return;
}
```

## Files Modified

- `frontend/lib/auth-context.tsx` - Enhanced user mapping in 3 places
- `frontend/app/auth/complete-registration/page.tsx` - Improved validation and variable usage

## Status

✅ **FIXED** - User object now includes all required fields

## Testing

1. Connect wallet
2. Check browser console for user object
3. Verify `hederaAccountId` and `walletType` are present
4. Navigate to complete registration
5. Should not see "Wallet information missing" error
6. Fill form and submit successfully

## Debug Tips

If you still see the error:

1. Open browser console
2. Look for the log: `"Missing wallet info:"` with user object
3. Check which fields are missing
4. Verify the backend is returning these fields in the `/auth/me` response

## User Object Structure

After this fix, the user object should have:

```typescript
{
  id: string;
  email?: string;
  name?: string;
  fullName?: string;
  walletAddress: string;
  hederaAccountId?: string;
  walletType?: string;
  role: string;
  isEmailVerified: boolean;
  phone?: string;
  address?: string;
  farmName?: string;
  companyName?: string;
}
```

All fields are now properly mapped from both GraphQL responses and REST API responses.
