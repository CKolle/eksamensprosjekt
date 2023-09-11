from flask import Flask, send_from_directory
from routes import register_routes
import os
import secrets
from utils.init_db import init_db

# Set the working directory to the api folder
os.chdir(os.path.dirname(os.path.abspath(__file__)))


app = Flask(__name__)
app.url_map.strict_slashes = False

# This is a secret key that is used to encrypt the JWT token.
# Users will need to log in again if this is changed.
# It changes every time the server is restarted.
app.config["JWT_SECRET"] = secrets.token_urlsafe(32)
# This is the number of seconds that a JWT token will be valid for.
app.config["JWT_TOKEN_EXPIRES"] = os.environ.get(
    "JWT_TOKEN_EXPIRES", 7200)

register_routes(app)


@app.route('/')
def index():
    return send_from_directory('static', 'index.html')


@app.route('/<path:path>')
def static_proxy(path):
    print("Using static proxy")
    if not os.path.exists(os.path.join('static', path)):
        return send_from_directory('static', 'index.html')
    return send_from_directory('static', path)


if __name__ == '__main__':
    init_db()
    app.run(port=5000)
