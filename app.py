"""
AdmissAI India — Flask entry point.

Start:
  python app.py

Requires .env in project root:
  GROQ_API_KEY=gsk_...
"""

import os
from flask import Flask, render_template
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

from routes.chat import chat_bp
from routes.programs import programs_bp


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

    @app.route("/api/health")
    def health():
        key = os.getenv("GROQ_API_KEY", "")
        has_key = bool(key and key.startswith("gsk_") and len(key) > 20)
        return {
            "status": "ok",
            "service": "AdmissAI India",
            "groq_key_configured": has_key,
        }, 200

    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve_spa(path):
        return render_template("index.html")

    return app


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app  = create_app()
    key  = os.getenv("GROQ_API_KEY", "")
    if key and key.startswith("gsk_"):
        print(f"\n✅ GROQ_API_KEY loaded ({key[:12]}...)")
    else:
        print("\n⚠️  GROQ_API_KEY not found. Add it to your .env file.")
        print("   Get a free key at https://console.groq.com\n")
    print(f"🎓 AdmissAI India running at http://localhost:{port}\n")
    app.run(host="0.0.0.0", port=port, debug=os.getenv("FLASK_DEBUG", "1") == "1")