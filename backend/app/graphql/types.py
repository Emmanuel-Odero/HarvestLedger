import strawberry
from typing import List, Optional
from datetime import datetime
import uuid
from enum import Enum


class UserRole(str, Enum):
    FARMER = "farmer"
    BUYER = "buyer"
    ADMIN = "admin"

class HarvestStatus(str, Enum):
    PLANTED = "planted"
    GROWING = "growing"
    HARVESTED = "harvested"
    TOKENIZED = "tokenized"
    SOLD = "sold"

class CropType(str, Enum):
    CORN = "corn"
    WHEAT = "wheat"
    SOYBEANS = "soybeans"
    RICE = "rice"
    COTTON = "cotton"
    TOMATOES = "tomatoes"
    POTATOES = "potatoes"
    OTHER = "other"

class LoanStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    ACTIVE = "active"
    REPAID = "repaid"
    DEFAULTED = "defaulted"

class TransactionType(str, Enum):
    HARVEST_RECORD = "harvest_record"
    TOKENIZATION = "tokenization"
    LOAN_CREATION = "loan_creation"
    PAYMENT = "payment"
    TRANSFER = "transfer"

class WalletType(str, Enum):
    HASHPACK = "HASHPACK"
    BLADE = "BLADE"
    KABILA = "KABILA"
    METAMASK = "METAMASK"
    PORTAL = "PORTAL"
    NAMI = "NAMI"
    ETERNL = "ETERNL"
    LACE = "LACE"
    FLINT = "FLINT"

# Convert to Strawberry enums
UserRole = strawberry.enum(UserRole)
HarvestStatus = strawberry.enum(HarvestStatus)
CropType = strawberry.enum(CropType)
LoanStatus = strawberry.enum(LoanStatus)
TransactionType = strawberry.enum(TransactionType)
WalletType = strawberry.enum(WalletType)


@strawberry.type
class User:
    id: uuid.UUID
    email: Optional[str] = None
    full_name: Optional[str] = None
    role: UserRole
    hedera_account_id: str
    wallet_type: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    farm_name: Optional[str] = None
    company_name: Optional[str] = None
    is_active: bool
    is_verified: bool
    email_verified: Optional[bool] = None
    registration_complete: Optional[bool] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    @strawberry.field
    def wallet_address(self) -> str:
        """Alias for hedera_account_id for frontend compatibility"""
        return self.hedera_account_id
    
    @strawberry.field
    def is_email_verified(self) -> Optional[bool]:
        """Alias for email_verified for frontend compatibility"""
        return self.email_verified
    
    @strawberry.field(name="fullName")
    def full_name_camel_case(self) -> Optional[str]:
        """Alias for full_name as fullName for frontend compatibility"""
        return self.full_name


@strawberry.type
class Harvest:
    id: uuid.UUID
    farmer_id: uuid.UUID
    crop_type: CropType
    variety: Optional[str] = None
    quantity: float
    unit: str
    farm_location: str
    planting_date: Optional[datetime] = None
    harvest_date: Optional[datetime] = None
    quality_grade: Optional[str] = None
    moisture_content: Optional[float] = None
    organic_certified: bool
    hcs_transaction_id: Optional[str] = None
    hts_token_id: Optional[str] = None
    status: HarvestStatus
    notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


@strawberry.type
class Loan:
    id: uuid.UUID
    borrower_id: uuid.UUID
    lender_id: Optional[uuid.UUID] = None
    amount: float
    interest_rate: float
    term_months: int
    collateral_harvest_id: Optional[uuid.UUID] = None
    collateral_token_id: Optional[str] = None
    contract_id: Optional[str] = None
    contract_address: Optional[str] = None
    purpose: Optional[str] = None
    status: LoanStatus
    application_date: datetime
    approval_date: Optional[datetime] = None
    disbursement_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    amount_disbursed: float
    amount_repaid: float
    outstanding_balance: float
    created_at: datetime


@strawberry.type
class Transaction:
    id: uuid.UUID
    user_id: uuid.UUID
    transaction_type: TransactionType
    amount: Optional[float] = None
    description: str
    hedera_transaction_id: Optional[str] = None
    hedera_consensus_timestamp: Optional[str] = None
    topic_id: Optional[str] = None
    token_id: Optional[str] = None
    contract_id: Optional[str] = None
    harvest_id: Optional[uuid.UUID] = None
    loan_id: Optional[uuid.UUID] = None
    status: str
    created_at: datetime
    confirmed_at: Optional[datetime] = None


