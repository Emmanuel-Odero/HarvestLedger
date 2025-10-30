#!/usr/bin/env python3
"""
Complete Hedera Setup for HarvestLedger

This script sets up all Hedera resources: topics, contracts, and tokens.
"""

import os
import sys
import asyncio
from pathlib import Path

# Add the backend directory to the Python path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

async def run_script(script_name):
    """Run a Python script and return success status"""
    try:
        script_path = Path(__file__).parent / script_name
        
        # Import and run the script
        if script_name == "create_topic.py":
            from create_topic import main as create_topic_main
            await create_topic_main()
        elif script_name == "deploy_contract.py":
            from deploy_contract import main as deploy_contract_main
            await deploy_contract_main()
        
        return True
    except Exception as e:
        print(f"❌ Failed to run {script_name}: {e}")
        return False

async def validate_hedera_setup():
    """Validate that Hedera credentials are configured"""
    print("🔍 Validating Hedera setup...")
    
    env_file = Path(".env")
    if not env_file.exists():
        print("❌ .env file not found")
        print("Please copy .env.example to .env and configure your credentials")
        return False
    
    # Check for required credentials
    with open(env_file, 'r') as f:
        content = f.read()
    
    required_vars = [
        "OPERATOR_ID=0.0.",
        "OPERATOR_KEY=",
    ]
    
    missing_vars = []
    for var in required_vars:
        if var not in content or f"{var}YOUR_" in content:
            missing_vars.append(var.split('=')[0])
    
    if missing_vars:
        print(f"❌ Missing or unconfigured variables: {', '.join(missing_vars)}")
        print("\n📝 Please configure these in your .env file:")
        print("OPERATOR_ID=0.0.YOUR_ACCOUNT_ID")
        print("OPERATOR_KEY=your_private_key_here")
        print("\n🔗 Get free testnet credentials at: https://portal.hedera.com")
        return False
    
    print("✅ Hedera credentials configured")
    return True

async def display_setup_guide():
    """Display setup guide for getting Hedera credentials"""
    print("\n" + "=" * 60)
    print("🌾 HarvestLedger Hedera Setup Guide")
    print("=" * 60)
    
    print("\n📋 Step 1: Get Hedera Testnet Account")
    print("1. Visit: https://portal.hedera.com")
    print("2. Create a free account")
    print("3. Go to 'Testnet Access'")
    print("4. Generate testnet credentials")
    print("5. Copy your Account ID and Private Key")
    
    print("\n📝 Step 2: Configure Environment")
    print("1. Edit your .env file")
    print("2. Set OPERATOR_ID=0.0.YOUR_ACCOUNT_ID")
    print("3. Set OPERATOR_KEY=your_private_key_here")
    
    print("\n🚀 Step 3: Run Setup")
    print("1. Run this script again: python3 scripts/setup_hedera.py")
    print("2. Or run individual scripts:")
    print("   - python3 scripts/create_topic.py")
    print("   - python3 scripts/deploy_contract.py")
    
    print("\n💡 What you'll get:")
    print("- HCS_TOPIC_ID: For logging supply chain events")
    print("- LOAN_CONTRACT_ID: For automated loan agreements")
    print("- Ready-to-use blockchain integration")

async def main():
    """Main setup function"""
    print("🌾 HarvestLedger Complete Hedera Setup")
    print("=" * 50)
    
    # Change to project root directory
    project_root = Path(__file__).parent.parent
    os.chdir(project_root)
    
    # Validate setup first
    if not await validate_hedera_setup():
        await display_setup_guide()
        return
    
    print("🚀 Starting Hedera resource creation...")
    
    # Step 1: Create HCS Topic
    print("\n" + "=" * 30 + " STEP 1: HCS Topic " + "=" * 30)
    topic_success = await run_script("create_topic.py")
    
    # Step 2: Deploy Smart Contract
    print("\n" + "=" * 30 + " STEP 2: Smart Contract " + "=" * 30)
    contract_success = await run_script("deploy_contract.py")
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Setup Summary")
    print("=" * 60)
    
    if topic_success:
        print("✅ HCS Topic created")
    else:
        print("❌ HCS Topic creation failed")
    
    if contract_success:
        print("✅ Smart Contract deployed")
    else:
        print("❌ Smart Contract deployment failed")
    
    if topic_success and contract_success:
        print("\n🎉 Hedera setup complete!")
        print("\n📝 Your .env file now contains:")
        print("- HCS_TOPIC_ID: For supply chain logging")
        print("- LOAN_CONTRACT_ID: For loan automation")
        
        print("\n🚀 Next steps:")
        print("1. Start the application: ./scripts/start.sh")
        print("2. Test HCS: Create a harvest record")
        print("3. Test contracts: Create a loan application")
        print("4. Monitor on HashScan: https://hashscan.io/testnet")
    else:
        print("\n⚠️  Setup completed with some issues")
        print("The application will work with mock implementations")
        print("Check the logs above for specific errors")

if __name__ == "__main__":
    asyncio.run(main())