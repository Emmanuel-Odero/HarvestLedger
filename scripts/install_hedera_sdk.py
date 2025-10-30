#!/usr/bin/env python3
"""
Script to install the proper Hedera SDK for HarvestLedger

This script attempts to install the official Hedera SDK or compatible alternatives.
"""

import subprocess
import sys
import os

def run_command(command):
    """Run a shell command and return the result"""
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def install_hedera_sdk():
    """Attempt to install Hedera SDK"""
    print("🌾 Installing Hedera SDK for HarvestLedger...")
    
    # List of potential Hedera SDK packages to try
    sdk_packages = [
        "hiero-sdk-python",  # Official Hiero SDK
        "hedera-sdk-py",     # Community SDK
        "py-hedera-sdk",     # Alternative SDK
    ]
    
    for package in sdk_packages:
        print(f"\n📦 Trying to install {package}...")
        success, stdout, stderr = run_command(f"pip install {package}")
        
        if success:
            print(f"✅ Successfully installed {package}")
            
            # Test the installation
            try:
                if package == "hiero-sdk-python":
                    import hiero
                    print(f"✅ {package} imported successfully")
                elif "hedera" in package:
                    import hedera
                    print(f"✅ {package} imported successfully")
                
                return True
            except ImportError as e:
                print(f"⚠️  {package} installed but import failed: {e}")
                continue
        else:
            print(f"❌ Failed to install {package}")
            if stderr:
                print(f"Error: {stderr}")
    
    print("\n⚠️  Could not install official Hedera SDK")
    print("The application will use mock implementation for development")
    print("\nTo use real Hedera functionality:")
    print("1. Get testnet credentials from https://portal.hedera.com")
    print("2. Install SDK manually when available:")
    print("   pip install hiero-sdk-python")
    print("3. Update backend/app/core/hedera.py imports")
    
    return False

def check_environment():
    """Check if we're in the right environment"""
    if not os.path.exists("backend/requirements.txt"):
        print("❌ Please run this script from the HarvestLedger root directory")
        return False
    
    # Check Python version
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ is required")
        return False
    
    return True

def main():
    """Main function"""
    print("🌾 HarvestLedger Hedera SDK Installation")
    print("=" * 50)
    
    if not check_environment():
        sys.exit(1)
    
    # Install other dependencies first
    print("\n📦 Installing base requirements...")
    success, stdout, stderr = run_command("pip install -r backend/requirements.txt")
    
    if not success:
        print("❌ Failed to install base requirements")
        print(stderr)
        sys.exit(1)
    
    print("✅ Base requirements installed")
    
    # Try to install Hedera SDK
    sdk_installed = install_hedera_sdk()
    
    print("\n" + "=" * 50)
    if sdk_installed:
        print("🎉 Setup complete! Hedera SDK is ready.")
        print("\nNext steps:")
        print("1. Configure .env with your Hedera testnet credentials")
        print("2. Run: ./scripts/start.sh")
    else:
        print("⚠️  Setup complete with mock Hedera implementation")
        print("\nThe application will work for development, but blockchain")
        print("features will be simulated until you install the real SDK.")
        print("\nNext steps:")
        print("1. Configure .env (optional for mock mode)")
        print("2. Run: ./scripts/start.sh")

if __name__ == "__main__":
    main()