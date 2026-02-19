"""Routes: Chat endpoint."""

from flask import Blueprint, request, jsonify
from services.ai_service import chat as ai_chat
from services.admissions_data import get_program_context_text

chat_bp = Blueprint("chat", __name__)


@chat_bp.route("/api/chat", methods=["POST"])
def handle_chat():
    data = request.get_json(silent=True) or {}
    message = data.get("message", "").strip()
    history = data.get("history", [])
    program_id = data.get("program_id")

    if not message:
        return jsonify({"error": "Message is required"}), 400

    program_context = None
    if program_id:
        program_context = get_program_context_text(program_id)

    result = ai_chat(message, history, program_context)
    return jsonify(result), 200