

from flask import Flask, send_from_directory
from database import engine


app = Flask(__name__)

from api import api

app.register_blueprint(api)




@app.route("/")
def home():
    return send_from_directory(".", "index.html")


@app.route("/<path:filename>")
def files(filename):
    return send_from_directory(".", filename)




if __name__ == "__main__":
    app.run(debug=True)