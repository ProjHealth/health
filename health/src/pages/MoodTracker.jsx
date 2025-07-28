import React, { useState } from "react";
import { db } from "../firebase/firebase"; // Ensure correct path
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import "./MoodTracker.css"; // Import the CSS file

const MoodTracker = () => {
  const [mood, setMood] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState("");



  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (!user) {
      alert("You need to be logged in to save moods.");
      return;
    }
    
  
    if (!mood || !notes || !date) {
      alert("Please enter mood, note, and date before submitting.");
      return;
    }
    console.log("Logged-in User ID:", user.uid); 
  
    try {
      await addDoc(collection(db, "moods"), {
        userId: user.uid,  // 🔹 Save the logged-in user's UID
        mood,
        note: notes,
        date,
        timestamp: serverTimestamp(),
      });
  
      alert("Mood entry added successfully!");
      setMood("");
      setNotes("");
      setDate("");
    } catch (error) {
      console.error("Error adding document:", error);
      alert("Error saving mood. Please try again.");
    }
  };
  

  return (
    <div className="mood-tracker">
      <h2 className="title">Mood Tracker</h2>
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

        <button type="submit" className="submit-button">Save Mood</button>
      </form>
    </div>
  );
};

export default MoodTracker;