const express = require('express');
const router = express.Router();
const  authMiddleware = require('../middleware/auth');
const adminAuthMiddleware = require('../middleware/adminAuth');
const reportController = require('../controllers/reportController');

// All routes require authentication
router.use(authMiddleware);

// GET /reports
// Display reports dashboard (different views for admin vs member)
router.get('/', reportController.showReportsDashboard);

// GET /reports/personal/savings
// Generate member's personal savings report
// Shows previous year + current year + total
router.get('/personal/savings', reportController.generatePersonalSavingsReport);

// GET /reports/personal/shares
// Generate member's share ownership report
router.get('/personal/shares', reportController.generatePersonalSharesReport);

// GET /reports/personal/loans
// Generate member's loan history report
router.get('/personal/loans', reportController.generatePersonalLoansReport);

// GET /reports/personal/welfare
// Generate member's welfare contribution report
router.get('/personal/welfare', reportController.generatePersonalWelfareReport);

// Admin-only reports
router.use(adminAuthMiddleware);

// POST /reports/sacco/loans
// Generate SACCO-wide loan report
// Input: start_date, end_date, status filter
router.post('/sacco/loans', reportController.generateSaccoLoanReport);

// POST /reports/sacco/shares
// Generate SACCO share distribution report
router.post('/sacco/shares', reportController.generateSaccoSharesReport);

// POST /reports/sacco/welfare
// Generate SACCO welfare collections report (yearly)
router.post('/sacco/welfare', reportController.generateSaccoWelfareReport);

// POST /reports/sacco/savings
// Generate SACCO collective savings report
// Shows interest collected in SACCO savings account
router.post('/sacco/savings', reportController.generateSaccoSavingsReport);

// POST /reports/sacco/members
// Generate member statistics report
router.post('/sacco/members', reportController.generateMemberStatsReport);

// POST /reports/sacco/defaulters
// Generate loan defaulters report
router.post('/sacco/defaulters', reportController.generateDefaultersReport);

// GET /reports/export/:reportId
// Export report as PDF or Excel
router.get('/export/:reportId', reportController.exportReport);

module.exports = router;