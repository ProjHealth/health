import express from "express";
import mongoose from "mongoose";
import ChatMessage from "../models/ChatMessage.js";
import { GoogleGenAI } from "@google/genai";

const router = express.Router();

const genAI = new GoogleGenAI({
  vertexai: true,
  project: process.env.GOOGLE_CLOUD_PROJECT,
  location: process.env.GOOGLE_CLOUD_LOCATION,
});

const MODEL = process.env.GENAI_MODEL || "gemini-2.0-flash";

// POST /api/chatbot
router.post("/", async (req, res) => {
  try {
    const { userId, text } = req.body;

    if (!userId || !text) {
      return res.status(400).json({ error: "userId and text are required" });
    }

    // Validate and convert userId to ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // 1️⃣ Save user message
    await ChatMessage.create({
      userId: userObjectId,
      text,
      sender: "user",
    });

    // 2️⃣ Fetch conversation history for this user
    const historyDocs = await ChatMessage.find({ userId: userObjectId })
      .sort({ timestamp: 1 })
      .lean();

    const history = historyDocs.map((m) => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }));

    // 3️⃣ Create chat session with history
    const chatSession = genAI.chats.create({
      model: MODEL,
      history,
    });

    // 4️⃣ Send message to Gemini
    const result = await chatSession.sendMessage({ message: text });
    const reply = result.text || "I’m here to listen. Can you share a bit more?";

    // 5️⃣ Save bot reply
    await ChatMessage.create({
      userId: userObjectId,
      text: reply,
      sender: "bot",
    });

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "chat_failed", detail: err.message });
  }
});

export default router;
