from flask import Blueprint, request, jsonify
from config.db import mysql
from werkzeug.security import generate_password_hash

register_bp = Blueprint("register", __name__)

@register_bp.route("/register", methods=["POST"])
def register():
    #accept data as formdata only 
    data = request.get_json().get("formData", {})
    if(not data or not data.get("username") or not data.get("email") or not data.get("password")):
        return jsonify({"message": "All fields are required."}), 400
    
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip()
    password = (data.get("password") or "").strip()
    hashed_password = generate_password_hash(password)

    cur = mysql.connection.cursor()
    try:

        #first check if email already exists
        cur.execute("select id from users where email = %s", (email,))
        if cur.fetchone():
            return jsonify({"message": "Email already exists."}), 409

        cur.execute("insert into users (username, email, password) values (%s, %s, %s)", (username, email, hashed_password))
        mysql.connection.commit()
    except Exception as e:
        #if any erros occur, stop the transaction and return error message
        mysql.connection.rollback()
        return jsonify({"message": "Error occurred while registering user."}), 500
    finally:
        cur.close()

    return jsonify({"message": "Registration successful"}), 201