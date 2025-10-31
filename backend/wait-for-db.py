#!/usr/bin/env python3
"""
Wait for database to be ready before starting the application
"""
import time
import sys
import psycopg2
from psycopg2 import OperationalError
import os

def wait_for_db():
    """Wait for database to be ready"""
    db_url = os.getenv('DATABASE_URL', 'postgresql://harvest_user:harvest_pass@db:5432/harvest_ledger')
    
    # Parse database URL
    if db_url.startswith('postgresql://'):
        # Extract connection parameters from URL
        url_parts = db_url.replace('postgresql://', '').split('/')
        auth_host = url_parts[0]
        database = url_parts[1] if len(url_parts) > 1 else 'harvest_ledger'
        
        if '@' in auth_host:
            auth, host_port = auth_host.split('@')
            user, password = auth.split(':')
        else:
            host_port = auth_host
            user = 'harvest_user'
            password = 'harvest_pass'
            
        if ':' in host_port:
            host, port = host_port.split(':')
            port = int(port)
        else:
            host = host_port
            port = 5432
    else:
        # Fallback to environment variables
        host = os.getenv('DB_HOST', 'db')
        port = int(os.getenv('DB_PORT', '5432'))
        database = os.getenv('DB_NAME', 'harvest_ledger')
        user = os.getenv('DB_USER', 'harvest_user')
        password = os.getenv('DB_PASSWORD', 'harvest_pass')
    
    print(f"Waiting for database at {host}:{port}...")
    
    max_retries = 30
    retry_interval = 2
    
    for attempt in range(max_retries):
        try:
            conn = psycopg2.connect(
                host=host,
                port=port,
                database=database,
                user=user,
                password=password,
                connect_timeout=5
            )
            conn.close()
            print("Database is ready!")
            return True
        except OperationalError as e:
            print(f"Attempt {attempt + 1}/{max_retries}: Database not ready - {e}")
            if attempt < max_retries - 1:
                time.sleep(retry_interval)
            else:
                print("Database failed to become ready in time")
                return False
    
    return False

if __name__ == "__main__":
    if wait_for_db():
        sys.exit(0)
    else:
        sys.exit(1)