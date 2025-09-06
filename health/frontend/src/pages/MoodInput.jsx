import React, { useState } from "react";

const MoodInput = ({ onMoodLogged }) => {
  const [moodText, setMoodText] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!moodText.trim()) return;

    try {
      setLoading(true);
      setMessage("");

      // ✅ get user from localStorage
      const storedUser = localStorage.getItem("user");
      if (!storedUser) throw new Error("User not found in localStorage");

      const parsedUser = JSON.parse(storedUser);
      const userId = parsedUser.id; // use the id field from your JSON

      const res = await fetch("http://localhost:5000/api/v1/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          inputText: moodText,
        }),
      });

      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();

      setMessage("Mood logged successfully ✅");
      setMoodText("");

      if (onMoodLogged) onMoodLogged(data);
    } catch (err) {
      console.error(err);
      setMessage("Error logging mood ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white">
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full p-2 border rounded-md"
          rows="3"
          value={moodText}
          onChange={(e) => setMoodText(e.target.value)}
          placeholder="How are you feeling today?"
        ></textarea>
        <button
          type="submit"
          disabled={loading}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          {loading ? "Saving..." : "Log Mood"}
        </button>
      </form>
      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
};

export default MoodInput;
