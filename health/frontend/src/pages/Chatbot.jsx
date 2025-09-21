import React, { useState, useRef, useEffect } from "react";
import "./Chatbot.css"; // Assuming you have a CSS file

// Component for individual messages (Unchanged)
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

  // Get user info (Assuming this is correct for your app)
  const localUser = JSON.parse(localStorage.getItem("user"));
  // Added conditional check to prevent crash on missing user
  const userId = localUser ? localUser.id : "guest_user"; 
  // if (!localUser) throw new Error("User not found in localStorage");

  // Fetch chat history (Unchanged)
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

  // Auto-scroll (Unchanged)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message (Unchanged)
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

  // Handle enter key (Unchanged)
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Retry connection (Unchanged)
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

  // 🟢 FIX: Start recording audio using supported WebM/Opus encoding
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Use WebM/Opus, which is widely supported and compatible with Google STT's WEBM_OPUS
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm; codecs=opus' }); 
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = sendAudioToServer;
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic access denied:", err);
      alert("Microphone access is required. Error: " + err.name + " - Check HTTPS/Permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // 🟢 FIX: Send recorded audio to backend for STT using the 'audio/webm' Blob type
// 🟢 FIX: Send recorded audio to backend for STT using the 'audio/webm' Blob type
const sendAudioToServer = async () => {
  const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });

  if (blob.size === 0) {
    console.warn("Recording was too short or failed to capture data.");
    alert("Please hold the microphone button longer to record speech.");
    return;
  }

  const formData = new FormData();
  formData.append("audio", blob, "recording.webm");

  try {
    setIsLoading(true);
    const res = await fetch(`${SERVER}/api/speech/speech-to-text`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.details || "STT Server Error");
    }

    const data = await res.json();

    if (data.transcription) {
      // 🟢 Instead of just setting input, send to chatbot immediately
      const userMessage = { _id: Date.now(), sender: "You", text: data.transcription };
      setMessages((prev) => [...prev, userMessage]);

      // Send transcription to chatbot endpoint
      const response = await fetch(`${SERVER}/api/chatbot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, text: data.transcription }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Server error");
      }

      const botData = await response.json();
      const botMessage = { _id: Date.now() + 1, sender: "Bot", text: botData.reply };
      setMessages((prev) => [...prev, botMessage]);
    } else {
      console.warn("No transcription received or speech detected.");
    }
  } catch (err) {
    console.error("STT Error:", err);
    setMessages((prev) => [
      ...prev,
      { _id: Date.now() + 3, sender: "Bot", text: "Sorry, I couldn't process the voice command. 🎤" },
    ]);
  } finally {
    setIsLoading(false);
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
          disabled={isLoading}
        >
          {isRecording ? "🔴" : "🎤"}
        </button>
        <button onClick={sendMessage} disabled={isLoading || !input.trim()} className={input.trim() ? "active" : ""}>
          ➤
        </button>
      </div>
    </div>
  );
};

export default Chatbot;