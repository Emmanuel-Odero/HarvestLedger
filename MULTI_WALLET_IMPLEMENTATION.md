# Multi-Wallet User Identification Implementation

This document outlines the comprehensive multi-wallet authentication and user identification system implemented for Harvest Ledger.

## Overview

The multi-wallet system allows users to:
- Connect multiple wallets to a single account
- Seamlessly switch between wallets
- Maintain identity across different wallet addresses
- Benefit from enhanced security through wallet separation

## Architecture

### 1. Database Schema

#### New Tables
- `user_wallets`: Stores multiple wallet addresses per user
- `user_sessions`: Enhanced session management with device fingerprinting
- `user_behavior_patterns`: Behavioral analysis for user identification
- `wallet_linking_requests`: Secure wallet linking workflow

#### Key Features
- Primary wallet designation
- Device fingerprinting for user identification
- Behavioral pattern analysis
- Secure wallet linking with dual signatures

### 2. Backend Services

#### MultiWalletAuthService
- **User Identification**: Combines device fingerprinting and behavioral analysis
- **Session Management**: Enhanced sessions with device characteristics
- **Wallet Linking**: Secure process requiring signatures from both wallets

#### DeviceFingerprinter
- Browser characteristics analysis
- Screen resolution and hardware detection
- Font availability detection
- Canvas and WebGL fingerprinting

#### BehaviorAnalyzer
- Session pattern analysis
- Active hours tracking
- Usage pattern similarity calculation

### 3. Frontend Components

#### WalletManager
- Display all connected wallets
- Set primary wallet
- Link new wallets
- Wallet usage statistics

#### WalletLinkingModal
- Guided wallet linking process
- Real-time wallet detection
- Signature verification flow

#### Enhanced AuthContext
- Device fingerprint generation
- Multi-wallet authentication
- Session persistence

## Implementation Details

### User Identification Strategy

1. **Direct Match**: Check if wallet is already linked to a user
2. **Device Fingerprinting**: Match based on browser/device characteristics
3. **Behavioral Analysis**: Analyze usage patterns for similarity
4. **New User Creation**: Create new account if no matches found

### Device Fingerprinting Components

```typescript
interface DeviceFingerprint {
  userAgent: string
  screenResolution: string
  timezone: string
  language: string
  browserSignature: string
}
```

### Wallet Linking Process

1. User initiates wallet linking
2. Connect to new wallet
3. Generate linking message
4. Sign with new wallet
5. Sign with primary wallet (verification)
6. Backend validates both signatures
7. Link wallets if valid

### Security Measures

- **Dual Signature Verification**: Both wallets must sign linking message
- **Time-limited Nonces**: Prevent replay attacks
- **Session Expiration**: Automatic cleanup of expired sessions
- **Device Fingerprint Validation**: Additional identity verification

## GraphQL API

### Queries
```graphql
# Get user with all wallets
getMultiWalletUser(userId: String!): MultiWalletUser

# Get user's wallets
getUserWallets(userId: String!): [UserWallet!]!
```

### Mutations
```graphql
# Enhanced authentication
authenticateMultiWallet(input: MultiWalletAuthPayload!): AuthResponse!

# Link new wallet
linkWallet(input: WalletLinkingPayload!, userId: String!): Boolean!

# Set primary wallet
setPrimaryWallet(userId: String!, walletId: String!): Boolean!
```

## Usage Examples

### Frontend Wallet Connection
```typescript
const connectWallet = async (walletType: WalletType) => {
  // Generate device fingerprint
  const deviceFingerprint = await DeviceFingerprintGenerator.generateFingerprint()
  
  // Connect wallet
  const connection = await WalletConnector.connectWallet(walletType)
  
  // Sign authentication message
  const signature = await WalletConnector.signMessage(message, connection)
  
  // Authenticate with enhanced payload
  const result = await authenticateMultiWallet({
    variables: {
      input: {
        address: signature.address,
        signature: signature.signature,
        message: signature.message,
        walletType: signature.walletType,
        publicKey: signature.publicKey,
        deviceInfo: deviceFingerprint
      }
    }
  })
}
```

### Backend User Identification
```python
async def authenticate_or_identify_user(
    self,
    wallet_address: str,
    signature: str,
    message: str,
    wallet_type: str,
    public_key: Optional[str] = None,
    device_info: Optional[Dict] = None
) -> Tuple[Optional[User], bool, Optional[str]]:
    # 1. Verify signature
    is_valid, hedera_account_id = await WalletAuthenticator.authenticate_wallet(...)
    
    # 2. Check existing wallet
    existing_wallet = self.db.query(UserWallet).filter(...)
    
    # 3. Try user identification
    if not existing_wallet:
        potential_user = await self._identify_user_by_patterns(wallet_address, device_info)
    
    # 4. Create new user if needed
    # 5. Create session
    # 6. Return user, is_new_user, session_token
```

## Benefits for Harvest Ledger

### For Farmers
- **Flexibility**: Use different wallets for different crops/seasons
- **Security**: Separate business and personal transactions
- **Convenience**: Access from multiple devices

### For Buyers
- **Organization**: Different wallets for different suppliers
- **Risk Management**: Limit exposure per wallet
- **Compliance**: Easier audit trails

### For the Platform
- **User Retention**: Seamless experience across wallets
- **Security**: Enhanced fraud detection
- **Analytics**: Better user behavior insights

## Migration Strategy

1. **Database Migration**: Run `add_multi_wallet_support.sql`
2. **Existing Users**: Automatically migrate current wallet data
3. **Gradual Rollout**: Enable multi-wallet features progressively
4. **User Education**: Guide users through new features

## Monitoring and Analytics

### Key Metrics
- Multi-wallet adoption rate
- User identification accuracy
- Session duration improvements
- Wallet linking success rate

### Security Monitoring
- Failed authentication attempts
- Suspicious device fingerprints
- Unusual behavioral patterns
- Wallet linking anomalies

## Future Enhancements

1. **Machine Learning**: Advanced behavioral pattern recognition
2. **Cross-Chain Support**: Support for other blockchain wallets
3. **Social Recovery**: Wallet recovery through linked accounts
4. **Advanced Analytics**: Predictive user behavior modeling

## Conclusion

This multi-wallet implementation provides Harvest Ledger with a robust, secure, and user-friendly authentication system that addresses the unique challenges of Web3 user identification while maintaining the agricultural focus of the platform.

The system balances security, usability, and privacy to create an optimal experience for farmers and buyers in the decentralized agriculture ecosystem.