const express = require("express");
const router = express.Router();
const memberApiController = require("../../../controllers/api/memberApiController");
const authMiddleware = require("../../../middleware/authApi"); // We will need to create this

// Secure all routes with JWT middleware
router.use(authMiddleware);

// GET /api/v1/members/dashboard
router.get("/dashboard", memberApiController.getDashboard);

module.exports = router;
