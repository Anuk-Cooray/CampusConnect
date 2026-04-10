import { useEffect, useRef, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  onFiltersApplied: (filters: any) => void;
}

export default function AIChatBot({ onFiltersApplied }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem("token");

  // Auto-open after 2 seconds on first visit
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasOpened) {
        setOpen(true);
        setHasOpened(true);
        sendInitialGreeting();
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendInitialGreeting = async () => {
    setLoading(true);
    try {
      const initMessages = [{ role: "user", content: "Hello, I need help finding accommodation." }];
      const { data } = await axios.post(
        `${API}/api/ai/accommodation-chat`,
        { messages: initMessages },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages([
        { role: "user", content: "Hello, I need help finding accommodation." },
        { role: "assistant", content: data.message },
      ]);
    } catch (err) {
      setMessages([{
        role: "assistant",
        content: "👋 Hi! I'm your accommodation assistant. Tell me what you're looking for - budget, location preferences, facilities - and I'll find the best options for you!",
      }]);
    }
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${API}/api/ai/accommodation-chat`,
        {
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const aiMsg: Message = { role: "assistant", content: data.message };
      setMessages(prev => [...prev, aiMsg]);

      // Apply filters if AI returned them
      if (data.filters) {
        onFiltersApplied(data.filters);
        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: "assistant",
            content: "✅ I've applied filters to the listings based on your preferences! Scroll up to see the results.",
          }]);
        }, 500);
      }
    } catch (err: any) {
      let errorMessage = "Sorry, I encountered an error. Please try again! 😅";
      
      // Better error messages
      if (err.response?.status === 503) {
        errorMessage = "🔧 The AI assistant is temporarily unavailable. It seems the free tier quota has been exceeded. Please check back later!";
      } else if (err.response?.data?.error === "QUOTA_EXCEEDED") {
        errorMessage = "🔧 The AI assistant is temporarily unavailable due to quota limits. Please check back later!";
      } else if (err.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      }
      
      setMessages(prev => [...prev, {
        role: "assistant",
        content: errorMessage,
      }]);
    }
    setLoading(false);
  };

  const clearChat = () => {
    setMessages([]);
    sendInitialGreeting();
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => { setOpen(true); setShowPulse(false); if (!hasOpened) { setHasOpened(true); sendInitialGreeting(); } }}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
        >
          <span className="text-2xl">🤖</span>
          {showPulse && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
          )}
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 h-[520px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-xl">🤖</div>
              <div>
                <p className="font-bold text-white text-sm">Accommodation AI</p>
                <p className="text-blue-200 text-xs">Find your perfect place</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={clearChat} className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-xs transition-colors" title="Restart">
                🔄
              </button>
              <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-lg transition-colors">
                ×
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {messages.length === 0 && !loading && (
              <div className="text-center py-8">
                <p className="text-3xl mb-2">🏠</p>
                <p className="text-sm text-slate-400 font-semibold">Starting up...</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-sm flex-shrink-0 mr-2 mt-0.5">
                    🤖
                  </div>
                )}
                <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-sm"
                    : "bg-white text-slate-700 rounded-bl-sm shadow-sm border border-slate-100"
                }`}>
                  {msg.content.split("\n").map((line, j) => (
                    <p key={j} className={j > 0 ? "mt-1" : ""}>{line}</p>
                  ))}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-sm flex-shrink-0 ml-2 mt-0.5">
                    👤
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-sm flex-shrink-0 mr-2">🤖</div>
                <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
                  <div className="flex gap-1 items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick suggestions */}
          {messages.length <= 2 && !loading && (
            <div className="px-3 py-2 flex gap-2 overflow-x-auto flex-shrink-0 bg-white border-t border-slate-100">
              {[
                "Under Rs. 20,000",
                "Within 2km",
                "Need WiFi & Kitchen",
                "Female only",
              ].map((s) => (
                <button
                  key={s}
                  onClick={() => { setInput(s); }}
                  className="flex-shrink-0 text-xs bg-blue-50 text-blue-700 font-semibold px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors border border-blue-100"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-slate-100 bg-white flex-shrink-0">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type your preference..."
                className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-slate-50"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-50 hover:-translate-y-0.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}