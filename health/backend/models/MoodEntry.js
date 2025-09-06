import mongoose from 'mongoose';
const { Schema } = mongoose;

const EmotionSchema = new Schema({
  joy: { type: Number, default: 0 },
  sadness: { type: Number, default: 0 },
  anger: { type: Number, default: 0 },
  fear: { type: Number, default: 0 },
  surprise: { type: Number, default: 0 },
  disgust: { type: Number, default: 0 },
  stress: { type: Number, default: 0 },
  calm: { type: Number, default: 0 }
}, { _id: false });

const SentimentSchema = new Schema({
  score: { type: Number, default: null },
  label: { type: String, enum: ['positive','neutral','negative', null], default: null }
}, { _id: false });

const MoodEntrySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  inputText: { type: String, default: '' },
  manualMood: { type: String, default: null },
  sentiment: { type: SentimentSchema, default: {} },
  emotions: { type: EmotionSchema, default: {} },
  flags: {
    highRisk: { type: Boolean, default: false }
  }
}, { timestamps: true });

export default mongoose.model('MoodEntry', MoodEntrySchema);
