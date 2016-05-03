from flask import Flask, request, render_template
import json
application = Flask(__name__)

@application.route("/")
def hello():
    return render_template("start.html")

@application.route("/freq_by_time", methods=["POST"])
def freq_by_time():
    #text = request.form["text"]
    return json.dumps({"status": "OK", "text":"fuck", "stupid":"worldstar"})

if __name__ == "__main__":
    application.debug = True
    application.run(host='0.0.0.0')
