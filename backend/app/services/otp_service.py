"""
OTP (One-Time Password) service for email verification
"""
import secrets
import random
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
import logging

from app.core.redis_client import redis_client
from app.core.email import email_service
from app.core.config import settings

logger = logging.getLogger(__name__)


class OTPService:
    """Service for managing OTP generation, storage, and verification"""
    
    OTP_LENGTH = 6
    OTP_EXPIRY_MINUTES = 10
    MAX_ATTEMPTS = 5
    
    @staticmethod
    async def generate_otp() -> str:
        """Generate a 6-digit OTP"""
        return str(random.randint(100000, 999999))
    
    @staticmethod
    async def send_otp_email(email: str, otp: str) -> bool:
        """Send OTP via email"""
        subject = "HarvestLedger - Email Verification Code"
        
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 30px;">
                    <h2 style="color: #22c55e; margin-top: 0;">Email Verification</h2>
                    <p>Hello,</p>
                    <p>Your verification code for HarvestLedger is:</p>
                    <div style="background-color: #f3f4f6; border: 2px dashed #22c55e; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                        <h1 style="color: #22c55e; font-size: 32px; letter-spacing: 4px; margin: 0;">{otp}</h1>
                    </div>
                    <p>This code will expire in {OTPService.OTP_EXPIRY_MINUTES} minutes.</p>
                    <p>If you didn't request this code, please ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
                    <p style="color: #6b7280; font-size: 12px;">
                        This is an automated message from HarvestLedger. Please do not reply to this email.
                    </p>
                </div>
            </body>
        </html>
        """
        
        text_content = f"""
        Email Verification
        
        Hello,
        
        Your verification code for HarvestLedger is: {otp}
        
        This code will expire in {OTPService.OTP_EXPIRY_MINUTES} minutes.
        
        If you didn't request this code, please ignore this email.
        
        ---
        This is an automated message from HarvestLedger.
        """
        
        return await email_service.send_email(
            to_emails=[email],
            subject=subject,
            html_content=html_content,
            text_content=text_content
        )
    
    @staticmethod
    async def store_otp(email: str, otp: str, purpose: str = "verification") -> bool:
        """
        Store OTP in Redis with expiration
        Key format: otp:{purpose}:{email}
        """
        key = f"otp:{purpose}:{email}"
        expiry_seconds = OTPService.OTP_EXPIRY_MINUTES * 60
        
        # Store OTP with expiry
        if redis_client.redis:
            await redis_client.redis.setex(
                key,
                expiry_seconds,
                otp
            )
            
            # Store attempt counter
            attempts_key = f"otp_attempts:{purpose}:{email}"
            await redis_client.redis.setex(
                attempts_key,
                expiry_seconds,
                "0"
            )
        
        return True
    
    @staticmethod
    async def verify_otp(email: str, otp: str, purpose: str = "verification") -> tuple[bool, str]:
        """
        Verify OTP for email
        Returns: (is_valid, error_message)
        """
        key = f"otp:{purpose}:{email}"
        attempts_key = f"otp_attempts:{purpose}:{email}"
        
        if not redis_client.redis:
            return False, "Service unavailable"
        
        # Check if OTP exists
        stored_otp = await redis_client.redis.get(key)
        
        if not stored_otp:
            return False, "OTP expired or not found. Please request a new code."
        
        # Check attempt limit
        attempts = await redis_client.redis.get(attempts_key)
        attempt_count = int(attempts if attempts else 0)
        
        if attempt_count >= OTPService.MAX_ATTEMPTS:
            # Delete OTP to prevent further attempts
            await redis_client.redis.delete(key)
            await redis_client.redis.delete(attempts_key)
            return False, "Maximum verification attempts exceeded. Please request a new code."
        
        # Verify OTP
        if stored_otp != otp:
            # Increment attempt counter
            await redis_client.redis.incr(attempts_key)
            remaining = OTPService.MAX_ATTEMPTS - (attempt_count + 1)
            return False, f"Invalid OTP. {remaining} attempts remaining."
        
        # OTP is valid - delete it (one-time use)
        await redis_client.redis.delete(key)
        await redis_client.redis.delete(attempts_key)
        
        return True, "OTP verified successfully"
    
    @staticmethod
    async def generate_and_send_otp(email: str, purpose: str = "verification") -> tuple[bool, Optional[str]]:
        """
        Generate OTP and send it via email
        Returns: (success, error_message)
        """
        try:
            logger.info(f"Generating OTP for email: {email}, purpose: {purpose}")
            
            # Generate OTP
            otp = await OTPService.generate_otp()
            logger.info(f"OTP generated: {otp[:2]}**** (for {email})")
            
            # Store OTP
            await OTPService.store_otp(email, otp, purpose)
            logger.info(f"OTP stored in Redis for {email}")
            
            # Send email
            logger.info(f"Sending OTP email to {email} via SMTP...")
            email_sent = await OTPService.send_otp_email(email, otp)
            
            if not email_sent:
                logger.warning(f"Failed to send OTP email to {email} - Email service may not be configured")
                # In development, log the OTP for testing
                if settings.HEDERA_NETWORK == "testnet" or settings.CARDANO_NETWORK == "preprod":
                    logger.warning(f"🔐 DEVELOPMENT MODE - OTP for {email}: {otp}")
                    logger.warning("⚠️  Email service not available. For testing, use the OTP logged above.")
                    # Still return success in dev mode so testing can continue
                    return True, None
                else:
                    return False, "Failed to send verification email. Please check email service configuration."
            
            logger.info(f"OTP email sent successfully to {email}")
            return True, None
            
        except Exception as e:
            logger.error(f"Error generating/sending OTP for {email}: {str(e)}", exc_info=True)
            # In development, still allow OTP to be used even if email fails
            if settings.HEDERA_NETWORK == "testnet" or settings.CARDANO_NETWORK == "preprod":
                logger.warning("⚠️  Email service error in development mode - OTP still stored in Redis")
                return True, None
            return False, f"Error generating OTP: {str(e)}"
    
    @staticmethod
    async def revoke_otp(email: str, purpose: str = "verification") -> None:
        """Revoke/reset OTP for an email"""
        key = f"otp:{purpose}:{email}"
        attempts_key = f"otp_attempts:{purpose}:{email}"
        
        if redis_client.redis:
            await redis_client.redis.delete(key)
            await redis_client.redis.delete(attempts_key)

