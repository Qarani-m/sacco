const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Loan = require('../models/Loan');
const LoanRepayment = require('../models/LoanRepayment');
const WelfarePayment = require('../models/WelfarePayment');
const Share = require('../models/Share');
const Savings = require('../models/Savings');
const SaccoSavings = require('../models/SaccoSavings');
const Notification = require('../models/Notification');
const axios = require('axios');

exports.initiatePayment = async (req, res) => {
    try {
        const { amount, type, loan_id } = req.body;
        const userId = req.user.id;

        const transactionRef = `SACCO${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

        // Create transaction record
        await Transaction.create({
            user_id: userId,
            amount,
            type,
            payment_method: 'mpesa',
            transaction_ref: transactionRef,
            status: 'pending'
        });

        // M-Pesa STK Push
        const mpesaResponse = await initiateMpesaSTK(req.user.phone_number, amount, transactionRef);

        res.json({
            success: true,
            message: 'Payment initiated. Check your phone for M-Pesa prompt',
            transaction_ref: transactionRef,
            checkout_request_id: mpesaResponse.CheckoutRequestID
        });
    } catch (error) {
        console.error('Payment initiation error:', error);
        res.status(500).json({ error: 'Failed to initiate payment' });
    }
};

exports.mpesaCallback = async (req, res) => {
    try {
        const { Body } = req.body;
        const callbackData = Body.stkCallback;

        const transactionRef = callbackData.CheckoutRequestID;
        const resultCode = callbackData.ResultCode;

        if (resultCode === 0) {
            // Payment successful
            const transaction = await Transaction.findByRef(transactionRef);
            
            if (!transaction) {
                return res.status(404).json({ error: 'Transaction not found' });
            }

            await Transaction.updateStatus(transactionRef, 'completed');

            // Allocate payment: loan → welfare → shares → savings
            await allocatePayment(transaction);

            // Notify user
            await Notification.create({
                user_id: transaction.user_id,
                type: 'payment_success',
                title: 'Payment Successful',
                message: `Your payment of KSh ${transaction.amount} has been processed successfully.`,
                related_entity_type: 'transaction',
                related_entity_id: transaction.id
            });
        } else {
            // Payment failed
            await Transaction.updateStatus(transactionRef, 'failed');
        }

        res.json({ success: true });
    } catch (error) {
        console.error('M-Pesa callback error:', error);
        res.status(500).json({ error: 'Callback processing failed' });
    }
};

async function allocatePayment(transaction) {
    const userId = transaction.user_id;
    let remainingAmount = parseFloat(transaction.amount);
    const currentYear = new Date().getFullYear();

    // 1. Allocate to loans first
    if (transaction.type === 'loan_repayment' || remainingAmount > 0) {
        const activeLoans = await Loan.getByUser(userId, 'active');
        
        for (const loan of activeLoans) {
            if (remainingAmount <= 0) break;

            const paymentAmount = Math.min(remainingAmount, loan.balance_remaining);
            
            // Calculate interest and principal split
            const interestRate = loan.interest_rate / 100;
            const monthlyInterest = (loan.approved_amount * interestRate);
            const interestAmount = Math.min(paymentAmount * 0.5, monthlyInterest);
            const principalAmount = paymentAmount - interestAmount;

            // Record loan repayment
            await LoanRepayment.create({
                loan_id: loan.id,
                user_id: userId,
                amount_paid: paymentAmount,
                principal_amount: principalAmount,
                interest_amount: interestAmount,
                transaction_ref: transaction.transaction_ref
            });

            // Update loan balance
            const newBalance = loan.balance_remaining - paymentAmount;
            await Loan.updateBalance(loan.id, newBalance);

            // Add interest to SACCO savings
            await SaccoSavings.addInterest(currentYear, interestAmount);

            // If loan fully paid, release guarantor shares
            if (newBalance <= 0) {
                const LoanGuarantor = require('../models/LoanGuarantor');
                await LoanGuarantor.releaseByLoan(loan.id);
            }

            remainingAmount -= paymentAmount;
        }
    }

    // 2. Allocate to welfare if specified or has remaining
    if (transaction.type === 'welfare' || remainingAmount >= 300) {
        const welfareAmount = transaction.type === 'welfare' ? transaction.amount : Math.min(remainingAmount, 300);
        
        await WelfarePayment.create({
            user_id: userId,
            amount: welfareAmount,
            payment_method: 'mpesa',
            transaction_ref: transaction.transaction_ref
        });

        remainingAmount -= welfareAmount;
    }

    // 3. Allocate to shares if specified
    if (transaction.type === 'shares') {
        const shareQuantity = Math.floor(transaction.amount / 1000);
        
        await Share.create({
            user_id: userId,
            quantity: shareQuantity,
            amount_paid: transaction.amount
        });

        remainingAmount = 0;
    }

    // 4. Registration fee
    if (transaction.type === 'registration') {
        await User.markRegistrationPaid(userId);
        
        const query = `
            INSERT INTO registration_fees (user_id, amount, payment_date, transaction_ref)
            VALUES ($1, $2, CURRENT_TIMESTAMP, $3)
        `;
        const db = require('../models/db');
        await db.query(query, [userId, transaction.amount, transaction.transaction_ref]);
        
        remainingAmount = 0;
    }

    // 5. Surplus goes to member's savings
    if (remainingAmount > 0) {
        await Savings.create({
            user_id: userId,
            year: currentYear,
            amount: remainingAmount,
            type: 'surplus'
        });
    }
}

async function initiateMpesaSTK(phoneNumber, amount, transactionRef) {
    // M-Pesa STK Push implementation
    const mpesaUrl = process.env.MPESA_STK_URL;
    const shortcode = process.env.MPESA_SHORTCODE;
    const passkey = process.env.MPESA_PASSKEY;
    const callbackUrl = process.env.MPESA_CALLBACK_URL;

    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

    const token = await getMpesaToken();

    const response = await axios.post(mpesaUrl, {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: shortcode,
        PhoneNumber: phoneNumber,
        CallBackURL: callbackUrl,
        AccountReference: transactionRef,
        TransactionDesc: 'SACCO Payment'
    }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response.data;
}

async function getMpesaToken() {
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    const response = await axios.get(process.env.MPESA_TOKEN_URL, {
        headers: {
            Authorization: `Basic ${auth}`
        }
    });

    return response.data.access_token;
}

exports.checkPaymentStatus = async (req, res) => {
    try {
        const { transactionRef } = req.params;
        const transaction = await Transaction.findByRef(transactionRef);

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        res.json({
            success: true,
            status: transaction.status,
            transaction
        });
    } catch (error) {
        console.error('Payment status check error:', error);
        res.status(500).json({ error: 'Failed to check payment status' });
    }
};

exports.getPaymentHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const transactions = await Transaction.getByUser(userId);

        res.json({
            success: true,
            transactions
        });
    } catch (error) {
        console.error('Payment history error:', error);
        res.status(500).json({ error: 'Failed to fetch payment history' });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        // Admin manual verification - requires 2/3 approval
        const { transaction_ref, reason } = req.body;
        const adminId = req.user.id;

        const AdminAction = require('../models/AdminAction');

        const action = await AdminAction.create({
            initiated_by: adminId,
            action_type: 'update',
            entity_type: 'payment_transaction',
            entity_id: null,
            reason,
            action_data: { transaction_ref, status: 'completed' }
        });

        res.json({
            success: true,
            message: 'Payment verification initiated. Requires 2/3 admin approval',
            action_id: action.id
        });
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ error: 'Failed to verify payment' });
    }
};