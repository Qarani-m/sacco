const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const  registrationCheck  = require('../middleware/registrationCheck');
const memberController = require('../controllers/membersController');
const upload = require('../config/fileUpload');

// All routes require authentication
router.use(authMiddleware);
// registrationCheck applied later after registration routes


// GET /members/dashboard
// Display member dashboard with account overview
// Shows shares, loans, welfare status, notifications
router.get('/dashboard', memberController.showDashboard);

// GET /members/registration-fee
// Display registration fee payment page (if not paid)
router.get('/registration-fee', memberController.showRegistrationFeePage);

// POST /members/registration/pay
// Initiate registration fee payment (KSh 1,000)
router.post('/registration/pay', memberController.payRegistrationFee);

// All routes below require registration fee to be paid
// router.use(registrationCheck);



// GET /members/profile
// View and edit member profile information
router.get('/profile', memberController.showProfilePage);

// POST /members/profile/upload-documents
// Upload ID documents
router.post('/profile/upload-documents', upload.single('document'), memberController.uploadDocuments);

// POST /members/profile/submit-form
// Submit one-time profile form
router.post('/profile/submit-form', memberController.submitProfileForm);

// GET /members/notifications
// View all notifications (loan updates, guarantor requests, admin messages)
router.get('/notifications', memberController.listNotifications);

// POST /members/notifications/:notificationId/read
// Mark notification as read
router.post('/notifications/:notificationId/read', memberController.markNotificationRead);

// GET /members/savings
// View personal savings account balance and history
router.get('/savings', memberController.viewSavings);

module.exports = router;