const jwt = require("jsonwebtoken");

const authApi = (req, res, next) => {
  // Get token from header
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Access denied. No token provided.",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret_key"
    );
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: "Invalid token.",
    });
  }
};

module.exports = authApi;
