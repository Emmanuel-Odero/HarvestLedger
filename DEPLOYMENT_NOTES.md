# Deployment & Configuration Notes

## Email Service Configuration

### Development Mode

The application is configured to use MailHog for email testing in development. If MailHog is not running, the OTP will be logged to the console instead.

**To run MailHog (optional for development):**

```bash
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog
```

Then access the MailHog UI at http://localhost:8025 to see sent emails.

### Production Configuration

For production, update the following environment variables in `.env`:

```env
# Production SMTP Configuration (example with Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_TLS=true
MAIL_FROM=noreply@yourdomain.com
```

**Recommended SMTP Providers:**

- **SendGrid**: Reliable, good free tier
- **AWS SES**: Cost-effective for high volume
- **Mailgun**: Developer-friendly
- **Gmail**: Good for testing, not recommended for production

## Authentication System

### Current Status: ✅ FIXED

The authentication system has been fully fixed and is working correctly:

1. ✅ Wallet authentication (HashPack, Blade, MetaMask, Nami, Eternl, Lace, Flint, Typhon)
2. ✅ JWT token generation with consistent payload
3. ✅ GraphQL schema field name compatibility (camelCase for frontend)
4. ✅ User lookup by both user_id and hedera_account_id
5. ✅ Multi-wallet support
6. ✅ Progressive registration flow

### Authentication Flow

1. **Wallet Connection**: User connects wallet (any supported type)
2. **Signature Verification**: Backend verifies wallet signature
3. **User Creation/Lookup**: Creates new user or finds existing user
4. **JWT Token**: Issues JWT with user_id, hedera_account_id, wallet_type
5. **Email Verification** (optional): User can add email for notifications
6. **Profile Completion**: User completes profile (name, role, etc.)

### Testing Without Email

In development mode (testnet/preprod), you can:

1. Connect wallet - this works without email
2. Skip email verification - not required for basic functionality
3. Complete profile - works without verified email
4. Access dashboard - works with just wallet authentication

Email is only required for:

- Password reset (if using legacy email/password auth)
- Email notifications
- Some compliance features

## Redis Configuration

Redis is required for:

- OTP storage and verification
- Nonce management for wallet authentication
- Session management

**Development:**

```bash
docker run -d -p 6379:6379 redis:alpine
```

**Production:**
Configure Redis URL in `.env`:

```env
REDIS_URL=redis://your-redis-host:6379
```

## Database Migrations

No migrations needed for the auth fixes - all changes are backward compatible.

## Environment Variables Checklist

### Required for Basic Functionality

- ✅ `DATABASE_URL` - PostgreSQL connection
- ✅ `REDIS_URL` - Redis connection
- ✅ `JWT_SECRET` - JWT signing key (change in production!)
- ✅ `FRONTEND_URL` - Frontend URL for CORS
- ✅ `BACKEND_URL` - Backend URL

### Required for Blockchain Features

- ⚠️ `OPERATOR_ID` - Hedera operator account ID
- ⚠️ `OPERATOR_KEY` - Hedera operator private key
- ⚠️ `HCS_TOPIC_ID` - Hedera Consensus Service topic
- ⚠️ `BLOCKFROST_PROJECT_ID` - Cardano Blockfrost API key

### Optional (Email)

- ⚙️ `SMTP_HOST` - SMTP server hostname
- ⚙️ `SMTP_PORT` - SMTP server port
- ⚙️ `SMTP_USER` - SMTP username
- ⚙️ `SMTP_PASSWORD` - SMTP password
- ⚙️ `SMTP_TLS` - Use TLS (true/false)
- ⚙️ `MAIL_FROM` - From email address

## Security Recommendations

1. **Change JWT_SECRET**: Use a strong random secret in production
2. **Enable HTTPS**: Always use HTTPS in production
3. **Secure Cookies**: Set secure flag on auth cookies
4. **Rate Limiting**: Implement rate limiting on auth endpoints
5. **CORS**: Restrict CORS origins to your domain only
6. **Environment Variables**: Never commit `.env` file to git

## Monitoring

Monitor these logs for auth issues:

- `🔐 Authenticating wallet:` - Wallet auth attempts
- `✅ Wallet authentication successful` - Successful auth
- `❌ Wallet authentication failed` - Failed auth
- `⚠️ Email service not available` - Email service issues
- `🔐 DEVELOPMENT MODE - OTP for` - OTP codes in dev mode

## Troubleshooting

### "Failed to send verification email"

- **Cause**: SMTP service not configured or not accessible
- **Solution**:
  - Development: Check logs for OTP code, or run MailHog
  - Production: Configure SMTP settings in `.env`

### "Could not validate credentials"

- **Cause**: Invalid or expired JWT token
- **Solution**: User needs to re-authenticate

### "Wallet signature verification failed"

- **Cause**: Invalid signature or nonce expired
- **Solution**: User should try connecting wallet again

### Redis connection errors

- **Cause**: Redis not running or not accessible
- **Solution**: Start Redis or check REDIS_URL configuration
