const WelfarePayment = require("../models/WelfarePayment");
const Transaction = require("../models/Transaction");

exports.viewWelfare = async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await WelfarePayment.getStatsByUser(userId);
    const paymentHistory = await WelfarePayment.getByUser(userId);

    // Format last payment date
    const lastPaymentDate = stats.last_payment_date
      ? new Date(stats.last_payment_date).toLocaleDateString()
      : "Never";

    res.render("member/welfare", {
      title: "Welfare Payments",
      user: req.user,
      unreadMessages: 0,
      unreadNotifications: 0,
      totalPayments: parseInt(stats.payment_count) || 0,
      totalContributed: parseFloat(stats.total_paid) || 0,
      lastPaymentDate: lastPaymentDate,
      paymentHistory: paymentHistory || [],
    });
  } catch (error) {
    console.error("View welfare error:", error);
    res.status(500).send("Failed to load welfare page");
  }
};

exports.showPaymentForm = async (req, res) => {
  try {
    res.json({
      success: true,
      welfare_amount: 300,
      message: "Welfare payment is KSh 300",
    });
  } catch (error) {
    console.error("Show payment form error:", error);
    res.status(500).json({ error: "Failed to load form" });
  }
};

exports.payWelfare = async (req, res) => {
  try {
    // GET request - show the payment form
    if (req.method === "GET") {
      return res.render("welfare/pay", {
        title: "Pay Welfare",
        user: req.user,
        unreadNotifications: 0,
        unreadMessages: 0,
      });
    }

    // POST request - process payment (kept for backward compatibility, but should use /payments/initiate)
    const userId = req.user.id;
    const amount = 300;
    const transactionRef = `WELFARE${Date.now()}${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Create transaction
    await Transaction.create({
      user_id: userId,
      amount,
      type: "welfare",
      payment_method: "mpesa",
      transaction_ref: transactionRef,
      status: "pending",
    });

    res.json({
      success: true,
      message: "Check your phone for M-Pesa prompt",
      amount,
      transaction_ref: transactionRef,
    });
  } catch (error) {
    console.error("Pay welfare error:", error);
    if (req.method === "GET") {
      res.status(500).render("errors/500", {
        title: "Server Error",
        error,
      });
    } else {
      res.status(500).json({ error: "Failed to process payment" });
    }
  }
};

exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await WelfarePayment.getByUser(userId);

    res.json({
      success: true,
      history,
    });
  } catch (error) {
    console.error("Get payment history error:", error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
};

exports.getWelfareStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await WelfarePayment.getStatsByUser(userId);
    const currentYear = new Date().getFullYear();

    // Get this year's payments
    const thisYearQuery = `
            SELECT COALESCE(SUM(amount), 0) as total
            FROM welfare_payments
            WHERE user_id = $1 AND EXTRACT(YEAR FROM payment_date) = $2
        `;
    const db = require("../models/db");
    const yearResult = await db.query(thisYearQuery, [userId, currentYear]);

    res.json({
      success: true,
      total_all_time: stats.total_paid,
      total_this_year: yearResult.rows[0].total,
      payment_count: stats.payment_count,
      last_payment_date: stats.last_payment_date,
    });
  } catch (error) {
    console.error("Get welfare stats error:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};
