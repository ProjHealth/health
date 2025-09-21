import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Addfriend.css";

const SERVER = "http://localhost:5000";

const Addfriend = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Tab state
  const [activeTab, setActiveTab] = useState("friends");
  
  // Friends state
  const [recommended, setRecommended] = useState([]);
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [chatLoading, setChatLoading] = useState(null);
  
  // Mental Health Experts state
  const [experts, setExperts] = useState([]);
  const [following, setFollowing] = useState([]);
  const [expertCategories] = useState([
    "All", "Anxiety", "Depression", "Mindfulness", "Therapy", "Wellness"
  ]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const token = localStorage.getItem("token");
  const [hasSeededExperts, setHasSeededExperts] = useState(false);

  // ------------------ Fetch data based on active tab ------------------
  useEffect(() => {
    if (!user) return;

    if (activeTab === "friends") {
      fetchRecommended();
      fetchFriends();
      fetchRequests();
    } else if (activeTab === "experts") {
      // Only seed experts if not already done
      if (!hasSeededExperts) {
        seedExpertsIfEmpty();
      } else {
        fetchExperts();
      }
      fetchFollowing();
    }
  }, [user, activeTab, hasSeededExperts]);

  // ------------------ Seed experts if DB empty ------------------
  const seedExpertsIfEmpty = useCallback(async () => {
    try {
      const res = await fetch(`${SERVER}/api/experts/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.length === 0) {
        console.log("Seeding experts...");
        await fetch(`${SERVER}/api/seed-experts`, { method: "POST" });
      }
      setHasSeededExperts(true);
      fetchExperts();
    } catch (err) {
      console.error("Error seeding experts:", err);
    }
  }, [token]);

  // ------------------ Friends API calls ------------------
  const fetchRecommended = useCallback(async () => {
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
  }, [token]);

  const fetchFriends = useCallback(async () => {
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
  }, [token]);

  const fetchRequests = useCallback(async () => {
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
  }, [token]);

  // ------------------ Mental Health Experts API calls ------------------
  const fetchExperts = useCallback(async () => {
    try {
      const res = await fetch(`${SERVER}/api/experts/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setExperts(data);
      }
    } catch (err) {
      console.error("Error fetching experts:", err);
    }
  }, [token]);

  const fetchFollowing = useCallback(async () => {
    try {
      const res = await fetch(`${SERVER}/api/experts/following`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFollowing(data);
      }
    } catch (err) {
      console.error("Error fetching following:", err);
    }
  }, [token]);

  // ------------------ Friends Handlers ------------------
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
    console.log("handleChat called with friendId:", friendId);
    
    if (!friendId) {
      console.error("❌ Friend ID is missing!");
      alert("Error: Friend ID is missing");
      return;
    }

    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(friendId)) {
      console.error("❌ Invalid friendId format:", friendId);
      alert("Error: Invalid friend ID format");
      return;
    }

    console.log("Initiating chat with friend ID:", friendId);
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

      console.log("Response received:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

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

      if (!objectIdRegex.test(data.chatId)) {
        console.error("❌ Invalid chatId format returned:", data.chatId);
        alert("Server returned invalid chat ID format");
        return;
      }

      console.log("About to navigate to chat with ID:", data.chatId);
      console.log("Navigation URL will be:", `/chat/${data.chatId}`);
      
      navigate(`/chat/${data.chatId}`);
      
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

  // ------------------ Experts Handlers ------------------
  const handleFollowExpert = async (expertId) => {
    try {
      await fetch(`${SERVER}/api/experts/follow/${expertId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchExperts();
      fetchFollowing();
    } catch (err) {
      console.error("Error following expert:", err);
    }
  };

  const handleUnfollowExpert = async (expertId) => {
    try {
      await fetch(`${SERVER}/api/experts/unfollow/${expertId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchExperts();
      fetchFollowing();
    } catch (err) {
      console.error("Error unfollowing expert:", err);
    }
  };

  const handleViewExpertProfile = (expertId) => {
    navigate(`/expert/${expertId}`);
  };

  // ------------------ Expert Helpers ------------------
  const filteredExperts = selectedCategory === "All" 
    ? experts 
    : experts.filter(expert => expert.specializations?.includes(selectedCategory));

  const isFollowing = (expertId) => {
    return following.some(f => f._id === expertId);
  };

  // ------------------ JSX ------------------
  return (
    <div className="addfriend-container">
      <h1 className="addfriend-heading">Connect & Follow</h1>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === "friends" ? "active" : ""}`}
          onClick={() => setActiveTab("friends")}
        >
          Friends
        </button>
        <button 
          className={`tab-button ${activeTab === "experts" ? "active" : ""}`}
          onClick={() => setActiveTab("experts")}
        >
          Mental Health Experts
        </button>
      </div>

      {/* Friends Tab Content */}
      {activeTab === "friends" && (
        <div className="tab-content">
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
      )}

      {/* Mental Health Experts Tab Content */}
      {activeTab === "experts" && (
        <div className="tab-content">
          {/* Category Filter */}
          <section className="category-filter">
            <h3>Filter by Specialization:</h3>
            <div className="category-buttons">
              {expertCategories.map(category => (
                <button
                  key={category}
                  className={`category-btn ${selectedCategory === category ? "active" : ""}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </section>

          {/* Available Experts */}
          <section className="experts-container">
            <h2 className="section-heading">Mental Health Experts</h2>
            {filteredExperts.length === 0 ? (
              <div className="empty-state">No experts available in this category</div>
            ) : (
              <div className="experts-grid">
                {filteredExperts.map((expert) => (
                  <div key={expert._id} className="expert-item">
                    <div className="expert-avatar">
                      {expert.profilePicture ? (
                        <img 
                        src={expert.profilePicture || "https://randomuser.me/api/portraits/men/32.jpg"} 
                        alt={expert.name} 
                        onError={(e) => e.target.src = "https://randomuser.me/api/portraits/men/32.jpg"}
                      />
                      ) : (
                        <div className="avatar-placeholder">{expert.name.charAt(0)}</div>
                      )}
                    </div>
                    <div className="expert-info">
                      <h3 className="expert-name">{expert.name}</h3>
                      <p className="expert-title">{expert.title}</p>
                      <p className="expert-bio">{expert.bio?.substring(0, 100)}...</p>
                      <div className="expert-stats">
                        <span className="followers-count">{expert.followersCount || 0} followers</span>
                        <span className="posts-count">{expert.postsCount || 0} posts</span>
                      </div>
                      <div className="expert-specializations">
                        {expert.specializations?.slice(0, 3).map(spec => (
                          <span key={spec} className="specialization-tag">{spec}</span>
                        ))}
                      </div>
                    </div>
                    <div className="expert-actions">
                      <button 
                        className="btn btn-profile" 
                        onClick={() => handleViewExpertProfile(expert._id)}
                      >
                        View Profile
                      </button>
                      {isFollowing(expert._id) ? (
                        <button 
                          className="btn btn-unfollow" 
                          onClick={() => handleUnfollowExpert(expert._id)}
                        >
                          Following
                        </button>
                      ) : (
                        <button 
                          className="btn btn-follow" 
                          onClick={() => handleFollowExpert(expert._id)}
                        >
                          Follow
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Following List */}
          <section className="following-container">
            <h2 className="section-heading">Following ({following.length})</h2>
            {following.length === 0 ? (
              <div className="empty-state">You're not following any experts yet</div>
            ) : (
              <div className="following-grid">
                {following.map((expert) => (
                  <div key={expert._id} className="following-item">
                    <div className="following-info">
                      <span className="following-name">{expert.name}</span>
                      <span className="following-title">{expert.title}</span>
                    </div>
                    <div className="following-actions">
                      <button 
                        className="btn btn-profile-sm" 
                        onClick={() => handleViewExpertProfile(expert._id)}
                      >
                        View
                      </button>
                      <button 
                        className="btn btn-unfollow-sm" 
                        onClick={() => handleUnfollowExpert(expert._id)}
                      >
                        Unfollow
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default Addfriend;