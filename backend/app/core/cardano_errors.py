"""
Cardano Error Handling Utilities

Centralized error handling for Cardano blockchain operations.
Provides error types, normalization, and structured logging.

Requirements: 12.2, 12.3, 12.4
"""

import logging
import traceback
from datetime import datetime
from enum import Enum
from typing import Optional, Dict, Any, List
from dataclasses import dataclass, field, asdict


# ============================================================================
# Error Code Enums
# ============================================================================

class WalletErrorCode(str, Enum):
    """Wallet-related error codes"""
    NOT_INSTALLED = "WALLET_NOT_INSTALLED"
    USER_REJECTED = "USER_REJECTED"
    NETWORK_MISMATCH = "NETWORK_MISMATCH"
    CONNECTION_TIMEOUT = "CONNECTION_TIMEOUT"
    UNKNOWN = "UNKNOWN_ERROR"


class TransactionErrorCode(str, Enum):
    """Transaction-related error codes"""
    INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS"
    INVALID_ADDRESS = "INVALID_ADDRESS"
    USER_REJECTED = "USER_REJECTED"
    NETWORK_ERROR = "NETWORK_ERROR"
    INVALID_METADATA = "INVALID_METADATA"
    BUILD_FAILED = "BUILD_FAILED"
    SUBMISSION_FAILED = "SUBMISSION_FAILED"
    UNKNOWN = "UNKNOWN_ERROR"


class BlockfrostErrorCode(str, Enum):
    """Blockfrost API error codes"""
    AUTHENTICATION_FAILED = "AUTHENTICATION_FAILED"
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED"
    NETWORK_ERROR = "NETWORK_ERROR"
    INVALID_REQUEST = "INVALID_REQUEST"
    NOT_FOUND = "NOT_FOUND"
    SERVER_ERROR = "SERVER_ERROR"
    UNKNOWN = "UNKNOWN_ERROR"


class DatabaseErrorCode(str, Enum):
    """Database operation error codes"""
    CONNECTION_FAILED = "CONNECTION_FAILED"
    CONSTRAINT_VIOLATION = "CONSTRAINT_VIOLATION"
    TRANSACTION_FAILED = "TRANSACTION_FAILED"
    QUERY_FAILED = "QUERY_FAILED"
    UNKNOWN = "UNKNOWN_ERROR"


# ============================================================================
# Error Classes
# ============================================================================

