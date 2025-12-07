"""
Simple test runner for error logging tests without pytest.main()
"""

import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.cardano_errors import (
    CardanoError,
    WalletError,
    TransactionError,
    BlockfrostError,
    WalletErrorCode,
    TransactionErrorCode,
    BlockfrostErrorCode,
    CardanoLogger,
    LogLevel,
    normalize_error
)
from datetime import datetime


def test_basic_error_logging():
    """Test basic error logging functionality"""
    print("Testing basic error logging...")
    
    logger = CardanoLogger()
    logger.clear_logs()
    
    # Create a wallet error
    error = WalletError.not_installed("nami")
    
    # Log it
    logger.error(
        "Test wallet error",
        error=error,
        operation="connect_wallet",
        user_id="user123",
        wallet_address="addr_test1..."
    )
    
    # Get logs
    logs = logger.get_logs()
    assert len(logs) == 1, f"Expected 1 log, got {len(logs)}"
    
    log_entry = logs[0]
    
    # Verify log structure
    assert log_entry.level == LogLevel.ERROR
    assert log_entry.message == "Test wallet error"
    assert log_entry.operation == "connect_wallet"
    assert log_entry.user_id == "user123"
    assert log_entry.wallet_address == "addr_test1..."
    assert log_entry.timestamp is not None
    
    # Verify error details
    assert log_entry.error is not None
    error_dict = log_entry.error
    assert error_dict['name'] == 'WalletError'
    assert error_dict['code'] == WalletErrorCode.NOT_INSTALLED.value
    assert 'nami' in error_dict['message']
    
    print("✅ Basic error logging test passed")


def test_transaction_error_logging():
    """Test transaction error logging"""
    print("Testing transaction error logging...")
    
    logger = CardanoLogger()
    logger.clear_logs()
    
    # Create a transaction error
    error = TransactionError.insufficient_funds("1000000", "500000")
    
    # Log it
    logger.error(
        "Transaction failed",
        error=error,
        operation="transfer_token",
        transaction_id="tx_hash_123"
    )
    
    # Get logs
    logs = logger.get_logs()
    assert len(logs) == 1
    
    log_entry = logs[0]
    
    # Verify error details
    assert log_entry.error is not None
    error_dict = log_entry.error
    assert error_dict['name'] == 'TransactionError'
    assert error_dict['code'] == TransactionErrorCode.INSUFFICIENT_FUNDS.value
    assert log_entry.transaction_id == "tx_hash_123"
    
    print("✅ Transaction error logging test passed")


def test_blockfrost_error_logging():
    """Test Blockfrost error logging"""
    print("Testing Blockfrost error logging...")
    
    logger = CardanoLogger()
    logger.clear_logs()
    
    # Create a Blockfrost error
    error = BlockfrostError.rate_limit_exceeded(retry_after=60)
    
    # Log it
    logger.critical(
        "Blockfrost rate limit exceeded",
        error=error,
        operation="query_address"
    )
    
    # Get logs
    logs = logger.get_logs()
    assert len(logs) == 1
    
    log_entry = logs[0]
    
    # Verify log level
    assert log_entry.level == LogLevel.CRITICAL
    
    # Verify error details
    assert log_entry.error is not None
    error_dict = log_entry.error
    assert error_dict['name'] == 'BlockfrostError'
    assert error_dict['code'] == BlockfrostErrorCode.RATE_LIMIT_EXCEEDED.value
    assert error_dict['context']['status_code'] == 429
    
    print("✅ Blockfrost error logging test passed")


def test_error_to_dict():
    """Test error to dict conversion"""
    print("Testing error to dict conversion...")
    
    # Create various errors
    wallet_error = WalletError.user_rejected("wallet connection")
    tx_error = TransactionError.build_failed("invalid metadata")
    bf_error = BlockfrostError.authentication_failed()
    
    # Convert to dict
    wallet_dict = wallet_error.to_dict()
    tx_dict = tx_error.to_dict()
    bf_dict = bf_error.to_dict()
    
    # Verify all required fields
    for error_dict in [wallet_dict, tx_dict, bf_dict]:
        assert 'name' in error_dict
        assert 'message' in error_dict
        assert 'code' in error_dict
        assert 'timestamp' in error_dict
        assert 'context' in error_dict
        assert 'details' in error_dict
        assert 'traceback' in error_dict
        
        # Verify timestamp is valid
        datetime.fromisoformat(error_dict['timestamp'].replace('Z', '+00:00'))
    
    print("✅ Error to dict test passed")


