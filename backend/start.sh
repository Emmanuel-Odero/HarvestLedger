#!/bin/bash
set -e

echo "Starting HarvestLedger backend..."

# Only install dependencies if they're missing (skip if already installed during build)
if ! python -c "import aiosmtplib" 2>/dev/null; then
    echo "Installing missing dependencies..."
    pip install --no-cache-dir -q -r requirements.txt || echo "Warning: Some dependencies may have failed to install"
else
    echo "Dependencies already installed, skipping..."
fi

# Wait for database to be ready
python wait-for-db.py

if [ $? -eq 0 ]; then
    echo "Database is ready, starting application..."
    exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
else
    echo "Database failed to become ready, exiting..."
    exit 1
fi