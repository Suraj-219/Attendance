const express = require('express');
const { body, validationResult } = require('express-validator');
const Session = require('../models/Session');
const { auth, requireRole } = require('../middleware/auth');
const crypto = require('crypto');

const router = express.Router();

// Start session
router.post('/start', [
  auth,
  requireRole(['Instructor', 'Admin']),
  body('courseId').trim().isLength({ min: 1 }).withMessage('Course ID required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { courseId } = req.body;

    const session = new Session({
      courseId,
      active: true,
      startedAt: new Date()
    });

    await session.save();

    res.status(201).json({
      id: session._id,
      courseId: session.courseId,
      startedAt: session.startedAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// End session
router.post('/:id/end', [
  auth,
  requireRole(['Instructor', 'Admin'])
], async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (!session.active) {
      return res.status(400).json({ message: 'Session already ended' });
    }

    session.active = false;
    session.endedAt = new Date();
    await session.save();

    res.json({
      id: session._id,
      endedAt: session.endedAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get QR token
router.get('/:id/qr', [
  auth,
  requireRole(['Instructor', 'Admin'])
], async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (!session.active) {
      return res.status(400).json({ message: 'Session not active' });
    }

    // Generate token
    const tokenValue = crypto.randomBytes(16).toString('hex');
    const expSeconds = 10;
    const exp = Math.floor(Date.now() / 1000) + expSeconds;

    session.lastToken = { value: tokenValue, exp };
    await session.save();

    res.json({
      token: tokenValue,
      expSeconds
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get session summary
router.get('/:id/summary', auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate('attendees.studentId', 'name email');
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const present = session.attendees.filter(a => a.status === 'present').length;
    const late = session.attendees.filter(a => a.status === 'late').length;
    const absent = 0; // Could calculate based on enrolled students

    const list = session.attendees.map(attendee => ({
      studentId: attendee.studentId._id,
      status: attendee.status,
      recordedAt: attendee.recordedAt
    }));

    res.json({
      present,
      late,
      absent,
      list,
      active: session.active,
      startedAt: session.startedAt,
      lastUpdated: new Date()
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all sessions
router.get('/', auth, async (req, res) => {
  try {
    const sessions = await Session.find()
      .populate('attendees.studentId', 'name email')
      .sort({ startedAt: -1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