@strawberry.type
class UserWallet:
    id: uuid.UUID
    wallet_address: str
    wallet_type: str
    is_primary: bool
    first_used_at: datetime
    last_used_at: datetime
    created_at: datetime


@strawberry.type
class UserSession:
    id: uuid.UUID
    session_token: str
    current_wallet: Optional[UserWallet] = None
    device_fingerprint: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    screen_resolution: Optional[str] = None
    timezone: Optional[str] = None
    language: Optional[str] = None
    expires_at: datetime
    created_at: datetime
    last_active_at: datetime


@strawberry.type
class WalletLinkingRequest:
    id: uuid.UUID
    new_wallet_address: str
    new_wallet_type: str
    status: str
    expires_at: datetime
    created_at: datetime


@strawberry.type
class AuthResponse:
    success: bool
    message: str
    token: Optional[str] = None
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    user: Optional[User] = None
    redirect_url: Optional[str] = None
    session_id: Optional[str] = None
    is_new_user: bool = False
    requires_email_verification: bool = False
    registration_state: Optional[str] = None  # 'wallet_connected', 'email_verified', 'profile_complete', 'registration_complete'


@strawberry.type
class MultiWalletUser:
    id: uuid.UUID
    email: Optional[str] = None
    full_name: Optional[str] = None
    role: UserRole
    phone: Optional[str] = None
    address: Optional[str] = None
    farm_name: Optional[str] = None
    company_name: Optional[str] = None
    is_active: bool
    is_verified: bool
    created_at: datetime
    wallets: List[UserWallet]
    primary_wallet: Optional[UserWallet] = None
    active_sessions: List[UserSession]


@strawberry.type
class HederaTopicMessage:
    consensus_timestamp: str
    message: str
    payer_account_id: str
    sequence_number: int


@strawberry.type
class TokenInfo:
    token_id: str
    name: str
    symbol: str
    total_supply: str
    treasury_account_id: str


# Input types for mutations
@strawberry.input
class UserInput:
    email: str
    password: str
    full_name: str
    role: UserRole
    phone: Optional[str] = None
    address: Optional[str] = None
    farm_name: Optional[str] = None
    company_name: Optional[str] = None


@strawberry.input
class HarvestInput:
    crop_type: CropType
    variety: Optional[str] = None
    quantity: float
    unit: str = "tons"
    farm_location: str
    planting_date: Optional[datetime] = None
    harvest_date: Optional[datetime] = None
    quality_grade: Optional[str] = None
    moisture_content: Optional[float] = None
    organic_certified: bool = False
    notes: Optional[str] = None


@strawberry.input
class LoanInput:
    amount: float
    interest_rate: float
    term_months: int
    collateral_harvest_id: Optional[uuid.UUID] = None
    purpose: Optional[str] = None


@strawberry.input
class LoginInput:
    email: str
    password: str

@strawberry.input
class WalletAuthPayload:
    address: str
    signature: str
    message: str
    wallet_type: WalletType
    public_key: Optional[str] = None


@strawberry.input
class DeviceInfo:
    user_agent: Optional[str] = None
    screen_resolution: Optional[str] = None
    timezone: Optional[str] = None
    language: Optional[str] = None
    ip_address: Optional[str] = None
    browser_signature: Optional[str] = None


@strawberry.input
class MultiWalletAuthPayload:
    address: str
    signature: str
    message: str
    wallet_type: WalletType
    public_key: Optional[str] = None
    device_info: Optional[DeviceInfo] = None


@strawberry.input
class WalletLinkingPayload:
    new_wallet_address: str
    new_wallet_type: WalletType
    new_wallet_signature: str
    primary_wallet_signature: str
    message: str
    public_key: Optional[str] = None


@strawberry.input
class SendOTPInput:
    email: str
    purpose: str = "verification"


@strawberry.input
class VerifyOTPInput:
    email: str
    otp: str
    purpose: str = "verification"
    wallet_address: Optional[str] = None
    wallet_type: Optional[WalletType] = None


@strawberry.input
class CompleteRegistrationInput:
    email: str
    full_name: str
    role: UserRole
    phone: Optional[str] = None
    address: Optional[str] = None
    farm_name: Optional[str] = None
    company_name: Optional[str] = None


@strawberry.type
class OTPResponse:
    success: bool
    message: str

@strawberry.type
class UpdateUserResponse:
    success: bool
    message: str
    user: Optional[User] = None


@strawberry.type
class RegistrationState:
    wallet_connected: bool
    email_verified: bool
    profile_complete: bool
    registration_complete: bool
    next_step: Optional[str] = None