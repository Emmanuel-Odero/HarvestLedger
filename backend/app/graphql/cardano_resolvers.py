"""
GraphQL resolvers for Cardano blockchain operations.
Provides queries and mutations for wallet connection, token operations, and transaction management.
"""

import strawberry
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.core.database import SessionLocal
from app.core.cardano_client import cardano_client
from app.models.user import User as UserModel
from app.models.cardano import (
    CardanoWallet as CardanoWalletModel,
    CardanoToken as CardanoTokenModel,
    CardanoTransaction as CardanoTransactionModel,
    CardanoTokenTransfer as CardanoTokenTransferModel,
    CardanoSupplyChainEvent as CardanoSupplyChainEventModel
)
from app.graphql.cardano_types import (
    CardanoWallet,
    CardanoToken,
    CardanoTransaction,
    CardanoTokenTransfer,
    CardanoSupplyChainEvent,
    ConnectCardanoWalletInput,
    MintCardanoTokenInput,
    TransferCardanoTokenInput,
    CardanoWalletResponse,
    CardanoTokenResponse,
    CardanoTransactionResponse
)


@strawberry.type
class CardanoQuery:
    """GraphQL queries for Cardano blockchain data"""
    
    @strawberry.field
    async def cardano_wallet(
        self,
        info,
        wallet_id: Optional[str] = None,
        address: Optional[str] = None
    ) -> Optional[CardanoWallet]:
        """
        Get Cardano wallet information by ID or address.
        Requires authentication.
        """
        current_user = info.context.current_user
        if not current_user:
            raise HTTPException(status_code=401, detail="Authentication required")
        
        db = SessionLocal()
        try:
            query = db.query(CardanoWalletModel)
            
            if wallet_id:
                query = query.filter(CardanoWalletModel.id == wallet_id)
            elif address:
                query = query.filter(CardanoWalletModel.address == address)
            else:
                # Get primary wallet for current user
                query = query.filter(
                    CardanoWalletModel.user_id == current_user.id,
                    CardanoWalletModel.is_primary == True
                )
            
            wallet = query.first()
            
            if not wallet:
                return None
            
            # Verify user owns this wallet
            if wallet.user_id != current_user.id:
                raise HTTPException(status_code=403, detail="Access denied")
            
            return CardanoWallet(
                id=wallet.id,
                user_id=wallet.user_id,
                address=wallet.address,
                stake_address=wallet.stake_address,
                wallet_type=wallet.wallet_type,
                is_primary=wallet.is_primary,
                created_at=wallet.created_at,
                updated_at=wallet.updated_at,
                last_synced_at=wallet.last_synced_at
            )
        finally:
            db.close()
    
    @strawberry.field
    async def cardano_tokens(
        self,
        info,
        wallet_id: Optional[str] = None,
        policy_id: Optional[str] = None
    ) -> List[CardanoToken]:
        """
        Get Cardano tokens owned by user's wallet.
        Optionally filter by wallet_id or policy_id.
        """
        current_user = info.context.current_user
        if not current_user:
            raise HTTPException(status_code=401, detail="Authentication required")
        
        db = SessionLocal()
        try:
            # Build query
            query = db.query(CardanoTokenModel).join(CardanoWalletModel)
            
            # Filter by user
            query = query.filter(CardanoWalletModel.user_id == current_user.id)
            
            # Optional filters
            if wallet_id:
                query = query.filter(CardanoTokenModel.owner_wallet_id == wallet_id)
            
            if policy_id:
                query = query.filter(CardanoTokenModel.policy_id == policy_id)
            
            tokens = query.all()
            
            return [CardanoToken(
                id=token.id,
                policy_id=token.policy_id,
                asset_name=token.asset_name,
                asset_name_readable=token.asset_name_readable,
                fingerprint=token.fingerprint,
                owner_wallet_id=token.owner_wallet_id,
                quantity=token.quantity,
                metadata=token.token_metadata,
                minting_tx_hash=token.minting_tx_hash,
                created_at=token.created_at,
                updated_at=token.updated_at
            ) for token in tokens]
        finally:
            db.close()
    
    @strawberry.field
    async def cardano_transactions(
        self,
        info,
        wallet_id: Optional[str] = None,
        transaction_type: Optional[str] = None,
        limit: int = 50
    ) -> List[CardanoTransaction]:
        """
        Get Cardano transaction history for user's wallets.
        Optionally filter by wallet_id or transaction_type.
        """
        current_user = info.context.current_user
        if not current_user:
            raise HTTPException(status_code=401, detail="Authentication required")
        
        db = SessionLocal()
        try:
            # Build query
            query = db.query(CardanoTransactionModel).join(CardanoWalletModel)
            
            # Filter by user
            query = query.filter(CardanoWalletModel.user_id == current_user.id)
            
            # Optional filters
            if wallet_id:
                query = query.filter(CardanoTransactionModel.wallet_id == wallet_id)
            
            if transaction_type:
                query = query.filter(CardanoTransactionModel.transaction_type == transaction_type)
            
            # Order by most recent first
            query = query.order_by(CardanoTransactionModel.created_at.desc())
            
            # Limit results
            query = query.limit(limit)
            
            transactions = query.all()
            
            return [CardanoTransaction(
                id=tx.id,
                tx_hash=tx.tx_hash,
                wallet_id=tx.wallet_id,
                transaction_type=tx.transaction_type,
                amount_ada=tx.amount_ada,
                fee=tx.fee,
                metadata=tx.tx_metadata,
                block_height=tx.block_height,
                block_time=tx.block_time,
                status=tx.status,
                created_at=tx.created_at
            ) for tx in transactions]
        finally:
            db.close()
    
    @strawberry.field
    async def cardano_token_info(
        self,
        policy_id: str,
        asset_name: str = ""
    ) -> Optional[CardanoToken]:
        """
        Get token information from Cardano blockchain via Blockfrost.
        Public query - no authentication required.
        """
        # Query Blockfrost for token info
        asset_info = await cardano_client.get_asset_info(policy_id, asset_name)
        
        if not asset_info:
            return None
        
        # Return token info (not from database, directly from blockchain)
        return CardanoToken(
            id=None,  # Not stored in DB
            policy_id=asset_info['policy_id'],
            asset_name=asset_info['asset_name'],
            asset_name_readable=None,
            fingerprint=asset_info.get('fingerprint'),
            owner_wallet_id=None,
            quantity=asset_info.get('quantity', '0'),
            metadata=asset_info.get('metadata', {}),
            minting_tx_hash=asset_info.get('initial_mint_tx_hash'),
            created_at=None,
            updated_at=None
        )
    
    @strawberry.field
    async def cardano_transaction_details(
        self,
        tx_hash: str
    ) -> Optional[CardanoTransaction]:
        """
        Get transaction details from Cardano blockchain via Blockfrost.
        Public query - no authentication required.
        """
        # Query Blockfrost for transaction details
        tx_info = await cardano_client.get_transaction(tx_hash)
        
        if not tx_info:
            return None
        
        # Return transaction info (not from database, directly from blockchain)
        return CardanoTransaction(
            id=None,  # Not stored in DB
            tx_hash=tx_info['hash'],
            wallet_id=None,
            transaction_type='unknown',
            amount_ada=None,
            fee=tx_info.get('fees'),
            metadata=tx_info.get('metadata', []),
            block_height=tx_info.get('block_height'),
            block_time=datetime.fromtimestamp(tx_info['block_time']) if tx_info.get('block_time') else None,
            status='confirmed',
            created_at=None
        )


