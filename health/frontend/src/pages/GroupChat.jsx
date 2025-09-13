import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import "./GroupChat.css";

const GroupChat = () => {
  const { groupId } = useParams();
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]); // always an array
  const [newMessage, setNewMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [community, setCommunity] = useState(null);

  // Fetch community info
  useEffect(() => {
    if (!groupId || !token || token === "null" || token === "undefined") return;
    axios
      .get(`http://localhost:5000/api/communities/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCommunity(res.data))
      .catch(() => setCommunity(null));
  }, [groupId, token]);

  // Fetch messages with polling
  useEffect(() => {
    if (!groupId || !token || token === "null" || token === "undefined") return;

    const fetchMessages = () => {
      axios
        .get(`http://localhost:5000/api/communities/${groupId}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setMessages(Array.isArray(res.data) ? res.data : []);
        })
        .catch(() => setMessages([]));
    };

    fetchMessages(); // initial load
    const interval = setInterval(fetchMessages, 3000); // refresh every 3 sec

    return () => clearInterval(interval); // cleanup on unmount
  }, [groupId, token]);

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !token) {
      console.log("Blocked because no message or token:", newMessage, token);
      return;
    }
    try {
      console.log("📤 Sending:", newMessage);
      const res = await axios.post(
        `http://localhost:5000/api/communities/${groupId}/messages`,
        { content: newMessage, anonymous },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("✅ Sent:", res.data);
      setMessages((prev) => [...prev, res.data]);
      setNewMessage("");
    } catch (err) {
      console.error("❌ Send failed:", err.response?.data || err.message);
    }
  };

  return (
    <div className="chat-container">
      <h2 className="chat-title">{community?.name || "Group Chat"}</h2>
      <div className="chat-messages">
        {(Array.isArray(messages) ? messages : []).map((msg) => {
          const isCurrentUser = msg.sender?._id === user._id;
          const senderName = msg.anonymous
            ? "Anonymous"
            : msg.sender?.name || "Unknown";
          const senderEmail = msg.anonymous
            ? ""
            : msg.sender?.email
            ? ` (${msg.sender.email})`
            : "";
          const date = new Date(msg.createdAt);
          return (
            <div
              key={msg._id}
              className={`message ${isCurrentUser ? "sent" : "received"}`}
            >
              <div className="sender-name">
                {senderName}
                {senderEmail}
                <span
                  style={{
                    fontWeight: "normal",
                    fontSize: "0.8em",
                    color: "#888",
                    marginLeft: 8,
                  }}
                >
                  {date.toLocaleDateString()} {date.toLocaleTimeString()}
                </span>
              </div>
              <p>{msg.content}</p>
            </div>
          );
        })}
      </div>
      <div className="chat-input-container">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="chat-input"
          placeholder="Type a message..."
        />
        <label style={{ display: "flex", alignItems: "center", marginLeft: 8 }}>
          <input
            type="checkbox"
            checked={anonymous}
            onChange={() => setAnonymous((a) => !a)}
            style={{ marginRight: 4 }}
          />
          Anonymous
        </label>
        <button onClick={sendMessage} className="chat-send-button">
          Send
        </button>
      </div>
    </div>
  );
};

export default GroupChat;
