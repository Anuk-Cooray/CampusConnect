const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const chatController = require('../controllers/chatController');

// Require authentication for all chat routes
router.use(authMiddleware.protect);


// POST /api/chat/conversation - Get or create conversation
router.post('/conversation', chatController.getOrCreateConversation);

// GET /api/chat/conversations - Get all conversations for user
router.get('/conversations', chatController.getUserConversations);

// GET /api/chat/:conversationId/messages - Get messages for conversation
router.get('/:conversationId/messages', chatController.getMessages);

// PUT /api/chat/:conversationId/read - Mark conversation as read
router.put('/:conversationId/read', chatController.markAsRead);

module.exports = router;