class CardanoError(Exception):
    """Base class for all Cardano-related errors"""
    
    def __init__(
        self,
        message: str,
        code: str,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(message)
        self.message = message
        self.code = code
        self.details = details or {}
        self.timestamp = datetime.utcnow().isoformat()
        self.context: Dict[str, Any] = {}
    
    def add_context(self, key: str, value: Any) -> 'CardanoError':
        """Add contextual information to the error"""
        self.context[key] = value
        return self
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert error to dictionary for logging"""
        return {
            'name': self.__class__.__name__,
            'message': self.message,
            'code': self.code,
            'timestamp': self.timestamp,
            'context': self.context,
            'details': self.details,
            'traceback': traceback.format_exc()
        }


class WalletError(CardanoError):
    """Wallet connection and operation errors"""
    
    def __init__(
        self,
        code: WalletErrorCode,
        message: str,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(message, code.value, details)
    
    @classmethod
    def not_installed(cls, wallet_name: str) -> 'WalletError':
        """Create a WalletError for wallet not installed"""
        return cls(
            WalletErrorCode.NOT_INSTALLED,
            f"{wallet_name} wallet is not installed",
            {'wallet_name': wallet_name}
        )
    
    @classmethod
    def user_rejected(cls, operation: str) -> 'WalletError':
        """Create a WalletError for user rejection"""
        return cls(
            WalletErrorCode.USER_REJECTED,
            f"{operation} was rejected by user",
            {'operation': operation}
        )
    
    @classmethod
    def network_mismatch(cls, expected: str, actual: str) -> 'WalletError':
        """Create a WalletError for network mismatch"""
        return cls(
            WalletErrorCode.NETWORK_MISMATCH,
            f"Network mismatch. Expected {expected}, but wallet is on {actual}",
            {'expected': expected, 'actual': actual}
        )
    
    @classmethod
    def connection_timeout(cls) -> 'WalletError':
        """Create a WalletError for connection timeout"""
        return cls(
            WalletErrorCode.CONNECTION_TIMEOUT,
            "Wallet connection timed out"
        )


class TransactionError(CardanoError):
    """Transaction building and submission errors"""
    
    def __init__(
        self,
        code: TransactionErrorCode,
        message: str,
        tx_data: Optional[Dict[str, Any]] = None
    ):
        super().__init__(message, code.value, tx_data)
        self.tx_data = tx_data
    
    @classmethod
    def insufficient_funds(cls, required: str, available: str) -> 'TransactionError':
        """Create a TransactionError for insufficient funds"""
        return cls(
            TransactionErrorCode.INSUFFICIENT_FUNDS,
            f"Insufficient funds. Required: {required}, Available: {available}",
            {'required': required, 'available': available}
        )
    
    @classmethod
    def invalid_address(cls, address: str) -> 'TransactionError':
        """Create a TransactionError for invalid address"""
        return cls(
            TransactionErrorCode.INVALID_ADDRESS,
            f"Invalid Cardano address: {address}",
            {'address': address}
        )
    
    @classmethod
    def user_rejected(cls, tx_type: str) -> 'TransactionError':
        """Create a TransactionError for user rejection"""
        return cls(
            TransactionErrorCode.USER_REJECTED,
            f"Transaction {tx_type} was rejected by user",
            {'tx_type': tx_type}
        )
    
    @classmethod
    def network_error(cls, operation: str) -> 'TransactionError':
        """Create a TransactionError for network errors"""
        return cls(
            TransactionErrorCode.NETWORK_ERROR,
            f"Network error during {operation}",
            {'operation': operation}
        )
    
    @classmethod
    def invalid_metadata(cls, reason: str) -> 'TransactionError':
        """Create a TransactionError for invalid metadata"""
        return cls(
            TransactionErrorCode.INVALID_METADATA,
            f"Invalid transaction metadata: {reason}",
            {'reason': reason}
        )
    
    @classmethod
    def build_failed(cls, reason: str) -> 'TransactionError':
        """Create a TransactionError for build failures"""
        return cls(
            TransactionErrorCode.BUILD_FAILED,
            f"Failed to build transaction: {reason}",
            {'reason': reason}
        )


class BlockfrostError(CardanoError):
    """Blockfrost API errors"""
    
    def __init__(
        self,
        code: BlockfrostErrorCode,
        message: str,
        status_code: Optional[int] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(message, code.value, details)
        self.status_code = status_code
        if status_code:
            self.add_context('status_code', status_code)
    
    @classmethod
    def from_status_code(
        cls,
        status_code: int,
        response_body: Optional[Dict[str, Any]] = None
    ) -> 'BlockfrostError':
        """Create a BlockfrostError from HTTP status code"""
        if status_code in (401, 403):
            return cls(
                BlockfrostErrorCode.AUTHENTICATION_FAILED,
                "Blockfrost authentication failed. Please check your API key.",
                status_code,
                response_body
            )
        elif status_code == 429:
            return cls(
                BlockfrostErrorCode.RATE_LIMIT_EXCEEDED,
                "Blockfrost rate limit exceeded. Please try again later.",
                status_code,
                response_body
            )
        elif status_code == 404:
            return cls(
                BlockfrostErrorCode.NOT_FOUND,
                "Resource not found on Blockfrost API",
                status_code,
                response_body
            )
        elif status_code == 400:
            return cls(
                BlockfrostErrorCode.INVALID_REQUEST,
                "Invalid request to Blockfrost API",
                status_code,
                response_body
            )
        elif status_code >= 500:
            return cls(
                BlockfrostErrorCode.SERVER_ERROR,
                "Blockfrost server error. Please try again later.",
                status_code,
                response_body
            )
        else:
            return cls(
                BlockfrostErrorCode.UNKNOWN,
                f"Blockfrost API error with status {status_code}",
                status_code,
                response_body
            )
    
    @classmethod
    def authentication_failed(cls) -> 'BlockfrostError':
        """Create a BlockfrostError for authentication failures"""
        return cls(
            BlockfrostErrorCode.AUTHENTICATION_FAILED,
            "Blockfrost authentication failed. Please check your API key.",
            401
        )
    
    @classmethod
    def rate_limit_exceeded(cls, retry_after: Optional[int] = None) -> 'BlockfrostError':
        """Create a BlockfrostError for rate limiting"""
        message = (
            f"Rate limit exceeded. Retry after {retry_after} seconds."
            if retry_after
            else "Rate limit exceeded. Please try again later."
        )
        return cls(
            BlockfrostErrorCode.RATE_LIMIT_EXCEEDED,
            message,
            429,
            {'retry_after': retry_after} if retry_after else None
        )


class DatabaseError(CardanoError):
    """Database operation errors"""
    
    def __init__(
        self,
        code: DatabaseErrorCode,
        operation: str,
        message: str,
        original_error: Optional[Exception] = None
    ):
        super().__init__(message, code.value, {'operation': operation})
        self.operation = operation
        self.original_error = original_error
        if original_error:
            self.add_context('original_error', str(original_error))


# ============================================================================
# Error Normalization
# ============================================================================

def normalize_error(error: Exception) -> CardanoError:
    """
    Normalize any error to a CardanoError
    Requirements: 12.4
    """
    # Already a CardanoError
    if isinstance(error, CardanoError):
        return error
    
    error_msg = str(error).lower()
    
    # Check for wallet-related errors
    if 'wallet' in error_msg or 'not installed' in error_msg:
        return WalletError(
            WalletErrorCode.UNKNOWN,
            str(error),
            {'original_error': error}
        )
    
    # Check for user rejection
    if any(word in error_msg for word in ['rejected', 'declined', 'cancelled']):
        return WalletError(
            WalletErrorCode.USER_REJECTED,
            str(error),
            {'original_error': error}
        )
    
    # Check for network errors
    if any(word in error_msg for word in ['network', 'timeout', 'connection']):
        return TransactionError(
            TransactionErrorCode.NETWORK_ERROR,
            str(error),
            {'original_error': error}
        )
    
    # Check for insufficient funds
    if 'insufficient' in error_msg or 'balance' in error_msg:
        return TransactionError(
            TransactionErrorCode.INSUFFICIENT_FUNDS,
            str(error),
            {'original_error': error}
        )
    
    # Check for Blockfrost errors
    if 'blockfrost' in error_msg or 'api' in error_msg:
        return BlockfrostError(
            BlockfrostErrorCode.UNKNOWN,
            str(error),
            details={'original_error': error}
        )
    
    # Generic error
    return CardanoError(str(error), "UNKNOWN_ERROR", {'original_error': error})


# ============================================================================
# Structured Logging
# ============================================================================

class LogLevel(str, Enum):
    """Log levels for structured logging"""
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"


@dataclass
class LogEntry:
    """Structured log entry"""
    level: LogLevel
    timestamp: str
    message: str
    operation: Optional[str] = None
    user_id: Optional[str] = None
    wallet_address: Optional[str] = None
    transaction_id: Optional[str] = None
    error: Optional[Dict[str, Any]] = None
    context: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {k: v for k, v in asdict(self).items() if v is not None}


class CardanoLogger:
    """
    Logger for Cardano operations
    Requirements: 12.2
    """
    
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        
        self._initialized = True
        self.logs: List[LogEntry] = []
        self.max_logs = 1000
        
        # Configure Python logging
        self.logger = logging.getLogger('cardano')
        self.logger.setLevel(logging.DEBUG)
        
        # Create console handler if not already present
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            handler.setLevel(logging.DEBUG)
            formatter = logging.Formatter(
                '[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s'
            )
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)
    
    def log(
        self,
        level: LogLevel,
        message: str,
        operation: Optional[str] = None,
        user_id: Optional[str] = None,
        wallet_address: Optional[str] = None,
        transaction_id: Optional[str] = None,
        error: Optional[Exception] = None,
        **context
    ) -> None:
        """Log a message with context"""
        # Create log entry
        error_dict = None
        if error:
            if isinstance(error, CardanoError):
                error_dict = error.to_dict()
            else:
                normalized = normalize_error(error)
                error_dict = normalized.to_dict()
        
        entry = LogEntry(
            level=level,
            timestamp=datetime.utcnow().isoformat(),
            message=message,
            operation=operation,
            user_id=user_id,
            wallet_address=wallet_address,
            transaction_id=transaction_id,
            error=error_dict,
            context=context
        )
        
        # Store log entry
        self.logs.append(entry)
        
        # Trim logs if exceeding max
        if len(self.logs) > self.max_logs:
            self.logs = self.logs[-self.max_logs:]
        
        # Log to Python logger
        log_message = message
        if operation:
            log_message = f"[{operation}] {message}"
        
        log_context = {
            'user_id': user_id,
            'wallet_address': wallet_address,
            'transaction_id': transaction_id,
            **context
        }
        
        if level == LogLevel.DEBUG:
            self.logger.debug(log_message, extra=log_context)
        elif level == LogLevel.INFO:
            self.logger.info(log_message, extra=log_context)
        elif level == LogLevel.WARNING:
            self.logger.warning(log_message, extra=log_context)
        elif level == LogLevel.ERROR:
            self.logger.error(log_message, extra=log_context, exc_info=error)
        elif level == LogLevel.CRITICAL:
            self.logger.critical(log_message, extra=log_context, exc_info=error)
    
    def debug(self, message: str, **context) -> None:
        """Log debug message"""
        self.log(LogLevel.DEBUG, message, **context)
    
    def info(self, message: str, **context) -> None:
        """Log info message"""
        self.log(LogLevel.INFO, message, **context)
    
    def warning(self, message: str, **context) -> None:
        """Log warning message"""
        self.log(LogLevel.WARNING, message, **context)
    
    def error(self, message: str, error: Optional[Exception] = None, **context) -> None:
        """Log error message"""
        self.log(LogLevel.ERROR, message, error=error, **context)
    
    def critical(self, message: str, error: Optional[Exception] = None, **context) -> None:
        """Log critical error message"""
        self.log(LogLevel.CRITICAL, message, error=error, **context)
    
    def get_logs(self) -> List[LogEntry]:
        """Get all logs"""
        return self.logs.copy()
    
    def get_logs_by_level(self, level: LogLevel) -> List[LogEntry]:
        """Get logs filtered by level"""
        return [log for log in self.logs if log.level == level]
    
    def clear_logs(self) -> None:
        """Clear all logs"""
        self.logs.clear()
    
    def export_logs(self) -> List[Dict[str, Any]]:
        """Export logs as list of dictionaries"""
        return [log.to_dict() for log in self.logs]


# Export singleton instance
logger = CardanoLogger()


# ============================================================================
# Error Recovery Utilities
# ============================================================================

import asyncio
from typing import Callable, TypeVar, Awaitable

T = TypeVar('T')


@dataclass
class RetryConfig:
    """Retry configuration"""
    max_attempts: int = 3
    initial_delay: float = 1.0
    max_delay: float = 10.0
    backoff_multiplier: float = 2.0


async def retry_with_backoff(
    operation: Callable[[], Awaitable[T]],
    config: Optional[RetryConfig] = None,
    should_retry: Optional[Callable[[Exception], bool]] = None
) -> T:
    """
    Retry an async operation with exponential backoff
    """
    if config is None:
        config = RetryConfig()
    
    if should_retry is None:
        should_retry = is_retryable_error
    
    last_error: Optional[Exception] = None
    delay = config.initial_delay
    
    for attempt in range(1, config.max_attempts + 1):
        try:
            return await operation()
        except Exception as error:
            last_error = error
            
            # Don't retry if should_retry returns False
            if not should_retry(error):
                raise
            
            # Don't retry on last attempt
            if attempt == config.max_attempts:
                break
            
            # Log retry attempt
            logger.warning(
                f"Operation failed, retrying (attempt {attempt}/{config.max_attempts})",
                error=error,
                delay=delay
            )
            
            # Wait before retrying
            await asyncio.sleep(delay)
            
            # Increase delay with exponential backoff
            delay = min(delay * config.backoff_multiplier, config.max_delay)
    
    raise last_error


def is_retryable_error(error: Exception) -> bool:
    """Check if an error is retryable"""
    if isinstance(error, WalletError):
        # Don't retry user rejections or wallet not installed
        return error.code not in (
            WalletErrorCode.USER_REJECTED,
            WalletErrorCode.NOT_INSTALLED
        )
    
    if isinstance(error, TransactionError):
        # Only retry network errors
        return error.code == TransactionErrorCode.NETWORK_ERROR
    
    if isinstance(error, BlockfrostError):
        # Retry network errors and rate limits, but not auth failures
        return error.code in (
            BlockfrostErrorCode.NETWORK_ERROR,
            BlockfrostErrorCode.RATE_LIMIT_EXCEEDED,
            BlockfrostErrorCode.SERVER_ERROR
        )
    
    # Default: retry network-related errors
    error_msg = str(error).lower()
    return any(word in error_msg for word in ['network', 'timeout', 'connection'])
