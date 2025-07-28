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
  const [messages, setMessages] = useState([
    { sender: "Bot", text: "Hello! How can I help you today? 😊" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const messagesEndRef = useRef(null);
  const API_URL = "http://127.0.0.1:5000/chat";  // Update this with your backend URL

  // Auto-scroll to the bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "You", text: input };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput("");
    setIsLoading(true);
    setConnectionError(false);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
        credentials: "include"  // Important for sessions
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();
      setMessages(prevMessages => [
        ...prevMessages, 
        { sender: "Bot", text: data.response }
      ]);
    } catch (error) {
      console.error("Error:", error);
      setConnectionError(true);
      setMessages(prevMessages => [
        ...prevMessages,
        { 
          sender: "Bot", 
          text: "Sorry, I'm having trouble connecting to the server. Please check if the backend is running on port 5000. 🔄" 
        }
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

  const retryConnection = () => {
    setMessages(prevMessages => [
      ...prevMessages,
      { sender: "Bot", text: "Trying to reconnect to the server... 🔄" }
    ]);
    
    fetch(API_URL.replace("/chat", "/"))
      .then(response => {
        if (response.ok) {
          setMessages(prevMessages => [
            ...prevMessages,
            { sender: "Bot", text: "Connection restored! You can now send messages. 🎉" }
          ]);
          setConnectionError(false);
        } else {
          throw new Error("Server still unavailable");
        }
      })
      .catch(error => {
        console.error("Reconnection error:", error);
        setMessages(prevMessages => [
          ...prevMessages,
          { 
            sender: "Bot", 
            text: "Still can't connect to the server. Please make sure the backend is running on port 5000. 🔧" 
          }
        ]);
      });
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h2>AI Friend Chatbot</h2>
      </div>
      
      <div className="messages-container">
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
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
          onClick={sendMessage} 
          disabled={isLoading || !input.trim()}
          className={input.trim() ? "active" : ""}
        >
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