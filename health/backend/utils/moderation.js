import { PredictionServiceClient } from '@google-cloud/aiplatform';
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'your-gcp-project-id';
const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
const endpoint = `projects/${projectId}/locations/${location}/publishers/google/models/content-filter-model:predict`;

// 🟢 CRITICAL FIX: Direct authentication from the environment variable with a robust path
const keyPath = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS);
const client = new PredictionServiceClient({
  keyFilename: keyPath,
});

export const moderateMessage = async (req, res, next) => {
  const { content } = req.body;
  
  if (!content) {
    return next();
  }

  const instance = {
    "content": content,
  };
  
  const parameters = {
    "safety_settings": {
      "sexual_content_threshold": "BLOCK_SOME",
      "hate_speech_threshold": "BLOCK_SOME",
      "harassment_threshold": "BLOCK_SOME",
      "violence_threshold": "BLOCK_ALL",
    },
    "classification_threshold": 0.5,
  };

  const request = {
    endpoint,
    instances: [instance],
    parameters: parameters,
  };

  try {
    const [response] = await client.predict(request);
    
    if (response.predictions && response.predictions.length > 0) {
      const safetyAttributes = response.predictions[0].structValue.fields.safetyAttributes.structValue.fields;
      
      const isUnsafe = safetyAttributes.isUnsafe.boolValue;
      const unsafeCategory = safetyAttributes.unsafeCategory.stringValue;
      const confidence = safetyAttributes.confidence.numberValue;

      if (isUnsafe) {
        console.warn(`Blocked message due to unsafe content: ${unsafeCategory} (Confidence: ${confidence})`);
        return res.status(403).json({
          message: `Your message was flagged as potentially unsafe and cannot be posted. Reason: ${unsafeCategory}.`,
        });
      }
    }

    next();

  } catch (err) {
    console.error("Vertex AI Moderation Error:", err);
    return res.status(500).json({ message: "Content moderation service is unavailable. Please try again." });
  }
};
