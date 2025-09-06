import React, { useState } from "react";
import MoodInput from "./MoodInput";
import EmotionChart from "../components/EmotionChart";

const MoodDashboard = () => {
  const [refresh, setRefresh] = useState(false);

  const handleMoodLogged = () => {
    setRefresh((prev) => !prev); // trigger refresh
  };

  return (
    <div className="max-w-xl mx-auto mt-6">
      <h2 className="text-xl font-semibold mb-4">Track Your Mood</h2>
      <MoodInput onMoodLogged={handleMoodLogged} />
      <EmotionChart key={refresh} /> {/* re-render when mood added */}
    </div>
  );
};

export default MoodDashboard;
