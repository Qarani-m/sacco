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
                return res.status(401).render('errors/403', {
                    title: 'Unauthorized',
                    message: 'Authentication required. Please log in to access this resource.'
                });
            }

            // Get user's role
            const roleId = req.user.role_id;
            if (!roleId) {
                return res.status(403).render('errors/403', {
                    title: 'Access Denied',
                    message: 'No role assigned to your account. Please contact the administrator.'
                });
            }

            // Get role details
            const userRole = await Role.findById(roleId);
            if (!userRole) {
                return res.status(403).render('errors/403', {
                    title: 'Access Denied',
                    message: 'Invalid role assigned to your account. Please contact the administrator.'
                });
            }

            // Check if user's role is in allowed roles
            if (!roles.includes(userRole.name)) {
                return res.status(403).render('errors/403', {
                    title: 'Access Denied',
                    message: `Access denied. This page requires ${roles.join(' or ')} role. Your current role is ${userRole.name}.`
                });
            }

            // Role check passed
            next();
        } catch (error) {
            console.error('Role check error:', error);
            res.status(500).render('errors/500', {
                title: 'Server Error',
                message: 'An error occurred while checking your permissions.'
            });
        }
    };
}

module.exports = checkRole;
