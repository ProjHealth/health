// frontend/src/pages/MoodDashboard.jsx
import React, { useState, useEffect } from "react";
import MoodInput from "./MoodInput";
import EmotionChart from "../components/EmotionChart";
import SentimentPieChart from "../components/SentimentPieChart";
import "./MoodDashboard.css";

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
        console.log("Dominant Emotion:", data?.dominantEmotion);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [refresh]);

  if (loading) {
    return (
      <div className="loading-spinner">
        Loading your mood dashboard...
      </div>
    );
  }

  return (
    <div className="mood-dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <h2 className="dashboard-title">Your Mood Dashboard</h2>
        <p className="dashboard-subtitle">
          Track your emotional journey and discover patterns in your wellbeing
        </p>
      </div>

      {/* Mood Input Card */}
      <div className="mood-input-card dashboard-card">
        <MoodInput onMoodLogged={handleMoodLogged} />
      </div>

      {/* Analytics Badges Grid */}
      <div className="analytics-grid">
        {/* Dominant Emotion Badge */}
        {stats?.dominantEmotion && (
          <div className={`emotion-badge emotion-${stats.dominantEmotion}`}>
            <div className="flex items-center justify-center">
<div
  style={{
    margin: "1.5rem 0",
    background: "linear-gradient(135deg, #fce4ec, #fff9c4, #e1f5fe)", // softer pastel gradient
    backgroundSize: "200% 200%",
    padding: "1.5rem",
    borderRadius: "18px",
    textAlign: "center",
    color: "#4b5563", // soft gray
    position: "relative",
    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.05)", // lighter shadow
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
    e.currentTarget.style.boxShadow = "0 12px 28px rgba(0, 0, 0, 0.15)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.08)";
  }}
>
  <p style={{ fontSize: "1rem", fontWeight: 600, opacity: 0.9, marginBottom: "0.5rem" }}>
    Dominant Emotion This Week
  </p>
  <p
    style={{
      fontSize: "1.6rem",
      fontWeight: 800,
      letterSpacing: "0.5px",
      textTransform: "capitalize",
      color: "#da892cff", // soft purple accent
      textShadow: "0 2px 6px rgba(255, 19, 19, 0.15)",
    }}
  >
    {stats.dominantEmotion} 
  </p>
</div>

            </div>
          </div>
        )}

        {/* Streak Counter Badge */}
        {stats?.streak > 0 && (
          <div className="emotion-badge streak-badge">
            <div className="flex items-center justify-center">
              <span className="mr-2" style={{ fontSize: '1.5rem' }}>🔥</span>
              <div>
                <p className="font-semibold">Mood Logging Streak</p>
                <p className="text-lg font-bold">
                  {stats.streak} {stats.streak === 1 ? 'day' : 'days'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Total Entries Badge */}
        {stats?.totalEntries && (
          <div className="emotion-badge" style={{
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)',
            color: '#4f46e5',
            border: '1px solid #c7d2fe'
          }}>
            <div className="flex items-center justify-center">
              <span className="mr-2" style={{ fontSize: '1.5rem' }}>📊</span>
              <div>
                <p className="font-semibold">Total Mood Entries</p>
                <p className="text-lg font-bold">{stats.totalEntries}</p>
              </div>
            </div>
          </div>
        )}

        {/* Weekly Progress Badge */}
        {stats?.weeklyProgress && (
          <div className="emotion-badge" style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            color: '#059669',
            border: '1px solid #bbf7d0'
          }}>
            <div className="flex items-center justify-center">
              <span className="mr-2" style={{ fontSize: '1.5rem' }}>📈</span>
              <div>
                <p className="font-semibold">This Week's Progress</p>
                <p className="text-lg font-bold">{stats.weeklyProgress}%</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Negative Mood Alert */}
      {stats?.negStreak >= 3 && (
        <div className="mood-alert">
          <div className="flex items-center justify-center mb-2">
            <span style={{ fontSize: '2rem', marginRight: '0.5rem' }}>⚠️</span>
            <h3 className="text-lg font-bold">Wellbeing Check-in</h3>
          </div>
          <p className="mb-2">
            We've noticed some challenging emotions this week. Remember, it's okay to have difficult days.
          </p>
          <p className="text-sm">
            Consider taking a short break, practicing mindfulness, journaling, or reaching out to someone you trust.
          </p>
        </div>
      )}

      {/* Charts Section */}
      <div className="charts-container">
        <div className="chart-card">
          <h3 className="chart-title">Emotion Trends Over Time</h3>
          <EmotionChart key={refresh} />
        </div>
        
        <div className="chart-card">
          <h3 className="chart-title">Sentiment Distribution</h3>
          <SentimentPieChart data={stats?.sentimentCounts} />
        </div>
      </div>

      {/* Motivational Quote or Tip */}
      {stats && (
        <div className="dashboard-card" style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
          borderLeft: '4px solid #8b5cf6'
        }}>
<div
  style={{
    margin: "2rem 0",
    padding: "1.5rem",
    borderRadius: "18px",
    background: "linear-gradient(135deg, #e0f2fe, #fef9c3, #fce7f3)",
    backgroundSize: "200% 200%",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
    textAlign: "center",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
    e.currentTarget.style.boxShadow = "0 12px 28px rgba(0,0,0,0.15)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.08)";
  }}
>
  <span
    style={{
      fontSize: "2.5rem",
      display: "block",
      marginBottom: "0.5rem",
      animation: "pulseGlow 3s infinite ease-in-out",
    }}
  >
    💡
  </span>
  <h3
    style={{
      fontSize: "1.2rem",
      fontWeight: 700,
      color: "#374151",
      marginBottom: "0.75rem",
      background: "linear-gradient(90deg, #f472b6, #8b5cf6)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    }}
  >
    Daily Wellness Tip
  </h3>
  <p
    style={{
      fontSize: "1rem",
      lineHeight: "1.6",
      color: "#4b5563",
      fontStyle: "italic",
    }}
  >
    "Every emotion you feel is valid. Your mental health journey is unique, 
    and taking time to understand your feelings is a sign of strength."
  </p>
</div>

        </div>
      )}

      {/* Footer */}
      <div className="dashboard-footer">
        <span style={{ fontSize: '1.25rem', marginRight: '0.5rem' }}>📊</span>
        Data shown reflects your mood patterns from the last 7 days. 
        Keep logging daily to discover meaningful insights about your emotional wellbeing!
      </div>
    </div>
  );
};

export default MoodDashboard;