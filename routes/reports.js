// routes/reports.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const adminAuthMiddleware = require("../middleware/adminAuth");
const reportController = require("../controllers/reportController");

// All routes require authentication
router.use(authMiddleware);

// GET /reports
// Display reports dashboard (admin view)
router.get("/", reportController.showReportsDashboard);

// Admin-only reports
router.use(adminAuthMiddleware);

// API Routes for fetching JSON data (for on-screen display)
router.post("/sacco/loans", reportController.generateSaccoLoanReport);
router.post("/sacco/shares", reportController.generateSaccoSharesReport);
router.post("/sacco/welfare", reportController.generateSaccoWelfareReport);
router.post("/sacco/savings", reportController.generateSaccoSavingsReport);
router.post("/sacco/members", reportController.generateMemberStatsReport);

// Download Route (CSV) - Uses GET and Query Params for easy browser navigation
// e.g., /admin/reports/download/loans?status=active&start_date=2023-01-01
router.get("/download/:type", reportController.downloadReport);

module.exports = router;
