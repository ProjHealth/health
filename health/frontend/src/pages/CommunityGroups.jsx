import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./CommunityGroups.css";

const CommunityGroups = () => {
  const [communities, setCommunities] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Fetch communities
  useEffect(() => {
    fetch("http://localhost:5000/api/communities")
      .then(res => res.json())
      .then(data => setCommunities(data));
  }, []);

  // Create new community
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!user) return alert("You must be logged in to create a group.");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/communities/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create group");
      setCommunities(prev => [...prev, data]);
      setName("");
      setDescription("");
    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  };

  // Join a community
  const handleJoin = async (id) => {
    if (!user) return alert("You must be logged in to join a group.");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/communities/join/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to join group");
      alert("Joined group!");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="community-page">
      <h1>Community Support Groups</h1>

      {/* Create Group Form */}
      <form onSubmit={handleCreate} className="create-group-form">
        <h2>Create a New Group</h2>
        <input
          type="text"
          placeholder="Group Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Group"}
        </button>
      </form>

      {/* List of Groups */}
      <div className="groups-list">
        {communities.length === 0 ? (
          <p>No groups yet.</p>
        ) : (
          communities.map(group => (
            <div key={group._id} className="group-card">
              <div className="group-title">{group.name}</div>
              <div className="group-desc">{group.description}</div>
              <div className="group-meta">
                Created by: {group.creator.name}
              </div>
              <button onClick={() => handleJoin(group._id)}>Join Group</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommunityGroups;