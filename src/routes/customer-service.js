const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const checkRole = require("../middleware/checkRole");
const staffController = require("../controllers/staffController");

// All routes require authentication and Customer Service role
router.use(authMiddleware);
router.use(checkRole('Customer Service'));

// GET /customer-service/dashboard
router.get("/dashboard", staffController.customerServiceDashboard);

module.exports = router;
