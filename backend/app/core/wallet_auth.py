import secrets
import re
from datetime import datetime, timedelta
from typing import Optional, Tuple
from eth_account import Account
from eth_account.messages import encode_defunct
from hedera import PublicKey, PrivateKey
import hashlib
from app.core.config import settings
from app.core.redis_client import redis_client


class WalletAuthenticator:
    """Handles wallet signature verification for different wallet types"""
    
    @staticmethod
    def generate_nonce() -> str:
        """Generate a cryptographically secure nonce"""
        return secrets.token_hex(16)
    
    @staticmethod
    def create_siwe_message(address: str, nonce: str) -> str:
        """Create a Sign-In with Ethereum style message"""
        domain = settings.FRONTEND_URL.replace("http://", "").replace("https://", "")
        issued_at = datetime.utcnow().isoformat() + "Z"
        
        message = f"""{domain} wants you to sign in with your Hedera account:

Address: {address}
URI: {settings.FRONTEND_URL}
Nonce: {nonce}
Issued At: {issued_at}"""
        
        return message
    
    @staticmethod
    async def store_nonce(nonce: str, address: str) -> None:
        """Store nonce in Redis with 5-minute expiration"""
        await redis_client.set_nonce(nonce, address, 300)
    
    @staticmethod
    async def verify_nonce(nonce: str, address: str) -> bool:
        """Verify and consume nonce (one-time use)"""
        stored_address = await redis_client.get_nonce(nonce)
        return stored_address == address
    
    @staticmethod
    def verify_evm_signature(message: str, signature: str, address: str) -> bool:
        """Verify EVM wallet signature (MetaMask, Blade EVM mode)"""
        try:
            # Create message hash
            message_hash = encode_defunct(text=message)
            
            # Recover address from signature
            recovered_address = Account.recover_message(message_hash, signature=signature)
            
            # Compare addresses (case-insensitive)
            return recovered_address.lower() == address.lower()
        except Exception as e:
            print(f"EVM signature verification failed: {e}")
            return False
    
    @staticmethod
    def verify_hedera_signature(message: str, signature: str, public_key_str: str) -> bool:
        """Verify native Hedera wallet signature (HashPack, Kabila, Portal) - REAL VERIFICATION"""
        try:
            # Parse public key using official Hedera SDK
            public_key = PublicKey.fromString(public_key_str)
            
            # Convert message to bytes
            message_bytes = message.encode('utf-8')
            
            # Convert signature from hex to bytes
            signature_bytes = bytes.fromhex(signature)
            
            # Verify signature using real Hedera cryptography
            is_valid = public_key.verify(message_bytes, signature_bytes)
            
            if is_valid:
                print(f"✅ Hedera signature verified for public key: {public_key_str[:20]}...")
            else:
                print(f"❌ Hedera signature verification failed for public key: {public_key_str[:20]}...")
            
            return is_valid
        except Exception as e:
            print(f"❌ Hedera signature verification error: {e}")
            return False
    
    @staticmethod
    def validate_message_format(message: str, expected_address: str, nonce: str) -> bool:
        """Validate SIWE message format and content"""
        try:
            lines = message.strip().split('\n')
            
            # Check basic structure
            if len(lines) < 6:
                return False
            
            # Validate domain
            domain = settings.FRONTEND_URL.replace("http://", "").replace("https://", "")
            if not lines[0].startswith(f"{domain} wants you to sign in"):
                return False
            
            # Extract and validate address
            address_line = next((line for line in lines if line.startswith("Address:")), None)
            if not address_line or expected_address not in address_line:
                return False
            
            # Extract and validate nonce
            nonce_line = next((line for line in lines if line.startswith("Nonce:")), None)
            if not nonce_line or nonce not in nonce_line:
                return False
            
            # Extract and validate timestamp (within 5 minutes)
            issued_line = next((line for line in lines if line.startswith("Issued At:")), None)
            if not issued_line:
                return False
            
            timestamp_str = issued_line.replace("Issued At: ", "").replace("Z", "")
            try:
                issued_time = datetime.fromisoformat(timestamp_str)
                time_diff = abs((datetime.utcnow() - issued_time).total_seconds())
                if time_diff > 300:  # 5 minutes
                    return False
            except ValueError:
                return False
            
            return True
        except Exception as e:
            print(f"Message validation failed: {e}")
            return False
    
    @staticmethod
    def extract_hedera_account_id(address: str) -> Optional[str]:
        """Extract Hedera account ID from various address formats"""
        # Handle Hedera account ID format (0.0.xxxxx)
        if re.match(r'^0\.0\.\d+$', address):
            return address
        
        # Handle EVM address format (0x...)
        if address.startswith('0x') and len(address) == 42:
            # For EVM addresses, we'll need to map them to Hedera account IDs
            # This would typically be done through account lookup or user registration
            return address
        
        return None
    
    @staticmethod
    async def authenticate_wallet(
        address: str, 
        signature: str, 
        message: str, 
        wallet_type: str,
        public_key: Optional[str] = None
    ) -> Tuple[bool, Optional[str]]:
        """
        Authenticate wallet signature
        Returns (is_valid, hedera_account_id)
        """
        try:
            # Extract nonce from message
            nonce_match = re.search(r'Nonce: ([a-f0-9]+)', message)
            if not nonce_match:
                return False, None
            
            nonce = nonce_match.group(1)
            
            # Validate message format
            if not WalletAuthenticator.validate_message_format(message, address, nonce):
                return False, None
            
            # Verify nonce
            if not await WalletAuthenticator.verify_nonce(nonce, address):
                return False, None
            
            # Verify signature based on wallet type
            signature_valid = False
            
            if wallet_type.upper() in ['METAMASK', 'BLADE_EVM']:
                signature_valid = WalletAuthenticator.verify_evm_signature(message, signature, address)
            elif wallet_type.upper() in ['HASHPACK', 'KABILA', 'PORTAL', 'BLADE_NATIVE']:
                if not public_key:
                    return False, None
                signature_valid = WalletAuthenticator.verify_hedera_signature(message, signature, public_key)
            else:
                return False, None
            
            if not signature_valid:
                return False, None
            
            # Extract Hedera account ID
            hedera_account_id = WalletAuthenticator.extract_hedera_account_id(address)
            
            return True, hedera_account_id
            
        except Exception as e:
            print(f"Wallet authentication failed: {e}")
            return False, None