import asyncio
from typing import Optional, Dict, Any
# Try to import real Hedera SDK, fall back to mock for Docker
try:
    from hedera import (
        Client, 
        AccountId, 
        PrivateKey,
        TopicCreateTransaction,
        TopicMessageSubmitTransaction,
        TokenCreateTransaction,
        TokenType,
        TokenSupplyType,
        Hbar,
        Status
    )
    HEDERA_AVAILABLE = True
    print("✅ Hedera SDK loaded successfully")
except ImportError:
    print("⚠️  Hedera SDK not available in Docker. Using mock implementation.")
    HEDERA_AVAILABLE = False
    
    # Mock implementations for Docker environment
    class MockClient:
        @classmethod
        def forTestnet(cls): return cls()
        @classmethod
        def forMainnet(cls): return cls()
        def setOperator(self, account_id, private_key): pass
        def close(self): pass
    
    class MockAccountId:
        def __init__(self, account_id): self.account_id = account_id
        @classmethod
        def fromString(cls, account_id): return cls(account_id)
        def __str__(self): return self.account_id
    
    class MockPrivateKey:
        def __init__(self, key): self.key = key
        @classmethod
        def fromString(cls, key): return cls(key)
        def getPublicKey(self): return f"public_key_for_{self.key[:10]}..."
    
    class MockTransaction:
        def setTopicMemo(self, memo): return self
        def setMaxTransactionFee(self, fee): return self
        def setTopicId(self, topic_id): return self
        def setMessage(self, message): return self
        def setTokenName(self, name): return self
        def setTokenSymbol(self, symbol): return self
        def setTokenType(self, token_type): return self
        def setSupplyType(self, supply_type): return self
        def setInitialSupply(self, supply): return self
        def setTreasuryAccountId(self, account_id): return self
        def setAdminKey(self, key): return self
        def setSupplyKey(self, key): return self
        def execute(self, client): return MockResponse()
    
    class MockResponse:
        def __init__(self):
            self.transactionId = MockTransactionId()
        def getReceipt(self, client): return MockReceipt()
    
    class MockReceipt:
        def __init__(self):
            self.status = MockStatus.SUCCESS
            self.topicId = MockTopicId("0.0.123456")
            self.tokenId = MockTokenId("0.0.789012")
    
    class MockTopicId:
        def __init__(self, topic_id): self.topic_id = topic_id
        def toString(self): return self.topic_id
        @classmethod
        def fromString(cls, topic_id): return cls(topic_id)
    
    class MockTokenId:
        def __init__(self, token_id): self.token_id = token_id
        def toString(self): return self.token_id
    
    class MockTransactionId:
        def toString(self): return "0.0.123456@1234567890.123456789"
    
    class MockStatus:
        SUCCESS = "SUCCESS"
    
    class MockHbar:
        def __init__(self, amount): self.amount = amount
    
    class MockTokenType:
        FUNGIBLE_COMMON = "FUNGIBLE_COMMON"
    
    class MockTokenSupplyType:
        INFINITE = "INFINITE"
    
    # Assign mock classes
    Client = MockClient
    AccountId = MockAccountId
    PrivateKey = MockPrivateKey
    TopicCreateTransaction = MockTransaction
    TopicMessageSubmitTransaction = MockTransaction
    TokenCreateTransaction = MockTransaction
    TokenType = MockTokenType
    TokenSupplyType = MockTokenSupplyType
    Hbar = MockHbar
    Status = MockStatus
import json
from app.core.config import settings


