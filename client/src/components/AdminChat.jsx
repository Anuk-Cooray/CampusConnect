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

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userId = (user?._id || user?.id)?.toString();

  useEffect(() => {
    if (!token || !userId) return;

    const newSocket = io(SOCKET, { auth: { token } });

    newSocket.on("connect", () => {
      newSocket.emit("user_online", userId);
    });

    newSocket.on("receive_message", (msg) => {
      const msgConvId = typeof msg.conversationId === 'object' 
        ? msg.conversationId._id 
        : msg.conversationId;
      
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
      console.error("fetchConversations error:", err);
    }
  };

  useEffect(() => { fetchConversations(); }, [token]);

  useEffect(() => {
    if (!selectedConv) return;
    
    axios.get(`${API}/api/chat/${selectedConv._id}/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setMessages(res.data.data || []));

    
    axios.put(`${API}/api/chat/${selectedConv._id}/read`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).catch(console.error);

    if (socket) socket.emit("join_conversation", selectedConv._id);
  }, [selectedConv, socket]);

  const sendMessage = () => {
    if (!messageText.trim() || !selectedConv || !socket) return;
    
   
    const tempMsg = {
      _id: Date.now().toString(),
      conversationId: selectedConv._id,
      senderId: { _id: userId },
      message: messageText.trim(),
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMsg]);
    
    socket.emit("send_message", {
      conversationId: selectedConv._id,
      senderId: userId,
      message: messageText.trim(),
    });
    setMessageText("");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/3 bg-white border-r overflow-y-auto">
        <div className="p-4 border-b font-bold text-lg bg-gray-50">
          Admin Conversations
        </div>
        {conversations.length === 0 && (
          <div className="p-4 text-gray-400 text-sm text-center">No conversations yet</div>
        )}
        {conversations.map(conv => (
          <div key={conv._id} onClick={() => setSelectedConv(conv)}
            className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${selectedConv?._id === conv._id ? 'bg-blue-50' : ''}`}>
            <div className="flex justify-between">
              <p className="font-semibold">{conv.studentId?.name || "Student"}</p>
              {conv.ownerUnread > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 rounded-full">{conv.ownerUnread}</span>
              )}
            </div>
            <p className="text-sm text-gray-500 truncate">{conv.lastMessage || "No messages yet"}</p>
            <p className="text-xs text-gray-400">{conv.accommodationId?.title || ""}</p>
          </div>
        ))}
      </div>

      {/* Chat Area */}
      <div className="w-2/3 flex flex-col bg-white">
        {selectedConv ? (
          <>
            <div className="p-4 border-b bg-gray-50 font-bold">
              {selectedConv.studentId?.name || "Student"}
              <span className="text-sm font-normal text-gray-500 ml-2">
                — {selectedConv.accommodationId?.title || ""}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => {
                const senderId = (msg.senderId?._id || msg.senderId)?.toString();
                const isMine = senderId === userId;
                return (
                  <div key={i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-2 rounded-lg max-w-xs text-sm ${isMine ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                      {msg.message}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-4 border-t flex gap-2">
              <input 
                value={messageText} 
                onChange={e => setMessageText(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                className="flex-1 border p-2 rounded outline-none" 
                placeholder="Type your reply..." 
              />
              <button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-2 rounded">
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a chat to reply
          </div>
        )}
      </div>
    </div>
  );
}