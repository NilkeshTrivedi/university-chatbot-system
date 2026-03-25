"""
Route: /api/chat
Handles AI chat with history and optional program context.
"""

from flask import Blueprint, request, jsonify
from services.ai_service import chat as ai_chat
from services.admissions_data import get_program_context_text

chat_bp = Blueprint("chat", __name__)


@chat_bp.route("/api/chat", methods=["POST"])
def handle_chat():
    data    = request.get_json(silent=True) or {}
    message = data.get("message", "").strip()

    # history = previous completed turns ONLY (not including current message)
    history    = data.get("history", [])
    program_id = data.get("program_id")

    if not message:
        return jsonify({"error": "message is required"}), 400

    program_context = get_program_context_text(program_id) if program_id else None
    result = ai_chat(message, history, program_context)
    return jsonify(result), 200