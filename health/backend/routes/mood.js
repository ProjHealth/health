import express from 'express';
import MoodEntry from '../models/MoodEntry.js';
import Sentiment from 'sentiment';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { userId, inputText = '', manualMood = null } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const entry = await MoodEntry.create({ userId, inputText, manualMood });

    analyzeAndUpdate(entry._id, inputText).catch(err => console.error(err));

    return res.status(201).json({ id: entry._id, createdAt: entry.createdAt });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
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




async function analyzeAndUpdate(entryId, text) {
  const sentiment = new Sentiment();
  const analysis = sentiment.analyze(text || '');
  const raw = analysis.score || 0;
  const score = Math.max(-1, Math.min(1, raw / 10));
  const label = score > 0.1 ? 'positive' : score < -0.1 ? 'negative' : 'neutral';

  const t = (text || '').toLowerCase();
  const emotions = {
    stress: /stress|anx|anxiety|overwhelmed/.test(t) ? 0.85 : 0,
    joy: /happy|joy|excited|good/.test(t) ? 0.8 : 0,
    sadness: /sad|down|depress/.test(t) ? 0.8 : 0,
    anger: /angry|mad|furious/.test(t) ? 0.8 : 0,
    fear: /scared|afraid|terrified/.test(t) ? 0.75 : 0,
    calm: /calm|relax|peace/.test(t) ? 0.8 : 0,
    surprise: /surpris|unexpected/.test(t) ? 0.6 : 0,
    disgust: /disgust|gross/.test(t) ? 0.6 : 0
  };

  const highRisk = (label === 'negative' && emotions.stress > 0.7) || raw <= -6;

  await MoodEntry.findByIdAndUpdate(entryId, {
    sentiment: { score, label },
    emotions,
    flags: { highRisk }
  });
}

export default router;