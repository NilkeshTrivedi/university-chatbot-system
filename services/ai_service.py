"""
AI service using Groq API to power the college admissions chatbot.
Program guidelines are compressed via Scaledown before injecting into the prompt.

HOW THE API KEY WORKS:
  - You only need to put GROQ_API_KEY in your .env file
  - python-dotenv loads it automatically when the app starts
  - os.getenv("GROQ_API_KEY") reads it here — you never hardcode it anywhere
"""

import os
import logging
from dotenv import load_dotenv
from services.compression import compress as scaledown_compress

load_dotenv()

logger = logging.getLogger(__name__)

# ── Try importing Groq ─────────────────────────────────────────────────────
try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False
    logger.warning("groq package not installed. Run: pip install groq")

# ── Model to use ───────────────────────────────────────────────────────────
# Groq's fastest & free models (pick one):
#   "llama3-8b-8192"       → fastest, good quality
#   "llama3-70b-8192"      → slower, better quality
#   "mixtral-8x7b-32768"   → large context window
#   "gemma2-9b-it"         → Google's Gemma via Groq
GROQ_MODEL = "llama3-8b-8192"

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
    Generate an AI response to the student's message using Groq.

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
    # ── Read API key from environment (set once in .env, never hardcode) ──
    api_key = os.getenv("GROQ_API_KEY", "")

    compression_stats = None
    context_to_inject = ""

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
--- Program Requirements Context (compressed {result['compression_ratio']*100:.1f}% via Scaledown) ---
{result['compressed_text']}
---
"""

    # Build the full system prompt (with optional program context appended)
    full_system = SYSTEM_PROMPT
    if context_to_inject:
        full_system += f"\n\nCONTEXT FOR THIS CONVERSATION:\n{context_to_inject}"

    # ── Try Groq API ───────────────────────────────────────────────────────
    if GROQ_AVAILABLE and api_key and not api_key.startswith("gsk_your"):
        try:
            client = Groq(api_key=api_key)

            # Build messages array for Groq (OpenAI-compatible format)
            # Structure: [system] + [history turns] + [current user message]
            messages = [{"role": "system", "content": full_system}]

            # Add conversation history (skip last item if it's the current message)
            for turn in history:
                role = turn.get("role", "user")
                content = turn.get("content", "")
                # Groq only accepts "user" or "assistant" roles
                if role in ("user", "assistant") and content:
                    messages.append({"role": role, "content": content})

            # Add the current user message
            messages.append({"role": "user", "content": message})

            response = client.chat.completions.create(
                model=GROQ_MODEL,
                messages=messages,
                max_tokens=1024,
                temperature=0.7,
            )

            reply = response.choices[0].message.content

            return {
                "reply": reply,
                "compression_stats": compression_stats,
                "model_used": f"groq/{GROQ_MODEL}",
            }

        except Exception as e:
            logger.error(f"Groq API error: {e}")
            # Show real error in debug mode so you can fix it
            if os.getenv("FLASK_DEBUG", "0") == "1":
                return {
                    "reply": f"⚠️ Groq API Error: {str(e)}\n\nCheck your GROQ_API_KEY in the .env file.",
                    "compression_stats": compression_stats,
                    "model_used": "error",
                }
            return {
                "reply": _fallback_response(message, program_context),
                "compression_stats": compression_stats,
                "model_used": "fallback",
            }

    # ── No API key configured → show helpful message ───────────────────────
    if not api_key or api_key.startswith("gsk_your"):
        logger.warning("GROQ_API_KEY not set or still has placeholder value in .env")

    return {
        "reply": _fallback_response(message, program_context),
        "compression_stats": compression_stats,
        "model_used": "demo",
    }


def _fallback_response(message: str, program_context: str = None) -> str:
    """Smart rule-based fallback when Groq API is unavailable."""
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
            "*(To get AI-powered responses, add your Groq API key to the `.env` file as GROQ_API_KEY)*"
        )