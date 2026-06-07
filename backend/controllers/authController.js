// controllers/authController.js
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    // Create user (password auto-hashed in model)
    const userRole = role || 'patient';
    const user = await User.create({ name, email, password, role: userRole, phone });

    // Auto-create a profile so the user can use the system immediately
    if (userRole === 'patient') {
      await Patient.create({ user: user._id });
    } else if (userRole === 'doctor') {
      // Create a minimal doctor profile — admin can fill details later
      await Doctor.create({
        user: user._id,
        specialization: 'General',
        qualification: 'MBBS',
        experience: 0,
        fee: 0,
      });
    }

    res.status(201).json({
      message: 'Registration successful.',
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    res.json({
      message: 'Login successful.',
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/auth/me  (get logged in user profile)
const getMe = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { register, login, getMe };
