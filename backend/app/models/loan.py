from sqlalchemy import Column, String, Integer, Float, DateTime, Enum, Text, ForeignKey, JSON, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

from app.core.database import Base


class LoanStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    ACTIVE = "active"
    REPAID = "repaid"
    DEFAULTED = "defaulted"


class Loan(Base):
    __tablename__ = "loans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    borrower_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    lender_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    # Loan details
    amount = Column(Float, nullable=False)  # in USD
    interest_rate = Column(Float, nullable=False)  # annual percentage
    term_months = Column(Integer, nullable=False)
    
    # Collateral (harvest-backed)
    collateral_harvest_id = Column(UUID(as_uuid=True), ForeignKey("harvests.id"), nullable=True)
    collateral_token_id = Column(String, nullable=True)  # HTS token used as collateral
    
    # Smart contract integration
    contract_id = Column(String, nullable=True)  # Hedera smart contract ID
    contract_address = Column(String, nullable=True)  # EVM contract address
    
    # Loan terms and conditions
    purpose = Column(Text, nullable=True)
    repayment_schedule = Column(JSON, nullable=True)  # Payment schedule details
    
    # Status and dates
    status = Column(Enum(LoanStatus), default=LoanStatus.PENDING)
    application_date = Column(DateTime(timezone=True), server_default=func.now())
    approval_date = Column(DateTime(timezone=True), nullable=True)
    disbursement_date = Column(DateTime(timezone=True), nullable=True)
    due_date = Column(DateTime(timezone=True), nullable=True)
    
    # Financial tracking
    amount_disbursed = Column(Float, default=0.0)
    amount_repaid = Column(Float, default=0.0)
    outstanding_balance = Column(Float, default=0.0)
    
    # Additional data
    notes = Column(Text, nullable=True)
    extra_data = Column(JSON, nullable=True)  # Additional flexible data
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    borrower = relationship("User", foreign_keys=[borrower_id], back_populates="borrowed_loans")
    lender = relationship("User", foreign_keys=[lender_id], back_populates="lent_loans")
    collateral_harvest = relationship("Harvest", back_populates="loans")

    def __repr__(self):
        return f"<Loan(id={self.id}, amount={self.amount}, status={self.status})>"


# Add relationships to other models
from app.models.user import User
from app.models.harvest import Harvest

User.borrowed_loans = relationship("Loan", foreign_keys=[Loan.borrower_id], back_populates="borrower")
User.lent_loans = relationship("Loan", foreign_keys=[Loan.lender_id], back_populates="lender")
Harvest.loans = relationship("Loan", back_populates="collateral_harvest")