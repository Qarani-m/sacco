const User = require("../models/User");
const Share = require("../models/Share");
const Loan = require("../models/Loan");
const Savings = require("../models/Savings");
const Notification = require("../models/Notification");
const Transaction = require("../models/Transaction");

const Message = require("../models/Message");

exports.showDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch fresh user data from database to get current email_verified status
    const user = await User.findById(userId);

    // Fetch all required data
    const stats = await User.getStats(userId);
    const recentTransactions = await Transaction.getByUser(userId);
    const unreadNotifications = await Notification.getUnreadCount(userId);
    const unreadMessages = await Message.getUnreadCount(userId);
    const activeLoans = await Loan.getByUser(userId, "active");

    // Fetch recent notifications and messages for preview
    const notifications = await Notification.getByUser(userId, false);
    const messages = await Message.getByUser(userId);

    // Get welfare payments count
    const WelfarePayment = require("../models/WelfarePayment");
    const welfarePayments = await WelfarePayment.getByUser(userId);

    // Get pending guarantor requests
    const LoanGuarantor = require("../models/LoanGuarantor");
    const pendingGuarantorRequests = await LoanGuarantor.getPendingByGuarantor(
      userId
    );

    res.render("member/dashboard", {
      title: "Dashboard",
      user: user, // Use fresh user data from database
      stats: {
        total_shares: stats.total_shares || 0,
        total_savings: parseFloat(stats.total_savings) || 0,
        active_loans: stats.active_loans || 0,
        loan_balance: parseFloat(stats.loan_balance) || 0,
        welfare_payments: welfarePayments.length || 0,
        pending_guarantor_requests: pendingGuarantorRequests.length || 0,
      },
      recent_transactions: recentTransactions.slice(0, 5) || [],
      unreadNotifications: unreadNotifications || 0,
      unreadMessages: unreadMessages || 0,
      active_loans: activeLoans || [],
      notifications: notifications || [],
      messages: messages || [],
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).send("Failed to load dashboard");
  }
};

exports.showRegistrationPage = async (req, res) => {
  try {
    res.json({
      success: true,
      registration_fee: 2, // Testing: 2 bob (change to 1000 for production)
      message: "Please pay KSh 2 registration fee to access SACCO features",
    });
  } catch (error) {
    console.error("Show registration page error:", error);
    res.status(500).json({ error: "Failed to load page" });
  }
};

exports.payRegistrationFee = async (req, res) => {
  try {
    const userId = req.user.id;
    const amount = 2; // Testing: 2 bob (change to 1000 for production)
    const { phone_number } = req.body;

    const user = await User.findById(userId);
    if (user.registration_paid) {
      return res.status(400).json({ error: "Registration fee already paid" });
    }

    // Determine phone number to use
    const paymentPhoneNumber = phone_number || user.phone_number;

    if (!paymentPhoneNumber) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    // Initiate M-Pesa STK Push
    const paymentService = require("../services/paymentService");
    const mpesaResponse = await paymentService.initiateSTKPush(
      paymentPhoneNumber,
      amount,
      `REG${Date.now()}`,
      `Registration Fee`
    );

    // Create transaction with CheckoutRequestID
    const Transaction = require("../models/Transaction");
    await Transaction.create({
      user_id: userId,
      amount,
      type: "registration",
      payment_method: "mpesa",
      transaction_ref: mpesaResponse.CheckoutRequestID,
      mpesa_merchant_request_id: mpesaResponse.MerchantRequestID,
      status: "pending",
    });

    res.json({
      success: true,
      message: "STK push sent! Check your phone for M-Pesa prompt",
      amount,
      transaction_ref: mpesaResponse.CheckoutRequestID,
      checkout_request_id: mpesaResponse.CheckoutRequestID,
    });
  } catch (error) {
    console.error("Pay registration fee error:", error);
    res.status(500).json({ error: "Failed to process payment" });
  }
};

exports.showProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      profile: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone_number: user.phone_number,
        role: user.role,
        is_active: user.is_active,
        registration_paid: user.registration_paid,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error("Show profile error:", error);
    res.status(500).json({ error: "Failed to load profile" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, phone_number } = req.body;

    const updatedUser = await User.update(userId, { full_name, phone_number });

    res.json({
      success: true,
      message: "Profile updated successfully",
      profile: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

exports.listNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { unread_only } = req.query;

    const notifications = await Notification.getByUser(
      userId,
      unread_only === "true"
    );
    const unreadCount = await Notification.getUnreadCount(userId);

    res.json({
      success: true,
      notifications,
      unread_count: unreadCount,
    });
  } catch (error) {
    console.error("List notifications error:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    await Notification.markAsRead(notificationId);

    res.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Mark notification read error:", error);
    res.status(500).json({ error: "Failed to mark notification" });
  }
};

exports.viewSavings = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentYear = new Date().getFullYear();

    const yearlyReport = await Savings.getYearlyReport(userId, currentYear);

    const unreadNotifications = await Notification.getUnreadCount(userId);
    const unreadMessages = await Message.getUnreadCount(userId);

    res.render("member/savings", {
      title: "My Savings",
      user: req.user,
      unreadNotifications: unreadNotifications || 0,
      unreadMessages: unreadMessages || 0,
      savings: {
        previous_years: yearlyReport.previous_savings || 0,
        current_year: yearlyReport.current_year_savings || 0,
        total: yearlyReport.total_savings || 0,
      },
      currentYear,
    });
  } catch (error) {
    console.error("View savings error:", error);
    res.status(500).send("Failed to load savings page");
  }
};

