import strawberry
from typing import List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.core.database import SessionLocal
from app.core.auth import create_access_token, verify_password, get_password_hash
from app.core.hedera import hedera_client
from app.models.user import User as UserModel
from app.models.harvest import Harvest as HarvestModel
from app.models.loan import Loan as LoanModel
from app.models.transaction import Transaction as TransactionModel, TransactionType
from app.graphql.types import (
    User, Harvest, Loan, Transaction, AuthResponse, HederaTopicMessage, TokenInfo,
    UserInput, HarvestInput, LoanInput, LoginInput, WalletAuthPayload,
    MultiWalletUser, UserWallet, UserSession, WalletLinkingRequest,
    MultiWalletAuthPayload, WalletLinkingPayload, DeviceInfo,
    SendOTPInput, VerifyOTPInput, CompleteRegistrationInput, OTPResponse, RegistrationState,
    WalletType, UserRole, UpdateUserResponse
)
from app.core.wallet_auth import WalletAuthenticator
from app.models.user import UserRole as UserRoleModel
from app.models.user_wallet import UserWallet as UserWalletModel, UserSession as UserSessionModel
from app.services.multi_wallet_auth import MultiWalletAuthService
from app.services.otp_service import OTPService

@strawberry.type
class Query:
    
    @strawberry.field
    async def get_auth_message(self, address: str) -> str:
        """Generate SIWE-style authentication message for wallet signing"""
        nonce = WalletAuthenticator.generate_nonce()
        message = WalletAuthenticator.create_siwe_message(address, nonce)
        
        # Store nonce in Redis
        try:
            await WalletAuthenticator.store_nonce(nonce, address)
            print(f"✅ Nonce stored for address: {address[:20]}...")
        except Exception as e:
            print(f"❌ Failed to store nonce in Redis: {e}")
            # Continue anyway - we'll handle this in verification
        
        return message
    
    @strawberry.field
    async def me(self, info) -> Optional[User]:
        """Get current user information from JWT token"""
        current_user = info.context.current_user
        
        if not current_user:
            return None
        
        return User(
            id=current_user.id,
            email=current_user.email,
            full_name=current_user.full_name,
            role=current_user.role,
            hedera_account_id=current_user.hedera_account_id,
            wallet_type=current_user.wallet_type,
            phone=current_user.phone,
            address=current_user.address,
            farm_name=current_user.farm_name,
            company_name=current_user.company_name,
            is_active=current_user.is_active,
            is_verified=current_user.is_verified,
            email_verified=current_user.email_verified,
            registration_complete=current_user.registration_complete,
            created_at=current_user.created_at,
            updated_at=current_user.updated_at
        )
    
    @strawberry.field
    async def users(self) -> List[User]:
        """Get all users (admin only)"""
        db = SessionLocal()
        try:
            users = db.query(UserModel).all()
            return [User(
                id=user.id,
                email=user.email,
                full_name=user.full_name,
                role=user.role,
                hedera_account_id=user.hedera_account_id,
                phone=user.phone,
                address=user.address,
                farm_name=user.farm_name,
                company_name=user.company_name,
                is_active=user.is_active,
                is_verified=user.is_verified,
                created_at=user.created_at
            ) for user in users]
        finally:
            db.close()
    
    @strawberry.field
    async def harvests(self, farmer_id: Optional[str] = None) -> List[Harvest]:
        """Get harvests, optionally filtered by farmer"""
        db = SessionLocal()
        try:
            query = db.query(HarvestModel)
            
            if farmer_id:
                query = query.filter(HarvestModel.farmer_id == farmer_id)
                
            harvests = query.all()
            return [Harvest(
                id=harvest.id,
                farmer_id=harvest.farmer_id,
                crop_type=harvest.crop_type,
                variety=harvest.variety,
                quantity=harvest.quantity,
                unit=harvest.unit,
                farm_location=harvest.farm_location,
                planting_date=harvest.planting_date,
                harvest_date=harvest.harvest_date,
                quality_grade=harvest.quality_grade,
                moisture_content=harvest.moisture_content,
                organic_certified=harvest.organic_certified,
                hcs_transaction_id=harvest.hcs_transaction_id,
                hts_token_id=harvest.hts_token_id,
                status=harvest.status,
                notes=harvest.notes,
                created_at=harvest.created_at,
                updated_at=harvest.updated_at
            ) for harvest in harvests]
        finally:
            db.close()
    
    @strawberry.field
    async def loans(self, borrower_id: Optional[str] = None) -> List[Loan]:
        """Get loans, optionally filtered by borrower"""
        db = SessionLocal()
        try:
            query = db.query(LoanModel)
            
            if borrower_id:
                query = query.filter(LoanModel.borrower_id == borrower_id)
                
            loans = query.all()
            return [Loan(
                id=loan.id,
                borrower_id=loan.borrower_id,
                lender_id=loan.lender_id,
                amount=loan.amount,
                interest_rate=loan.interest_rate,
                term_months=loan.term_months,
                collateral_harvest_id=loan.collateral_harvest_id,
                collateral_token_id=loan.collateral_token_id,
                contract_id=loan.contract_id,
                contract_address=loan.contract_address,
                purpose=loan.purpose,
                status=loan.status,
                application_date=loan.application_date,
                approval_date=loan.approval_date,
                disbursement_date=loan.disbursement_date,
                due_date=loan.due_date,
                amount_disbursed=loan.amount_disbursed,
                amount_repaid=loan.amount_repaid,
                outstanding_balance=loan.outstanding_balance,
                created_at=loan.created_at
            ) for loan in loans]
        finally:
            db.close()
    
    @strawberry.field
    async def transactions(self, user_id: Optional[str] = None) -> List[Transaction]:
        """Get transactions, optionally filtered by user"""
        db = SessionLocal()
        try:
            query = db.query(TransactionModel)
            
            if user_id:
                query = query.filter(TransactionModel.user_id == user_id)
                
            transactions = query.order_by(TransactionModel.created_at.desc()).all()
            return [Transaction(
                id=tx.id,
                user_id=tx.user_id,
                transaction_type=tx.transaction_type,
                amount=tx.amount,
                description=tx.description,
                hedera_transaction_id=tx.hedera_transaction_id,
                hedera_consensus_timestamp=tx.hedera_consensus_timestamp,
                topic_id=tx.topic_id,
                token_id=tx.token_id,
                contract_id=tx.contract_id,
                harvest_id=tx.harvest_id,
                loan_id=tx.loan_id,
                status=tx.status,
                created_at=tx.created_at,
                confirmed_at=tx.confirmed_at
            ) for tx in transactions]
        finally:
            db.close()
    
    @strawberry.field
    async def topic_messages(self, topic_id: str, limit: int = 10) -> List[HederaTopicMessage]:
        """Get messages from Hedera topic via mirror node"""
        data = await hedera_client.get_topic_messages(topic_id, limit)
        if not data or "messages" not in data:
            return []
            
        return [HederaTopicMessage(
            consensus_timestamp=msg["consensus_timestamp"],
            message=msg["message"],
            payer_account_id=msg["payer_account_id"],
            sequence_number=msg["sequence_number"]
        ) for msg in data["messages"]]
    
    @strawberry.field
    async def token_info(self, token_id: str) -> Optional[TokenInfo]:
        """Get token information from Hedera mirror node"""
        data = await hedera_client.get_token_info(token_id)
        if not data:
            return None
            
        return TokenInfo(
            token_id=data["token_id"],
            name=data["name"],
            symbol=data["symbol"],
            total_supply=data["total_supply"],
            treasury_account_id=data["treasury_account"]["account"]
        )
    
    @strawberry.field
    async def get_user_wallets(self, user_id: str) -> List[UserWallet]:
        """Get all wallets for a user"""
        db = SessionLocal()
        try:
            multi_wallet_service = MultiWalletAuthService(db)
            wallets = multi_wallet_service.get_user_wallets(user_id)
            
            return [UserWallet(
                id=wallet.id,
                wallet_address=wallet.wallet_address,
                wallet_type=wallet.wallet_type,
                is_primary=wallet.is_primary,
                first_used_at=wallet.first_used_at,
                last_used_at=wallet.last_used_at,
                created_at=wallet.created_at
            ) for wallet in wallets]
        finally:
            db.close()
    
    @strawberry.field
    async def get_multi_wallet_user(self, user_id: str) -> Optional[MultiWalletUser]:
        """Get user with all their wallets and sessions"""
        db = SessionLocal()
        try:
            user = db.query(UserModel).filter(UserModel.id == user_id).first()
            if not user:
                return None
            
            # Get wallets
            wallets = db.query(UserWalletModel).filter(
                UserWalletModel.user_id == user_id
            ).order_by(UserWalletModel.is_primary.desc(), UserWalletModel.created_at).all()
            
            # Get active sessions
            active_sessions = db.query(UserSessionModel).filter(
                UserSessionModel.user_id == user_id,
                UserSessionModel.expires_at > datetime.utcnow()
            ).order_by(UserSessionModel.last_active_at.desc()).all()
            
            primary_wallet = next((w for w in wallets if w.is_primary), None)
            
            return MultiWalletUser(
                id=user.id,
                email=user.email,
                full_name=user.full_name,
                role=user.role,
                phone=user.phone,
                address=user.address,
                farm_name=user.farm_name,
                company_name=user.company_name,
                is_active=user.is_active,
                is_verified=user.is_verified,
                created_at=user.created_at,
                wallets=[UserWallet(
                    id=w.id,
                    wallet_address=w.wallet_address,
                    wallet_type=w.wallet_type,
                    is_primary=w.is_primary,
                    first_used_at=w.first_used_at,
                    last_used_at=w.last_used_at,
                    created_at=w.created_at
                ) for w in wallets],
                primary_wallet=UserWallet(
                    id=primary_wallet.id,
                    wallet_address=primary_wallet.wallet_address,
                    wallet_type=primary_wallet.wallet_type,
                    is_primary=primary_wallet.is_primary,
                    first_used_at=primary_wallet.first_used_at,
                    last_used_at=primary_wallet.last_used_at,
                    created_at=primary_wallet.created_at
                ) if primary_wallet else None,
                active_sessions=[UserSession(
                    id=s.id,
                    session_token=s.session_token,
                    device_fingerprint=s.device_fingerprint,
                    ip_address=s.ip_address,
                    user_agent=s.user_agent,
                    screen_resolution=s.screen_resolution,
                    timezone=s.timezone,
                    language=s.language,
                    expires_at=s.expires_at,
                    created_at=s.created_at,
                    last_active_at=s.last_active_at
                ) for s in active_sessions]
            )
        finally:
            db.close()


