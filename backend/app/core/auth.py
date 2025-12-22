from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT token scheme
security = HTTPBearer()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> Optional[dict]:
    """Verify and decode a JWT token"""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        return None


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get the current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = verify_token(credentials.credentials)
        if payload is None:
            raise credentials_exception
            
        # Support both user_id (legacy) and hedera_account_id/wallet_address (new wallet auth)
        user_id: str = payload.get("sub")
        hedera_account_id: str = payload.get("hedera_account_id") or payload.get("wallet_address")
        
        if not user_id and not hedera_account_id:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    
    # Try to find user by user_id first (most reliable), then by hedera_account_id
    user = None
    if user_id:
        user = db.query(User).filter(User.id == user_id).first()
    
    if not user and hedera_account_id:
        user = db.query(User).filter(User.hedera_account_id == hedera_account_id).first()
    
    if user is None:
        raise credentials_exception
        
    return user

async def get_current_user_optional(
    request: Request,
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Get the current user if authenticated, otherwise return None"""
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return None
        
        token = auth_header.split(" ")[1]
        payload = verify_token(token)
        if payload is None:
            return None
            
        user_id: str = payload.get("sub")
        hedera_account_id: str = payload.get("hedera_account_id") or payload.get("wallet_address")
        
        # Try user_id first (most reliable)
        if user_id:
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                return user
        
        # Fallback to hedera_account_id
        if hedera_account_id:
            return db.query(User).filter(User.hedera_account_id == hedera_account_id).first()
            
        return None
    except:
        return None


async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Get the current active user"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user