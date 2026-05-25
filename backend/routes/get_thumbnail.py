from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required

from config.db import mysql
from utils.auth import get_jwt_user_id
from utils.thumbnail_db import thumbnail_row_to_dict

get_thumbnail_bp = Blueprint("get_thumbnail", __name__)


@get_thumbnail_bp.route("/thumbnail/<int:thumb_id>", methods=["GET"])
@jwt_required()
def get_thumbnail(thumb_id):
    user_id = get_jwt_user_id()
    cur = mysql.connection.cursor()
    try:
        cur.execute(
            """
            SELECT id, title, style, color_scheme, aspect_ratio, additional_details,
                   image_url, prompt_used, created_at
            FROM thumbnails
            WHERE id = %s AND user_id = %s
            """,
            (thumb_id, user_id),
        )
        row = cur.fetchone()
        if not row:
            return jsonify({"error": "Thumbnail not found."}), 404
        thumb = thumbnail_row_to_dict(row)
        thumb["persisted"] = True
        return jsonify(thumb), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch thumbnail.", "detail": str(e)}), 500
    finally:
        cur.close()
