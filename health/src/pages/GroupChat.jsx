import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

const GroupChat = () => {
  const { groupId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // Fetch messages
  useEffect(() => {
    const messagesRef = collection(db, "community_groups", groupId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [groupId]);

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    await addDoc(collection(db, "community_groups", groupId, "messages"), {
      text: newMessage,
      userId: user.uid,
      userName: user.displayName || "Anonymous", // Store sender's name
      timestamp: serverTimestamp(),
    });

    setNewMessage("");
  };

  return (
    <div className="chat-container">
      <h2 className="chat-title">{groupId.replace("_", " ")}</h2>

      {/* Chat Messages Container */}
      <div className="chat-messages">
        {messages.map((msg) => {
          const isCurrentUser = msg.userId === user.uid;
          return (
            <div key={msg.id} className={`message ${isCurrentUser ? "sent" : "received"}`}>
              {!isCurrentUser && <p className="sender-name">{msg.userName}</p>}
              <p>{msg.text}</p>
            </div>
          );
        })}
      </div>

      {/* Message Input Box */}
      <div className="chat-input-container">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="chat-input"
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} className="chat-send-button">
          Send
        </button>
      </div>
    </div>
  );
};

export default GroupChat;