@strawberry.type
class Mutation:
    
    @strawberry.mutation
    async def authenticate_wallet(self, input: WalletAuthPayload) -> AuthResponse:
        """Authenticate user with wallet signature - supports multi-wallet"""
        db = SessionLocal()
        
        try:
            # Log incoming authentication request
            print(f"🔐 Authenticating wallet:")
            print(f"   Wallet Type: {input.wallet_type.value}")
            print(f"   Address: {input.address[:20]}...")
            print(f"   Message length: {len(input.message)}")
            print(f"   Signature length: {len(input.signature)}")
            print(f"   Has public_key: {input.public_key is not None}")
            
            # Verify wallet signature
            is_valid, account_id = await WalletAuthenticator.authenticate_wallet(
                address=input.address,
                signature=input.signature,
                message=input.message,
                wallet_type=input.wallet_type.value,
                public_key=input.public_key
            )
            
            if not is_valid or not account_id:
                # Return error response instead of raising exception
                print(f"❌ Wallet authentication failed: is_valid={is_valid}, account_id={account_id}")
                return AuthResponse(
                    success=False,
                    message="Invalid wallet signature",
                    token="",
                    user=None,
                    redirect_url=""
                )
            
            # Check if wallet exists in user_wallets table
            user_wallet = db.query(UserWalletModel).filter(
                UserWalletModel.wallet_address == account_id,
                UserWalletModel.wallet_type == input.wallet_type.value
            ).first()
            
            user = None
            if user_wallet:
                # Existing wallet - get the user
                user = db.query(UserModel).filter(UserModel.id == user_wallet.user_id).first()
                # Update last used timestamp
                user_wallet.last_used_at = datetime.utcnow()
                db.commit()
                print(f"✅ Existing user found: {user.id}")
            else:
                # Check if user exists with this hedera_account_id (legacy field)
                user = db.query(UserModel).filter(
                    UserModel.hedera_account_id == account_id
                ).first()
                
                if user:
                    # User exists but wallet entry is missing - create wallet entry
                    print(f"✅ Found existing user by hedera_account_id: {user.id}")
                    print(f"🔗 Creating missing wallet entry for user")
                    
                    user_wallet = UserWalletModel(
                        user_id=user.id,
                        wallet_address=account_id,
                        wallet_type=input.wallet_type.value,
                        public_key=input.public_key,
                        is_primary=True,  # First wallet is primary
                        first_used_at=datetime.utcnow(),
                        last_used_at=datetime.utcnow()
                    )
                    
                    db.add(user_wallet)
                    db.commit()
                    db.refresh(user)
                else:
                    # New wallet - create new user
                    print(f"🆕 Creating new user for wallet: {account_id[:20]}...")
                    
                    # Infer role based on wallet activity (simplified logic)
                    role = UserRoleModel.FARMER  # Default to farmer
                    
                    # Create new user
                    user = UserModel(
                        hedera_account_id=account_id,  # Keep for backward compatibility
                        wallet_type=input.wallet_type.value,
                        role=role,
                        is_active=True,
                        is_verified=False,
                        email_verified=False,
                        registration_complete=False
                    )
                    
                    db.add(user)
                    db.flush()  # Get user.id without committing
                    
                    # Create wallet entry
                    user_wallet = UserWalletModel(
                        user_id=user.id,
                        wallet_address=account_id,
                        wallet_type=input.wallet_type.value,
                        public_key=input.public_key,
                        is_primary=True,  # First wallet is primary
                        first_used_at=datetime.utcnow(),
                        last_used_at=datetime.utcnow()
                    )
                    
                    db.add(user_wallet)
                    db.commit()
                    db.refresh(user)
                    print(f"✅ New user created: {user.id}")
            
            # Create JWT token with consistent payload
            token_data = {
                "sub": str(user.id),
                "hedera_account_id": account_id,
                "wallet_address": account_id,  # Keep for backward compatibility
                "wallet_type": input.wallet_type.value,
                "email_verified": user.email_verified or False,
                "registration_complete": user.registration_complete or False
            }
            access_token = create_access_token(data=token_data)
            
            # Determine redirect URL based on user state
            redirect_url = "/dashboard"
            
            # Check if user needs to complete registration
            if not user.email or not user.email_verified:
                redirect_url = "/onboarding/complete"
                print(f"⚠️  User needs to complete registration (no verified email)")
            elif not user.full_name:
                redirect_url = "/onboarding"
                print(f"⚠️  User needs onboarding (no full name)")
            
            return AuthResponse(
                success=True,
                message="Authentication successful",
                token=access_token,
                access_token=access_token,
                refresh_token=None,  # TODO: Implement refresh token
                user=User(
                    id=user.id,
                    email=user.email,
                    full_name=user.full_name,
                    role=user.role,
                    hedera_account_id=user.hedera_account_id,
                    wallet_type=user.wallet_type,
                    phone=user.phone,
                    address=user.address,
                    farm_name=user.farm_name,
                    company_name=user.company_name,
                    is_active=user.is_active,
                    is_verified=user.is_verified,
                    email_verified=user.email_verified,
                    registration_complete=user.registration_complete,
                    created_at=user.created_at,
                    updated_at=user.updated_at
                ),
                redirect_url=redirect_url
            )
        except Exception as e:
            print(f"❌ Error in authenticate_wallet: {e}")
            import traceback
            traceback.print_exc()
            db.rollback()
            return AuthResponse(
                success=False,
                message=f"Authentication error: {str(e)}",
                token="",
                user=None,
                redirect_url=""
            )
        finally:
            db.close()
    
    @strawberry.mutation
    async def register(self, user_input: UserInput) -> AuthResponse:
        """Register a new user (legacy email/password - deprecated)"""
        db = SessionLocal()
        
        # Check if user already exists
        existing_user = db.query(UserModel).filter(UserModel.email == user_input.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create new user
        hashed_password = get_password_hash(user_input.password)
        user = UserModel(
            email=user_input.email,
            hashed_password=hashed_password,
            full_name=user_input.full_name,
            role=user_input.role,
            phone=user_input.phone,
            address=user_input.address,
            farm_name=user_input.farm_name,
            company_name=user_input.company_name,
            hedera_account_id=f"legacy_{user_input.email}"  # Placeholder for legacy users
        )
        
        try:
            db.add(user)
            db.commit()
            db.refresh(user)
            
            # Create access token
            access_token = create_access_token(data={"sub": str(user.id)})
            
            return AuthResponse(
                success=True,
                message="Registration successful",
                token=access_token,
                access_token=access_token,
                refresh_token=None,
                user=User(
                    id=user.id,
                    email=user.email,
                    full_name=user.full_name,
                    role=user.role,
                    hedera_account_id=user.hedera_account_id,
                    wallet_type=user.wallet_type,
                    phone=user.phone,
                    address=user.address,
                    farm_name=user.farm_name,
                    company_name=user.company_name,
                    is_active=user.is_active,
                    is_verified=user.is_verified,
                    email_verified=user.email_verified,
                    registration_complete=user.registration_complete,
                    created_at=user.created_at,
                    updated_at=user.updated_at
                ),
                redirect_url="/dashboard"
            )
        finally:
            db.close()
    
    @strawberry.mutation
    async def login(self, login_input: LoginInput) -> AuthResponse:
        """Login user (legacy email/password - deprecated)"""
        db = SessionLocal()
        
        try:
            user = db.query(UserModel).filter(UserModel.email == login_input.email).first()
            if not user or not verify_password(login_input.password, user.hashed_password):
                raise HTTPException(status_code=401, detail="Invalid credentials")
            
            access_token = create_access_token(data={"sub": str(user.id)})
            
            return AuthResponse(
                success=True,
                message="Login successful",
                token=access_token,
                access_token=access_token,
                refresh_token=None,
                user=User(
                    id=user.id,
                    email=user.email,
                    full_name=user.full_name,
                    role=user.role,
                    hedera_account_id=user.hedera_account_id,
                    wallet_type=user.wallet_type,
                    phone=user.phone,
                    address=user.address,
                    farm_name=user.farm_name,
                    company_name=user.company_name,
                    is_active=user.is_active,
                    is_verified=user.is_verified,
                    email_verified=user.email_verified,
                    registration_complete=user.registration_complete,
                    created_at=user.created_at,
                    updated_at=user.updated_at
                ),
                redirect_url="/dashboard"
            )
        finally:
            db.close()
    
    @strawberry.mutation
    async def record_harvest(self, harvest_input: HarvestInput) -> Harvest:
        """Record a new harvest and submit to Hedera HCS"""
        db = SessionLocal()
        # current_user = info.context["current_user"]  # Would be extracted from JWT
        
        # For demo, we'll use a placeholder farmer_id
        farmer_id = "00000000-0000-0000-0000-000000000001"  # Replace with actual user ID
        
        # Create harvest record
        harvest = HarvestModel(
            farmer_id=farmer_id,
            crop_type=harvest_input.crop_type,
            variety=harvest_input.variety,
            quantity=harvest_input.quantity,
            unit=harvest_input.unit,
            farm_location=harvest_input.farm_location,
            planting_date=harvest_input.planting_date,
            harvest_date=harvest_input.harvest_date,
            quality_grade=harvest_input.quality_grade,
            moisture_content=harvest_input.moisture_content,
            organic_certified=harvest_input.organic_certified,
            notes=harvest_input.notes
        )
        
        db.add(harvest)
        db.commit()
        db.refresh(harvest)
        
        # Submit to Hedera HCS
        message_data = {
            "type": "harvest_record",
            "harvest_id": str(harvest.id),
            "farmer_id": str(harvest.farmer_id),
            "crop_type": harvest.crop_type,
            "quantity": harvest.quantity,
            "farm_location": harvest.farm_location,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        hcs_tx_id = await hedera_client.submit_message(message_data)
        if hcs_tx_id:
            harvest.hcs_transaction_id = hcs_tx_id
            db.commit()
            
            # Create transaction record
            transaction = TransactionModel(
                user_id=farmer_id,
                transaction_type=TransactionType.HARVEST_RECORD,
                description=f"Recorded harvest of {harvest.quantity} {harvest.unit} {harvest.crop_type}",
                hedera_transaction_id=hcs_tx_id,
                harvest_id=harvest.id,
                status="confirmed"
            )
            db.add(transaction)
            db.commit()
        
        return Harvest(
            id=harvest.id,
            farmer_id=harvest.farmer_id,
            crop_type=harvest.crop_type,
            variety=harvest.variety,
            quantity=harvest.quantity,
            unit=harvest.unit,
            farm_location=harvest.farm_location,
            planting_date=harvest.planting_date,
            harvest_date=harvest.harvest_date,
            quality_grade=harvest.quality_grade,
            moisture_content=harvest.moisture_content,
            organic_certified=harvest.organic_certified,
            hcs_transaction_id=harvest.hcs_transaction_id,
            hts_token_id=harvest.hts_token_id,
            status=harvest.status,
            notes=harvest.notes,
            created_at=harvest.created_at,
            updated_at=harvest.updated_at
        )
    
    @strawberry.mutation
    async def tokenize_harvest(self, harvest_id: str, info) -> Harvest:
        """Tokenize a harvest using Hedera HTS"""
        db: Session = info.context["db"]
        
        harvest = db.query(HarvestModel).filter(HarvestModel.id == harvest_id).first()
        if not harvest:
            raise HTTPException(status_code=404, detail="Harvest not found")
        
        if harvest.hts_token_id:
            raise HTTPException(status_code=400, detail="Harvest already tokenized")
        
        # Create HTS token
        token_name = f"{harvest.crop_type.title()} Harvest {harvest.id}"
        token_symbol = f"{harvest.crop_type.upper()[:3]}{str(harvest.id)[:6]}"
        
        token_id = await hedera_client.create_token(token_name, token_symbol, int(harvest.quantity * 1000))
        
        if token_id:
            harvest.hts_token_id = token_id
            harvest.status = "tokenized"
            db.commit()
            
            # Create transaction record
            transaction = TransactionModel(
                user_id=harvest.farmer_id,
                transaction_type=TransactionType.TOKENIZATION,
                description=f"Tokenized harvest {harvest.id} as {token_symbol}",
                token_id=token_id,
                harvest_id=harvest.id,
                status="confirmed"
            )
            db.add(transaction)
            db.commit()
        
        return Harvest(
            id=harvest.id,
            farmer_id=harvest.farmer_id,
            crop_type=harvest.crop_type,
            variety=harvest.variety,
            quantity=harvest.quantity,
            unit=harvest.unit,
            farm_location=harvest.farm_location,
            planting_date=harvest.planting_date,
            harvest_date=harvest.harvest_date,
            quality_grade=harvest.quality_grade,
            moisture_content=harvest.moisture_content,
            organic_certified=harvest.organic_certified,
            hcs_transaction_id=harvest.hcs_transaction_id,
            hts_token_id=harvest.hts_token_id,
            status=harvest.status,
            notes=harvest.notes,
            created_at=harvest.created_at,
            updated_at=harvest.updated_at
        )
    
    @strawberry.mutation
    async def create_loan(self, loan_input: LoanInput, info) -> Loan:
        """Create a new loan application"""
        db: Session = info.context["db"]
        # current_user = info.context["current_user"]  # Would be extracted from JWT
        
        # For demo, we'll use a placeholder borrower_id
        borrower_id = "00000000-0000-0000-0000-000000000001"
        
        loan = LoanModel(
            borrower_id=borrower_id,
            amount=loan_input.amount,
            interest_rate=loan_input.interest_rate,
            term_months=loan_input.term_months,
            collateral_harvest_id=loan_input.collateral_harvest_id,
            purpose=loan_input.purpose,
            outstanding_balance=loan_input.amount
        )
        
        db.add(loan)
        db.commit()
        db.refresh(loan)
        
        # Create transaction record
        transaction = TransactionModel(
            user_id=borrower_id,
            transaction_type=TransactionType.LOAN_CREATION,
            amount=loan.amount,
            description=f"Created loan application for ${loan.amount}",
            loan_id=loan.id,
            status="pending"
        )
        db.add(transaction)
        db.commit()
        
        return Loan(
            id=loan.id,
            borrower_id=loan.borrower_id,
            lender_id=loan.lender_id,
            amount=loan.amount,
            interest_rate=loan.interest_rate,
            term_months=loan.term_months,
            collateral_harvest_id=loan.collateral_harvest_id,
            collateral_token_id=loan.collateral_token_id,
            contract_id=loan.contract_id,
            contract_address=loan.contract_address,
            purpose=loan.purpose,
            status=loan.status,
            application_date=loan.application_date,
            approval_date=loan.approval_date,
            disbursement_date=loan.disbursement_date,
            due_date=loan.due_date,
            amount_disbursed=loan.amount_disbursed,
            amount_repaid=loan.amount_repaid,
            outstanding_balance=loan.outstanding_balance,
            created_at=loan.created_at
        )
    
    @strawberry.mutation
    async def authenticate_multi_wallet(self, input: MultiWalletAuthPayload) -> AuthResponse:
        """
        Progressive wallet authentication with multi-wallet support.
        This connects the wallet but requires email verification before completing registration.
        """
        db = SessionLocal()
        
        try:
            multi_wallet_service = MultiWalletAuthService(db)
            
            # Convert device info to dict
            device_info = None
            if input.device_info:
                device_info = {
                    'user_agent': input.device_info.user_agent,
                    'screen_resolution': input.device_info.screen_resolution,
                    'timezone': input.device_info.timezone,
                    'language': input.device_info.language,
                    'ip_address': input.device_info.ip_address,
                    'browser_signature': input.device_info.browser_signature
                }
            
            # Authenticate and identify user
            user, is_new_user, session_token = await multi_wallet_service.authenticate_or_identify_user(
                wallet_address=input.address,
                signature=input.signature,
                message=input.message,
                wallet_type=input.wallet_type.value,
                public_key=input.public_key,
                device_info=device_info
            )
            
            if not user:
                raise HTTPException(status_code=401, detail="Authentication failed")
            
            # Check if there's a verified email waiting to be linked (from registration flow)
            from app.core.redis_client import redis_client
            if redis_client.redis and is_new_user:
                # Check for verified email by looking up email verification tokens
                # We'll check if any verified_email entries exist and try to match them
                # For simplicity, we'll rely on the frontend to call link_email_to_wallet
                # after wallet connection, but we could also enhance this
                pass
            
            # Determine registration state
            wallet_connected = len(user.wallets) > 0
            email_verified = user.email_verified or False
            profile_complete = bool(user.full_name and user.role)
            registration_complete = user.registration_complete or False
            
            # Determine if email verification is required
            requires_email_verification = not email_verified or is_new_user
            
            # Determine registration state string
            if registration_complete:
                registration_state = "registration_complete"
            elif profile_complete:
                registration_state = "profile_complete"
            elif email_verified:
                registration_state = "email_verified"
            else:
                registration_state = "wallet_connected"
            
            # Create JWT token with session info (limited token for unverified users)
            token_data = {
                "sub": str(user.id),
                "hedera_account_id": user.hedera_account_id,
                "session_token": session_token,
                "email_verified": email_verified,
                "registration_complete": registration_complete
            }
            access_token = create_access_token(data=token_data)
            
            # Determine redirect URL based on registration state
            if registration_complete and user.full_name:
                redirect_url = "/dashboard"
            elif email_verified and not profile_complete:
                redirect_url = "/auth/complete-registration"
            elif not email_verified:
                redirect_url = "/auth/verify-email"
            else:
                redirect_url = "/auth/complete-registration"
            
            return AuthResponse(
                success=True,
                message="Multi-wallet authentication successful",
                token=access_token,
                access_token=access_token,
                refresh_token=None,
                user=User(
                    id=user.id,
                    email=user.email,
                    full_name=user.full_name,
                    role=user.role,
                    hedera_account_id=user.hedera_account_id,
                    wallet_type=user.wallet_type,
                    phone=user.phone,
                    address=user.address,
                    farm_name=user.farm_name,
                    company_name=user.company_name,
                    is_active=user.is_active,
                    is_verified=user.is_verified,
                    email_verified=user.email_verified,
                    registration_complete=user.registration_complete,
                    created_at=user.created_at,
                    updated_at=user.updated_at
                ),
                redirect_url=redirect_url,
                session_id=session_token,
                is_new_user=is_new_user,
                requires_email_verification=requires_email_verification,
                registration_state=registration_state
            )
        finally:
            db.close()
    
    @strawberry.mutation
    async def link_wallet(self, input: WalletLinkingPayload, user_id: str) -> bool:
        """Link a new wallet to an existing user account"""
        db = SessionLocal()
        
        try:
            multi_wallet_service = MultiWalletAuthService(db)
            
            success = await multi_wallet_service.link_wallet_to_user(
                user_id=user_id,
                new_wallet_address=input.new_wallet_address,
                new_wallet_type=input.new_wallet_type.value,
                new_wallet_signature=input.new_wallet_signature,
                primary_wallet_signature=input.primary_wallet_signature,
                message=input.message,
                public_key=input.public_key
            )
            
            return success
        finally:
            db.close()
    
    @strawberry.mutation
    async def set_primary_wallet(self, user_id: str, wallet_id: str) -> bool:
        """Set a wallet as the primary wallet for a user"""
        db = SessionLocal()
        
        try:
            multi_wallet_service = MultiWalletAuthService(db)
            return multi_wallet_service.set_primary_wallet(user_id, wallet_id)
        finally:
            db.close()
    
    @strawberry.mutation
    async def send_otp(self, input: SendOTPInput) -> OTPResponse:
        """Send OTP to email for verification"""
        try:
            # Validate email format
            import re
            email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_pattern, input.email):
                return OTPResponse(
                    success=False,
                    message="Invalid email format"
                )
            
            # Generate and send OTP
            success, error_message = await OTPService.generate_and_send_otp(
                email=input.email,
                purpose=input.purpose
            )
            
            if success:
                return OTPResponse(
                    success=True,
                    message="Verification code sent to your email"
                )
            else:
                return OTPResponse(
                    success=False,
                    message=error_message or "Failed to send verification code"
                )
        except Exception as e:
            return OTPResponse(
                success=False,
                message=f"Error: {str(e)}"
            )
    
    @strawberry.mutation
    async def verify_otp(self, input: VerifyOTPInput) -> OTPResponse:
        """
        Verify OTP for email and link it to user account.
        If wallet_address and wallet_type are provided, link email to that wallet's user.
        If no user exists (registration flow), store verified email in Redis for later linking.
        """
        try:
            is_valid, message = await OTPService.verify_otp(
                email=input.email,
                otp=input.otp,
                purpose=input.purpose
            )
            
            if is_valid:
                # Update user email_verified status and link email
                db = SessionLocal()
                try:
                    user = None
                    
                    # If wallet info provided, find user by wallet
                    if input.wallet_address and input.wallet_type:
                        wallet = db.query(UserWalletModel).filter(
                            UserWalletModel.wallet_address == input.wallet_address,
                            UserWalletModel.wallet_type == input.wallet_type.value
                        ).first()
                        if wallet:
                            user = wallet.user
                    
                    # If no user found, try by email
                    if not user:
                        user = db.query(UserModel).filter(UserModel.email == input.email).first()
                    
                    if user:
                        # Check if email is already taken by another user
                        if user.email and user.email != input.email:
                            existing_user = db.query(UserModel).filter(
                                UserModel.email == input.email,
                                UserModel.id != user.id
                            ).first()
                            if existing_user:
                                db.close()
                                return OTPResponse(
                                    success=False,
                                    message="This email is already associated with another account"
                                )
                        
                        # Link email to user
                        user.email = input.email
                        user.email_verified = True
                        db.commit()
                    else:
                        # No user found - this is registration flow
                        # Store verified email in Redis for later linking when wallet is connected
                        from app.core.redis_client import redis_client
                        import secrets
                        if redis_client.redis:
                            # Generate a verification token for this email
                            verification_token = secrets.token_urlsafe(32)
                            # Store verified email with token (expires in 30 minutes)
                            await redis_client.redis.setex(
                                f"verified_email:{verification_token}",
                                1800,  # 30 minutes
                                input.email
                            )
                            # Also store email -> token mapping for quick lookup
                            await redis_client.redis.setex(
                                f"email_verification_token:{input.email}",
                                1800,
                                verification_token
                            )
                            # Return success - email is verified, will be linked when wallet connects
                            db.close()
                            return OTPResponse(
                                success=True,
                                message="Email verified successfully. Please connect your wallet to continue."
                            )
                        else:
                            db.close()
                            return OTPResponse(
                                success=False,
                                message="Service unavailable. Please try again."
                            )
                finally:
                    db.close()
            
            return OTPResponse(
                success=is_valid,
                message=message
            )
        except Exception as e:
            return OTPResponse(
                success=False,
                message=f"Error: {str(e)}"
            )
    
    @strawberry.mutation
    async def link_email_to_wallet(
        self,
        email: str,
        wallet_address: str,
        wallet_type: WalletType
    ) -> OTPResponse:
        """
        Link email to wallet-connected user account.
        If email was already verified (registration flow), link it directly.
        Otherwise, send OTP for verification.
        """
        db = SessionLocal()
        
        try:
            # Find user by wallet
            wallet = db.query(UserWalletModel).filter(
                UserWalletModel.wallet_address == wallet_address,
                UserWalletModel.wallet_type == wallet_type.value
            ).first()
            
            if not wallet:
                return OTPResponse(
                    success=False,
                    message="Wallet not found. Please connect your wallet first."
                )
            
            user = wallet.user
            
            # Check if email is already taken
            existing_user = db.query(UserModel).filter(
                UserModel.email == email,
                UserModel.id != user.id
            ).first()
            
            if existing_user:
                return OTPResponse(
                    success=False,
                    message="This email is already associated with another account"
                )
            
            # Check if email was already verified (from registration flow)
            from app.core.redis_client import redis_client
            email_already_verified = False
            if redis_client.redis:
                # Check if there's a verification token for this email
                verification_token = await redis_client.redis.get(f"email_verification_token:{email}")
                if verification_token:
                    # Verify that the verified email exists
                    verified_email = await redis_client.redis.get(f"verified_email:{verification_token.decode() if isinstance(verification_token, bytes) else verification_token}")
                    if verified_email:
                        email_already_verified = True
                        # Clean up verification tokens
                        await redis_client.redis.delete(f"email_verification_token:{email}")
                        await redis_client.redis.delete(f"verified_email:{verification_token.decode() if isinstance(verification_token, bytes) else verification_token}")
            
            if email_already_verified:
                # Email was already verified, link it directly
                user.email = email
                user.email_verified = True
                db.commit()
                return OTPResponse(
                    success=True,
                    message="Email linked successfully"
                )
            else:
                # Email not verified, send OTP
                # Temporarily store email (will be confirmed after OTP verification)
                if redis_client.redis:
                    await redis_client.redis.setex(
                        f"pending_email:{user.id}",
                        600,  # 10 minutes
                        email
                    )
                
                # Generate and send OTP
                success, error_message = await OTPService.generate_and_send_otp(
                    email=email,
                    purpose="verification"
                )
                
                if success:
                    return OTPResponse(
                        success=True,
                        message="Verification code sent to your email"
                    )
                else:
                    return OTPResponse(
                        success=False,
                        message=error_message or "Failed to send verification code"
                    )
        finally:
            db.close()
    
    @strawberry.mutation
    async def complete_registration(
        self,
        input: CompleteRegistrationInput,
        wallet_address: str,
        wallet_type: WalletType
    ) -> AuthResponse:
        """
        Complete registration after wallet connection and email verification.
        This is called after wallet is connected and email is verified.
        """
        db = SessionLocal()
        
        try:
            # Find user by wallet address
            wallet = db.query(UserWalletModel).filter(
                UserWalletModel.wallet_address == wallet_address,
                UserWalletModel.wallet_type == wallet_type.value
            ).first()
            
            if not wallet:
                raise HTTPException(status_code=404, detail="Wallet not found. Please connect your wallet first.")
            
            user = wallet.user
            
            # Verify email matches and is verified
            if user.email and user.email != input.email:
                raise HTTPException(status_code=400, detail="Email does not match verified email")
            
            if not user.email_verified:
                raise HTTPException(status_code=400, detail="Email must be verified before completing registration")
            
            # Set email if not already set
            if not user.email:
                user.email = input.email
            
            # Update user profile
            user.full_name = input.full_name
            user.role = input.role
            user.phone = input.phone
            user.address = input.address
            user.farm_name = input.farm_name if input.role == UserRoleModel.FARMER else None
            user.company_name = input.company_name if input.role == UserRoleModel.BUYER else None
            user.registration_complete = True
            user.is_verified = True
            
            db.commit()
            db.refresh(user)
            
            # Create or update JWT token
            session = db.query(UserSessionModel).filter(
                UserSessionModel.current_wallet_id == wallet.id,
                UserSessionModel.expires_at > datetime.utcnow()
            ).order_by(UserSessionModel.created_at.desc()).first()
            
            token_data = {
                "sub": str(user.id),
                "hedera_account_id": user.hedera_account_id,
                "role": user.role.value,
                "session_token": session.session_token if session else None,
                "email_verified": user.email_verified,
                "registration_complete": user.registration_complete
            }
            access_token = create_access_token(data=token_data)
            
            return AuthResponse(
                success=True,
                message="Registration completed successfully",
                token=access_token,
                access_token=access_token,
                refresh_token=None,
                user=User(
                    id=user.id,
                    email=user.email,
                    full_name=user.full_name,
                    role=user.role,
                    hedera_account_id=user.hedera_account_id,
                    wallet_type=user.wallet_type,
                    phone=user.phone,
                    address=user.address,
                    farm_name=user.farm_name,
                    company_name=user.company_name,
                    is_active=user.is_active,
                    is_verified=user.is_verified,
                    email_verified=user.email_verified,
                    registration_complete=user.registration_complete,
                    created_at=user.created_at,
                    updated_at=user.updated_at
                ),
                redirect_url="/dashboard",
                session_id=session.session_token if session else None,
                is_new_user=False,
                requires_email_verification=False,
                registration_state="registration_complete"
            )
        finally:
            db.close()
    
    @strawberry.field
    async def get_registration_state(self, user_id: str) -> RegistrationState:
        """Get the current registration state for a user"""
        db = SessionLocal()
        
        try:
            user = db.query(UserModel).filter(UserModel.id == user_id).first()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            
            wallet_connected = len(user.wallets) > 0
            email_verified = user.email_verified or False
            profile_complete = bool(user.full_name and user.role)
            registration_complete = user.registration_complete or False
            
            # Determine next step
            next_step = None
            if not wallet_connected:
                next_step = "wallet_connection"
            elif not email_verified:
                next_step = "email_verification"
            elif not profile_complete:
                next_step = "profile_completion"
            elif not registration_complete:
                next_step = "registration_completion"
            
            return RegistrationState(
                wallet_connected=wallet_connected,
                email_verified=email_verified,
                profile_complete=profile_complete,
                registration_complete=registration_complete,
                next_step=next_step
            )
        finally:
            db.close()
    
    @strawberry.mutation
    async def update_user_role(self, role: UserRole, info) -> UpdateUserResponse:
        """Update user's role/account type"""
        current_user = info.context.current_user
        
        if not current_user:
            return UpdateUserResponse(
                success=False,
                message="Authentication required"
            )
        
        db = SessionLocal()
        
        try:
            user = db.query(UserModel).filter(UserModel.id == current_user.id).first()
            if not user:
                return UpdateUserResponse(
                    success=False,
                    message="User not found"
                )
            
            user.role = role
            db.commit()
            db.refresh(user)
            
            return UpdateUserResponse(
                success=True,
                message="Account type updated successfully",
                user=User(
                    id=user.id,
                    email=user.email,
                    full_name=user.full_name,
                    role=user.role,
                    hedera_account_id=user.hedera_account_id,
                    wallet_type=user.wallet_type,
                    phone=user.phone,
                    address=user.address,
                    farm_name=user.farm_name,
                    company_name=user.company_name,
                    is_active=user.is_active,
                    is_verified=user.is_verified,
                    email_verified=user.email_verified,
                    registration_complete=user.registration_complete,
                    created_at=user.created_at,
                    updated_at=user.updated_at
                )
            )
        except Exception as e:
            db.rollback()
            return UpdateUserResponse(
                success=False,
                message=f"Failed to update account type: {str(e)}"
            )
        finally:
            db.close()
    
    @strawberry.mutation
    async def update_user_profile(self, input: CompleteRegistrationInput, info) -> UpdateUserResponse:
        """Update user's profile information"""
        current_user = info.context.current_user
        
        if not current_user:
            return UpdateUserResponse(
                success=False,
                message="Authentication required"
            )
        
        db = SessionLocal()
        
        try:
            user = db.query(UserModel).filter(UserModel.id == current_user.id).first()
            if not user:
                return UpdateUserResponse(
                    success=False,
                    message="User not found"
                )
            
            # Update user profile
            if input.full_name:
                user.full_name = input.full_name
            if input.phone:
                user.phone = input.phone
            if input.address:
                user.address = input.address
            if input.farm_name and user.role == UserRoleModel.FARMER:
                user.farm_name = input.farm_name
            if input.company_name and user.role == UserRoleModel.BUYER:
                user.company_name = input.company_name
            
            # Mark profile as complete if all required fields are filled
            if user.full_name and user.role:
                user.registration_complete = True
            
            db.commit()
            db.refresh(user)
            
            return UpdateUserResponse(
                success=True,
                message="Profile updated successfully",
                user=User(
                    id=user.id,
                    email=user.email,
                    full_name=user.full_name,
                    role=user.role,
                    hedera_account_id=user.hedera_account_id,
                    wallet_type=user.wallet_type,
                    phone=user.phone,
                    address=user.address,
                    farm_name=user.farm_name,
                    company_name=user.company_name,
                    is_active=user.is_active,
                    is_verified=user.is_verified,
                    email_verified=user.email_verified,
                    registration_complete=user.registration_complete,
                    created_at=user.created_at,
                    updated_at=user.updated_at
                )
            )
        except Exception as e:
            db.rollback()
            return UpdateUserResponse(
                success=False,
                message=f"Failed to update profile: {str(e)}"
            )
        finally:
            db.close()