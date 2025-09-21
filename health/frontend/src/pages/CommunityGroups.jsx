import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./CommunityGroups.css";

const CommunityGroups = () => {
  const [communities, setCommunities] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Debug: Log user info and decode JWT token to console
  useEffect(() => {
    console.log("Current user:", user);
    console.log("User keys:", user ? Object.keys(user) : "No user");
    
    // Decode JWT token to see what's inside
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const decoded = JSON.parse(jsonPayload);
        console.log("Decoded JWT token:", decoded);
        console.log("JWT token keys:", Object.keys(decoded));
      } catch (e) {
        console.log("Error decoding token:", e);
      }
    }
  }, [user]);

  // Always fetch latest communities from backend
  const fetchCommunities = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/communities");
      const data = await res.json();
      setCommunities(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching communities:", err);
      setCommunities([]);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  // Create new community
  const handleCreate = async (e) => {
    e.preventDefault();
    
    // Debug logging
    console.log("handleCreate - user:", user);
    console.log("handleCreate - user._id:", user?._id);
    console.log("handleCreate - user.id:", user?.id);
    
    // More flexible user check
    if (!user || (!user._id && !user.id)) {
      console.log("No user or user ID found");
      return alert("Login required to create group");
    }
    
    setCreating(true);
    try {
      const token = localStorage.getItem("token");
      console.log("Token exists:", !!token);
      
      const res = await fetch("http://localhost:5000/api/communities/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create group");
      }
      
      const data = await res.json();
      await fetchCommunities();
      setName("");
      setDescription("");
    } catch (err) {
      console.error("Create group error:", err);
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  // Join community with better user checking
  const handleJoin = async (id) => {
    // Debug logging
    console.log("handleJoin - user:", user);
    console.log("handleJoin - user._id:", user?._id);
    console.log("handleJoin - user.id:", user?.id);
    
    // More flexible user check
    if (!user || (!user._id && !user.id)) {
      console.log("Join failed: No user or user ID found");
      return alert("Login required to join");
    }
    
    try {
      const token = localStorage.getItem("token");
      console.log("Join - Token exists:", !!token);
      console.log("Join - Attempting to join community:", id);
      
      const res = await fetch(`http://localhost:5000/api/communities/join/${id}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
      });

      console.log("Join response status:", res.status);
      
      if (!res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await res.json();
          console.log("Join error data:", errorData);
          throw new Error(errorData.message || `Server error: ${res.status}`);
        } else {
          const textResponse = await res.text();
          console.log("Join - Non-JSON response:", textResponse);
          throw new Error(`Server error: ${res.status}. Check if backend is running.`);
        }
      }

      const data = await res.json();
      console.log("Join successful:", data);
      await fetchCommunities();
    } catch (err) {
      console.error("Join group error:", err);
      
      if (err.message.includes("Failed to fetch")) {
        alert("Cannot connect to server. Please check if the backend is running on http://localhost:5173");
      } else if (err.message.includes("<!DOCTYPE")) {
        alert("Server returned HTML instead of JSON. Please check your backend API routes.");
      } else {
        alert(err.message);
      }
    }
  };

  // Leave community with better user checking
  const handleLeave = async (id) => {
    // Debug logging
    console.log("handleLeave - user:", user);
    
    // More flexible user check
    if (!user || (!user._id && !user.id)) {
      console.log("Leave failed: No user or user ID found");
      return alert("Login required to leave");
    }
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/communities/leave/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to leave group");
      }
      
      await fetchCommunities();
    } catch (err) {
      console.error("Leave group error:", err);
      alert(err.message);
    }
  };

  // Delete community (only for creator)
  const handleDelete = async (id) => {
    // More flexible user check
    if (!user || (!user._id && !user.id)) {
      console.log("Delete failed: No user or user ID found");
      return alert("Login required to delete");
    }
    
    if (!confirm("Are you sure you want to delete this community? This action cannot be undone.")) {
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/communities/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete group");
      }
      
      await fetchCommunities();
    } catch (err) {
      console.error("Delete group error:", err);
      alert(err.message);
    }
  };

  // Helper to get user id (handles _id or id)
  const getUserId = () => (user ? user._id || user.id : undefined);

  // Helper to check if user is a member (handles both string and objectId)
  const isUserMember = (community) => {
    const userId = getUserId();
    if (!userId || !community.members) return false;
    return community.members.some(
      (m) =>
        (typeof m === "string" && m === userId) ||
        (m && typeof m === "object" && (m._id === userId || m.id === userId))
    );
  };

  // Helper to check if user is creator
  const isUserCreator = (community) => {
    const userId = getUserId();
    if (!userId || !community.creator) return false;
    return (
      (typeof community.creator === "string" && community.creator === userId) ||
      (community.creator._id && community.creator._id === userId) ||
      (community.creator.id && community.creator.id === userId)
    );
  };

  // More flexible user check for the main component
  if (!user) {
    return (
      <div className="community-page">
        <h1>Community Support Groups</h1>
        <p style={{ color: "red", textAlign: "center", marginTop: "2em" }}>
          Please log in to view and join groups.
        </p>
      </div>
    );
  }

  return (
    <div className="community-page">
      <h1>Community Support Groups</h1>
      


      {/* Create group form */}
      <form onSubmit={handleCreate} className="create-group-form">
        <h2>Create a New Group</h2>
        <input
          type="text"
          placeholder="Group Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <button type="submit" disabled={creating}>
          {creating ? "Creating..." : "Create Group"}
        </button>
      </form>

      {/* Groups list */}
      <div className="groups-list">
        {communities.length === 0 ? (
          <p>No communities found. Create the first one!</p>
        ) : (
          communities.map((community) => {
            const isMember = isUserMember(community);
            const isCreator = isUserCreator(community);

            return (
              <div key={community._id} className="group-card">
                <div className="group-title">{community.name}</div>
                <div className="group-desc">{community.description}</div>
                <div className="group-meta">
                  Created by: {community.creator?.name || "Unknown"}
                </div>
                {isMember ? (
                  <>
                    <button className="joined-btn" disabled>
                      Joined
                    </button>
                    <button
                      className="view-btn"
                      onClick={() => navigate(`/groups/${community._id}`)}
                    >
                      View Group
                    </button>
                    <button
                      style={{ marginLeft: 10, background: "#dc2626" }}
                      onClick={() => handleLeave(community._id)}
                    >
                      Leave Group
                    </button>
                    {isCreator && (
                      <button
                        style={{ marginLeft: 10, background: "#b71c1c" }}
                        onClick={() => handleDelete(community._id)}
                      >
                        Delete Group
                      </button>
                    )}
                  </>
                ) : (
                  <button onClick={() => handleJoin(community._id)}>
                    Join Group
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CommunityGroups;