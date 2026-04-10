import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const SOCKET = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export default function AdminChat() {
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [socket, setSocket] = useState(null);
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!token || !userId) return;

    const newSocket = io(SOCKET, { auth: { token } });

    newSocket.on("connect", () => {
      newSocket.emit("user_online", userId);
    });

    newSocket.on("receive_message", (msg) => {
      const msgConvId = typeof msg.conversationId === 'object' ? msg.conversationId._id : msg.conversationId;
      setSelectedConv(prev => {
        if (prev && prev._id === msgConvId) {
          setMessages(m => [...m, msg]);
        }
        return prev;
      });
      fetchConversations();
    });

    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, [userId, token]);

  const fetchConversations = async () => {
    try {
      const { data } = await axios.get(`${API}/api/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchConversations(); }, [token]);

  useEffect(() => {
    if (selectedConv) {
      axios.get(`${API}/api/chat/${selectedConv._id}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setMessages(res.data.data));

      if (socket) socket.emit("join_conversation", selectedConv._id);
    }
  }, [selectedConv, socket]);

  const sendMessage = () => {
    if (!messageText.trim() || !selectedConv) return;
    socket.emit("send_message", {
      conversationId: selectedConv._id,
      senderId: userId,
      message: messageText
    });
    setMessageText("");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/3 bg-white border-r overflow-y-auto">
        <div className="p-4 border-b font-bold text-lg bg-gray-50">Admin Conversations</div>
        {conversations.map(conv => (
          <div key={conv._id} onClick={() => setSelectedConv(conv)}
            className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${selectedConv?._id === conv._id ? 'bg-blue-50' : ''}`}>
            <div className="flex justify-between">
              <p className="font-semibold">{conv.studentId?.name}</p>
              {conv.ownerUnread > 0 && <span className="bg-red-500 text-white text-xs px-2 rounded-full">{conv.ownerUnread}</span>}
            </div>
            <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
          </div>
        ))}
      </div>

      {/* Chat Area */}
      <div className="w-2/3 flex flex-col bg-white">
        {selectedConv ? (
          <>
            <div className="p-4 border-b bg-gray-50 font-bold">{selectedConv.studentId?.name}</div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.senderId?._id === userId || msg.senderId === userId ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-2 rounded-lg max-w-xs ${msg.senderId?._id === userId || msg.senderId === userId ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                    {msg.message}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t flex gap-2">
              <input value={messageText} onChange={e => setMessageText(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendMessage()}
                className="flex-1 border p-2 rounded outline-none" placeholder="Type your reply..." />
              <button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-2 rounded">Send</button>
            </div>
          </>
        ) : <div className="flex-1 flex items-center justify-center text-gray-400">Select a chat</div>}
      </div>
    </div>
  );
}