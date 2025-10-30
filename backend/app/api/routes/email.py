"""
Email testing endpoints
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import List

from app.core.email import send_email, send_welcome_email, send_harvest_notification

router = APIRouter()


class EmailRequest(BaseModel):
    to_emails: List[EmailStr]
    subject: str
    text_content: str
    html_content: str = None


class WelcomeEmailRequest(BaseModel):
    to_email: EmailStr
    user_name: str


class HarvestNotificationRequest(BaseModel):
    to_email: EmailStr
    farmer_name: str
    crop_type: str
    quantity: float
    transaction_id: str


@router.post("/test-email")
async def test_email(request: EmailRequest):
    """Test email sending functionality"""
    try:
        success = await send_email(
            to_emails=request.to_emails,
            subject=request.subject,
            text_content=request.text_content,
            html_content=request.html_content
        )
        
        if success:
            return {
                "message": "Email sent successfully",
                "recipients": request.to_emails,
                "subject": request.subject
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to send email")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Email error: {str(e)}")


@router.post("/welcome-email")
async def send_welcome_email_endpoint(request: WelcomeEmailRequest):
    """Send a welcome email to a new user"""
    try:
        success = await send_welcome_email(
            to_email=request.to_email,
            user_name=request.user_name
        )
        
        if success:
            return {
                "message": "Welcome email sent successfully",
                "recipient": request.to_email,
                "user_name": request.user_name
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to send welcome email")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Email error: {str(e)}")


@router.post("/harvest-notification")
async def send_harvest_notification_endpoint(request: HarvestNotificationRequest):
    """Send a harvest notification email"""
    try:
        success = await send_harvest_notification(
            to_email=request.to_email,
            farmer_name=request.farmer_name,
            crop_type=request.crop_type,
            quantity=request.quantity,
            transaction_id=request.transaction_id
        )
        
        if success:
            return {
                "message": "Harvest notification sent successfully",
                "recipient": request.to_email,
                "crop_type": request.crop_type,
                "quantity": request.quantity
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to send harvest notification")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Email error: {str(e)}")


@router.get("/email-config")
async def get_email_config():
    """Get current email configuration (for debugging)"""
    from app.core.config import settings
    
    return {
        "smtp_host": settings.smtp_host,
        "smtp_port": settings.smtp_port,
        "smtp_user": settings.smtp_user,
        "smtp_tls": settings.smtp_tls,
        "mail_from": settings.mail_from,
        "mailhog_ui": "http://localhost:8025"
    }