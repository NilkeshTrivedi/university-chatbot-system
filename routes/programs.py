"""Routes: Programs endpoints."""

from flask import Blueprint, request, jsonify
from services.admissions_data import get_all_programs, get_program, get_program_context_text, CATEGORIES
from services.compression import compress

programs_bp = Blueprint("programs", __name__)


@programs_bp.route("/api/programs", methods=["GET"])
def list_programs():
    query = request.args.get("q", "").lower()
    category = request.args.get("category", "All")

    programs = get_all_programs()

    if query:
        programs = [
            p for p in programs
            if query in p["university"].lower()
            or query in p["program"].lower()
            or query in p["short_name"].lower()
        ]

    if category and category != "All":
        programs = [p for p in programs if p["category"] == category]

    return jsonify({"programs": programs, "categories": CATEGORIES, "total": len(programs)}), 200


@programs_bp.route("/api/programs/<program_id>", methods=["GET"])
def get_program_detail(program_id):
    program = get_program(program_id)
    if not program:
        return jsonify({"error": "Program not found"}), 404

    # Compress the full context text and include it
    context_text = get_program_context_text(program_id)
    compression_result = compress(context_text)

    return jsonify({
        "program": program,
        "context_text": context_text,
        "compression": {
            "original_tokens": compression_result["original_tokens"],
            "compressed_tokens": compression_result["compressed_tokens"],
            "compression_ratio": compression_result["compression_ratio"],
            "tokens_saved": compression_result["tokens_saved"],
            "provider": compression_result["provider"],
        }
    }), 200
