from flask import Flask



app = Flask(__name__)


@app.route("/")
def home():
    return "AK Homes application is running"

if __name__=="__main__":
    app.run(debug=True)