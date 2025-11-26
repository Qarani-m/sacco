const db = require('./db');

class Document {
    // Create new document
    static async create(docData) {
        const { user_id, document_type, file_path } = docData;
        const query = `
            INSERT INTO documents (user_id, document_type, file_path)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const result = await db.query(query, [user_id, document_type, file_path]);
        return result.rows[0];
    }

    // Find by ID
    static async findById(id) {
        const query = 'SELECT * FROM documents WHERE id = $1';
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    // Find by User ID
    static async findByUserId(userId) {
        const query = 'SELECT * FROM documents WHERE user_id = $1 ORDER BY created_at DESC';
        const result = await db.query(query, [userId]);
        return result.rows;
    }

    // Find pending documents (for admin)
    static async findPending() {
        const query = `
            SELECT d.*, u.full_name, u.email 
            FROM documents d
            JOIN users u ON d.user_id = u.id
            WHERE d.status = 'pending'
            ORDER BY d.created_at ASC
        `;
        const result = await db.query(query);
        return result.rows;
    }

    // Verify document
    static async verify(id, adminId) {
        const query = `
            UPDATE documents 
            SET status = 'verified', verified_by = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `;
        const result = await db.query(query, [adminId, id]);
        return result.rows[0];
    }

    // Reject document
    static async reject(id, adminId, reason) {
        const query = `
            UPDATE documents 
            SET status = 'rejected', verified_by = $1, rejection_reason = $2, updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING *
        `;
        const result = await db.query(query, [adminId, reason, id]);
        return result.rows[0];
    }

    // Check if user has verified documents
    static async hasVerifiedDocs(userId) {
        const query = `
            SELECT COUNT(*) as count 
            FROM documents 
            WHERE user_id = $1 AND status = 'verified' AND document_type IN ('id_front', 'id_back')
        `;
        const result = await db.query(query, [userId]);
        // Need at least 2 verified docs (front and back)
        return parseInt(result.rows[0].count) >= 2;
    }
}

module.exports = Document;
