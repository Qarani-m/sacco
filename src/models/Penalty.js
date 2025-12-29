const db = require('./db');
const { v4: uuidv4 } = require('uuid');

class Penalty {
    /**
     * Create a penalty
     */
    static async create(penaltyData) {
        const { user_id, penalty_type, amount = 500, due_date, related_entity_id, description } = penaltyData;
        const id = uuidv4();

        const query = `
      INSERT INTO penalties (id, user_id, penalty_type, amount, due_date, related_entity_id, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

        const result = await db.query(query, [id, user_id, penalty_type, amount, due_date, related_entity_id, description]);
        return result.rows[0];
    }

    /**
     * Get penalties by user
     */
    static async getByUser(userId, status = null) {
        let query = `
      SELECT * FROM penalties
      WHERE user_id = $1
    `;
        const params = [userId];

        if (status) {
            query += ` AND status = $2`;
            params.push(status);
        }

        query += ` ORDER BY due_date DESC`;

        const result = await db.query(query, params);
        return result.rows;
    }

    /**
     * Get all pending penalties
     */
    static async getPending() {
        const query = `
      SELECT p.*, u.full_name, u.email
      FROM penalties p
      INNER JOIN users u ON p.user_id = u.id
      WHERE p.status = 'pending'
      ORDER BY p.due_date
    `;
        const result = await db.query(query);
        return result.rows;
    }

    /**
     * Mark penalty as paid
     */
    static async markAsPaid(penaltyId) {
        const query = `
      UPDATE penalties
      SET status = 'paid', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
        const result = await db.query(query, [penaltyId]);
        return result.rows[0];
    }

    /**
     * Waive penalty (admin action)
     */
    static async waive(penaltyId) {
        const query = `
      UPDATE penalties
      SET status = 'waived', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
        const result = await db.query(query, [penaltyId]);
        return result.rows[0];
    }

    /**
     * Check and apply late payment penalties
     * Run this daily via cron job
     */
    static async applyLatePenalties() {
        const today = new Date();
        const currentDay = today.getDate();

        // Only apply penalties on the 6th (day after due date)
        if (currentDay !== 6) {
            return { message: 'Not penalty application day' };
        }

        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const dueDate = new Date(currentYear, currentMonth, 5); // 5th of current month

        const penalties = [];

        // Check for late loan payments
        const lateLoans = await db.query(`
      SELECT l.id, l.borrower_id, l.balance_remaining
      FROM loans l
      WHERE l.status = 'active'
        AND l.balance_remaining > 0
        AND NOT EXISTS (
          SELECT 1 FROM loan_repayments lr
          WHERE lr.loan_id = l.id
            AND DATE(lr.payment_date) >= $1
            AND DATE(lr.payment_date) <= $2
        )
    `, [dueDate, today]);

        for (const loan of lateLoans.rows) {
            const penalty = await this.create({
                user_id: loan.borrower_id,
                penalty_type: 'loan',
                amount: 500,
                due_date: dueDate,
                related_entity_id: loan.id,
                description: `Late loan payment penalty for ${dueDate.toLocaleDateString()}`
            });
            penalties.push(penalty);
        }

        // Check for late welfare payments
        const lateWelfare = await db.query(`
      SELECT DISTINCT u.id as user_id
      FROM users u
      WHERE u.role = 'member'
        AND u.is_active = true
        AND NOT EXISTS (
          SELECT 1 FROM welfare_payments wp
          WHERE wp.user_id = u.id
            AND DATE(wp.payment_date) >= $1
            AND DATE(wp.payment_date) <= $2
        )
    `, [dueDate, today]);

        for (const user of lateWelfare.rows) {
            const penalty = await this.create({
                user_id: user.user_id,
                penalty_type: 'welfare',
                amount: 500,
                due_date: dueDate,
                description: `Late welfare payment penalty for ${dueDate.toLocaleDateString()}`
            });
            penalties.push(penalty);
        }

        return { penalties, count: penalties.length };
    }
}

module.exports = Penalty;
