-- Migration: Add Cardano blockchain integration support
-- This migration adds tables for Cardano wallet management, token tracking, and supply chain events

-- Create cardano_wallets table
CREATE TABLE cardano_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    address VARCHAR(255) NOT NULL,
    stake_address VARCHAR(255),
    wallet_type VARCHAR(50) NOT NULL, -- 'nami', 'eternl', 'flint', 'lace', 'typhon'
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_synced_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT cardano_wallets_address_unique UNIQUE(address)
);

-- Create cardano_tokens table
CREATE TABLE cardano_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id VARCHAR(56) NOT NULL, -- Token policy ID (hex, 56 chars)
    asset_name VARCHAR(64) NOT NULL, -- Asset name (hex encoded)
    asset_name_readable VARCHAR(255), -- Human-readable asset name
    fingerprint VARCHAR(44), -- Asset fingerprint
    owner_wallet_id UUID NOT NULL REFERENCES cardano_wallets(id) ON DELETE CASCADE,
    quantity VARCHAR(78) NOT NULL, -- Token quantity (string for large numbers)
    token_metadata JSONB, -- Token metadata (CIP-25 format)
    minting_tx_hash VARCHAR(64), -- Transaction hash of minting
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cardano_transactions table
CREATE TABLE cardano_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tx_hash VARCHAR(64) NOT NULL UNIQUE, -- Transaction hash
    wallet_id UUID NOT NULL REFERENCES cardano_wallets(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL, -- 'mint', 'transfer', 'metadata', 'contract'
    amount_ada VARCHAR(78), -- ADA amount in lovelace
    fee VARCHAR(78), -- Transaction fee in lovelace
    tx_metadata JSONB, -- Transaction metadata
    block_height INTEGER, -- Block number
    block_time TIMESTAMP WITH TIME ZONE, -- Block timestamp
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cardano_token_transfers table
CREATE TABLE cardano_token_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES cardano_transactions(id) ON DELETE CASCADE,
    token_id UUID NOT NULL REFERENCES cardano_tokens(id) ON DELETE CASCADE,
    from_wallet_id UUID NOT NULL REFERENCES cardano_wallets(id) ON DELETE CASCADE,
    to_wallet_id UUID NOT NULL REFERENCES cardano_wallets(id) ON DELETE CASCADE,
    quantity VARCHAR(78) NOT NULL, -- Transfer quantity
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cardano_supply_chain_events table
CREATE TABLE cardano_supply_chain_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES cardano_transactions(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'harvest', 'processing', 'quality_check', 'transfer', 'certification'
    product_id VARCHAR(255), -- Reference to product
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    location VARCHAR(255), -- Event location
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL, -- Event timestamp
    details JSONB, -- Event-specific details
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance

-- Cardano wallets indexes
CREATE INDEX idx_cardano_wallets_user_id ON cardano_wallets(user_id);
CREATE INDEX idx_cardano_wallets_address ON cardano_wallets(address);
CREATE INDEX idx_cardano_wallets_primary ON cardano_wallets(user_id, is_primary) WHERE is_primary = true;

-- Cardano tokens indexes
CREATE INDEX idx_cardano_tokens_owner_wallet ON cardano_tokens(owner_wallet_id);
CREATE INDEX idx_cardano_policy_asset ON cardano_tokens(policy_id, asset_name);
CREATE INDEX idx_cardano_fingerprint ON cardano_tokens(fingerprint);
CREATE INDEX idx_cardano_tokens_minting_tx ON cardano_tokens(minting_tx_hash);

-- Cardano transactions indexes
CREATE INDEX idx_cardano_tx_hash ON cardano_transactions(tx_hash);
CREATE INDEX idx_cardano_transactions_wallet ON cardano_transactions(wallet_id);
CREATE INDEX idx_cardano_wallet_time ON cardano_transactions(wallet_id, block_time);
CREATE INDEX idx_cardano_transactions_type ON cardano_transactions(transaction_type);
CREATE INDEX idx_cardano_transactions_status ON cardano_transactions(status);
CREATE INDEX idx_cardano_transactions_block_time ON cardano_transactions(block_time);

-- Cardano token transfers indexes
CREATE INDEX idx_cardano_transfers_transaction ON cardano_token_transfers(transaction_id);
CREATE INDEX idx_cardano_transfers_token ON cardano_token_transfers(token_id);
CREATE INDEX idx_cardano_transfers_from_wallet ON cardano_token_transfers(from_wallet_id);
CREATE INDEX idx_cardano_transfers_to_wallet ON cardano_token_transfers(to_wallet_id);

-- Cardano supply chain events indexes
CREATE INDEX idx_cardano_events_transaction ON cardano_supply_chain_events(transaction_id);
CREATE INDEX idx_cardano_events_product ON cardano_supply_chain_events(product_id);
CREATE INDEX idx_cardano_events_actor ON cardano_supply_chain_events(actor_id);
CREATE INDEX idx_cardano_events_type ON cardano_supply_chain_events(event_type);
CREATE INDEX idx_cardano_events_timestamp ON cardano_supply_chain_events(timestamp);

-- Add trigger to update updated_at timestamp for cardano_wallets
CREATE TRIGGER update_cardano_wallets_updated_at 
    BEFORE UPDATE ON cardano_wallets
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add trigger to update updated_at timestamp for cardano_tokens
CREATE TRIGGER update_cardano_tokens_updated_at 
    BEFORE UPDATE ON cardano_tokens
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to ensure only one primary Cardano wallet per user
CREATE OR REPLACE FUNCTION ensure_single_primary_cardano_wallet()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_primary = true THEN
        -- Set all other Cardano wallets for this user to non-primary
        UPDATE cardano_wallets 
        SET is_primary = false 
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_single_primary_cardano_wallet_trigger
    BEFORE INSERT OR UPDATE ON cardano_wallets
    FOR EACH ROW
    WHEN (NEW.is_primary = true)
    EXECUTE FUNCTION ensure_single_primary_cardano_wallet();

-- Function to update token quantities after transfers
CREATE OR REPLACE FUNCTION update_token_quantity_on_transfer()
RETURNS TRIGGER AS $$
BEGIN
    -- This is a placeholder for future implementation
    -- In a real system, you might want to automatically update token quantities
    -- based on transfers, but this requires careful consideration of the business logic
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE cardano_wallets IS 'Stores Cardano wallet information for users';
COMMENT ON TABLE cardano_tokens IS 'Stores Cardano native tokens owned by users';
COMMENT ON TABLE cardano_transactions IS 'Stores Cardano blockchain transactions';
COMMENT ON TABLE cardano_token_transfers IS 'Stores token transfer records between wallets';
COMMENT ON TABLE cardano_supply_chain_events IS 'Stores supply chain events recorded on Cardano blockchain';

COMMENT ON COLUMN cardano_wallets.address IS 'Cardano wallet address in bech32 format';
COMMENT ON COLUMN cardano_wallets.stake_address IS 'Cardano stake address for rewards';
COMMENT ON COLUMN cardano_tokens.policy_id IS 'Cardano token policy ID (56 character hex string)';
COMMENT ON COLUMN cardano_tokens.asset_name IS 'Hex-encoded asset name';
COMMENT ON COLUMN cardano_tokens.fingerprint IS 'CIP-14 asset fingerprint for unique identification';
COMMENT ON COLUMN cardano_tokens.quantity IS 'Token quantity stored as string to handle large numbers';
COMMENT ON COLUMN cardano_transactions.tx_hash IS 'Cardano transaction hash (64 character hex string)';
COMMENT ON COLUMN cardano_transactions.amount_ada IS 'ADA amount in lovelace (1 ADA = 1,000,000 lovelace)';
COMMENT ON COLUMN cardano_transactions.tx_metadata IS 'Transaction metadata in JSONB format';
