const db = require('./db');

class WelfarePayment {
    // Create welfare payment
    static async create(paymentData) {
        const { user_id, amount, payment_method, transaction_ref } = paymentData;
        
        const query = `
            INSERT INTO welfare_payments (user_id, amount, payment_date, payment_method, transaction_ref)
            VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4)
            RETURNING *
        `;
        
        const result = await db.query(query, [user_id, amount, payment_method, transaction_ref]);
        return result.rows[0];
    }

    // Get user's welfare payments
    static async getByUser(userId) {
        const query = `
            SELECT * FROM welfare_payments
            WHERE user_id = $1
            ORDER BY payment_date DESC
        `;
        const result = await db.query(query, [userId]);
        return result.rows;
    }

    // Get user's total welfare paid
    static async getTotalByUser(userId) {
        const query = `
            SELECT COALESCE(SUM(amount), 0) as total_paid
            FROM welfare_payments
            WHERE user_id = $1
        `;
        const result = await db.query(query, [userId]);
        return parseFloat(result.rows[0].total_paid);
    }

    // Get user's welfare stats
    static async getStatsByUser(userId) {
        const query = `
            SELECT 
                COALESCE(SUM(amount), 0) as total_paid,
                COUNT(*) as payment_count,
                MAX(payment_date) as last_payment_date
            FROM welfare_payments
            WHERE user_id = $1
        `;
        const result = await db.query(query, [userId]);
        return result.rows[0];
    }

    // Get all welfare payments (admin)
    static async getAll(filters = {}) {
        let query = `
            SELECT wp.*, u.full_name, u.email
            FROM welfare_payments wp
            INNER JOIN users u ON wp.user_id = u.id
            WHERE 1=1
        `;
        const params = [];
        let paramCount = 1;

        if (filters.user_id) {
            query += ` AND wp.user_id = $${paramCount}`;
            params.push(filters.user_id);
            paramCount++;
        }

        if (filters.start_date) {
            query += ` AND wp.payment_date >= $${paramCount}`;
            params.push(filters.start_date);
            paramCount++;
        }

        if (filters.end_date) {
            query += ` AND wp.payment_date <= $${paramCount}`;
            params.push(filters.end_date);
            paramCount++;
        }

        query += ' ORDER BY wp.payment_date DESC';

        const result = await db.query(query, params);
        return result.rows;
    }

    // Get yearly welfare report
    static async getYearlyReport(year) {
        const query = `
            SELECT 
                u.full_name,
                u.email,
                COUNT(*) as payment_count,
                SUM(wp.amount) as total_paid
            FROM welfare_payments wp
            INNER JOIN users u ON wp.user_id = u.id
            WHERE EXTRACT(YEAR FROM wp.payment_date) = $1
            GROUP BY u.id, u.full_name, u.email
            ORDER BY total_paid DESC
        `;
        const result = await db.query(query, [year]);
        return result.rows;
    }
}

module.exports = WelfarePayment;