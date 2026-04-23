const express = require('express');
const KuppiSession = require('../models/KuppiSession');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Helper: Validate Teams/Google Meet/Zoom link
const isValidMeetingLink = (url) => {
  if (!url) return false; // Meeting link is required for online sessions
  
  const trimmedUrl = url.trim().toLowerCase();
  
  // Check for supported platforms (more lenient check)
  const hasTeams = trimmedUrl.includes('teams.microsoft.com');
  const hasGoogleMeet = trimmedUrl.includes('meet.google.com');
  const hasZoom = trimmedUrl.includes('zoom.us') || trimmedUrl.includes('u_us/j/');
  
  // Return true if any platform is detected
  return hasTeams || hasGoogleMeet || hasZoom;
};

// Helper: Check if Teams link
const isTeamsLink = (url) => {
  return url && (url.includes('teams.microsoft.com') || url.includes('teams-osi'));
};

// POST /api/kuppi-sessions — Create session
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { topic, description, date, time, sessionType, location, meetingLink, maxParticipants } = req.body;

    if (!topic || !date || !time) {
      return res.status(400).json({ message: 'Topic, date, and time are required' });
    }

    if (sessionType === 'online' && !meetingLink) {
      return res.status(400).json({ message: 'Meeting link is required for online sessions' });
    }

    if (sessionType === 'inperson' && !location) {
      return res.status(400).json({ message: 'Location is required for in-person sessions' });
    }

    if (sessionType === 'online' && !isValidMeetingLink(meetingLink)) {
      return res.status(400).json({ message: 'Invalid meeting link. Please use a valid Teams, Google Meet, or Zoom link.' });
    }

    const session = await KuppiSession.create({
      topic,
      description: description || '',
      date,
      time,
      sessionType,
      location: sessionType === 'inperson' ? location : '',
      meetingLink: sessionType === 'online' ? meetingLink : '',
      maxParticipants: maxParticipants || 20,
      creator: req.user.id,
      participants: [{ user: req.user.id }], // Creator is auto-participant
    });

    const populated = await session.populate('creator', 'name studentId');
    return res.status(201).json(populated);
  } catch (err) {
    console.error('Create kuppi session error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/kuppi-sessions — List all sessions
router.get('/', authMiddleware, async (req, res) => {
  try {
    const sessions = await KuppiSession.find()
      .populate('creator', 'name studentId email')
      .populate('participants.user', 'name studentId')
      .sort({ date: 1, time: 1 });
    return res.json(sessions);
  } catch (err) {
    console.error('Get kuppi sessions error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/kuppi-sessions/:id — Update own session
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const session = await KuppiSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own sessions' });
    }

    const { topic, description, date, time, sessionType, location, meetingLink, maxParticipants } = req.body;

    if (sessionType === 'online' && meetingLink && !isValidMeetingLink(meetingLink)) {
      return res.status(400).json({ message: 'Invalid meeting link. Use Teams, Google Meet, Zoom, or similar platforms' });
    }

    if (topic) session.topic = topic;
    if (description !== undefined) session.description = description;
    if (date) session.date = date;
    if (time) session.time = time;
    if (sessionType) session.sessionType = sessionType;
    if (sessionType === 'inperson' && location) session.location = location;
    if (sessionType === 'online' && meetingLink) session.meetingLink = meetingLink;
    if (maxParticipants) session.maxParticipants = maxParticipants;

    await session.save();
    const updated = await session.populate('creator', 'name studentId').populate('participants.user', 'name studentId');
    return res.json(updated);
  } catch (err) {
    console.error('Update kuppi session error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/kuppi-sessions/:id — Delete own session
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const session = await KuppiSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own sessions' });
    }

    await session.deleteOne();
    return res.json({ message: 'Session deleted' });
  } catch (err) {
    console.error('Delete kuppi session error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/kuppi-sessions/:id/join — Join a session
router.post('/:id/join', authMiddleware, async (req, res) => {
  try {
    const session = await KuppiSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    // Check if already joined
    const alreadyJoined = session.participants.some(p => p.user.toString() === req.user.id);
    if (alreadyJoined) {
      return res.status(400).json({ message: 'You have already joined this session' });
    }

    // Check if session is full
    if (session.participants.length >= session.maxParticipants) {
      return res.status(400).json({ message: 'Session is already full' });
    }

    session.participants.push({ user: req.user.id });
    await session.save();

    const updated = await session.populate('creator', 'name studentId').populate('participants.user', 'name studentId');
    return res.json(updated);
  } catch (err) {
    console.error('Join session error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/kuppi-sessions/:id/leave — Leave a session
router.post('/:id/leave', authMiddleware, async (req, res) => {
  try {
    const session = await KuppiSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    // Cannot leave if you're the creator
    if (session.creator.toString() === req.user.id) {
      return res.status(400).json({ message: 'Creator cannot leave their own session. Delete it instead' });
    }

    session.participants = session.participants.filter(p => p.user.toString() !== req.user.id);
    await session.save();

    const updated = await session.populate('creator', 'name studentId').populate('participants.user', 'name studentId');
    return res.json(updated);
  } catch (err) {
    console.error('Leave session error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