@strawberry.type
class CardanoMutation:
    """GraphQL mutations for Cardano blockchain operations"""
    
    @strawberry.mutation
    async def connect_cardano_wallet(
        self,
        info,
        input: ConnectCardanoWalletInput
    ) -> CardanoWalletResponse:
        """
        Connect a Cardano wallet to user account.
        Stores wallet address and retrieves initial balance.
        """
        current_user = info.context.current_user
        if not current_user:
            return CardanoWalletResponse(
                success=False,
                message="Authentication required",
                wallet=None
            )
        
        db = SessionLocal()
        try:
            # Check if wallet already exists
            existing_wallet = db.query(CardanoWalletModel).filter(
                CardanoWalletModel.address == input.address
            ).first()
            
            if existing_wallet:
                if existing_wallet.user_id != current_user.id:
                    return CardanoWalletResponse(
                        success=False,
                        message="This wallet is already connected to another account",
                        wallet=None
                    )
                
                # Wallet already connected to this user
                return CardanoWalletResponse(
                    success=True,
                    message="Wallet already connected",
                    wallet=CardanoWallet(
                        id=existing_wallet.id,
                        user_id=existing_wallet.user_id,
                        address=existing_wallet.address,
                        stake_address=existing_wallet.stake_address,
                        wallet_type=existing_wallet.wallet_type,
                        is_primary=existing_wallet.is_primary,
                        created_at=existing_wallet.created_at,
                        updated_at=existing_wallet.updated_at,
                        last_synced_at=existing_wallet.last_synced_at
                    )
                )
            
            # Get address info from blockchain
            address_info = await cardano_client.get_address_info(input.address)
            
            if not address_info:
                return CardanoWalletResponse(
                    success=False,
                    message="Failed to retrieve wallet information from blockchain",
                    wallet=None
                )
            
            # Check if user has any Cardano wallets
            user_wallets_count = db.query(CardanoWalletModel).filter(
                CardanoWalletModel.user_id == current_user.id
            ).count()
            
            # First wallet is primary by default
            is_primary = user_wallets_count == 0
            
            # Create new wallet record
            new_wallet = CardanoWalletModel(
                user_id=current_user.id,
                address=input.address,
                stake_address=address_info.get('stake_address'),
                wallet_type=input.wallet_type,
                is_primary=is_primary,
                last_synced_at=datetime.utcnow()
            )
            
            db.add(new_wallet)
            db.commit()
            db.refresh(new_wallet)
            
            return CardanoWalletResponse(
                success=True,
                message="Wallet connected successfully",
                wallet=CardanoWallet(
                    id=new_wallet.id,
                    user_id=new_wallet.user_id,
                    address=new_wallet.address,
                    stake_address=new_wallet.stake_address,
                    wallet_type=new_wallet.wallet_type,
                    is_primary=new_wallet.is_primary,
                    created_at=new_wallet.created_at,
                    updated_at=new_wallet.updated_at,
                    last_synced_at=new_wallet.last_synced_at
                )
            )
            
        except Exception as e:
            db.rollback()
            return CardanoWalletResponse(
                success=False,
                message=f"Failed to connect wallet: {str(e)}",
                wallet=None
            )
        finally:
            db.close()
    
    @strawberry.mutation
    async def mint_cardano_token(
        self,
        info,
        input: MintCardanoTokenInput
    ) -> CardanoTokenResponse:
        """
        Record a minted Cardano token in the database.
        Note: Actual minting happens on frontend with MeshJS.
        This mutation stores the minting result.
        """
        current_user = info.context.current_user
        if not current_user:
            return CardanoTokenResponse(
                success=False,
                message="Authentication required",
                token=None
            )
        
        db = SessionLocal()
        try:
            # Verify wallet belongs to user
            wallet = db.query(CardanoWalletModel).filter(
                CardanoWalletModel.id == input.wallet_id,
                CardanoWalletModel.user_id == current_user.id
            ).first()
            
            if not wallet:
                return CardanoTokenResponse(
                    success=False,
                    message="Wallet not found or access denied",
                    token=None
                )
            
            # Check if token already exists
            existing_token = db.query(CardanoTokenModel).filter(
                CardanoTokenModel.policy_id == input.policy_id,
                CardanoTokenModel.asset_name == input.asset_name,
                CardanoTokenModel.owner_wallet_id == input.wallet_id
            ).first()
            
            if existing_token:
                return CardanoTokenResponse(
                    success=False,
                    message="Token already recorded",
                    token=None
                )
            
            # Create token record
            new_token = CardanoTokenModel(
                policy_id=input.policy_id,
                asset_name=input.asset_name,
                asset_name_readable=input.asset_name_readable,
                fingerprint=input.fingerprint,
                owner_wallet_id=input.wallet_id,
                quantity=input.quantity,
                token_metadata=input.metadata,
                minting_tx_hash=input.tx_hash
            )
            
            db.add(new_token)
            
            # Create transaction record
            transaction = CardanoTransactionModel(
                tx_hash=input.tx_hash,
                wallet_id=input.wallet_id,
                transaction_type='mint',
                amount_ada='0',
                fee=input.fee if input.fee else '0',
                tx_metadata=input.metadata,
                status='confirmed',
                block_time=datetime.utcnow()
            )
            
            db.add(transaction)
            db.commit()
            db.refresh(new_token)
            
            return CardanoTokenResponse(
                success=True,
                message="Token minted and recorded successfully",
                token=CardanoToken(
                    id=new_token.id,
                    policy_id=new_token.policy_id,
                    asset_name=new_token.asset_name,
                    asset_name_readable=new_token.asset_name_readable,
                    fingerprint=new_token.fingerprint,
                    owner_wallet_id=new_token.owner_wallet_id,
                    quantity=new_token.quantity,
                    metadata=new_token.token_metadata,
                    minting_tx_hash=new_token.minting_tx_hash,
                    created_at=new_token.created_at,
                    updated_at=new_token.updated_at
                )
            )
            
        except Exception as e:
            db.rollback()
            return CardanoTokenResponse(
                success=False,
                message=f"Failed to record minted token: {str(e)}",
                token=None
            )
        finally:
            db.close()
    
    @strawberry.mutation
    async def transfer_cardano_token(
        self,
        info,
        input: TransferCardanoTokenInput
    ) -> CardanoTransactionResponse:
        """
        Record a Cardano token transfer in the database.
        Note: Actual transfer happens on frontend with MeshJS.
        This mutation stores the transfer result.
        """
        current_user = info.context.current_user
        if not current_user:
            return CardanoTransactionResponse(
                success=False,
                message="Authentication required",
                transaction=None
            )
        
        db = SessionLocal()
        try:
            # Verify sender wallet belongs to user
            from_wallet = db.query(CardanoWalletModel).filter(
                CardanoWalletModel.id == input.from_wallet_id,
                CardanoWalletModel.user_id == current_user.id
            ).first()
            
            if not from_wallet:
                return CardanoTransactionResponse(
                    success=False,
                    message="Sender wallet not found or access denied",
                    transaction=None
                )
            
            # Find or create recipient wallet
            to_wallet = db.query(CardanoWalletModel).filter(
                CardanoWalletModel.address == input.to_address
            ).first()
            
            if not to_wallet:
                # Create wallet record for recipient (external wallet)
                to_wallet = CardanoWalletModel(
                    user_id=None,  # External wallet
                    address=input.to_address,
                    wallet_type='external',
                    is_primary=False
                )
                db.add(to_wallet)
                db.flush()
            
            # Find token
            token = db.query(CardanoTokenModel).filter(
                CardanoTokenModel.id == input.token_id,
                CardanoTokenModel.owner_wallet_id == input.from_wallet_id
            ).first()
            
            if not token:
                return CardanoTransactionResponse(
                    success=False,
                    message="Token not found or not owned by sender",
                    transaction=None
                )
            
            # Create transaction record
            transaction = CardanoTransactionModel(
                tx_hash=input.tx_hash,
                wallet_id=input.from_wallet_id,
                transaction_type='transfer',
                amount_ada='0',
                fee=input.fee if input.fee else '0',
                tx_metadata=input.metadata,
                status='confirmed',
                block_time=datetime.utcnow()
            )
            
            db.add(transaction)
            db.flush()
            
            # Create transfer record
            transfer = CardanoTokenTransferModel(
                transaction_id=transaction.id,
                token_id=input.token_id,
                from_wallet_id=input.from_wallet_id,
                to_wallet_id=to_wallet.id,
                quantity=input.quantity
            )
            
            db.add(transfer)
            
            # Update token quantity for sender
            current_quantity = int(token.quantity)
            transfer_quantity = int(input.quantity)
            new_quantity = current_quantity - transfer_quantity
            
            if new_quantity < 0:
                db.rollback()
                return CardanoTransactionResponse(
                    success=False,
                    message="Insufficient token balance",
                    transaction=None
                )
            
            token.quantity = str(new_quantity)
            
            # If transferring to another user in our system, create/update their token record
            if to_wallet.user_id:
                recipient_token = db.query(CardanoTokenModel).filter(
                    CardanoTokenModel.policy_id == token.policy_id,
                    CardanoTokenModel.asset_name == token.asset_name,
                    CardanoTokenModel.owner_wallet_id == to_wallet.id
                ).first()
                
                if recipient_token:
                    recipient_quantity = int(recipient_token.quantity)
                    recipient_token.quantity = str(recipient_quantity + transfer_quantity)
                else:
                    recipient_token = CardanoTokenModel(
                        policy_id=token.policy_id,
                        asset_name=token.asset_name,
                        asset_name_readable=token.asset_name_readable,
                        fingerprint=token.fingerprint,
                        owner_wallet_id=to_wallet.id,
                        quantity=input.quantity,
                        token_metadata=token.token_metadata
                    )
                    db.add(recipient_token)
            
            db.commit()
            db.refresh(transaction)
            
            return CardanoTransactionResponse(
                success=True,
                message="Token transfer recorded successfully",
                transaction=CardanoTransaction(
                    id=transaction.id,
                    tx_hash=transaction.tx_hash,
                    wallet_id=transaction.wallet_id,
                    transaction_type=transaction.transaction_type,
                    amount_ada=transaction.amount_ada,
                    fee=transaction.fee,
                    metadata=transaction.tx_metadata,
                    block_height=transaction.block_height,
                    block_time=transaction.block_time,
                    status=transaction.status,
                    created_at=transaction.created_at
                )
            )
            
        except Exception as e:
            db.rollback()
            return CardanoTransactionResponse(
                success=False,
                message=f"Failed to record token transfer: {str(e)}",
                transaction=None
            )
        finally:
            db.close()
