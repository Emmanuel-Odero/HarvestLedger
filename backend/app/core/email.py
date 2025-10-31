"""
Email utilities for HarvestLedger backend
"""
import asyncio
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional
import aiosmtplib
from jinja2 import Environment, BaseLoader

from app.core.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    """Email service for sending emails via SMTP"""
    
    def __init__(self):
        self.smtp_host = getattr(settings, 'smtp_host', 'mailhog')
        self.smtp_port = getattr(settings, 'smtp_port', 1025)
        self.smtp_user = getattr(settings, 'smtp_user', '')
        self.smtp_password = getattr(settings, 'smtp_password', '')
        self.smtp_tls = getattr(settings, 'smtp_tls', False)
        self.mail_from = getattr(settings, 'mail_from', 'noreply@harvest.com')
        
    async def send_email(
        self,
        to_emails: List[str],
        subject: str,
        html_content: Optional[str] = None,
        text_content: Optional[str] = None,
        from_email: Optional[str] = None
    ) -> bool:
        """
        Send an email via SMTP
        
        Args:
            to_emails: List of recipient email addresses
            subject: Email subject
            html_content: HTML content of the email
            text_content: Plain text content of the email
            from_email: Sender email address (defaults to configured mail_from)
            
        Returns:
            bool: True if email was sent successfully, False otherwise
        """
        try:
            # Create message
            message = MIMEMultipart('alternative')
            message['Subject'] = subject
            message['From'] = from_email or self.mail_from
            message['To'] = ', '.join(to_emails)
            
            # Add text content
            if text_content:
                text_part = MIMEText(text_content, 'plain')
                message.attach(text_part)
                
            # Add HTML content
            if html_content:
                html_part = MIMEText(html_content, 'html')
                message.attach(html_part)
                
            # If no content provided, use subject as content
            if not text_content and not html_content:
                text_part = MIMEText(f"Subject: {subject}", 'plain')
                message.attach(text_part)
            
            # Send email
            logger.info(f"Attempting to send email to {to_emails} via {self.smtp_host}:{self.smtp_port}")
            await aiosmtplib.send(
                message,
                hostname=self.smtp_host,
                port=self.smtp_port,
                username=self.smtp_user if self.smtp_user else None,
                password=self.smtp_password if self.smtp_password else None,
                use_tls=self.smtp_tls,
            )
            
            logger.info(f"Email sent successfully to {to_emails}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_emails}: {str(e)}", exc_info=True)
            return False
    
    async def send_welcome_email(self, to_email: str, user_name: str) -> bool:
        """Send a welcome email to a new user"""
        subject = "Welcome to HarvestLedger!"
        
        html_content = f"""
        <html>
            <body>
                <h2>Welcome to HarvestLedger, {user_name}!</h2>
                <p>Thank you for joining our agriculture supply chain and financing platform.</p>
                <p>You can now:</p>
                <ul>
                    <li>Track your harvest records on the blockchain</li>
                    <li>Tokenize your crops for trading and financing</li>
                    <li>Access smart contract-based loan agreements</li>
                    <li>View real-time analytics and insights</li>
                </ul>
                <p>Get started by visiting: <a href="{settings.frontend_url}">HarvestLedger Platform</a></p>
                <p>Best regards,<br>The HarvestLedger Team</p>
            </body>
        </html>
        """
        
        text_content = f"""
        Welcome to HarvestLedger, {user_name}!
        
        Thank you for joining our agriculture supply chain and financing platform.
        
        You can now:
        - Track your harvest records on the blockchain
        - Tokenize your crops for trading and financing
        - Access smart contract-based loan agreements
        - View real-time analytics and insights
        
        Get started by visiting: {settings.frontend_url}
        
        Best regards,
        The HarvestLedger Team
        """
        
        return await self.send_email(
            to_emails=[to_email],
            subject=subject,
            html_content=html_content,
            text_content=text_content
        )
    
    async def send_harvest_notification(
        self, 
        to_email: str, 
        farmer_name: str, 
        crop_type: str, 
        quantity: float,
        transaction_id: str
    ) -> bool:
        """Send notification about a new harvest record"""
        subject = f"New Harvest Record: {crop_type}"
        
        html_content = f"""
        <html>
            <body>
                <h2>New Harvest Record Submitted</h2>
                <p>Hello {farmer_name},</p>
                <p>Your harvest record has been successfully submitted to the blockchain:</p>
                <ul>
                    <li><strong>Crop Type:</strong> {crop_type}</li>
                    <li><strong>Quantity:</strong> {quantity} kg</li>
                    <li><strong>Transaction ID:</strong> {transaction_id}</li>
                </ul>
                <p>This record is now immutably stored on the Hedera blockchain and can be viewed in your dashboard.</p>
                <p>View your records: <a href="{settings.frontend_url}/dashboard">Dashboard</a></p>
                <p>Best regards,<br>The HarvestLedger Team</p>
            </body>
        </html>
        """
        
        text_content = f"""
        New Harvest Record Submitted
        
        Hello {farmer_name},
        
        Your harvest record has been successfully submitted to the blockchain:
        
        - Crop Type: {crop_type}
        - Quantity: {quantity} kg
        - Transaction ID: {transaction_id}
        
        This record is now immutably stored on the Hedera blockchain and can be viewed in your dashboard.
        
        View your records: {settings.frontend_url}/dashboard
        
        Best regards,
        The HarvestLedger Team
        """
        
        return await self.send_email(
            to_emails=[to_email],
            subject=subject,
            html_content=html_content,
            text_content=text_content
        )


# Global email service instance
email_service = EmailService()


# Convenience functions
async def send_email(
    to_emails: List[str],
    subject: str,
    html_content: Optional[str] = None,
    text_content: Optional[str] = None,
    from_email: Optional[str] = None
) -> bool:
    """Send an email using the global email service"""
    return await email_service.send_email(
        to_emails=to_emails,
        subject=subject,
        html_content=html_content,
        text_content=text_content,
        from_email=from_email
    )


async def send_welcome_email(to_email: str, user_name: str) -> bool:
    """Send a welcome email to a new user"""
    return await email_service.send_welcome_email(to_email, user_name)


async def send_harvest_notification(
    to_email: str, 
    farmer_name: str, 
    crop_type: str, 
    quantity: float,
    transaction_id: str
) -> bool:
    """Send notification about a new harvest record"""
    return await email_service.send_harvest_notification(
        to_email, farmer_name, crop_type, quantity, transaction_id
    )