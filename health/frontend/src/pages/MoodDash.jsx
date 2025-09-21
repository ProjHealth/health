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
    happy: "bg-green-100 text-green-800",
    sad: "bg-blue-100 text-blue-800",
    angry: "bg-red-100 text-red-800",
    stressed: "bg-orange-100 text-orange-800",
    anxious: "bg-yellow-100 text-yellow-800",
    calm: "bg-teal-100 text-teal-800",
    excited: "bg-pink-100 text-pink-800",
    confused: "bg-purple-100 text-purple-800",
    neutral: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 space-y-6 px-4">
      <h2 className="text-3xl font-bold text-center text-gray-800">
        Your Mood Dashboard 🌱
      </h2>

      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <MoodInput onMoodLogged={handleMoodLogged} />
      </div>

      {stats?.dominantEmotion && (
        <div
          className={`p-4 rounded-xl shadow text-center font-semibold ${
            emotionColors[stats.dominantEmotion] || "bg-gray-100 text-gray-800"
          }`}
        >
          🌟 Dominant Emotion this week:{" "}
          <span className="capitalize">{stats.dominantEmotion}</span>
        </div>
      )}

      {stats?.streak > 0 && (
        <div className="p-4 text-center rounded-xl bg-green-50 text-green-700 shadow">
          🔥 You're on a {stats.streak}-day positive mood streak!
        </div>
      )}

      {stats?.negStreak >= 3 && (
        <div className="bg-red-100 text-red-700 px-5 py-4 rounded-xl shadow text-center">
          ⚠️ Frequent negative moods detected. Consider mindfulness or reaching out for support.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <EmotionChart key={refresh} />
        <SentimentPieChart data={stats?.sentimentCounts} />
      </div>

      <div className="text-center text-gray-400 text-sm mt-6">
        📊 Trends are based on your last {stats?.moods?.length || 0} entries.
      </div>
    </div>
  );
};

export default MoodDashboard;
