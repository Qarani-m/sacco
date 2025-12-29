const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const checkRole = require("../middleware/checkRole");
const staffController = require("../controllers/staffController");

// All routes require authentication and Finance role
router.use(authMiddleware);
router.use(checkRole('Finance'));

// GET /finance/dashboard
router.get("/dashboard", staffController.financeDashboard);

module.exports = router;
