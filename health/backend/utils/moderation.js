import { PredictionServiceClient } from '@google-cloud/aiplatform';
import dotenv from "dotenv";

dotenv.config();

// 🟢 FIX: Using the variable names from your .env file
const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'your-gcp-project-id';
const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
const publisher = 'google';
const model = 'content-filter-model'; // The ID for the content filter model

// Creates a client for the Vertex AI Prediction Service
const client = new PredictionServiceClient();

export const moderateMessage = async (req, res, next) => {
  const { content } = req.body;
  
  if (!content) {
    return next(); // Nothing to moderate, move on.
  }

  const endpoint = `projects/${projectId}/locations/${location}/publishers/${publisher}/models/${model}`;
  
  const instance = {
    "content": content,
  };
  
  const parameters = {
    "safety_settings": {
      "sexual_content_threshold": "BLOCK_SOME",
      "hate_speech_threshold": "BLOCK_SOME",
      "harassment_threshold": "BLOCK_SOME",
      "violence_threshold": "BLOCK_ALL"
    },
    "classification_threshold": 0.5,
  };

  const request = {
    endpoint,
    instances: [instance],
    parameters: parameters, // Using the updated parameters object
  };

  try {
    const [response] = await client.predict(request);
    
    // The response contains an array of predictions, one per instance
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

    // If no unsafe content is found, continue to the next middleware
    next();

  } catch (err) {
    console.error("Vertex AI Moderation Error:", err);
    // If the moderation API fails, you can either block the message (for safety) 
    // or allow it (for availability). Here, we allow it to prevent service disruption.
    next();
  }
};
