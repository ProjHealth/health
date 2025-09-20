import express from "express";
import multer from "multer";
import speech from "@google-cloud/speech";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // Store in memory, no temp file

const client = new speech.SpeechClient();

router.post("/speech-to-text", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No audio file uploaded" });

    // Convert to base64 for Google API
    const audioBytes = req.file.buffer.toString("base64");

    const [response] = await client.recognize({
      audio: { content: audioBytes },
      config: {
        encoding: "LINEAR16", // Change if your frontend records MP3/OGG/WebM
        sampleRateHertz: 16000,
        languageCode: "en-US",
      },
    });

    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join("\n");

    res.json({ transcription });
  } catch (err) {
    console.error("Speech-to-Text error:", err);
    res.status(500).json({ error: "speech_to_text_failed", details: err.message });
  }
});

export default router;
