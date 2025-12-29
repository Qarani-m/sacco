// controllers/shareController.js
const Share = require("../models/Share");

const viewShares = async (req, res) => {
  try {
    const userId = req.user.id;

    const totalShares = await Share.getTotalByUser(userId);
    const availableShares = await Share.getAvailableByUser(userId);
    const pledgedShares = await Share.getPledgedByUser(userId);
    const shareHistory = await Share.getHistory(userId);

    // Calculate max purchasable (50 shares total limit)
    const maxPurchasable = Math.max(0, 50 - totalShares);

    res.render("member/shares", {
      title: "My Shares",
      user: req.user,
      unreadMessages: 0,
      unreadNotifications: 0,
      totalShares: totalShares || 0,
      activeShares: availableShares || 0,
      pledgedShares: pledgedShares || 0,
      maxPurchasable: maxPurchasable,
      shareHistory: shareHistory || [],
    });
  } catch (err) {
    console.error("viewShares error:", err);
    res.status(500).send("Failed to load shares page");
  }
};

const showBuyForm = async (req, res) => {
  try {
    const userId = req.user.id;
    const totalShares = await Share.getTotalByUser(userId);

    res.render("shares/buy", {
      title: "Buy Shares",
      totalShares,
      user: req.user,
      unreadNotifications: 0,
      unreadMessages: 0,
      csrfToken: req.csrfToken(),
    });
  } catch (err) {
    console.error("showBuyForm error:", err);
    res.status(500).render("errors/500", {
      title: "Server Error",
      error: err,
    });
  }
};

const buyShares = async (req, res) => {
  try {
    const userId = req.user.id;
    const { quantity, phone_number, registered_number } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: "Invalid quantity" });
    }

    const amount = quantity * 1; // KSh 1 per share

    // Check 50k limit
    const currentValue = await Share.getValueByUser(userId);
    if (currentValue + amount > 50000) {
      return res.status(400).json({
        error: "Maximum share limit is KSh 50,000",
        current_value: currentValue,
        requested: amount,
        max_allowed: 50000,
        available_to_buy: Math.floor((50000 - currentValue) / 1),
      });
    }

    // Get user details
    const User = require("../models/User");
    const user = await User.findById(userId);

    // Determine phone number to use
    const paymentPhoneNumber = registered_number
      ? user.phone_number
      : phone_number;

    if (!paymentPhoneNumber) {
      console.log("Phone number is reequired");
      return res.status(400).json({ error: "Phone number is required" });
    }

    // Initiate M-Pesa payment using the centralized payment service
    const paymentService = require("../services/paymentService");

    try {
      const mpesaResponse = await paymentService.initiateSTKPush(
        paymentPhoneNumber,
        amount,
        `SHARES_${Date.now()}`,
        `Purchase of ${quantity} shares`
      );

      // Create transaction record with CheckoutRequestID
      const Transaction = require("../models/Transaction");
      await Transaction.create({
        user_id: userId,
        amount,
        type: "shares",
        payment_method: "mpesa",
        transaction_ref: mpesaResponse.CheckoutRequestID,
        mpesa_merchant_request_id: mpesaResponse.MerchantRequestID,
        status: "pending",
      });

      // Note: Shares will be created automatically when the payment callback
      // confirms successful payment in paymentController.allocatePayment()

      res.status(200).json({
        success: true,
        message: "Payment initiated. Check your phone for M-Pesa prompt",
        transaction_ref: mpesaResponse.CheckoutRequestID,
        checkout_request_id: mpesaResponse.CheckoutRequestID,
        quantity,
        amount,
      });
    } catch (mpesaError) {
      console.error("M-Pesa initiation error:", mpesaError);
      return res.status(500).json({
        error: "Failed to initiate M-Pesa payment",
        details: mpesaError.message,
      });
    }
  } catch (err) {
    console.error("buyShares error:", err);
    res.status(500).json({ error: "Failed to purchase shares" });
  }
};

const getAvailableShares = async (req, res) => {
  try {
    const userId = req.user.id;
    const available = await Share.getAvailableByUser(userId);
    res.json({ availableShares: available });
  } catch (err) {
    console.error("getAvailableShares error:", err);
    res.status(500).json({ message: "Failed to fetch available shares" });
  }
};

const getPledgedShares = async (req, res) => {
  try {
    const userId = req.user.id;
    const pledged = await Share.getPledgedByUser(userId);
    res.json({ pledgedShares: pledged });
  } catch (err) {
    console.error("getPledgedShares error:", err);
    res.status(500).json({ message: "Failed to fetch pledged shares" });
  }
};

const getShareHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await Share.getHistory(userId);
    res.json({ shareHistory: history });
  } catch (err) {
    console.error("getShareHistory error:", err);
    res.status(500).json({ message: "Failed to fetch share history" });
  }
};

module.exports = {
  viewShares,
  showBuyForm,
  buyShares,
  getAvailableShares,
  getPledgedShares,
  getShareHistory,
};
