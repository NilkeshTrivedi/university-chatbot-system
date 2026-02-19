"""
AI service using Google Gemini to power the college admissions chatbot.
Program guidelines are compressed via Scaledown before injecting into the prompt.
"""

import os
import logging
from dotenv import load_dotenv
from services.compression import compress as scaledown_compress

load_dotenv()

logger = logging.getLogger(__name__)

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

# FIX #9: Maximum history turns to send to Gemini.
# The JS also slices to 12, but we enforce this server-side as well
# to protect against direct API calls or future client changes.
MAX_HISTORY_TURNS = 12

SYSTEM_PROMPT = """You are AdmissAI, an expert college admissions counselor assistant. 
You help students navigate the college application process with confidence and clarity.

Your expertise includes:
- University program requirements (GPA, test scores, essays, recommendations)
- Application strategy and timeline management
- Essay writing guidance and tips
- Interview preparation advice
- Financial aid and scholarship information
- Program comparisons and fit assessment

Guidelines:
- Be encouraging, warm, and actionable — like a knowledgeable mentor.
- Give specific, concrete advice — not generic platitudes.
- If asked about a specific program, reference its actual requirements.
- Keep responses concise but comprehensive (aim for 200-350 words unless more is needed).
- Use bullet points for lists of requirements or steps.
- Always end with an encouraging note or a follow-up question to keep the conversation productive.
- Do NOT make up statistics or requirements. Only reference data you are given.
"""


def chat(message: str, history: list, program_context: str = None) -> dict:
    """
    Generate an AI response to the student's message.

    Args:
        message: The student's current message.
        history: List of {"role": "user"|"assistant", "content": str} dicts.
        program_context: Optional raw program requirements text to inject.

    Returns:
        {
            "reply": str,
            "compression_stats": dict | None,
            "model_used": str
        }
    """
    api_key = os.getenv("AIzaSyCefAAyO_im0GXDeZ6AOl3knhHLsi90IMo", "")
    compression_stats = None
    context_to_inject = ""

    # FIX #9: Enforce history limit server-side regardless of what the client sends.
    history = history[-MAX_HISTORY_TURNS:]

    # ── Compress program context via Scaledown ─────────────────────────────
    if program_context:
        result = scaledown_compress(program_context, ratio=0.45)
        compression_stats = {
            "original_tokens": result["original_tokens"],
            "compressed_tokens": result["compressed_tokens"],
            "compression_ratio": result["compression_ratio"],
            "tokens_saved": result["tokens_saved"],
            "provider": result["provider"],
        }
        context_to_inject = f"""
--- Program Requirements Context (Scaledown compressed: {result['compression_ratio']*100:.1f}% reduction) ---
{result['compressed_text']}
---
"""

    full_system = SYSTEM_PROMPT
    if context_to_inject:
        full_system += f"\n\nCONTEXT FOR THIS CONVERSATION:\n{context_to_inject}"

    if GEMINI_AVAILABLE and api_key and not api_key.startswith("your-gemini"):
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel(
                model_name="gemini-2.0-flash",
                system_instruction=full_system,
            )

            # Build Gemini history format
            gemini_history = []
            for turn in history:
                role = "user" if turn["role"] == "user" else "model"
                gemini_history.append({"role": role, "parts": [turn["content"]]})

            chat_session = model.start_chat(history=gemini_history)
            response = chat_session.send_message(message)
            reply = response.text

            return {
                "reply": reply,
                "compression_stats": compression_stats,
                "model_used": "gemini-1.5-flash",
            }
        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            return {
                "reply": _fallback_response(message, program_context),
                "compression_stats": compression_stats,
                "model_used": "fallback",
            }

    # ── Demo fallback if no API key configured ─────────────────────────────
    return {
        "reply": _fallback_response(message, program_context),
        "compression_stats": compression_stats,
        "model_used": "demo",
    }


