const db = require('./db');

class Permission {
    /**
     * Get all permissions
     */
    static async getAll() {
        const query = `
      SELECT id, name, description, module, action, created_at
      FROM permissions
      ORDER BY module, action
    `;
        const result = await db.query(query);
        return result.rows;
    }

    /**
     * Get permissions by module
     */
    static async getByModule(module) {
        const query = `
      SELECT id, name, description, module, action, created_at
      FROM permissions
      WHERE module = $1
      ORDER BY action
    `;
        const result = await db.query(query, [module]);
        return result.rows;
    }

    /**
     * Get permission by ID
     */
    static async findById(permissionId) {
        const query = `
      SELECT id, name, description, module, action, created_at
      FROM permissions
      WHERE id = $1
    `;
        const result = await db.query(query, [permissionId]);
        return result.rows[0];
    }

    /**
     * Get permission by name
     */
    static async findByName(name) {
        const query = `
      SELECT id, name, description, module, action, created_at
      FROM permissions
      WHERE name = $1
    `;
        const result = await db.query(query, [name]);
        return result.rows[0];
    }

    /**
     * Create new permission
     */
    static async create(permissionData) {
        const { name, description, module, action } = permissionData;
        const query = `
      INSERT INTO permissions (name, description, module, action)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
        const result = await db.query(query, [name, description, module, action]);
        return result.rows[0];
    }

    /**
     * Update permission
     */
    static async update(permissionId, permissionData) {
        const { name, description, module, action } = permissionData;
        const query = `
      UPDATE permissions
      SET name = $1, description = $2, module = $3, action = $4
      WHERE id = $5
      RETURNING *
    `;
        const result = await db.query(query, [name, description, module, action, permissionId]);
        return result.rows[0];
    }

    /**
     * Delete permission
     */
    static async delete(permissionId) {
        const query = `DELETE FROM permissions WHERE id = $1`;
        await db.query(query, [permissionId]);
    }

    /**
     * Get roles that have this permission
     */
    static async getRoles(permissionId) {
        const query = `
      SELECT r.id, r.name, r.description, r.is_active
      FROM roles r
      INNER JOIN role_permissions rp ON r.id = rp.role_id
      WHERE rp.permission_id = $1
      ORDER BY r.name
    `;
        const result = await db.query(query, [permissionId]);
        return result.rows;
    }

    /**
     * Get all permissions grouped by module
     */
    static async getAllGroupedByModule() {
        const permissions = await this.getAll();
        const grouped = {};

        permissions.forEach(permission => {
            if (!grouped[permission.module]) {
                grouped[permission.module] = [];
            }
            grouped[permission.module].push(permission);
        });

        return grouped;
    }
}

module.exports = Permission;
