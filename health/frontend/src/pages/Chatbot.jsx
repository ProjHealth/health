import React, { useState, useRef, useEffect } from "react";
import "./Chatbot.css";

// Component for individual messages
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
  const [isRecording, setIsRecording] = useState(false);

  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const SERVER = "http://localhost:5000"; // backend URL

  // Get user info
  const localUser = JSON.parse(localStorage.getItem("user"));
  if (!localUser) throw new Error("User not found in localStorage");
  const userId = localUser.id;

  // Fetch chat history
  const fetchHistory = async () => {
    try {
      const res = await fetch(`${SERVER}/api/chatbot/${userId}`);
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

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
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

  // Handle enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Retry connection
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
          { _id: Date.now() + 1, sender: "Bot", text: "Connection restored! 🎉" },
        ]);
        setConnectionError(false);
      } else throw new Error("Server still unavailable");
    } catch (err) {
      console.error("Reconnection error:", err);
      setMessages((prev) => [
        ...prev,
        { _id: Date.now() + 2, sender: "Bot", text: "Still can't connect. 🔧" },
      ]);
    }
  };

  // Start recording audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = sendAudioToServer;
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic access denied:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Send recorded audio to backend for STT
  const sendAudioToServer = async () => {
    const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
    const formData = new FormData();
    formData.append("audio", blob);

    try {
      const res = await fetch(`${SERVER}/api/speech/speech-to-text`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.transcription) {
        setInput(data.transcription); 
        // Optionally auto-send:
        // sendMessage();
      }
    } catch (err) {
      console.error("STT Error:", err);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h2>AI Friend Chatbot</h2>
        <button
          className="clear-chat-btn"
          onClick={async () => {
            if (!window.confirm("Are you sure you want to clear chat history?")) return;
            try {
              const res = await fetch(`${SERVER}/api/chatbot/${userId}`, { method: "DELETE" });
              if (!res.ok) throw new Error("Failed to clear chat");
              setMessages([{ _id: Date.now(), sender: "Bot", text: "Chat cleared! 😊" }]);
            } catch (err) {
              console.error("Clear chat error:", err);
              alert("Failed to clear chat. Try again.");
            }
          }}
        >
          🗑
        </button>
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
        <button
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          className={isRecording ? "recording" : ""}
          title="Hold to speak"
        >
          🎤
        </button>
        <button onClick={sendMessage} disabled={isLoading || !input.trim()} className={input.trim() ? "active" : ""}>
          ➤
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
