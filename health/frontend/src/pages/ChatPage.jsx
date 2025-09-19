// src/pages/ChatPage.jsx
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./ChatPage.css";


const SERVER = "http://localhost:5000"; // backend

const ChatPage = () => {
  const { chatId } = useParams();
  const { user } = useAuth();
  const token = localStorage.getItem("token");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const endRef = useRef(null);

  // Fetch chat history
  const fetchHistory = async () => {
    if (!chatId || !token) return;
    try {
      const res = await fetch(`${SERVER}/api/chat/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        console.error("Failed to load chat:", err);
        return;
      }
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistory();
    // Poll every 3s
    const interval = setInterval(fetchHistory, 3000);
    return () => clearInterval(interval);
  }, [chatId, token]);

  // Scroll to bottom when messages change
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    try {
      const res = await fetch(`${SERVER}/api/chat/${chatId}/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: trimmed }),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("Send failed:", err);
        return;
      }

      setText("");
      fetchHistory(); // refresh immediately after sending
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="chat-container">
      <h1 className="chat-header">Chat</h1>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <p className="chat-empty">No messages yet</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`chat-message ${
                msg.sender?._id === user._id ? "text-right" : "text-left"
              }`}
            >
              <div className="chat-sender">
                {msg.sender?.name ||
                  (msg.sender === user._id ? "You" : "Friend")}
              </div>
              <div className="chat-bubble">
                {msg.text}
              </div>
              <div className="chat-timestamp">
                {new Date(msg.timestamp).toLocaleString()}
              </div>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      <div className="chat-input-area">
        <input
          className="chat-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPage;