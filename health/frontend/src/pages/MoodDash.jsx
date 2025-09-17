// frontend/src/pages/MoodDash.jsx
import React, { useState, useEffect } from "react";
import MoodInput from "./MoodInput";
import EmotionChart from "../components/EmotionChart";
import SentimentPieChart from "../components/SentimentPieChart";

const MoodDashboard = () => {
  const [refresh, setRefresh] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleMoodLogged = () => setRefresh((prev) => !prev);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const storedUser = localStorage.getItem("user");
        if (!storedUser) return;

        const { id } = JSON.parse(storedUser);
        const res = await fetch(`http://localhost:5000/api/v1/mood/stats/${id}`);
        const data = await res.json();
        setStats(data);
        console.log("Dominant Emotion:", stats.dominantEmotion);

      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [refresh]);

  if (loading) {
    return <p className="text-center text-gray-500 mt-10">Loading dashboard...</p>;
  }

  const emotionColors = {
    joy: "bg-green-100 text-green-800",
    sadness: "bg-blue-100 text-blue-800",
    anger: "bg-red-100 text-red-800",
    fear: "bg-purple-100 text-purple-800",
    surprise: "bg-yellow-100 text-yellow-800",
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 space-y-6 px-4">
      <h2 className="text-3xl font-bold text-center text-gray-800">
        Your Mood Dashboard
      </h2>

      {/* Mood Input */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <MoodInput onMoodLogged={handleMoodLogged} />
      </div>

      {/* Analytics Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dominant Emotion */}
{stats?.dominantEmotion && (
  <div
    className={`flex items-center justify-center p-4 rounded-xl shadow ${
      emotionColors[stats.dominantEmotion] || "bg-gray-100 text-gray-800"
    }`}
  >
    <p className="text-lg font-semibold">
      🌟 Dominant Emotion this week:{" "}
      <span className="capitalize">{stats.dominantEmotion}</span>
    </p>
  </div>
)}



        {/* Streak Counter */}
        {stats?.streak > 0 && (
          <div className="flex items-center justify-center p-4 rounded-xl shadow bg-green-100 text-green-800">
            🔥 You're on a {stats.streak}-day mood logging streak!
          </div>
        )}
      </div>

      {/* Negative Mood Alert */}
      {stats?.negStreak >= 3 && (
        <div className="bg-red-100 text-red-700 px-5 py-4 rounded-xl shadow text-center">
          ⚠️ We noticed frequent negative moods this week. Consider taking a short break,
          journaling, or talking to someone you trust.
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6">
        <EmotionChart key={refresh} />
        <SentimentPieChart data={stats?.sentimentCounts} />
      </div>

      {/* Optional Footer */}
      <div className="text-center text-gray-500 text-sm mt-6">
        📊 Data shown is from the last 7 days. Keep logging your mood daily to see trends!
      </div>
    </div>
  );
};

export default MoodDashboard;
