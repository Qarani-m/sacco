const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const registrationCheck = require('../middleware/registrationCheck');
const PaymentAllocationService = require('../services/paymentAllocationService');
const paymentConfig = require('../config/paymentAllocation');
const Loan = require('../models/Loan');
const Share = require('../models/Share');

// All routes require authentication and registration
router.use(authMiddleware);
router.use(registrationCheck);

/**
 * GET /members/allocate-payment
 * Show payment allocation form
 */
router.get('/allocate-payment', async (req, res) => {
    try {
        const userId = req.user.id;

        // Get allocation summary
        const summary = await PaymentAllocationService.getAllocationSummary(userId);

        res.render('member/allocate-payment', {
            title: 'Allocate Payment',
            user: req.user,
            summary,
            paymentConfig,
            csrfToken: req.csrfToken()
        });
    } catch (error) {
        console.error('Error loading payment allocation page:', error);
        req.flash('error_msg', 'Failed to load payment allocation page');
        res.redirect('/members/dashboard');
    }
});

/**
 * POST /members/allocate-payment/calculate
 * Calculate total from allocation
 */
router.post('/allocate-payment/calculate', async (req, res) => {
    try {
        const { loan, welfare, shares, savings } = req.body;

        // Parse amounts
        const loanAmount = parseFloat(loan) || 0;
        const welfareAmount = parseFloat(welfare) || 0;
        const sharesAmount = parseFloat(shares) || 0;
        const savingsAmount = parseFloat(savings) || 0;

        // Calculate total
        const total = loanAmount + welfareAmount + sharesAmount + savingsAmount;

        // Validate amounts
        const errors = [];

        if (loanAmount < 0 || welfareAmount < 0 || sharesAmount < 0 || savingsAmount < 0) {
            errors.push('Amounts cannot be negative');
        }

        if (total <= 0) {
            errors.push('Total amount must be greater than zero');
        }

        // Check share allocation
        if (sharesAmount > 0 && sharesAmount % paymentConfig.SHARE_PRICE !== 0) {
            errors.push(`Share amount must be a multiple of KES ${paymentConfig.SHARE_PRICE}`);
        }

        res.json({
            success: errors.length === 0,
            total,
            breakdown: {
                loan: loanAmount,
                welfare: welfareAmount,
                shares: sharesAmount,
                savings: savingsAmount
            },
            errors
        });
    } catch (error) {
        console.error('Error calculating allocation:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to calculate allocation'
        });
    }
});

/**
 * POST /members/allocate-payment/initiate
 * Initiate M-Pesa payment with custom allocation
 */
router.post('/allocate-payment/initiate', async (req, res) => {
    try {
        const userId = req.user.id;
        const { loan, welfare, shares, savings, phone_number } = req.body;

        // Parse amounts
        const loanAmount = parseFloat(loan) || 0;
        const welfareAmount = parseFloat(welfare) || 0;
        const sharesAmount = parseFloat(shares) || 0;
        const savingsAmount = parseFloat(savings) || 0;

        // Calculate total
        const total = loanAmount + welfareAmount + sharesAmount + savingsAmount;

        // Validate
        if (total <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Total amount must be greater than zero'
            });
        }

        // Store allocation preferences in session
        req.session.paymentAllocation = {
            loan: loanAmount,
            welfare: welfareAmount,
            shares: sharesAmount,
            savings: savingsAmount,
            total,
            userId
        };

        // Initiate M-Pesa STK Push
        const PaymentService = require('../services/paymentService');
        const result = await PaymentService.initiateSTKPush(phone_number, total);

        res.json({
            success: true,
            message: 'Payment initiated. Please check your phone.',
            checkoutRequestId: result.CheckoutRequestID,
            total
        });
    } catch (error) {
        console.error('Error initiating payment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to initiate payment'
        });
    }
});

module.exports = router;
