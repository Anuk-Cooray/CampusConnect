const express = require('express');
const StudyBooking = require('../models/StudyBooking');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Helper: parse "HH:MM" to minutes since midnight
const timeToMinutes = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

// POST /api/study-bookings — Create a booking
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { roomNumber, date, startTime, endTime, groupName, students } = req.body;

    if (!roomNumber || !date || !startTime || !endTime || !groupName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!students || students.length === 0) {
      return res.status(400).json({ message: 'At least one student must be added' });
    }

    // Validate students data
    const validStudents = students.filter(s => s.name && s.studentId);
    if (validStudents.length === 0) {
      return res.status(400).json({ message: 'Each student must have a name and student ID' });
    }

    // Validate future date/time
    const bookingStart = new Date(`${date}T${startTime}`);
    if (bookingStart <= new Date()) {
      return res.status(400).json({ message: 'Booking must be for a future date and time' });
    }

    // Validate max 2-hour duration
    const startMin = timeToMinutes(startTime);
    const endMin = timeToMinutes(endTime);
    if (endMin <= startMin) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }
    if (endMin - startMin > 120) {
      return res.status(400).json({ message: 'Maximum booking duration is 2 hours' });
    }

    // Check for double booking (same room, overlapping time on same date)
    const overlap = await StudyBooking.findOne({
      roomNumber,
      date,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
      ],
    });
    if (overlap) {
      return res.status(409).json({ message: 'This room is already booked for the selected time slot' });
    }

    const booking = await StudyBooking.create({
      roomNumber,
      date,
      startTime,
      endTime,
      groupName,
      students: validStudents,
      user: req.user.id,
    });

    return res.status(201).json(booking);
  } catch (err) {
    console.error('Create booking error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/study-bookings — List all bookings
router.get('/', authMiddleware, async (req, res) => {
  try {
    const bookings = await StudyBooking.find()
      .populate('user', 'name studentId')
      .sort({ date: 1, startTime: 1 });
    return res.json(bookings);
  } catch (err) {
    console.error('Get bookings error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/study-bookings/:id — Update own booking
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await StudyBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own bookings' });
    }

    const { roomNumber, date, startTime, endTime, groupName, students } = req.body;

    if (!students || students.length === 0) {
      return res.status(400).json({ message: 'At least one student must be added' });
    }

    // Validate students data
    const validStudents = students.filter(s => s.name && s.studentId);
    if (validStudents.length === 0) {
      return res.status(400).json({ message: 'Each student must have a name and student ID' });
    }

    // Validate future date/time
    const bookingStart = new Date(`${date}T${startTime}`);
    if (bookingStart <= new Date()) {
      return res.status(400).json({ message: 'Booking must be for a future date and time' });
    }

    // Validate max 2-hour duration
    const startMin = timeToMinutes(startTime);
    const endMin = timeToMinutes(endTime);
    if (endMin <= startMin) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }
    if (endMin - startMin > 120) {
      return res.status(400).json({ message: 'Maximum booking duration is 2 hours' });
    }

    // Check for double booking (exclude current booking)
    const overlap = await StudyBooking.findOne({
      _id: { $ne: req.params.id },
      roomNumber,
      date,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
      ],
    });
    if (overlap) {
      return res.status(409).json({ message: 'This room is already booked for the selected time slot' });
    }

    booking.roomNumber = roomNumber;
    booking.date = date;
    booking.startTime = startTime;
    booking.endTime = endTime;
    booking.groupName = groupName;
    booking.students = validStudents;
    await booking.save();

    return res.json(booking);
  } catch (err) {
    console.error('Update booking error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/study-bookings/:id — Delete own booking
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await StudyBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own bookings' });
    }

    await booking.deleteOne();
    return res.json({ message: 'Booking deleted' });
  } catch (err) {
    console.error('Delete booking error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
