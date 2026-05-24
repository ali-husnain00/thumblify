import base64
import io
import os
import uuid
from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from huggingface_hub import InferenceClient
from PIL import Image
from config.db import connect_db, mysql
from flask_jwt_extended import JWTManager
from routes.register import register_bp
from routes.login import login_bp
from routes.logout import logout_bp
from routes.get_user import get_user_bp

load_dotenv()


app = Flask(__name__)
CORS(app)
connect_db(app) # this function connects to database

jwt = JWTManager(app)  # initialize JWT manager for handling auth

app.config["JWT_SECRET_KEY"] = os.getenv(
    "JWT_SECRET_KEY"
)  # should be set in .env for production


# folders for saved images (same folder as this file)
this_folder = os.path.dirname(os.path.abspath(__file__))
uploads_folder = os.path.join(this_folder, "uploads")
thumbnails_folder = os.path.join(uploads_folder, "thumbnails")
os.makedirs(thumbnails_folder, exist_ok=True)

# AI model on Hugging Face
flux_model = "black-forest-labs/FLUX.1-schnell"

# pick image size from aspect ratio string the frontend sends
ratio_sizes = {
    "16:9": (1280, 720),
    "1:1": (1024, 1024),
    "9:16": (720, 1280),
}

# Prepended to every image prompt so the model paints only a scene/backplate (text is a frontend overlay).
BACKGROUND_ONLY_PREFIX = (
    "YouTube thumbnail BACKGROUND PLATE ONLY. Absolutely no text, no letters, no numbers, "
    "no captions, no subtitles, no logos containing text, no watermarks, no UI mockups with labels, "
    "no typography of any kind. Leave generous clear negative space so a title can be placed later. "
    "Scene and atmosphere: "
)

@app.route("/")
def index():
    return "Hello, World!"

app.register_blueprint(register_bp, url_prefix="/api")  # resgister route
app.register_blueprint(login_bp, url_prefix="/api")  # login route
app.register_blueprint(logout_bp, url_prefix="/api")  # logout route
app.register_blueprint(get_user_bp, url_prefix="/api")  # get user data route


@app.route("/api/thumbnail/generate", methods=["POST"])
def generate_thumbnail():
    body = request.get_json()
    if body is None:
        body = {}
    title = (body.get("title") or "").strip()
    additional_details = (body.get("additionalDetails") or "").strip()
    style = (body.get("style") or "").strip()
    color_scheme = (body.get("colorScheme") or "").strip()
    prompt = (body.get("prompt") or "").strip()
    ratio_key = (body.get("aspect_ratio") or body.get("aspectRatio") or "").strip()

    if ratio_key in ratio_sizes:
        width, height = ratio_sizes[ratio_key]
    else:
        ratio_key = "16:9"
        width, height = ratio_sizes["16:9"]

    if not title or not style or not color_scheme or not prompt:
        return jsonify({"error": "Missing required fields in request body."}), 400

    api_key = os.getenv("HUGGINGFACE_API_KEY")

    if not api_key:
        return (
            jsonify({"error": "HUGGINGFACE_API_KEY is not configured in backend .env"}),
            500,
        )

    client = InferenceClient(token=api_key)

    negative = (
        "text, letters, words, numbers, captions, subtitles, typography, watermark, "
        "gibberish symbols, logo with text, speech bubbles with text, signs with readable text"
    )

    image_prompt = BACKGROUND_ONLY_PREFIX + prompt

    try:
        result = client.text_to_image(
            image_prompt,
            model=flux_model,
            width=width,
            height=height,
            negative_prompt=negative,
        )

    except Exception as e:
        return (
            jsonify(
                {
                    "error": "Hugging Face image generation failed.",
                    "detail": str(e),
                }
            ),
            503,
        )

    try:
        pic = None
        raw_bytes = None
        if isinstance(result, Image.Image):
            pic = result
            if pic.mode != "RGB":
                pic = pic.convert("RGB")
        elif isinstance(result, (bytes, bytearray)):
            raw_bytes = bytes(result)
        else:
            if hasattr(result, "read"):
                raw_bytes = result.read()
            else:
                raw_bytes = bytes(result)
        if pic is None and raw_bytes is not None:
            try:
                pic = Image.open(io.BytesIO(raw_bytes))
                if pic.mode != "RGB":
                    pic = pic.convert("RGB")

            except Exception:
                return (
                    jsonify(
                        {
                            "error": "Model returned data that could not be decoded as an image."
                        }
                    ),
                    502,
                )

        if pic is None:
            return jsonify({"error": "No image data returned from the model."}), 502

        buf = io.BytesIO()
        pic.save(buf, format="JPEG", quality=92)
        b64 = base64.standard_b64encode(buf.getvalue()).decode("ascii")
        image_data_url = "data:image/jpeg;base64," + b64

    except Exception as e:
        return jsonify({"error": "Failed to encode image: " + str(e)}), 500

    return jsonify(
        {
            "message": "Background generated (not saved yet).",
            "title": title,
            "additional_details": additional_details,
            "aspect_ratio": ratio_key,
            "style": style,
            "color_scheme": color_scheme,
            "prompt_used": prompt,
            "image_prompt_used": image_prompt,
            "image_data_url": image_data_url,
            "persisted": False,
        }
    )


@app.route("/api/thumbnail/save", methods=["POST"])
def save_thumbnail():
    """Persist a client-rendered thumbnail (e.g. background + title overlay) to disk."""
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


@app.route("/api/thumbnail/<int:thumb_id>/delete", methods=["GET"])
def delete_thumbnail(thumb_id):
    return jsonify({"message": "Thumbnail deleted successfully"})

@app.route("/api/thumbnail/list", methods=["GET"])
def list_thumbnails():
    return jsonify({"message": "Thumbnails list fetched successfully"})

@app.route("/uploads/<path:filename>")
def serve_uploads(filename):
    response = send_from_directory(uploads_folder, filename)
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response

if __name__ == "__main__":

    app.run(debug=True)
