const { v4: uuidv4 } = require('uuid');
const db = require("./db");

class Loan {
  // Create loan request
  static async create(loanData) {
    const { borrower_id, requested_amount, repayment_months } = loanData;
    const interest_rate = process.env.LOAN_INTEREST_RATE || 3;
    const id = uuidv4();

    const query = `
            INSERT INTO loans (id, borrower_id, requested_amount, interest_rate, repayment_months)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;

    const result = await db.query(query, [
      id,
      borrower_id,
      requested_amount,
      interest_rate,
      repayment_months,
    ]);
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
      query += " AND status = $2";
      params.push(status);
    }

    query += " ORDER BY created_at DESC";

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

    query += " ORDER BY l.created_at DESC";

    const result = await db.query(query, params);
    return result.rows;
  }

  // Approve loan (admin approval step)
  static async approve(loanId, approvedAmount) {
    const query = `
            UPDATE loans
            SET status = 'approved', 
                approved_amount = $1,
                approved_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `;

    const result = await db.query(query, [
      approvedAmount,
      loanId,
    ]);

    return result.rows[0];
  }

  // Disburse loan (funds transfer step)
  static async disburse(loanId) {
    // Calculate due date (max 6 months)
    const loan = await this.findById(loanId);

    // Calculate total with interest
    const totalWithInterest =
      loan.approved_amount *
      (1 + (loan.interest_rate / 100) * loan.repayment_months);

    // Calculate due date in JavaScript (database-agnostic)
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + parseInt(loan.repayment_months));
    const dueDateISO = dueDate.toISOString();

    const query = `
            UPDATE loans
            SET status = 'active',
                balance_remaining = $1,
                due_date = $2
            WHERE id = $3
            RETURNING *
        `;

    const result = await db.query(query, [
      totalWithInterest,
      dueDateISO,
      loanId,
    ]);

    return result.rows[0];
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
    // Convert to numbers in case they're strings from database
    const amount = parseFloat(loanAmount);
    const rate = parseFloat(interestRate);
    const period = parseInt(months);

    const schedule = [];
    const monthlyInterest = (amount * rate) / 100;
    const totalInterest = monthlyInterest * period;
    const totalAmount = amount + totalInterest;
    const monthlyPayment = totalAmount / period;

    for (let i = 1; i <= period; i++) {
      schedule.push({
        month: i,
        payment: monthlyPayment.toFixed(2),
        principal: (amount / period).toFixed(2),
        interest: monthlyInterest.toFixed(2),
      });
    }

    return {
      schedule,
      totalAmount: totalAmount.toFixed(2),
      totalInterest: totalInterest.toFixed(2),
    };
  }
  // Record repayment (updates balance)
  static async recordRepayment(loanId, amount) {
    const query = `
            UPDATE loans
            SET balance_remaining = balance_remaining - $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `;
    const result = await db.query(query, [amount, loanId]);
    return result.rows[0];
  }

  // Mark loan as paid
  static async markAsPaid(loanId) {
    const query = `
            UPDATE loans
            SET status = 'paid',
                balance_remaining = 0,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `;
    const result = await db.query(query, [loanId]);
    return result.rows[0];
  }

  // ============================================
  // WORKFLOW METHODS
  // ============================================

  /**
   * Update loan workflow and current step
   */
  static async updateWorkflow(loanId, workflowId, currentStepId) {
    const query = `
      UPDATE loans
      SET workflow_id = $1, current_step_id = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;
    const result = await db.query(query, [workflowId, currentStepId, loanId]);
    return result.rows[0];
  }

  /**
   * Update loan status
   */
  static async updateStatus(loanId, status) {
    const query = `
      UPDATE loans
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const result = await db.query(query, [status, loanId]);
    return result.rows[0];
  }
}

module.exports = Loan;
