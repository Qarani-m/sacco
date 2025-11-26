const Loan = require('../models/Loan');
const WelfarePayment = require('../models/WelfarePayment');
const Share = require('../models/Share');
const Savings = require('../models/Savings');
const SaccoSavings = require('../models/SaccoSavings');
const Transaction = require('../models/Transaction');
const LoanGuarantor = require('../models/LoanGuarantor');

class PaymentAllocationService {
    /**
     * Allocate payment according to priority:
     * 1. Loan repayment (frees guarantors)
     * 2. Welfare contributions
     * 3. Share purchases
     * 4. Personal savings (surplus)
     * 
     * 1% loan interest goes to SACCO savings
     */
    static async allocatePayment(userId, totalAmount, transactionRef) {
        const allocation = {
            loan_repayment: 0,
            loan_interest: 0,
            welfare: 0,
            shares: 0,
            personal_savings: 0,
            remaining: totalAmount
        };

        try {
            // 1. PRIORITY: Loan Repayment
            const activeLoans = await Loan.getByUser(userId, 'active');
            
            for (const loan of activeLoans) {
                if (allocation.remaining <= 0) break;

                const loanBalance = parseFloat(loan.balance_remaining);
                const loanPrincipal = loanBalance / 1.01; // Remove 1% interest
                const loanInterest = loanBalance - loanPrincipal;

                if (allocation.remaining >= loanBalance) {
                    // Pay full loan
                    allocation.loan_repayment += loanPrincipal;
                    allocation.loan_interest += loanInterest;
                    allocation.remaining -= loanBalance;

                    // Update loan
                    await Loan.recordRepayment(loan.id, loanBalance);

                    // Check if loan is fully paid
                    const updatedLoan = await Loan.findById(loan.id);
                    if (parseFloat(updatedLoan.balance_remaining) <= 0) {
                        // Mark loan as paid
                        await Loan.markAsPaid(loan.id);
                        
                        // Release guarantor shares
                        await LoanGuarantor.releaseByLoan(loan.id);
                    }

                    // Route interest to SACCO savings
                    await SaccoSavings.create({
                        amount: loanInterest,
                        source: 'loan_interest',
                        description: `1% interest from loan ${loan.id.substring(0, 8)}`
                    });
                } else {
                    // Partial payment
                    const paymentAmount = allocation.remaining;
                    const principalPortion = paymentAmount / 1.01;
                    const interestPortion = paymentAmount - principalPortion;

                    allocation.loan_repayment += principalPortion;
                    allocation.loan_interest += interestPortion;
                    allocation.remaining = 0;

                    await Loan.recordRepayment(loan.id, paymentAmount);

                    // Route interest to SACCO savings
                    await SaccoSavings.create({
                        amount: interestPortion,
                        source: 'loan_interest',
                        description: `1% interest from loan ${loan.id.substring(0, 8)}`
                    });
                }
            }

            // 2. PRIORITY: Welfare (KSh 300 per payment)
            const welfareAmount = 300;
            if (allocation.remaining >= welfareAmount) {
                allocation.welfare = welfareAmount;
                allocation.remaining -= welfareAmount;

                // Record welfare payment
                await WelfarePayment.create({
                    user_id: userId,
                    amount: welfareAmount,
                    payment_method: 'mpesa',
                    transaction_ref: `${transactionRef}_WELFARE`
                });
            }

            // 3. PRIORITY: Shares (KSh 1,000 per share, max 50 shares)
            const sharePrice = 1000;
            const currentShares = await Share.getTotalByUser(userId);
            const maxShares = 50;
            const availableShareSlots = maxShares - currentShares;

            if (availableShareSlots > 0 && allocation.remaining >= sharePrice) {
                const sharesToBuy = Math.min(
                    Math.floor(allocation.remaining / sharePrice),
                    availableShareSlots
                );
                const sharesCost = sharesToBuy * sharePrice;

                allocation.shares = sharesCost;
                allocation.remaining -= sharesCost;

                // Purchase shares
                await Share.create({
                    user_id: userId,
                    quantity: sharesToBuy,
                    amount_paid: sharesCost
                });
            }

            // 4. PRIORITY: Personal Savings (surplus)
            if (allocation.remaining > 0) {
                allocation.personal_savings = allocation.remaining;

                // Add to personal savings
                await Savings.deposit(userId, allocation.remaining, transactionRef);

                allocation.remaining = 0;
            }

            // Record allocation in transaction
            await Transaction.updateAllocation(transactionRef, allocation);

            return {
                success: true,
                allocation,
                message: 'Payment allocated successfully'
            };

        } catch (error) {
            console.error('Payment allocation error:', error);
            throw error;
        }
    }

    /**
     * Get allocation summary for a user
     */
    static async getAllocationSummary(userId) {
        const activeLoans = await Loan.getByUser(userId, 'active');
        const totalShares = await Share.getTotalByUser(userId);
        const personalSavings = await Savings.getTotalByUser(userId);

        const loanBalance = activeLoans.reduce((sum, loan) => 
            sum + parseFloat(loan.balance_remaining), 0);

        return {
            has_active_loans: activeLoans.length > 0,
            loan_balance: loanBalance,
            total_shares: totalShares,
            max_shares: 50,
            can_buy_shares: totalShares < 50,
            personal_savings: personalSavings,
            next_priority: loanBalance > 0 ? 'Loan Repayment' : 
                          totalShares < 50 ? 'Share Purchase' : 'Personal Savings'
        };
    }
}

module.exports = PaymentAllocationService;
