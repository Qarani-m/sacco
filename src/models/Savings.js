const db = require('./db');

class Savings {
    // Add to savings
    static async create(savingsData) {
        const { user_id, year, amount, type } = savingsData;
        
        const query = `
            INSERT INTO savings (user_id, year, amount, type)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        
        const result = await db.query(query, [user_id, year, amount, type]);
        return result.rows[0];
    }

    // Get user's savings by year
    static async getByYear(userId, year) {
        const query = `
            SELECT COALESCE(SUM(amount), 0) as total
            FROM savings
            WHERE user_id = $1 AND year = $2
        `;
        const result = await db.query(query, [userId, year]);
        return parseFloat(result.rows[0].total);
    }

    // Get user's total savings
    static async getTotalByUser(userId) {
        const query = `
            SELECT COALESCE(SUM(amount), 0) as total
            FROM savings
            WHERE user_id = $1
        `;
        const result = await db.query(query, [userId]);
        return parseFloat(result.rows[0].total);
    }

    // Get yearly report
    static async getYearlyReport(userId, currentYear) {
        const query = `
            SELECT 
                (SELECT COALESCE(SUM(amount), 0) FROM savings WHERE user_id = $1 AND year < $2) as previous_savings,
                (SELECT COALESCE(SUM(amount), 0) FROM savings WHERE user_id = $1 AND year = $2) as current_year_savings,
                (SELECT COALESCE(SUM(amount), 0) FROM savings WHERE user_id = $1) as total_savings
        `;
        const result = await db.query(query, [userId, currentYear]);
        return result.rows[0];
    }
}

module.exports = Savings;