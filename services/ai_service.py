"""
AI service — Groq API via HTTP.

Setup:
  1. Create a .env file in the project root
  2. Add:  GROQ_API_KEY=gsk_your_actual_key_here
  3. Run:  python app.py

The key is read once from environment. No changes needed anywhere else.
"""

import os
import logging
import requests as http
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

GROQ_URL   = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"

SYSTEM_PROMPT = """You are AdmissAI India — a knowledgeable, warm assistant for Indian college admissions.

Your expertise:
- Indian UG and PG admissions: B.Tech, BCA, BBA, B.Com, B.Sc, B.A, MBA, MCA, M.Tech, MBBS, LLB, B.Pharm
- Entrance exams: JEE Main, JEE Advanced, NEET, CAT, GATE, CLAT, CUET, BITSAT
- Colleges: IITs, NITs, IIMs, NLUs, AIIMS, BITS Pilani, VIT, SRM, Symbiosis, Parul, Marwadi, and others
- Eligibility, cutoffs, fees, placements, scholarships, career paths

You also answer general knowledge questions accurately.

Guidelines:
- Be specific and direct. Give real numbers, real cutoffs, real exam names.
- Use Rs. for Indian fees and salaries (or the rupee symbol if rendering supports it).
- Use bullet points for lists. Bold key terms with **text**.
- Never make up statistics. If unsure, say so honestly.
- End with something useful: a next step, a tip, or a follow-up question.
"""


def chat(message: str, history: list, program_context: str = None) -> dict:
    """
    Send a message to Groq and return the reply.

    Args:
        message:         The user's latest message (NOT already in history)
        history:         Previous turns only: [{"role": "user"|"assistant", "content": str}, ...]
                         Do NOT include the current message in history.
        program_context: Optional extra context string about a selected college/program

    Returns:
        {"reply": str, "model_used": str}
    """
    api_key = os.getenv("GROQ_API_KEY", "").strip()

    if not api_key:
        return {
            "reply": (
                "**GROQ_API_KEY is missing from your .env file.**\n\n"
                "Fix it in 3 steps:\n"
                "1. Create a `.env` file in the project root\n"
                "2. Add this line:  `GROQ_API_KEY=gsk_your_key_here`\n"
                "3. Get your free key at https://console.groq.com\n"
                "4. Restart the server: `python app.py`"
            ),
            "model_used": "error",
        }

    if not api_key.startswith("gsk_") or len(api_key) < 20:
        return {
            "reply": (
                "**GROQ_API_KEY looks invalid.**\n\n"
                "Real Groq keys start with `gsk_` and are ~50 characters long.\n"
                "Check your `.env` file and get a fresh key at https://console.groq.com"
            ),
            "model_used": "error",
        }

    # Build system prompt, optionally injecting program context
    system = SYSTEM_PROMPT
    if program_context:
        system += f"\n\n--- Selected Program Context ---\n{program_context}\n---"

    # Build messages array: system -> history -> current message
    # history contains ONLY previous completed turns.
    messages = [{"role": "system", "content": system}]

    for turn in history[-10:]:
        role    = turn.get("role", "").strip()
        content = turn.get("content", "").strip()
        if role in ("user", "assistant") and content:
            messages.append({"role": role, "content": content})

    messages.append({"role": "user", "content": message})

    try:
        resp = http.post(
            GROQ_URL,
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

        if resp.status_code == 401:
            return {
                "reply": (
                    "**Invalid API key (401 error).**\n\n"
                    "Groq rejected the key in your `.env` file.\n"
                    "- Get a fresh key at https://console.groq.com\n"
                    "- Update `GROQ_API_KEY` in `.env`\n"
                    "- Restart: `python app.py`"
                ),
                "model_used": "error",
            }

        if resp.status_code == 429:
            return {
                "reply": "**Rate limit reached.** Groq's free tier has per-minute limits. Wait 30 seconds and try again.",
                "model_used": "error",
            }

        if not resp.ok:
            logger.error(f"Groq error {resp.status_code}: {resp.text}")
            return {
                "reply": f"**Groq API error {resp.status_code}.** Check your terminal for details.",
                "model_used": "error",
            }

        data  = resp.json()
        reply = data["choices"][0]["message"]["content"]
        return {"reply": reply, "model_used": f"groq/{GROQ_MODEL}"}

    except http.exceptions.ConnectionError:
        return {"reply": "**No connection.** Cannot reach Groq API. Check your internet.", "model_used": "error"}
    except http.exceptions.Timeout:
        return {"reply": "**Timeout.** Groq took too long to respond. Try again in a moment.", "model_used": "error"}
    except Exception as e:
        logger.error(f"Groq unexpected error: {e}", exc_info=True)
        return {"reply": f"**Unexpected error:** {e}\n\nCheck your terminal.", "model_used": "error"}