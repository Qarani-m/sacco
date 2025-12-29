/**
 * Guide: Applying RBAC Middleware to Routes
 * 
 * This guide shows how to apply permission-based access control to your routes
 */

// ============================================
// 1. IMPORT THE MIDDLEWARE
// ============================================
const { checkPermission, checkAnyPermission, checkAllPermissions } = require('../middleware/checkPermission');
const checkRole = require('../middleware/checkRole');

// ============================================
// 2. APPLY TO ROUTES
// ============================================

// Single permission check
router.post('/loans/request',
    authMiddleware,
    checkPermission('loans.create'),  // Only users with loans.create permission
    loanController.requestLoan
);

// Multiple permissions (user needs ANY of these)
router.get('/reports/financial',
    authMiddleware,
    checkAnyPermission(['reports.financial', 'reports.view_all']),
    reportController.viewFinancial
);

// Multiple permissions (user needs ALL of these)
router.post('/loans/disburse',
    authMiddleware,
    checkAllPermissions(['loans.view_all', 'loans.disburse']),
    loanController.disburseLoan
);

// Role-based check (simpler, but less granular)
router.get('/admin/settings',
    authMiddleware,
    checkRole('Admin'),  // Only Admin role
    adminController.showSettings
);

// Multiple roles allowed
router.get('/loans/approve',
    authMiddleware,
    checkRole(['Admin', 'Risk', 'Finance']),  // Any of these roles
    loanController.approveLoan
);

// ============================================
// 3. PERMISSION NAMING CONVENTION
// ============================================

/*
Format: module.action

Examples:
- members.view
- members.create
- members.update
- members.delete
- members.approve
- loans.view
- loans.create
- loans.approve
- loans.disburse
- loans.view_all (view all loans, not just own)
- reports.view_own
- reports.view_all
- reports.export
- settings.manage
*/

// ============================================
// 4. RECOMMENDED ROUTE PROTECTION
// ============================================

// ADMIN ROUTES (src/routes/admin.js)
// - Most routes: checkRole('Admin')
// - Some routes: checkAnyPermission(['settings.manage', 'members.approve'])

// LOAN ROUTES (src/routes/loans.js)
// - View own loans: checkPermission('loans.view')
// - Create loan: checkPermission('loans.create')
// - Approve loan: checkPermission('loans.approve')
// - Disburse loan: checkPermission('loans.disburse')

// MEMBER ROUTES (src/routes/members.js)
// - View profile: checkPermission('members.view') (or no check for own profile)
// - Update profile: No permission check (users can update own)
// - View all members: checkPermission('members.view') + check if viewing others

// REPORT ROUTES (src/routes/reports.js)
// - View own reports: checkPermission('reports.view_own')
// - View all reports: checkPermission('reports.view_all')
// - Export reports: checkPermission('reports.export')

// SHARE/SAVINGS/WELFARE ROUTES
// - View own: checkPermission('shares.view')
// - View all: checkPermission('shares.view_all')
// - Manage: checkPermission('shares.manage')

// ============================================
// 5. ERROR HANDLING
// ============================================

/*
When permission is denied, middleware returns:
{
  success: false,
  error: "Permission denied: loans.approve required",
  required_permission: "loans.approve"
}

Status code: 403 Forbidden

Handle in frontend:
- Hide buttons/links for actions user can't perform
- Show appropriate error message if user tries anyway
*/

// ============================================
// 6. CHECKING PERMISSIONS IN CONTROLLERS
// ============================================

// If you need to check permissions in controller logic:
const User = require('../models/User');

async function someController(req, res) {
    const userId = req.user.id;

    // Check if user has permission
    const canApprove = await User.hasPermission(userId, 'loans.approve');

    if (!canApprove) {
        return res.status(403).json({
            success: false,
            error: 'You do not have permission to approve loans'
        });
    }

    // Proceed with approval logic...
}

// ============================================
// 7. CHECKING PERMISSIONS IN VIEWS (EJS)
// ============================================

/*
In your views, you can check permissions like this:

<% if (user.permissions && user.permissions.includes('loans.approve')) { %>
  <button>Approve Loan</button>
<% } %>

Note: You need to attach permissions to res.locals.user in your auth middleware
*/

module.exports = {
    // This is just a guide file, no exports needed
};
