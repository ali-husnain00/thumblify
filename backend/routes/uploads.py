from flask import Blueprint, send_from_directory

from config.paths import UPLOADS_FOLDER

uploads_bp = Blueprint("uploads", __name__)


@uploads_bp.route("/uploads/<path:filename>")
def serve_uploads(filename):
    filename = filename.replace("\\", "/")
    response = send_from_directory(UPLOADS_FOLDER, filename)
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response
