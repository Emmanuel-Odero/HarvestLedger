"""
Property-based test for Cardano error logging.

Feature: cardano-integration, Property 50: Errors log complete details
Validates: Requirements 12.2
"""

import pytest
from hypothesis import given, strategies as st, settings
from datetime import datetime
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.cardano_errors import (
    CardanoError,
    WalletError,
    TransactionError,
    BlockfrostError,
    DatabaseError,
    WalletErrorCode,
    TransactionErrorCode,
    BlockfrostErrorCode,
    DatabaseErrorCode,
    CardanoLogger,
    LogLevel,
    normalize_error
)


# Custom strategies for generating errors
@st.composite
def wallet_error_strategy(draw):
    """Generate random wallet errors"""
    code = draw(st.sampled_from(list(WalletErrorCode)))
    message = draw(st.text(min_size=1, max_size=100))
    details = draw(st.one_of(
        st.none(),
        st.dictionaries(
            keys=st.text(min_size=1, max_size=20),
            values=st.one_of(st.text(max_size=50), st.integers(), st.booleans()),
            max_size=5
        )
    ))
    return WalletError(code, message, details)


@st.composite
def transaction_error_strategy(draw):
    """Generate random transaction errors"""
    code = draw(st.sampled_from(list(TransactionErrorCode)))
    message = draw(st.text(min_size=1, max_size=100))
    tx_data = draw(st.one_of(
        st.none(),
        st.dictionaries(
            keys=st.text(min_size=1, max_size=20),
            values=st.one_of(st.text(max_size=50), st.integers(), st.booleans()),
            max_size=5
        )
    ))
    return TransactionError(code, message, tx_data)


@st.composite
def blockfrost_error_strategy(draw):
    """Generate random Blockfrost errors"""
    code = draw(st.sampled_from(list(BlockfrostErrorCode)))
    message = draw(st.text(min_size=1, max_size=100))
    status_code = draw(st.one_of(st.none(), st.integers(min_value=400, max_value=599)))
    details = draw(st.one_of(
        st.none(),
        st.dictionaries(
            keys=st.text(min_size=1, max_size=20),
            values=st.one_of(st.text(max_size=50), st.integers(), st.booleans()),
            max_size=5
        )
    ))
    return BlockfrostError(code, message, status_code, details)


@st.composite
def log_context_strategy(draw):
    """Generate random log context"""
    operation = draw(st.one_of(st.none(), st.text(min_size=1, max_size=50)))
    user_id = draw(st.one_of(st.none(), st.text(min_size=1, max_size=30)))
    wallet_address = draw(st.one_of(st.none(), st.text(min_size=1, max_size=100)))
    transaction_id = draw(st.one_of(st.none(), st.text(min_size=1, max_size=64)))
    
    return {
        'operation': operation,
        'user_id': user_id,
        'wallet_address': wallet_address,
        'transaction_id': transaction_id
    }


