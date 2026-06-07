// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token and attach user to request
const protect = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized. No token.' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user (without password) to request
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalid or expired.' });
  }
};

// Role-based access control middleware
// Usage: authorize('admin') or authorize('admin', 'doctor')
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