exports.uploadDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const { document_type, file_path } = req.body;

    // Validate document type
    if (!["id_front", "id_back"].includes(document_type)) {
      return res.status(400).json({ error: "Invalid document type" });
    }

    const Document = require("../models/Document");
    const document = await Document.create({
      user_id: userId,
      document_type,
      file_path,
    });

    // Notify admins
    const admins = await User.getAllAdmins();
    const notifications = admins.map((admin) => ({
      user_id: admin.id,
      type: "document_upload",
      title: "New Document Upload",
      message: `${req.user.full_name} uploaded ${document_type}`,
      related_entity_type: "document",
      related_entity_id: document.id,
    }));
    await Notification.createBulk(notifications);

    res.json({
      success: true,
      message: "Document uploaded successfully. Awaiting admin verification",
      document,
    });
  } catch (error) {
    console.error("Upload document error:", error);
    res.status(500).json({ error: "Failed to upload document" });
  }
};

exports.viewDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    const Document = require("../models/Document");
    const documents = await Document.findByUserId(userId);

    res.json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error("View documents error:", error);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
};

exports.listNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.getByUser(userId, false);

    res.json({
      success: true,
      notifications: notifications || [],
    });
  } catch (error) {
    console.error("List notifications error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch notifications",
    });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    await Notification.markAsRead(notificationId);

    res.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to mark notification as read",
    });
  }
};

// Additional imports for new features
const Document = require("../models/Document");
const MemberProfile = require("../models/MemberProfile");
const NotificationService = require("../services/notificationService");

// Show registration fee page
exports.showRegistrationFeePage = async (req, res) => {
  try {
    if (req.user.registration_paid) {
      return res.redirect("/members/dashboard");
    }

    res.render("member/registration-fee", {
      title: "Registration Fee",
      user: req.user,
      unreadNotifications: 0,
      unreadMessages: 0,
    });
  } catch (error) {
    console.error("Show registration fee page error:", error);
    res.status(500).send("Failed to load registration page");
  }
};



// Show profile page
exports.showProfilePage = async (req, res) => {
  try {
    const userId = req.user.id;
    const documents = await Document.getByMemberId(userId);
    const profileForm = await MemberProfile.findByUserId(userId);

    res.render("member/profile", {
      title: "My Profile",
      user: req.user,
      unreadNotifications: 0,
      unreadMessages: 0,
      documents: documents || [],
      profileForm: profileForm || null,
    });
  } catch (error) {
    console.error("Show profile error:", error);
    res.status(500).send("Failed to load profile page");
  }
};

// Upload documents
exports.uploadDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    const documentType = req.body.documentType;

    // Validate file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded",
      });
    }

    // Validate document type
    if (!["id_front", "id_back"].includes(documentType)) {
      return res.status(400).json({
        success: false,
        error: "Invalid document type. Must be id_front or id_back",
      });
    }

    // Save document to database
    const document = await Document.createOrUpdate({
      memberId: userId,
      documentType: documentType,
      filePath: req.file.path,
      fileName: req.file.filename,
    });

    // Create pending admin action
    const AdminAction = require("../models/AdminAction");
    await AdminAction.create({
      initiated_by: userId,
      action_type: "update",
      entity_type: "document",
      entity_id: document.id,
      reason: "Document upload requires review",
      action_data: { status: "approved" }, // Implied action is approval
    });

    // Notify all admins
    const message = `${req.user.full_name
      } uploaded a new ${documentType.replace("_", " ")} document`;
    await NotificationService.notifyAllAdmins(
      "document_upload",
      document.id,
      message
    );

    res.json({
      success: true,
      message: "Document uploaded successfully. Awaiting admin review.",
      document: {
        id: document.id,
        type: document.document_type,
        status: document.status,
        uploadedAt: document.uploaded_at,
      },
    });
  } catch (error) {
    console.error("Upload documents error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to upload document",
    });
  }
};

// Submit profile form
exports.submitProfileForm = async (req, res) => {
  try {
    const userId = req.user.id;

    const exists = await MemberProfile.exists(userId);
    if (exists) {
      return res.json({
        success: false,
        error: "Profile form already submitted",
      });
    }

    const profileData = {
      user_id: userId,
      ...req.body,
    };

    await MemberProfile.create(profileData);

    res.json({
      success: true,
      message: "Profile form submitted successfully",
    });
  } catch (error) {
    console.error("Submit profile form error:", error);
    res.status(500).json({ error: "Failed to submit profile form" });
  }
};

// Show loan request page
exports.showLoanRequestPage = async (req, res) => {
  try {
    const userId = req.user.id;
    const totalShares = await Share.getTotalByUser(userId);
    const availableShares = await Share.getAvailableByUser(userId);

    res.render("member/loan-request", {
      title: "Request Loan",
      user: req.user,
      unreadNotifications: 0,
      unreadMessages: 0,
      totalShares: totalShares || 0,
      availableShares: availableShares || 0,
    });
  } catch (error) {
    console.error("Show loan request page error:", error);
    res.status(500).send("Failed to load loan request page");
  }
};
