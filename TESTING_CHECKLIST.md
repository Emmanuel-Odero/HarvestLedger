# Authentication Testing Checklist

## ✅ Pre-Testing Setup

- [ ] Backend running: http://localhost:8000/health
- [ ] Frontend running: http://localhost:3000
- [ ] MailHog running: http://localhost:8025
- [ ] Redis running
- [ ] PostgreSQL running

## 🧪 Test Complete Authentication Flow

### 1. Wallet Connection

- [ ] Go to http://localhost:3000
- [ ] Click "Connect Wallet" or go to sign-in page
- [ ] Select a wallet (e.g., HashPack, MetaMask, Nami)
- [ ] Sign the authentication message
- [ ] ✅ Should see user authenticated
- [ ] ✅ Check console: user object should have `hederaAccountId` and `walletType`

### 2. Email Verification

- [ ] Enter your email address
- [ ] Click "Send Verification Code"
- [ ] ✅ Check MailHog at http://localhost:8025
- [ ] ✅ Should see email with 6-digit OTP code
- [ ] Copy the OTP code
- [ ] Enter code in the frontend
- [ ] ✅ Email should be verified

### 3. Complete Registration

- [ ] Fill in your full name
- [ ] Select role (Farmer or Buyer)
- [ ] Fill in optional fields (phone, address, etc.)
- [ ] If Farmer: Enter farm name
- [ ] If Buyer: Enter company name
- [ ] Click "Complete Registration"
- [ ] ✅ Should NOT see "Wallet information missing" error
- [ ] ✅ Should redirect to dashboard
- [ ] ✅ Should see welcome message with your name

### 4. Verify User Data

- [ ] Open browser console
- [ ] Check user object has all fields:
  - `id`
  - `email`
  - `fullName`
  - `walletAddress`
  - `hederaAccountId`
  - `walletType`
  - `role`
  - `isEmailVerified`
  - `phone`, `address`, `farmName`, or `companyName`

### 5. Test Logout and Re-login

- [ ] Click logout
- [ ] ✅ Should redirect to home page
- [ ] Connect wallet again
- [ ] ✅ Should recognize existing user
- [ ] ✅ Should redirect to dashboard (skip registration)

## 🐛 Troubleshooting

### "Wallet information missing" Error

1. Open browser console
2. Look for log: `"Missing wallet info:"`
3. Check if `hederaAccountId` and `walletType` are present
4. If missing, check auth-context.tsx user mapping

### Email Not Appearing in MailHog

1. Check MailHog is running: `docker ps | grep mailhog`
2. Check backend logs: `docker logs harvest_backend --tail 50 | grep -i email`
3. Verify aiosmtplib is installed: `docker exec harvest_backend python -c "import aiosmtplib; print('OK')"`

### GraphQL Errors

1. Open browser console
2. Check Network tab for GraphQL requests
3. Verify mutation variables are correct
4. Check backend logs for errors

### Token Issues

1. Check localStorage has `auth_token`
2. Verify token is valid: decode at jwt.io
3. Check token includes all required fields
4. Try clearing localStorage and re-authenticating

## 📊 Expected Results

### After Wallet Connection

```javascript
{
  id: "uuid",
  email: null,
  fullName: null,
  walletAddress: "0.0.xxxxx" or "0x..." or "addr1...",
  hederaAccountId: "0.0.xxxxx" or "0x..." or "addr1...",
  walletType: "HASHPACK" or "METAMASK" or "NAMI" etc,
  role: "FARMER",
  isEmailVerified: false
}
```

### After Email Verification

```javascript
{
  ...previous fields,
  email: "user@example.com",
  isEmailVerified: true
}
```

### After Complete Registration

```javascript
{
  ...previous fields,
  fullName: "John Doe",
  phone: "+1234567890",
  address: "123 Farm Road",
  farmName: "Green Acres Farm", // if farmer
  companyName: "Acme Corp", // if buyer
}
```

## ✅ Success Criteria

All of these should work without errors:

- ✅ Wallet connects successfully
- ✅ Email sends to MailHog
- ✅ OTP verification works
- ✅ Registration completes without "wallet missing" error
- ✅ User redirected to dashboard
- ✅ User data persists after page refresh
- ✅ Logout and re-login works

## 🎉 If All Tests Pass

Congratulations! Your authentication system is fully functional and ready for production deployment.

Next steps:

1. Test with real wallets on testnet
2. Configure production SMTP
3. Set up proper JWT secrets
4. Enable HTTPS
5. Deploy to production
