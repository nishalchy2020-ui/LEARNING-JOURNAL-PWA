from flask import Flask, request, jsonify, render_template, send_from_directory
import json, os
from datetime import datetime

# --------------------------
# Flask app configuration
# --------------------------
app = Flask(
    __name__,
    template_folder="templates",
    static_folder="static"
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, "backend", "reflections.json")

# ---------- JSON helpers ----------

def load_reflections():
    """Read all reflections from backend/reflections.json."""
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r") as f:
            try:
                return json.load(f)
            except json.JSONDecodeError:
                return []
    return []

def save_reflections(reflections):
    """Write the reflections list back to the JSON file."""
    with open(DATA_FILE, "w") as f:
        json.dump(reflections, f, indent=4)

# ---------- Flask routes ----------

@app.route("/")
def index():
    """Serve the main HTML page."""
    return render_template("index.html")

@app.route("/index.html")
def index_alias():
    return render_template("index.html")

@app.route("/journal.html")
def journal_page():
    return render_template("journal.html")

@app.route("/projects.html")
def projects_page():
    return render_template("projects.html")

@app.route("/about.html")
def about_page():
    return render_template("about.html")

@app.route("/dashboard.html")
def dashboard_page():
    return render_template("dashboard.html")

@app.route("/sw.js")
def sw():
    """Serve service worker."""
    return send_from_directory(app.static_folder, "sw.js")

# ----------------------------
# API Endpoints
# ----------------------------

# GET /reflections -> returns reflections.json as JSON
@app.route("/reflections", methods=["GET"])
def get_reflections():
    reflections = load_reflections()
    return jsonify(reflections)

# POST /add_reflection -> append a new reflection to JSON
@app.route("/add_reflection", methods=["POST"])
def add_reflection():
    data = request.get_json()

    # Build the new reflection object
    new_reflection = {
        "title": data.get("title", "Reflection"),
        "reflection": data.get("reflection", ""),
        "mood": data.get("mood", "Neutral"),
        "date": datetime.now().strftime("%a %b %d %Y"),
        "name": data.get("name", "Nishal")
    }

    # Load existing reflections
    reflections = load_reflections()

    # Append new reflection and save
    reflections.append(new_reflection)
    save_reflections(reflections)

    return jsonify(new_reflection), 201

# ----------------------------
# Run the Flask app
# ----------------------------
if __name__ == "__main__":
    app.run(debug=True)
