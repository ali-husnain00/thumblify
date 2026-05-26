from config.db import mysql


def save_thumbnail_to_db(user_id, title, style, color_scheme, additional_details, aspect_ratio, image_url, prompt_used):
    cur = mysql.connection.cursor()
    try:
        cur.execute(
            "INSERT INTO thumbnails (user_id, title, style, color_scheme, additional_details, aspect_ratio, image_url, prompt_used) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
            (user_id, title, style, color_scheme, additional_details, aspect_ratio, image_url, prompt_used),
        )
        mysql.connection.commit()
    except Exception as e:
        mysql.connection.rollback()
        raise e
    finally:
        cur.close()
