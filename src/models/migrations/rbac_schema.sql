/**
 * Database Schema for RBAC System
 * 
 * This file contains the SQL schema for implementing Role-Based Access Control
 * Run this migration to add roles, permissions, and role-permission mapping
 */

-- ============================================
-- ROLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PERMISSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  module VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ROLE_PERMISSIONS MAPPING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (role_id, permission_id)
);

-- ============================================
-- UPDATE USERS TABLE
-- ============================================
-- Add role_id column (keeping old 'role' for backward compatibility during migration)
ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES roles(id);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);

-- ============================================
-- SEED INITIAL ROLES
-- ============================================
INSERT INTO roles (id, name, description) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Admin', 'Full system access and management'),
  ('00000000-0000-0000-0000-000000000002', 'Finance', 'Financial operations and reporting'),
  ('00000000-0000-0000-0000-000000000003', 'Risk', 'Risk assessment and loan approval'),
  ('00000000-0000-0000-0000-000000000004', 'Customer Service', 'Member support and assistance'),
  ('00000000-0000-0000-0000-000000000005', 'Disbursement Officer', 'Loan disbursement operations'),
  ('00000000-0000-0000-0000-000000000006', 'Member', 'Standard member access')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- SEED PERMISSIONS
-- ============================================

-- Member Management Permissions
INSERT INTO permissions (name, description, module, action) VALUES
  ('members.view', 'View member list and details', 'members', 'view'),
  ('members.create', 'Register new members', 'members', 'create'),
  ('members.update', 'Update member information', 'members', 'update'),
  ('members.delete', 'Delete/deactivate members', 'members', 'delete'),
  ('members.approve', 'Approve member registrations', 'members', 'approve')
ON CONFLICT (name) DO NOTHING;

-- Loan Management Permissions
INSERT INTO permissions (name, description, module, action) VALUES
  ('loans.view', 'View loan applications and details', 'loans', 'view'),
  ('loans.create', 'Create loan applications', 'loans', 'create'),
  ('loans.update', 'Update loan information', 'loans', 'update'),
  ('loans.delete', 'Delete loan applications', 'loans', 'delete'),
  ('loans.approve', 'Approve loan applications', 'loans', 'approve'),
  ('loans.disburse', 'Disburse approved loans', 'loans', 'disburse'),
  ('loans.view_all', 'View all loans (not just own)', 'loans', 'view_all')
ON CONFLICT (name) DO NOTHING;

-- Share Management Permissions
INSERT INTO permissions (name, description, module, action) VALUES
  ('shares.view', 'View share information', 'shares', 'view'),
  ('shares.manage', 'Manage share capital', 'shares', 'manage'),
  ('shares.view_all', 'View all member shares', 'shares', 'view_all')
ON CONFLICT (name) DO NOTHING;

-- Savings Management Permissions
INSERT INTO permissions (name, description, module, action) VALUES
  ('savings.view', 'View savings information', 'savings', 'view'),
  ('savings.manage', 'Manage savings accounts', 'savings', 'manage'),
  ('savings.view_all', 'View all member savings', 'savings', 'view_all')
ON CONFLICT (name) DO NOTHING;

-- Welfare Management Permissions
INSERT INTO permissions (name, description, module, action) VALUES
  ('welfare.view', 'View welfare contributions', 'welfare', 'view'),
  ('welfare.manage', 'Manage welfare fund', 'welfare', 'manage'),
  ('welfare.view_all', 'View all welfare contributions', 'welfare', 'view_all')
ON CONFLICT (name) DO NOTHING;

-- Report Permissions
INSERT INTO permissions (name, description, module, action) VALUES
  ('reports.view_own', 'View own reports and statements', 'reports', 'view_own'),
  ('reports.view_all', 'View all system reports', 'reports', 'view_all'),
  ('reports.export', 'Export reports to PDF/Excel', 'reports', 'export'),
  ('reports.financial', 'View financial reports', 'reports', 'financial')
ON CONFLICT (name) DO NOTHING;

-- Settings & Configuration Permissions
INSERT INTO permissions (name, description, module, action) VALUES
  ('settings.view', 'View system settings', 'settings', 'view'),
  ('settings.manage', 'Manage system configuration', 'settings', 'manage'),
  ('settings.roles', 'Manage roles and permissions', 'settings', 'roles')
ON CONFLICT (name) DO NOTHING;

-- Payment Permissions
INSERT INTO permissions (name, description, module, action) VALUES
  ('payments.view', 'View payment transactions', 'payments', 'view'),
  ('payments.process', 'Process payments', 'payments', 'process'),
  ('payments.view_all', 'View all payment transactions', 'payments', 'view_all')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- ASSIGN PERMISSIONS TO ROLES
-- ============================================

-- Admin: Full access to everything
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM permissions
ON CONFLICT DO NOTHING;

-- Finance: Financial operations and reporting
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000002', id FROM permissions
WHERE module IN ('reports', 'payments', 'savings', 'shares', 'welfare')
   OR name IN ('loans.view_all', 'members.view')
ON CONFLICT DO NOTHING;

-- Risk: Loan approval and risk assessment
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000003', id FROM permissions
WHERE module = 'loans'
   OR name IN ('members.view', 'shares.view_all', 'reports.view_all')
ON CONFLICT DO NOTHING;

-- Customer Service: Member support
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000004', id FROM permissions
WHERE name IN (
  'members.view', 'members.update',
  'loans.view', 'shares.view', 'savings.view', 'welfare.view',
  'payments.view', 'reports.view_own'
)
ON CONFLICT DO NOTHING;

-- Disbursement Officer: Loan disbursement
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000005', id FROM permissions
WHERE name IN (
  'loans.view_all', 'loans.disburse',
  'payments.view_all', 'payments.process',
  'members.view'
)
ON CONFLICT DO NOTHING;

-- Member: Basic member access
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000006', id FROM permissions
WHERE name IN (
  'loans.view', 'loans.create',
  'shares.view', 'savings.view', 'welfare.view',
  'payments.view', 'reports.view_own'
)
ON CONFLICT DO NOTHING;

-- ============================================
-- MIGRATE EXISTING USERS
-- ============================================
-- Assign role_id based on existing 'role' column
UPDATE users
SET role_id = '00000000-0000-0000-0000-000000000001'
WHERE role = 'admin' AND role_id IS NULL;

UPDATE users
SET role_id = '00000000-0000-0000-0000-000000000006'
WHERE role = 'member' AND role_id IS NULL;

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_permissions_module ON permissions(module);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON role_permissions(permission_id);

COMMENT ON TABLE roles IS 'System roles for RBAC';
COMMENT ON TABLE permissions IS 'Granular permissions for system actions';
COMMENT ON TABLE role_permissions IS 'Mapping between roles and permissions';
