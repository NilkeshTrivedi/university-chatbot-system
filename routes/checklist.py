"""Routes: Application checklist endpoint."""

from flask import Blueprint, jsonify
from services.admissions_data import get_program

checklist_bp = Blueprint("checklist", __name__)


@checklist_bp.route("/api/checklist/<program_id>", methods=["GET"])
def get_checklist(program_id):
    program = get_program(program_id)
    if not program:
        return jsonify({"error": "Program not found"}), 404

    items = []
    for i, item in enumerate(program.get("checklist", []), start=1):
        items.append({
            "id": f"{program_id}-{i}",
            "task": item,
            "category": _categorize(item),
        })

    return jsonify({
        "program_id": program_id,
        "university": program["university"],
        "program": program["program"],
        "deadline": program["application_deadline"],
        "items": items,
        "total": len(items),
    }), 200


def _categorize(task: str) -> str:
    task_lower = task.lower()
    if any(w in task_lower for w in ["essay", "statement", "write", "answer"]):
        return "Essays"
    elif any(w in task_lower for w in ["recommendation", "reference"]):
        return "Recommendations"
    elif any(w in task_lower for w in ["test", "sat", "act", "toefl", "ielts", "lnat", "score"]):
        return "Testing"
    elif any(w in task_lower for w in ["transcript", "grade", "academic"]):
        return "Academics"
    elif any(w in task_lower for w in ["fee", "pay", "submit", "complete", "application"]):
        return "Application"
    elif any(w in task_lower for w in ["interview"]):
        return "Interviews"
    else:
        return "Other"
