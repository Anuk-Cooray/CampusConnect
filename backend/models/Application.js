const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    studentId: {
      type: String,
      required: true,
    },
    cvUrl: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Shortlisted', 'Rejected', 'Approved'],
      default: 'Pending',
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Application', ApplicationSchema);

