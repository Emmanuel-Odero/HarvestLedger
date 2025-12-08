# Link Email to Wallet Mutation Fix

## Issue

GraphQL errors when trying to link email to wallet:

```
Variable '$email' of required type 'String!' was not provided.
Variable '$walletAddress' of required type 'String!' was not provided.
Variable '$walletType' of required type 'WalletType!' was not provided.
```

## Root Cause

In `frontend/app/auth/select-wallet/page.tsx`, the mutation variables were being passed wrapped in an `input` object:

```typescript
// ❌ WRONG
await linkEmailToWallet({
  variables: {
    input: {
      email,
      walletAddress: walletInfo.address,
      walletType: walletType,
      signature: signatureResult.signature,
    },
  },
});
```

But the GraphQL mutation expects the variables directly:

```graphql
mutation LinkEmailToWallet(
  $email: String!
  $walletAddress: String!
  $walletType: WalletType!
) {
  linkEmailToWallet(
    email: $email
    walletAddress: $walletAddress
    walletType: $walletType
  ) {
    success
    message
  }
}
```

## Fix Applied

Changed the mutation call to pass variables directly:

```typescript
// ✅ CORRECT
await linkEmailToWallet({
  variables: {
    email,
    walletAddress: walletInfo.address,
    walletType: walletType,
  },
});
```

Also removed the `signature` field which is not part of the mutation.

## File Modified

- `frontend/app/auth/select-wallet/page.tsx` (line 66-73)

## Other Usages Verified

Checked all other places where `linkEmailToWallet` is called:

- ✅ `frontend/lib/auth-context.tsx` - Correct format
- ✅ `frontend/app/auth/verify-email/page.tsx` - Correct format (2 calls)

## Status

✅ **FIXED** - Email linking should now work correctly.

## Testing

1. Go to wallet selection page
2. Connect a wallet
3. The email should be linked to the wallet without GraphQL errors
4. You should be redirected to complete registration

## Note

The `linkEmailToWallet` mutation handles OTP sending internally, so you don't need to pass a signature. The backend will send an OTP to the email for verification.
