const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const messageController = require('../controllers/messageController');

// All routes require authentication
router.use(authMiddleware);

/* ============================
   DISPLAY ROUTES (Render Pages / Views)
   ============================ */

// View inbox with all received messages
router.get('/', messageController.viewInbox);

// View sent messages
router.get('/sent', messageController.viewSent);

// Display message composition form
router.get('/compose', messageController.showComposeForm);

// View specific message and its thread (replies)
router.get('/:messageId', messageController.viewMessage);

// Search messages by sender, subject, or content
router.get('/search', messageController.searchMessages);


/* ============================
   ACTION ROUTES (API / Logic)
   ============================ */

// Send new message to member or admin
router.post('/send', messageController.sendMessage);

// Reply to a message
router.post('/:messageId/reply', messageController.replyMessage);

// Mark message as read
router.post('/:messageId/read', messageController.markAsRead);

// Delete message
router.delete('/:messageId', messageController.deleteMessage);

module.exports = router;
