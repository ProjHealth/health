import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const AddFriend = () => {
  const { user } = useAuth();
  const [recommended, setRecommended] = useState([]);
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);

  const token = localStorage.getItem("token");

  // Fetch all data
  useEffect(() => {
    if (!user) return;
    fetchRecommended();
    fetchFriends();
    fetchRequests();
  }, [user]);

  const fetchRecommended = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/friends/recommended", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRecommended(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFriends = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/friends/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFriends(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/friends/requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddFriend = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/friends/request/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRecommended();
      fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRespond = async (id, action) => {
    try {
      await fetch(`http://localhost:5000/api/friends/respond/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action }),
      });
      fetchFriends();
      fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  

  const handleChat = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/chat/initiate/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const chatId = data.chatId;
      window.location.href = `/chat/${chatId}`;
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add Friends</h1>

      {/* Friend Requests */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Friend Requests</h2>
        {requests.length === 0 ? (
          <p className="text-gray-500">No pending requests</p>
        ) : (
          requests.map((req) => (
            <div key={req._id} className="flex items-center justify-between border p-2 rounded mb-2">
              <span>{req.requester.name}</span>
              <div className="flex gap-2">
                <button onClick={() => handleRespond(req._id, "accept")} className="px-3 py-1 bg-green-500 text-white rounded">Accept</button>
                <button onClick={() => handleRespond(req._id, "decline")} className="px-3 py-1 bg-red-500 text-white rounded">Decline</button>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Recommended Friends */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Recommended Friends</h2>
        {recommended.length === 0 ? (
          <p className="text-gray-500">No recommendations</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {recommended.map((user) => (
              <div key={user._id} className="flex items-center justify-between border p-2 rounded">
                <span>{user.name}</span>
                <button onClick={() => handleAddFriend(user._id)} className="px-3 py-1 bg-blue-500 text-white rounded">Add</button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Friends List */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Your Friends</h2>
        {friends.length === 0 ? (
          <p className="text-gray-500">You have no friends yet</p>
        ) : (
          <div className="grid gap-2">
            {friends.map((friend) => (
              <div key={friend._id} className="flex items-center justify-between border p-2 rounded">
                <span>{friend.name}</span>
                <button onClick={() => handleChat(friend._id)} className="px-3 py-1 bg-purple-500 text-white rounded">Chat</button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AddFriend;
