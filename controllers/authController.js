const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const emailService = require("../services/emailService");

exports.showLogin = (req, res) => {
  res.render("auth/login");
};

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("error_msg", errors.array()[0].msg);
      return res.redirect("/auth/login");
    }

    const { email, password } = req.body;

    const user = await User.findByEmail(email);

    if (!user) {
      console.error(`email: ${email}, Password: ${password}`);
      req.flash("error_msg", "Invalid credentials");
      return res.redirect("/auth/login");
    }

    if (!user.is_active) {
      req.flash("error_msg", "Account is deactivated");
      return res.redirect("/auth/login");
    }

    const isValid = await User.verifyPassword(password, user.password_hash);
    if (!isValid) {
      req.flash("error_msg", "Invalid credentials");
      return res.redirect("/auth/login");
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
        registration_paid: user.registration_paid,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set JWT in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const redirectUrl =
      user.role === "admin" ? "/admin/dashboard" : "/members/dashboard";
    // const redirectUrl = user.role === 'admin' ? '/admin/dashboard' : '/members/dashboard';

    req.flash("success_msg", "Login successful!");
    return res.redirect(redirectUrl);
  } catch (error) {
    console.error("Login error:", error);
    req.flash("error_msg", "Login failed. Please try again.");
    return res.redirect("/auth/login");
  }
};
exports.showRegister = (req, res) => {
  res.render("auth/register");
};

exports.register = async (req, res) => {

  console.log(`------------------------------${Object.keys(req.body)}-------------------------------------------`)
  console.log(`------------------------------${req.body.email}-------------------------------------------`)
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("error_msg", errors.array()[0].msg);
      return res.redirect("/admin/register");
    }

    const { email, password, full_name, phone_number, role } = req.body;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      req.flash("error_msg", "Email already registered");
      return res.redirect("/admin/register");
    }

    const user = await User.create({
      email,
      password,
      full_name,
      phone_number,
      role: role || "member",
    });

    // Generate verification token
    const { token: verificationToken } = await User.generateVerificationToken(
      user.id
    );

    // Send verification email
    await emailService.sendVerificationEmail(
      user.email,
      verificationToken,
      user.full_name
    );

    // Create session token
    const sessionToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
        registration_paid: user.registration_paid,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set JWT in HTTP-only cookie
    res.cookie("token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    req.flash(
      "success_msg",
      "Member registered successfully! Verification email sent."
    );
    return res.redirect("/admin/members");
  } catch (error) {
    console.error("Registration error:", error);
    req.flash("error_msg", "Registration failed. Please try again.");
    return res.redirect("/admin/register");
  }
};
exports.logout = (req, res) => {
  // Clear JWT cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  // Redirect to login page
  res.redirect("/auth/login");
};

exports.showForgotPassword = (req, res) => {
  res.render("auth/forgot-password");
};

exports.forgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { email } = req.body;
    const user = await User.findByEmail(email);

    if (!user) {
      // Don't reveal if user exists or not
      return res.render("auth/forgot-password-sent", {
        title: "Reset Link Sent",
        layout: "layouts/auth",
        email: email,
      });
    }

    const resetToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Send actual password reset email
    await emailService.sendPasswordResetEmail(
      user.email,
      resetToken,
      user.full_name
    );

    res.render("auth/forgot-password-sent", {
      title: "Reset Link Sent",
      layout: "layouts/auth",
      email: user.email,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    req.flash("error_msg", "Failed to process request");
    res.redirect("/auth/forgot-password");
  }
};

exports.showResetPassword = (req, res) => {
  res.render("auth/reset-password", { token: req.params.token });
};

