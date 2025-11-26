// middleware/auth.js
// Verifies JWT, attaches user to req.user
// Replace `getUserById` and JWT secret with your project's implementations.

const jwt = require('jsonwebtoken');

// TODO: replace with environment variable / config
const JWT_SECRET = process.env.JWT_SECRET || 'replace-this-with-real-secret';

// Mock DB helper - replace with real DB call
const { getUserById } = require('../models/User'); // create this in your models

// If you don't have userModel yet, here's a tiny placeholder:
// const getUserById = async (id) => ({ id, email: 'a@b.com', role: 'member', hasPaidRegistration: true });

const adminAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // payload should contain userId (adjust to your token shape)
    const userId = payload.userId || payload.id;
    if (!userId) return res.status(401).json({ message: 'Invalid token payload' });

    // Fetch user from DB
    const user = await getUserById(userId);
    if (!user) return res.status(401).json({ message: 'User not found' });

    // Attach user to request
    req.user = user;
    next();
  } catch (err) {
    console.error('authMiddleware error:', err);
    res.status(500).json({ message: 'Authentication error' });
  }
};

module.exports = adminAuthMiddleware;
