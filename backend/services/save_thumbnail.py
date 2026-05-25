from config.db import mysql
from flask import jsonify
from vertexai.vision_models import Image
import os
import shutil   

def save_thumbnail_to_db(user_id, title, style, color_scheme, additional_details, aspect_ratio, image_url, prompt_used):
    cur = mysql.connection.cursor()
    try:
        cur.execute("insert into thumbnails (user_id, title, style, color_scheme, additional_details, aspect_ratio, image_url, prompt_used) values (%s, %s, %s, %s, %s, %s, %s, %s)", (user_id, title, style, color_scheme, additional_details, aspect_ratio, image_url, prompt_used))
        mysql.connection.commit()
        return jsonify({"message": "Thumbnail saved successfully."}), 200
    except Exception as e:
        mysql.connection.rollback()
        return jsonify({"message": "Error occurred while saving thumbnail." + str(e)}), 500
    finally:
        cur.close()
