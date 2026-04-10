const { Message, Conversation } = require('../models/Message');

module.exports = (io) => {
  io.on('connection', (socket) => {
    
    socket.on('user_online', (userId) => {
      if (userId) socket.join(`user_${userId}`);
    });

    socket.on('join_conversation', (conversationId) => {
      if (conversationId) socket.join(conversationId);
    });

    socket.on('send_message', async (data) => {
      try {
        const { conversationId, senderId, message } = data;
        const msg = await Message.create({ conversationId, senderId, message });
        const populated = await Message.findById(msg._id).populate('senderId', 'name email');

        const conv = await Conversation.findById(conversationId);
        if (conv) {
          const isStudent = conv.studentId.toString() === senderId.toString();
          
          await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: message,
            lastMessageAt: new Date(),
            ...(isStudent ? { ownerUnread: (conv.ownerUnread || 0) + 1 } : { studentUnread: (conv.studentUnread || 0) + 1 })
          });

          
          io.to(conversationId).emit('receive_message', populated);

        
          const otherUserId = isStudent ? conv.ownerId.toString() : conv.studentId.toString();
          io.to(`user_${otherUserId}`).emit('new_message_notification', {
            conversationId, message, senderId
          });
        }
      } catch (err) {
        console.error('Socket error:', err.message);
      }
    });
  });
};