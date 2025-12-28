const { v4: uuidv4 } = require('uuid');
const db = require('./db');

class Share {
    // Purchase shares
    static async create(shareData) {
        const { user_id, quantity, amount_paid } = shareData;
        const id = uuidv4();

        const query = `
            INSERT INTO shares (id, user_id, quantity, amount_paid, purchase_date)
            VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
            RETURNING *
        `;

        const result = await db.query(query, [id, user_id, quantity, amount_paid]);
        return result.rows[0];
    }

    // Get user's total shares
    static async getTotalByUser(userId) {
        const query = `
            SELECT COALESCE(SUM(quantity), 0) as total_shares
            FROM shares
            WHERE user_id = $1
        `;
        const result = await db.query(query, [userId]);
        return parseInt(result.rows[0].total_shares);
    }

    // Get user's available shares (not pledged)
    static async getAvailableByUser(userId) {
        const query = `
            SELECT COALESCE(SUM(quantity), 0) as available_shares
            FROM shares
            WHERE user_id = $1 AND status = 'active'
        `;
        const result = await db.query(query, [userId]);
        return parseInt(result.rows[0].available_shares);
    }

    // Get user's pledged shares
    static async getPledgedByUser(userId) {
        const query = `
            SELECT s.*, l.id as loan_id, u.full_name as borrower_name
            FROM shares s
            INNER JOIN loan_guarantors lg ON s.user_id = lg.guarantor_id
            INNER JOIN loans l ON lg.loan_id = l.id
            INNER JOIN users u ON l.borrower_id = u.id
            WHERE s.user_id = $1 AND s.status = 'pledged_as_guarantee'
            AND l.status IN ('approved', 'active')
        `;
        const result = await db.query(query, [userId]);
        return result.rows;
    }

    // Pledge shares for loan guarantee
    static async pledgeShares(userId, quantity) {
        const query = `
            UPDATE shares
            SET status = 'pledged_as_guarantee'
            WHERE id IN (
                SELECT id FROM shares
                WHERE user_id = $1 AND status = 'active'
                ORDER BY purchase_date
                LIMIT $2
            )
            RETURNING *
        `;
        const result = await db.query(query, [userId, quantity]);
        return result.rows;
    }

    // Release pledged shares after loan payment
    static async releaseShares(userId, loanId) {
        const query = `
            UPDATE shares s
            SET status = 'active'
            FROM loan_guarantors lg
            WHERE s.user_id = lg.guarantor_id
            AND lg.loan_id = $1
            AND s.user_id = $2
            AND s.status = 'pledged_as_guarantee'
            RETURNING s.*
        `;
        const result = await db.query(query, [loanId, userId]);
        return result.rows;
    }

    // Get user's share history
    static async getHistory(userId) {
        const query = `
            SELECT * FROM shares
            WHERE user_id = $1
            ORDER BY purchase_date DESC
        `;
        const result = await db.query(query, [userId]);
        return result.rows;
    }

    // Get all shares (admin view)
    static async getAll(filters = {}) {
        let query = `
            SELECT s.*, u.full_name, u.email
            FROM shares s
            INNER JOIN users u ON s.user_id = u.id
            WHERE 1=1
        `;
        const params = [];
        let paramCount = 1;

        if (filters.user_id) {
            query += ` AND s.user_id = $${paramCount}`;
            params.push(filters.user_id);
            paramCount++;
        }

        if (filters.status) {
            query += ` AND s.status = $${paramCount}`;
            params.push(filters.status);
            paramCount++;
        }

        query += ' ORDER BY s.purchase_date DESC';

        const result = await db.query(query, params);
        return result.rows;
    }

    // Get share value (quantity * price)
    static async getValueByUser(userId) {
        const query = `
            SELECT COALESCE(SUM(amount_paid), 0) as total_value
            FROM shares
            WHERE user_id = $1
        `;
        const result = await db.query(query, [userId]);
        return parseFloat(result.rows[0].total_value);
    }
}

module.exports = Share;