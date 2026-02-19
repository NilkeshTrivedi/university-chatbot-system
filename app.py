"""
Flask application entry point for the College Admissions Assistant.
"""

import os
from flask import Flask, render_template
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

from routes.chat import chat_bp
from routes.programs import programs_bp
from routes.compress import compress_bp
from routes.checklist import checklist_bp


def create_app() -> Flask:
    app = Flask(
        __name__,
        template_folder="templates",
        static_folder="static",
    )
    app.config["JSON_SORT_KEYS"] = False

    CORS(app, resources={r"/api/*": {"origins": "*"}})

    app.register_blueprint(chat_bp)
    app.register_blueprint(programs_bp)
    app.register_blueprint(compress_bp)
    app.register_blueprint(checklist_bp)

    @app.route("/api/health")
    def health():
        return {"status": "ok", "service": "College Admissions Assistant API"}, 200

    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve_spa(path):
        return render_template("index.html")

    return app


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app = create_app()
    print(f"\n🎓 College Admissions Assistant running at http://localhost:{port}\n")
    app.run(host="0.0.0.0", port=port, debug=os.getenv("FLASK_DEBUG", "1") == "1")