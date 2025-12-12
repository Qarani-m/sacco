const express = require("express");
const router = express.Router();

const authRoutes = require("./v1/auth");
const memberRoutes = require("./v1/members");

// API Version 1
router.use("/v1/auth", authRoutes);
router.use("/v1/members", memberRoutes);

module.exports = router;
