const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const checkRole = require("../middleware/checkRole");
const staffController = require("../controllers/staffController");

// All routes require authentication and Disbursement Officer role
router.use(authMiddleware);
router.use(checkRole('Disbursement Officer'));

// GET /disbursement/dashboard
router.get("/dashboard", staffController.disbursementDashboard);

module.exports = router;
