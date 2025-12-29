const db = require('./db');
const { v4: uuidv4 } = require('uuid');

class SaccoIncome {
    /**
     * Record income
     */
    static async record(incomeData) {
        const { income_type, amount, source_user_id, related_entity_type, related_entity_id, description } = incomeData;
        const id = uuidv4();

        const query = `
      INSERT INTO sacco_income (id, income_type, amount, source_user_id, related_entity_type, related_entity_id, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

        const result = await db.query(query, [id, income_type, amount, source_user_id, related_entity_type, related_entity_id, description]);
        return result.rows[0];
    }

    /**
     * Get total income by type
     */
    static async getTotalByType(incomeType, startDate = null, endDate = null) {
        let query = `
      SELECT COALESCE(SUM(amount), 0) as total
      FROM sacco_income
      WHERE income_type = $1
    `;
        const params = [incomeType];

        if (startDate && endDate) {
            query += ` AND recorded_at BETWEEN $2 AND $3`;
            params.push(startDate, endDate);
        }

        const result = await db.query(query, params);
        return parseFloat(result.rows[0].total);
    }

    /**
     * Get total income (all types)
     */
    static async getTotalIncome(startDate = null, endDate = null) {
        let query = `
      SELECT COALESCE(SUM(amount), 0) as total
      FROM sacco_income
      WHERE 1=1
    `;
        const params = [];

        if (startDate && endDate) {
            query += ` AND recorded_at BETWEEN $1 AND $2`;
            params.push(startDate, endDate);
        }

        const result = await db.query(query, params);
        return parseFloat(result.rows[0].total);
    }

    /**
     * Get income breakdown
     */
    static async getBreakdown(startDate = null, endDate = null) {
        let query = `
      SELECT 
        income_type,
        COUNT(*) as count,
        SUM(amount) as total
      FROM sacco_income
      WHERE 1=1
    `;
        const params = [];

        if (startDate && endDate) {
            query += ` AND recorded_at BETWEEN $1 AND $2`;
            params.push(startDate, endDate);
        }

        query += ` GROUP BY income_type ORDER BY total DESC`;

        const result = await db.query(query, params);
        return result.rows;
    }

    /**
     * Get income history
     */
    static async getHistory(limit = 100, offset = 0) {
        const query = `
      SELECT si.*, u.full_name as source_user_name
      FROM sacco_income si
      LEFT JOIN users u ON si.source_user_id = u.id
      ORDER BY si.recorded_at DESC
      LIMIT $1 OFFSET $2
    `;
        const result = await db.query(query, [limit, offset]);
        return result.rows;
    }

    /**
     * Record loan processing fee
     */
    static async recordProcessingFee(loanId, userId, amount = 150) {
        return await this.record({
            income_type: 'processing_fee',
            amount,
            source_user_id: userId,
            related_entity_type: 'loan',
            related_entity_id: loanId,
            description: `Loan processing fee for loan ${loanId}`
        });
    }

    /**
     * Record registration fee
     */
    static async recordRegistrationFee(userId, amount = 500) {
        return await this.record({
            income_type: 'registration_fee',
            amount,
            source_user_id: userId,
            related_entity_type: 'user',
            related_entity_id: userId,
            description: `Registration fee for user ${userId}`
        });
    }

    /**
     * Record loan interest income
     */
    static async recordLoanInterest(loanId, userId, amount) {
        return await this.record({
            income_type: 'loan_interest',
            amount,
            source_user_id: userId,
            related_entity_type: 'loan',
            related_entity_id: loanId,
            description: `Loan interest from loan ${loanId}`
        });
    }

    /**
     * Record penalty income
     */
    static async recordPenalty(penaltyId, userId, amount) {
        return await this.record({
            income_type: 'penalty',
            amount,
            source_user_id: userId,
            related_entity_type: 'penalty',
            related_entity_id: penaltyId,
            description: `Late payment penalty ${penaltyId}`
        });
    }
}

module.exports = SaccoIncome;
