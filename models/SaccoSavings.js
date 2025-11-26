const db = require('./db');

class SaccoSavings {
    // Create new savings entry (e.g. from loan interest)
    static async create(savingsData) {
        const { amount, source, description } = savingsData;
        
        const query = `
            INSERT INTO sacco_savings_ledger (amount, source, description, transaction_date)
            VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
            RETURNING *
        `;
        
        const result = await db.query(query, [amount, source, description]);
        return result.rows[0];
    }

    // Get total SACCO savings
    static async getTotal() {
        const query = `
            SELECT COALESCE(SUM(amount), 0) as total
            FROM sacco_savings_ledger
        `;
        const result = await db.query(query);
        return parseFloat(result.rows[0].total);
    }

    // Get transaction history
    static async getHistory(limit = 20, offset = 0) {
        const query = `
            SELECT *
            FROM sacco_savings_ledger
            ORDER BY transaction_date DESC
            LIMIT $1 OFFSET $2
        `;
        const result = await db.query(query, [limit, offset]);
        return result.rows;
    }

    // Get monthly report
    static async getMonthlyReport(year, month) {
        const query = `
            SELECT 
                source,
                COUNT(*) as transaction_count,
                SUM(amount) as total_amount
            FROM sacco_savings_ledger
            WHERE EXTRACT(YEAR FROM transaction_date) = $1
            AND EXTRACT(MONTH FROM transaction_date) = $2
            GROUP BY source
            ORDER BY total_amount DESC
        `;
        const result = await db.query(query, [year, month]);
        return result.rows;
    }
}

module.exports = SaccoSavings;