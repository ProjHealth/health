import express from "express";
import multer from "multer";
import speech from "@google-cloud/speech";

const router = express.Router();
// Multer setup to store the file in memory
// In your speech.js route or wherever Multer is initialized

const upload = multer({ 
    storage: multer.memoryStorage(),
    // 🟢 FIX: Increase the file size limit (e.g., to 10MB)
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Creates a client for the Google Cloud Speech API
const client = new speech.SpeechClient();

router.post("/speech-to-text", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      // This will catch the 'Unexpected end of form' if the frontend didn't send the data correctly.
      console.error("No audio file uploaded or Multer failed to parse.");
      return res.status(400).json({ error: "No audio file uploaded" });
    }

    // Log the received file details for debugging
    console.log(`STT Request received. Mime: ${req.file.mimetype}, Size: ${req.file.size} bytes`);

    // Convert the audio buffer to base64 for the Google API payload
    const audioBytes = req.file.buffer.toString("base64");

    const [response] = await client.recognize({
      audio: { content: audioBytes },
      config: {
        // 🟢 FIX: Set encoding to WEBM_OPUS to match the browser recording format
        encoding: "WEBM_OPUS", 
        // 🟢 FIX: Set sample rate to 48000 Hz, the standard for Opus encoding
        sampleRateHertz: 48000, 
        languageCode: "en-US", // Set your target language
      },
    });

    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join("\n");
      
    res.json({ transcription: transcription || "" });
 // In speech.js
} catch (err) {
  console.error("Speech-to-Text error:", err); // <-- This is what you need to check
  // ... res.status(500) is returned

    // Return a detailed error for better client-side debugging
    res.status(500).json({ error: "speech_to_text_failed", details: err.message });
  }
});

export default router;