const db = require('./db');

class Message {
    // Create message
    static async create(messageData) {
        const { sender_id, recipient_id, subject, body, parent_message_id = null } = messageData;
        
        const query = `
            INSERT INTO messages (sender_id, recipient_id, subject, body, parent_message_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        
        const result = await db.query(query, [sender_id, recipient_id, subject, body, parent_message_id]);
        return result.rows[0];
    }

    // Get message by ID
    static async findById(messageId) {
        const query = `
            SELECT m.*, 
                   u1.full_name as sender_name, u1.email as sender_email,
                   u2.full_name as recipient_name, u2.email as recipient_email
            FROM messages m
            INNER JOIN users u1 ON m.sender_id = u1.id
            INNER JOIN users u2 ON m.recipient_id = u2.id
            WHERE m.id = $1
        `;
        const result = await db.query(query, [messageId]);
        return result.rows[0];
    }

    // Get inbox messages
    static async getInbox(userId) {
        const query = `
            SELECT m.*, u.full_name as sender_name, u.email as sender_email
            FROM messages m
            INNER JOIN users u ON m.sender_id = u.id
            WHERE m.recipient_id = $1 AND m.parent_message_id IS NULL
            ORDER BY m.created_at DESC
        `;
        const result = await db.query(query, [userId]);
        return result.rows;
    }

    // Get sent messages
    static async getSent(userId) {
        const query = `
            SELECT m.*, u.full_name as recipient_name
            FROM messages m
            INNER JOIN users u ON m.recipient_id = u.id
            WHERE m.sender_id = $1 AND m.parent_message_id IS NULL
            ORDER BY m.created_at DESC
        `;
        const result = await db.query(query, [userId]);
        return result.rows;
    }

    // Get message thread (replies)
    static async getThread(parentMessageId) {
        const query = `
            SELECT m.*, u.full_name as sender_name
            FROM messages m
            INNER JOIN users u ON m.sender_id = u.id
            WHERE m.id = $1 OR m.parent_message_id = $1
            ORDER BY m.created_at
        `;
        const result = await db.query(query, [parentMessageId]);
        return result.rows;
    }

    // Mark as read
    static async markAsRead(messageId) {
        const query = `
            UPDATE messages
            SET is_read = true
            WHERE id = $1
            RETURNING *
        `;
        const result = await db.query(query, [messageId]);
        return result.rows[0];
    }

    // Delete message
    static async delete(messageId) {
        const query = 'DELETE FROM messages WHERE id = $1 RETURNING *';
        const result = await db.query(query, [messageId]);
        return result.rows[0];
    }

    // Get unread count
    static async getUnreadCount(userId) {
        const query = `
            SELECT COUNT(*) as count
            FROM messages
            WHERE recipient_id = $1 AND is_read = false
        `;
        const result = await db.query(query, [userId]);
        return parseInt(result.rows[0].count);
    }

    // Search messages
    static async search(userId, searchTerm) {
        const query = `
            SELECT m.*, 
                   u1.full_name as sender_name,
                   u2.full_name as recipient_name
            FROM messages m
            INNER JOIN users u1 ON m.sender_id = u1.id
            INNER JOIN users u2 ON m.recipient_id = u2.id
            WHERE (m.sender_id = $1 OR m.recipient_id = $1)
            AND (m.subject ILIKE $2 OR m.body ILIKE $2)
            ORDER BY m.created_at DESC
        `;
        const result = await db.query(query, [userId, `%${searchTerm}%`]);
        return result.rows;
    }

    // Get all messages for a user (inbox + sent)
    static async getByUser(userId) {
        const query = `
            SELECT m.*, 
                   u1.full_name as sender_name,
                   u2.full_name as recipient_name
            FROM messages m
            INNER JOIN users u1 ON m.sender_id = u1.id
            INNER JOIN users u2 ON m.recipient_id = u2.id
            WHERE (m.sender_id = $1 OR m.recipient_id = $1)
            AND m.parent_message_id IS NULL
            ORDER BY m.created_at DESC
            LIMIT 10
        `;
        const result = await db.query(query, [userId]);
        return result.rows;
    }
}

module.exports = Message;