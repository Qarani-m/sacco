const db = require('./db');

class Role {
    /**
     * Get all roles
     */
    static async getAll() {
        const query = `
      SELECT id, name, description, is_active, created_at
      FROM roles
      WHERE is_active = true
      ORDER BY name
    `;
        const result = await db.query(query);
        return result.rows;
    }

    /**
     * Get role by ID
     */
    static async findById(roleId) {
        const query = `
      SELECT id, name, description, is_active, created_at
      FROM roles
      WHERE id = $1
    `;
        const result = await db.query(query, [roleId]);
        return result.rows[0];
    }

    /**
     * Get role by name
     */
    static async findByName(name) {
        const query = `
      SELECT id, name, description, is_active, created_at
      FROM roles
      WHERE name = $1
    `;
        const result = await db.query(query, [name]);
        return result.rows[0];
    }

    /**
     * Get permissions for a role
     */
    static async getPermissions(roleId) {
        const query = `
      SELECT p.id, p.name, p.description, p.module, p.action
      FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = $1
      ORDER BY p.module, p.action
    `;
        const result = await db.query(query, [roleId]);
        return result.rows;
    }

    /**
     * Check if role has specific permission
     */
    static async hasPermission(roleId, permissionName) {
        const query = `
      SELECT COUNT(*) as count
      FROM role_permissions rp
      INNER JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = $1 AND p.name = $2
    `;
        const result = await db.query(query, [roleId, permissionName]);
        return parseInt(result.rows[0].count) > 0;
    }

    /**
     * Assign permission to role
     */
    static async assignPermission(roleId, permissionId) {
        const query = `
      INSERT INTO role_permissions (role_id, permission_id)
      VALUES ($1, $2)
      ON CONFLICT (role_id, permission_id) DO NOTHING
      RETURNING *
    `;
        const result = await db.query(query, [roleId, permissionId]);
        return result.rows[0];
    }

    /**
     * Remove permission from role
     */
    static async removePermission(roleId, permissionId) {
        const query = `
      DELETE FROM role_permissions
      WHERE role_id = $1 AND permission_id = $2
    `;
        await db.query(query, [roleId, permissionId]);
    }

    /**
     * Create new role
     */
    static async create(roleData) {
        const { name, description } = roleData;
        const query = `
      INSERT INTO roles (name, description)
      VALUES ($1, $2)
      RETURNING *
    `;
        const result = await db.query(query, [name, description]);
        return result.rows[0];
    }

    /**
     * Update role
     */
    static async update(roleId, roleData) {
        const { name, description, is_active } = roleData;
        const query = `
      UPDATE roles
      SET name = $1, description = $2, is_active = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `;
        const result = await db.query(query, [name, description, is_active, roleId]);
        return result.rows[0];
    }

    /**
     * Delete role (soft delete by setting is_active = false)
     */
    static async delete(roleId) {
        const query = `
      UPDATE roles
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
        const result = await db.query(query, [roleId]);
        return result.rows[0];
    }

    /**
     * Get users with this role
     */
    static async getUsers(roleId) {
        const query = `
      SELECT id, email, full_name, phone_number, is_active, created_at
      FROM users
      WHERE role_id = $1
      ORDER BY full_name
    `;
        const result = await db.query(query, [roleId]);
        return result.rows;
    }
}

module.exports = Role;
