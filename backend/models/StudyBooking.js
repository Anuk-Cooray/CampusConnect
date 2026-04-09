const mongoose = require('mongoose');

const studyBookingSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
    },
    groupName: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
    },
    students: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        studentId: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('StudyBooking', studyBookingSchema);
