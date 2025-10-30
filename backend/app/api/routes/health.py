from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.database import get_db
from app.core.hedera import hedera_client

router = APIRouter()


@router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """Health check endpoint"""
    try:
        # Check database connection
        db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    
    # Check Hedera client
    hedera_status = "healthy" if hedera_client.client else "not configured"
    
    # Check email service configuration
    from app.core.config import settings
    email_status = "configured" if settings.smtp_host else "not configured"
    
    overall_status = "healthy" if db_status == "healthy" else "unhealthy"
    
    return {
        "status": overall_status,
        "database": db_status,
        "hedera": hedera_status,
        "email": email_status,
        "version": "1.0.0",
        "services": {
            "mailhog_ui": "http://localhost:8025",
            "pgadmin": "http://localhost:5050"
        }
    }


@router.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "HarvestLedger API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "graphql": "/graphql",
            "auth": "/api/auth"
        }
    }