import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const API_URL = (import.meta.env.VITE_API_URL || "http://127.0.0.1:5001/api").replace(/\/$/, "");

// 1. Define your suggestions
const SUGGESTIONS = [
  { label: "How to login?", value: "login_info" },
  { label: "What is a Mentor?", value: "mentor_info" },
  { label: "Safety Tips", value: "safety_info" },
];

// 2. Define your PREMADE replies
const PREMADE_REPLIES = {
  login_info: "To login, click the 'Sign In' button at the top right of the homepage. You can use your registered email and password, or your Google account.",
  mentor_info: "A Mentor is an experienced professional who provides guidance and support. You can find them in the 'Find Mentors' tab to book a session.",
  safety_info: "Stay safe by: 1. Never sharing your password. 2. Reporting suspicious profiles. 3. Keeping all payments within the platform's official system.",
};

const ChatbotWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const toggleChat = () => setOpen(!open);

  const handleSend = async (manualText) => {
    // Determine if we are sending the input state or a premade value
    const messageValue = manualText || input;
    if (!messageValue.trim()) return;

    // Display the user's message (find the label if it's a suggestion)
    const displayLabel = SUGGESTIONS.find(s => s.value === messageValue)?.label || messageValue;
    
    setMessages((prev) => [...prev, { sender: "user", text: displayLabel }]);
    if (!manualText) setInput("");
    setLoading(true);

    // CHECK FOR PREMADE REPLY FIRST
    if (PREMADE_REPLIES[messageValue]) {
      // Small timeout to make it feel natural
      setTimeout(() => {
        setMessages((prev) => [
          ...prev, 
          { sender: "bot", text: PREMADE_REPLIES[messageValue] }
        ]);
        setLoading(false);
      }, 600);
      return;
    }

    // IF NOT PREMADE, CALL GEMINI API
    try {
      const res = await axios.post(`${API_URL}/bot-service`, { message: messageValue });
      const reply = res.data.reply || "Sorry, I didn't understand that.";
      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
    } catch (err) {
      console.error("Chat Error:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Chatbot is unavailable right now." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <>
      <button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-full shadow-2xl z-50 transition-all active:scale-95"
      >
        {open ? "✕" : "💬 Need Help?"}
      </button>

      {open && (
        <div className="fixed bottom-20 right-4 w-80 h-[450px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-100 overflow-hidden">
          <div className="p-4 bg-blue-600 text-white font-bold flex justify-between items-center shadow-md">
            <span>AI Assistant</span>
            <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>

          <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-3 bg-gray-50">
            <div className="bg-gray-200 self-start p-2 rounded-lg text-sm max-w-[80%] text-gray-800 rounded-bl-none">
              Hi! I'm your assistant. Choose a topic below or type your question.
            </div>

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-2xl text-sm max-w-[85%] shadow-sm ${
                  msg.sender === "user"
                    ? "bg-blue-500 text-white self-end rounded-br-none"
                    : "bg-white text-gray-800 self-start rounded-bl-none border border-gray-200"
                }`}
              >
                {msg.text}
              </div>
            ))}

            {/* QUICK SUGGESTIONS */}
            {messages.length < 2 && !loading && (
              <div className="flex flex-col gap-2 mt-2">
                <p className="text-[10px] text-gray-400 uppercase font-bold ml-1">Quick Help</p>
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(s.value)}
                    className="text-left text-xs bg-white border border-blue-200 text-blue-600 p-2 rounded-xl hover:bg-blue-50 transition-colors shadow-sm"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div className="self-start bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-none shadow-sm">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-3 bg-white border-t flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask me anything..."
              className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="bg-blue-600 disabled:bg-gray-300 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;