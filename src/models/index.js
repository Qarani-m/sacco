// Export all models for easy importing
const User = require('./User');
const Share = require('./Share');
const Loan = require('./Loan');
const LoanGuarantor = require('./LoanGuarantor');
const LoanRepayment = require('./LoanRepayment');
const WelfarePayment = require('./WelfarePayment');
const Transaction = require('./Transaction');
const Notification = require('./Notification');
const Message = require('./Message');
const AdminAction = require('./AdminAction');
const Savings = require('./Savings');
const SaccoSavings = require('./SaccoSavings');

module.exports = {
    User,
    Share,
    Loan,
    LoanGuarantor,
    LoanRepayment,
    WelfarePayment,
    Transaction,
    Notification,
    Message,
    AdminAction,
    Savings,
    SaccoSavings
};