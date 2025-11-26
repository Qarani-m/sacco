const db = require('./db');

class SaccoSavings {
    // Add interest to SACCO savings
    static async addInterest(year, amount) {
        const query = `
            INSERT INTO sacco_savings (year, total_interest_collected)
            VALUES ($1, $2)
            ON CONFLICT (year) DO UPDATE
            SET total_interest_collected = sacco_savings.total_interest_collected + $2,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *
        `;
        const result = await db.query(query, [year, amount]);
        return result.rows[0];
    }

    // Get SACCO savings by year
    static async getByYear(year) {
        const query = 'SELECT * FROM sacco_savings WHERE year = $1';
        const result = await db.query(query, [year]);
        return result.rows[0];
    }

    // Get total SACCO savings
    static async getTotal() {
        const query = 'SELECT COALESCE(SUM(total_interest_collected), 0) as total FROM sacco_savings';
        const result = await db.query(query);
        return parseFloat(result.rows[0].total);
    }
}

module.exports = SaccoSavings;