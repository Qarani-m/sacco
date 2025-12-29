/**
 * Approval Workflow Schema - SQLite Version
 */

-- ============================================
-- APPROVAL WORKFLOWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS approval_workflows (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  entity_type TEXT NOT NULL,
  min_amount REAL,
  max_amount REAL,
  is_active INTEGER DEFAULT 1,
  is_default INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- WORKFLOW STEPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS workflow_steps (
  id TEXT PRIMARY KEY,
  workflow_id TEXT REFERENCES approval_workflows(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  role_id TEXT REFERENCES roles(id),
  approvers_required INTEGER DEFAULT 1,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(workflow_id, step_order)
);

-- ============================================
-- APPROVAL HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS approval_history (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  workflow_id TEXT REFERENCES approval_workflows(id),
  step_id TEXT REFERENCES workflow_steps(id),
  approver_id TEXT REFERENCES users(id),
  action TEXT NOT NULL,
  comments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- UPDATE LOANS TABLE
-- ============================================
ALTER TABLE loans ADD COLUMN workflow_id TEXT REFERENCES approval_workflows(id);
ALTER TABLE loans ADD COLUMN current_step_id TEXT REFERENCES workflow_steps(id);
ALTER TABLE loans ADD COLUMN approval_status TEXT DEFAULT 'pending';

CREATE INDEX IF NOT EXISTS idx_loans_workflow ON loans(workflow_id);
CREATE INDEX IF NOT EXISTS idx_loans_current_step ON loans(current_step_id);

-- ============================================
-- SEED DEFAULT WORKFLOWS
-- ============================================
INSERT OR IGNORE INTO approval_workflows (id, name, description, entity_type, min_amount, max_amount, is_active, is_default) VALUES
  ('workflow-small-loans', 'Small Loans Workflow', 'For loans under KES 50,000 - requires 1 approval', 'loan', 0, 49999.99, 1, 0),
  ('workflow-medium-loans', 'Medium Loans Workflow', 'For loans KES 50,000 - 200,000 - requires Risk + Finance approval', 'loan', 50000, 200000, 1, 1),
  ('workflow-large-loans', 'Large Loans Workflow', 'For loans over KES 200,000 - requires Risk + Finance + Admin approval', 'loan', 200000.01, 999999999, 1, 0);

-- ============================================
-- SEED WORKFLOW STEPS
-- ============================================
INSERT OR IGNORE INTO workflow_steps (id, workflow_id, step_order, step_name, role_id, approvers_required, description) VALUES
  ('step-small-1', 'workflow-small-loans', 1, 'Risk Assessment', 'role-risk', 1, 'Risk officer reviews and approves small loan'),
  ('step-medium-1', 'workflow-medium-loans', 1, 'Risk Assessment', 'role-risk', 1, 'Risk officer assesses loan risk'),
  ('step-medium-2', 'workflow-medium-loans', 2, 'Financial Review', 'role-finance', 1, 'Finance officer reviews financial viability'),
  ('step-large-1', 'workflow-large-loans', 1, 'Risk Assessment', 'role-risk', 1, 'Risk officer assesses loan risk'),
  ('step-large-2', 'workflow-large-loans', 2, 'Financial Review', 'role-finance', 1, 'Finance officer reviews financial viability'),
  ('step-large-3', 'workflow-large-loans', 3, 'Executive Approval', 'role-admin', 1, 'Admin provides final approval');

-- ============================================
-- CREATE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_approval_history_entity ON approval_history(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_approval_history_approver ON approval_history(approver_id);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_workflow ON workflow_steps(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_role ON workflow_steps(role_id);
