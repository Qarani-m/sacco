const { v4: uuidv4 } = require('uuid');
const db = require('./db');

class LoanGuarantor {
    // Create guarantor request
    static async create(guarantorData) {
        const { loan_id, guarantor_id, shares_pledged, amount_covered } = guarantorData;
        const id = uuidv4();

        const query = `
            INSERT INTO loan_guarantors (id, loan_id, guarantor_id, shares_pledged, amount_covered)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;

        const result = await db.query(query, [id, loan_id, guarantor_id, shares_pledged, amount_covered]);
        return result.rows[0];
    }

    // Get guarantor request by ID
    static async findById(requestId) {
        const query = `
            SELECT lg.*, 
                   l.requested_amount, l.status as loan_status,
                   u1.full_name as guarantor_name, u1.email as guarantor_email,
                   u2.full_name as borrower_name, u2.email as borrower_email
            FROM loan_guarantors lg
            INNER JOIN loans l ON lg.loan_id = l.id
            INNER JOIN users u1 ON lg.guarantor_id = u1.id
            INNER JOIN users u2 ON l.borrower_id = u2.id
            WHERE lg.id = $1
        `;
        const result = await db.query(query, [requestId]);
        return result.rows[0];
    }

    // Get guarantors for a loan
    static async getByLoan(loanId) {
        const query = `
            SELECT lg.*, u.full_name as guarantor_name, u.email as guarantor_email
            FROM loan_guarantors lg
            INNER JOIN users u ON lg.guarantor_id = u.id
            WHERE lg.loan_id = $1
            ORDER BY lg.created_at
        `;
        const result = await db.query(query, [loanId]);
        return result.rows;
    }

    // Get pending requests for a guarantor
    static async getPendingByGuarantor(guarantorId) {
        const query = `
            SELECT lg.*, 
                   l.requested_amount, l.repayment_months,
                   u.full_name as borrower_name, u.email as borrower_email
            FROM loan_guarantors lg
            INNER JOIN loans l ON lg.loan_id = l.id
            INNER JOIN users u ON l.borrower_id = u.id
            WHERE lg.guarantor_id = $1 AND lg.status = 'pending'
            ORDER BY lg.created_at DESC
        `;
        const result = await db.query(query, [guarantorId]);
        return result.rows;
    }

    // Get all guarantees by a user
    static async getByGuarantor(guarantorId, status = null) {
        let query = `
            SELECT lg.*, 
                   l.requested_amount, l.balance_remaining, l.status as loan_status,
                   u.full_name as borrower_name
            FROM loan_guarantors lg
            INNER JOIN loans l ON lg.loan_id = l.id
            INNER JOIN users u ON l.borrower_id = u.id
            WHERE lg.guarantor_id = $1
        `;
        const params = [guarantorId];
        
        if (status) {
            query += ' AND lg.status = $2';
            params.push(status);
        }
        
        query += ' ORDER BY lg.created_at DESC';
        
        const result = await db.query(query, params);
        return result.rows;
    }

    // Accept guarantor request
    static async accept(requestId) {
        const query = `
            UPDATE loan_guarantors
            SET status = 'accepted', responded_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `;
        const result = await db.query(query, [requestId]);
        return result.rows[0];
    }

    // Decline guarantor request
    static async decline(requestId) {
        const query = `
            UPDATE loan_guarantors
            SET status = 'declined', responded_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `;
        const result = await db.query(query, [requestId]);
        return result.rows[0];
    }

    // Get total accepted guarantor shares for a loan
    static async getAcceptedSharesTotal(loanId) {
        const query = `
            SELECT COALESCE(SUM(shares_pledged), 0) as total_shares,
                   COALESCE(SUM(amount_covered), 0) as total_amount
            FROM loan_guarantors
            WHERE loan_id = $1 AND status = 'accepted'
        `;
        const result = await db.query(query, [loanId]);
        return result.rows[0];
    }

    // Release guarantor shares after loan paid
    static async releaseByLoan(loanId) {
        const query = `
            UPDATE loan_guarantors
            SET status = 'released'
            WHERE loan_id = $1 AND status = 'accepted'
            RETURNING *
        `;
        const result = await db.query(query, [loanId]);
        return result.rows;
    }
}

module.exports = LoanGuarantor;