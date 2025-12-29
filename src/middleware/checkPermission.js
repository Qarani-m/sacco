const Role = require('../models/Role');

/**
 * Middleware to check if user has required permission
 * Usage: checkPermission('loans.approve')
 */
function checkPermission(requiredPermission) {
    return async (req, res, next) => {
        try {
            // Ensure user is authenticated
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
            }

            // Get user's role
            const roleId = req.user.role_id;
            if (!roleId) {
                return res.status(403).json({
                    success: false,
                    error: 'No role assigned to user'
                });
            }

            // Check if role has the required permission
            const hasPermission = await Role.hasPermission(roleId, requiredPermission);

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    error: `Permission denied: ${requiredPermission} required`,
                    required_permission: requiredPermission
                });
            }

            // Permission granted, proceed
            next();
        } catch (error) {
            console.error('Permission check error:', error);
            res.status(500).json({
                success: false,
                error: 'Error checking permissions'
            });
        }
    };
}

/**
 * Middleware to check if user has ANY of the required permissions
 * Usage: checkAnyPermission(['loans.approve', 'loans.disburse'])
 */
function checkAnyPermission(requiredPermissions) {
    return async (req, res, next) => {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
            }

            const roleId = req.user.role_id;
            if (!roleId) {
                return res.status(403).json({
                    success: false,
                    error: 'No role assigned to user'
                });
            }

            // Check if role has ANY of the required permissions
            for (const permission of requiredPermissions) {
                const hasPermission = await Role.hasPermission(roleId, permission);
                if (hasPermission) {
                    // Found at least one matching permission
                    return next();
                }
            }

            // No matching permissions found
            return res.status(403).json({
                success: false,
                error: 'Permission denied',
                required_permissions: requiredPermissions
            });
        } catch (error) {
            console.error('Permission check error:', error);
            res.status(500).json({
                success: false,
                error: 'Error checking permissions'
            });
        }
    };
}

/**
 * Middleware to check if user has ALL of the required permissions
 * Usage: checkAllPermissions(['loans.view', 'loans.approve'])
 */
function checkAllPermissions(requiredPermissions) {
    return async (req, res, next) => {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
            }

            const roleId = req.user.role_id;
            if (!roleId) {
                return res.status(403).json({
                    success: false,
                    error: 'No role assigned to user'
                });
            }

            // Check if role has ALL required permissions
            for (const permission of requiredPermissions) {
                const hasPermission = await Role.hasPermission(roleId, permission);
                if (!hasPermission) {
                    return res.status(403).json({
                        success: false,
                        error: `Permission denied: ${permission} required`,
                        required_permissions: requiredPermissions
                    });
                }
            }

            // All permissions granted
            next();
        } catch (error) {
            console.error('Permission check error:', error);
            res.status(500).json({
                success: false,
                error: 'Error checking permissions'
            });
        }
    };
}

/**
 * Attach user permissions to request object
 * Call this after authentication to make permissions available
 */
async function attachPermissions(req, res, next) {
    try {
        if (req.user && req.user.role_id) {
            const permissions = await Role.getPermissions(req.user.role_id);
            req.user.permissions = permissions.map(p => p.name);
        }
        next();
    } catch (error) {
        console.error('Error attaching permissions:', error);
        next(); // Continue even if permissions fail to load
    }
}

module.exports = {
    checkPermission,
    checkAnyPermission,
    checkAllPermissions,
    attachPermissions
};
