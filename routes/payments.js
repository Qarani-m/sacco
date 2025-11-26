const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

// All routes require authentication
router.use(authMiddleware);

// POST /payments/initiate
// Initiate payment for any transaction type
// Input: amount, type (registration, shares, welfare, loan_repayment)
// Triggers M-Pesa STK push prompt
router.post('/initiate', paymentController.initiatePayment);

// POST /payments/mpesa/callback
// M-Pesa callback endpoint (receives payment confirmation)
// Validates payment and updates transaction status
// Allocates payment: loan → welfare → shares → savings
router.post('/mpesa/callback', paymentController.mpesaCallback);

// GET /payments/status/:transactionRef
// Check payment status
// Returns: pending, completed, failed
router.get('/status/:transactionRef', paymentController.checkPaymentStatus);

// GET /payments/history
// View all payment transactions
router.get('/history', paymentController.getPaymentHistory);

// POST /payments/verify
// Manually verify payment (for bank/cash payments)
// Admin only - requires 2/3 approval
router.post('/verify', paymentController.verifyPayment);

module.exports = router;