class TestErrorLogging:
    """
    Property-based tests for error logging.
    
    Feature: cardano-integration, Property 50: Errors log complete details
    Validates: Requirements 12.2
    """
    
    def setup_method(self):
        """Clear logs before each test"""
        logger = CardanoLogger()
        logger.clear_logs()
    
    @given(
        error=wallet_error_strategy(),
        context=log_context_strategy()
    )
    @settings(max_examples=100)
    def test_wallet_error_logs_complete_details(self, error: WalletError, context: dict):
        """
        Property: For any wallet error, logging it should capture all error details
        including error type, code, message, timestamp, and context.
        
        This validates that error logging provides complete information for debugging.
        """
        logger = CardanoLogger()
        
        # Log the error
        logger.error(
            "Test wallet error",
            error=error,
            **context
        )
        
        # Get the logged entry
        logs = logger.get_logs()
        assert len(logs) > 0, "Should have at least one log entry"
        
        log_entry = logs[-1]  # Get the most recent log
        
        # Verify log level
        assert log_entry.level == LogLevel.ERROR
        
        # Verify message is present
        assert log_entry.message == "Test wallet error"
        
        # Verify timestamp is present and valid
        assert log_entry.timestamp is not None
        assert isinstance(log_entry.timestamp, str)
        # Verify it's a valid ISO timestamp
        datetime.fromisoformat(log_entry.timestamp.replace('Z', '+00:00'))
        
        # Verify context fields are captured
        if context['operation']:
            assert log_entry.operation == context['operation']
        if context['user_id']:
            assert log_entry.user_id == context['user_id']
        if context['wallet_address']:
            assert log_entry.wallet_address == context['wallet_address']
        if context['transaction_id']:
            assert log_entry.transaction_id == context['transaction_id']
        
        # Verify error details are captured
        assert log_entry.error is not None
        error_dict = log_entry.error
        
        # Verify error contains all required fields
        assert 'name' in error_dict
        assert 'message' in error_dict
        assert 'code' in error_dict
        assert 'timestamp' in error_dict
        
        # Verify error details match original error
        assert error_dict['name'] == 'WalletError'
        assert error_dict['message'] == error.message
        assert error_dict['code'] == error.code.value
    
    @given(
        error=transaction_error_strategy(),
        context=log_context_strategy()
    )
    @settings(max_examples=100)
    def test_transaction_error_logs_complete_details(self, error: TransactionError, context: dict):
        """
        Property: For any transaction error, logging it should capture all error details
        including transaction data and context.
        """
        logger = CardanoLogger()
        
        # Log the error
        logger.error(
            "Test transaction error",
            error=error,
            **context
        )
        
        # Get the logged entry
        logs = logger.get_logs()
        assert len(logs) > 0
        
        log_entry = logs[-1]
        
        # Verify basic log structure
        assert log_entry.level == LogLevel.ERROR
        assert log_entry.message == "Test transaction error"
        assert log_entry.timestamp is not None
        
        # Verify error details
        assert log_entry.error is not None
        error_dict = log_entry.error
        
        assert error_dict['name'] == 'TransactionError'
        assert error_dict['message'] == error.message
        assert error_dict['code'] == error.code.value
        
        # Verify transaction data is captured if present
        if error.tx_data:
            assert 'details' in error_dict
            assert error_dict['details'] == error.tx_data
    
    @given(
        error=blockfrost_error_strategy(),
        context=log_context_strategy()
    )
    @settings(max_examples=100)
    def test_blockfrost_error_logs_complete_details(self, error: BlockfrostError, context: dict):
        """
        Property: For any Blockfrost error, logging it should capture all error details
        including status code and API response.
        """
        logger = CardanoLogger()
        
        # Log the error
        logger.critical(
            "Test Blockfrost error",
            error=error,
            **context
        )
        
        # Get the logged entry
        logs = logger.get_logs()
        assert len(logs) > 0
        
        log_entry = logs[-1]
        
        # Verify log level
        assert log_entry.level == LogLevel.CRITICAL
        
        # Verify error details
        assert log_entry.error is not None
        error_dict = log_entry.error
        
        assert error_dict['name'] == 'BlockfrostError'
        assert error_dict['message'] == error.message
        assert error_dict['code'] == error.code.value
        
        # Verify status code is captured if present
        if error.status_code:
            assert 'context' in error_dict
            assert 'status_code' in error_dict['context']
            assert error_dict['context']['status_code'] == error.status_code
    
    @given(
        level=st.sampled_from(list(LogLevel)),
        message=st.text(min_size=1, max_size=100),
        context=log_context_strategy()
    )
    @settings(max_examples=100)
    def test_all_log_levels_capture_complete_details(self, level: LogLevel, message: str, context: dict):
        """
        Property: For any log level, logging should capture complete details
        including level, message, timestamp, and context.
        """
        logger = CardanoLogger()
        
        # Log at the specified level
        logger.log(
            level=level,
            message=message,
            **context
        )
        
        # Get the logged entry
        logs = logger.get_logs()
        assert len(logs) > 0
        
        log_entry = logs[-1]
        
        # Verify all required fields are present
        assert log_entry.level == level
        assert log_entry.message == message
        assert log_entry.timestamp is not None
        
        # Verify timestamp is valid ISO format
        datetime.fromisoformat(log_entry.timestamp.replace('Z', '+00:00'))
        
        # Verify context is captured
        if context['operation']:
            assert log_entry.operation == context['operation']
        if context['user_id']:
            assert log_entry.user_id == context['user_id']
        if context['wallet_address']:
            assert log_entry.wallet_address == context['wallet_address']
        if context['transaction_id']:
            assert log_entry.transaction_id == context['transaction_id']
    
    @given(error=st.one_of(
        wallet_error_strategy(),
        transaction_error_strategy(),
        blockfrost_error_strategy()
    ))
    @settings(max_examples=100)
    def test_error_to_dict_includes_all_fields(self, error: CardanoError):
        """
        Property: For any CardanoError, converting to dict should include
        all error fields for complete logging.
        """
        error_dict = error.to_dict()
        
        # Verify all required fields are present
        assert 'name' in error_dict
        assert 'message' in error_dict
        assert 'code' in error_dict
        assert 'timestamp' in error_dict
        assert 'context' in error_dict
        assert 'details' in error_dict
        assert 'traceback' in error_dict
        
        # Verify field types
        assert isinstance(error_dict['name'], str)
        assert isinstance(error_dict['message'], str)
        assert isinstance(error_dict['code'], str)
        assert isinstance(error_dict['timestamp'], str)
        assert isinstance(error_dict['context'], dict)
        
        # Verify timestamp is valid
        datetime.fromisoformat(error_dict['timestamp'].replace('Z', '+00:00'))
    
    @given(
        error=wallet_error_strategy(),
        context_key=st.text(min_size=1, max_size=20),
        context_value=st.one_of(st.text(max_size=50), st.integers(), st.booleans())
    )
    @settings(max_examples=100)
    def test_error_context_is_preserved(self, error: CardanoError, context_key: str, context_value):
        """
        Property: For any error with added context, the context should be
        preserved in the error dictionary.
        """
        # Add context to error
        error.add_context(context_key, context_value)
        
        # Convert to dict
        error_dict = error.to_dict()
        
        # Verify context is preserved
        assert 'context' in error_dict
        assert context_key in error_dict['context']
        assert error_dict['context'][context_key] == context_value
    
    def test_log_export_includes_all_entries(self):
        """
        Test that exporting logs includes all logged entries with complete details.
        """
        logger = CardanoLogger()
        logger.clear_logs()
        
        # Log multiple entries
        logger.info("Info message", operation="test_op", user_id="user123")
        logger.warning("Warning message", wallet_address="addr_test123")
        logger.error("Error message", error=WalletError.not_installed("nami"))
        
        # Export logs
        exported = logger.export_logs()
        
        # Verify all entries are present
        assert len(exported) == 3
        
        # Verify each entry has complete details
        for entry in exported:
            assert 'level' in entry
            assert 'timestamp' in entry
            assert 'message' in entry
            
            # Verify timestamp is valid
            datetime.fromisoformat(entry['timestamp'].replace('Z', '+00:00'))
    
    def test_log_filtering_by_level(self):
        """
        Test that logs can be filtered by level while preserving complete details.
        """
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
        
        # Verify filtering works
        assert len(error_logs) == 1
        assert error_logs[0].level == LogLevel.ERROR
        assert error_logs[0].message == "Error message"
        
        # Verify complete details are preserved
        assert error_logs[0].timestamp is not None
        datetime.fromisoformat(error_logs[0].timestamp.replace('Z', '+00:00'))
    
    @given(
        exception_message=st.text(min_size=1, max_size=100)
    )
    @settings(max_examples=100)
    def test_normalize_error_preserves_details(self, exception_message: str):
        """
        Property: For any exception, normalizing it to CardanoError should
        preserve the original error details.
        """
        # Create a standard exception
        original_error = Exception(exception_message)
        
        # Normalize it
        normalized = normalize_error(original_error)
        
        # Verify it's a CardanoError
        assert isinstance(normalized, CardanoError)
        
        # Verify details are preserved
        assert normalized.message == exception_message
        assert 'original_error' in normalized.details
        
        # Verify it can be logged with complete details
        logger = CardanoLogger()
        logger.error("Normalized error", error=normalized)
        
        logs = logger.get_logs()
        assert len(logs) > 0
        
        log_entry = logs[-1]
        assert log_entry.error is not None
        assert log_entry.error['message'] == exception_message


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
