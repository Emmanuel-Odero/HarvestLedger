#!/usr/bin/env python3
"""
HarvestLedger Setup Script

This script sets up the complete HarvestLedger development environment.
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path

def run_command(command, cwd=None):
    """Run a command and return success status"""
    try:
        result = subprocess.run(
            command, 
            shell=True, 
            cwd=cwd,
            capture_output=True, 
            text=True
        )
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def check_prerequisites():
    """Check if required tools are installed"""
    print("🔍 Checking prerequisites...")
    
    required_tools = {
        "docker": "Docker is required for containerization",
        "docker-compose": "Docker Compose is required for multi-container setup",
        "node": "Node.js is required for frontend development",
        "npm": "npm is required for frontend package management"
    }
    
    missing_tools = []
    
    for tool, description in required_tools.items():
        success, _, _ = run_command(f"which {tool}")
        if success:
            print(f"✅ {tool} found")
        else:
            print(f"❌ {tool} not found - {description}")
            missing_tools.append(tool)
    
    if missing_tools:
        print(f"\n❌ Missing required tools: {', '.join(missing_tools)}")
        print("\nPlease install the missing tools and run this script again.")
        return False
    
    return True

def setup_environment():
    """Setup environment file"""
    print("\n📝 Setting up environment...")
    
    env_example = Path(".env.example")
    env_file = Path(".env")
    
    if not env_example.exists():
        print("❌ .env.example not found")
        return False
    
    if not env_file.exists():
        shutil.copy(env_example, env_file)
        print("✅ Created .env from .env.example")
        print("⚠️  Please edit .env with your Hedera testnet credentials")
    else:
        print("✅ .env already exists")
    
    return True

def setup_backend():
    """Setup backend dependencies"""
    print("\n🐍 Setting up backend...")
    
    backend_dir = Path("backend")
    if not backend_dir.exists():
        print("❌ Backend directory not found")
        return False
    
    # Check if we're in a virtual environment
    in_venv = hasattr(sys, 'real_prefix') or (
        hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix
    )
    
    if not in_venv:
        print("⚠️  Not in a virtual environment")
        print("Consider creating one: python -m venv venv && source venv/bin/activate")
    
    # Install Python dependencies
    print("📦 Installing Python dependencies...")
    success, stdout, stderr = run_command(
        "pip install -r requirements.txt", 
        cwd=backend_dir
    )
    
    if not success:
        print("⚠️  Full requirements failed, trying minimal...")
        success, stdout, stderr = run_command(
            "pip install -r requirements-minimal.txt", 
            cwd=backend_dir
        )
    
    if success:
        print("✅ Backend dependencies installed")
    else:
        print(f"❌ Failed to install backend dependencies: {stderr}")
        return False
    
    return True

def setup_frontend():
    """Setup frontend dependencies"""
    print("\n⚛️  Setting up frontend...")
    
    frontend_dir = Path("frontend")
    if not frontend_dir.exists():
        print("❌ Frontend directory not found")
        return False
    
    # Install Node.js dependencies
    print("📦 Installing Node.js dependencies...")
    success, stdout, stderr = run_command("npm install", cwd=frontend_dir)
    
    if success:
        print("✅ Frontend dependencies installed")
    else:
        print(f"❌ Failed to install frontend dependencies: {stderr}")
        return False
    
    return True

def build_docker_images():
    """Build Docker images"""
    print("\n🐳 Building Docker images...")
    
    success, stdout, stderr = run_command("docker-compose build")
    
    if success:
        print("✅ Docker images built successfully")
    else:
        print(f"❌ Failed to build Docker images: {stderr}")
        return False
    
    return True

def create_hedera_topic():
    """Create Hedera topic for testing"""
    print("\n🌐 Setting up Hedera integration...")
    
    # Check if Hedera credentials are configured
    env_file = Path(".env")
    if env_file.exists():
        with open(env_file) as f:
            content = f.read()
            if "OPERATOR_ID=0.0." in content and "OPERATOR_KEY=" in content:
                print("✅ Hedera credentials found in .env")
                
                # Try to create a topic (this would need the actual SDK)
                print("ℹ️  Topic creation will be handled by the application")
                return True
            else:
                print("⚠️  Hedera credentials not configured in .env")
                print("   Get free testnet credentials at: https://portal.hedera.com")
    
    return True

def run_tests():
    """Run basic tests"""
    print("\n🧪 Running basic tests...")
    
    # Test Docker setup
    success, stdout, stderr = run_command("docker-compose config")
    if success:
        print("✅ Docker Compose configuration is valid")
    else:
        print(f"❌ Docker Compose configuration error: {stderr}")
        return False
    
    return True

def main():
    """Main setup function"""
    print("🌾 HarvestLedger Setup")
    print("=" * 50)
    
    # Change to script directory
    script_dir = Path(__file__).parent.parent
    os.chdir(script_dir)
    
    steps = [
        ("Prerequisites", check_prerequisites),
        ("Environment", setup_environment),
        ("Backend", setup_backend),
        ("Frontend", setup_frontend),
        ("Docker Images", build_docker_images),
        ("Hedera Integration", create_hedera_topic),
        ("Tests", run_tests),
    ]
    
    for step_name, step_func in steps:
        print(f"\n{'='*20} {step_name} {'='*20}")
        if not step_func():
            print(f"\n❌ Setup failed at step: {step_name}")
            sys.exit(1)
    
    print("\n" + "=" * 50)
    print("🎉 HarvestLedger setup complete!")
    print("\nNext steps:")
    print("1. Edit .env with your Hedera testnet credentials (optional)")
    print("2. Start the application: ./scripts/start.sh")
    print("3. Access the application:")
    print("   - Frontend: http://localhost:3000")
    print("   - Backend: http://localhost:8000")
    print("   - GraphQL: http://localhost:8000/graphql")
    print("\n📚 See SETUP.md for detailed documentation")

if __name__ == "__main__":
    main()