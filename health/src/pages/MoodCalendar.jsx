import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./MoodTracker.css";

const MoodCalendar = () => {
  const [moods, setMoods] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

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


  // Mood to color mapping (expand as needed)
  const moodToColor = (mood) => {
    switch (mood.toLowerCase()) {
      case "joy":
      case "happy": return "#7be495"; // green
      case "sadness":
      case "sad": return "#7ec4cf"; // blue
      case "anger": return "#f38181"; // red
      case "fear": return "#a28089"; // purple
      case "disgust": return "#f7ce7b"; // yellow
      case "surprise": return "#f7a7a6"; // pink
      case "neutral": return "#e0e0e0"; // gray
      default: return "#cccccc";
    }
  };

  const getTileContent = ({ date, view }) => {
    if (view === "month") {
      const entry = moods.find(m => m.date === date.toISOString().split("T")[0]);
      return entry ? (
        <span
          style={{
            display: "block",
            margin: "0 auto",
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: moodToColor(entry.mood),
          }}
        ></span>
      ) : null;
    }
  };

  // Streak calculation
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

  return (
    <div className="mood-tracker">
      <div className="flex justify-between items-center mb-4">
        <h2 className="title">Emotion Tracker</h2>
        <button onClick={() => navigate(-1)} className="back-button">⬅ Back</button>
      </div>
      <div className="streak-box mt-4">🔥 Current Streak: {getStreak()} days</div>
      <div className="calendar-container mt-4">
        <Calendar tileContent={getTileContent} />
      </div>
      {/* Mood Legend */}
      <div className="legend mt-6 flex flex-wrap gap-4 items-center justify-center">
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ background: '#7be495', width: 12, height: 12, borderRadius: '50%', display: 'inline-block' }}></span> Joy</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ background: '#7ec4cf', width: 12, height: 12, borderRadius: '50%', display: 'inline-block' }}></span> Sadness</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ background: '#f38181', width: 12, height: 12, borderRadius: '50%', display: 'inline-block' }}></span> Anger</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ background: '#a28089', width: 12, height: 12, borderRadius: '50%', display: 'inline-block' }}></span> Fear</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ background: '#f7ce7b', width: 12, height: 12, borderRadius: '50%', display: 'inline-block' }}></span> Disgust</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ background: '#f7a7a6', width: 12, height: 12, borderRadius: '50%', display: 'inline-block' }}></span> Surprise</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ background: '#e0e0e0', width: 12, height: 12, borderRadius: '50%', display: 'inline-block' }}></span> Neutral</span>
      </div>
    </div>
  );
};

export default MoodCalendar;
