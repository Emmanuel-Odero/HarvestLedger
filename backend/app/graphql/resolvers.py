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
    User, Harvest, Loan, Transaction, AuthPayload, HederaTopicMessage, TokenInfo,
    UserInput, HarvestInput, LoanInput, LoginInput
)

@strawberry.type
class Query:
    
    @strawberry.field
    async def me(self) -> Optional[User]:
        """Get current user information"""
        # In a real implementation, you'd extract user from JWT token
        # For now, this is a placeholder
        return None
    
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


@strawberry.type
class Mutation:
    
    @strawberry.mutation
    async def register(self, user_input: UserInput) -> AuthPayload:
        """Register a new user"""
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
            company_name=user_input.company_name
        )
        
        try:
            db.add(user)
            db.commit()
            db.refresh(user)
            
            # Create access token
            access_token = create_access_token(data={"sub": str(user.id)})
            
            return AuthPayload(
                access_token=access_token,
                token_type="bearer",
                user=User(
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
                )
            )
        finally:
            db.close()
    
    @strawberry.mutation
    async def login(self, login_input: LoginInput) -> AuthPayload:
        """Login user"""
        db = SessionLocal()
        
        try:
            user = db.query(UserModel).filter(UserModel.email == login_input.email).first()
            if not user or not verify_password(login_input.password, user.hashed_password):
                raise HTTPException(status_code=401, detail="Invalid credentials")
            
            access_token = create_access_token(data={"sub": str(user.id)})
            
            return AuthPayload(
                access_token=access_token,
                token_type="bearer",
                user=User(
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
                )
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