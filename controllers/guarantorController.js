const LoanGuarantor = require("../models/LoanGuarantor");
const Loan = require("../models/Loan");
const Share = require("../models/Share");
const User = require("../models/User");
const Notification = require("../models/Notification");

// controllers/guarantorController.js

exports.viewRequestsPage = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user has active loan
    const hasActiveLoan = await User.hasUnpaidLoan(userId);

    // Fetch pending guarantor requests for this member
    const pendingRequests = await LoanGuarantor.getPendingByGuarantor(userId);

    // Fetch active guarantees
    const activeGuarantees = await LoanGuarantor.getByGuarantor(
      userId,
      "accepted"
    );

    // Get available shares
    const availableShares = await Share.getAvailableByUser(userId);

    // Calculate total pledged shares
    let totalPledgedShares = 0;
    activeGuarantees.forEach((g) => {
      totalPledgedShares += parseInt(g.shares_pledged) || 0;
    });

    // Render the EJS page
    res.render("member/guarantor-requests", {
      title: "Guarantor Requests",
      user: req.user,
      unreadMessages: 0,
      unreadNotifications: 0,
      hasActiveLoan: hasActiveLoan,
      pendingRequests: pendingRequests || [],
      activeGuarantees: activeGuarantees || [],
      availableShares: availableShares || 0,
      totalPledgedShares: totalPledgedShares,
      csrfToken: req.csrfToken(),
    });
  } catch (error) {
    console.error("View guarantor requests error:", error);
    res.status(500).send("Failed to load guarantor requests page");
  }
};

exports.viewRequestDetail = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await LoanGuarantor.findById(requestId);

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (request.guarantor_id !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    res.json({
      success: true,
      request,
    });
  } catch (error) {
    console.error("View request detail error:", error);
    res.status(500).json({ error: "Failed to fetch request details" });
  }
};

exports.respondToRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { decision, shares_to_pledge } = req.body;
    const userId = req.user.id;

    const request = await LoanGuarantor.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (request.guarantor_id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ error: "Request already processed" });
    }

    if (decision === "declined") {
      await LoanGuarantor.decline(requestId);

      // Notify borrower
      const loan = await Loan.findById(request.loan_id);
      await Notification.create({
        user_id: loan.borrower_id,
        type: "guarantor_response",
        title: "Guarantor Declined",
        message: `${req.user.full_name} declined your guarantor request`,
        related_entity_type: "loan",
        related_entity_id: loan.id,
      });

      return res.json({
        success: true,
        message: "Guarantor request declined",
      });
    }

    // Validate acceptance
    const hasUnpaidLoan = await User.hasUnpaidLoan(userId);
    if (hasUnpaidLoan) {
      return res
        .status(400)
        .json({
          error: "You cannot guarantee loans while you have an unpaid loan",
        });
    }

    const availableShares = await Share.getAvailableByUser(userId);
    if (shares_to_pledge > availableShares) {
      return res.status(400).json({ error: "Insufficient available shares" });
    }

    // Pledge shares
    await Share.pledgeShares(userId, shares_to_pledge);

    // Update guarantor request
    await LoanGuarantor.accept(requestId);

    // Update request with actual shares pledged
    const db = require("../models/db");
    await db.query(
      "UPDATE loan_guarantors SET shares_pledged = $1, amount_covered = $2 WHERE id = $3",
      [shares_to_pledge, shares_to_pledge * 1000, requestId]
    );

    // Notify borrower
    const loan = await Loan.findById(request.loan_id);
    await Notification.create({
      user_id: loan.borrower_id,
      type: "guarantor_response",
      title: "Guarantor Accepted",
      message: `${req.user.full_name} accepted your guarantor request with ${shares_to_pledge} shares`,
      related_entity_type: "loan",
      related_entity_id: loan.id,
    });

    res.json({
      success: true,
      message: "Guarantor request accepted",
    });
  } catch (error) {
    console.error("Respond to request error:", error);
    res.status(500).json({ error: "Failed to respond to request" });
  }
};

exports.viewMyGuarantees = async (req, res) => {
  try {
    const userId = req.user.id;
    const guarantees = await LoanGuarantor.getByGuarantor(userId, "accepted");

    res.json({
      success: true,
      guarantees,
    });
  } catch (error) {
    console.error("View guarantees error:", error);
    res.status(500).json({ error: "Failed to fetch guarantees" });
  }
};

