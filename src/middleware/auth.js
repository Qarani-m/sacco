const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.redirect("/auth/login");
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByIdWithRole(payload.id);
    if (!user) {
      return res.redirect("/auth/login");
    }

    // Get user permissions
    const permissions = await User.getPermissions(user.id);

    req.user = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role, // Old role field (for backward compatibility)
      role_id: user.role_id, // New role ID
      role_name: user.role_name, // Role name from join
      registration_paid: user.registration_paid,
      permissions: permissions.map(p => p.name), // Array of permission names
    };

    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.redirect("/auth/login");
  }
};

module.exports = authMiddleware;
