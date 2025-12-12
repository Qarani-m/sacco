const User = require("../../models/User");
const Share = require("../../models/Share");
const Loan = require("../../models/Loan");
const Savings = require("../../models/Savings");
const Notification = require("../../models/Notification");
const Transaction = require("../../models/Transaction");
const Message = require("../../models/Message");
const WelfarePayment = require("../../models/WelfarePayment");
const LoanGuarantor = require("../../models/LoanGuarantor");

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch fresh user data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Fetch all required data concurrently
    const [
      stats,
      recentTransactions,
      unreadNotifications,
      unreadMessages,
      activeLoans,
      welfarePayments,
      pendingGuarantorRequests,
    ] = await Promise.all([
      User.getStats(userId),
      Transaction.getByUser(userId),
      Notification.getUnreadCount(userId),
      Message.getUnreadCount(userId),
      Loan.getByUser(userId, "active"),
      WelfarePayment.getByUser(userId),
      LoanGuarantor.getPendingByGuarantor(userId),
    ]);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          phone_number: user.phone_number,
          registration_paid: user.registration_paid,
          is_active: user.is_active,
        },
        stats: {
          total_shares: stats.total_shares || 0,
          total_savings: parseFloat(stats.total_savings) || 0,
          active_loans_count: stats.active_loans || 0,
          loan_balance: parseFloat(stats.loan_balance) || 0,
          welfare_payments_count: welfarePayments.length || 0,
          pending_guarantor_requests: pendingGuarantorRequests.length || 0,
        },
        notifications: {
          unread_count: unreadNotifications || 0,
        },
        messages: {
          unread_count: unreadMessages || 0,
        },
        recent_transactions: recentTransactions.slice(0, 5) || [],
        active_loans: activeLoans || [],
      },
    });
  } catch (error) {
    console.error("API Dashboard error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to load dashboard data",
    });
  }
};
