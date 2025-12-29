-- Migration: Update Check Constraint on Users Table for RBAC
-- Description: Widens the CHECK constraint on user.role to allow new roles

-- 1. Create new table with updated constraints
DROP TABLE IF EXISTS users_new;
CREATE TABLE users_new (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    is_active INTEGER DEFAULT 1,
    registration_paid INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    verification_token TEXT,
    verification_token_expires DATETIME,
    email_verified INTEGER DEFAULT 0,
    role_id TEXT REFERENCES roles(id),
    can_be_guarantor BOOLEAN DEFAULT 0,
    max_shares_to_guarantee INTEGER DEFAULT 0,
    CHECK (role IN ('member', 'admin', 'disbursement_officer', 'customer_service', 'finance', 'risk'))
);

-- 2. Copy data from old table to new table
INSERT INTO users_new (
    id, email, password_hash, full_name, phone_number, role, 
    is_active, registration_paid, created_at, updated_at, 
    verification_token, verification_token_expires, email_verified, 
    role_id, can_be_guarantor, max_shares_to_guarantee
)
SELECT 
    id, email, password_hash, full_name, phone_number, role, 
    is_active, registration_paid, created_at, updated_at, 
    verification_token, verification_token_expires, email_verified, 
    role_id, can_be_guarantor, 0
FROM users;

-- 3. Drop old table
DROP TABLE users;

-- 4. Rename new table to original name
ALTER TABLE users_new RENAME TO users;

-- 5. Recreate indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_can_be_guarantor ON users(can_be_guarantor) WHERE can_be_guarantor = 1;
