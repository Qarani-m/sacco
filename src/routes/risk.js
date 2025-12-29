const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const checkRole = require("../middleware/checkRole");
const staffController = require("../controllers/staffController");

// All routes require authentication and Risk role
router.use(authMiddleware);
router.use(checkRole('Risk'));

// GET /risk/dashboard
router.get("/dashboard", staffController.riskDashboard);

module.exports = router;
