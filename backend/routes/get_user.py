from flask import Blueprint, jsonify
from config.db import mysql
from flask_jwt_extended import get_jwt_identity, jwt_required

get_user_bp = Blueprint("get_user", __name__)

@get_user_bp.route("/user", methods=["GET"])
@jwt_required()
def get_user():
    user_id = get_jwt_identity()
    try:
        cur = mysql.connection.cursor()
        cur.execute("select id, username, email from users where id = %s", (user_id,))
        user = cur.fetchone()
        if not user:
            return jsonify({"message": "User not found."}), 404
    except Exception as e:
        return jsonify({"message": "Error occurred while fetching user data."}), 500
    finally:
        cur.close()

    return jsonify({"id": user[0], "username": user[1], "email": user[2]}), 200