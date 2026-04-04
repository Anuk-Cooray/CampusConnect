const express = require('express');
const router = express.Router();

// Basic stub routes to avoid 404s until chat backend is implemented
router.get('/conversations', async (req, res) => {
  res.json({ success: true, data: [] });
});

router.get('/:conversationId/messages', async (req, res) => {
  res.json({ success: true, data: [] });
});

router.put('/:conversationId/read', async (req, res) => {
  res.json({ success: true });
});

module.exports = router;
