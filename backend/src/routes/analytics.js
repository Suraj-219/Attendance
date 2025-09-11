const express = require('express');
const Session = require('../models/Session');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get attendance analytics
router.get('/attendance', auth, async (req, res) => {
  try {
    const { courseId, range = '4w' } = req.query;
    const days = range === '4w' ? 28 : 14;
    const today = new Date();

    // Get sessions within the date range
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - days);

    let query = {
      startedAt: { $gte: startDate }
    };

    if (courseId) {
      query.courseId = courseId;
    }

    const sessions = await Session.find(query);

    // Calculate daily attendance rates
    const daily = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().slice(0, 10);

      // Find sessions on this date
      const daySessions = sessions.filter(session => {
        const sessionDate = session.startedAt.toISOString().slice(0, 10);
        return sessionDate === dateStr;
      });

      if (daySessions.length > 0) {
        const totalAttendees = daySessions.reduce((sum, session) => sum + session.attendees.length, 0);
        const avgRate = Math.round((totalAttendees / daySessions.length) * 10); // Assuming 10 students per session
        daily.push({ date: dateStr, rate: Math.min(avgRate, 100) });
      } else {
        daily.push({ date: dateStr, rate: 0 });
      }
    }

    const avgRate = Math.round(daily.reduce((sum, day) => sum + day.rate, 0) / daily.length);

    res.json({
      daily,
      rate: avgRate
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get overall statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const totalSessions = await Session.countDocuments();
    const activeSessions = await Session.countDocuments({ active: true });
    const totalAttendance = await Session.aggregate([
      { $unwind: '$attendees' },
      { $count: 'total' }
    ]);

    const presentCount = await Session.aggregate([
      { $unwind: '$attendees' },
      { $match: { 'attendees.status': 'present' } },
      { $count: 'present' }
    ]);

    const lateCount = await Session.aggregate([
      { $unwind: '$attendees' },
      { $match: { 'attendees.status': 'late' } },
      { $count: 'late' }
    ]);

    res.json({
      totalSessions,
      activeSessions,
      totalAttendance: totalAttendance[0]?.total || 0,
      presentCount: presentCount[0]?.present || 0,
      lateCount: lateCount[0]?.late || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
