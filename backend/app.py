import os

import vertexai
from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from config.db import connect_db
from config.paths import ensure_upload_dirs
from routes.generate_thumbnail import generate_thumbnail_bp
from routes.get_thumbnail import get_thumbnail_bp
from routes.get_user import get_user_bp
from routes.list_thumbnails import list_thumbnails_bp
from routes.login import login_bp
from routes.logout import logout_bp
from routes.register import register_bp
from routes.uploads import uploads_bp

load_dotenv()

app = Flask(__name__)
CORS(app)
connect_db(app)

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "/etc/secrets/key.json" # change this line to os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "key.json" in development mode
vertexai.init(project="xoro-492310", location="us-central1")

jwt = JWTManager(app)
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")

ensure_upload_dirs()

app.register_blueprint(register_bp, url_prefix="/api")
app.register_blueprint(login_bp, url_prefix="/api")
app.register_blueprint(logout_bp, url_prefix="/api")
app.register_blueprint(get_user_bp, url_prefix="/api")
app.register_blueprint(generate_thumbnail_bp, url_prefix="/api")
app.register_blueprint(list_thumbnails_bp, url_prefix="/api")
app.register_blueprint(get_thumbnail_bp, url_prefix="/api")
app.register_blueprint(uploads_bp)


@app.route("/")
def index():
    return jsonify({"message": "Thumblify API is running."})


if __name__ == "__main__":
    app.run(debug=True)
