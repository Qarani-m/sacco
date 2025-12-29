const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const { checkPermission } = require('../middleware/checkPermission');
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const User = require('../models/User');

// All role management routes require authentication and Admin role
router.use(authMiddleware);
router.use(checkRole('Admin'));

/**
 * GET /roles
 * List all roles
 */
router.get('/', async (req, res) => {
    try {
        const roles = await Role.getAll();

        res.render('admin/roles/index', {
            title: 'Role Management',
            roles,
            user: req.user
        });
    } catch (error) {
        console.error('Error fetching roles:', error);
        req.flash('error_msg', 'Failed to load roles');
        res.redirect('/admin/dashboard');
    }
});

/**
 * GET /roles/:roleId
 * View role details and permissions
 */
router.get('/:roleId', async (req, res) => {
    try {
        const { roleId } = req.params;

        const role = await Role.findById(roleId);
        if (!role) {
            req.flash('error_msg', 'Role not found');
            return res.redirect('/roles');
        }

        const permissions = await Role.getPermissions(roleId);
        const users = await Role.getUsers(roleId);
        const allPermissions = await Permission.getAllGroupedByModule();

        res.render('admin/roles/view', {
            title: `Role: ${role.name}`,
            role,
            permissions,
            users,
            allPermissions,
            user: req.user
        });
    } catch (error) {
        console.error('Error fetching role details:', error);
        req.flash('error_msg', 'Failed to load role details');
        res.redirect('/roles');
    }
});

/**
 * POST /roles/:roleId/permissions/assign
 * Assign permission to role
 */
router.post('/:roleId/permissions/assign', async (req, res) => {
    try {
        const { roleId } = req.params;
        const { permissionId } = req.body;

        await Role.assignPermission(roleId, permissionId);

        req.flash('success_msg', 'Permission assigned successfully');
        res.redirect(`/roles/${roleId}`);
    } catch (error) {
        console.error('Error assigning permission:', error);
        req.flash('error_msg', 'Failed to assign permission');
        res.redirect(`/roles/${roleId}`);
    }
});

/**
 * POST /roles/:roleId/permissions/remove
 * Remove permission from role
 */
router.post('/:roleId/permissions/remove', async (req, res) => {
    try {
        const { roleId } = req.params;
        const { permissionId } = req.body;

        await Role.removePermission(roleId, permissionId);

        req.flash('success_msg', 'Permission removed successfully');
        res.redirect(`/roles/${roleId}`);
    } catch (error) {
        console.error('Error removing permission:', error);
        req.flash('error_msg', 'Failed to remove permission');
        res.redirect(`/roles/${roleId}`);
    }
});

/**
 * POST /roles/assign-user
 * Assign role to user
 */
router.post('/assign-user', async (req, res) => {
    try {
        const { userId, roleId } = req.body;

        await User.assignRole(userId, roleId);

        res.json({
            success: true,
            message: 'Role assigned successfully'
        });
    } catch (error) {
        console.error('Error assigning role to user:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to assign role'
        });
    }
});

/**
 * GET /roles/api/permissions
 * Get all permissions (API endpoint)
 */
router.get('/api/permissions', async (req, res) => {
    try {
        const permissions = await Permission.getAllGroupedByModule();
        res.json({
            success: true,
            permissions
        });
    } catch (error) {
        console.error('Error fetching permissions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load permissions'
        });
    }
});

module.exports = router;
