# Git Configuration Guide

This document explains the Git configuration setup for the HarvestLedger project.

## Files Overview

### .gitignore Files

#### Root .gitignore
- **Location**: `/.gitignore`
- **Purpose**: Main ignore file for the entire project
- **Covers**: Environment files, IDE settings, OS files, logs, dependencies, Docker volumes, Python cache, Node.js artifacts, sensitive data

#### Frontend .gitignore
- **Location**: `/frontend/.gitignore`
- **Purpose**: Next.js and React specific ignores
- **Covers**: Node modules, Next.js build outputs, TypeScript cache, testing artifacts, development tools

#### Backend .gitignore
- **Location**: `/backend/.gitignore`
- **Purpose**: Python and FastAPI specific ignores
- **Covers**: Python cache, virtual environments, database files, Alembic migrations, FastAPI artifacts, Hedera SDK files

#### Scripts .gitignore
- **Location**: `/scripts/.gitignore`
- **Purpose**: Script directory specific ignores
- **Covers**: Python cache, temporary files, local configurations, Hedera private keys

#### Contracts .gitignore
- **Location**: `/contracts/.gitignore`
- **Purpose**: Solidity contract specific ignores
- **Covers**: Compiled contracts, build artifacts, deployment files, coverage reports

### .dockerignore Files

#### Root .dockerignore
- **Location**: `/.dockerignore`
- **Purpose**: Optimize Docker build context
- **Covers**: Documentation, development files, IDE settings, test files, cache directories

#### Frontend .dockerignore
- **Location**: `/frontend/.dockerignore`
- **Purpose**: Optimize Next.js Docker builds
- **Covers**: Node modules, build outputs, development tools, cache files

#### Backend .dockerignore
- **Location**: `/backend/.dockerignore`
- **Purpose**: Optimize Python Docker builds
- **Covers**: Python cache, virtual environments, test files, development artifacts

### .gitattributes
- **Location**: `/.gitattributes`
- **Purpose**: Configure Git file handling
- **Features**:
  - Line ending normalization (LF)
  - Language detection for GitHub
  - Binary file handling
  - Diff and merge settings
  - Generated file marking

## Security Features

### Protected Files
- Environment files (`.env*`)
- Hedera private keys (`*.privatekey`, `hedera-*.json`)
- SSL certificates (`*.pem`, `*.key`, `*.crt`)
- Database files (`*.db`, `*.sqlite*`)
- Configuration with sensitive data

### Development Safety
- IDE settings ignored to prevent conflicts
- OS-specific files ignored
- Temporary and cache files excluded
- Build artifacts not tracked

## Usage

### Initial Setup
```bash
# The .gitignore files are already configured
# Just start using git normally
git add .
git commit -m "Initial commit"
```

### Cleanup Existing Repository
If you have files that should be ignored but are already tracked:
```bash
# Run the cleanup script
./scripts/git-cleanup.sh

# Review changes
git status

# Commit the cleanup
git commit -m "chore: remove ignored files from git tracking"
```

### Adding New Files
The .gitignore patterns will automatically exclude:
- Any `.env` files you create
- Node modules when you run `npm install`
- Python cache when you run Python code
- Build outputs when you build the project
- IDE settings when you open the project

### Checking Ignore Status
```bash
# Check if a file is ignored
git check-ignore filename

# See all ignored files in a directory
git status --ignored

# List all tracked files
git ls-files
```

## Best Practices

### Environment Files
- Never commit `.env` files with real credentials
- Use `.env.example` as a template
- Document required environment variables

### Sensitive Data
- Never commit private keys or certificates
- Use environment variables for secrets
- Review commits before pushing

### Dependencies
- Don't commit `node_modules/` or `__pycache__/`
- Use lock files (`package-lock.json`, `Pipfile.lock`)
- Document installation steps in README

### Build Artifacts
- Don't commit build outputs (`.next/`, `dist/`, `build/`)
- Use CI/CD for building and deployment
- Keep source code separate from compiled code

## Troubleshooting

### File Still Being Tracked
If a file is still being tracked despite being in .gitignore:
```bash
# Remove from git but keep locally
git rm --cached filename

# For directories
git rm -r --cached directory/

# Commit the removal
git commit -m "Remove tracked file that should be ignored"
```

### Large Files Accidentally Committed
```bash
# Use git filter-branch or BFG Repo-Cleaner
# This rewrites history, so coordinate with team
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch path/to/large/file' \
  --prune-empty --tag-name-filter cat -- --all
```

### Checking What's Ignored
```bash
# See all ignored files
git status --ignored

# Check specific patterns
git check-ignore -v filename

# List all .gitignore files
find . -name .gitignore
```

## Maintenance

### Regular Checks
- Review .gitignore effectiveness periodically
- Update patterns for new tools or frameworks
- Clean up obsolete ignore patterns

### Team Coordination
- Discuss .gitignore changes with team
- Document any project-specific ignore needs
- Keep .gitignore files in version control

### Updates
- Update .gitignore when adding new tools
- Add patterns for new file types
- Remove obsolete patterns

## Integration with CI/CD

The .gitignore and .dockerignore files work together to:
- Keep repository clean and focused
- Optimize Docker build performance
- Prevent sensitive data leaks
- Ensure consistent builds across environments

## File Patterns Reference

### Common Patterns
```
# Exact match
filename

# Wildcard
*.log

# Directory
directory/

# Negation (don't ignore)
!important.log

# Subdirectories
**/logs/

# Current directory only
/root-only-file
```

### Environment Specific
```
# Development
.env.local
.env.development.local

# Testing
.env.test.local
coverage/

# Production
.env.production.local
build/
```

This configuration ensures a clean, secure, and efficient Git workflow for the HarvestLedger project.