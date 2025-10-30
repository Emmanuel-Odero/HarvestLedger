-- Initialize the database with required extensions and basic setup
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('farmer', 'buyer', 'admin');
CREATE TYPE harvest_status AS ENUM ('planted', 'growing', 'harvested', 'tokenized', 'sold');
CREATE TYPE loan_status AS ENUM ('pending', 'approved', 'active', 'repaid', 'defaulted');
CREATE TYPE transaction_type AS ENUM ('harvest_record', 'tokenization', 'loan_creation', 'payment', 'transfer');

-- Set timezone
SET timezone = 'UTC';