exports.searchGuarantors = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all users who are eligible (no unpaid loans, have available shares)
    const query = `
            SELECT u.id, u.full_name, u.email,
                   (SELECT COALESCE(SUM(s.quantity), 0) FROM shares s WHERE s.user_id = u.id AND s.status = 'active') as available_shares
            FROM users u
            WHERE u.id != $1
            AND u.is_active = true
            AND u.registration_paid = true
            AND NOT EXISTS (
                SELECT 1 FROM loans l 
                WHERE l.borrower_id = u.id 
                AND l.status IN ('approved', 'active') 
                AND l.balance_remaining > 0
            )
            AND EXISTS (
                SELECT 1 FROM shares s 
                WHERE s.user_id = u.id 
                AND s.status = 'active'
            )
            ORDER BY u.full_name
        `;

    const db = require("../models/db");
    const result = await db.query(query, [userId]);

    res.json({
      success: true,
      eligible_guarantors: result.rows,
    });
  } catch (error) {
    console.error("Search guarantors error:", error);
    res.status(500).json({ error: "Failed to search guarantors" });
  }
};

exports.sendRequest = async (req, res) => {
  try {
    const { loan_id, guarantor_id, shares_requested } = req.body;
    const userId = req.user.id;

    // Validate loan belongs to user
    const loan = await Loan.findById(loan_id);
    if (!loan || loan.borrower_id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (loan.status !== "pending") {
      return res
        .status(400)
        .json({ error: "Can only request guarantors for pending loans" });
    }

    // Check if guarantor is eligible
    const hasUnpaidLoan = await User.hasUnpaidLoan(guarantor_id);
    if (hasUnpaidLoan) {
      return res
        .status(400)
        .json({
          error: "This member has an unpaid loan and cannot be a guarantor",
        });
    }

    const availableShares = await Share.getAvailableByUser(guarantor_id);
    if (shares_requested > availableShares) {
      return res
        .status(400)
        .json({ error: "Guarantor does not have enough available shares" });
    }

    // Create guarantor request
    const request = await LoanGuarantor.create({
      loan_id,
      guarantor_id,
      shares_pledged: shares_requested,
      amount_covered: shares_requested * 1000,
    });

    // Notify guarantor
    await Notification.create({
      user_id: guarantor_id,
      type: "guarantor_request",
      title: "New Guarantor Request",
      message: `${req.user.full_name} is requesting you to guarantee a loan with ${shares_requested} shares`,
      related_entity_type: "loan_guarantor",
      related_entity_id: request.id,
    });

    res.json({
      success: true,
      message: "Guarantor request sent",
      request,
    });
  } catch (error) {
    console.error("Send guarantor request error:", error);
    res.status(500).json({ error: "Failed to send request" });
  }
};

exports.sendBulkRequests = async (req, res) => {
  try {
    const { loan_id, guarantor_requests } = req.body;
    const userId = req.user.id;

    // Validate loan
    const loan = await Loan.findById(loan_id);
    if (!loan || loan.borrower_id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (loan.status !== "pending") {
      return res
        .status(400)
        .json({ error: "Can only request guarantors for pending loans" });
    }

    const requests = [];
    const notifications = [];

    for (const gr of guarantor_requests) {
      // Validate each guarantor
      const hasUnpaidLoan = await User.hasUnpaidLoan(gr.guarantor_id);
      if (hasUnpaidLoan) continue;

      const availableShares = await Share.getAvailableByUser(gr.guarantor_id);
      if (gr.shares_requested > availableShares) continue;

      // Create request
      const request = await LoanGuarantor.create({
        loan_id,
        guarantor_id: gr.guarantor_id,
        shares_pledged: gr.shares_requested,
        amount_covered: gr.shares_requested * 1000,
      });

      requests.push(request);

      // Prepare notification
      notifications.push({
        user_id: gr.guarantor_id,
        type: "guarantor_request",
        title: "New Guarantor Request",
        message: `${req.user.full_name} is requesting you to guarantee a loan with ${gr.shares_requested} shares`,
        related_entity_type: "loan_guarantor",
        related_entity_id: request.id,
      });
    }

    // Send all notifications
    if (notifications.length > 0) {
      await Notification.createBulk(notifications);
    }

    res.json({
      success: true,
      message: `Sent ${requests.length} guarantor requests`,
      requests,
    });
  } catch (error) {
    console.error("Send bulk requests error:", error);
    res.status(500).json({ error: "Failed to send requests" });
  }
};

exports.checkEligibility = async (req, res) => {
  try {
    const { userId } = req.params;

    const hasUnpaidLoan = await User.hasUnpaidLoan(userId);
    const availableShares = await Share.getAvailableByUser(userId);

    res.json({
      success: true,
      has_unpaid_loans: hasUnpaidLoan,
      available_shares: availableShares,
      is_eligible: !hasUnpaidLoan && availableShares > 0,
    });
  } catch (error) {
    console.error("Check eligibility error:", error);
    res.status(500).json({ error: "Failed to check eligibility" });
  }
};
