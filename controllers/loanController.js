const Loan = require('../models/Loan');
const Share = require('../models/Share');
const LoanGuarantor = require('../models/LoanGuarantor');
const User = require('../models/User');
const Notification = require('../models/Notification');


exports.viewLoans = async (req, res) => {
    try {
        const userId = req.user.id;
        const loans = await Loan.getByUser(userId);

        res.json({
            success: true,
            loans
        });
    } catch (error) {
        console.error('View loans error:', error);
        res.status(500).json({ error: 'Failed to fetch loans' });
    }
};

exports.renderLoansPage = async (req, res) => {
    try {
        const userId = req.user.id;
        const loans = await Loan.getByUser(userId);

        res.render("member/loans", {
            loans,
            user: req.user,
                unreadMessages: 0,
    unreadNotifications: 0,
title:"",
        });
    } catch (error) {
        console.error("Render loans page error:", error);
        res.status(500).send("Failed to load loans page");
    }
};




exports.showRequestForm = async (req, res) => {
    try {
        const userId = req.user.id;
        const totalShares = await Share.getTotalByUser(userId);
        const availableShares = await Share.getAvailableByUser(userId);
        const shareValue = totalShares * 1000;

        res.json({
            success: true,
            total_shares: totalShares,
            available_shares: availableShares,
            share_value: shareValue,
            max_loan_without_guarantors: shareValue
        });
    } catch (error) {
        console.error('Show loan form error:', error);
        res.status(500).json({ error: 'Failed to load loan form' });
    }
};

exports.requestLoan = async (req, res) => {
    try {
        const { requested_amount, repayment_months } = req.body;
        const userId = req.user.id;

        // Validation
        if (repayment_months > 6) {
            return res.status(400).json({ error: 'Maximum repayment period is 6 months' });
        }

        // Check for existing unpaid loans
        const hasUnpaidLoan = await User.hasUnpaidLoan(userId);
        if (hasUnpaidLoan) {
            return res.status(400).json({ error: 'You have an existing unpaid loan' });
        }

        // Check share value
        const totalShares = await Share.getTotalByUser(userId);
        const shareValue = totalShares * 1000;

        if (requested_amount > shareValue) {
            return res.status(400).json({
                error: 'Loan amount exceeds share value',
                message: 'You need guarantors to cover the difference',
                share_value: shareValue,
                requested_amount: requested_amount,
                shortfall: requested_amount - shareValue,
                shares_needed: Math.ceil((requested_amount - shareValue) / 1000)
            });
        }

        // Create loan request
        const loan = await Loan.create({
            borrower_id: userId,
            requested_amount,
            repayment_months
        });

        // Notify admins
        const admins = await User.getAllAdmins();
        const notifications = admins.map(admin => ({
            user_id: admin.id,
            type: 'loan_request',
            title: 'New Loan Request',
            message: `${req.user.full_name} has requested a loan of KSh ${requested_amount}`,
            related_entity_type: 'loan',
            related_entity_id: loan.id
        }));
        await Notification.createBulk(notifications);

        res.json({
            success: true,
            message: 'Loan request submitted successfully',
            loan
        });
    } catch (error) {
        console.error('Request loan error:', error);
        res.status(500).json({ error: 'Failed to request loan' });
    }
};

