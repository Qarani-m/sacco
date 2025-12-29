const Role = require('../models/Role');

/**
 * Middleware to check if user has a specific role
 * Usage: checkRole('Admin') or checkRole(['Admin', 'Finance'])
 */
function checkRole(allowedRoles) {
    // Convert single role to array
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

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

            // Get role details
            const userRole = await Role.findById(roleId);
            if (!userRole) {
                return res.status(403).json({
                    success: false,
                    error: 'Invalid role'
                });
            }

            // Check if user's role is in allowed roles
            if (!roles.includes(userRole.name)) {
                return res.status(403).json({
                    success: false,
                    error: `Access denied: ${roles.join(' or ')} role required`,
                    required_roles: roles,
                    user_role: userRole.name
                });
            }

            // Role check passed
            next();
        } catch (error) {
            console.error('Role check error:', error);
            res.status(500).json({
                success: false,
                error: 'Error checking role'
            });
        }
    };
}

module.exports = checkRole;
