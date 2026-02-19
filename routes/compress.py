"""Routes: Raw compression endpoint."""

from flask import Blueprint, request, jsonify
from services.compression import compress

compress_bp = Blueprint("compress", __name__)


@compress_bp.route("/api/compress", methods=["POST"])
def compress_text():
    data = request.get_json(silent=True) or {}
    text = data.get("text", "").strip()
    ratio = float(data.get("ratio", 0.45))

    if not text:
        return jsonify({"error": "text field is required"}), 400

    if not (0.1 <= ratio <= 0.9):
        return jsonify({"error": "ratio must be between 0.1 and 0.9"}), 400

    result = compress(text, ratio)
    return jsonify(result), 200
