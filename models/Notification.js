const db = require('./db');

class Notification {
    // Create notification
    static async create(notificationData) {
        const { user_id, type, title, message, related_entity_type, related_entity_id } = notificationData;
        
        const query = `
            INSERT INTO notifications (user_id, type, title, message, related_entity_type, related_entity_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        
        const result = await db.query(query, [user_id, type, title, message, related_entity_type, related_entity_id]);
        return result.rows[0];
    }

    // Get user's notifications
    static async getByUser(userId, unreadOnly = false) {
        let query = `
            SELECT * FROM notifications
            WHERE user_id = $1
        `;
        
        if (unreadOnly) {
            query += ' AND is_read = false';
        }
        
        query += ' ORDER BY created_at DESC';
        
        const result = await db.query(query, [userId]);
        return result.rows;
    }

    // Mark as read
    static async markAsRead(notificationId) {
        const query = `
            UPDATE notifications
            SET is_read = true
            WHERE id = $1
            RETURNING *
        `;
        const result = await db.query(query, [notificationId]);
        return result.rows[0];
    }

    // Get unread count
    static async getUnreadCount(userId) {
        const query = `
            SELECT COUNT(*) as count
            FROM notifications
            WHERE user_id = $1 AND is_read = false
        `;
        const result = await db.query(query, [userId]);
        return parseInt(result.rows[0].count);
    }

    // Delete notification
    static async delete(notificationId) {
        const query = 'DELETE FROM notifications WHERE id = $1 RETURNING *';
        const result = await db.query(query, [notificationId]);
        return result.rows[0];
    }

    // Bulk create notifications (for multiple users)
    static async createBulk(notifications) {
        const values = notifications.map((n, i) => {
            const offset = i * 6;
            return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6})`;
        }).join(',');

        const params = notifications.flatMap(n => [
            n.user_id, n.type, n.title, n.message, n.related_entity_type, n.related_entity_id
        ]);

        const query = `
            INSERT INTO notifications (user_id, type, title, message, related_entity_type, related_entity_id)
            VALUES ${values}
            RETURNING *
        `;

        const result = await db.query(query, params);
        return result.rows;
    }
}

module.exports = Notification;