exports.resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If validation fails, re-render the reset password page with errors
      // Use token from body if available, or params (though this POST usually comes from the form which has token in body)
      const token = req.body.token || req.params.token;
      return res.render("auth/reset-password", {
        title: "Reset Password",
        token: token,
        layout: "layouts/auth",
        error: errors.array()[0].msg,
        csrfToken: req.csrfToken && req.csrfToken(),
      });
    }

    // Token usually comes from the form body in the POST request
    const { token, password } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await User.updatePassword(decoded.id, password);

    // Render success page
    res.render("auth/reset-success", {
      title: "Password Reset Successful",
      layout: "layouts/auth",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    // If token invalid, redirect to forgot password with error
    req.flash(
      "error_msg",
      "Invalid or expired token. Please request a new link."
    );
    res.redirect("/auth/forgot-password");
  }
};

// Show verify email page
exports.showVerifyEmail = (req, res) => {
  res.render("auth/verify-email", { title: "Verify Email" });
};

// Verify email with token
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Verify the email
    const user = await User.verifyEmail(token);

    // Render success page
    res.render("auth/email-verified", {
      title: "Email Verified",
      userName: user.full_name,
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.render("auth/verify-email", {
      title: "Verify Email",
      error: error.message || "Invalid or expired verification link",
    });
  }
};

// Show resend verification page
exports.showResendVerification = async (req, res) => {
  try {
    // If user is logged in, prefill their email
    const userEmail = req.user ? req.user.email : "";

    res.render("auth/resend-verification", {
      title: "Resend Verification Email",
      userEmail,
      user: req.user || null,
    });
  } catch (error) {
    console.error("Show resend verification error:", error);
    res.status(500).send("Failed to load page");
  }
};

// Resend verification email
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    const { token, user } = await User.resendVerificationToken(email);

    // Send actual verification email
    await emailService.sendVerificationEmail(user.email, token, user.full_name);

    req.flash("success_msg", "Verification email sent! Check your inbox.");
    res.redirect("/auth/resend-verification");
  } catch (error) {
    console.error("Resend verification error:", error);
    req.flash(
      "error_msg",
      error.message || "Failed to resend verification email"
    );
    res.redirect("/auth/resend-verification");
  }
};

// Seed database with test users
exports.seedDatabase = async (req, res) => {
  try {
    const results = {
      admin: null,
      member: null,
      errors: [],
    };

    // Seed Admin User
    const adminData = {
      email: "admin@sacco.com",
      password: "Admin@123",
      full_name: "Admin User",
      phone_number: "0700000000",
      role: "admin",
    };

    try {
      const existingAdmin = await User.findByEmail(adminData.email);
      if (existingAdmin) {
        results.admin = {
          status: "already_exists",
          email: adminData.email,
          message: "Admin user already exists",
        };
      } else {
        const admin = await User.create(adminData);
        // Mark as active and registration paid
        await User.markRegistrationPaid(admin.id);
        await User.activate(admin.id);

        results.admin = {
          status: "created",
          email: adminData.email,
          password: adminData.password,
          message: "Admin user created successfully",
        };
      }
    } catch (error) {
      results.errors.push(`Admin creation failed: ${error.message}`);
    }

    // Seed Member User
    const memberData = {
      email: "member@sacco.com",
      password: "Member@123",
      full_name: "Test Member",
      phone_number: "0711111111",
      role: "member",
    };

    try {
      const existingMember = await User.findByEmail(memberData.email);
      if (existingMember) {
        results.member = {
          status: "already_exists",
          email: memberData.email,
          message: "Member user already exists",
        };
      } else {
        const member = await User.create(memberData);
        // Mark as active and registration paid
        await User.markRegistrationPaid(member.id);
        await User.activate(member.id);

        results.member = {
          status: "created",
          email: memberData.email,
          password: memberData.password,
          message: "Member user created successfully",
        };
      }
    } catch (error) {
      results.errors.push(`Member creation failed: ${error.message}`);
    }
  
    // Return HTML response with results
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Database Seeded - SACCO</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #111827;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #6B7280;
            margin-bottom: 30px;
        }
        .user-card {
            background: #F9FAFB;
            border-left: 4px solid #10B981;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 4px;
        }
        .user-card.existing {
            border-left-color: #F59E0B;
        }
        .user-card h2 {
            margin: 0 0 15px 0;
            color: #111827;
            font-size: 1.25rem;
        }
        .credential {
            display: flex;
            margin-bottom: 10px;
        }
        .credential-label {
            font-weight: 600;
            width: 120px;
            color: #374151;
        }
        .credential-value {
            color: #111827;
            font-family: 'Courier New', monospace;
            background: white;
            padding: 4px 8px;
            border-radius: 4px;
        }
        .status {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 0.875rem;
            font-weight: 600;
            margin-bottom: 10px;
        }
        .status.created {
            background: #D1FAE5;
            color: #059669;
        }
        .status.existing {
            background: #FEF3C7;
            color: #D97706;
        }
        .error {
            background: #FEE2E2;
            border-left: 4px solid #DC2626;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 4px;
            color: #DC2626;
        }
        .actions {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #E5E7EB;
        }
        .btn {
            display: inline-block;
            padding: 10px 20px;
            background: #2563EB;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin-right: 10px;
            font-weight: 500;
        }
        .btn:hover {
            background: #1D4ED8;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌱 Database Seeded Successfully</h1>
        <p class="subtitle">Test users have been created for the SACCO system</p>

        ${
          results.errors.length > 0
            ? `
        <div class="error">
            <strong>Errors:</strong>
            <ul>
                ${results.errors.map((err) => `<li>${err}</li>`).join("")}
            </ul>
        </div>
        `
            : ""
        }

        ${
          results.admin
            ? `
        <div class="user-card ${
          results.admin.status === "already_exists" ? "existing" : ""
        }">
            <h2>👤 Admin User</h2>
            <span class="status ${
              results.admin.status === "created" ? "created" : "existing"
            }">
                ${
                  results.admin.status === "created"
                    ? "✓ Created"
                    : "⚠ Already Exists"
                }
            </span>
            <p>${results.admin.message}</p>
            <div class="credential">
                <span class="credential-label">Email:</span>
                <span class="credential-value">${results.admin.email}</span>
            </div>
            ${
              results.admin.password
                ? `
            <div class="credential">
                <span class="credential-label">Password:</span>
                <span class="credential-value">${results.admin.password}</span>
            </div>
            `
                : ""
            }
            <div class="credential">
                <span class="credential-label">Role:</span>
                <span class="credential-value">admin</span>
            </div>
        </div>
        `
            : ""
        }

        ${
          results.member
            ? `
        <div class="user-card ${
          results.member.status === "already_exists" ? "existing" : ""
        }">
            <h2>👤 Member User</h2>
            <span class="status ${
              results.member.status === "created" ? "created" : "existing"
            }">
                ${
                  results.member.status === "created"
                    ? "✓ Created"
                    : "⚠ Already Exists"
                }
            </span>
            <p>${results.member.message}</p>
            <div class="credential">
                <span class="credential-label">Email:</span>
                <span class="credential-value">${results.member.email}</span>
            </div>
            ${
              results.member.password
                ? `
            <div class="credential">
                <span class="credential-label">Password:</span>
                <span class="credential-value">${results.member.password}</span>
            </div>
            `
                : ""
            }
            <div class="credential">
                <span class="credential-label">Role:</span>
                <span class="credential-value">member</span>
            </div>
        </div>
        `
            : ""
        }

        <div class="actions">
            <a href="/auth/login" class="btn">Go to Login</a>
            <a href="/" class="btn">Go to Home</a>
        </div>
    </div>
</body>
</html>
        `;

    res.send(html);
  } catch (error) {
    console.error("Seed database error:", error);
    res.status(500).send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Seeding Error - SACCO</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
        }
        .error-container {
            background: #FEE2E2;
            border-left: 4px solid #DC2626;
            padding: 20px;
            border-radius: 4px;
        }
        h1 { color: #DC2626; }
        a {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background: #2563EB;
            color: white;
            text-decoration: none;
            border-radius: 6px;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <h1>❌ Seeding Failed</h1>
        <p><strong>Error:</strong> ${error.message}</p>
        <a href="/">Go to Home</a>
    </div>
</body>
</html>
        `);
  }
};
