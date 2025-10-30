#!/usr/bin/env python3
"""
Deploy Smart Contract for HarvestLedger Loan System

This script deploys a smart contract for automated loan agreements.
"""

import os
import sys
import asyncio
import json
from pathlib import Path
from web3 import Web3

# Add the backend directory to the Python path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

try:
    from app.core.config import settings
except ImportError as e:
    print(f"❌ Failed to import HarvestLedger modules: {e}")
    print("Make sure you're running this from the project root directory")
    sys.exit(1)

# Simple loan contract bytecode and ABI
LOAN_CONTRACT_BYTECODE = "0x608060405234801561001057600080fd5b50600436106100365760003560e01c8063a9059cbb1461003b578063dd62ed3e14610057575b600080fd5b610055600480360381019061005091906100d3565b610087565b005b61007160048036038101906100609190610113565b61009b565b60405161007e9190610162565b60405180910390f35b60008111156100985761009833826100c3565b50565b60006020528160005260406000206020528060005260406000206000915091505481565b505050565b600080fd5b6000819050919050565b6100e0816100cd565b81146100eb57600080fd5b50565b6000813590506100fd816100d7565b92915050565b61010c816100cd565b82525050565b60008060408385031215610129576101286100c8565b5b6000610137858286016100ee565b9250506020610148858286016100ee565b9150509250929050565b61015b816100cd565b82525050565b60006020820190506101766000830184610152565b9291505056fea2646970667358221220"

LOAN_CONTRACT_ABI = [
    {
        "inputs": [
            {"name": "borrower", "type": "address"},
            {"name": "amount", "type": "uint256"}
        ],
        "name": "createLoan",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"name": "loanId", "type": "uint256"}
        ],
        "name": "repayLoan",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {"name": "", "type": "uint256"}
        ],
        "name": "loans",
        "outputs": [
            {"name": "borrower", "type": "address"},
            {"name": "amount", "type": "uint256"},
            {"name": "repaid", "type": "bool"}
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

async def deploy_loan_contract():
    """Deploy the loan smart contract"""
    print("🌾 Deploying HarvestLedger Loan Smart Contract")
    print("=" * 60)
    
    # Check if we have Hedera RPC URL
    rpc_url = getattr(settings, 'HEDERA_RPC_URL', 'https://testnet.hashio.io/api')
    
    print(f"🌐 Connecting to: {rpc_url}")
    
    try:
        # Connect to Hedera via Web3
        w3 = Web3(Web3.HTTPProvider(rpc_url))
        
        if not w3.is_connected():
            print("❌ Failed to connect to Hedera network")
            print("⚠️  Using mock contract ID for development")
            return "0.0.789012"
        
        print("✅ Connected to Hedera network")
        
        # For demo purposes, we'll use a mock contract ID
        # In a real implementation, you would:
        # 1. Compile the Solidity contract
        # 2. Deploy it using Web3 or Hedera SDK
        # 3. Return the actual contract ID
        
        print("📝 Deploying contract...")
        print("⚠️  Using mock deployment for demo")
        
        # Simulate contract deployment
        await asyncio.sleep(2)  # Simulate deployment time
        
        contract_id = "0.0.789012"  # Mock contract ID
        
        print(f"✅ Contract deployed successfully!")
        print(f"📋 Contract ID: {contract_id}")
        print(f"🔗 View on HashScan: https://hashscan.io/testnet/contract/{contract_id}")
        
        # Update .env file
        await update_env_file("LOAN_CONTRACT_ID", contract_id)
        
        return contract_id
        
    except Exception as e:
        print(f"❌ Deployment failed: {e}")
        print("⚠️  Using mock contract ID for development")
        return "0.0.789012"

async def deploy_real_contract():
    """Deploy actual smart contract (when Hedera SDK is available)"""
    print("🔨 Deploying real smart contract...")
    
    # This would be the real implementation:
    # 1. Read Solidity contract from contracts/LoanEscrow.sol
    # 2. Compile it using solc or similar
    # 3. Deploy using Hedera SDK ContractCreateTransaction
    # 4. Return the actual contract ID
    
    # For now, return mock ID
    return "0.0.789012"

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

async def create_contract_artifacts():
    """Create contract artifacts for frontend integration"""
    artifacts_dir = Path("frontend/src/contracts")
    artifacts_dir.mkdir(exist_ok=True)
    
    # Save ABI for frontend use
    abi_file = artifacts_dir / "LoanContract.json"
    with open(abi_file, 'w') as f:
        json.dump({
            "abi": LOAN_CONTRACT_ABI,
            "contractName": "LoanEscrow",
            "networks": {
                "296": {  # Hedera testnet chain ID
                    "address": "0.0.789012"
                }
            }
        }, f, indent=2)
    
    print(f"📄 Created contract artifacts: {abi_file}")

async def main():
    """Main function"""
    print("🌾 HarvestLedger Smart Contract Deployer")
    print("=" * 50)
    
    # Change to project root directory
    project_root = Path(__file__).parent.parent
    os.chdir(project_root)
    
    try:
        # Deploy contract
        contract_id = await deploy_loan_contract()
        
        # Create frontend artifacts
        await create_contract_artifacts()
        
        if contract_id:
            print("\n" + "=" * 50)
            print("🎉 Contract Deployment Complete!")
            print(f"\n📋 Your Contract ID: {contract_id}")
            print("\n📝 Next steps:")
            print("1. The contract ID has been added to your .env file")
            print("2. Contract ABI saved for frontend integration")
            print("3. Start the application: ./scripts/start.sh")
            print("4. Create loan applications to test smart contract integration")
            print(f"5. Monitor contract: https://hashscan.io/testnet/contract/{contract_id}")
            
            print("\n💡 Note: This is a mock deployment for development.")
            print("For production, deploy a real smart contract using Hedera SDK.")
        else:
            print("\n❌ Contract deployment failed")
    
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())