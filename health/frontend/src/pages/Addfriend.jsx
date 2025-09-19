import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Addfriend.css";

const SERVER = "http://localhost:5000"; // Add this constant

const Addfriend = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recommended, setRecommended] = useState([]);
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [chatLoading, setChatLoading] = useState(null); // Track which friend's chat is loading

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!user) return;
    fetchRecommended();
    fetchFriends();
    fetchRequests();
  }, [user]);

  const fetchRecommended = async () => {
    try {
      const res = await fetch(`${SERVER}/api/friends/recommended`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRecommended(data);
      }
    } catch (err) {
      console.error("Error fetching recommended friends:", err);
    }
  };

  const fetchFriends = async () => {
    try {
      const res = await fetch(`${SERVER}/api/friends/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFriends(data);
      }
    } catch (err) {
      console.error("Error fetching friends:", err);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${SERVER}/api/friends/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  };

  const handleAddFriend = async (id) => {
    try {
      await fetch(`${SERVER}/api/friends/request/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRecommended();
      fetchRequests();
    } catch (err) {
      console.error("Error adding friend:", err);
    }
  };

  const handleRespond = async (id, action) => {
    try {
      await fetch(`${SERVER}/api/friends/respond/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action }),
      });
      fetchFriends();
      fetchRequests();
    } catch (err) {
      console.error("Error responding to request:", err);
    }
  };

  const handleChat = async (friendId) => {
    console.log("🚀 handleChat called with friendId:", friendId);
    
    if (!friendId) {
      console.error("❌ Friend ID is missing!");
      alert("Error: Friend ID is missing");
      return;
    }

    // Validate friendId format
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(friendId)) {
      console.error("❌ Invalid friendId format:", friendId);
      alert("Error: Invalid friend ID format");
      return;
    }

    console.log("🚀 Initiating chat with friend ID:", friendId);
    setChatLoading(friendId);

    try {
      const url = `${SERVER}/api/chat/initiate/${friendId}`;
      console.log("📡 Making POST request to:", url);

      const response = await fetch(url, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      console.log("📡 Response received:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      // Always try to get response text first
      const responseText = await response.text();
      console.log("📡 Raw response text:", responseText);

      if (!response.ok) {
        console.error("❌ HTTP Error:", response.status, response.statusText);
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.error("❌ Could not parse error response as JSON");
        }
        
        alert(`Failed to start chat: ${errorMessage}`);
        return;
      }

      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("❌ Could not parse success response as JSON:", parseError);
        alert("Server returned invalid response");
        return;
      }

      console.log("✅ Chat initiation successful, parsed data:", data);

      if (!data.chatId) {
        console.error("❌ No chatId in response, full response:", data);
        alert("Server did not return a chat ID");
        return;
      }

      // Validate the returned chatId
      if (!objectIdRegex.test(data.chatId)) {
        console.error("❌ Invalid chatId format returned:", data.chatId);
        alert("Server returned invalid chat ID format");
        return;
      }

      console.log("🔄 About to navigate to chat with ID:", data.chatId);
      console.log("🔄 Navigation URL will be:", `/chat/${data.chatId}`);
      
      // Navigate using React Router
      navigate(`/chat/${data.chatId}`);
      
      // Log successful navigation
      setTimeout(() => {
        console.log("✅ Navigation completed, current URL:", window.location.href);
      }, 100);

    } catch (networkError) {
      console.error("❌ Network/Fetch error:", networkError);
      alert(`Network error: ${networkError.message}`);
    } finally {
      setChatLoading(null);
    }
  };

  return (
    <div className="addfriend-container">
      <h1 className="addfriend-heading">Add Friends</h1>

      {/* Friend Requests */}
      <section className="requests-container">
        <h2 className="section-heading">Friend Requests</h2>
        {requests.length === 0 ? (
          <div className="empty-state">No pending requests</div>
        ) : (
          requests.map((req) => (
            <div key={req._id} className="request-item">
              <span className="request-name">{req.requester.name}</span>
              <div className="flex gap-2">
                <button className="btn btn-accept" onClick={() => handleRespond(req._id, "accept")}>Accept</button>
                <button className="btn btn-decline" onClick={() => handleRespond(req._id, "decline")}>Decline</button>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Recommended Friends */}
      <section className="recommended-container">
        <h2 className="section-heading">Recommended Friends</h2>
        {recommended.length === 0 ? (
          <div className="empty-state">No recommendations</div>
        ) : (
          <div className="recommended-grid">
            {recommended.map((u) => (
              <div key={u._id} className="recommended-item">
                <span className="recommended-name">{u.name}</span>
                <button className="btn btn-add" onClick={() => handleAddFriend(u._id)}>Add</button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Friends List */}
      <section className="friends-container">
        <h2 className="section-heading">Your Friends</h2>
        {friends.length === 0 ? (
          <div className="empty-state">You have no friends yet</div>
        ) : (
          <div className="friends-grid">
            {friends.map((friend) => (
              <div key={friend._id} className="friend-item">
                <span className="friend-name">{friend.name}</span>
                <button 
                  className="btn btn-chat" 
                  onClick={() => handleChat(friend._id)}
                  disabled={chatLoading === friend._id}
                >
                  {chatLoading === friend._id ? "Loading..." : "Chat"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Addfriend;