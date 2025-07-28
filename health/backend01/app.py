from flask import Flask, request, jsonify, session
import google.generativeai as genai
from flask_cors import CORS
import os
import logging
import json
from flask_session import Session  # Corrected import


app = Flask(__name__)
CORS(app, supports_credentials=True)  # Enable Cross-Origin Requests with credentials

# Configure server-side session
app.config["SESSION_TYPE"] = "filesystem"
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_USE_SIGNER"] = True
app.secret_key = os.getenv("FLASK_SECRET_KEY", "f2c4b8d9e07b4c1a9f54d3b2a7e8c6d5")

Session(app)  # Corrected Session initialization

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Configure Gemini API
API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyAaxhIVp0jv2wic7hQ9HhO9F5mLjAp8K04")  # Replace with your actual API key
genai.configure(api_key=API_KEY)

# Initialize models - Use try/except to handle any initialization errors
try:
    custom_model = genai.GenerativeModel("tunedModels/aifriend-rfjxfr6qbusu")  # Use a valid model
    base_model = genai.GenerativeModel("gemini-pro")  # Base Gemini model

    # Try to load a custom tuned model
    try:
        custom_model = genai.GenerativeModel("tunedModels/aifriend-rfjxfr6qbusu")
        logging.info("Custom model loaded successfully")
    except Exception as e:
        logging.warning(f"Could not load custom model, using base model instead: {e}")

except Exception as e:
    logging.error(f"Error initializing models: {e}")

def is_out_of_scope(response):
    """Check if the response from the custom model is irrelevant or empty."""
    if not hasattr(response, 'text') or not response.text:
        return True

    response_text = response.text.strip()
    out_of_scope_phrases = [
        "I don't know",
        "I cannot assist",
        "I'm unable to respond",
        "I'm not sure I understand"
    ]

    return not response_text or any(phrase in response_text for phrase in out_of_scope_phrases)

def format_chat_history(history):
    """Format history to match Gemini API requirements."""
    formatted_history = []
    for message in history:
        if message.get("role") in ["user", "model"]:
            formatted_history.append(message)
    return formatted_history

@app.route("/")
def home():
    return "Chatbot API is running!"

@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.json
        user_message = data.get("message", "").strip()

        if not user_message:
            return jsonify({"response": "Please enter a message."})

        # Initialize chat history if it doesn't exist
        if "history" not in session:
            session["history"] = [
                {
                    "role": "user",
                    "parts": [
                        {
                            "text": (
                                "You are a friendly, warm, and empathetic AI friend 😊. "
                                "Always respond in a supportive and encouraging way. "
                                "Use emojis to express emotions and keep the conversation positive."
                            )
                        }
                    ]
                }
            ]

        # Append user message to history
        session["history"].append({"role": "user", "parts": [{"text": user_message}]})

        # Format history for the API
        formatted_history = format_chat_history(session["history"])
        logging.debug(f"Formatted history: {json.dumps(formatted_history, indent=2)}")

        # Try with custom model first
        try:
            response = custom_model.generate_content(formatted_history)
            ai_response = response.text.strip() if hasattr(response, 'text') else ""
            logging.debug(f"Custom model response: {ai_response}")

            # If response is empty or out of scope, try base model
            if is_out_of_scope(response):
                logging.info("Custom model response was out of scope, trying base model")
                response = base_model.generate_content(formatted_history)
                ai_response = response.text.strip() if hasattr(response, 'text') else ""
                logging.debug(f"Base model response: {ai_response}")
        except Exception as model_error:
            logging.error(f"Error with custom model: {model_error}")
            # Fallback to base model
            try:
                response = base_model.generate_content(formatted_history)
                ai_response = response.text.strip() if hasattr(response, 'text') else ""
                logging.debug(f"Fallback base model response: {ai_response}")
            except Exception as base_error:
                logging.error(f"Error with base model: {base_error}")
                return jsonify({
                    "response": "I'm having trouble connecting right now. Please try again in a moment! 😊"
                })

        # If we still don't have a valid response
        if not ai_response:
            ai_response = "I'm here to chat! What would you like to talk about? 😊"

        # Append AI response to history
        session["history"].append({"role": "model", "parts": [{"text": ai_response}]})
        session.modified = True  # Mark session as modified

        return jsonify({"response": ai_response})

    except Exception as e:
        logging.error(f"Unexpected error: {e}", exc_info=True)
        return jsonify({
            "response": "Oops! Something went wrong 😢. But don't worry, I'm here to help! Try again. 🙌"
        })

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
