# Cardano Error Handling Guide

This document describes the error handling utilities for Cardano blockchain operations in HarvestLedger.

## Overview

The error handling system provides:

- **Typed error classes** for different error categories
- **Error normalization** to convert any exception to a CardanoError
- **Structured logging** with complete context capture
- **Retry mechanisms** with exponential backoff

## Error Classes

### Base Error: CardanoError

All Cardano-related errors inherit from `CardanoError`:

```python
from app.core.cardano_errors import CardanoError

error = CardanoError("Something went wrong", "ERROR_CODE")
error.add_context("user_id", "user123")
error_dict = error.to_dict()  # For logging
```

### WalletError

Errors related to wallet connections and operations:

```python
from app.core.cardano_errors import WalletError, WalletErrorCode

# Factory methods
error = WalletError.not_installed("nami")
error = WalletError.user_rejected("wallet connection")
error = WalletError.network_mismatch("preprod", "mainnet")
error = WalletError.connection_timeout()

# Manual creation
error = WalletError(
    WalletErrorCode.NOT_INSTALLED,
    "Wallet not found",
    {"wallet_name": "nami"}
)
```

### TransactionError

Errors related to transaction building and submission:

```python
from app.core.cardano_errors import TransactionError, TransactionErrorCode

# Factory methods
error = TransactionError.insufficient_funds("1000000", "500000")
error = TransactionError.invalid_address("addr_invalid")
error = TransactionError.user_rejected("token transfer")
error = TransactionError.network_error("transaction submission")
error = TransactionError.invalid_metadata("missing required field")
error = TransactionError.build_failed("UTxO selection failed")
```

### BlockfrostError

Errors related to Blockfrost API calls:

```python
from app.core.cardano_errors import BlockfrostError, BlockfrostErrorCode

# Factory methods
error = BlockfrostError.authentication_failed()
error = BlockfrostError.rate_limit_exceeded(retry_after=60)

# From HTTP response
error = BlockfrostError.from_status_code(429, {"message": "Rate limit"})
```

### DatabaseError

Errors related to database operations:

```python
from app.core.cardano_errors import DatabaseError, DatabaseErrorCode

error = DatabaseError(
    DatabaseErrorCode.CONSTRAINT_VIOLATION,
    "insert_wallet",
    "Duplicate wallet address",
    original_error=db_exception
)
```

## Error Normalization

Convert any exception to a CardanoError:

```python
from app.core.cardano_errors import normalize_error

try:
    # Some operation
    pass
except Exception as e:
    cardano_error = normalize_error(e)
    # Now you have a CardanoError with proper structure
```

The normalizer automatically detects:

- Wallet-related errors (contains "wallet", "not installed")
- User rejections (contains "rejected", "declined", "cancelled")
- Network errors (contains "network", "timeout", "connection")
- Insufficient funds (contains "insufficient", "balance")
- Blockfrost errors (contains "blockfrost", "api")

## Structured Logging

### Basic Usage

```python
from app.core.cardano_errors import logger, LogLevel

# Simple logging
logger.info("Wallet connected successfully")
logger.warning("Rate limit approaching")
logger.error("Transaction failed", error=some_error)
logger.critical("Blockfrost API down", error=api_error)

# With context
logger.info(
    "Token minted successfully",
    operation="mint_token",
    user_id="user123",
    wallet_address="addr_test1...",
    transaction_id="tx_hash_abc",
    token_policy="policy_id_xyz"
)
```

### Error Logging

```python
from app.core.cardano_errors import logger, WalletError

try:
    # Some operation
    pass
except Exception as e:
    logger.error(
        "Failed to connect wallet",
        error=e,
        operation="connect_wallet",
        user_id="user123",
        wallet_address="addr_test1..."
    )
```

### Log Management

```python
from app.core.cardano_errors import logger, LogLevel

# Get all logs
all_logs = logger.get_logs()

# Filter by level
error_logs = logger.get_logs_by_level(LogLevel.ERROR)

# Export logs
exported = logger.export_logs()  # Returns list of dicts

# Clear logs
logger.clear_logs()
```

## Retry Mechanism

Automatically retry operations with exponential backoff:

