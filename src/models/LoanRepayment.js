const db = require('./db');

class LoanRepayment {
    // Record loan repayment
    static async create(repaymentData) {
        const { loan_id, user_id, amount_paid, principal_amount, interest_amount, transaction_ref } = repaymentData;
        
        const query = `
            INSERT INTO loan_repayments (loan_id, user_id, amount_paid, principal_amount, interest_amount, payment_date, transaction_ref)
            VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6)
            RETURNING *
        `;
        
        const result = await db.query(query, [loan_id, user_id, amount_paid, principal_amount, interest_amount, transaction_ref]);
        return result.rows[0];
    }

    // Get repayments for a loan
    static async getByLoan(loanId) {
        const query = `
            SELECT * FROM loan_repayments
            WHERE loan_id = $1
            ORDER BY payment_date DESC
        `;
        const result = await db.query(query, [loanId]);
        return result.rows;
    }

    // Get total repaid for a loan
    static async getTotalByLoan(loanId) {
        const query = `
            SELECT 
                COALESCE(SUM(amount_paid), 0) as total_paid,
                COALESCE(SUM(principal_amount), 0) as total_principal,
                COALESCE(SUM(interest_amount), 0) as total_interest
            FROM loan_repayments
            WHERE loan_id = $1
        `;
        const result = await db.query(query, [loanId]);
        return result.rows[0];
    }
}

module.exports = LoanRepayment;