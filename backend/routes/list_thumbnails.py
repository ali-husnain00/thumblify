from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required

from config.db import mysql
from utils.auth import get_jwt_user_id
from utils.thumbnail_db import thumbnail_row_to_dict

list_thumbnails_bp = Blueprint("list_thumbnails", __name__)


@list_thumbnails_bp.route("/thumbnail/list", methods=["GET"])
@jwt_required()
def list_thumbnails():
    user_id = get_jwt_user_id()
    cur = mysql.connection.cursor()
    try:
        cur.execute(
            """
            SELECT id, title, style, color_scheme, aspect_ratio, additional_details,
                   image_url, prompt_used, created_at
            FROM thumbnails
            WHERE user_id = %s
            ORDER BY created_at DESC
            """,
            (user_id,),
        )
        rows = cur.fetchall()
        return jsonify({"thumbnails": [thumbnail_row_to_dict(r) for r in rows]}), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch thumbnails.", "detail": str(e)}), 500
    finally:
        cur.close()
