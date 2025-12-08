-- Migration: Increase wallet_address column length to support Cardano addresses
-- Cardano wallet addresses can be up to 98+ characters, but the current VARCHAR(42) is too small
-- This migration updates both user_wallets.wallet_address and wallet_linking_requests.new_wallet_address

-- Update user_wallets table
ALTER TABLE user_wallets 
    ALTER COLUMN wallet_address TYPE VARCHAR(255);

-- Update wallet_linking_requests table
ALTER TABLE wallet_linking_requests 
    ALTER COLUMN new_wallet_address TYPE VARCHAR(255);