exports.viewLoanDetails = async (req, res) => {
    try {
        const { loanId } = req.params;
        const loan = await Loan.findById(loanId);

        if (!loan) {
            return res.status(404).json({ error: 'Loan not found' });
        }

        // Check authorization
        if (loan.borrower_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const guarantors = await LoanGuarantor.getByLoan(loanId);
        const repayments = await require('../models/LoanRepayment').getByLoan(loanId);

        res.json({
            success: true,
            loan,
            guarantors,
            repayments
        });
    } catch (error) {
        console.error('View loan details error:', error);
        res.status(500).json({ error: 'Failed to fetch loan details' });
    }
};

exports.viewRepaymentSchedule = async (req, res) => {
    try {
        const { loanId } = req.params;
        const loan = await Loan.findById(loanId);

        if (!loan) {
            return res.status(404).json({ error: 'Loan not found' });
        }

        const schedule = Loan.calculateRepaymentSchedule(
            loan.approved_amount || loan.requested_amount,
            loan.interest_rate,
            loan.repayment_months
        );

        res.json({
            success: true,
            schedule
        });
    } catch (error) {
        console.error('View schedule error:', error);
        res.status(500).json({ error: 'Failed to generate schedule' });
    }
};

exports.repayLoan = async (req, res) => {
    try {
        const { loanId } = req.params;
        const { amount } = req.body;
        const userId = req.user.id;

        const loan = await Loan.findById(loanId);
        if (!loan) {
            return res.status(404).json({ error: 'Loan not found' });
        }

        if (loan.status !== 'active') {
            return res.status(400).json({ error: 'Loan is not active' });
        }

        // Initiate payment - will be allocated in paymentController
        const transactionRef = `LOAN${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
        
        const Transaction = require('../models/Transaction');
        await Transaction.create({
            user_id: userId,
            amount,
            type: 'loan_repayment',
            payment_method: 'mpesa',
            transaction_ref: transactionRef,
            status: 'pending'
        });

        // Initiate M-Pesa (simplified)
        res.json({
            success: true,
            message: 'Check your phone for M-Pesa prompt',
            transaction_ref: transactionRef
        });
    } catch (error) {
        console.error('Repay loan error:', error);
        res.status(500).json({ error: 'Failed to process repayment' });
    }
};

exports.viewLoanGuarantors = async (req, res) => {
    try {
        const { loanId } = req.params;
        const guarantors = await LoanGuarantor.getByLoan(loanId);

        res.json({
            success: true,
            guarantors
        });
    } catch (error) {
        console.error('View guarantors error:', error);
        res.status(500).json({ error: 'Failed to fetch guarantors' });
    }
};

exports.cancelLoan = async (req, res) => {
    try {
        const { loanId } = req.params;
        const userId = req.user.id;

        const loan = await Loan.findById(loanId);
        if (!loan) {
            return res.status(404).json({ error: 'Loan not found' });
        }

        if (loan.borrower_id !== userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        if (loan.status !== 'pending') {
            return res.status(400).json({ error: 'Can only cancel pending loans' });
        }

        await Loan.cancel(loanId);

        res.json({
            success: true,
            message: 'Loan request cancelled'
        });
    } catch (error) {
        console.error('Cancel loan error:', error);
        res.status(500).json({ error: 'Failed to cancel loan' });
    }
};

exports.calculateMaxLoan = async (req, res) => {
    try {
        const userId = req.user.id;
        const totalShares = await Share.getTotalByUser(userId);
        const availableShares = await Share.getAvailableByUser(userId);

        res.json({
            success: true,
            total_shares: totalShares,
            available_shares: availableShares,
            max_loan: totalShares * 1000
        });
    } catch (error) {
        console.error('Calculate max loan error:', error);
        res.status(500).json({ error: 'Failed to calculate max loan' });
    }
};

exports.calculateGuarantorsNeeded = async (req, res) => {
    try {
        const { requested_amount } = req.body;
        const userId = req.user.id;

        const totalShares = await Share.getTotalByUser(userId);
        const shareValue = totalShares * 1000;

        if (requested_amount <= shareValue) {
            return res.json({
                success: true,
                needs_guarantors: false,
                message: 'Your shares cover this loan amount'
            });
        }

        const shortfall = requested_amount - shareValue;
        const sharesNeeded = Math.ceil(shortfall / 1000);

        res.json({
            success: true,
            needs_guarantors: true,
            your_share_value: shareValue,
            requested_amount: requested_amount,
            shortfall: shortfall,
            shares_needed: sharesNeeded
        });
    } catch (error) {
        console.error('Calculate guarantors error:', error);
        res.status(500).json({ error: 'Failed to calculate guarantors needed' });
    }
};