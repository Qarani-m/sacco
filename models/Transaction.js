const db = require('./db');

class Transaction {
    // Create payment transaction
    static async create(transactionData) {
        const { user_id, amount, type, payment_method, transaction_ref, status = 'pending' } = transactionData;
        
        const query = `
            INSERT INTO payment_transactions (user_id, amount, type, payment_method, transaction_ref, status)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        
        const result = await db.query(query, [user_id, amount, type, payment_method, transaction_ref, status]);
        return result.rows[0];
    }

    // Find transaction by reference
    static async findByRef(transactionRef) {
        const query = 'SELECT * FROM payment_transactions WHERE transaction_ref = $1';
        const result = await db.query(query, [transactionRef]);
        return result.rows[0];
    }

    // Find transaction by ID
    static async findById(id) {
        const query = 'SELECT * FROM payment_transactions WHERE id = $1';
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    // Update transaction status
    static async updateStatus(transactionRef, status) {
        const query = `
            UPDATE payment_transactions
            SET status = $1
            WHERE transaction_ref = $2
            RETURNING *
        `;
        const result = await db.query(query, [status, transactionRef]);
        return result.rows[0];
    }

    // Get user's transaction history
    static async getByUser(userId, filters = {}) {
        let query = `
            SELECT * FROM payment_transactions
            WHERE user_id = $1
        `;
        const params = [userId];
        let paramCount = 2;

        if (filters.type) {
            query += ` AND type = $${paramCount}`;
            params.push(filters.type);
            paramCount++;
        }

        if (filters.status) {
            query += ` AND status = $${paramCount}`;
            params.push(filters.status);
            paramCount++;
        }

        query += ' ORDER BY created_at DESC';

        const result = await db.query(query, params);
        return result.rows;
    }

    // Get all transactions (admin)
    static async getAll(filters = {}) {
        let query = `
            SELECT pt.*, u.full_name, u.email
            FROM payment_transactions pt
            INNER JOIN users u ON pt.user_id = u.id
            WHERE 1=1
        `;
        const params = [];
        let paramCount = 1;

        if (filters.user_id) {
            query += ` AND pt.user_id = $${paramCount}`;
            params.push(filters.user_id);
            paramCount++;
        }

        if (filters.type) {
            query += ` AND pt.type = $${paramCount}`;
            params.push(filters.type);
            paramCount++;
        }

        if (filters.status) {
            query += ` AND pt.status = $${paramCount}`;
            params.push(filters.status);
            paramCount++;
        }

        query += ' ORDER BY pt.created_at DESC';

        const result = await db.query(query, params);
        return result.rows;
    }

    // Get pending transactions
    static async getPending() {
        const query = `
            SELECT pt.*, u.full_name, u.email
            FROM payment_transactions pt
            INNER JOIN users u ON pt.user_id = u.id
            WHERE pt.status = 'pending'
            ORDER BY pt.created_at
        `;
        const result = await db.query(query);
        return result.rows;
    }
}

module.exports = Transaction;