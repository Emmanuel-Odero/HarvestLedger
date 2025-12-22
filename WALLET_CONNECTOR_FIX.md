# Wallet Connector Fix

## Issue

Error: `WalletConnector.connect is not a function`

## Root Cause

In `frontend/app/auth/select-wallet/page.tsx` line 52, the code was calling:

```typescript
const walletInfo = await WalletConnector.connect(walletType);
```

But the correct method name is `connectWallet`, not `connect`.

## Fix Applied

Changed line 52 to:

```typescript
const walletInfo = await WalletConnector.connectWallet(walletType);
```

## File Modified

- `frontend/app/auth/select-wallet/page.tsx`

## Status

✅ **FIXED** - The wallet connection should now work correctly.

## Testing

1. Go to the wallet selection page
2. Click on any wallet
3. The wallet should connect without the "connect is not a function" error

## Related Methods

The `WalletConnector` class has these methods:

- `connectWallet(walletType)` - Connect to a wallet ✅
- `signMessage(walletType, message, accountId?)` - Sign a message
- `disconnectWallet(walletType)` - Disconnect from wallet
- `isWalletAvailable(walletType)` - Check if wallet is installed

Always use `connectWallet`, not `connect`!
