const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../../models/User");

exports.login = async (req, res) => {
  try {
    const { phone_number, password } = req.body;

    // Validation
    if (!phone_number || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide phone number and password",
      });
    }

    // Check user
    const user = await User.findByPhoneNumber(phone_number);
    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Check active status
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        error: "Account is deactivated",
      });
    }

    // Generate Token
    const payload = {
      id: user.id,
      role: user.role,
      registration_paid: user.registration_paid,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || "your_jwt_secret_key",
      { expiresIn: "30d" } // Long expiration for mobile
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        registration_paid: user.registration_paid,
      },
    });
  } catch (error) {
    console.error("API Login error:", error);
    res.status(500).json({
      success: false,
      error: "Server error during login",
    });
  }
};
