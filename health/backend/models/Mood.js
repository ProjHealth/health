import mongoose from "mongoose";

const moodSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  mood: { type: String, required: true },
  note: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("Mood", moodSchema);
