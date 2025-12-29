const express = require("express");
const router = express.Router();
const membersController = require("../../../controllers/membersController");
const authMiddleware = require("../../../middleware/authApi");

// Secure all routes with JWT middleware
router.use(authMiddleware);

// GET /api/v1/members/dashboard
router.get("/dashboard", membersController.showDashboard);

module.exports = router;