def test_error_context():
    """Test error context preservation"""
    print("Testing error context...")
    
    error = WalletError.not_installed("eternl")
    
    # Add context
    error.add_context("browser", "Chrome")
    error.add_context("version", "1.2.3")
    error.add_context("user_agent", "Mozilla/5.0...")
    
    # Convert to dict
    error_dict = error.to_dict()
    
    # Verify context is preserved
    assert 'context' in error_dict
    assert error_dict['context']['browser'] == "Chrome"
    assert error_dict['context']['version'] == "1.2.3"
    assert error_dict['context']['user_agent'] == "Mozilla/5.0..."
    
    print("✅ Error context test passed")


def test_normalize_error():
    """Test error normalization"""
    print("Testing error normalization...")
    
    # Test with standard exception
    std_error = Exception("Network timeout occurred")
    normalized = normalize_error(std_error)
    
    assert isinstance(normalized, CardanoError)
    assert normalized.message == "Network timeout occurred"
    assert 'original_error' in normalized.details
    
    # Test with wallet-related error
    wallet_msg_error = Exception("wallet not installed")
    normalized_wallet = normalize_error(wallet_msg_error)
    
    assert isinstance(normalized_wallet, WalletError)
    
    # Test with rejection error
    rejection_error = Exception("User rejected the request")
    normalized_rejection = normalize_error(rejection_error)
    
    assert isinstance(normalized_rejection, WalletError)
    assert normalized_rejection.code == WalletErrorCode.USER_REJECTED.value
    
    print("✅ Error normalization test passed")


def test_log_filtering():
    """Test log filtering by level"""
    print("Testing log filtering...")
    
    logger = CardanoLogger()
    logger.clear_logs()
    
    # Log at different levels
    logger.debug("Debug message")
    logger.info("Info message")
    logger.warning("Warning message")
    logger.error("Error message")
    logger.critical("Critical message")
    
    # Filter by level
    error_logs = logger.get_logs_by_level(LogLevel.ERROR)
    warning_logs = logger.get_logs_by_level(LogLevel.WARNING)
    
    assert len(error_logs) == 1
    assert error_logs[0].message == "Error message"
    
    assert len(warning_logs) == 1
    assert warning_logs[0].message == "Warning message"
    
    # Get all logs
    all_logs = logger.get_logs()
    assert len(all_logs) == 5
    
    print("✅ Log filtering test passed")


def test_log_export():
    """Test log export functionality"""
    print("Testing log export...")
    
    logger = CardanoLogger()
    logger.clear_logs()
    
    # Log some entries
    logger.info("Info message", operation="test_op")
    logger.warning("Warning message", user_id="user123")
    logger.error("Error message", error=WalletError.not_installed("nami"))
    
    # Export logs
    exported = logger.export_logs()
    
    # Verify export
    assert len(exported) == 3
    
    for entry in exported:
        assert 'level' in entry
        assert 'timestamp' in entry
        assert 'message' in entry
        
        # Verify timestamp is valid
        datetime.fromisoformat(entry['timestamp'].replace('Z', '+00:00'))
    
    print("✅ Log export test passed")


def run_all_tests():
    """Run all tests"""
    print("\n" + "="*60)
    print("Running Error Logging Tests")
    print("="*60 + "\n")
    
    tests = [
        test_basic_error_logging,
        test_transaction_error_logging,
        test_blockfrost_error_logging,
        test_error_to_dict,
        test_error_context,
        test_normalize_error,
        test_log_filtering,
        test_log_export,
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        try:
            test()
            passed += 1
        except Exception as e:
            print(f"❌ {test.__name__} failed: {e}")
            failed += 1
            import traceback
            traceback.print_exc()
    
    print("\n" + "="*60)
    print(f"Test Results: {passed} passed, {failed} failed")
    print("="*60 + "\n")
    
    return failed == 0


if __name__ == '__main__':
    success = run_all_tests()
    sys.exit(0 if success else 1)
