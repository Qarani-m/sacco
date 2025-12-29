-- Migration: Add guarantor opt-in columns to users table
-- Date: 2025-12-29
-- Description: Allow users to opt-in as guarantors and specify maximum shares they're willing to pledge

-- Add guarantor opt-in columns (Separate statements for SQLite compatibility)
-- Note: 'IF NOT EXISTS' removed for broader compatibility, script should handle errors gracefully if cols exist
-- OR we just rely on the app to be robust. 
-- Since we can't do conditional logic easily in pure SQL for both engines without stored procs:
-- We will try to add them. If they fail, it might be because they exist.

ALTER TABLE users ADD COLUMN can_be_guarantor BOOLEAN DEFAULT 0;
ALTER TABLE users ADD COLUMN max_shares_to_guarantee INTEGER DEFAULT 0;

-- Update existing users to have default values
UPDATE users
SET can_be_guarantor = 0, max_shares_to_guarantee = 0
WHERE can_be_guarantor IS NULL;

-- Add index for faster guarantor searches
-- SQLite supports IF NOT EXISTS for indexes usually
CREATE INDEX IF NOT EXISTS idx_users_can_be_guarantor ON users(can_be_guarantor) WHERE can_be_guarantor = 1;

-- Update loan_guarantors table to fix status constraint
-- SKIPPED for SQLite compatibility (requires table recreation)
-- ALTER TABLE loan_guarantors DROP CONSTRAINT IF EXISTS loan_guarantors_status_check;
-- ALTER TABLE loan_guarantors ADD CONSTRAINT loan_guarantors_status_check CHECK (status IN ('pending', 'accepted', 'declined', 'released'));

-- Add comment (Postgres only usually, but some tools support it. SQLite ignores or errors?)
-- COMMENT ON COLUMN users.can_be_guarantor IS 'Whether the user has opted in to be available as a guarantor for other members';
-- COMMENT ON COLUMN users.max_shares_to_guarantee IS 'Maximum number of shares the user is willing to pledge as guarantor';
