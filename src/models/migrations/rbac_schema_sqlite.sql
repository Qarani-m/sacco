/**
 * SQLite Schema for RBAC System
 * 
 * SQLite-compatible version of the RBAC schema
 */

-- ============================================
-- ROLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PERMISSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS permissions (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  module TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ROLE_PERMISSIONS MAPPING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id TEXT REFERENCES roles(id) ON DELETE CASCADE,
  permission_id TEXT REFERENCES permissions(id) ON DELETE CASCADE,
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (role_id, permission_id)
);

-- ============================================
-- UPDATE USERS TABLE
-- ============================================
ALTER TABLE users ADD COLUMN role_id TEXT REFERENCES roles(id);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);

-- ============================================
-- SEED INITIAL ROLES
-- ============================================
INSERT OR IGNORE INTO roles (id, name, description) VALUES
  ('role-admin', 'Admin', 'Full system access and management'),
  ('role-finance', 'Finance', 'Financial operations and reporting'),
  ('role-risk', 'Risk', 'Risk assessment and loan approval'),
  ('role-customer-service', 'Customer Service', 'Member support and assistance'),
  ('role-disbursement', 'Disbursement Officer', 'Loan disbursement operations'),
  ('role-member', 'Member', 'Standard member access');

-- ============================================
-- SEED PERMISSIONS (Member Management)
-- ============================================
INSERT OR IGNORE INTO permissions (id, name, description, module, action) VALUES
  ('perm-members-view', 'members.view', 'View member list and details', 'members', 'view'),
  ('perm-members-create', 'members.create', 'Register new members', 'members', 'create'),
  ('perm-members-update', 'members.update', 'Update member information', 'members', 'update'),
  ('perm-members-delete', 'members.delete', 'Delete/deactivate members', 'members', 'delete'),
  ('perm-members-approve', 'members.approve', 'Approve member registrations', 'members', 'approve');

-- Loan Management Permissions
INSERT OR IGNORE INTO permissions (id, name, description, module, action) VALUES
  ('perm-loans-view', 'loans.view', 'View loan applications and details', 'loans', 'view'),
  ('perm-loans-create', 'loans.create', 'Create loan applications', 'loans', 'create'),
  ('perm-loans-update', 'loans.update', 'Update loan information', 'loans', 'update'),
  ('perm-loans-delete', 'loans.delete', 'Delete loan applications', 'loans', 'delete'),
  ('perm-loans-approve', 'loans.approve', 'Approve loan applications', 'loans', 'approve'),
  ('perm-loans-disburse', 'loans.disburse', 'Disburse approved loans', 'loans', 'disburse'),
  ('perm-loans-view-all', 'loans.view_all', 'View all loans (not just own)', 'loans', 'view_all');

-- Share, Savings, Welfare Permissions
INSERT OR IGNORE INTO permissions (id, name, description, module, action) VALUES
  ('perm-shares-view', 'shares.view', 'View share information', 'shares', 'view'),
  ('perm-shares-manage', 'shares.manage', 'Manage share capital', 'shares', 'manage'),
  ('perm-shares-view-all', 'shares.view_all', 'View all member shares', 'shares', 'view_all'),
  ('perm-savings-view', 'savings.view', 'View savings information', 'savings', 'view'),
  ('perm-savings-manage', 'savings.manage', 'Manage savings accounts', 'savings', 'manage'),
  ('perm-savings-view-all', 'savings.view_all', 'View all member savings', 'savings', 'view_all'),
  ('perm-welfare-view', 'welfare.view', 'View welfare contributions', 'welfare', 'view'),
  ('perm-welfare-manage', 'welfare.manage', 'Manage welfare fund', 'welfare', 'manage'),
  ('perm-welfare-view-all', 'welfare.view_all', 'View all welfare contributions', 'welfare', 'view_all');

-- Report Permissions
INSERT OR IGNORE INTO permissions (id, name, description, module, action) VALUES
  ('perm-reports-view-own', 'reports.view_own', 'View own reports and statements', 'reports', 'view_own'),
  ('perm-reports-view-all', 'reports.view_all', 'View all system reports', 'reports', 'view_all'),
  ('perm-reports-export', 'reports.export', 'Export reports to PDF/Excel', 'reports', 'export'),
  ('perm-reports-financial', 'reports.financial', 'View financial reports', 'reports', 'financial');

-- Settings & Payment Permissions
INSERT OR IGNORE INTO permissions (id, name, description, module, action) VALUES
  ('perm-settings-view', 'settings.view', 'View system settings', 'settings', 'view'),
  ('perm-settings-manage', 'settings.manage', 'Manage system configuration', 'settings', 'manage'),
  ('perm-settings-roles', 'settings.roles', 'Manage roles and permissions', 'settings', 'roles'),
  ('perm-payments-view', 'payments.view', 'View payment transactions', 'payments', 'view'),
  ('perm-payments-process', 'payments.process', 'Process payments', 'payments', 'process'),
  ('perm-payments-view-all', 'payments.view_all', 'View all payment transactions', 'payments', 'view_all');

-- ============================================
-- ASSIGN PERMISSIONS TO ADMIN ROLE
-- ============================================
INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
SELECT 'role-admin', id FROM permissions;

-- ============================================
-- ASSIGN PERMISSIONS TO OTHER ROLES
-- ============================================
-- Finance Role
INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
SELECT 'role-finance', id FROM permissions
WHERE module IN ('reports', 'payments', 'savings', 'shares', 'welfare')
   OR name IN ('loans.view_all', 'members.view');

-- Risk Role
INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
SELECT 'role-risk', id FROM permissions
WHERE module = 'loans'
   OR name IN ('members.view', 'shares.view_all', 'reports.view_all');

-- Customer Service Role
INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
SELECT 'role-customer-service', id FROM permissions
WHERE name IN (
  'members.view', 'members.update',
  'loans.view', 'shares.view', 'savings.view', 'welfare.view',
  'payments.view', 'reports.view_own'
);

-- Disbursement Officer Role
INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
SELECT 'role-disbursement', id FROM permissions
WHERE name IN (
  'loans.view_all', 'loans.disburse',
  'payments.view_all', 'payments.process',
  'members.view'
);

-- Member Role
INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
SELECT 'role-member', id FROM permissions
WHERE name IN (
  'loans.view', 'loans.create',
  'shares.view', 'savings.view', 'welfare.view',
  'payments.view', 'reports.view_own'
);

-- ============================================
-- MIGRATE EXISTING USERS
-- ============================================
UPDATE users
SET role_id = 'role-admin'
WHERE role = 'admin' AND role_id IS NULL;

UPDATE users
SET role_id = 'role-member'
WHERE role = 'member' AND role_id IS NULL;

-- ============================================
-- CREATE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_permissions_module ON permissions(module);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON role_permissions(permission_id);
