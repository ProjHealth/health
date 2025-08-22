import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";


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
        body: JSON.stringify({ name, description })
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
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-indigo-600 mb-8 text-center">
        Community Support Groups
      </h1>

      {/* Create Group Form */}
      <form onSubmit={handleCreate} className="mb-8 w-full max-w-md bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Create a New Group</h2>
        <input
          type="text"
          placeholder="Group Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full mb-2 p-2 border rounded"
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full mb-2 p-2 border rounded"
          required
        />
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded" disabled={loading}>
          {loading ? "Creating..." : "Create Group"}
        </button>
      </form>

      {/* List of Groups */}
      <div className="w-full max-w-md space-y-4">
        {communities.length === 0 ? (
          <p>No groups yet.</p>
        ) : (
          communities.map(group => (
            <div key={group._id} className="bg-white p-4 rounded shadow flex flex-col gap-2">
              <div className="font-bold text-lg">{group.name}</div>
              <div className="text-gray-700">{group.description}</div>
              <div className="text-xs text-gray-500">Created by: {group.creator?.name || "Unknown"}</div>
              <button
                className="bg-green-600 text-white px-3 py-1 rounded w-fit"
                onClick={() => handleJoin(group._id)}
              >
                Join Group
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommunityGroups;

