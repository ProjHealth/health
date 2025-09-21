import { VertexAI } from "@google-cloud/vertexai";

const vertexAI = new VertexAI({
  project: process.env.GOOGLE_CLOUD_PROJECT,
  location: "us-central1",
});

const model = vertexAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function detectEmotionWithGemini(text) {
  try {
    const prompt = `Analyze this text for emotional content.
Return a JSON object with emotions and confidence scores (0-1).
Emotions: [happy, sad, angry, stressed, anxious, calm, excited, confused, neutral].

Example Output:
{"happy":0.7,"sad":0.1,"angry":0.0,"stressed":0.0,"anxious":0.0,"calm":0.2,"excited":0.0,"confused":0.0,"neutral":0.0}

Text: "${text}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const raw = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "{}";
    return JSON.parse(raw);
  } catch (error) {
    console.error("Gemini Emotion Detection Error:", error);
    return { neutral: 1.0 };
  }
}
