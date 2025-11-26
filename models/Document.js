const db = require('./db');

class Document {
    // Upload document
    static async create(documentData) {
        const { user_id, document_type, file_path, file_name } = documentData;
        
        const query = `
            INSERT INTO documents (user_id, document_type, file_path, file_name, verification_status, uploaded_at)
            VALUES ($1, $2, $3, $4, 'pending', CURRENT_TIMESTAMP)
            RETURNING *
        `;
        
        const result = await db.query(query, [user_id, document_type, file_path, file_name]);
        return result.rows[0];
    }

    // Find documents by user ID
    static async findByUserId(userId) {
        const query = `
            SELECT * FROM documents
            WHERE user_id = $1
            ORDER BY uploaded_at DESC
        `;
        const result = await db.query(query, [userId]);
        return result.rows;
    }

    // Find document by ID
    static async findById(documentId) {
        const query = `
            SELECT d.*, u.full_name, u.email
            FROM documents d
            INNER JOIN users u ON d.user_id = u.id
            WHERE d.id = $1
        `;
        const result = await db.query(query, [documentId]);
        return result.rows[0];
    }

    // Update verification status
    static async updateVerificationStatus(documentId, status, verifiedBy, rejectionReason = null) {
        const query = `
            UPDATE documents
            SET verification_status = $1,
                verified_by = $2,
                verified_at = CURRENT_TIMESTAMP,
                rejection_reason = $3
            WHERE id = $4
            RETURNING *
        `;
        const result = await db.query(query, [status, verifiedBy, rejectionReason, documentId]);
        return result.rows[0];
    }

    // Delete document
    static async delete(documentId) {
        const query = 'DELETE FROM documents WHERE id = $1 RETURNING *';
        const result = await db.query(query, [documentId]);
        return result.rows[0];
    }

    // Get pending documents (for admin)
    static async getPending() {
        const query = `
            SELECT d.*, u.full_name, u.email
            FROM documents d
            INNER JOIN users u ON d.user_id = u.id
            WHERE d.verification_status = 'pending'
            ORDER BY d.uploaded_at ASC
        `;
        const result = await db.query(query);
        return result.rows;
    }

    // Check if user has verified documents
    static async hasVerifiedDocuments(userId) {
        const query = `
            SELECT COUNT(*) as count
            FROM documents
            WHERE user_id = $1 AND verification_status = 'verified'
        `;
        const result = await db.query(query, [userId]);
        return parseInt(result.rows[0].count) > 0;
    }
}

module.exports = Document;
