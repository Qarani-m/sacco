const db = require('../models/db');

class NotificationService {
    // Create notification for a specific admin
    static async createNotification(adminId, notificationType, referenceId, message) {
        const query = `
            INSERT INTO admin_notifications (admin_id, notification_type, reference_id, message)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;

        const result = await db.query(query, [adminId, notificationType, referenceId, message]);
        return result.rows[0];
    }

    // Create notifications for all admins
    static async notifyAllAdmins(notificationType, referenceId, message) {
        // Get all admin users
        const adminQuery = 'SELECT id FROM users WHERE role = $1 AND is_active = true';
        const adminResult = await db.query(adminQuery, ['admin']);
        const admins = adminResult.rows;

        // Create notification for each admin
        const notifications = [];
        for (const admin of admins) {
            const notification = await this.createNotification(
                admin.id,
                notificationType,
                referenceId,
                message
            );
            notifications.push(notification);
        }

        return notifications;
    }

    // Get notifications for an admin
    static async getNotificationsByAdminId(adminId, unreadOnly = false) {
        let query = `
            SELECT n.*,
                   u.full_name as member_name
            FROM admin_notifications n
            LEFT JOIN member_documents d ON n.reference_id = d.id
            LEFT JOIN users u ON d.member_id = u.id
            WHERE n.admin_id = $1
        `;

        const params = [adminId];

        if (unreadOnly) {
            query += ' AND n.read = false';
        }

        query += ' ORDER BY n.created_at DESC LIMIT 50';

        const result = await db.query(query, params);
        return result.rows;
    }

    // Mark notification as read
    static async markAsRead(notificationId) {
        const query = `
            UPDATE admin_notifications
            SET read = true
            WHERE id = $1
            RETURNING *
        `;

        const result = await db.query(query, [notificationId]);
        return result.rows[0];
    }

    // Mark all notifications as read for an admin
    static async markAllAsRead(adminId) {
        const query = `
            UPDATE admin_notifications
            SET read = true
            WHERE admin_id = $1 AND read = false
            RETURNING *
        `;

        const result = await db.query(query, [adminId]);
        return result.rows;
    }

    // Get unread count for an admin
    static async getUnreadCount(adminId) {
        const query = `
            SELECT COUNT(*) as count
            FROM admin_notifications
            WHERE admin_id = $1 AND read = false
        `;

        const result = await db.query(query, [adminId]);
        return parseInt(result.rows[0].count);
    }

    // Delete notification
    static async deleteNotification(notificationId) {
        const query = 'DELETE FROM admin_notifications WHERE id = $1 RETURNING *';
        const result = await db.query(query, [notificationId]);
        return result.rows[0];
    }

    // Delete old notifications (older than 30 days)
    static async deleteOldNotifications() {
        const query = `
            DELETE FROM admin_notifications
            WHERE created_at < NOW() - INTERVAL '30 days'
            RETURNING *
        `;

        const result = await db.query(query);
        return result.rows;
    }
}

module.exports = NotificationService;
