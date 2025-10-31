-- Migration: Add missing user columns
-- This migration adds the email_verified and registration_complete columns that were missing from the database schema

-- Add email_verified column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Add registration_complete column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS registration_complete BOOLEAN DEFAULT FALSE;

-- Update existing users to have proper default values
UPDATE users SET email_verified = FALSE WHERE email_verified IS NULL;
UPDATE users SET registration_complete = FALSE WHERE registration_complete IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN users.email_verified IS 'Indicates whether the user has verified their email address';
COMMENT ON COLUMN users.registration_complete IS 'Indicates whether the user has completed the full registration process';