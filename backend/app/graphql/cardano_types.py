"""
GraphQL types for Cardano blockchain operations.
Defines input and output types for Cardano-related queries and mutations.
"""

import strawberry
from typing import Optional, List
from datetime import datetime
import uuid

# Use JSON scalar for flexible metadata fields
JSON = strawberry.scalar(
    object,
    serialize=lambda v: v,
    parse_value=lambda v: v,
    description="JSON scalar type for flexible metadata"
)


@strawberry.type
class CardanoWallet:
    """Cardano wallet information"""
    id: Optional[uuid.UUID]
    user_id: Optional[uuid.UUID]
    address: str
    stake_address: Optional[str]
    wallet_type: str
    is_primary: bool
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    last_synced_at: Optional[datetime]


@strawberry.type
class CardanoToken:
    """Cardano native token information"""
    id: Optional[uuid.UUID]
    policy_id: str
    asset_name: str
    asset_name_readable: Optional[str]
    fingerprint: Optional[str]
    owner_wallet_id: Optional[uuid.UUID]
    quantity: str
    metadata: Optional[JSON]
    minting_tx_hash: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]


@strawberry.type
class CardanoTransaction:
    """Cardano transaction information"""
    id: Optional[uuid.UUID]
    tx_hash: str
    wallet_id: Optional[uuid.UUID]
    transaction_type: str
    amount_ada: Optional[str]
    fee: Optional[str]
    metadata: Optional[JSON]
    block_height: Optional[int]
    block_time: Optional[datetime]
    status: str
    created_at: Optional[datetime]


@strawberry.type
class CardanoTokenTransfer:
    """Cardano token transfer record"""
    id: uuid.UUID
    transaction_id: uuid.UUID
    token_id: uuid.UUID
    from_wallet_id: uuid.UUID
    to_wallet_id: uuid.UUID
    quantity: str
    created_at: datetime


@strawberry.type
class CardanoSupplyChainEvent:
    """Cardano supply chain event record"""
    id: uuid.UUID
    transaction_id: uuid.UUID
    event_type: str
    product_id: Optional[str]
    actor_id: Optional[uuid.UUID]
    location: Optional[str]
    timestamp: datetime
    details: Optional[JSON]
    created_at: datetime


# Input types for mutations

@strawberry.input
class ConnectCardanoWalletInput:
    """Input for connecting a Cardano wallet"""
    address: str
    wallet_type: str  # 'nami', 'eternl', 'flint', 'lace', 'typhon'
    stake_address: Optional[str] = None


@strawberry.input
class MintCardanoTokenInput:
    """Input for recording a minted Cardano token"""
    wallet_id: uuid.UUID
    policy_id: str
    asset_name: str
    asset_name_readable: Optional[str]
    fingerprint: Optional[str]
    quantity: str
    metadata: Optional[JSON]
    tx_hash: str
    fee: Optional[str] = None


@strawberry.input
class TransferCardanoTokenInput:
    """Input for recording a Cardano token transfer"""
    from_wallet_id: uuid.UUID
    to_address: str
    token_id: uuid.UUID
    quantity: str
    tx_hash: str
    fee: Optional[str] = None
    metadata: Optional[JSON] = None


# Response types

@strawberry.type
class CardanoWalletResponse:
    """Response for wallet connection mutation"""
    success: bool
    message: str
    wallet: Optional[CardanoWallet]


@strawberry.type
class CardanoTokenResponse:
    """Response for token minting mutation"""
    success: bool
    message: str
    token: Optional[CardanoToken]


@strawberry.type
class CardanoTransactionResponse:
    """Response for transaction mutations"""
    success: bool
    message: str
    transaction: Optional[CardanoTransaction]
