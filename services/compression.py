"""
Scaledown API compression wrapper.
Falls back to basic text shortening if Scaledown is not configured.
"""

import os
import re
import logging
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

try:
    import scaledown
    SCALEDOWN_AVAILABLE = True
except ImportError:
    SCALEDOWN_AVAILABLE = False


def compress(text: str, ratio: float = 0.5) -> dict:
    original_chars  = len(text)
    original_tokens = _estimate_tokens(text)
    api_key         = os.getenv("SCALEDOWN_API_KEY", "")

    if SCALEDOWN_AVAILABLE and api_key and not api_key.startswith("sk-your"):
        try:
            scaledown.set_api_key(api_key)
            compressor      = scaledown.ScaleDownCompressor(compression_ratio=ratio)
            compressed_text = compressor.compress(text)

            compressed_tokens = _estimate_tokens(compressed_text)
            actual_ratio      = round(1 - (compressed_tokens / max(original_tokens, 1)), 3)

            return {
                "compressed_text":  compressed_text,
                "original_chars":   original_chars,
                "compressed_chars": len(compressed_text),
                "original_tokens":  original_tokens,
                "compressed_tokens":compressed_tokens,
                "compression_ratio":actual_ratio,
                "tokens_saved":     original_tokens - compressed_tokens,
                "provider":         "scaledown",
            }
        except Exception as e:
            logger.error(f"Scaledown failed: {e}. Using fallback.")

    compressed_text   = _fallback_compress(text, ratio)
    compressed_tokens = _estimate_tokens(compressed_text)
    actual_ratio      = round(1 - (compressed_tokens / max(original_tokens, 1)), 3)

    return {
        "compressed_text":  compressed_text,
        "original_chars":   original_chars,
        "compressed_chars": len(compressed_text),
        "original_tokens":  original_tokens,
        "compressed_tokens":compressed_tokens,
        "compression_ratio":actual_ratio,
        "tokens_saved":     original_tokens - compressed_tokens,
        "provider":         "fallback",
    }


def _estimate_tokens(text: str) -> int:
    return max(1, len(text) // 4)


def _fallback_compress(text: str, ratio: float) -> str:
    replacements = {
        "University":          "Univ.",
        "Department":          "Dept.",
        "requirement":         "req.",
        "requirements":        "reqs.",
        "extracurricular":     "EC",
        "recommendation":      "rec.",
        "recommendations":     "recs.",
        "standardized test":   "std. test",
        "application deadline":"app. deadline",
        "personal statement":  "PS",
        "strongly recommended":"strongly rec.",
        "is required":         "required",
        "is not required":     "not required",
    }

    result = text
    for phrase, abbrev in replacements.items():
        result = result.replace(phrase, abbrev)

    result = re.sub(r"\n{3,}", "\n\n", result)
    result = re.sub(r"[ \t]+\n", "\n", result)
    result = re.sub(r" {2,}", " ", result)

    target_len = int(len(text) * (1 - ratio + 0.15))
    if len(result) > target_len:
        result = result[:target_len].rsplit("\n", 1)[0] + "\n[...compressed]"

    return result.strip()