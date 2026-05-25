import os
import uuid

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from vertexai.preview.vision_models import ImageGenerationModel

from config.paths import RATIO_SIZES, THUMBNAILS_FOLDER
from prompts.thumbnail_prompts import (
    build_base_prompt,
    get_color_block,
    get_style_block,
)
from services.prompt_engineer import enhance_thumbnail_prompt
from services.save_thumbnail import save_thumbnail_to_db
from utils.auth import get_jwt_user_id

generate_thumbnail_bp = Blueprint("generate_thumbnail", __name__)


@generate_thumbnail_bp.route("/thumbnail/generate", methods=["POST"])
@jwt_required()
def generate_thumbnail():
    body = request.get_json() or {}
    user_id = get_jwt_user_id()

    if not user_id:
        return jsonify({"message": "User not found."}), 404

    title = (body.get("title") or "").strip()
    style = (body.get("style") or "").strip()
    color_scheme = (body.get("colorScheme") or "").strip()
    additional_prompt = (body.get("additionalDetails") or "").strip()
    ratio_key = (body.get("aspect_ratio") or body.get("aspectRatio") or "16:9").strip()

    if ratio_key not in RATIO_SIZES:
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

    try:
        model = ImageGenerationModel.from_pretrained("imagen-4.0-generate-001")
        images = model.generate_images(
            prompt=final_prompt, number_of_images=1, aspect_ratio=ratio_key
        )
        image = images[0]

        filename = uuid.uuid4().hex + ".png"
        user_folder = os.path.join(THUMBNAILS_FOLDER, str(user_id))
        os.makedirs(user_folder, exist_ok=True)
        save_path = os.path.join(user_folder, filename)
        image.save(location=save_path)

        base_url = request.host_url.rstrip("/")
        image_url = f"{base_url}/uploads/thumbnails/{user_id}/{filename}"

        save_thumbnail_to_db(
            user_id, title, style, color_scheme, additional_prompt,
            ratio_key, image_url, final_prompt,
        )

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
