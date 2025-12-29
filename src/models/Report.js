// models/Report.js
const db = require('./db');

class Report {
    // =======================
    // Member Reports
    // =======================
    
    // Personal savings report (previous year + current year + total)
    static async getPersonalSavings(userId) {
        const query = `
            SELECT
                EXTRACT(YEAR FROM date) AS year,
                SUM(amount) AS total_savings
            FROM savings
            WHERE user_id = $1
            GROUP BY EXTRACT(YEAR FROM date)
            ORDER BY year
        `;
        const result = await db.query(query, [userId]);
        return result.rows;
    }

    // Personal shares report
    static async getPersonalShares(userId) {
        const query = `
            SELECT quantity, amount_paid, purchase_date, status
            FROM shares
            WHERE user_id = $1
            ORDER BY purchase_date DESC
        `;
        const result = await db.query(query, [userId]);
        return result.rows;
    }

    // Personal loan history
    static async getPersonalLoans(userId) {
        const query = `
            SELECT l.*, lg.guarantor_id
            FROM loans l
            LEFT JOIN loan_guarantors lg ON lg.loan_id = l.id
            WHERE l.borrower_id = $1
            ORDER BY l.created_at DESC
        `;
        const result = await db.query(query, [userId]);
        return result.rows;
    }

    // Personal welfare contributions
    static async getPersonalWelfare(userId) {
        const query = `
            SELECT amount, payment_date
            FROM welfare_payments
            WHERE user_id = $1
            ORDER BY payment_date DESC
        `;
        const result = await db.query(query, [userId]);
        return result.rows;
    }

    // =======================
    // SACCO-wide Reports (Admin)
    // =======================

    static async getSaccoLoans(filters = {}) {
        let query = `SELECT * FROM loans WHERE 1=1`;
        const params = [];
        let i = 1;

        if (filters.start_date) {
            query += ` AND created_at >= $${i++}`;
            params.push(filters.start_date);
        }
        if (filters.end_date) {
            query += ` AND created_at <= $${i++}`;
            params.push(filters.end_date);
        }
        if (filters.status) {
            query += ` AND status = $${i++}`;
            params.push(filters.status);
        }

        const result = await db.query(query, params);
        return result.rows;
    }

    static async getSaccoShares(filters = {}) {
        let query = `
            SELECT s.*, u.full_name, u.email
            FROM shares s
            INNER JOIN users u ON s.user_id = u.id
            WHERE 1=1
        `;
        const params = [];
        let i = 1;

        if (filters.start_date) {
            query += ` AND s.purchase_date >= $${i++}`;
            params.push(filters.start_date);
        }
        if (filters.end_date) {
            query += ` AND s.purchase_date <= $${i++}`;
            params.push(filters.end_date);
        }

        const result = await db.query(query, params);
        return result.rows;
    }

    static async getSaccoWelfare(filters = {}) {
        let query = `
            SELECT w.*, u.full_name, u.email
            FROM welfare_payments w
            INNER JOIN users u ON w.user_id = u.id
            WHERE 1=1
        `;
        const params = [];
        let i = 1;

        if (filters.year) {
            query += ` AND EXTRACT(YEAR FROM payment_date) = $${i++}`;
            params.push(filters.year);
        }

        const result = await db.query(query, params);
        return result.rows;
    }

 static async getSaccoSavings(filters = {}) {
    let query = `
        SELECT
            SUM(sy.total_amount) AS total_savings,
            SUM(ss.total_interest_collected) AS total_interest
        FROM sacco_savings ss
        LEFT JOIN (
            SELECT year, SUM(amount) AS total_amount
            FROM savings
            GROUP BY year
        ) sy ON sy.year = ss.year
        WHERE 1=1
    `;

    const params = [];
    let i = 1;

    if (filters.year) {
        query += ` AND ss.year = $${i++}`;
        params.push(filters.year);
    }

    const result = await db.query(query, params);
    return result.rows[0];
}


    static async getMemberStats() {
        const query = `
            SELECT COUNT(*) AS total_members,
                   SUM(CASE WHEN is_active THEN 1 ELSE 0 END) AS active_members,
                   SUM(CASE WHEN is_active THEN 0 ELSE 1 END) AS inactive_members
            FROM users
        `;
        const result = await db.query(query);
        return result.rows[0];
    }

    static async getDefaulters() {
        const query = `
            SELECT l.*, u.full_name, u.email
            FROM loans l
            INNER JOIN users u ON l.borrower_id = u.id
            WHERE l.status = 'defaulted'
        `;
        const result = await db.query(query);
        return result.rows;
    }
}

module.exports = Report;
