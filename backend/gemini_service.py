import os
import requests
from typing import List, Dict, Any, Optional

def call_gemini(
    message: str,
    role: str,
    user_name: str,
    location: str,
    language: str,
    history: Optional[List[Dict[str, Any]]] = None
) -> str:
    """
    Calls the Google Gemini API using the official REST specification.
    Passes authentication via the secure x-goog-api-key header to prevent key leakage in URLs.
    """
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not configured on the server.")

    # Allow model override via env var, defaulting to fast and reliable gemini-3.5-flash-lite tier
    model = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite").strip()
    # Official Google Generative Language API endpoint (header-based authentication)
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

    # Build system instructions to maintain the AgriBridge persona
    system_instruction = (
        f"You are AgroSmart AI — a helpful assistant for an Indian agriculture + crop waste marketplace platform.\n"
        f"The user is {f'a farmer named {user_name} from {location}' if role == 'farmer' else f'an industry buyer from {location}'}.\n"
        f"The user prefers the {language} language. IMPORTANT: YOUR ENTIRE RESPONSE MUST BE IN THE {language} LANGUAGE!\n"
        f"Help with: crop waste buying/selling, crop recommendations, market prices in ₹, weather tips, government schemes.\n"
        f"Be warm, practical, and concise (2–4 sentences max). Use ₹ for currency."
    )

    # Format multi-turn conversation contents
    contents = []
    if history:
        for turn in history[-6:]:  # Keep recent turns for context
            turn_from = turn.get("from")
            turn_text = turn.get("text", "").strip()
            if not turn_text:
                continue
            if turn_from == "user":
                contents.append({"role": "user", "parts": [{"text": turn_text}]})
            elif turn_from == "bot":
                contents.append({"role": "model", "parts": [{"text": turn_text}]})

    # Add the current user turn
    contents.append({"role": "user", "parts": [{"text": message}]})

    payload = {
        "contents": contents,
        "systemInstruction": {
            "parts": [{"text": system_instruction}]
        },
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 600,
            "topP": 0.95
        }
    }

    # Pass the key via x-goog-api-key header; never expose in query string
    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": api_key
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=20)
    except requests.exceptions.Timeout:
        raise TimeoutError("The AI service took too long to respond. Please try again.")
    except requests.exceptions.ConnectionError:
        raise ConnectionError("Unable to reach the AI service network. Please check internet access on the server.")
    except Exception as e:
        raise RuntimeError(f"Network error while connecting to AI service: {type(e).__name__}")

    if response.status_code != 200:
        if response.status_code == 400:
            raise ValueError("Invalid request format or unsupported parameter sent to Gemini API.")
        elif response.status_code in (401, 403):
            raise PermissionError("Authentication error: The Gemini API key is invalid or unauthorized.")
        elif response.status_code == 404:
            raise LookupError(f"The specified model '{model}' was not found. Please verify GEMINI_MODEL.")
        elif response.status_code == 429:
            raise ResourceWarning("Gemini API rate limit or quota exceeded. Please wait a moment before trying again.")
        elif response.status_code >= 500:
            raise RuntimeError("Google Gemini service is temporarily unavailable. Please try again shortly.")
        else:
            raise RuntimeError(f"Gemini API returned unexpected status {response.status_code}.")

    try:
        data = response.json()
    except Exception:
        raise RuntimeError("Received invalid non-JSON response from Gemini API.")

    candidates = data.get("candidates", [])
    if not candidates:
        # Check if response was blocked by safety filters
        prompt_feedback = data.get("promptFeedback", {})
        block_reason = prompt_feedback.get("blockReason")
        if block_reason:
            return "I apologize, but I cannot answer this request due to content safety policies."
        raise RuntimeError("No generation candidate returned by Gemini API.")

    parts = candidates[0].get("content", {}).get("parts", [])
    if not parts or "text" not in parts[0]:
        raise RuntimeError("Malformed response payload from Gemini API.")

    return parts[0]["text"].strip()
