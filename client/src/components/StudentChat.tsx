import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const SOCKET = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

interface StudentChatProps {
  accommodationId: string;
  onClose?: () => void;
}

export default function StudentChat({ accommodationId, onClose }: StudentChatProps) {
  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  // Initialize Socket.io
  useEffect(() => {
    const newSocket = io(SOCKET, {
      auth: { token },
    });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      if (userId) {
        newSocket.emit("user_online", userId);
      }
    });

    newSocket.on("connect_error", (socketError) => {
      console.error("Socket connect error:", socketError);
      setError("Chat socket connection failed. Please refresh the page.");
    });

    newSocket.on("receive_message", (msg) => {
      if (conversation && msg.conversationId === conversation._id) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, [userId]);

  // Get or create conversation
  useEffect(() => {
    const initConversation = async () => {
      if (!accommodationId) {
        setError("Missing accommodation ID for chat.");
        setLoading(false);
        return;
      }

      if (!token) {
        setError("Missing authentication token. Please log in again.");
        setLoading(false);
        return;
      }

      if (!userId) {
        setError("Unable to verify current user. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data } = await axios.post(
          `${API}/api/chat/conversation`,
          { accommodationId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setConversation(data.data);

        // Fetch messages
        const msgData = await axios.get(`${API}/api/chat/${data.data._id}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(msgData.data.data);

        // Mark as read
        await axios.put(
          `${API}/api/chat/${data.data._id}/read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err: any) {
        console.error("Failed to load conversation:", err);
        setError(err?.response?.data?.message || err.message || "Failed to load conversation.");
      } finally {
        setLoading(false);
      }
    };

    if (accommodationId) {
      initConversation();
    }
  }, [accommodationId, token]);

  useEffect(() => {
    if (socket && conversation?._id) {
      socket.emit("join_conversation", conversation._id);
    }
  }, [socket, conversation]);

  // Send message
  const sendMessage = () => {
    if (!messageText.trim() || !conversation || !socket) return;

    const messageData = {
      conversationId: conversation._id,
      senderId: userId,
      message: messageText,
    };

    socket.emit("send_message", messageData);
    setMessageText("");
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg p-6 text-center">
        <p className="text-red-500 mb-3">{error}</p>
        {onClose && (
          <button
            onClick={onClose}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Close
          </button>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-white rounded-lg">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="bg-white rounded-lg p-6 text-center">
        <p className="text-red-500">Could not load conversation</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-96">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg">Chat with Owner</h3>
          <p className="text-sm text-blue-100">
            {conversation.ownerId?.name || "Accommodation Owner"}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-2xl hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center transition"
          >
            ✕
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={msg._id || idx}
              className={`flex ${msg.senderId?._id === userId ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.senderId?._id === userId
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
                }`}
              >
                <p className="text-sm">{msg.message}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.senderId?._id === userId ? "text-blue-100" : "text-gray-600"
                  }`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            disabled={!messageText.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
