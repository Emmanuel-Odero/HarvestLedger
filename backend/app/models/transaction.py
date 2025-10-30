from sqlalchemy import Column, String, Float, DateTime, Enum, Text, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

from app.core.database import Base


class TransactionType(str, enum.Enum):
    HARVEST_RECORD = "harvest_record"
    TOKENIZATION = "tokenization"
    LOAN_CREATION = "loan_creation"
    PAYMENT = "payment"
    TRANSFER = "transfer"


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Transaction details
    transaction_type = Column(Enum(TransactionType), nullable=False)
    amount = Column(Float, nullable=True)  # For financial transactions
    description = Column(Text, nullable=False)
    
    # Blockchain references
    hedera_transaction_id = Column(String, nullable=True)
    hedera_consensus_timestamp = Column(String, nullable=True)
    topic_id = Column(String, nullable=True)  # HCS topic
    token_id = Column(String, nullable=True)  # HTS token
    contract_id = Column(String, nullable=True)  # Smart contract
    
    # Related entities
    harvest_id = Column(UUID(as_uuid=True), ForeignKey("harvests.id"), nullable=True)
    loan_id = Column(UUID(as_uuid=True), ForeignKey("loans.id"), nullable=True)
    
    # Transaction data
    transaction_data = Column(JSON, nullable=True)  # Flexible data storage
    
    # Status
    status = Column(String, default="pending")  # pending, confirmed, failed
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    confirmed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", back_populates="transactions")
    harvest = relationship("Harvest", back_populates="transactions")
    loan = relationship("Loan", back_populates="transactions")

    def __repr__(self):
        return f"<Transaction(id={self.id}, type={self.transaction_type}, status={self.status})>"


# Add relationships to other models
from app.models.user import User
from app.models.harvest import Harvest
from app.models.loan import Loan

User.transactions = relationship("Transaction", back_populates="user")
Harvest.transactions = relationship("Transaction", back_populates="harvest")
Loan.transactions = relationship("Transaction", back_populates="loan")