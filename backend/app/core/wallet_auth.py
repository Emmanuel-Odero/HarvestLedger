import secrets
import re
import json
from datetime import datetime, timedelta
from typing import Optional, Tuple
from eth_account import Account
from eth_account.messages import encode_defunct
from hedera import PublicKey, PrivateKey
import hashlib
from app.core.config import settings
from app.core.redis_client import redis_client

# Cardano imports
try:
    import cbor2
    from nacl.signing import VerifyKey
    from nacl.exceptions import BadSignatureError
    CARDANO_AVAILABLE = True
except ImportError:
    CARDANO_AVAILABLE = False
    print("⚠️  cbor2 or PyNaCl not available. Cardano wallet authentication will not work.")


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
        print(f"🔍 Nonce verification: nonce={nonce[:10]}..., address={address[:20]}..., stored={stored_address[:20] if stored_address else 'None'}...")
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
    def verify_cardano_signature(message: str, signature_data: str, address: str) -> bool:
        """Verify Cardano wallet signature (CIP-30 format) - REAL VERIFICATION"""
        if not CARDANO_AVAILABLE:
            print("❌ cbor2 or PyNaCl not available for signature verification")
            return False
        
        try:
            # Parse signature data (CIP-30 format from CIP-8/CIP-30)
            sig_obj = json.loads(signature_data) if isinstance(signature_data, str) and signature_data.startswith('{') else None
            
            if not sig_obj:
                print("❌ Invalid Cardano signature format - expected JSON object")
                return False
            
            # Extract signature and key from CIP-30 format
            signature_hex = sig_obj.get('signature')
            key_hex = sig_obj.get('key')
            
            if not signature_hex or not key_hex:
                print(f"❌ Missing signature or key in Cardano signature data. Got: {sig_obj.keys()}")
                return False
            
            # The message was hex-encoded on the frontend before signing
            # We need to hex-encode it here too for verification
            # Convert message to hex bytes (matching what was signed)
            message_hex = message.encode('utf-8').hex()
            expected_message_bytes = bytes.fromhex(message_hex)
            
            # Convert signature and key from hex to bytes
            signature_bytes = bytes.fromhex(signature_hex)
            key_bytes = bytes.fromhex(key_hex)
            
            print(f"🔍 Signature length: {len(signature_bytes)} bytes")
            print(f"🔍 Key length: {len(key_bytes)} bytes")
            print(f"🔍 Expected message length: {len(expected_message_bytes)} bytes")
            
            # Decode CBOR-encoded signature (CIP-30 format)
            # The signature is CBOR-encoded and contains the actual Ed25519 signature
            # CIP-30 uses COSE_Sign1 format: [protected, unprotected, payload, signature]
            actual_signature = None
            message_bytes = None  # Will be set from COSE payload if available
            
            try:
                decoded_signature = cbor2.loads(signature_bytes)
                print(f"📦 Decoded signature type: {type(decoded_signature)}")
                if isinstance(decoded_signature, list):
                    print(f"📦 COSE_Sign1 array length: {len(decoded_signature)}")
                    for i, item in enumerate(decoded_signature):
                        item_len = len(item) if isinstance(item, bytes) else 'N/A'
                        item_preview = item[:20].hex() if isinstance(item, bytes) and len(item) > 0 else 'N/A'
                        print(f"   Element {i}: type={type(item)}, length={item_len}, preview={item_preview}")
                
                # The signature should be 64 bytes for Ed25519
                if isinstance(decoded_signature, bytes) and len(decoded_signature) == 64:
                    # Direct signature bytes
                    actual_signature = decoded_signature
                    message_bytes = expected_message_bytes
                    print(f"✅ Direct signature bytes: {len(actual_signature)} bytes")
                elif isinstance(decoded_signature, list):
                    # COSE_Sign1 format: [protected, unprotected, payload, signature]
                    print(f"📦 COSE_Sign1 array length: {len(decoded_signature)}")
                    if len(decoded_signature) >= 4:
                        # Extract payload (index 2) - this is what was actually signed
                        payload = decoded_signature[2]
                        if isinstance(payload, bytes):
                            message_bytes = payload
                            print(f"📦 Extracted payload from COSE: {len(message_bytes)} bytes")
                        else:
                            print(f"⚠️  Payload is not bytes, using expected message")
                            message_bytes = expected_message_bytes
                        
                        # The signature is the 4th element (index 3)
                        sig_element = decoded_signature[3]
                        print(f"📦 Signature element type: {type(sig_element)}, length: {len(sig_element) if isinstance(sig_element, bytes) else 'N/A'}")
                        
                        # Handle case where signature might be nested
                        if isinstance(sig_element, bytes):
                            if len(sig_element) == 64:
                                actual_signature = sig_element
                            elif len(sig_element) > 64:
                                # Might be wrapped, try to extract last 64 bytes
                                actual_signature = sig_element[-64:]
                                print(f"📦 Extracted last 64 bytes from signature element")
                            else:
                                print(f"❌ Signature element too short: {len(sig_element)} bytes")
                                return False
                        elif isinstance(sig_element, list) and len(sig_element) > 0:
                            # Nested structure, get the last element
                            actual_signature = sig_element[-1] if isinstance(sig_element[-1], bytes) else None
                            if not actual_signature or len(actual_signature) != 64:
                                print(f"❌ Could not extract 64-byte signature from nested structure")
                                return False
                        else:
                            print(f"❌ Unexpected signature element type: {type(sig_element)}")
                            return False
                        
                        print(f"✅ Extracted signature length: {len(actual_signature)} bytes")
                    else:
                        print(f"❌ COSE_Sign1 array too short: {len(decoded_signature)}")
                        return False
                elif isinstance(decoded_signature, dict):
                    # Some wallets might use a different structure
                    print(f"📦 Signature structure keys: {decoded_signature.keys()}")
                    # Try to find signature field
                    if 'signature' in decoded_signature:
                        sig_val = decoded_signature['signature']
                        if isinstance(sig_val, bytes) and len(sig_val) == 64:
                            actual_signature = sig_val
                            message_bytes = expected_message_bytes
                        else:
                            print(f"❌ Invalid signature in dict structure")
                            return False
                    else:
                        print(f"❌ Unexpected dict signature structure, no 'signature' key")
                        return False
                else:
                    print(f"❌ Unexpected decoded signature format: {type(decoded_signature)}")
                    return False
                    
                if not isinstance(actual_signature, bytes) or len(actual_signature) != 64:
                    print(f"❌ Invalid signature: type={type(actual_signature)}, length={len(actual_signature) if isinstance(actual_signature, bytes) else 'N/A'} bytes (expected 64)")
                    return False
                
                if message_bytes is None:
                    message_bytes = expected_message_bytes
                    
            except Exception as e:
                print(f"❌ Failed to decode CBOR signature: {e}")
                import traceback
                traceback.print_exc()
                return False
            
            # Decode CBOR-encoded public key (CIP-8 format)
            # The key is CBOR-encoded and may be wrapped in a COSE_Key structure
            try:
                decoded_key = cbor2.loads(key_bytes)
                
                # Handle different CBOR formats
                if isinstance(decoded_key, bytes) and len(decoded_key) == 32:
                    # Direct Ed25519 public key bytes
                    public_key_bytes = decoded_key
                elif isinstance(decoded_key, dict):
                    # COSE_Key format (CIP-8)
                    # Key type 1 = OKP (Octet Key Pair for Ed25519)
                    # -1 = crv (curve), 6 = Ed25519
                    # -2 = x (public key bytes)
                    print(f"📦 COSE_Key structure detected: {decoded_key.keys()}")
                    if -2 in decoded_key:
                        public_key_bytes = decoded_key[-2]
                        if not isinstance(public_key_bytes, bytes) or len(public_key_bytes) != 32:
                            print(f"❌ Invalid public key in COSE_Key: type={type(public_key_bytes)}, len={len(public_key_bytes) if isinstance(public_key_bytes, bytes) else 'N/A'}")
                            return False
                    else:
                        print(f"❌ COSE_Key missing -2 (public key) field. Keys: {decoded_key.keys()}")
                        return False
                else:
                    print(f"❌ Unexpected decoded key format: {type(decoded_key)}, length: {len(decoded_key) if isinstance(decoded_key, bytes) else 'N/A'}")
                    return False
            except Exception as e:
                print(f"❌ Failed to decode CBOR key: {e}")
                import traceback
                traceback.print_exc()
                return False
            
            # Create Ed25519 verification key
            verify_key = VerifyKey(public_key_bytes)
            
            # For COSE_Sign1, we need to verify against the Sig_structure
            # Sig_structure = ["Signature1", protected_headers, external_aad, payload]
            # Since we have the COSE_Sign1 structure, we need to reconstruct what was signed
            
            # Try verifying with the payload directly first (some wallets sign just the payload)
            try:
                verify_key.verify(message_bytes, actual_signature)
                print(f"✅ Cardano signature verified for address: {address[:20]}...")
                return True
            except BadSignatureError:
                print(f"⚠️  Direct payload verification failed, trying Sig_structure...")
                
                # If direct verification fails, try with Sig_structure
                # This is the proper COSE_Sign1 verification according to RFC 8152
                try:
                    # Reconstruct Sig_structure for COSE_Sign1
                    # Get protected headers from the COSE_Sign1 array
                    if isinstance(decoded_signature, list) and len(decoded_signature) >= 4:
                        protected = decoded_signature[0]
                        payload = decoded_signature[2]
                        
                        # Sig_structure = ["Signature1", protected, external_aad, payload]
                        # external_aad is empty for CIP-30
                        sig_structure = [
                            "Signature1",  # context string
                            protected,      # protected headers (already CBOR-encoded)
                            b"",           # external_aad (empty)
                            payload        # payload
                        ]
                        
                        # Encode the Sig_structure
                        sig_structure_bytes = cbor2.dumps(sig_structure)
                        
                        # Verify signature against Sig_structure
                        verify_key.verify(sig_structure_bytes, actual_signature)
                        print(f"✅ Cardano signature verified with Sig_structure for address: {address[:20]}...")
                        return True
                    else:
                        print(f"❌ Cannot reconstruct Sig_structure, COSE_Sign1 format invalid")
                        return False
                        
                except BadSignatureError:
                    print(f"❌ Cardano signature verification failed for address: {address[:20]}...")
                    return False
                except Exception as e:
                    print(f"❌ Error during Sig_structure verification: {e}")
                    import traceback
                    traceback.print_exc()
                    return False
                
        except Exception as e:
            print(f"❌ Cardano signature verification error: {e}")
            import traceback
            traceback.print_exc()
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
            print(f"🔍 Starting wallet authentication for {wallet_type}")
            
            # Extract nonce from message
            nonce_match = re.search(r'Nonce: ([a-f0-9]+)', message)
            if not nonce_match:
                print("❌ No nonce found in message")
                return False, None
            
            nonce = nonce_match.group(1)
            print(f"✅ Nonce extracted: {nonce[:10]}...")
            
            # Validate message format
            if not WalletAuthenticator.validate_message_format(message, address, nonce):
                print("❌ Message format validation failed")
                return False, None
            
            print("✅ Message format validated")
            
            # Verify nonce
            if not await WalletAuthenticator.verify_nonce(nonce, address):
                print("❌ Nonce verification failed")
                return False, None
            
            print("✅ Nonce verified")
            
            # Verify signature based on wallet type
            signature_valid = False
            
            if wallet_type.upper() in ['METAMASK', 'BLADE_EVM']:
                signature_valid = WalletAuthenticator.verify_evm_signature(message, signature, address)
            elif wallet_type.upper() in ['HASHPACK', 'KABILA', 'PORTAL', 'BLADE_NATIVE']:
                if not public_key:
                    return False, None
                signature_valid = WalletAuthenticator.verify_hedera_signature(message, signature, public_key)
            elif wallet_type.upper() in ['NAMI', 'ETERNL', 'LACE', 'FLINT', 'TYPHON']:
                # Cardano wallets
                signature_valid = WalletAuthenticator.verify_cardano_signature(message, signature, address)
            else:
                print(f"❌ Unsupported wallet type: {wallet_type}")
                return False, None
            
            if not signature_valid:
                return False, None
            
            # Extract account identifier based on wallet type
            # For Cardano wallets, use the address directly
            # For Hedera/EVM wallets, extract Hedera account ID
            if wallet_type.upper() in ['NAMI', 'ETERNL', 'LACE', 'FLINT', 'TYPHON']:
                # Cardano address - use as-is
                account_id = address
            else:
                # Hedera/EVM wallet - extract Hedera account ID
                account_id = WalletAuthenticator.extract_hedera_account_id(address)
            
            return True, account_id
            
        except Exception as e:
            print(f"Wallet authentication failed: {e}")
            return False, None