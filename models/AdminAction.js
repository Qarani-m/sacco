const db = require('./db');

class AdminAction {
    // Create admin action (requires 2/3 approval)
    static async create(actionData) {
        const { initiated_by, action_type, entity_type, entity_id, reason, action_data } = actionData;
        
        const query = `
            INSERT INTO admin_actions (initiated_by, action_type, entity_type, entity_id, reason, action_data)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        
        const result = await db.query(query, [
            initiated_by, 
            action_type, 
            entity_type, 
            entity_id, 
            reason, 
            JSON.stringify(action_data)
        ]);
        return result.rows[0];
    }

    // Get action by ID
    static async findById(actionId) {
        const query = `
            SELECT aa.*, u.full_name as initiator_name
            FROM admin_actions aa
            INNER JOIN users u ON aa.initiated_by = u.id
            WHERE aa.id = $1
        `;
        const result = await db.query(query, [actionId]);
        if (result.rows[0] && typeof result.rows[0].action_data === 'string') {
            result.rows[0].action_data = JSON.parse(result.rows[0].action_data);
        }
        return result.rows[0];
    }

    // Get pending actions
    static async getPending() {
        const query = `
            SELECT aa.*, u.full_name as initiator_name
            FROM admin_actions aa
            INNER JOIN users u ON aa.initiated_by = u.id
            WHERE aa.status = 'pending'
            ORDER BY aa.created_at
        `;
        const result = await db.query(query);
        return result.rows.map(row => {
            if (typeof row.action_data === 'string') {
                row.action_data = JSON.parse(row.action_data);
            }
            return row;
        });
    }

    // Get actions history
    static async getHistory(filters = {}) {
        let query = `
            SELECT aa.*, u.full_name as initiator_name
            FROM admin_actions aa
            INNER JOIN users u ON aa.initiated_by = u.id
            WHERE 1=1
        `;
        const params = [];
        let paramCount = 1;

        if (filters.status) {
            query += ` AND aa.status = $${paramCount}`;
            params.push(filters.status);
            paramCount++;
        }

        if (filters.initiated_by) {
            query += ` AND aa.initiated_by = $${paramCount}`;
            params.push(filters.initiated_by);
            paramCount++;
        }

        query += ' ORDER BY aa.created_at DESC';

        const result = await db.query(query, params);
        return result.rows.map(row => {
            if (typeof row.action_data === 'string') {
                row.action_data = JSON.parse(row.action_data);
            }
            return row;
        });
    }

    // Update action status
    static async updateStatus(actionId, status) {
        const query = `
            UPDATE admin_actions
            SET status = $1
            WHERE id = $2
            RETURNING *
        `;
        const result = await db.query(query, [status, actionId]);
        return result.rows[0];
    }

    // Create verification record
    static async addVerification(verificationData) {
        const { action_id, verifier_id, decision, comment } = verificationData;
        
        const query = `
            INSERT INTO admin_verifications (action_id, verifier_id, decision, comment)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        
        const result = await db.query(query, [action_id, verifier_id, decision, comment]);
        return result.rows[0];
    }

    // Get verifications for an action
    static async getVerifications(actionId) {
        const query = `
            SELECT av.*, u.full_name as verifier_name
            FROM admin_verifications av
            INNER JOIN users u ON av.verifier_id = u.id
            WHERE av.action_id = $1
            ORDER BY av.created_at
        `;
        const result = await db.query(query, [actionId]);
        return result.rows;
    }

    // Check if admin has already verified
    static async hasVerified(actionId, verifierId) {
        const query = `
            SELECT COUNT(*) as count
            FROM admin_verifications
            WHERE action_id = $1 AND verifier_id = $2
        `;
        const result = await db.query(query, [actionId, verifierId]);
        return parseInt(result.rows[0].count) > 0;
    }

    // Count approvals for action
    static async countApprovals(actionId) {
        const query = `
            SELECT COUNT(*) as count
            FROM admin_verifications
            WHERE action_id = $1 AND decision = 'approved'
        `;
        const result = await db.query(query, [actionId]);
        return parseInt(result.rows[0].count);
    }

    // Count rejections for action
    static async countRejections(actionId) {
        const query = `
            SELECT COUNT(*) as count
            FROM admin_verifications
            WHERE action_id = $1 AND decision = 'rejected'
        `;
        const result = await db.query(query, [actionId]);
        return parseInt(result.rows[0].count);
    }
}

module.exports = AdminAction;