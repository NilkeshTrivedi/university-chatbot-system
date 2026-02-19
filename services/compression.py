"""
Scaledown API compression wrapper.
Compresses text to reduce token usage while preserving semantic meaning.
"""

import os
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Attempt to import scaledown; gracefully degrade if not installed / key missing
try:
    import scaledown
    SCALEDOWN_AVAILABLE = True
except ImportError:
    SCALEDOWN_AVAILABLE = False
    logger.warning("scaledown package not installed. Compression will be simulated.")


def compress(text: str, ratio: float = 0.5) -> dict:
    """
    Compress text using the Scaledown API.

    Returns:
        {
            "compressed_text": str,
            "original_chars": int,
            "compressed_chars": int,
            "original_tokens": int (estimated),
            "compressed_tokens": int (estimated),
            "compression_ratio": float,
            "tokens_saved": int,
            "provider": str  ("scaledown" | "fallback")
        }
    """
    original_chars = len(text)
    original_tokens = _estimate_tokens(text)

    api_key = os.getenv("SCALEDOWN_API_KEY", "")

    if SCALEDOWN_AVAILABLE and api_key and not api_key.startswith("sk-your"):
        try:
            scaledown.set_api_key(api_key)
            compressor = scaledown.ScaleDownCompressor(compression_ratio=ratio)
            compressed_text = compressor.compress(text)

            compressed_chars = len(compressed_text)
            compressed_tokens = _estimate_tokens(compressed_text)
            actual_ratio = round(1 - (compressed_tokens / max(original_tokens, 1)), 3)
            tokens_saved = original_tokens - compressed_tokens

            return {
                "compressed_text": compressed_text,
                "original_chars": original_chars,
                "compressed_chars": compressed_chars,
                "original_tokens": original_tokens,
                "compressed_tokens": compressed_tokens,
                "compression_ratio": actual_ratio,
                "tokens_saved": tokens_saved,
                "provider": "scaledown",
            }
        except Exception as e:
            # FIX #2: Log the specific exception class so API mismatches are visible.
            logger.error(
                "Scaledown compression failed (%s: %s). Falling back to local compressor.",
                type(e).__name__,
                e,
            )

    # ── Fallback: intelligent text shortening ──────────────────────────────
    compressed_text = _fallback_compress(text, ratio)
    compressed_chars = len(compressed_text)
    compressed_tokens = _estimate_tokens(compressed_text)
    actual_ratio = round(1 - (compressed_tokens / max(original_tokens, 1)), 3)
    tokens_saved = original_tokens - compressed_tokens

    return {
        "compressed_text": compressed_text,
        "original_chars": original_chars,
        "compressed_chars": compressed_chars,
        "original_tokens": original_tokens,
        "compressed_tokens": compressed_tokens,
        "compression_ratio": actual_ratio,
        "tokens_saved": tokens_saved,
        "provider": "fallback",
    }


def _estimate_tokens(text: str) -> int:
    """Rough token estimation: ~4 chars per token (GPT-style)."""
    return max(1, len(text) // 4)


def _fallback_compress(text: str, ratio: float) -> str:
    """
    Intelligent fallback compression:
    - Remove duplicate whitespace
    - Abbreviate common long phrases

    FIX #3: Removed the hard truncation that was silently cutting structured
    content (program requirements). The AI needs the full context to give
    accurate answers. Abbreviations alone reduce tokens meaningfully without
    destroying information.
    """
    import re

    replacements = {
        "University": "Univ.",
        "Department": "Dept.",
        "requirement": "req.",
        "requirements": "reqs.",
        "extracurricular": "EC",
        "recommendation": "rec.",
        "recommendations": "recs.",
        "standardized test": "std. test",
        "application deadline": "app. deadline",
        "personal statement": "PS",
        "strongly recommended": "strongly rec.",
        "is required": "required",
        "is not required": "not required",
        "highly recommended": "highly rec.",
        "competitive programming": "comp. prog.",
        "research experience": "research exp.",
    }

    result = text
    for phrase, abbrev in replacements.items():
        result = result.replace(phrase, abbrev)

    # Remove multiple blank lines
    result = re.sub(r"\n{3,}", "\n\n", result)
    # Remove trailing spaces on each line
    result = re.sub(r"[ \t]+\n", "\n", result)
    # Collapse multiple spaces
    result = re.sub(r" {2,}", " ", result)

    return result.strip()