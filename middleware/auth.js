const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.redirect("/auth/login");
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(payload.id);
    if (!user) {
      return res.redirect("/auth/login");
    }

    req.user = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      registration_paid: user.registration_paid,
    };

    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.redirect("/auth/login");
  }
};

module.exports = authMiddleware;
