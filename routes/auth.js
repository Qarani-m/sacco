const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authLimiter = require("../middleware/rateLimiter");
const { body } = require("express-validator");

// ========================
// Display Routes (GET)
// ========================

// GET /auth/login
// Render login page
router.get("/login", (req, res) => {
  res.render("auth/login.ejs", { title: "Login", layout: "layouts/auth" });
});

// GET /auth/register
// Render registration page
router.get("/register", (req, res) => {
  res.render("auth/register", { title: "Register", layout: "layouts/auth" });
});

// GET /auth/forgot-password
// Render forgot password page
router.get("/forgot-password", (req, res) => {
  res.render("auth/forgot-password", {
    title: "Forgot Password",
    layout: "layouts/auth",
  });
});

// GET /auth/reset-password/:token
// Render reset password page with token
router.get("/reset-password/:token", (req, res) => {
  const { token } = req.params;
  res.render("auth/reset-password", {
    title: "Reset Password",
    token,
    layout: "layouts/auth",
  });
});

// GET /auth/verify-email
// Show email verification pending page
router.get("/verify-email", authController.showVerifyEmail);

// GET /auth/verify/:token
// Handle email verification magic link
router.get("/verify/:token", authController.verifyEmail);

// ========================
// Action Routes (POST)
// ========================

// POST /auth/login
router.post(
  "/login",
  authLimiter,
  [
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  authController.login
);

// POST /auth/register
router.post(
  "/register",
  authLimiter,
  [
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/[a-z]/)
      .withMessage("Password must contain at least one lowercase letter")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/[0-9]/)
      .withMessage("Password must contain at least one number")
      .matches(/[\W_]/)
      .withMessage("Password must contain at least one special character"),
    body("full_name").notEmpty().withMessage("Full name is required"),
    body("phone_number").notEmpty().withMessage("Phone number is required"),
  ],
  authController.register
);

// GET /auth/logout (changed from POST to GET)
router.get("/logout", authController.logout);

// GET /auth/seed
// Seed database with test users (development only)
router.get("/seed", authController.seedDatabase);

// POST /auth/forgot-password
router.post(
  "/forgot-password",
  authLimiter,
  [body("email").isEmail().withMessage("Please enter a valid email")],
  authController.forgotPassword
);

// POST /auth/reset-password/:token
router.post(
  "/reset-password/:token",
  authLimiter,
  [
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/[a-z]/)
      .withMessage("Password must contain at least one lowercase letter")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/[0-9]/)
      .withMessage("Password must contain at least one number")
      .matches(/[\W_]/)
      .withMessage("Password must contain at least one special character"),
  ],
  authController.resetPassword
);

// GET /auth/resend-verification
// Show resend verification page
router.get("/resend-verification", authController.showResendVerification);

// POST /auth/resend-verification
// Resend verification email
router.post(
  "/resend-verification",
  authLimiter,
  [body("email").isEmail().withMessage("Please enter a valid email")],
  authController.resendVerification
);

module.exports = router;
