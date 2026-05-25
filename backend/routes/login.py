from flask import Blueprint, request, jsonify
from config.db import mysql
from werkzeug.security import check_password_hash
from flask_jwt_extended import create_access_token
from datetime import timedelta

login_bp = Blueprint("login", __name__)

@login_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json().get("formData", {})
    if(not data or not data.get("email") or not data.get("password")):
        return jsonify({"message": "Email and password are required."}), 400
    
    email = (data.get("email") or "").strip()
    password = (data.get("password") or "").strip()
    cur = mysql.connection.cursor()
    try:
        cur.execute("select id, password from users where email = %s", (email,))
        user = cur.fetchone()
        if not user or not check_password_hash(user[1], password):
            return jsonify({"message": "Invalid email or password."}), 401
    except Exception as e:
        return jsonify({"message": "Error occurred while logging in."}), 500
    finally:       
        cur.close()

    user_id = str(user[0])  
    token = create_access_token(identity=(user_id), expires_delta=timedelta(days=1))

    return jsonify({"message": "Login successful", "token": token}), 200