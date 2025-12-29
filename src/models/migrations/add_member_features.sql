-- Additional tables for member platform completion

-- SACCO Savings Ledger (for 1% interest accumulation tracking)
CREATE TABLE IF NOT EXISTS sacco_savings_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    amount DECIMAL(10, 2) NOT NULL,
    source VARCHAR(50) NOT NULL,
    description TEXT,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fix Documents table (handle existing table)
DO $$ 
BEGIN 
    -- Add file_name if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'file_name') THEN
        ALTER TABLE documents ADD COLUMN file_name VARCHAR(255);
    END IF;

    -- Add verification_status if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'verification_status') THEN
        ALTER TABLE documents ADD COLUMN verification_status VARCHAR(20) DEFAULT 'pending';
        -- If status column exists, copy data
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'status') THEN
            UPDATE documents SET verification_status = status;
        END IF;
    END IF;

    -- Add uploaded_at if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'uploaded_at') THEN
        ALTER TABLE documents ADD COLUMN uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Member Profile Form table (one-time fillable)
CREATE TABLE IF NOT EXISTS member_profile_forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    national_id VARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL,
    address TEXT NOT NULL,
    occupation VARCHAR(100) NOT NULL,
    next_of_kin_name VARCHAR(255) NOT NULL,
    next_of_kin_phone VARCHAR(20) NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add payment allocation tracking to payment_transactions
ALTER TABLE payment_transactions 
ADD COLUMN IF NOT EXISTS allocation_loan_repayment DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS allocation_loan_interest DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS allocation_welfare DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS allocation_shares DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS allocation_personal_savings DECIMAL(10, 2) DEFAULT 0;

-- Add registration payment date to users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS registration_payment_date TIMESTAMP;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sacco_savings_ledger_source ON sacco_savings_ledger(source);
CREATE INDEX IF NOT EXISTS idx_sacco_savings_ledger_date ON sacco_savings_ledger(transaction_date);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_verification_status ON documents(verification_status);
CREATE INDEX IF NOT EXISTS idx_member_profile_forms_user_id ON member_profile_forms(user_id);
