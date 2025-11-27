const db = require('./db');

class Document {
    // Create or update a document
    static async createOrUpdate(documentData) {
        const { memberId, documentType, filePath, fileName } = documentData;

        const query = `
            INSERT INTO member_documents (member_id, document_type, file_path, file_name, status)
            VALUES ($1, $2, $3, $4, 'pending')
            ON CONFLICT (member_id, document_type)
            DO UPDATE SET
                file_path = EXCLUDED.file_path,
                file_name = EXCLUDED.file_name,
                status = 'pending',
                uploaded_at = CURRENT_TIMESTAMP,
                reviewed_by = NULL,
                reviewed_at = NULL,
                rejection_reason = NULL
            RETURNING *
        `;

        const result = await db.query(query, [memberId, documentType, filePath, fileName]);
        return result.rows[0];
    }

    // Get documents by member ID
    static async getByMemberId(memberId) {
        const query = `
            SELECT d.*,
                   u.full_name as reviewer_name
            FROM member_documents d
            LEFT JOIN users u ON d.reviewed_by = u.id
            WHERE d.member_id = $1
            ORDER BY d.uploaded_at DESC
        `;

        const result = await db.query(query, [memberId]);
        return result.rows;
    }

    // Get document by ID
    static async getById(documentId) {
        const query = `
            SELECT d.*,
                   m.full_name as member_name,
                   m.email as member_email,
                   r.full_name as reviewer_name
            FROM member_documents d
            JOIN users m ON d.member_id = m.id
            LEFT JOIN users r ON d.reviewed_by = r.id
            WHERE d.id = $1
        `;

        const result = await db.query(query, [documentId]);
        return result.rows[0];
    }

    // Get all documents with filters
    static async getAll(filters = {}) {
        let query = `
            SELECT d.*,
                   m.full_name as member_name,
                   m.email as member_email,
                   r.full_name as reviewer_name
            FROM member_documents d
            JOIN users m ON d.member_id = m.id
            LEFT JOIN users r ON d.reviewed_by = r.id
        `;

        const conditions = [];
        const params = [];
        let paramCount = 1;

        if (filters.status) {
            conditions.push(`d.status = $${paramCount++}`);
            params.push(filters.status);
        }

        if (filters.memberId) {
            conditions.push(`d.member_id = $${paramCount++}`);
            params.push(filters.memberId);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY d.uploaded_at DESC';

        const result = await db.query(query, params);
        return result.rows;
    }

    // Update document status
    static async updateStatus(documentId, status, reviewerId, rejectionReason = null) {
        const query = `
            UPDATE member_documents
            SET status = $1,
                reviewed_by = $2,
                reviewed_at = CURRENT_TIMESTAMP,
                rejection_reason = $3
            WHERE id = $4
            RETURNING *
        `;

        const result = await db.query(query, [status, reviewerId, rejectionReason, documentId]);
        return result.rows[0];
    }

    // Get pending documents count
    static async getPendingCount() {
        const query = 'SELECT COUNT(*) FROM member_documents WHERE status = $1';
        const result = await db.query(query, ['pending']);
        return parseInt(result.rows[0].count);
    }

    // Get documents in review count
    static async getInReviewCount() {
        const query = 'SELECT COUNT(*) FROM member_documents WHERE status = $1';
        const result = await db.query(query, ['in_review']);
        return parseInt(result.rows[0].count);
    }

    // Check if member has uploaded both documents
    static async hasUploadedBothDocuments(memberId) {
        const query = `
            SELECT document_type
            FROM member_documents
            WHERE member_id = $1
        `;
        const result = await db.query(query, [memberId]);
        const types = result.rows.map(row => row.document_type);
        return types.includes('id_front') && types.includes('id_back');
    }

    // Check if member documents are approved
    static async areDocumentsApproved(memberId) {
        const query = `
            SELECT COUNT(*) as approved_count
            FROM member_documents
            WHERE member_id = $1 AND status = 'approved'
        `;
        const result = await db.query(query, [memberId]);
        return parseInt(result.rows[0].approved_count) === 2;
    }

    // Delete document
    static async delete(documentId) {
        const query = 'DELETE FROM member_documents WHERE id = $1 RETURNING *';
        const result = await db.query(query, [documentId]);
        return result.rows[0];
    }
}

module.exports = Document;
