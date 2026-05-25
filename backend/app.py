import vertexai
from vertexai.preview.vision_models import ImageGenerationModel
import os
import re
import uuid
from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from config.db import connect_db, mysql
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from routes.register import register_bp
from routes.login import login_bp
from routes.logout import logout_bp
from routes.get_user import get_user_bp
from prompts.thumbnail_prompts import (
    build_base_prompt,
    get_color_block,
    get_style_block,
)
from services.prompt_engineer import enhance_thumbnail_prompt
from services.save_thumbnail import save_thumbnail_to_db

load_dotenv()

app = Flask(__name__)
CORS(app)
connect_db(app)  # this function connects to database

#google application credentials
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "key.json"

# initialize vertex ai
vertexai.init(project="xoro-492310", location="us-central1")

jwt = JWTManager(app)  # initialize JWT manager for handling auth

app.config["JWT_SECRET_KEY"] = os.getenv(
    "JWT_SECRET_KEY"
)  # should be set in .env for production

# folders for saved images (same folder as this file)
this_folder = os.path.dirname(os.path.abspath(__file__)) # returns the directory of the current file
uploads_folder = os.path.join(this_folder, "uploads") # joining uploads folder to the current folder
thumbnails_folder = os.path.join(uploads_folder, "thumbnails") # joining thumbnails folder to the uploads folder
os.makedirs(thumbnails_folder, exist_ok=True) # create thumbnails folder if it doesn't exist

# pick image size from aspect ratio string the frontend sends
ratio_sizes = {
    "16:9": (1280, 720),
    "1:1": (1024, 1024),
    "9:16": (720, 1280),
}


@app.route("/")
def index():
    return "Hello, World!"


app.register_blueprint(register_bp, url_prefix="/api")  # register route
app.register_blueprint(login_bp, url_prefix="/api")  # login route
app.register_blueprint(logout_bp, url_prefix="/api")  # logout route
app.register_blueprint(get_user_bp, url_prefix="/api")  # get user data route


@app.route("/api/thumbnail/generate", methods=["POST"])
@jwt_required()
def generate_thumbnail():

    # get frontend data
    body = request.get_json()
    user = get_jwt_identity()

    # check if user id is valid
    if not user:
        return jsonify({"message": "User not found."}), 404

    if body is None:
        body = {}

    title = (body.get("title") or "").strip()
    style = (body.get("style") or "").strip()
    color_scheme = (body.get("colorScheme") or "").strip()
    additional_prompt = (body.get("additionalDetails") or "").strip()

    # aspect ratio from frontend
    ratio_key = (body.get("aspect_ratio") or body.get("aspectRatio") or "16:9").strip()

    # Fallback validation for ratio
    if ratio_key not in ratio_sizes:
        ratio_key = "16:9"

    if not title:
        return jsonify({"error": "Title is required."}), 400

    style_block = get_style_block(style)
    color_block = get_color_block(color_scheme)

    base_prompt = build_base_prompt(
        title, style_block, color_block, additional_prompt, ratio_key
    )

    enhanced_prompt = enhance_thumbnail_prompt(
        title=title,
        style=style,
        color_description=color_block,
        additional_details=additional_prompt,
        aspect_ratio=ratio_key,
        base_prompt=base_prompt,
    )

    extra_block = ""
    if additional_prompt:
        extra_block = f"\nAdditional details: {additional_prompt}"

    final_prompt = f"""{enhanced_prompt}

Main title on thumbnail (exact text, large and bold):
"{title}"

Subtitle: If the title benefits from a short hook or context line, render one smaller subtitle (3-8 words) inferred from the title topic — e.g. benefit, timeframe, difficulty, or series tag. Place it below or near the main title. If the title is already short and complete, omit the subtitle.
{extra_block}

Requirements:
- Viral YouTube thumbnail quality
- Main title must be the largest, most readable text on the image
- Optional subtitle only when it adds clarity; never duplicate the full title as subtitle
- No hex codes, color codes, RGB values, watermarks, or random caption text
- Strong focal subject, cinematic lighting, high contrast
- Professional broadcast-safe composition
"""

    # Strip hex codes so Imagen does not render them as on-image text
    final_prompt = re.sub(r"#(?:[0-9A-Fa-f]{3,8})\b", "", final_prompt)

    try:
        # load the newer, active Imagen 3 model
        model = ImageGenerationModel.from_pretrained("imagen-4.0-generate-001")
        # generate image using the new model endpoint
        images = model.generate_images(
            prompt=final_prompt, number_of_images=1, aspect_ratio=ratio_key
        )

        # first generated image
        image = images[0]

        # unique image name
        filename = uuid.uuid4().hex + ".png"

        # full save path
        user_folder = os.path.join(thumbnails_folder, user[0])
        os.makedirs(user_folder, exist_ok=True)
        save_path = os.path.join(user_folder, filename)

        # save image to user's folder
        image.save(location=save_path)

        # public image url
        base_url = request.host_url.rstrip("/")

        image_url = base_url + "/uploads/thumbnails/" + user[0] + "/" + filename

        save_thumbnail_to_db(user[0], title, style, color_scheme, additional_prompt, ratio_key, image_url, final_prompt)

        return jsonify(
            {
                "message": "Thumbnail generated successfully",
                "title": title,
                "style": style,
                "color_scheme": color_scheme,
                "additional_prompt": additional_prompt,
                "aspect_ratio": ratio_key,
                "image_url": image_url,
                "prompt_used": final_prompt,
                "base_prompt": base_prompt,
                "persisted": True,
            }
        )

    except Exception as e:
        return jsonify({"error": "Image generation failed", "detail": str(e)}), 500


