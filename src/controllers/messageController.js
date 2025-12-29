const Message = require('../models/Message');
const Notification = require('../models/Notification');
const User = require('../models/User');

exports.viewInbox = async (req, res) => {
    try {
        const userId = req.user.id;
        const inbox = await Message.getInbox(userId);
        const sent = await Message.getSent(userId);
        const unreadCount = await Message.getUnreadCount(userId);
        
        // Get admins and members for compose dropdown
        const admins = await User.getAllAdmins();
        const members = await User.getAllMembers({ is_active: true });

        res.render("member/messages", {
            title: 'Messages',
            user: req.user,
            unreadMessages: unreadCount,
            unreadNotifications: 0,
            inbox: inbox || [],
            sent: sent || [],
            unreadCount: unreadCount || 0,
            admins: admins || [],
            members: members || []
        });

    } catch (error) {
        console.error('View inbox error:', error);
        res.status(500).send("Failed to load messages page");
    }
};


exports.viewSent = async (req, res) => {
    try {
        const userId = req.user.id;
        const messages = await Message.getSent(userId);

        res.json({
            success: true,
            messages
        });
    } catch (error) {
        console.error('View sent error:', error);
        res.status(500).json({ error: 'Failed to fetch sent messages' });
    }
};

exports.showComposeForm = async (req, res) => {
    try {
        const members = await User.getAllMembers({ is_active: true });
        const admins = await User.getAllAdmins();

        res.json({
            success: true,
            available_recipients: [...members, ...admins]
        });
    } catch (error) {
        console.error('Show compose form error:', error);
        res.status(500).json({ error: 'Failed to load form' });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { recipient_id, subject, body } = req.body;
        const senderId = req.user.id;

        const message = await Message.create({
            sender_id: senderId,
            recipient_id,
            subject,
            body
        });

        await Notification.create({
            user_id: recipient_id,
            type: 'new_message',
            title: 'New Message',
            message: `You have a new message from ${req.user.full_name}`,
            related_entity_type: 'message',
            related_entity_id: message.id
        });

        res.json({
            success: true,
            message: 'Message sent successfully',
            data: message
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
};

exports.viewMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user.id;

        const thread = await Message.getThread(messageId);

        if (thread.length === 0) {
            return res.status(404).json({ error: 'Message not found' });
        }

        const firstMessage = thread[0];
        if (firstMessage.sender_id !== userId && firstMessage.recipient_id !== userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await Message.markAsRead(messageId);

        res.json({
            success: true,
            thread
        });
    } catch (error) {
        console.error('View message error:', error);
        res.status(500).json({ error: 'Failed to fetch message' });
    }
};

exports.replyMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { body } = req.body;
        const senderId = req.user.id;

        const parentMessage = await Message.findById(messageId);
        if (!parentMessage) {
            return res.status(404).json({ error: 'Message not found' });
        }

        const recipientId = parentMessage.sender_id === senderId ? 
            parentMessage.recipient_id : parentMessage.sender_id;

        const reply = await Message.create({
            sender_id: senderId,
            recipient_id: recipientId,
            subject: `Re: ${parentMessage.subject}`,
            body,
            parent_message_id: messageId
        });

        await Notification.create({
            user_id: recipientId,
            type: 'message_reply',
            title: 'New Reply',
            message: `${req.user.full_name} replied to your message`,
            related_entity_type: 'message',
            related_entity_id: reply.id
        });

        res.json({
            success: true,
            message: 'Reply sent successfully',
            data: reply
        });
    } catch (error) {
        console.error('Reply message error:', error);
        res.status(500).json({ error: 'Failed to send reply' });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { messageId } = req.params;
        await Message.markAsRead(messageId);

        res.json({
            success: true,
            message: 'Message marked as read'
        });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ error: 'Failed to mark message' });
    }
};

exports.deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user.id;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        if (message.sender_id !== userId && message.recipient_id !== userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await Message.delete(messageId);

        res.json({
            success: true,
            message: 'Message deleted successfully'
        });
    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({ error: 'Failed to delete message' });
    }
};

exports.searchMessages = async (req, res) => {
    try {
        const { q } = req.query;
        const userId = req.user.id;

        if (!q) {
            return res.status(400).json({ error: 'Search query required' });
        }

        const results = await Message.search(userId, q);

        res.json({
            success: true,
            results
        });
    } catch (error) {
        console.error('Search messages error:', error);
        res.status(500).json({ error: 'Failed to search messages' });
    }
};