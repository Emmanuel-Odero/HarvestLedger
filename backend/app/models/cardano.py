from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer, Index, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.database import Base


class CardanoWallet(Base):
    """Model for storing Cardano wallet information"""
    __tablename__ = "cardano_wallets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    address = Column(String(255), nullable=False, index=True)  # Cardano wallet address (bech32)
    stake_address = Column(String(255), nullable=True)  # Stake address for rewards
    wallet_type = Column(String(50), nullable=False)  # 'nami', 'eternl', 'flint', 'lace', 'typhon'
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_synced_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", backref="cardano_wallets")
    tokens = relationship("CardanoToken", back_populates="wallet", cascade="all, delete-orphan")
    transactions = relationship("CardanoTransaction", back_populates="wallet", cascade="all, delete-orphan")
    sent_transfers = relationship(
        "CardanoTokenTransfer",
        foreign_keys="CardanoTokenTransfer.from_wallet_id",
        back_populates="from_wallet",
        cascade="all, delete-orphan"
    )
    received_transfers = relationship(
        "CardanoTokenTransfer",
        foreign_keys="CardanoTokenTransfer.to_wallet_id",
        back_populates="to_wallet",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<CardanoWallet(id={self.id}, address={self.address}, type={self.wallet_type})>"


class CardanoToken(Base):
    """Model for storing Cardano native tokens"""
    __tablename__ = "cardano_tokens"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    policy_id = Column(String(56), nullable=False)  # Token policy ID (hex, 56 chars)
    asset_name = Column(String(64), nullable=False)  # Asset name (hex encoded)
    asset_name_readable = Column(String(255), nullable=True)  # Human-readable asset name
    fingerprint = Column(String(44), nullable=True, index=True)  # Asset fingerprint
    owner_wallet_id = Column(UUID(as_uuid=True), ForeignKey("cardano_wallets.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(String(78), nullable=False)  # Token quantity (string for large numbers)
    token_metadata = Column(JSONB, nullable=True)  # Token metadata (CIP-25 format)
    minting_tx_hash = Column(String(64), nullable=True)  # Transaction hash of minting
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    wallet = relationship("CardanoWallet", back_populates="tokens")
    transfers = relationship("CardanoTokenTransfer", back_populates="token", cascade="all, delete-orphan")

    # Indexes
    __table_args__ = (
        Index('idx_cardano_policy_asset', 'policy_id', 'asset_name'),
        Index('idx_cardano_fingerprint', 'fingerprint'),
    )

    def __repr__(self):
        return f"<CardanoToken(id={self.id}, policy_id={self.policy_id}, asset_name={self.asset_name_readable})>"


class CardanoTransaction(Base):
    """Model for storing Cardano transactions"""
    __tablename__ = "cardano_transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tx_hash = Column(String(64), nullable=False, unique=True, index=True)  # Transaction hash
    wallet_id = Column(UUID(as_uuid=True), ForeignKey("cardano_wallets.id", ondelete="CASCADE"), nullable=False)
    transaction_type = Column(String(50), nullable=False)  # 'mint', 'transfer', 'metadata', 'contract'
    amount_ada = Column(String(78), nullable=True)  # ADA amount in lovelace
    fee = Column(String(78), nullable=True)  # Transaction fee in lovelace
    tx_metadata = Column(JSONB, nullable=True)  # Transaction metadata
    block_height = Column(Integer, nullable=True)  # Block number
    block_time = Column(DateTime(timezone=True), nullable=True)  # Block timestamp
    status = Column(String(20), nullable=False, default='pending')  # 'pending', 'confirmed', 'failed'
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    wallet = relationship("CardanoWallet", back_populates="transactions")
    token_transfers = relationship("CardanoTokenTransfer", back_populates="transaction", cascade="all, delete-orphan")
    supply_chain_events = relationship("CardanoSupplyChainEvent", back_populates="transaction", cascade="all, delete-orphan")

    # Indexes
    __table_args__ = (
        Index('idx_cardano_tx_hash', 'tx_hash', unique=True),
        Index('idx_cardano_wallet_time', 'wallet_id', 'block_time'),
    )

    def __repr__(self):
        return f"<CardanoTransaction(id={self.id}, tx_hash={self.tx_hash}, type={self.transaction_type})>"


class CardanoTokenTransfer(Base):
    """Model for storing Cardano token transfers"""
    __tablename__ = "cardano_token_transfers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    transaction_id = Column(UUID(as_uuid=True), ForeignKey("cardano_transactions.id", ondelete="CASCADE"), nullable=False)
    token_id = Column(UUID(as_uuid=True), ForeignKey("cardano_tokens.id", ondelete="CASCADE"), nullable=False)
    from_wallet_id = Column(UUID(as_uuid=True), ForeignKey("cardano_wallets.id", ondelete="CASCADE"), nullable=False)
    to_wallet_id = Column(UUID(as_uuid=True), ForeignKey("cardano_wallets.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(String(78), nullable=False)  # Transfer quantity
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    transaction = relationship("CardanoTransaction", back_populates="token_transfers")
    token = relationship("CardanoToken", back_populates="transfers")
    from_wallet = relationship("CardanoWallet", foreign_keys=[from_wallet_id], back_populates="sent_transfers")
    to_wallet = relationship("CardanoWallet", foreign_keys=[to_wallet_id], back_populates="received_transfers")

    def __repr__(self):
        return f"<CardanoTokenTransfer(id={self.id}, quantity={self.quantity})>"


class CardanoSupplyChainEvent(Base):
    """Model for storing Cardano supply chain events"""
    __tablename__ = "cardano_supply_chain_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    transaction_id = Column(UUID(as_uuid=True), ForeignKey("cardano_transactions.id", ondelete="CASCADE"), nullable=False)
    event_type = Column(String(50), nullable=False)  # 'harvest', 'processing', 'quality_check', 'transfer', 'certification'
    product_id = Column(String(255), nullable=True)  # Reference to product
    actor_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    location = Column(String(255), nullable=True)  # Event location
    timestamp = Column(DateTime(timezone=True), nullable=False)  # Event timestamp
    details = Column(JSONB, nullable=True)  # Event-specific details
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    transaction = relationship("CardanoTransaction", back_populates="supply_chain_events")
    actor = relationship("User", backref="cardano_supply_chain_events")

    def __repr__(self):
        return f"<CardanoSupplyChainEvent(id={self.id}, type={self.event_type}, product_id={self.product_id})>"
