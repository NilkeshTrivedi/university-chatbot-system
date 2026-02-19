"""
AI service using Groq API via direct HTTP requests.
No groq SDK needed — only 'requests' which is already installed.

KEY FLOW:
  .env file → GROQ_API_KEY=gsk_xxx
      ↓ (auto-loaded by load_dotenv())
  os.getenv("GROQ_API_KEY") reads it here
      ↓
  sent as Bearer token to Groq's API
  
You ONLY put the key in .env. Nowhere else.
"""

import os
import logging
import requests as http
from dotenv import load_dotenv
from services.compression import compress as scaledown_compress

load_dotenv()

logger = logging.getLogger(__name__)

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL   = "llama-3.3-70b-versatile"

SYSTEM_PROMPT = """You are AdmissAI, a friendly and knowledgeable assistant. You are an expert college admissions counselor but you can also answer general questions on any topic.

For college admissions topics, your expertise includes:
- University program requirements (GPA, test scores, essays, recommendations)
- Application strategy and timeline management
- Essay writing guidance and tips
- Interview preparation advice
- Financial aid and scholarship information
- Program comparisons and fit assessment

For general questions, answer helpfully and accurately like a knowledgeable friend would.

Guidelines:
- Be warm, encouraging, and conversational.
- Give specific, concrete answers — not vague platitudes.
- Use bullet points for lists and steps.
- For college questions, always reference actual requirements when provided.
- Do NOT make up statistics. Only use data you are given.
- End responses with something helpful — a tip, a follow-up question, or an encouragement.
"""


def chat(message: str, history: list, program_context: str = None) -> dict:
    """
    Send a message to Groq and get a response.

    Args:
        message:         User's current message
        history:         Past messages [{"role": "user"|"assistant", "content": str}]
        program_context: Optional university program data to inject

    Returns:
        {"reply": str, "compression_stats": dict|None, "model_used": str}
    """

    # ── Step 1: Get API key from environment ──────────────────────────────
    api_key = os.getenv("GROQ_API_KEY", "").strip()

    # ── Step 2: Validate the key before doing anything ────────────────────
    if not api_key:
        return {
            "reply": (
                "⚠️ **Setup needed:** `GROQ_API_KEY` is missing from your `.env` file.\n\n"
                "1. Go to https://console.groq.com and sign up (free)\n"
                "2. Create an API key\n"
                "3. Add this line to your `.env` file:\n"
                "```\nGROQ_API_KEY=gsk_your_actual_key_here\n```\n"
                "4. Restart the server with `python app.py`"
            ),
            "compression_stats": None,
            "model_used": "error",
        }

    if "your" in api_key.lower() or "placeholder" in api_key.lower() or len(api_key) < 20:
        return {
            "reply": (
                "⚠️ **Setup needed:** Your `GROQ_API_KEY` in `.env` still looks like a placeholder.\n\n"
                "Replace it with your real key from https://console.groq.com\n\n"
                "A real Groq key looks like: `gsk_AbCdEf123456...`"
            ),
            "compression_stats": None,
            "model_used": "error",
        }

    # ── Step 3: Compress program context if a program is selected ─────────
    compression_stats = None
    context_block     = ""

    if program_context:
        result = scaledown_compress(program_context, ratio=0.45)
        compression_stats = {
            "original_tokens":   result["original_tokens"],
            "compressed_tokens": result["compressed_tokens"],
            "compression_ratio": result["compression_ratio"],
            "tokens_saved":      result["tokens_saved"],
            "provider":          result["provider"],
        }
        context_block = (
            f"\n\n--- University Program Data "
            f"(Scaledown compressed {result['compression_ratio']*100:.0f}%) ---\n"
            f"{result['compressed_text']}\n---"
        )

    # ── Step 4: Build the messages array ──────────────────────────────────
    system_content = SYSTEM_PROMPT + context_block

    messages = [{"role": "system", "content": system_content}]

    # Append past conversation (keep last 10 turns to avoid token overflow)
    for turn in history[-10:]:
        role    = turn.get("role", "user")
        content = turn.get("content", "").strip()
        if role in ("user", "assistant") and content:
            messages.append({"role": role, "content": content})

    # Append the current user message
    messages.append({"role": "user", "content": message})

    # ── Step 5: Call Groq API ─────────────────────────────────────────────
    try:
        resp = http.post(
            GROQ_API_URL,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type":  "application/json",
            },
            json={
                "model":       GROQ_MODEL,
                "messages":    messages,
                "max_tokens":  1024,
                "temperature": 0.7,
            },
            timeout=30,
        )

        # ── Step 6: Handle API errors with clear messages ─────────────────
        if resp.status_code == 401:
            return {
                "reply": (
                    "⚠️ **Invalid API Key (401):** Groq rejected your key.\n\n"
                    "- Open your `.env` file\n"
                    "- Make sure `GROQ_API_KEY` is your real key from https://console.groq.com\n"
                    "- Restart the server after saving"
                ),
                "compression_stats": compression_stats,
                "model_used": "error",
            }

        if resp.status_code == 429:
            return {
                "reply": "⚠️ **Rate limit reached.** You've hit Groq's free tier limit. Wait a minute and try again.",
                "compression_stats": compression_stats,
                "model_used": "error",
            }

        if not resp.ok:
            return {
                "reply": f"⚠️ **Groq API Error {resp.status_code}:**\n```\n{resp.text}\n```",
                "compression_stats": compression_stats,
                "model_used": "error",
            }

        # ── Step 7: Extract and return the reply ──────────────────────────
        data  = resp.json()
        reply = data["choices"][0]["message"]["content"]

        return {
            "reply":             reply,
            "compression_stats": compression_stats,
            "model_used":        f"groq/{GROQ_MODEL}",
        }

    except http.exceptions.ConnectionError:
        return {
            "reply": "⚠️ **No internet connection.** Cannot reach Groq API. Check your network and try again.",
            "compression_stats": compression_stats,
            "model_used": "error",
        }

    except http.exceptions.Timeout:
        return {
            "reply": "⚠️ **Request timed out.** Groq took too long to respond. Try again in a moment.",
            "compression_stats": compression_stats,
            "model_used": "error",
        }

    except Exception as e:
        logger.error(f"Groq unexpected error: {e}", exc_info=True)
        return {
            "reply": f"⚠️ **Unexpected error:** `{str(e)}`\n\nCheck your terminal for the full traceback.",
            "compression_stats": compression_stats,
            "model_used": "error",
        }