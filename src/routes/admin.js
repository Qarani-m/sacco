const express = require("express");
const router = express.Router();
// admin.js
const authMiddleware = require("../middleware/auth"); // Cookie-based auth

const adminController = require("../controllers/adminController");
const authController = require("../controllers/authController");
const { body } = require("express-validator");
const authLimiter = require("../middleware/rateLimiter");

// All routes require authentication
router.use(authMiddleware);

// Check if user is admin
router.use((req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    req.flash("error_msg", "Admin access required");
    res.redirect("/members/dashboard");
  }
});

// GET /admin/register
// Show registration form
router.get("/register", async (req, res) => {
  try {
    const db = require("../models/db");
    const pendingCountResult = await db.query(
      "SELECT COUNT(*) FROM admin_actions WHERE status = 'pending'"
    );
    const pendingCount = parseInt(pendingCountResult.rows[0].count);

    res.render("admin/register", {
      title: "Register Member",
      layout: "layouts/admin",
      pendingCount,
      user: req.user,
    });
  } catch (error) {
    console.error("Register page error:", error);
    res.status(500).render("errors/500", { title: "Server Error", error });
  }
});

// POST /admin/register
// Register new member
router.post(
  "/register",
  authLimiter,
  [
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/[a-z]/)
      .withMessage("Password must contain at least one lowercase letter")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/[0-9]/)
      .withMessage("Password must contain at least one number")
      .matches(/[\W_]/)
      .withMessage("Password must contain at least one special character"),
    body("full_name").notEmpty().withMessage("Full name is required"),
    body("phone_number").notEmpty().withMessage("Phone number is required"),
  ],
  authController.register
);

// GET /admin/dashboard
// Display admin dashboard with overview stats
router.get("/dashboard", adminController.showDashboard);

// GET /admin/pending-actions
// View all actions waiting for admin verification (2/3 approval)
router.get("/pending-actions", adminController.showPendingActions);

// POST /admin/action/initiate
// Start a new admin action (create/update/delete)
// Requires reason, action type, entity details
// Creates pending action requiring 2 other admins to verify
router.post("/action/initiate", adminController.initiateAction);

// POST /admin/action/verify/:actionId
// Approve or reject a pending admin action
// When 2/3 admins approve, action executes automatically
router.post("/action/verify/:actionId", adminController.verifyAction);

// GET /admin/actions/history
// View history of all admin actions (approved, rejected, pending)
router.get("/actions/history", adminController.showActionsHistory);

// GET /admin/members
// List all SACCO members with search and filter
router.get("/members", adminController.listMembers);

// GET /admin/members/:userId/edit
// Show form to edit member details
router.get("/members/:userId/edit", adminController.editMemberForm);

// POST /admin/members/:userId
// Update member details
router.post("/members/:userId", adminController.updateMember);

// GET /admin/members/:userId
// View detailed information about specific member
router.get("/members/:userId", adminController.viewMember);

// POST /admin/members/:userId/deactivate
// Initiate member deactivation (requires 2/3 admin approval)
router.post("/members/:userId/deactivate", adminController.deactivateMember);

// POST /admin/members/:userId/activate
// Initiate member reactivation (requires 2/3 admin approval)
router.post("/members/:userId/activate", adminController.activateMember);

// GET /admin/loans
// View all loan requests and active loans
router.get("/loans", adminController.listLoans);

// GET /admin/loans/:loanId
// View detailed loan information including guarantors
router.get("/loans/:loanId", adminController.viewLoan);

// POST /admin/loans/:loanId/approve
// Approve loan request (requires 2/3 admin approval if admin is NOT the borrower)
// If admin is borrower, the OTHER 2 admins must approve
router.post("/loans/:loanId/approve", adminController.approveLoan);

// Reject loan request (requires 2/3 admin approval)
router.post("/loans/:loanId/reject", adminController.rejectLoan);

// POST /admin/loans/:loanId/disburse
// Disburse funds for approved loan
router.post("/loans/:loanId/disburse", adminController.disburseLoan);

// GET /admin/shares
// View all share purchases across members
router.get("/shares", adminController.listShares);

// GET /admin/welfare
// View all welfare payment records
router.get("/welfare", adminController.listWelfarePayments);

// GET /admin/reports
// Display report generation page
router.get("/reports", adminController.showReports);

// POST /admin/reports/loans
// Generate loan report (active, paid, defaulted)
router.post("/reports/loans", adminController.generateLoanReport);

// POST /admin/reports/shares
// Generate share distribution report
router.post("/reports/shares", adminController.generateShareReport);

// POST /admin/reports/welfare
// Generate yearly welfare collection report
router.post("/reports/welfare", adminController.generateWelfareReport);

// POST /admin/reports/savings
// Generate yearly savings report (previous year + current year)
router.post("/reports/savings", adminController.generateSavingsReport);

// POST /admin/reports/sacco-savings
// Generate SACCO collective savings report (interest collected)
router.post(
  "/reports/sacco-savings",
  adminController.generateSaccoSavingsReport
);

// GET /admin/messages
// View messages from members and other admins
router.get("/messages", adminController.listMessages);

// GET /admin/messages/new
// Show form to send a new message
router.get("/messages/new", adminController.showMessageForm);

// GET /admin/messages/:messageId
// View specific message thread
router.get("/messages/:messageId", adminController.viewMessage);

// POST /admin/messages/send
// Send message to member(s) - payment reminders, announcements, etc.
router.post("/messages/send", adminController.sendMessage);

// POST /admin/messages/:messageId/reply
// Reply to a message from member
router.post("/messages/:messageId/reply", adminController.replyMessage);

// GET /admin/reminders
// Show reminders page
router.get("/reminders", adminController.showReminders);

// POST /admin/reminders/send
// Send bulk payment reminders to members
router.post("/reminders/send", adminController.sendReminders);

// GET /admin/notifications
// View admin notifications (pending verifications, new loan requests)
router.get("/notifications", adminController.listNotifications);

// POST /admin/notifications/:notificationId/read
// Mark notification as read
router.post(
  "/notifications/:notificationId/read",
  adminController.markNotificationRead
);

// GET /admin/documents
// View all pending and reviewed member documents
router.get("/documents", adminController.listDocuments);

// GET /admin/documents/:documentId
// View specific document details
router.get("/documents/:documentId", adminController.viewDocument);

// POST /admin/documents/:documentId/review
// Review and update document status (pending, in_review, approved, rejected)
router.post("/documents/:documentId/review", adminController.reviewDocument);

module.exports = router;
