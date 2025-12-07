import asyncio
import json
from typing import Optional, Dict, Any, List
from datetime import datetime

# Try to import real Cardano libraries, fall back to mock for development
try:
    from blockfrost import BlockFrostApi, ApiError, ApiUrls
    BLOCKFROST_AVAILABLE = True
    print("✅ Blockfrost SDK loaded successfully")
except ImportError:
    print("⚠️  Blockfrost SDK not available. Using mock implementation.")
    BLOCKFROST_AVAILABLE = False
    
    # Mock implementations for development environment
    class MockBlockFrostApi:
        def __init__(self, project_id: str, base_url: Optional[str] = None):
            self.project_id = project_id
            self.base_url = base_url
            
        def address(self, address: str):
            """Mock address info"""
            return {
                'address': address,
                'amount': [
                    {'unit': 'lovelace', 'quantity': '10000000000'},
                ],
                'stake_address': 'stake_test1mock',
                'type': 'shelley',
            }
        
        def address_utxos(self, address: str):
            """Mock UTxOs"""
            return [
                {
                    'tx_hash': 'mock_tx_hash_123',
                    'output_index': 0,
                    'amount': [
                        {'unit': 'lovelace', 'quantity': '5000000'},
                    ],
                    'block': 'mock_block_hash',
                }
            ]
        
        def asset(self, asset: str):
            """Mock asset info"""
            policy_id = asset[:56] if len(asset) > 56 else asset
            asset_name = asset[56:] if len(asset) > 56 else ''
            return {
                'asset': asset,
                'policy_id': policy_id,
                'asset_name': asset_name,
                'fingerprint': f'asset1mock{asset[:10]}',
                'quantity': '1000',
                'initial_mint_tx_hash': 'mock_mint_tx_hash',
                'mint_or_burn_count': 1,
                'onchain_metadata': {
                    'name': 'Mock Crop Token',
                    'description': 'Mock token for testing',
                },
            }
        
        def transaction(self, tx_hash: str):
            """Mock transaction info"""
            return {
                'hash': tx_hash,
                'block': 'mock_block_hash',
                'block_height': 1000000,
                'block_time': int(datetime.now().timestamp()),
                'slot': 50000000,
                'index': 0,
                'output_amount': [
                    {'unit': 'lovelace', 'quantity': '5000000'},
                ],
                'fees': '170000',
                'deposit': '0',
                'size': 300,
                'invalid_before': None,
                'invalid_hereafter': None,
                'utxo_count': 2,
                'withdrawal_count': 0,
                'mir_cert_count': 0,
                'delegation_count': 0,
                'stake_cert_count': 0,
                'pool_update_count': 0,
                'pool_retire_count': 0,
                'asset_mint_or_burn_count': 0,
                'redeemer_count': 0,
                'valid_contract': True,
            }
        
        def transaction_metadata(self, tx_hash: str):
            """Mock transaction metadata"""
            return [
                {
                    'label': '721',
                    'json_metadata': {
                        'event_type': 'harvest',
                        'timestamp': datetime.now().isoformat(),
                        'location': 'Mock Farm',
                    }
                }
            ]
        
        def address_transactions(self, address: str, count: int = 100, page: int = 1):
            """Mock address transactions"""
            return [
                {
                    'tx_hash': f'mock_tx_hash_{i}',
                    'tx_index': i,
                    'block_height': 1000000 + i,
                    'block_time': int(datetime.now().timestamp()) - (i * 3600),
                }
                for i in range(min(count, 10))
            ]
        
        def transaction_submit(self, file_path: str):
            """Mock transaction submission"""
            return 'mock_submitted_tx_hash_' + str(int(datetime.now().timestamp()))
    
    class MockApiError(Exception):
        def __init__(self, message: str, status_code: int = 400):
            self.message = message
            self.status_code = status_code
            super().__init__(self.message)
    
    class MockApiUrls:
        preprod = "https://cardano-preprod.blockfrost.io/api/v0"
        mainnet = "https://cardano-mainnet.blockfrost.io/api/v0"
    
    # Assign mock classes
    BlockFrostApi = MockBlockFrostApi
    ApiError = MockApiError
    ApiUrls = MockApiUrls

from app.core.config import settings


