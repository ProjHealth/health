import express from "express";
import Mood from "../models/Mood.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware to verify JWT
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// Add a new mood entry
router.post("/", authMiddleware, async (req, res) => {
  const { mood, note, date } = req.body;
  if (!mood || !note || !date) return res.status(400).json({ message: "All fields required" });
  try {
    const newMood = new Mood({
      userId: req.userId,
      mood,
      note,
      date,
    });
    await newMood.save();
    res.status(201).json(newMood);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all moods for the logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const moods = await Mood.find({ userId: req.userId }).sort({ date: 1 });
    res.json(moods);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

import axios from "axios";

// Analysis endpoint: send moods to Python service
router.get("/analysis", authMiddleware, async (req, res) => {
  try {
    const moods = await Mood.find({ userId: req.userId }).sort({ date: 1 });
    const notes = moods.map(m => m.note);
    const moodLabels = moods.map(m => m.mood);
    // Call Python microservice
    const pyRes = await axios.post("http://localhost:8000/analyze", {
      notes,
      moods: moodLabels
    });
    res.json(pyRes.data);
  } catch (err) {
    res.status(500).json({ message: "Analysis error", error: err.message });
  }
});

export default router;
