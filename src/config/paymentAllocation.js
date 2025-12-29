/**
 * Payment Allocation Configuration
 * 
 * Defines rules for how incoming payments are allocated across:
 * - Loan repayments
 * - Welfare contributions
 * - Share capital purchases
 * - Personal savings
 */

module.exports = {
    // Minimum share capital required (KES 5,000)
    MIN_SHARE_CAPITAL: 5000,

    // Price per share (KES 1,000)
    SHARE_PRICE: 1000,

    // Maximum shares a member can hold
    MAX_SHARES: 50,

    // Monthly welfare contribution amount (KES 300 in production, 3 for testing)
    WELFARE_AMOUNT: process.env.WELFARE_AMOUNT || 3,

    /**
     * Payment allocation priority order
     * 1. Loan repayment (highest priority)
     * 2. Welfare contributions
     * 3. Share capital (only until minimum threshold reached)
     * 4. Personal savings (lowest priority, catches all excess)
     */
    ALLOCATION_PRIORITY: [
        'loan_repayment',
        'welfare',
        'shares',
        'savings'
    ],

    /**
     * Get minimum number of shares required
     */
    getMinimumShares() {
        return Math.ceil(this.MIN_SHARE_CAPITAL / this.SHARE_PRICE);
    },

    /**
     * Check if member has reached minimum share capital
     * @param {number} currentShares - Current number of shares owned
     * @returns {boolean}
     */
    hasMinimumShares(currentShares) {
        const currentValue = currentShares * this.SHARE_PRICE;
        return currentValue >= this.MIN_SHARE_CAPITAL;
    },

    /**
     * Calculate how many more shares needed to reach minimum
     * @param {number} currentShares - Current number of shares owned
     * @returns {number}
     */
    sharesNeededForMinimum(currentShares) {
        const minimumShares = this.getMinimumShares();
        const needed = minimumShares - currentShares;
        return Math.max(0, needed);
    }
};
