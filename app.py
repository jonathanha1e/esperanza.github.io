from flask import Flask, render_template, send_from_directory, jsonify, abort
import markdown
import os
import json

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html", title="Herramienta de Inmigración")

@app.route("/faq")
def faq():
    return render_template("markdown.html", md_file="faq.md", title="Preguntas Frecuentes")

@app.route("/audiencia-video")
def audiencia_video():
    return render_template("markdown.html", md_file="audiencia-video.md", title="Audiencia por video")

@app.route("/content/<path:filename>")
def serve_markdown(filename):
    from flask import make_response
    path = os.path.join("content", filename)
    if not os.path.exists(path):
        abort(404)
    with open(path, "r", encoding="utf-8") as f:
        html = markdown.markdown(f.read(), extensions=["extra"])
    response = make_response(html)
    response.headers["Cache-Control"] = "no-store"
    return response

@app.route("/flow")
def flow():
    with open("flow.json") as f:
        data = json.load(f)
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True, port=8080)