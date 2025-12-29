-- Migration: Add updated_at column to loans table
-- Date: 2025-12-29
-- Description: Fixes crash where Loan.updateStatus/updateWorkflow tries to set updated_at

ALTER TABLE loans ADD COLUMN updated_at DATETIME;

-- Update existing loans to have updated_at = created_at if possible, or just now.
UPDATE loans SET updated_at = COALESCE(created_at, datetime('now')) WHERE updated_at IS NULL;
