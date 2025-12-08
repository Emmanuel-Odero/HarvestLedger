# 🚀 Quick Start - Authentication Testing

## View Emails

**MailHog UI:** http://localhost:8025

## Test Authentication

### Option 1: Wallet Only (No Email)

1. Go to http://localhost:3000
2. Click "Connect Wallet"
3. Sign the message
4. ✅ Done! You're authenticated

### Option 2: Full Registration (With Email)

1. Connect wallet (as above)
2. Enter email when prompted
3. Check MailHog at http://localhost:8025
4. Copy the 6-digit OTP code
5. Enter code to verify email
6. Complete your profile
7. ✅ Done! Full registration complete

## Check Backend Logs

```bash
docker logs harvest_backend --tail 50 -f
```

## Check Email Logs

```bash
docker logs harvest_backend | grep -i "otp\|email"
```

## Test Email Sending

```bash
docker exec harvest_backend python -c "
import asyncio
from app.core.email import email_service

async def test():
    result = await email_service.send_email(
        to_emails=['test@example.com'],
        subject='Test',
        text_content='Test email'
    )
    print(f'Sent: {result}')

asyncio.run(test())
"
```

## Clear MailHog Emails

```bash
curl -X DELETE http://localhost:8025/api/v1/messages
```

## Restart Backend

```bash
docker compose restart backend
```

## View All Emails via API

```bash
curl http://localhost:8025/api/v2/messages | python3 -m json.tool
```

## Common Issues

### "Email not appearing in MailHog"

- Check MailHog is running: `docker ps | grep mailhog`
- Check backend logs: `docker logs harvest_backend --tail 50`
- Verify MailHog UI: http://localhost:8025

### "Wallet signature failed"

- Try connecting wallet again
- Check nonce hasn't expired (5 min timeout)
- Verify wallet is on correct network

### "Token invalid"

- User needs to re-authenticate
- Check JWT_SECRET hasn't changed
- Verify token hasn't expired (30 min default)

## Status Check

```bash
# Check all services
docker compose ps

# Check backend health
curl http://localhost:8000/health

# Check if backend can reach MailHog
docker exec harvest_backend python -c "import socket; print(socket.gethostbyname('mailhog'))"

# Check if aiosmtplib is installed
docker exec harvest_backend python -c "import aiosmtplib; print('✅ Email service ready')"
```

## Everything Working? ✅

- Backend: http://localhost:8000/health should return `{"status":"healthy"}`
- Frontend: http://localhost:3000 should load
- MailHog: http://localhost:8025 should show UI
- GraphQL: http://localhost:8000/graphql should show playground

**Ready to test!** 🎉
