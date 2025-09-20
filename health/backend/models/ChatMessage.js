// models/ChatMessage.js
import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  sender: { type: String, enum: ["user", "bot"], required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("ChatMessage", chatMessageSchema);
