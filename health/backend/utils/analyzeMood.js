// backend/utils/analyzeMood.js
import fetch from "node-fetch";

const HF_API_URL = "https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base";
const HF_API_KEY = process.env.HF_API_KEY; // <-- store this in .env file

export async function analyzeMoodWithHF(text) {
  try {
    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: text }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("HF API Error:", error);
      return [];
    }

    const data = await response.json();

    // HF returns: [ [ {label, score}, {label, score} ] ]
    if (!Array.isArray(data) || !Array.isArray(data[0])) {
      console.error("Unexpected HF response format:", data);
      return [];
    }

    return data[0]; // ✅ return array of objects
  } catch (error) {
    console.error("Error calling Hugging Face API:", error);
    return [];
  }
}
