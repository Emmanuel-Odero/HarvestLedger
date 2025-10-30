#!/bin/bash

# Git cleanup script to remove files that should be ignored
# This script helps clean up files that were tracked before .gitignore was added

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "🧹 Git Cleanup - Removing files that should be ignored"
echo "====================================================="

# Function to remove from git if exists
remove_if_tracked() {
    local file="$1"
    if git ls-files --error-unmatch "$file" >/dev/null 2>&1; then
        echo "🗑️  Removing from git: $file"
        git rm --cached "$file" 2>/dev/null || true
    fi
}

# Remove environment files
echo "📝 Removing environment files..."
remove_if_tracked ".env"
remove_if_tracked ".env.local"
remove_if_tracked ".env.development.local"
remove_if_tracked ".env.test.local"
remove_if_tracked ".env.production.local"

# Remove IDE files
echo "💻 Removing IDE files..."
remove_if_tracked ".vscode/settings.json"
remove_if_tracked ".idea/"

# Remove OS files
echo "🖥️  Removing OS files..."
remove_if_tracked ".DS_Store"
remove_if_tracked "Thumbs.db"

# Remove Python cache
echo "🐍 Removing Python cache files..."
find . -name "__pycache__" -type d -exec git rm -r --cached {} + 2>/dev/null || true
find . -name "*.pyc" -exec git rm --cached {} + 2>/dev/null || true
find . -name "*.pyo" -exec git rm --cached {} + 2>/dev/null || true

# Remove Node.js files
echo "📦 Removing Node.js files..."
remove_if_tracked "frontend/node_modules/"
remove_if_tracked "frontend/.next/"
remove_if_tracked "frontend/out/"
remove_if_tracked "frontend/build/"
remove_if_tracked "frontend/npm-debug.log"
remove_if_tracked "frontend/yarn-debug.log"
remove_if_tracked "frontend/yarn-error.log"

# Remove logs
echo "📋 Removing log files..."
find . -name "*.log" -exec git rm --cached {} + 2>/dev/null || true

# Remove database files
echo "🗄️  Removing database files..."
remove_if_tracked "*.db"
remove_if_tracked "*.sqlite"
remove_if_tracked "*.sqlite3"

# Remove Docker volumes
echo "🐳 Removing Docker volume directories..."
remove_if_tracked "postgres_data/"
remove_if_tracked "pgadmin_data/"

# Remove backup files
echo "💾 Removing backup files..."
find . -name "*.bak" -exec git rm --cached {} + 2>/dev/null || true
find . -name "*.backup" -exec git rm --cached {} + 2>/dev/null || true
find . -name "*.old" -exec git rm --cached {} + 2>/dev/null || true

# Remove Hedera private keys (security)
echo "🔐 Removing Hedera private keys..."
find . -name "*.privatekey" -exec git rm --cached {} + 2>/dev/null || true
find . -name "hedera-*.json" -exec git rm --cached {} + 2>/dev/null || true

echo ""
echo "✅ Cleanup completed!"
echo ""
echo "📊 Current git status:"
git status --porcelain | head -10
echo ""
echo "💡 Note: Files have been removed from git tracking but still exist locally."
echo "   Add them to .gitignore to prevent future tracking."
echo ""
echo "🚀 Next steps:"
echo "   1. Review the changes: git status"
echo "   2. Commit the cleanup: git commit -m 'chore: remove ignored files from git tracking'"
echo "   3. Add and commit .gitignore files"