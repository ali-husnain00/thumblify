import os
from google import genai

SYSTEM_INSTRUCTION = """You are a senior prompt engineer for YouTube thumbnail image models (Google Imagen).
Given user inputs, write ONE detailed image-generation prompt that produces a finished, click-worthy thumbnail ready to publish.

Rules:
- Infer visual props, icons, UI badges, arrows, charts, devices, and scene elements from the title/topic.
- Add generic stylized logos or iconography when relevant; NEVER use real brand trademarks unless the user explicitly names a brand.
- Include the exact title as large, bold, highly readable main headline with stroke or shadow for legibility.
- Add a short subtitle on the image ONLY when it strengthens the message (3-8 words, smaller than the title, placed below or beside the headline). Infer it from the title topic — e.g. benefit, timeframe, hook, or category ("Full Course", "In 10 Minutes", "Beginner Friendly"). Skip the subtitle if the title is already short and complete on its own.
- Describe colors using natural language only (e.g. hot pink, deep blue). NEVER include hex codes, RGB values, or color codes in the prompt.
- The only readable text on the thumbnail is the main title and optional subtitle. No hex codes, watermarks, random labels, or UI filler text.
- Specify composition, focal subject, lighting, depth, color palette, and mood matching the style and colors provided.
- Output ONLY the final prompt text. No markdown, no preamble, no explanation."""


def enhance_thumbnail_prompt(title, style, color_description, additional_details, aspect_ratio, base_prompt):
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        return base_prompt

    client = genai.Client(api_key=api_key)

    user_message = f"""Enhance this into a single detailed Imagen image-generation prompt.

Title: "{title}"
Style: {style}
Colors: {color_description}
Aspect ratio: {aspect_ratio}
User details: {additional_details or "infer props and icons from the title"}

Base prompt:
{base_prompt}
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=user_message,
            config={"system_instruction": SYSTEM_INSTRUCTION},
        )
        enhanced = (response.text or "").strip()
        return enhanced if enhanced else base_prompt
    except Exception:
        return base_prompt
