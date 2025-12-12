const express = require("express");
const router = express.Router();
const authApiController = require("../../../controllers/api/authApiController");

// POST /api/v1/auth/login
router.post("/login", authApiController.login);

module.exports = router;
