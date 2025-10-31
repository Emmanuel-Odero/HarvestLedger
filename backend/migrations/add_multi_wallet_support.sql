-- Migration: Add multi-wallet support to Harvest Ledger
-- This migration adds support for multiple wallets per user with session management

-- Create user_wallets table to support multiple wallets per user
CREATE TABLE user_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    wallet_address VARCHAR(42) NOT NULL,
    wallet_type VARCHAR(50) NOT NULL, -- 'HASHPACK', 'BLADE', 'KABILA', 'METAMASK', 'PORTAL'
    public_key TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    first_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(wallet_address, wallet_type),
    CONSTRAINT only_one_primary_per_user UNIQUE(user_id, is_primary) DEFERRABLE INITIALLY DEFERRED
);

-- Create user_sessions table for enhanced session management
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    current_wallet_id UUID REFERENCES user_wallets(id) ON DELETE SET NULL,
    device_fingerprint TEXT,
    ip_address INET,
    user_agent TEXT,
    browser_signature TEXT,
    screen_resolution VARCHAR(20),
    timezone VARCHAR(50),
    language VARCHAR(10),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_behavior_patterns table for behavioral analysis
CREATE TABLE user_behavior_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    pattern_type VARCHAR(50) NOT NULL, -- 'transaction_times', 'session_duration', 'feature_usage'
    pattern_data JSONB NOT NULL,
    confidence_score DECIMAL(3,2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wallet_linking_requests table for secure wallet linking
CREATE TABLE wallet_linking_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    new_wallet_address VARCHAR(42) NOT NULL,
    new_wallet_type VARCHAR(50) NOT NULL,
    verification_token VARCHAR(255) NOT NULL,
    primary_signature TEXT,
    new_wallet_signature TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'verified', 'expired', 'rejected'
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes for performance
CREATE INDEX idx_user_wallets_user_id ON user_wallets(user_id);
CREATE INDEX idx_user_wallets_address ON user_wallets(wallet_address);
CREATE INDEX idx_user_wallets_primary ON user_wallets(user_id, is_primary) WHERE is_primary = true;
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX idx_user_behavior_user_id ON user_behavior_patterns(user_id);
CREATE INDEX idx_wallet_linking_user_id ON wallet_linking_requests(user_id);
CREATE INDEX idx_wallet_linking_status ON wallet_linking_requests(status);

-- Migrate existing users to new structure
-- Move existing wallet data to user_wallets table
INSERT INTO user_wallets (user_id, wallet_address, wallet_type, public_key, is_primary, first_used_at, last_used_at)
SELECT 
    id as user_id,
    hedera_account_id as wallet_address,
    COALESCE(wallet_type, 'HASHPACK') as wallet_type,
    hedera_public_key as public_key,
    true as is_primary,
    created_at as first_used_at,
    updated_at as last_used_at
FROM users 
WHERE hedera_account_id IS NOT NULL;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_wallets_updated_at BEFORE UPDATE ON user_wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_behavior_patterns_updated_at BEFORE UPDATE ON user_behavior_patterns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to ensure only one primary wallet per user
CREATE OR REPLACE FUNCTION ensure_single_primary_wallet()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_primary = true THEN
        -- Set all other wallets for this user to non-primary
        UPDATE user_wallets 
        SET is_primary = false 
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_single_primary_wallet_trigger
    BEFORE INSERT OR UPDATE ON user_wallets
    FOR EACH ROW
    WHEN (NEW.is_primary = true)
    EXECUTE FUNCTION ensure_single_primary_wallet();

-- Function to clean up expired sessions and linking requests
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS void AS $$
BEGIN
    -- Clean up expired sessions
    DELETE FROM user_sessions WHERE expires_at < NOW();
    
    -- Clean up expired wallet linking requests
    DELETE FROM wallet_linking_requests WHERE expires_at < NOW() AND status = 'pending';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run cleanup (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-expired-data', '0 */6 * * *', 'SELECT cleanup_expired_data();');