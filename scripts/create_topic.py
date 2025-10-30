#!/usr/bin/env python3
"""
Create Hedera Consensus Service (HCS) Topic for HarvestLedger

This script creates a new HCS topic for logging supply chain events.
"""

import os
import sys
import asyncio
from pathlib import Path

# Add the backend directory to the Python path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

try:
    from app.core.hedera import HederaClient
    from app.core.config import settings
except ImportError as e:
    print(f"❌ Failed to import HarvestLedger modules: {e}")
    print("Make sure you're running this from the project root directory")
    print("Also ensure you have installed the backend dependencies:")
    print("cd backend && pip install -r requirements.txt")
    sys.exit(1)

async def create_supply_chain_topic():
    """Create a topic for supply chain events"""
    print("🌾 Creating HCS Topic for HarvestLedger Supply Chain")
    print("=" * 60)
    
    # Check credentials
    if not settings.OPERATOR_ID or not settings.OPERATOR_KEY:
        print("❌ Hedera credentials not configured!")
        print("\nPlease set these in your .env file:")
        print("OPERATOR_ID=0.0.YOUR_ACCOUNT_ID")
        print("OPERATOR_KEY=your_private_key_here")
        print("\nGet free testnet credentials at: https://portal.hedera.com")
        return None
    
    print(f"🔑 Using Account: {settings.OPERATOR_ID}")
    print(f"🌐 Network: {settings.HEDERA_NETWORK}")
    
    # Initialize Hedera client
    client = HederaClient()
    await client.initialize()
    
    if not client.client:
        print("❌ Failed to initialize Hedera client")
        return None
    
    # Create topic
    print("\n📝 Creating HCS topic...")
    topic_id = await client.create_topic("HarvestLedger Supply Chain Events")
    
    if topic_id:
        print(f"✅ Topic created successfully!")
        print(f"📋 Topic ID: {topic_id}")
        print(f"🔗 View on HashScan: https://hashscan.io/testnet/topic/{topic_id}")
        
        # Update .env file
        await update_env_file("HCS_TOPIC_ID", topic_id)
        
        # Test the topic by sending a message
        print("\n🧪 Testing topic with a sample message...")
        test_message = {
            "type": "system_test",
            "message": "HarvestLedger topic created successfully",
            "timestamp": "2024-01-01T00:00:00Z"
        }
        
        tx_id = await client.submit_message(test_message, topic_id)
        if tx_id:
            print(f"✅ Test message sent! Transaction ID: {tx_id}")
            print(f"🔗 View transaction: https://hashscan.io/testnet/transaction/{tx_id}")
        else:
            print("⚠️  Failed to send test message")
        
        return topic_id
    else:
        print("❌ Failed to create topic")
        return None

async def update_env_file(key, value):
    """Update .env file with new value"""
    env_file = Path(".env")
    
    if not env_file.exists():
        print("⚠️  .env file not found")
        return
    
    # Read current content
    with open(env_file, 'r') as f:
        lines = f.readlines()
    
    # Update or add the key
    updated = False
    for i, line in enumerate(lines):
        if line.startswith(f"{key}="):
            lines[i] = f"{key}={value}\n"
            updated = True
            break
    
    if not updated:
        lines.append(f"{key}={value}\n")
    
    # Write back to file
    with open(env_file, 'w') as f:
        f.writelines(lines)
    
    print(f"📝 Updated .env file: {key}={value}")

async def main():
    """Main function"""
    print("🌾 HarvestLedger HCS Topic Creator")
    print("=" * 50)
    
    # Change to project root directory
    project_root = Path(__file__).parent.parent
    os.chdir(project_root)
    
    try:
        topic_id = await create_supply_chain_topic()
        
        if topic_id:
            print("\n" + "=" * 50)
            print("🎉 Setup Complete!")
            print(f"\n📋 Your HCS Topic ID: {topic_id}")
            print("\n📝 Next steps:")
            print("1. The topic ID has been added to your .env file")
            print("2. Start the application: ./scripts/start.sh")
            print("3. Create harvest records to test HCS integration")
            print(f"4. Monitor messages: https://hashscan.io/testnet/topic/{topic_id}")
        else:
            print("\n❌ Topic creation failed")
            print("Check your Hedera credentials and network connection")
    
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())