```python
from app.core.cardano_errors import retry_with_backoff, RetryConfig, is_retryable_error

async def fetch_data():
    # Your async operation
    pass

# Use default retry config (3 attempts, 1s initial delay)
result = await retry_with_backoff(fetch_data)

# Custom retry config
config = RetryConfig(
    max_attempts=5,
    initial_delay=2.0,
    max_delay=30.0,
    backoff_multiplier=2.0
)
result = await retry_with_backoff(fetch_data, config=config)

# Custom retry logic
def should_retry(error: Exception) -> bool:
    return is_retryable_error(error) and some_other_condition

result = await retry_with_backoff(
    fetch_data,
    config=config,
    should_retry=should_retry
)
```

### Retryable Errors

By default, these errors are retried:

- Network errors (TransactionError.NETWORK_ERROR)
- Blockfrost rate limits (BlockfrostError.RATE_LIMIT_EXCEEDED)
- Blockfrost server errors (BlockfrostError.SERVER_ERROR)
- Connection timeouts (WalletError.CONNECTION_TIMEOUT)

These errors are NOT retried:

- User rejections (WalletError.USER_REJECTED, TransactionError.USER_REJECTED)
- Wallet not installed (WalletError.NOT_INSTALLED)
- Authentication failures (BlockfrostError.AUTHENTICATION_FAILED)
- Invalid addresses (TransactionError.INVALID_ADDRESS)

## Best Practices

### 1. Always Add Context

```python
# Good
logger.error(
    "Transaction failed",
    error=error,
    operation="transfer_token",
    user_id=user.id,
    wallet_address=wallet.address,
    transaction_id=tx_hash
)

# Bad
logger.error("Transaction failed")
```

### 2. Use Factory Methods

```python
# Good
error = WalletError.not_installed("nami")

# Less good
error = WalletError(WalletErrorCode.NOT_INSTALLED, "nami wallet is not installed")
```

### 3. Normalize External Errors

```python
try:
    external_library.do_something()
except Exception as e:
    # Normalize to CardanoError for consistent handling
    cardano_error = normalize_error(e)
    logger.error("External operation failed", error=cardano_error)
    raise cardano_error
```

### 4. Use Retry for Transient Errors

```python
# Good - automatically retries network errors
result = await retry_with_backoff(fetch_from_blockfrost)

# Bad - fails immediately on transient errors
result = await fetch_from_blockfrost()
```

### 5. Log at Appropriate Levels

- **DEBUG**: Detailed information for debugging
- **INFO**: General informational messages (successful operations)
- **WARNING**: Warning messages (approaching limits, deprecated features)
- **ERROR**: Error messages (operation failed but system continues)
- **CRITICAL**: Critical errors (system-level failures, API down)

## Testing

Property-based tests validate that error logging captures complete details:

```bash
python backend/tests/run_error_logging_test.py
```

The tests verify:

- All error types log complete details
- Context is preserved through logging
- Error normalization works correctly
- Log filtering and export work as expected
- Timestamps are valid ISO format

## Integration Example

Complete example of error handling in a Cardano operation:

```python
from app.core.cardano_errors import (
    logger,
    TransactionError,
    BlockfrostError,
    normalize_error,
    retry_with_backoff,
    RetryConfig
)

async def mint_token(user_id: str, wallet_address: str, metadata: dict):
    """Mint a token with proper error handling"""

    logger.info(
        "Starting token minting",
        operation="mint_token",
        user_id=user_id,
        wallet_address=wallet_address
    )

    try:
        # Validate metadata
        if not metadata.get("name"):
            raise TransactionError.invalid_metadata("name is required")

        # Build transaction with retry
        config = RetryConfig(max_attempts=3, initial_delay=1.0)

        async def build_tx():
            # Build transaction logic
            return await cardano_client.build_mint_transaction(metadata)

        tx = await retry_with_backoff(build_tx, config=config)

        logger.info(
            "Transaction built successfully",
            operation="mint_token",
            user_id=user_id,
            transaction_id=tx.hash
        )

        return tx

    except TransactionError as e:
        logger.error(
            "Failed to mint token",
            error=e,
            operation="mint_token",
            user_id=user_id,
            wallet_address=wallet_address
        )
        raise

    except BlockfrostError as e:
        logger.critical(
            "Blockfrost API error during minting",
            error=e,
            operation="mint_token",
            user_id=user_id
        )
        raise

    except Exception as e:
        # Normalize unexpected errors
        cardano_error = normalize_error(e)
        logger.error(
            "Unexpected error during minting",
            error=cardano_error,
            operation="mint_token",
            user_id=user_id,
            wallet_address=wallet_address
        )
        raise cardano_error
```

## Frontend Integration

The frontend has equivalent error handling utilities in `frontend/lib/cardano-errors.ts`. See that file for TypeScript/JavaScript usage.
