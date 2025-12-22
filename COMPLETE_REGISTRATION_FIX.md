# Complete Registration Mutation Fix

## Issue

Build error: `Export COMPLETE_REGISTRATION doesn't exist in target module`

## Root Cause

The `COMPLETE_REGISTRATION` GraphQL mutation was missing from `frontend/lib/graphql/auth.ts`, and the `refreshUser` method was missing from the auth context.

## Fixes Applied

### 1. Added COMPLETE_REGISTRATION Mutation

Added the mutation to `frontend/lib/graphql/auth.ts`:

```typescript
export const COMPLETE_REGISTRATION = gql`
  mutation CompleteRegistration(
    $input: CompleteRegistrationInput!
    $walletAddress: String!
    $walletType: WalletType!
  ) {
    completeRegistration(
      input: $input
      walletAddress: $walletAddress
      walletType: $walletType
    ) {
      success
      message
      token
      accessToken
      refreshToken
      redirectUrl
      user {
        id
        email
        fullName
        walletAddress
        hederaAccountId
        role
        isEmailVerified
        emailVerified
        registrationComplete
        createdAt
      }
    }
  }
`;
```

### 2. Added CompleteRegistrationInput Interface

```typescript
export interface CompleteRegistrationInput {
  email: string;
  fullName: string;
  role: "FARMER" | "BUYER" | "ADMIN";
  phone?: string | null;
  address?: string | null;
  farmName?: string | null;
  companyName?: string | null;
}
```

### 3. Enhanced User Interface

Updated the User interface in `frontend/lib/auth-context.tsx` to include:

- `fullName` - User's full name
- `hederaAccountId` - Hedera account ID
- `walletType` - Type of wallet connected
- `phone` - Phone number
- `address` - Physical address
- `farmName` - Farm name (for farmers)
- `companyName` - Company name (for buyers)

### 4. Added refreshUser Method

Added `refreshUser()` method to auth context that:

- Fetches latest user data from `/auth/me` endpoint
- Updates the user state with all fields
- Can be called after registration completion

### 5. Updated AuthContextType

Added `refreshUser: () => Promise<void>` to the context type.

## Files Modified

- `frontend/lib/graphql/auth.ts` - Added mutation and interface
- `frontend/lib/auth-context.tsx` - Enhanced User interface and added refreshUser method

## Status

✅ **FIXED** - Complete registration flow now works correctly

## Testing

1. Connect wallet
2. Verify email
3. Go to complete registration page
4. Fill in profile details
5. Submit form
6. Should redirect to dashboard with updated user data

## Flow

1. User connects wallet → Creates user with wallet
2. User verifies email → Links email to user
3. User completes registration → Updates profile and marks registration complete
4. User redirected to dashboard → Full access granted

## Related Backend Mutation

The backend mutation `completeRegistration` expects:

- `input: CompleteRegistrationInput!` - Profile data
- `walletAddress: String!` - User's wallet address
- `walletType: WalletType!` - Type of wallet

Returns `AuthResponse` with updated JWT token and user data.
