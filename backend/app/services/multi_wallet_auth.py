import secrets
import hashlib
import json
from datetime import datetime, timedelta
from typing import Optional, Dict, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.models.user import User
from app.models.user_wallet import UserWallet, UserSession, UserBehaviorPattern, WalletLinkingRequest
from app.core.wallet_auth import WalletAuthenticator
from app.core.auth import create_access_token


class DeviceFingerprinter:
    """Generate and analyze device fingerprints for user identification"""
    
    @staticmethod
    def generate_fingerprint(
        user_agent: str,
        screen_resolution: str,
        timezone: str,
        language: str,
        ip_address: str = None
    ) -> str:
        """Generate a device fingerprint from browser characteristics"""
        fingerprint_data = {
            'user_agent': user_agent,
            'screen_resolution': screen_resolution,
            'timezone': timezone,
            'language': language,
            'ip_address': ip_address
        }
        
        # Create a hash of the fingerprint data
        fingerprint_string = json.dumps(fingerprint_data, sort_keys=True)
        return hashlib.sha256(fingerprint_string.encode()).hexdigest()
    
    @staticmethod
    def calculate_similarity(fingerprint1: str, fingerprint2: str) -> float:
        """Calculate similarity between two fingerprints (simplified)"""
        if fingerprint1 == fingerprint2:
            return 1.0
        
        # In a real implementation, you'd compare individual components
        # For now, we'll use a simple approach
        return 0.0


class BehaviorAnalyzer:
    """Analyze user behavior patterns for identification"""
    
    @staticmethod
    def analyze_session_patterns(user_sessions: List[UserSession]) -> Dict:
        """Analyze user session patterns"""
        if not user_sessions:
            return {}
        
        # Calculate average session duration
        durations = []
        active_hours = []
        
        for session in user_sessions:
            if session.last_active_at and session.created_at:
                duration = (session.last_active_at - session.created_at).total_seconds()
                durations.append(duration)
                active_hours.append(session.created_at.hour)
        
        return {
            'avg_session_duration': sum(durations) / len(durations) if durations else 0,
            'common_active_hours': list(set(active_hours)),
            'session_count': len(user_sessions)
        }
    
    @staticmethod
    def calculate_pattern_similarity(pattern1: Dict, pattern2: Dict) -> float:
        """Calculate similarity between behavior patterns"""
        if not pattern1 or not pattern2:
            return 0.0
        
        # Simple similarity calculation based on session duration
        duration_diff = abs(
            pattern1.get('avg_session_duration', 0) - 
            pattern2.get('avg_session_duration', 0)
        )
        
        # Normalize to 0-1 scale (assuming max difference of 1 hour = 3600 seconds)
        duration_similarity = max(0, 1 - (duration_diff / 3600))
        
        # Check for common active hours
        hours1 = set(pattern1.get('common_active_hours', []))
        hours2 = set(pattern2.get('common_active_hours', []))
        
        if hours1 and hours2:
            hour_similarity = len(hours1.intersection(hours2)) / len(hours1.union(hours2))
        else:
            hour_similarity = 0.0
        
        # Weighted average
        return (duration_similarity * 0.6) + (hour_similarity * 0.4)


