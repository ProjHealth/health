import mongoose from "mongoose";

const moodEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  inputText: { type: String, required: true },
  emotions: { type: Map, of: Number }, // stores {joy:0.63, sadness:0.15,...}
  sentiment: {
    label: { type: String, required: true },
    score: { type: Number, required: true },
  },
}, { timestamps: true });

export default mongoose.model("MoodEntry", moodEntrySchema);