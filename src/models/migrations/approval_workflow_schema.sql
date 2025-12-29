/**
 * Approval Workflow Schema
 * 
 * Database schema for configurable approval workflows
 */

-- ============================================
-- APPROVAL WORKFLOWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS approval_workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  entity_type VARCHAR(50) NOT NULL, -- 'loan', 'document', 'member', etc.
  min_amount DECIMAL(15,2),
  max_amount DECIMAL(15,2),
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- WORKFLOW STEPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS workflow_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID REFERENCES approval_workflows(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  step_name VARCHAR(100) NOT NULL,
  role_id UUID REFERENCES roles(id),
  approvers_required INTEGER DEFAULT 1,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(workflow_id, step_order)
);

-- ============================================
-- APPROVAL HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS approval_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  workflow_id UUID REFERENCES approval_workflows(id),
  step_id UUID REFERENCES workflow_steps(id),
  approver_id UUID REFERENCES users(id),
  action VARCHAR(20) NOT NULL, -- 'approved', 'rejected', 'pending'
  comments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- UPDATE LOANS TABLE
-- ============================================
ALTER TABLE loans ADD COLUMN IF NOT EXISTS workflow_id UUID REFERENCES approval_workflows(id);
ALTER TABLE loans ADD COLUMN IF NOT EXISTS current_step_id UUID REFERENCES workflow_steps(id);
ALTER TABLE loans ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'pending';

CREATE INDEX IF NOT EXISTS idx_loans_workflow ON loans(workflow_id);
CREATE INDEX IF NOT EXISTS idx_loans_current_step ON loans(current_step_id);

-- ============================================
-- SEED DEFAULT WORKFLOWS
-- ============================================

-- Small Loans Workflow (< KES 50,000) - Single approval
INSERT INTO approval_workflows (id, name, description, entity_type, min_amount, max_amount, is_active, is_default) VALUES
  ('workflow-small-loans', 'Small Loans Workflow', 'For loans under KES 50,000 - requires 1 approval', 'loan', 0, 49999.99, true, false)
ON CONFLICT DO NOTHING;

-- Medium Loans Workflow (KES 50,000 - 200,000) - Two approvals
INSERT INTO approval_workflows (id, name, description, entity_type, min_amount, max_amount, is_active, is_default) VALUES
  ('workflow-medium-loans', 'Medium Loans Workflow', 'For loans KES 50,000 - 200,000 - requires Risk + Finance approval', 'loan', 50000, 200000, true, true)
ON CONFLICT DO NOTHING;

-- Large Loans Workflow (> KES 200,000) - Three approvals
INSERT INTO approval_workflows (id, name, description, entity_type, min_amount, max_amount, is_active, is_default) VALUES
  ('workflow-large-loans', 'Large Loans Workflow', 'For loans over KES 200,000 - requires Risk + Finance + Admin approval', 'loan', 200000.01, 999999999, true, false)
ON CONFLICT DO NOTHING;

-- ============================================
-- SEED WORKFLOW STEPS
-- ============================================

-- Small Loans: 1 step (Risk approval)
INSERT INTO workflow_steps (workflow_id, step_order, step_name, role_id, approvers_required, description) VALUES
  ('workflow-small-loans', 1, 'Risk Assessment', 'role-risk', 1, 'Risk officer reviews and approves small loan')
ON CONFLICT DO NOTHING;

-- Medium Loans: 2 steps (Risk + Finance)
INSERT INTO workflow_steps (workflow_id, step_order, step_name, role_id, approvers_required, description) VALUES
  ('workflow-medium-loans', 1, 'Risk Assessment', 'role-risk', 1, 'Risk officer assesses loan risk'),
  ('workflow-medium-loans', 2, 'Financial Review', 'role-finance', 1, 'Finance officer reviews financial viability')
ON CONFLICT DO NOTHING;

-- Large Loans: 3 steps (Risk + Finance + Admin)
INSERT INTO workflow_steps (workflow_id, step_order, step_name, role_id, approvers_required, description) VALUES
  ('workflow-large-loans', 1, 'Risk Assessment', 'role-risk', 1, 'Risk officer assesses loan risk'),
  ('workflow-large-loans', 2, 'Financial Review', 'role-finance', 1, 'Finance officer reviews financial viability'),
  ('workflow-large-loans', 3, 'Executive Approval', 'role-admin', 1, 'Admin provides final approval')
ON CONFLICT DO NOTHING;

-- ============================================
-- CREATE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_approval_history_entity ON approval_history(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_approval_history_approver ON approval_history(approver_id);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_workflow ON workflow_steps(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_role ON workflow_steps(role_id);

COMMENT ON TABLE approval_workflows IS 'Configurable approval workflows for different entity types and amounts';
COMMENT ON TABLE workflow_steps IS 'Individual steps in an approval workflow';
COMMENT ON TABLE approval_history IS 'History of all approval actions';