class HederaClient:
    def __init__(self):
        self.client: Optional[Client] = None
        self.operator_id: Optional[AccountId] = None
        self.operator_key: Optional[PrivateKey] = None
        self.topic_id: Optional[str] = None
        
    async def initialize(self):
        """Initialize Hedera client with testnet configuration"""
        try:
            if not settings.OPERATOR_ID or not settings.OPERATOR_KEY:
                print("Warning: Hedera credentials not configured. Some features will be disabled.")
                return
                
            # Create client for testnet
            if settings.HEDERA_NETWORK == "testnet":
                self.client = Client.forTestnet()
            else:
                self.client = Client.forMainnet()
            
            # Set operator
            self.operator_id = AccountId.fromString(settings.OPERATOR_ID)
            self.operator_key = PrivateKey.fromString(settings.OPERATOR_KEY)
            
            self.client.setOperator(self.operator_id, self.operator_key)
            
            # Set topic ID if configured
            if settings.HCS_TOPIC_ID:
                self.topic_id = settings.HCS_TOPIC_ID
            
            print(f"✅ Hedera client initialized for {settings.HEDERA_NETWORK}")
            print(f"🔑 Using Account: {settings.OPERATOR_ID}")
            
        except Exception as e:
            print(f"❌ Failed to initialize Hedera client: {e}")
            raise
            
    async def close(self):
        """Close Hedera client connection"""
        if self.client:
            self.client.close()
            
    async def create_topic(self, memo: str = "HarvestLedger Supply Chain Topic") -> Optional[str]:
        """Create a new HCS topic for logging events"""
        if not self.client:
            print("❌ Hedera client not initialized")
            return None
            
        try:
            print(f"📝 Creating HCS topic with memo: {memo}")
            
            transaction = (
                TopicCreateTransaction()
                .setTopicMemo(memo)
                .setMaxTransactionFee(Hbar(2))
            )
            
            print("🔄 Executing transaction...")
            response = transaction.execute(self.client)
            
            print("⏳ Waiting for receipt...")
            receipt = response.getReceipt(self.client)
            
            if receipt.status == Status.SUCCESS:
                topic_id = receipt.topicId.toString()
                print(f"✅ Created HCS topic: {topic_id}")
                return topic_id
            else:
                print(f"❌ Topic creation failed with status: {receipt.status}")
                return None
            
        except Exception as e:
            print(f"❌ Failed to create topic: {e}")
            return None
            
    async def submit_message(self, message: Dict[str, Any], topic_id: Optional[str] = None) -> Optional[str]:
        """Submit a message to HCS topic"""
        if not self.client:
            print("❌ Hedera client not initialized")
            return None
            
        target_topic = topic_id or self.topic_id
        if not target_topic:
            print("❌ No topic ID configured")
            return None
            
        try:
            message_json = json.dumps(message)
            print(f"📤 Submitting message to topic {target_topic}")
            print(f"📄 Message: {message_json[:100]}...")
            
            # Convert topic ID string to TopicId object if needed
            from hedera import TopicId
            if isinstance(target_topic, str):
                topic_id_obj = TopicId.fromString(target_topic)
            else:
                topic_id_obj = target_topic
            
            transaction = (
                TopicMessageSubmitTransaction()
                .setTopicId(topic_id_obj)
                .setMessage(message_json.encode('utf-8'))
                .setMaxTransactionFee(Hbar(1))
            )
            
            print("🔄 Executing transaction...")
            response = transaction.execute(self.client)
            
            print("⏳ Waiting for receipt...")
            receipt = response.getReceipt(self.client)
            
            if receipt.status == Status.SUCCESS:
                tx_id = response.transactionId.toString()
                print(f"✅ Message submitted! Transaction ID: {tx_id}")
                return tx_id
            else:
                print(f"❌ Message submission failed with status: {receipt.status}")
                return None
            
        except Exception as e:
            print(f"❌ Failed to submit message: {e}")
            return None
            
    async def create_token(self, name: str, symbol: str, initial_supply: int = 1000000) -> Optional[str]:
        """Create an HTS token for crop tokenization"""
        if not self.client:
            print("❌ Hedera client not initialized")
            return None
            
        try:
            print(f"🪙 Creating HTS token: {name} ({symbol})")
            print(f"📊 Initial supply: {initial_supply}")
            
            transaction = (
                TokenCreateTransaction()
                .setTokenName(name)
                .setTokenSymbol(symbol)
                .setTokenType(TokenType.FUNGIBLE_COMMON)
                .setSupplyType(TokenSupplyType.INFINITE)
                .setInitialSupply(initial_supply)
                .setTreasuryAccountId(self.operator_id)
                .setAdminKey(self.operator_key.getPublicKey())
                .setSupplyKey(self.operator_key.getPublicKey())
                .setMaxTransactionFee(Hbar(30))
            )
            
            print("🔄 Executing transaction...")
            response = transaction.execute(self.client)
            
            print("⏳ Waiting for receipt...")
            receipt = response.getReceipt(self.client)
            
            if receipt.status == Status.SUCCESS:
                token_id = receipt.tokenId.toString()
                print(f"✅ Created HTS token: {token_id}")
                return token_id
            else:
                print(f"❌ Token creation failed with status: {receipt.status}")
                return None
            
        except Exception as e:
            print(f"❌ Failed to create token: {e}")
            return None
            
    async def get_mirror_data(self, endpoint: str) -> Optional[Dict[str, Any]]:
        """Fetch data from Hedera mirror node"""
        try:
            import httpx
            url = f"{settings.MIRROR_NODE_URL}/{endpoint}"
            async with httpx.AsyncClient() as client:
                response = await client.get(url)
                response.raise_for_status()
                return response.json()
        except Exception as e:
            print(f"Failed to fetch mirror data: {e}")
            return None
            
    async def get_topic_messages(self, topic_id: str, limit: int = 10) -> Optional[Dict[str, Any]]:
        """Get messages from an HCS topic via mirror node"""
        return await self.get_mirror_data(f"topics/{topic_id}/messages?limit={limit}")
        
    async def get_token_info(self, token_id: str) -> Optional[Dict[str, Any]]:
        """Get token information via mirror node"""
        return await self.get_mirror_data(f"tokens/{token_id}")


# Global Hedera client instance
hedera_client = HederaClient()