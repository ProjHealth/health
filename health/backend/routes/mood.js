import express from 'express';
import MoodEntry from '../models/MoodEntry.js';
import Sentiment from 'sentiment';
import { analyzeMoodWithHF } from "../utils/analyzeMood.js";


const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { userId, inputText } = req.body;

    if (!userId || !inputText) {
      return res.status(400).json({ error: "userId and inputText are required" });
    }

    // 🔥 Call Hugging Face API
    const emotionsArray = await analyzeMoodWithHF(inputText);
    // Convert array to object for easy charting later
  const emotions = Object.fromEntries(
  emotionsArray.map((e) => [e.label.toLowerCase(), e.score])
);

    // Pick dominant emotion (highest score)
    const topEmotion = emotionsArray.reduce((max, cur) =>
      cur.score > max.score ? cur : max
    );

    // Save in DB
    const mood = await MoodEntry.create({
      userId,
      inputText,
      emotions, // full map {joy:0.63, sadness:0.15,...}
      sentiment: {
        label: topEmotion.label,
        score: topEmotion.score,
      },
    });

    res.json({
      id: mood._id,
      createdAt: mood.createdAt,
      emotions,
      sentiment: mood.sentiment,
    });
  } catch (err) {
    console.error("Error saving mood entry:", err);
    res.status(500).json({ error: "Server error" });
  }
});



// Get all moods for a user
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const moods = await MoodEntry.find({ userId })
      .sort({ createdAt: 1 }) // oldest → newest
      .lean();

    return res.json(moods);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});




// GET /api/v1/mood/stats/:userId
router.get("/stats/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch all moods for this user
    const moods = await MoodEntry.find({ userId }).sort({ createdAt: 1 });

    if (!moods.length) {
      return res.json({
        sentimentCounts: {},
        moods: [],
        dominantEmotion: null,
        streak: 0,
        negStreak: 0,
      });
    }

    // --- 1️⃣ Sentiment counts ---
    const sentimentCounts = {};
    moods.forEach((m) => {
      const label = m.sentiment?.label || "neutral";
      sentimentCounts[label] = (sentimentCounts[label] || 0) + 1;

      // Optional: also count individual emotions
      if (m.emotions) {
        for (const [key, value] of Object.entries(Object.fromEntries(m.emotions))) {
          sentimentCounts[key] = (sentimentCounts[key] || 0) + value;
        }
      }
    });

    // --- 2️⃣ Dominant emotion ---
    let emotionTotals = {};
    moods.forEach((m) => {
      if (m.emotions) {
        const emotionsObj = Object.fromEntries(m.emotions); // convert Map to plain object
        for (const [key, value] of Object.entries(emotionsObj)) {
          emotionTotals[key] = (emotionTotals[key] || 0) + Number(value);
        }
      }
    });

    let dominantEmotion = null;
    if (Object.keys(emotionTotals).length > 0) {
      dominantEmotion = Object.keys(emotionTotals).reduce((a, b) =>
        emotionTotals[a] > emotionTotals[b] ? a : b
      );
    }

    // --- 3️⃣ Streak calculations ---
    let streak = 0; // consecutive positive moods
    let negStreak = 0; // consecutive negative moods

    for (let i = moods.length - 1; i >= 0; i--) {
      const label = moods[i].sentiment?.label || "neutral";
      if (label === "positive") streak++;
      else break;
    }

    for (let i = moods.length - 1; i >= 0; i--) {
      const label = moods[i].sentiment?.label || "neutral";
      if (label === "negative") negStreak++;
      else break;
    }

    // --- 4️⃣ Return JSON ---
    res.json({
      sentimentCounts,
      moods,
      dominantEmotion, // ⚡ plain string
      streak,
      negStreak,
    });
  } catch (err) {
    console.error("Error fetching mood stats:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;