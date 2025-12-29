// middleware/adminAuth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// TODO: replace with environment variable / config
const JWT_SECRET = process.env.JWT_SECRET || "replace-this-with-real-secret";

const adminAuthMiddleware = async (req, res, next) => {
  try {
    // 1. Check if user is already authenticated via session (cookie)
    if (req.user) {
      if (req.user.role === "admin") {
        res.locals.isAdmin = true;
        res.locals.user = req.user;
        return next();
      } else {
        // Logged in but not admin
        return res.status(403).json({ message: "Admin access required" });
      }
    }

    // 2. If not authenticated via session, check Authorization header (API access)
    const authHeader = req.headers.authorization || req.headers.Authorization;

    // Check if token exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // If it's a browser request (no bearer token), check session or redirect to login
      // For now, we'll return 401 JSON, but for a web app we might want to redirect
      // if (req.accepts('html')) return res.redirect('/auth/login');
      return res
        .status(401)
        .json({ message: "Missing or invalid Authorization header" });
    }

    const token = authHeader.split(" ")[1];
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // payload should contain userId or id
    const userId = payload.userId || payload.id;
    if (!userId)
      return res.status(401).json({ message: "Invalid token payload" });

    // Fetch user from DB
    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ message: "User not found" });

    // Ensure admin role
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    // Attach user to request and set admin locals
    req.user = user;
    res.locals.isAdmin = true;
    res.locals.user = user;
    next();
  } catch (err) {
    console.error("adminAuthMiddleware error:", err);
    res.status(500).json({ message: "Authentication error" });
  }
};

module.exports = adminAuthMiddleware;
