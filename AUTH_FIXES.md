# Authentication System Fixes

## Issues Fixed

### 1. GraphQL Schema Field Name Mismatches

**Problem**: Frontend expected camelCase field names (`fullName`, `walletAddress`, `isEmailVerified`) but backend returned snake_case (`full_name`, `hedera_account_id`, `email_verified`).

**Solution**:

- Added GraphQL field aliases in `backend/app/graphql/types.py`:
  - `walletAddress` → `hedera_account_id`
  - `isEmailVerified` → `email_verified`
  - `fullName` → `full_name`

### 2. JWT Token Payload Inconsistency

**Problem**: JWT tokens didn't consistently include `hedera_account_id` in the payload, causing authentication failures.

**Solution**: Updated `authenticate_wallet` mutation in `backend/app/graphql/resolvers.py` to include:

- `sub` (user ID)
- `hedera_account_id`
- `wallet_address` (for backward compatibility)
- `wallet_type`
- `email_verified`
- `registration_complete`

### 3. User Lookup Logic Issues

**Problem**: User lookup in `get_current_user` and `get_context` functions prioritized `hedera_account_id` over `user_id`, which could fail when tokens only had `sub`.

**Solution**: Updated lookup logic in `backend/app/core/auth.py` and `backend/app/graphql/schema.py` to:

1. Try `user_id` (from `sub`) first (most reliable)
2. Fallback to `hedera_account_id` or `wallet_address` if user not found
3. Support both field names for backward compatibility

### 4. Frontend GraphQL Query Mismatches

**Problem**: Frontend GraphQL queries didn't match backend schema field names.

**Solution**: Updated `frontend/lib/graphql/auth.ts`:

- Added `token` field to `AUTHENTICATE_WALLET` mutation (backend returns both `token` and `accessToken`)
- Added `redirectUrl` field
- Added all field name variants (`fullName`, `hederaAccountId`, `emailVerified`, `registrationComplete`)
- Updated `GET_CURRENT_USER` to use `me` query (matches backend)

### 5. Auth Context Token Handling

**Problem**: Auth context only looked for `accessToken` but backend returns `token` as primary field.

**Solution**: Updated `frontend/lib/auth-context.tsx` to:

- Check for both `token` and `accessToken` fields
- Use the first available token
- Properly map all user fields from GraphQL response

## Files Modified

### Backend

1. `backend/app/graphql/types.py` - Added field aliases for frontend compatibility
2. `backend/app/graphql/resolvers.py` - Fixed JWT token payload in `authenticate_wallet`
3. `backend/app/core/auth.py` - Fixed user lookup logic in `get_current_user` and `get_current_user_optional`
4. `backend/app/graphql/schema.py` - Fixed user lookup logic in `get_context`

### Frontend

1. `frontend/lib/graphql/auth.ts` - Updated GraphQL queries to match backend schema
2. `frontend/lib/auth-context.tsx` - Fixed token extraction and user mapping

## Testing Recommendations

1. **Wallet Authentication Flow**:

   - Connect wallet (HashPack, Blade, MetaMask, Nami, etc.)
   - Verify JWT token is created with all required fields
   - Verify user can access protected routes

2. **Token Validation**:

   - Test `/auth/me` endpoint with JWT token
   - Test GraphQL `me` query with JWT token
   - Verify both REST and GraphQL auth work

3. **User Lookup**:

   - Test with tokens containing only `sub` (user_id)
   - Test with tokens containing `hedera_account_id`
   - Test with tokens containing both

4. **Field Name Compatibility**:
   - Verify frontend receives `fullName`, `walletAddress`, `isEmailVerified`
   - Verify backend still stores as `full_name`, `hedera_account_id`, `email_verified`

## Key Improvements

1. **Backward Compatibility**: All changes maintain backward compatibility with existing tokens and field names
2. **Consistent Token Payload**: JWT tokens now always include all necessary fields
3. **Robust User Lookup**: User lookup tries multiple methods to find the user
4. **Frontend/Backend Alignment**: GraphQL schema now properly exposes fields in the format frontend expects
5. **Better Error Handling**: More graceful fallbacks when fields are missing

## Migration Notes

- No database migrations required
- Existing JWT tokens will continue to work
- Users may need to re-authenticate to get tokens with new payload structure
- No breaking changes to API contracts

## Email Service Note

The "Failed to send verification email" message occurs when the SMTP service (MailHog) is not running. This has been fixed to:

1. **Development Mode**: OTP is logged to console when email fails, allowing testing to continue
2. **Production Mode**: Proper error message is shown if SMTP is not configured

**To enable email in development:**

```bash
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog
```

See `DEPLOYMENT_NOTES.md` for full email configuration details.

---

## ✅ UPDATE: Email Service Now Working

**Status:** FIXED - Email service is fully functional

The email issue has been resolved:

1. ✅ Added `aiosmtplib==3.0.1` and `jinja2==3.1.2` to `requirements-minimal.txt`
2. ✅ Rebuilt backend Docker container with email dependencies
3. ✅ Verified email sending to MailHog
4. ✅ Tested OTP delivery

**View emails:** http://localhost:8025 (MailHog UI)

See `EMAIL_SETUP_COMPLETE.md` for complete testing guide.
