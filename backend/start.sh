#!/bin/bash
set -e

echo "Starting HarvestLedger backend..."

# Wait for database to be ready
python wait-for-db.py

if [ $? -eq 0 ]; then
    echo "Database is ready, starting application..."
    exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
else
    echo "Database failed to become ready, exiting..."
    exit 1
fi