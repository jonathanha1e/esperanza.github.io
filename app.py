from flask import Flask, render_template, jsonify
import json

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html", title="Immigration Tool")

@app.route("/next")
def next_page():
    return render_template("next.html", title="")

@app.route('/faq')
def faq():
    return render_template('faq.html')

@app.route('/flow')
def flow():
    with open('flow.json') as f:
        data = json.load(f)
    return jsonify(data)

import os

if __name__ == '__main__':
<<<<<<< HEAD
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
=======
    app.run(debug=True, port=5000)
>>>>>>> add move to video page, save other stuff
