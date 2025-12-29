# RBAC Implementation - Quick Start Guide

## 🚀 Getting Started

### 1. Run the Migration

```bash
cd /home/martin/Desktop/New\ Folder/sacco
node src/models/migrations/run_rbac_migration.js
```

This will:
- Create `roles`, `permissions`, and `role_permissions` tables
- Seed 6 roles (Admin, Finance, Risk, Customer Service, Disbursement Officer, Member)
- Seed 35+ permissions across all modules
- Migrate existing users to new role system

### 2. Restart Your Server

```bash
# Stop current server (Ctrl+C)
npm start
```

### 3. Test RBAC

**Login as Admin:**
- Email: admin@sacco.com
- Password: Admin@123

**Check Role Management:**
- Navigate to `/roles` (Admin only)
- View roles and their permissions
- Assign permissions to roles
- Assign roles to users

## 📋 What's Been Implemented

### ✅ Database Schema
- `roles` table with 6 predefined roles
- `permissions` table with 35+ permissions
- `role_permissions` mapping table
- Updated `users` table with `role_id` column

### ✅ Models
- `Role.js` - Role management
- `Permission.js` - Permission management
- Updated `User.js` with RBAC methods

### ✅ Middleware
- `checkPermission(permission)` - Single permission check
- `checkAnyPermission([permissions])` - ANY of permissions
- `checkAllPermissions([permissions])` - ALL permissions
- `checkRole(role)` - Role-based check
- Updated `auth.js` to attach permissions

### ✅ Routes
- `/roles` - Role management (Admin only)
- Updated `/loans` routes with permission checks

### ✅ Documentation
- `RBAC_GUIDE.js` - Complete guide for applying middleware
- Migration runner with verification

## 🔐 Available Roles

1. **Admin** - Full system access
2. **Finance** - Financial operations and reporting
3. **Risk** - Loan approval and risk assessment
4. **Customer Service** - Member support
5. **Disbursement Officer** - Loan disbursement
6. **Member** - Standard member access

## 🎯 Permission Examples

```javascript
// Loan permissions
'loans.view'        // View own loans
'loans.create'      // Create loan applications
'loans.approve'     // Approve loans
'loans.disburse'    // Disburse loans
'loans.view_all'    // View all loans

// Member permissions
'members.view'      // View members
'members.create'    // Register members
'members.approve'   // Approve registrations

// Report permissions
'reports.view_own'  // View own reports
'reports.view_all'  // View all reports
'reports.export'    // Export reports
```

## 🛠️ Applying Permissions to Routes

```javascript
const { checkPermission } = require('../middleware/checkPermission');

// Single permission
router.post('/loans/request', 
  authMiddleware,
  checkPermission('loans.create'),
  loanController.requestLoan
);

// Multiple permissions (ANY)
router.get('/reports/financial',
  authMiddleware,
  checkAnyPermission(['reports.financial', 'reports.view_all']),
  reportController.viewFinancial
);

// Role-based
router.get('/admin/settings',
  authMiddleware,
  checkRole('Admin'),
  adminController.showSettings
);
```

## 📊 Checking Permissions in Code

```javascript
// In controllers
const canApprove = await User.hasPermission(userId, 'loans.approve');

// In views (EJS)
<% if (user.permissions.includes('loans.approve')) { %>
  <button>Approve Loan</button>
<% } %>
```

## 🔄 Next Steps

1. **Apply to More Routes** - See `RBAC_GUIDE.js` for examples
2. **Create Role Management UI** - Views for `/roles` routes
3. **Test Each Role** - Create test users with different roles
4. **Update Navigation** - Hide/show based on permissions

## 📝 Files Created

- `src/models/Role.js`
- `src/models/Permission.js`
- `src/models/migrations/rbac_schema.sql`
- `src/models/migrations/rbac_schema_sqlite.sql`
- `src/models/migrations/run_rbac_migration.js`
- `src/middleware/checkPermission.js`
- `src/middleware/checkRole.js`
- `src/middleware/RBAC_GUIDE.js`
- `src/routes/roles.js`
- Updated: `src/models/User.js`
- Updated: `src/middleware/auth.js`
- Updated: `src/routes/loans.js`
- Updated: `src/app.js`

## ⚠️ Important Notes

- Old `role` column kept for backward compatibility
- Existing admins migrated to Admin role
- Existing members migrated to Member role
- Permission checks return 403 Forbidden if denied
- All role management requires Admin role
