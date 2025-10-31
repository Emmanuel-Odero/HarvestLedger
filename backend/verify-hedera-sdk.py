#!/usr/bin/env python3
"""
Verify that the Hedera SDK is properly installed and working
This script tests the real Hedera cryptographic functions
"""

def test_hedera_sdk():
    print("🔍 Testing Hedera SDK Installation...")
    
    try:
        from hedera import PublicKey, PrivateKey
        print("✅ Hedera SDK imports successful")
    except ImportError as e:
        print(f"❌ Hedera SDK import failed: {e}")
        return False
    
    try:
        # Test key generation
        private_key = PrivateKey.generate()
        public_key = private_key.getPublicKey()
        print("✅ Key generation working")
        
        # Test message signing and verification
        message = b"Test message for Hedera signature verification"
        signature = private_key.sign(message)
        
        # Verify signature
        is_valid = public_key.verify(message, signature)
        
        if is_valid:
            print("✅ Signature verification working")
            print(f"   Private Key: {private_key}")
            print(f"   Public Key: {public_key}")
            print(f"   Message: {message.decode()}")
            print(f"   Signature: {bytes(signature).hex()}")
            return True
        else:
            print("❌ Signature verification failed")
            return False
            
    except Exception as e:
        print(f"❌ Hedera SDK test failed: {e}")
        return False

def test_eth_account():
    print("\n🔍 Testing ETH Account for EVM signatures...")
    
    try:
        from eth_account import Account
        from eth_account.messages import encode_defunct
        print("✅ ETH Account imports successful")
        
        # Test EVM signature
        private_key = "0x" + "1" * 64  # Test private key
        account = Account.from_key(private_key)
        
        message = "Test EVM signature message"
        message_hash = encode_defunct(text=message)
        signature = account.sign_message(message_hash)
        
        # Verify signature
        recovered_address = Account.recover_message(message_hash, signature=signature.signature)
        
        if recovered_address.lower() == account.address.lower():
            print("✅ EVM signature verification working")
            print(f"   Address: {account.address}")
            print(f"   Message: {message}")
            print(f"   Signature: {signature.signature.hex()}")
            return True
        else:
            print("❌ EVM signature verification failed")
            return False
            
    except Exception as e:
        print(f"❌ ETH Account test failed: {e}")
        return False

if __name__ == "__main__":
    print("🧪 HarvestLedger Cryptographic Verification Test")
    print("=" * 50)
    
    hedera_ok = test_hedera_sdk()
    eth_ok = test_eth_account()
    
    print("\n📊 Test Results:")
    print("=" * 20)
    print(f"Hedera SDK: {'✅ PASS' if hedera_ok else '❌ FAIL'}")
    print(f"ETH Account: {'✅ PASS' if eth_ok else '❌ FAIL'}")
    
    if hedera_ok and eth_ok:
        print("\n🎉 All cryptographic functions working!")
        print("🔐 Ready for real wallet authentication")
        print("🚫 NO MOCKS - Real blockchain verification only")
    else:
        print("\n❌ Some tests failed - check dependencies")
        exit(1)