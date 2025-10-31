from sqlalchemy import Column, String, Boolean, DateTime, Enum, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
import enum

from app.core.database import Base


class UserRole(str, enum.Enum):
    FARMER = "farmer"
    BUYER = "buyer"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=True)  # Made nullable for wallet-only auth
    hashed_password = Column(String, nullable=True)  # Made nullable for wallet-only auth
    full_name = Column(String, nullable=True)  # Made nullable for wallet-only auth
    role = Column(Enum(UserRole), nullable=False, default=UserRole.FARMER)
    
    # Hedera account information (primary authentication)
    hedera_account_id = Column(String, unique=True, index=True, nullable=False)  # Primary identifier
    hedera_public_key = Column(Text, nullable=True)
    wallet_type = Column(String, nullable=True)  # HASHPACK, BLADE, KABILA, METAMASK, PORTAL
    
    # Profile information
    phone = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    farm_name = Column(String, nullable=True)  # For farmers
    company_name = Column(String, nullable=True)  # For buyers
    
    # Status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"