def _fallback_response(message: str, program_context: str = None) -> str:
    """Smart rule-based fallback when Gemini API is unavailable."""
    message_lower = message.lower()

    if any(kw in message_lower for kw in ["gpa", "grade"]):
        return (
            "🎓 **GPA Requirements** vary significantly by school:\n\n"
            "- **MIT / Caltech**: 4.0+ unweighted (top 1% of class)\n"
            "- **Stanford / Harvard**: 3.9–4.2 weighted average\n"
            "- **CMU / Columbia**: 3.8–4.0 expected\n\n"
            "Remember: GPA is just one part of a holistic review. "
            "Upward trends and course rigor matter too! 📈\n\n"
            "Would you like advice on a specific school's academic expectations?"
        )
    elif any(kw in message_lower for kw in ["essay", "personal statement", "write"]):
        return (
            "✍️ **Essay Tips for Top Schools**:\n\n"
            "1. **Be specific** – Use concrete anecdotes, not broad claims\n"
            "2. **Show, don't tell** – Let your actions speak for your character\n"
            "3. **Answer the prompt** – Many applicants drift off-topic\n"
            "4. **Start early** – Great essays need 5–10 drafts\n"
            "5. **Get feedback** – From teachers, counselors, AND peers\n\n"
            "The best essays reveal your unique voice and perspective. "
            "What program are you writing for? I can give more targeted advice! 🎯"
        )
    elif any(kw in message_lower for kw in ["deadline", "when", "date"]):
        return (
            "📅 **Key Application Deadlines**:\n\n"
            "| School | EA/ED | Regular Decision |\n"
            "|--------|-------|------------------|\n"
            "| MIT | Nov 1 (EA) | Jan 1 |\n"
            "| Stanford | Nov 1 (REA) | Jan 5 |\n"
            "| Harvard | Nov 1 (RCEA) | Jan 1 |\n"
            "| CMU | Nov 1 (ED) | Jan 2 |\n"
            "| Oxford | Oct 15 (UCAS) | Oct 15 |\n\n"
            "⚠️ Always verify deadlines on the official university website! "
            "Which school's deadlines are most important to you?"
        )
    elif any(kw in message_lower for kw in ["test", "sat", "act", "score"]):
        return (
            "📊 **Test Score Ranges for Top Schools**:\n\n"
            "- **MIT**: SAT 1540–1590 | ACT 34–36\n"
            "- **Stanford**: SAT 1500–1570 | ACT 34–36 (test-optional)\n"
            "- **Harvard**: SAT 1560–1600 | ACT 35–36\n"
            "- **Wharton**: SAT 1450–1570 | ACT 33–35\n"
            "- **CMU CS**: SAT 1530–1590 | ACT 34–36\n\n"
            "💡 Many schools are now test-optional but strong scores still help. "
            "Are you preparing for the SAT or ACT? I can share study resources! 📚"
        )
    elif any(kw in message_lower for kw in ["recommend", "letter", "lor"]):
        return (
            "📝 **Recommendation Letter Strategy**:\n\n"
            "**Who to ask:**\n"
            "- A teacher who knows you deeply (not just your grade)\n"
            "- Preferably from a relevant subject (Math/Science for STEM, English for humanities)\n\n"
            "**How to ask:**\n"
            "1. Ask at least 3 months before deadlines\n"
            "2. Provide a 'brag sheet' — highlights of your work in their class\n"
            "3. Share your college list and application themes\n\n"
            "**Red flags to avoid:**\n"
            "- Never ask teachers who hesitate or seem unenthusiastic\n"
            "- Generic letters are worse than strong specific ones\n\n"
            "Would you like help preparing a brag sheet template? 📋"
        )
    else:
        return (
            "👋 **Welcome to AdmissAI!** I'm your AI college admissions counselor.\n\n"
            "I can help you with:\n"
            "- 📋 **Requirements** – GPA, test scores, essays for any school\n"
            "- ✍️ **Essay Strategy** – Tips for compelling personal statements\n"
            "- 📅 **Deadlines** – Application and decision timelines\n"
            "- 🎯 **Application Planning** – What to prioritize and when\n"
            "- 💡 **School-specific advice** – Tailored to your dream schools\n\n"
            "What would you like to explore first? Select a program from the Programs tab "
            "or ask me anything about the admissions process! 🚀\n\n"
            "*(To get AI-powered responses, add your Gemini API key to the `.env` file.)*"
        )