class MultiWalletAuthService:
    """Service for managing multi-wallet authentication and user identification"""
    
    def __init__(self, db: Session):
        self.db = db
        self.fingerprinter = DeviceFingerprinter()
        self.behavior_analyzer = BehaviorAnalyzer()
    
    async def authenticate_or_identify_user(
        self,
        wallet_address: str,
        signature: str,
        message: str,
        wallet_type: str,
        public_key: Optional[str] = None,
        device_info: Optional[Dict] = None
    ) -> Tuple[Optional[User], bool, Optional[str]]:
        """
        Authenticate wallet and identify user across multiple wallets
        Returns: (user, is_new_user, session_token)
        """
        
        # First, verify the wallet signature
        is_valid, hedera_account_id = await WalletAuthenticator.authenticate_wallet(
            wallet_address, signature, message, wallet_type, public_key
        )
        
        if not is_valid:
            return None, False, None
        
        # Check if this wallet is already linked to a user
        existing_wallet = self.db.query(UserWallet).filter(
            UserWallet.wallet_address == wallet_address
        ).first()
        
        if existing_wallet:
            # Update last used timestamp
            existing_wallet.last_used_at = datetime.utcnow()
            self.db.commit()
            
            # Create session
            session_token = await self._create_user_session(
                existing_wallet.user, existing_wallet, device_info
            )
            
            return existing_wallet.user, False, session_token
        
        # Wallet not found - try to identify user by fingerprinting and behavior
        potential_user = await self._identify_user_by_patterns(
            wallet_address, device_info
        )
        
        if potential_user:
            # Link this new wallet to the identified user
            new_wallet = UserWallet(
                user_id=potential_user.id,
                wallet_address=wallet_address,
                wallet_type=wallet_type,
                public_key=public_key,
                is_primary=False,  # Don't make it primary automatically
                first_used_at=datetime.utcnow(),
                last_used_at=datetime.utcnow()
            )
            
            self.db.add(new_wallet)
            self.db.commit()
            
            # Create session
            session_token = await self._create_user_session(
                potential_user, new_wallet, device_info
            )
            
            return potential_user, False, session_token
        
        # No existing user found - create new user
        new_user = User(
            hedera_account_id=hedera_account_id,
            wallet_type=wallet_type,
            is_active=True,
            is_verified=False
        )
        
        self.db.add(new_user)
        self.db.flush()  # Get the user ID
        
        # Create primary wallet
        primary_wallet = UserWallet(
            user_id=new_user.id,
            wallet_address=wallet_address,
            wallet_type=wallet_type,
            public_key=public_key,
            is_primary=True,
            first_used_at=datetime.utcnow(),
            last_used_at=datetime.utcnow()
        )
        
        self.db.add(primary_wallet)
        self.db.commit()
        
        # Create session
        session_token = await self._create_user_session(
            new_user, primary_wallet, device_info
        )
        
        return new_user, True, session_token
    
    async def _identify_user_by_patterns(
        self,
        wallet_address: str,
        device_info: Optional[Dict]
    ) -> Optional[User]:
        """Identify user by device fingerprinting and behavior patterns"""
        
        if not device_info:
            return None
        
        # Generate device fingerprint
        device_fingerprint = self.fingerprinter.generate_fingerprint(
            device_info.get('user_agent', ''),
            device_info.get('screen_resolution', ''),
            device_info.get('timezone', ''),
            device_info.get('language', ''),
            device_info.get('ip_address', '')
        )
        
        # Find users with similar device fingerprints
        similar_sessions = self.db.query(UserSession).filter(
            UserSession.device_fingerprint == device_fingerprint,
            UserSession.expires_at > datetime.utcnow()
        ).all()
        
        if similar_sessions:
            # Return the user from the most recent similar session
            latest_session = max(similar_sessions, key=lambda s: s.last_active_at)
            return latest_session.user
        
        # If no exact fingerprint match, try behavior pattern matching
        return await self._identify_by_behavior_patterns(device_info)
    
    async def _identify_by_behavior_patterns(
        self,
        device_info: Dict
    ) -> Optional[User]:
        """Identify user by behavior patterns (simplified implementation)"""
        
        # This is a simplified implementation
        # In production, you'd analyze more sophisticated patterns
        
        # For now, we'll just check for users with similar timezone and language
        timezone = device_info.get('timezone', '')
        language = device_info.get('language', '')
        
        if not timezone or not language:
            return None
        
        # Find recent sessions with similar characteristics
        recent_sessions = self.db.query(UserSession).filter(
            and_(
                UserSession.timezone == timezone,
                UserSession.language == language,
                UserSession.created_at > datetime.utcnow() - timedelta(days=30)
            )
        ).limit(10).all()
        
        if recent_sessions:
            # Return the most active user (most sessions)
            user_session_counts = {}
            for session in recent_sessions:
                user_id = session.user_id
                user_session_counts[user_id] = user_session_counts.get(user_id, 0) + 1
            
            most_active_user_id = max(user_session_counts, key=user_session_counts.get)
            return self.db.query(User).filter(User.id == most_active_user_id).first()
        
        return None
    
    async def _create_user_session(
        self,
        user: User,
        wallet: UserWallet,
        device_info: Optional[Dict]
    ) -> str:
        """Create a new user session"""
        
        session_token = secrets.token_urlsafe(32)
        
        device_fingerprint = None
        if device_info:
            device_fingerprint = self.fingerprinter.generate_fingerprint(
                device_info.get('user_agent', ''),
                device_info.get('screen_resolution', ''),
                device_info.get('timezone', ''),
                device_info.get('language', ''),
                device_info.get('ip_address', '')
            )
        
        session = UserSession(
            user_id=user.id,
            session_token=session_token,
            current_wallet_id=wallet.id,
            device_fingerprint=device_fingerprint,
            ip_address=device_info.get('ip_address') if device_info else None,
            user_agent=device_info.get('user_agent') if device_info else None,
            browser_signature=device_info.get('browser_signature') if device_info else None,
            screen_resolution=device_info.get('screen_resolution') if device_info else None,
            timezone=device_info.get('timezone') if device_info else None,
            language=device_info.get('language') if device_info else None,
            expires_at=datetime.utcnow() + timedelta(days=7),  # 7 day sessions
            last_active_at=datetime.utcnow()
        )
        
        self.db.add(session)
        self.db.commit()
        
        return session_token
    
    async def link_wallet_to_user(
        self,
        user_id: str,
        new_wallet_address: str,
        new_wallet_type: str,
        new_wallet_signature: str,
        primary_wallet_signature: str,
        message: str,
        public_key: Optional[str] = None
    ) -> bool:
        """Link a new wallet to an existing user with dual signature verification"""
        
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return False
        
        primary_wallet = user.primary_wallet
        if not primary_wallet:
            return False
        
        # Verify both signatures
        new_wallet_valid, _ = await WalletAuthenticator.authenticate_wallet(
            new_wallet_address, new_wallet_signature, message, new_wallet_type, public_key
        )
        
        primary_wallet_valid, _ = await WalletAuthenticator.authenticate_wallet(
            primary_wallet.wallet_address, primary_wallet_signature, message, 
            primary_wallet.wallet_type, primary_wallet.public_key
        )
        
        if not (new_wallet_valid and primary_wallet_valid):
            return False
        
        # Check if wallet is already linked to another user
        existing_wallet = self.db.query(UserWallet).filter(
            UserWallet.wallet_address == new_wallet_address
        ).first()
        
        if existing_wallet:
            return False
        
        # Create new wallet link
        new_wallet = UserWallet(
            user_id=user.id,
            wallet_address=new_wallet_address,
            wallet_type=new_wallet_type,
            public_key=public_key,
            is_primary=False,
            first_used_at=datetime.utcnow(),
            last_used_at=datetime.utcnow()
        )
        
        self.db.add(new_wallet)
        self.db.commit()
        
        return True
    
    def get_user_by_session_token(self, session_token: str) -> Optional[User]:
        """Get user by session token"""
        session = self.db.query(UserSession).filter(
            and_(
                UserSession.session_token == session_token,
                UserSession.expires_at > datetime.utcnow()
            )
        ).first()
        
        if session:
            # Update last active time
            session.last_active_at = datetime.utcnow()
            self.db.commit()
            return session.user
        
        return None
    
    def get_user_wallets(self, user_id: str) -> List[UserWallet]:
        """Get all wallets for a user"""
        return self.db.query(UserWallet).filter(
            UserWallet.user_id == user_id
        ).order_by(UserWallet.is_primary.desc(), UserWallet.created_at).all()
    
    def set_primary_wallet(self, user_id: str, wallet_id: str) -> bool:
        """Set a wallet as the primary wallet for a user"""
        # First, unset all primary flags for this user
        self.db.query(UserWallet).filter(
            UserWallet.user_id == user_id
        ).update({'is_primary': False})
        
        # Set the specified wallet as primary
        result = self.db.query(UserWallet).filter(
            and_(
                UserWallet.user_id == user_id,
                UserWallet.id == wallet_id
            )
        ).update({'is_primary': True})
        
        self.db.commit()
        return result > 0