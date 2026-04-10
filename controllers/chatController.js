const { Message, Conversation } = require('../models/Message');
const Accommodation = require('../models/Accommodation');
const User = require('../models/User');

// POST /api/chat/conversation
exports.getOrCreateConversation = async (req, res) => {
  try {
    const { accommodationId } = req.body;
    const studentId = req.user.id;

    if (!accommodationId) {
      return res.status(400).json({ success: false, message: "accommodationId required" });
    }

    const accommodation = await Accommodation.findById(accommodationId);
    if (!accommodation) {
      return res.status(404).json({ success: false, message: "Accommodation not found" });
    }

    // Route message to the central Admin instead of the accommodation creator
    const adminUser = await User.findOne({ role: 'Admin' });
    if (!adminUser) {
      return res.status(500).json({ success: false, message: "System Error: No Admin found to receive messages" });
    }
    const ownerId = adminUser._id;

    let conversation = await Conversation.findOneAndUpdate(
      { studentId, ownerId, accommodationId },
      { $setOnInsert: { studentId, ownerId, accommodationId } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ success: true, data: conversation });
  } catch (err) {
    console.error("getOrCreateConversation error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/chat/conversations
exports.getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    const query = userRole?.toLowerCase() === 'admin' ? { ownerId: userId } : { studentId: userId };

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

// PUT /api/chat/:conversationId/read
exports.markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    await Message.updateMany(
      { conversationId, senderId: { $ne: req.user.id }, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ success: true, message: "Messages marked as read" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};