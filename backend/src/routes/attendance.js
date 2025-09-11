const express = require('express');
const { body, validationResult } = require('express-validator');
const Session = require('../models/Session');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Scan with token
router.post('/scan', [
  auth,
  body('token').trim().isLength({ min: 1 }).withMessage('Token required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token } = req.body;
    const studentId = req.user._id;

    // Find session with this token
    const session = await Session.findOne({
      'lastToken.value': token,
      'lastToken.exp': { $gt: Math.floor(Date.now() / 1000) },
      active: true
    });

    if (!session) {
      return res.status(400).json({ status: 'failed', reason: 'Invalid or expired token' });
    }

    const now = Date.now();
    const sessionStart = session.startedAt.getTime();

    // Check for duplicate scan (within 1 minute)
    const existingScan = session.attendees.find(attendee =>
      attendee.studentId.toString() === studentId.toString() &&
      now - attendee.recordedAt.getTime() < 60_000
    );

    if (existingScan) {
      return res.json({
        status: existingScan.status,
        recordedAt: existingScan.recordedAt.getTime(),
        duplicate: true
      });
    }

    // Determine status: late if more than 10 minutes after start
    const status = (now - sessionStart) > 10 * 60 * 1000 ? 'late' : 'present';
    const recordedAt = new Date();

    // Add to attendees
    session.attendees.push({
      studentId,
      status,
      recordedAt
    });

    // Add to scans
    session.scans.push({
      studentId,
      token,
      recordedAt,
      status
    });

    await session.save();

    res.json({
      status,
      recordedAt: recordedAt.getTime()
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get attendance records for a session
router.get('/session/:sessionId', auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId)
      .populate('attendees.studentId', 'name email')
      .populate('scans.studentId', 'name email');

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json({
      sessionId: session._id,
      attendees: session.attendees,
      scans: session.scans
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student's attendance history
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const sessions = await Session.find({
      'attendees.studentId': req.params.studentId
    }).populate('attendees.studentId', 'name email');

    const attendanceRecords = sessions.map(session => {
      const attendee = session.attendees.find(a => a.studentId._id.toString() === req.params.studentId);
      return {
        sessionId: session._id,
        courseId: session.courseId,
        status: attendee.status,
        recordedAt: attendee.recordedAt,
        startedAt: session.startedAt
      };
    });

    res.json(attendanceRecords);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