@app.route("/api/thumbnail/save", methods=["POST"])
def save_thumbnail():
    if "file" not in request.files:
        return jsonify({"error": 'Missing multipart field "file".'}), 400
    upload = request.files["file"]

    if upload.filename == "":
        return jsonify({"error": "Empty file."}), 400

    new_name = uuid.uuid4().hex + ".png"

    save_path = os.path.join(thumbnails_folder, new_name)
    try:
        upload.save(save_path)

    except Exception as e:
        return jsonify({"error": "Failed to save file: " + str(e)}), 500

    part = os.path.join("thumbnails", new_name).replace("\\", "/")
    base_url = request.host_url.rstrip("/")
    image_url = base_url + "/uploads/" + part

    return jsonify(
        {
            "message": "Thumbnail saved successfully",
            "image_url": image_url,
            "persisted": True,
        }
    )


def _thumbnail_row_to_dict(row):
    created = row[8]
    if hasattr(created, "isoformat"):
        created = created.isoformat()
    return {
        "id": row[0],
        "title": row[1],
        "style": row[2],
        "color_scheme": row[3],
        "aspect_ratio": row[4],
        "additional_details": row[5] or "",
        "image_url": row[6],
        "prompt_used": row[7] or "",
        "created_at": created,
    }


@app.route("/api/thumbnail/list", methods=["GET"])
@jwt_required()
def list_thumbnails():
    user = get_jwt_identity()
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
            (user[0],),
        )
        rows = cur.fetchall()
        return jsonify({"thumbnails": [_thumbnail_row_to_dict(r) for r in rows]}), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch thumbnails.", "detail": str(e)}), 500
    finally:
        cur.close()


@app.route("/api/thumbnail/<int:thumb_id>", methods=["GET"])
@jwt_required()
def get_thumbnail(thumb_id):
    user = get_jwt_identity()
    cur = mysql.connection.cursor()
    try:
        cur.execute(
            """
            SELECT id, title, style, color_scheme, aspect_ratio, additional_details,
                   image_url, prompt_used, created_at
            FROM thumbnails
            WHERE id = %s AND user_id = %s
            """,
            (thumb_id, user[0]),
        )
        row = cur.fetchone()
        if not row:
            return jsonify({"error": "Thumbnail not found."}), 404
        thumb = _thumbnail_row_to_dict(row)
        thumb["persisted"] = True
        return jsonify(thumb), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch thumbnail.", "detail": str(e)}), 500
    finally:
        cur.close()


@app.route("/api/thumbnail/<int:thumb_id>/delete", methods=["GET"])
def delete_thumbnail(thumb_id):
    return jsonify({"message": "Thumbnail deleted successfully"})


@app.route("/uploads/<path:filename>")
def serve_uploads(filename):
    filename = filename.replace("\\", "/")  # cross-platform fallback path adjustment
    response = send_from_directory(uploads_folder, filename)
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response


if __name__ == "__main__":
    app.run(debug=True)
