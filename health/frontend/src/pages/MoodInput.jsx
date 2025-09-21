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
    <div
      style={{
        padding: "16px",
        border: "1px solid #ddd",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        backgroundColor: "#fff",
        maxWidth: "500px",
        margin: "0 auto",
      }}
    >
      <form onSubmit={handleSubmit}>
        <textarea
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            resize: "none",
            fontSize: "14px",
            outline: "none",
          }}
          rows="3"
          value={moodText}
          onChange={(e) => setMoodText(e.target.value)}
          placeholder="How are you feeling today?"
        ></textarea>
        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: "10px",
            padding: "10px 16px",
            backgroundColor: loading ? "#93c5fd" : "#3b82f6",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "14px",
            transition: "background-color 0.2s ease",
          }}
          onMouseOver={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = "#2563eb";
          }}
          onMouseOut={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = "#3b82f6";
          }}
        >
          {loading ? "Saving..." : "Log Mood"}
        </button>
      </form>
      {message && (
        <p
          style={{
            marginTop: "8px",
            fontSize: "13px",
            color: message.includes("✅") ? "green" : "red",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default MoodInput;
