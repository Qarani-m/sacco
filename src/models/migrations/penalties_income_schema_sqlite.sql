/**
 * Penalties and Income Tracking Schema - SQLite
 * 
 * Tracks late payment penalties and SACCO income
 */

-- ============================================
-- PENALTIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS penalties (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  penalty_type TEXT NOT NULL, -- 'loan', 'welfare', 'shares'
  amount REAL DEFAULT 500,
  due_date DATE NOT NULL,
  applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'waived'
  related_entity_id TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INCOME TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS sacco_income (
  id TEXT PRIMARY KEY,
  income_type TEXT NOT NULL, -- 'penalty', 'loan_interest', 'processing_fee', 'registration_fee'
  amount REAL NOT NULL,
  source_user_id TEXT REFERENCES users(id),
  related_entity_type TEXT, -- 'loan', 'penalty', 'user'
  related_entity_id TEXT,
  description TEXT,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- UPDATE LOANS TABLE FOR PROCESSING FEE
-- ============================================
ALTER TABLE loans ADD COLUMN processing_fee REAL DEFAULT 150;
ALTER TABLE loans ADD COLUMN processing_fee_paid INTEGER DEFAULT 0;

-- ============================================
-- UPDATE USERS TABLE FOR REGISTRATION FEE
-- ============================================
-- Note: registration_paid already exists, just update the amount in code

-- ============================================
-- CREATE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_penalties_user ON penalties(user_id);
CREATE INDEX IF NOT EXISTS idx_penalties_status ON penalties(status);
CREATE INDEX IF NOT EXISTS idx_penalties_due_date ON penalties(due_date);
CREATE INDEX IF NOT EXISTS idx_income_type ON sacco_income(income_type);
CREATE INDEX IF NOT EXISTS idx_income_user ON sacco_income(source_user_id);
CREATE INDEX IF NOT EXISTS idx_income_date ON sacco_income(recorded_at);
