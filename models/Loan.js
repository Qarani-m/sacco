const db = require('./db');

class Loan {
    // Create loan request
    static async create(loanData) {
        const { borrower_id, requested_amount, repayment_months } = loanData;
        const interest_rate = process.env.LOAN_INTEREST_RATE || 3;
        
        const query = `
            INSERT INTO loans (borrower_id, requested_amount, interest_rate, repayment_months)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        
        const result = await db.query(query, [borrower_id, requested_amount, interest_rate, repayment_months]);
        return result.rows[0];
    }

    // Get loan by ID
    static async findById(loanId) {
        const query = `
            SELECT l.*, u.full_name as borrower_name, u.email as borrower_email
            FROM loans l
            INNER JOIN users u ON l.borrower_id = u.id
            WHERE l.id = $1
        `;
        const result = await db.query(query, [loanId]);
        return result.rows[0];
    }

    // Get user's loans
    static async getByUser(userId, status = null) {
        let query = `
            SELECT * FROM loans
            WHERE borrower_id = $1
        `;
        const params = [userId];
        
        if (status) {
            query += ' AND status = $2';
            params.push(status);
        }
        
        query += ' ORDER BY created_at DESC';
        
        const result = await db.query(query, params);
        return result.rows;
    }

    // Get all loans (admin)
    static async getAll(filters = {}) {
        let query = `
            SELECT l.*, u.full_name as borrower_name, u.email as borrower_email
            FROM loans l
            INNER JOIN users u ON l.borrower_id = u.id
            WHERE 1=1
        `;
        const params = [];
        let paramCount = 1;

        if (filters.status) {
            query += ` AND l.status = $${paramCount}`;
            params.push(filters.status);
            paramCount++;
        }

        if (filters.borrower_id) {
            query += ` AND l.borrower_id = $${paramCount}`;
            params.push(filters.borrower_id);
            paramCount++;
        }

        query += ' ORDER BY l.created_at DESC';

        const result = await db.query(query, params);
        return result.rows;
    }

    // Approve loan
    static async approve(loanId, approvedAmount) {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            // Calculate due date (max 6 months)
            const loan = await this.findById(loanId);
            const totalWithInterest = approvedAmount * (1 + (loan.interest_rate / 100) * loan.repayment_months);

            const query = `
                UPDATE loans
                SET status = 'active', 
                    approved_amount = $1,
                    balance_remaining = $2,
                    approved_at = CURRENT_TIMESTAMP,
                    due_date = CURRENT_TIMESTAMP + INTERVAL '${loan.repayment_months} months'
                WHERE id = $3
                RETURNING *
            `;
            
            const result = await client.query(query, [approvedAmount, totalWithInterest, loanId]);
            
            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // Reject loan
    static async reject(loanId) {
        const query = `
            UPDATE loans
            SET status = 'rejected'
            WHERE id = $1
            RETURNING *
        `;
        const result = await db.query(query, [loanId]);
        return result.rows[0];
    }

    // Update loan balance
    static async updateBalance(loanId, newBalance) {
        const query = `
            UPDATE loans
            SET balance_remaining = $1,
                status = CASE WHEN $1 <= 0 THEN 'paid' ELSE status END
            WHERE id = $2
            RETURNING *
        `;
        const result = await db.query(query, [newBalance, loanId]);
        return result.rows[0];
    }

    // Cancel loan request
    static async cancel(loanId) {
        const query = `
            UPDATE loans
            SET status = 'rejected'
            WHERE id = $1 AND status = 'pending'
            RETURNING *
        `;
        const result = await db.query(query, [loanId]);
        return result.rows[0];
    }

    // Get pending loans
    static async getPendingLoans() {
        const query = `
            SELECT l.*, u.full_name as borrower_name, u.email as borrower_email
            FROM loans l
            INNER JOIN users u ON l.borrower_id = u.id
            WHERE l.status = 'pending'
            ORDER BY l.created_at
        `;
        const result = await db.query(query);
        return result.rows;
    }

    // Get active loans
    static async getActiveLoans() {
        const query = `
            SELECT l.*, u.full_name as borrower_name, u.email as borrower_email
            FROM loans l
            INNER JOIN users u ON l.borrower_id = u.id
            WHERE l.status = 'active'
            ORDER BY l.due_date
        `;
        const result = await db.query(query);
        return result.rows;
    }

    // Calculate repayment schedule
    static calculateRepaymentSchedule(loanAmount, interestRate, months) {
        const schedule = [];
        const monthlyInterest = (loanAmount * interestRate) / 100;
        const totalInterest = monthlyInterest * months;
        const totalAmount = loanAmount + totalInterest;
        const monthlyPayment = totalAmount / months;

        for (let i = 1; i <= months; i++) {
            schedule.push({
                month: i,
                payment: monthlyPayment.toFixed(2),
                principal: (loanAmount / months).toFixed(2),
                interest: monthlyInterest.toFixed(2)
            });
        }

        return {
            schedule,
            totalAmount: totalAmount.toFixed(2),
            totalInterest: totalInterest.toFixed(2)
        };
    }
}

module.exports = Loan;