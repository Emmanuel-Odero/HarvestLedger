# User Registration & Multi-Wallet Support Fix

## Issues Fixed

### 1. Users Not Being Saved to Database

**Problem**: After wallet connection during signup, users were not being properly saved to the database with their wallet and email information.

**Root Cause**:

- The `authenticate_wallet` mutation was using the old single-wallet approach
- It was only checking the `users.hedera_account_id` field
- The multi-wallet tables (`user_wallets`) created by migrations were not being used
- Email linking after OTP verification was not implemented

**Solution**:

- Updated `authenticate_wallet` mutation to use the multi-wallet system
- Now creates entries in both `users` and `user_wallets` tables
- Properly tracks wallet information with timestamps
- Supports multiple wallets per user (future-proof)

### 2. Email Not Being Linked to Wallet

**Problem**: After email verification during registration, the email was not being linked to the wallet-connected account.

**Root Cause**:

- Frontend had a TODO comment but wasn't calling the `linkEmailToWallet` mutation
- The verified email was stored in sessionStorage but never used

**Solution**:

- Updated frontend to call `linkEmailToWallet` mutation after wallet connection
- Fixed GraphQL mutation signature to match backend expectations
- Email is now properly linked when user completes registration flow

### 3. Redirect Flow After Authentication

**Problem**: Users weren't being redirected properly based on their registration state.

**Solution**:

- Added logic to check user's registration state
- Redirects to `/onboarding/complete` if email not verified
- Redirects to `/onboarding` if profile incomplete
- Redirects to `/dashboard` for complete profiles

## Database Schema

### Users Table

```sql
users (
  id UUID PRIMARY KEY,
  email VARCHAR (nullable, unique),
  hedera_account_id VARCHAR (for backward compatibility),
  wallet_type VARCHAR,
  role ENUM (farmer, buyer, admin),
  email_verified BOOLEAN DEFAULT FALSE,
  registration_complete BOOLEAN DEFAULT FALSE,
  ...
)
```

### User Wallets Table (Multi-Wallet Support)

```sql
user_wallets (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  wallet_address VARCHAR(42) NOT NULL,
  wallet_type VARCHAR(50) NOT NULL,
  public_key TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  first_used_at TIMESTAMP,
  last_used_at TIMESTAMP,
  UNIQUE(wallet_address, wallet_type)
)
```

## Registration Flow

### New User Registration (Email + Wallet)

1. User enters email → OTP sent
2. User verifies OTP → Email marked as verified in sessionStorage
3. User connects wallet → Signature verification
4. Backend creates:
   - User record in `users` table
   - Wallet record in `user_wallets` table (marked as primary)
5. Frontend calls `linkEmailToWallet` to associate verified email
6. User redirected to complete profile

### Existing User Sign-In (Wallet Only)

1. User connects wallet → Signature verification
2. Backend finds existing wallet in `user_wallets` table
3. Returns user data and JWT token
4. User redirected to dashboard

## Files Modified

### Backend

- `backend/app/graphql/resolvers.py`
  - Updated `authenticate_wallet` mutation to use multi-wallet system
  - Creates entries in both `users` and `user_wallets` tables
  - Improved error handling and logging
  - Better redirect logic based on user state

### Frontend

- `frontend/lib/auth-context.tsx`

  - Added `linkEmailToWallet` mutation call
  - Properly links verified email after wallet connection
  - Updates user state with email information

- `frontend/lib/graphql/auth.ts`
  - Fixed `LINK_EMAIL_TO_WALLET` mutation signature
  - Changed from input object to individual parameters

## Testing

1. **New User Registration**:

   ```bash
   # Start fresh
   docker compose restart backend

   # Test flow:
   # 1. Go to signup
   # 2. Enter email and verify OTP
   # 3. Connect Lace wallet
   # 4. Check database:
   docker compose exec postgres psql -U harvest_user -d harvest_ledger -c "SELECT id, email, email_verified FROM users ORDER BY created_at DESC LIMIT 1;"
   docker compose exec postgres psql -U harvest_user -d harvest_ledger -c "SELECT wallet_address, wallet_type, is_primary FROM user_wallets ORDER BY created_at DESC LIMIT 1;"
   ```

2. **Existing User Sign-In**:

   ```bash
   # Test flow:
   # 1. Go to sign in
   # 2. Connect wallet
   # 3. Should redirect to dashboard
   # 4. Check logs:
   docker compose logs backend -f | grep "Existing user found"
   ```

3. **Check Logs**:
   ```bash
   # Watch authentication flow
   docker compose logs backend -f | grep -E "Authenticating wallet|Creating new user|Existing user"
   ```

## Database Queries for Verification

```sql
-- Check users
SELECT id, email, email_verified, hedera_account_id, wallet_type, created_at
FROM users
ORDER BY created_at DESC
LIMIT 5;

-- Check wallets
SELECT w.wallet_address, w.wallet_type, w.is_primary, u.email, w.created_at
FROM user_wallets w
JOIN users u ON w.user_id = u.id
ORDER BY w.created_at DESC
LIMIT 5;

-- Check user with all wallets
SELECT u.id, u.email, u.email_verified,
       json_agg(json_build_object(
         'address', w.wallet_address,
         'type', w.wallet_type,
         'is_primary', w.is_primary
       )) as wallets
FROM users u
LEFT JOIN user_wallets w ON u.id = w.user_id
GROUP BY u.id
ORDER BY u.created_at DESC
LIMIT 5;
```

## Next Steps

1. ✅ Cardano signature verification working
2. ✅ Multi-wallet support implemented
3. ✅ Email linking after registration
4. 🔄 Test complete registration flow
5. 🔄 Implement profile completion page
6. 🔄 Add ability to link additional wallets
7. 🔄 Implement session management with `user_sessions` table

## Notes

- The system now supports multiple wallets per user (Hedera, Cardano, Ethereum)
- First wallet connected is marked as primary
- Email is optional but recommended for account recovery
- JWT tokens include wallet address and type for session management
