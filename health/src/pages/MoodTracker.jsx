import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./MoodTracker.css";

const MoodTracker = () => {
  const [mood, setMood] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState("");
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchMoods = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("http://localhost:5000/api/moods", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMoods(data);
      }
    };
    fetchMoods();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Login required.");
    if (!mood || !notes || !date) return alert("All fields required.");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/moods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mood, note: notes, date }),
      });
      if (!res.ok) throw new Error("Failed");
      const newMood = await res.json();
      setMoods((prev) => [...prev, newMood]);
      setMood("");
      setNotes("");
      setDate("");
      alert("Mood saved!");
    } catch {
      alert("Error saving mood.");
    }
    setLoading(false);
  };

  const handleAnalysis = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const res = await fetch("http://localhost:5000/api/moods/analysis", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setAnalysis(data);
    setShowAnalysis(true);
    setShowCalendar(false);
  };

  const getStreak = () => {
    if (!moods.length) return 0;
    const dates = moods.map(m => m.date).sort();
    let streak = 1, maxStreak = 1;
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]);
      const curr = new Date(dates[i]);
      const diff = (curr - prev) / (1000 * 60 * 60 * 24);
      streak = (diff === 1) ? streak + 1 : 1;
      maxStreak = Math.max(streak, maxStreak);
    }
    return maxStreak;
  };

  const moodToEmoji = (mood) => {
    switch (mood.toLowerCase()) {
      case "happy": return "😊";
      case "sad": return "😢";
      case "neutral": return "😐";
      default: return "❓";
    }
  };

  const getTileContent = ({ date, view }) => {
    if (view === "month") {
      const entry = moods.find(m => m.date === date.toISOString().split("T")[0]);
      return entry ? <span>{moodToEmoji(entry.mood)}</span> : null;
    }
  };

  return (
    <div className="mood-tracker">
      <div className="flex justify-between items-center mb-4">
        <h2 className="title">Mood Tracker</h2>
        <div>
        <button onClick={() => navigate("/moodcalendar")} className="calendar-button">📅 Calendar</button>
          <button onClick={handleAnalysis} className="analysis-button ml-2">📊 Analysis</button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <label>
          Select Your Mood:
          <select value={mood} onChange={(e) => setMood(e.target.value)}>
            <option value="">Choose mood</option>
            <option value="Happy">😊 Happy</option>
            <option value="Neutral">😐 Neutral</option>
            <option value="Sad">😢 Sad</option>
          </select>
        </label>
        <label>
          Notes:
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Write something about your day..."
          ></textarea>
        </label>
        <label>
          Date:
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? "Saving..." : "Save Mood"}
        </button>
      </form>

      <div className="streak-box mt-4">🔥 Current Streak: {getStreak()} days</div>

      {showAnalysis && analysis && (
        <div className="analysis-box mt-4">
          <h3>📊 Analysis</h3>
          <pre>{JSON.stringify(analysis, null, 2)}</pre>
        </div>
      )}

      <div className="mood-history mt-4">
        <h3>📝 Mood History</h3>
        <ul>
          {moods.map((m, i) => (
            <li key={i}>
              <b>{m.date}</b>: {moodToEmoji(m.mood)} - {m.note}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MoodTracker;
