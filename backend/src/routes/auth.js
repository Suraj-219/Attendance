const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Register user
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['Student', 'Instructor', 'Admin']).withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, faceDescriptor } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create user
    const user = new User({
      name,
      email,
      password,
      role,
      faceDescriptor
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Face recognition login
router.post('/face-login', [
  body('faceDescriptor').isArray().withMessage('Face descriptor required')
], async (req, res) => {
  try {
    const { faceDescriptor } = req.body;

    // Find all students with face descriptors
    const students = await User.find({
      role: 'Student',
      faceDescriptor: { $exists: true }
    });

    let bestMatch = null;
    let bestDistance = 0.6; // Threshold

    for (const student of students) {
      if (student.faceDescriptor) {
        // Calculate Euclidean distance
        let distance = 0;
        for (let i = 0; i < faceDescriptor.length; i++) {
          distance += Math.pow(faceDescriptor[i] - student.faceDescriptor[i], 2);
        }
        distance = Math.sqrt(distance);

        if (distance < bestDistance) {
          bestDistance = distance;
          bestMatch = student;
        }
      }
    }

    if (bestMatch) {
      const token = jwt.sign(
        { userId: bestMatch._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        user: {
          id: bestMatch._id,
          name: bestMatch.name,
          email: bestMatch.email,
          role: bestMatch.role
        },
        token
      });
    } else {
      res.status(401).json({ message: 'Face not recognized' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

module.exports = router;
