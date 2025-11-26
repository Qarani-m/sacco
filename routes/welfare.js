const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const registrationCheck  = require('../middleware/registrationCheck');
const welfareController = require('../controllers/welfareController');

// All routes require authentication and registration fee paid
router.use(authMiddleware);
// router.use(registrationCheck);


/* =============================
   DISPLAY ROUTES (Render Pages)
   ============================= */
router.get('/page', welfareController.viewWelfare);      // Main welfare page
router.get('/pay', welfareController.payWelfare);    // Payment form
router.get('/history', welfareController.getPaymentHistory); // History page

/* =============================
   ACTION ROUTES (API / Logic)
   ============================= */
router.post('/pay', welfareController.payWelfare);           // Payment action
router.get('/stats', welfareController.getWelfareStats);     // API stats

module.exports = router;
