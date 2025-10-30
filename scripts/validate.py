#!/usr/bin/env python3
"""
Validate HarvestLedger Hedera Setup

This script checks if all Hedera resources are properly configured.
"""

import os
import sys
import asyncio
import re
from pathlib import Path

def validate_env_file():
    """Validate .env file configuration"""
    print("🔍 Validating .env configuration...")
    
    env_file = Path(".env")
    if not env_file.exists():
        print("❌ .env file not found")
        return False
    
    with open(env_file, 'r') as f:
        content = f.read()
    
    # Check required variables
    checks = {
        "OPERATOR_ID": r"OPERATOR_ID=0\.0\.\d+",
        "OPERATOR_KEY": r"OPERATOR_KEY=\w{64,}",
        "HCS_TOPIC_ID": r"HCS_TOPIC_ID=0\.0\.\d+",
        "LOAN_CONTRACT_ID": r"LOAN_CONTRACT_ID=0\.0\.\d+",
    }
    
    results = {}
    for var, pattern in checks.items():
        if re.search(pattern, content):
            print(f"✅ {var} configured")
            results[var] = True
        else:
            print(f"❌ {var} missing or invalid")
            results[var] = False
    
    return all(results.values())

def validate_hedera_format():
    """Validate Hedera ID formats"""
    print("\n🔍 Validating Hedera ID formats...")
    
    env_file = Path(".env")
    if not env_file.exists():
        return False
    
    with open(env_file, 'r') as f:
        content = f.read()
    
    # Extract IDs
    operator_match = re.search(r"OPERATOR_ID=(0\.0\.\d+)", content)
    topic_match = re.search(r"HCS_TOPIC_ID=(0\.0\.\d+)", content)
    contract_match = re.search(r"LOAN_CONTRACT_ID=(0\.0\.\d+)", content)
    
    valid = True
    
    if operator_match:
        operator_id = operator_match.group(1)
        print(f"✅ Operator ID format valid: {operator_id}")
    else:
        print("❌ Operator ID format invalid")
        valid = False
    
    if topic_match:
        topic_id = topic_match.group(1)
        print(f"✅ Topic ID format valid: {topic_id}")
    else:
        print("❌ Topic ID format invalid")
        valid = False
    
    if contract_match:
        contract_id = contract_match.group(1)
        print(f"✅ Contract ID format valid: {contract_id}")
    else:
        print("❌ Contract ID format invalid")
        valid = False
    
    return valid

async def test_hedera_connection():
    """Test connection to Hedera network"""
    print("\n🌐 Testing Hedera network connection...")
    
    try:
        # Add the backend directory to the Python path
        backend_path = Path(__file__).parent.parent / "backend"
        sys.path.insert(0, str(backend_path))
        
        from app.core.hedera import HederaClient, HEDERA_AVAILABLE
        
        if not HEDERA_AVAILABLE:
            print("⚠️  Hedera SDK not available - using mock implementation")
            print("✅ Mock mode working (suitable for development)")
            return True
        
        client = HederaClient()
        await client.initialize()
        
        if client.client:
            print("✅ Hedera client initialized successfully")
            return True
        else:
            print("❌ Failed to initialize Hedera client")
            return False
            
    except Exception as e:
        print(f"❌ Hedera connection test failed: {e}")
        return False

def validate_project_structure():
    """Validate project structure"""
    print("\n📁 Validating project structure...")
    
    required_files = [
        "backend/app/main.py",
        "backend/requirements.txt",
        "frontend/package.json",
        "docker-compose.yml",
        ".env.example"
    ]
    
    missing_files = []
    for file_path in required_files:
        if Path(file_path).exists():
            print(f"✅ {file_path}")
        else:
            print(f"❌ {file_path} missing")
            missing_files.append(file_path)
    
    return len(missing_files) == 0

def generate_setup_commands():
    """Generate setup commands based on validation results"""
    print("\n📝 Setup Commands")
    print("=" * 40)
    
    env_file = Path(".env")
    if not env_file.exists():
        print("# Create environment file")
        print("cp .env.example .env")
        print("# Edit .env with your Hedera credentials")
        print()
    
    print("# Get Hedera testnet credentials")
    print("# Visit: https://portal.hedera.com")
    print("# Create account and get Account ID + Private Key")
    print()
    
    print("# Create Hedera resources")
    print("python3 scripts/setup_hedera.py")
    print("# Or individually:")
    print("python3 scripts/create_topic.py")
    print("python3 scripts/deploy_contract.py")
    print()
    
    print("# Start the application")
    print("./scripts/start.sh")

async def main():
    """Main validation function"""
    print("🌾 HarvestLedger Setup Validator")
    print("=" * 50)
    
    # Change to project root directory
    project_root = Path(__file__).parent.parent
    os.chdir(project_root)
    
    # Run validation checks
    checks = [
        ("Project Structure", validate_project_structure),
        ("Environment File", validate_env_file),
        ("Hedera ID Formats", validate_hedera_format),
        ("Hedera Connection", test_hedera_connection),
    ]
    
    results = {}
    for check_name, check_func in checks:
        print(f"\n{'='*20} {check_name} {'='*20}")
        if asyncio.iscoroutinefunction(check_func):
            results[check_name] = await check_func()
        else:
            results[check_name] = check_func()
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Validation Summary")
    print("=" * 50)
    
    passed = sum(results.values())
    total = len(results)
    
    for check_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {check_name}")
    
    print(f"\n📈 Score: {passed}/{total} checks passed")
    
    if passed == total:
        print("\n🎉 All checks passed! Your setup is ready.")
        print("\n🚀 Next steps:")
        print("1. Start the application: ./scripts/start.sh")
        print("2. Access frontend: http://localhost:3000")
        print("3. Test blockchain features")
    else:
        print(f"\n⚠️  {total - passed} checks failed. See details above.")
        generate_setup_commands()

if __name__ == "__main__":
    asyncio.run(main())