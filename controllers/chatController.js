const { Message, Conversation } = require('../models/Message');
const Accommodation = require('../models/Accommodation');

// GET /api/chat/conversations
exports.getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role; // User ගේ role එක 'admin' ද කියලා බලනවා

    let query = {};

    if (userRole === 'admin') {
      // ලොග් වෙලා ඉන්න කෙනා Admin නම්, එයා Owner විදිහට ඉන්න chats විතරක් ගන්න
      query = { ownerId: userId };
    } else {
      // Student කෙනෙක් නම්, එයා Student විදිහට ඉන්න chats විතරක් ගන්න
      query = { studentId: userId };
    }

    const convs = await Conversation.find(query)
      .populate('accommodationId', 'title photos')
      .populate('studentId', 'name email')
      .populate('ownerId', 'name email')
      .sort({ lastMessageAt: -1 });

    res.json({ success: true, data: convs });
  } catch (err) {
    console.error('getUserConversations error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/chat/:conversationId/messages
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversationId })
      .populate('senderId', 'name email')
      .sort({ createdAt: 1 });
    res.json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};