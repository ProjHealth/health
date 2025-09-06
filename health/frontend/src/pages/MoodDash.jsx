import React, { useState } from "react";
import MoodInput from "./MoodInput";

const MoodDash = () => {
  const [refresh, setRefresh] = useState(false);

  const handleMoodLogged = () => {
    setRefresh((prev) => !prev); // toggle → trigger chart refresh later
  };

  return (
    <div className="max-w-xl mx-auto mt-6">
      <h2 className="text-xl font-semibold mb-4">Track Your Mood</h2>
      <MoodInput userId="64f0c5a1234567890abcd123" onMoodLogged={handleMoodLogged} />
      {/* Later we’ll add the EmotionChart here */}
    </div>
  );
};

export default MoodDash;
