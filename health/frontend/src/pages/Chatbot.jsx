import React, { useState, useRef, useEffect } from "react";
import "./Chatbot.css";

// ChatMessage component for individual messages
const ChatMessage = ({ message }) => {
  const { sender, text } = message;
  const isBot = sender === "Bot";

  return (
    <div className={`message-container ${isBot ? "bot" : "user"}`}>
      <div className={`message ${isBot ? "bot-message" : "user-message"}`}>
        <div className="message-content">{text}</div>
      </div>
    </div>
  );
};

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const messagesEndRef = useRef(null);

  const SERVER = "http://localhost:5000"; // backend URL

  // Parse user info from localStorage
  const localUser = JSON.parse(localStorage.getItem("user"));
  if (!localUser) throw new Error("User not found in localStorage");
  const userId = localUser.id;

  // Fetch chat history from backend
  const fetchHistory = async () => {
    try {
      const res = await fetch(`${SERVER}/api/chat/${userId}`);
      if (!res.ok) {
        const err = await res.json();
        console.error("Failed to load chat:", err);
        return;
      }
      const data = await res.json();
      setMessages(
        data.messages.map((m) => ({
          _id: m._id,
          text: m.text,
          sender: m.sender === "user" ? "You" : "Bot",
          timestamp: m.timestamp || m.createdAt,
        }))
      );
    } catch (err) {
      console.error(err);
      setMessages([{ sender: "Bot", text: "Hello! How can I help you today? 😊", _id: Date.now() }]);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Auto-scroll when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { _id: Date.now(), sender: "You", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setConnectionError(false);

    try {
      const response = await fetch(`${SERVER}/api/chatbot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, text: input }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Server error");
      }

      const data = await response.json();
      const botMessage = { _id: Date.now() + 1, sender: "Bot", text: data.reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Error:", err);
      setConnectionError(true);
      setMessages((prev) => [
        ...prev,
        { _id: Date.now() + 2, sender: "Bot", text: "Sorry, I'm having trouble connecting to the server. 🔄" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const retryConnection = async () => {
    setMessages((prev) => [
      ...prev,
      { _id: Date.now(), sender: "Bot", text: "Trying to reconnect to the server... 🔄" },
    ]);

    try {
      const response = await fetch(SERVER + "/");
      if (response.ok) {
        setMessages((prev) => [
          ...prev,
          { _id: Date.now() + 1, sender: "Bot", text: "Connection restored! You can now send messages. 🎉" },
        ]);
        setConnectionError(false);
      } else throw new Error("Server still unavailable");
    } catch (err) {
      console.error("Reconnection error:", err);
      setMessages((prev) => [
        ...prev,
        { _id: Date.now() + 2, sender: "Bot", text: "Still can't connect. Please make sure the backend is running. 🔧" },
      ]);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h2>AI Friend Chatbot</h2>
      </div>

      <div className="messages-container">
        {messages.map((msg) => (
          <ChatMessage key={msg._id} message={msg} />
        ))}

        {isLoading && (
          <div className="message-container bot">
            <div className="message bot-message">
              <div className="loading-indicator">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {connectionError && (
        <div className="connection-error">
          <p>Connection to server failed</p>
          <button onClick={retryConnection}>Retry Connection</button>
        </div>
      )}

      <div className="input-area">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type a message..."
          rows={1}
          disabled={isLoading}
        />
        <button onClick={sendMessage} disabled={isLoading || !input.trim()} className={input.trim() ? "active" : ""}>
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
