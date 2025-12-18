require("dotenv").config();
const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");
const ejsLayouts = require("express-ejs-layouts");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const csurf = require("csurf");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const whitelistMiddleware = require("./middleware/whitelistMiddleware");

// Import routes
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const memberRoutes = require("./routes/members");
const shareRoutes = require("./routes/shares");
const loanRoutes = require("./routes/loans");
const guarantorRoutes = require("./routes/guarantors");
const welfareRoutes = require("./routes/welfare");
const paymentRoutes = require("./routes/payments");
const messageRoutes = require("./routes/messages");
const reportRoutes = require("./routes/reports");

const app = express();

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        scriptSrcAttr: ["'unsafe-inline'"], // Allow inline event handlers like onclick
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://cdn.jsdelivr.net"],
        fontSrc: ["'self'", "https:", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'self'"],
      },
    },
  })
);

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "dist")));
app.use(ejsLayouts);
app.set("layout", "layouts/main");

// Cookie parser MUST come before CSRF
app.use(cookieParser());

// Static files
app.use(express.static("public"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "css")));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "sacco-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Flash middleware - AFTER SESSION
app.use(flash());

// CSRF Protection with excluded paths
// CSRF Protection with excluded paths
const excludedPaths = ["/payments/mpesa/callback", "/mpesa/callback"];

app.use((req, res, next) => {
  if (excludedPaths.includes(req.path) || req.path.startsWith("/api")) {
    return next();
  }

  // Apply CSRF protection for non-excluded paths
  csurf({
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
    ignoreMethods: ["GET", "HEAD", "OPTIONS"],
  })(req, res, next);
});

// Make user, CSRF token, and flash messages available to all views
app.use(async (req, res, next) => {
  // Only set CSRF token if the function exists (it won't exist on excluded paths)
  res.locals.csrfToken =
    typeof req.csrfToken === "function" ? req.csrfToken() : "";
  res.locals.user = null;
  res.locals.isAdmin = false;
  res.locals.currentPath = req.path;

  // Flash messages
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");

  // Check for JWT token
  const token = req.cookies.token;
  if (token) {
    try {
      const payload = jwt.verify(
        token,
        process.env.JWT_SECRET || "a strong secret"
      );
      const user = await User.findById(payload.id);
      if (user) {
        res.locals.user = user;
        res.locals.isAdmin = user.role === "admin";
      }
    } catch (err) {
      // Invalid token, ignore
    }
  }
  next();
});

const paymentController = require("./controllers/paymentController");

// M-Pesa callback route (before other routes, no CSRF needed)
app.post(
  "/mpesa/callback",
  whitelistMiddleware,
  paymentController.mpesaCallback
);

const apiRoutes = require("./routes/api");

// Routes
app.use("/api", apiRoutes);
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/members", memberRoutes);
app.use("/shares", shareRoutes);
app.use("/loans", loanRoutes);
app.use("/guarantors", guarantorRoutes);
app.use("/welfare", welfareRoutes);
app.use("/payments", paymentRoutes);
app.use("/messages", messageRoutes);
app.use("/reports", reportRoutes);

// Home route
app.get("/", (req, res) => {
  if (req.session.user) {
    if (req.session.user.role === "admin") {
      return res.redirect("/admin/dashboard");
    }
    return res.redirect("/members/dashboard");
  }
  res.redirect("/auth/login");
});

// 404 handler
app.use((req, res) => {
  res.status(404).render("errors/404", {
    title: "Page Not Found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Handle CSRF token errors
  if (err.code === "EBADCSRFTOKEN") {
    res.status(403).render("errors/403", {
      title: "Invalid CSRF Token",
      message: "Form submission failed. Please refresh and try again.",
    });
    return;
  }

  res.status(err.status || 500).render("errors/500", {
    title: "Server Error",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SACCO System running on port ${PORT}`);
});

module.exports = app;
