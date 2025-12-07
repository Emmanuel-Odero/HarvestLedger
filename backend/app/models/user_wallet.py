from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, DECIMAL
from sqlalchemy.dialects.postgresql import UUID, JSONB, INET
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

from app.core.database import Base


class UserWallet(Base):
    """Model for storing multiple wallets per user"""
    __tablename__ = "user_wallets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    wallet_address = Column(String(255), nullable=False)
    wallet_type = Column(String(50), nullable=False)  # HASHPACK, BLADE, KABILA, METAMASK, PORTAL
    public_key = Column(Text, nullable=True)
    is_primary = Column(Boolean, default=False)
    first_used_at = Column(DateTime(timezone=True), server_default=func.now())
    last_used_at = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="wallets")
    sessions = relationship("UserSession", back_populates="current_wallet")

    def __repr__(self):
        return f"<UserWallet(id={self.id}, address={self.wallet_address}, type={self.wallet_type})>"


class UserSession(Base):
    """Model for enhanced user session management"""
    __tablename__ = "user_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    session_token = Column(String(255), unique=True, nullable=False)
    current_wallet_id = Column(UUID(as_uuid=True), ForeignKey("user_wallets.id", ondelete="SET NULL"), nullable=True)
    device_fingerprint = Column(Text, nullable=True)
    ip_address = Column(INET, nullable=True)
    user_agent = Column(Text, nullable=True)
    browser_signature = Column(Text, nullable=True)
    screen_resolution = Column(String(20), nullable=True)
    timezone = Column(String(50), nullable=True)
    language = Column(String(10), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_active_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="sessions")
    current_wallet = relationship("UserWallet", back_populates="sessions")

    def __repr__(self):
        return f"<UserSession(id={self.id}, user_id={self.user_id}, expires_at={self.expires_at})>"


class UserBehaviorPattern(Base):
    """Model for storing user behavior patterns for identification"""
    __tablename__ = "user_behavior_patterns"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    pattern_type = Column(String(50), nullable=False)  # transaction_times, session_duration, feature_usage
    pattern_data = Column(JSONB, nullable=False)
    confidence_score = Column(DECIMAL(3, 2), default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="behavior_patterns")

    def __repr__(self):
        return f"<UserBehaviorPattern(id={self.id}, type={self.pattern_type}, confidence={self.confidence_score})>"


class WalletLinkingRequest(Base):
    """Model for secure wallet linking requests"""
    __tablename__ = "wallet_linking_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    new_wallet_address = Column(String(255), nullable=False)
    new_wallet_type = Column(String(50), nullable=False)
    verification_token = Column(String(255), nullable=False)
    primary_signature = Column(Text, nullable=True)
    new_wallet_signature = Column(Text, nullable=True)
    status = Column(String(20), default='pending')  # pending, verified, expired, rejected
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", back_populates="wallet_linking_requests")

    def __repr__(self):
        return f"<WalletLinkingRequest(id={self.id}, status={self.status}, new_address={self.new_wallet_address})>"