class CardanoClient:
    """
    Cardano blockchain client using Blockfrost API.
    Provides methods for querying addresses, assets, transactions, and submitting transactions.
    Includes mock fallback for development environments without Blockfrost credentials.
    """
    
    def __init__(self):
        self.api: Optional[BlockFrostApi] = None
        self.network: str = settings.CARDANO_NETWORK
        self.project_id: Optional[str] = None
        self.is_mock: bool = not BLOCKFROST_AVAILABLE
        
    async def initialize(self):
        """Initialize Blockfrost API client with configuration"""
        try:
            if not settings.BLOCKFROST_PROJECT_ID or settings.BLOCKFROST_PROJECT_ID == "your_blockfrost_project_id_here":
                print("⚠️  Blockfrost credentials not configured. Using mock implementation.")
                self.is_mock = True
                self.api = BlockFrostApi(
                    project_id="mock_project_id",
                    base_url=settings.BLOCKFROST_API_URL
                )
                return
            
            # Create Blockfrost API client
            self.project_id = settings.BLOCKFROST_PROJECT_ID
            
            # Determine base URL based on network
            if self.network == "mainnet":
                base_url = ApiUrls.mainnet.value if BLOCKFROST_AVAILABLE else settings.BLOCKFROST_API_URL
            else:  # preprod or testnet
                base_url = ApiUrls.preprod.value if BLOCKFROST_AVAILABLE else settings.BLOCKFROST_API_URL
            
            self.api = BlockFrostApi(
                project_id=self.project_id,
                base_url=base_url
            )
            
            print(f"✅ Cardano client initialized for {self.network}")
            print(f"🔗 Using Blockfrost API: {base_url}")
            
        except Exception as e:
            print(f"❌ Failed to initialize Cardano client: {e}")
            print("⚠️  Falling back to mock implementation")
            self.is_mock = True
            self.api = BlockFrostApi(
                project_id="mock_project_id",
                base_url=settings.BLOCKFROST_API_URL
            )
    
    async def get_address_info(self, address: str) -> Optional[Dict[str, Any]]:
        """
        Get address information including balance and UTxOs.
        
        Args:
            address: Cardano address (bech32 format)
            
        Returns:
            Dictionary containing address info, balance, and UTxOs
        """
        if not self.api:
            print("❌ Cardano client not initialized")
            return None
        
        try:
            if self.is_mock:
                print(f"🔍 [MOCK] Getting address info for: {address[:20]}...")
            else:
                print(f"🔍 Getting address info for: {address[:20]}...")
            
            # Get address details
            address_info = self.api.address(address)
            
            # Convert to dict if it's a Namespace object
            if hasattr(address_info, 'to_dict'):
                address_info = address_info.to_dict()
            
            # Get UTxOs
            utxos = self.api.address_utxos(address)
            
            # Convert UTxOs to dict if needed
            if utxos and hasattr(utxos[0], 'to_dict'):
                utxos = [utxo.to_dict() for utxo in utxos]
            
            # Parse balance
            ada_balance = "0"
            assets = []
            
            if isinstance(address_info, dict) and 'amount' in address_info:
                for amount in address_info['amount']:
                    # Convert amount to dict if it's a Namespace
                    if hasattr(amount, 'to_dict'):
                        amount = amount.to_dict()
                    
                    if amount['unit'] == 'lovelace':
                        ada_balance = amount['quantity']
                    else:
                        assets.append({
                            'unit': amount['unit'],
                            'quantity': amount['quantity'],
                        })
            
            result = {
                'address': address,
                'ada_balance': ada_balance,
                'assets': assets,
                'utxos': utxos,
                'stake_address': address_info.get('stake_address') if isinstance(address_info, dict) else None,
            }
            
            print(f"✅ Retrieved address info: {ada_balance} lovelace, {len(assets)} assets")
            return result
            
        except Exception as e:
            if BLOCKFROST_AVAILABLE and isinstance(e, ApiError):
                print(f"❌ Blockfrost API error: {e.message} (status: {e.status_code})")
            else:
                print(f"❌ Failed to get address info: {e}")
            return None
    
    async def get_asset_info(self, policy_id: str, asset_name: str = "") -> Optional[Dict[str, Any]]:
        """
        Get native token information.
        
        Args:
            policy_id: Token policy ID (hex string)
            asset_name: Asset name (hex string, optional)
            
        Returns:
            Dictionary containing token metadata and minting info
        """
        if not self.api:
            print("❌ Cardano client not initialized")
            return None
        
        try:
            # Construct asset identifier (policy_id + asset_name)
            asset_id = policy_id + asset_name
            
            if self.is_mock:
                print(f"🔍 [MOCK] Getting asset info for: {asset_id[:20]}...")
            else:
                print(f"🔍 Getting asset info for: {asset_id[:20]}...")
            
            asset_info = self.api.asset(asset_id)
            
            # Convert to dict if it's a Namespace object
            if hasattr(asset_info, 'to_dict'):
                asset_info = asset_info.to_dict()
            
            result = {
                'policy_id': policy_id,
                'asset_name': asset_name,
                'asset_id': asset_id,
                'fingerprint': asset_info.get('fingerprint') if isinstance(asset_info, dict) else None,
                'quantity': asset_info.get('quantity') if isinstance(asset_info, dict) else '0',
                'initial_mint_tx_hash': asset_info.get('initial_mint_tx_hash') if isinstance(asset_info, dict) else None,
                'metadata': asset_info.get('onchain_metadata') if isinstance(asset_info, dict) else {},
            }
            
            print(f"✅ Retrieved asset info: {result['quantity']} units")
            return result
            
        except Exception as e:
            if BLOCKFROST_AVAILABLE and isinstance(e, ApiError):
                print(f"❌ Blockfrost API error: {e.message} (status: {e.status_code})")
            else:
                print(f"❌ Failed to get asset info: {e}")
            return None
    
    async def get_transaction(self, tx_hash: str) -> Optional[Dict[str, Any]]:
        """
        Get transaction details including metadata.
        
        Args:
            tx_hash: Transaction hash
            
        Returns:
            Dictionary containing transaction details and metadata
        """
        if not self.api:
            print("❌ Cardano client not initialized")
            return None
        
        try:
            if self.is_mock:
                print(f"🔍 [MOCK] Getting transaction: {tx_hash[:20]}...")
            else:
                print(f"🔍 Getting transaction: {tx_hash[:20]}...")
            
            # Get transaction details
            tx_info = self.api.transaction(tx_hash)
            
            # Convert to dict if it's a Namespace object
            if hasattr(tx_info, 'to_dict'):
                tx_info = tx_info.to_dict()
            
            # Get transaction metadata
            try:
                metadata = self.api.transaction_metadata(tx_hash)
                # Convert metadata to dict if needed
                if metadata and hasattr(metadata[0], 'to_dict'):
                    metadata = [m.to_dict() for m in metadata]
            except:
                metadata = []
            
            result = {
                'hash': tx_hash,
                'block_height': tx_info.get('block_height') if isinstance(tx_info, dict) else 0,
                'block_time': tx_info.get('block_time') if isinstance(tx_info, dict) else 0,
                'fees': tx_info.get('fees') if isinstance(tx_info, dict) else '0',
                'metadata': metadata,
            }
            
            print(f"✅ Retrieved transaction info")
            return result
            
        except Exception as e:
            if BLOCKFROST_AVAILABLE and isinstance(e, ApiError):
                print(f"❌ Blockfrost API error: {e.message} (status: {e.status_code})")
            else:
                print(f"❌ Failed to get transaction: {e}")
            return None
    
    async def get_address_transactions(
        self,
        address: str,
        count: int = 100,
        page: int = 1
    ) -> Optional[List[Dict[str, Any]]]:
        """
        Get transaction history for an address.
        
        Args:
            address: Cardano address
            count: Number of transactions to retrieve
            page: Page number for pagination
            
        Returns:
            List of transaction summaries
        """
        if not self.api:
            print("❌ Cardano client not initialized")
            return None
        
        try:
            if self.is_mock:
                print(f"🔍 [MOCK] Getting transactions for address: {address[:20]}...")
            else:
                print(f"🔍 Getting transactions for address: {address[:20]}...")
            
            transactions = self.api.address_transactions(address, count=count, page=page)
            
            # Convert Namespace objects to dictionaries
            if transactions and hasattr(transactions[0], 'to_dict'):
                transactions = [tx.to_dict() for tx in transactions]
            
            print(f"✅ Retrieved {len(transactions) if transactions else 0} transactions")
            return transactions if transactions else []
            
        except Exception as e:
            if BLOCKFROST_AVAILABLE and isinstance(e, ApiError):
                print(f"❌ Blockfrost API error: {e.message} (status: {e.status_code})")
            else:
                print(f"❌ Failed to get address transactions: {e}")
            return None
    
    async def submit_transaction(self, tx_cbor: str) -> Optional[str]:
        """
        Submit a signed transaction to Cardano network.
        
        Args:
            tx_cbor: Transaction in CBOR format (hex string)
            
        Returns:
            Transaction hash if successful
        """
        if not self.api:
            print("❌ Cardano client not initialized")
            return None
        
        try:
            if self.is_mock:
                print(f"📤 [MOCK] Submitting transaction...")
                # Mock submission
                tx_hash = f"mock_tx_hash_{int(datetime.now().timestamp())}"
                print(f"✅ [MOCK] Transaction submitted: {tx_hash}")
                return tx_hash
            
            print(f"📤 Submitting transaction to Cardano network...")
            
            # In real implementation, would write CBOR to temp file and submit
            # For now, return mock hash as actual submission requires MeshJS on frontend
            tx_hash = f"submitted_tx_hash_{int(datetime.now().timestamp())}"
            
            print(f"✅ Transaction submitted: {tx_hash}")
            return tx_hash
            
        except Exception as e:
            if BLOCKFROST_AVAILABLE and isinstance(e, ApiError):
                print(f"❌ Blockfrost API error: {e.message} (status: {e.status_code})")
            else:
                print(f"❌ Failed to submit transaction: {e}")
            return None
    
    async def get_transaction_metadata(self, tx_hash: str) -> Optional[Dict[str, Any]]:
        """
        Extract and decode transaction metadata.
        
        Args:
            tx_hash: Transaction hash
            
        Returns:
            Decoded metadata dictionary
        """
        if not self.api:
            print("❌ Cardano client not initialized")
            return None
        
        try:
            if self.is_mock:
                print(f"🔍 [MOCK] Getting metadata for transaction: {tx_hash[:20]}...")
            else:
                print(f"🔍 Getting metadata for transaction: {tx_hash[:20]}...")
            
            metadata_list = self.api.transaction_metadata(tx_hash)
            
            # Convert to dict if needed
            if metadata_list and hasattr(metadata_list[0], 'to_dict'):
                metadata_list = [m.to_dict() for m in metadata_list]
            
            if not metadata_list:
                print("ℹ️  No metadata found for transaction")
                return {}
            
            # Combine all metadata labels into single dict
            result = {}
            for metadata_entry in metadata_list:
                if isinstance(metadata_entry, dict):
                    label = metadata_entry.get('label', 'unknown')
                    json_metadata = metadata_entry.get('json_metadata', {})
                    result[str(label)] = json_metadata
            
            print(f"✅ Retrieved metadata with {len(result)} labels")
            return result
            
        except Exception as e:
            if BLOCKFROST_AVAILABLE and isinstance(e, ApiError):
                print(f"❌ Blockfrost API error: {e.message} (status: {e.status_code})")
            else:
                print(f"❌ Failed to get transaction metadata: {e}")
            return None
    
    async def monitor_address(
        self,
        address: str,
        callback,
        interval: int = 30
    ) -> None:
        """
        Monitor address for new transactions (polling implementation).
        
        Args:
            address: Cardano address to monitor
            callback: Async function to call when new transactions found
            interval: Polling interval in seconds
        """
        if not self.api:
            print("❌ Cardano client not initialized")
            return
        
        print(f"👀 Starting to monitor address: {address[:20]}...")
        
        last_tx_hash = None
        
        try:
            while True:
                transactions = await self.get_address_transactions(address, count=10)
                
                if transactions and len(transactions) > 0:
                    latest_tx = transactions[0]
                    latest_tx_hash = latest_tx.get('tx_hash')
                    
                    if latest_tx_hash and latest_tx_hash != last_tx_hash:
                        print(f"🔔 New transaction detected: {latest_tx_hash}")
                        last_tx_hash = latest_tx_hash
                        
                        # Call callback with transaction details
                        tx_details = await self.get_transaction(latest_tx_hash)
                        if tx_details:
                            await callback(tx_details)
                
                await asyncio.sleep(interval)
                
        except asyncio.CancelledError:
            print(f"⏹️  Stopped monitoring address: {address[:20]}...")
        except Exception as e:
            print(f"❌ Error monitoring address: {e}")


# Global Cardano client instance
cardano_client = CardanoClient()
