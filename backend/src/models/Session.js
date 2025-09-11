const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  courseId: {
    type: String,
    required: true,
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: {
    type: Date
  },
  lastToken: {
    value: String,
    exp: Number
  },
  attendees: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['present', 'late'],
      required: true
    },
    recordedAt: {
      type: Date,
      default: Date.now
    }
  }],
  scans: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    token: String,
    recordedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['present', 'late'],
      required: true
    }
  }]
});

module.exports = mongoose.model('Session', sessionSchema);
