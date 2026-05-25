"""Style and color prompt maps for thumbnail generation (mirrors frontend assets.js)."""

STYLE_PROMPTS = {
    "Bold & Graphic": (
        "viral YouTube thumbnail with oversized bold sans-serif title text, thick stroke and drop shadow "
        "on lettering, expressive face or striking object as focal point, punchy high contrast, dramatic "
        "rim lighting, click-worthy composition, supporting icons and props inferred from topic"
    ),
    "Minimalist": (
        "minimalist YouTube thumbnail with short bold title, generous negative space, restrained color "
        "palette, single clear focal subject, clean modern layout, subtle shadows, premium editorial feel"
    ),
    "Photorealistic": (
        "photorealistic YouTube thumbnail, DSLR-quality lighting, natural skin tones, candid expressive "
        "moment, title in lower third with heavy shadow for legibility, shallow depth of field, lifestyle realism"
    ),
    "Illustrated": (
        "illustrated YouTube thumbnail, stylized vector or cartoon art, vibrant flat colors, bold outlines, "
        "title integrated into the composition with playful typography, creative and energetic"
    ),
    "Tech/Futuristic": (
        "futuristic tech YouTube thumbnail, holographic UI accents, neon edge glow, sleek sans-serif title, "
        "cyber atmosphere, sharp high-tech lighting, abstract digital elements, device and code iconography"
    ),
    "Cyberpunk": (
        "cyberpunk YouTube thumbnail, neon-drenched rainy cityscape, glitch effects, chrome and hologram "
        "typography, electric cyan and magenta accents, dystopian tech props, HUD overlays, high contrast"
    ),
    "Gaming": (
        "gaming YouTube thumbnail, dynamic action pose, RGB lighting, HUD UI overlays, controller or headset "
        "props, energy bursts and particle effects, bold competitive title, esports energy"
    ),
    "Horror / Dark": (
        "dark horror-thriller YouTube thumbnail, moody shadows, desaturated tones with blood-red accents, "
        "ominous atmosphere, dramatic vignette, suspenseful focal subject, gritty texture"
    ),
    "Retro / Vaporwave": (
        "retro vaporwave YouTube thumbnail, 80s sunset grid, synthwave palette, chrome text, palm trees or "
        "classic retro props, nostalgic pink-purple-teal gradients, bold stylized title"
    ),
    "Corporate": (
        "clean corporate YouTube thumbnail, professional layout, subtle trust icons, charts or handshake "
        "motifs when relevant, crisp sans-serif title, polished lighting, credible business aesthetic"
    ),
}

COLOR_SCHEME_DESCRIPTIONS = {
    "vibrant": (
        "high-energy palette: hot pink and coral accents, warm orange highlights, bright sky-blue pops, "
        "high saturation, bold contrast, deep shadows behind text for legibility"
    ),
    "sunset": (
        "warm cinematic palette: rich orange, deep magenta, royal purple depth, soft gradient sky, "
        "golden-hour glow, rich warm shadows"
    ),
    "ocean": (
        "cool trustworthy palette: deep ocean blue, bright aqua, pale ice-blue highlights, fresh aquatic "
        "mood, clean contrast, crisp cool lighting"
    ),
    "forest": (
        "organic calm palette: deep forest green, fresh leaf green, soft mint highlights, earthy natural "
        "tones, gentle diffuse light, fresh atmosphere"
    ),
    "purple": (
        "premium modern palette: royal purple, bright violet, soft lavender highlights, stylish mood, "
        "soft glow, elegant contrast"
    ),
    "fire": (
        "urgency palette: blaze orange, golden sparks, near-black backdrop, explosive energy, "
        "high heat contrast, dramatic spotlight"
    ),
    "cinematic": (
        "film-grade palette: navy shadows, warm amber highlights, rich gold accents, teal-orange grading, "
        "moody cinematic lighting, rich depth"
    ),
    "neon": (
        "cyber glow palette: electric magenta, vivid cyan, bright yellow accents, neon rim light, "
        "high contrast glow on dark background"
    ),
    "pastel": (
        "soft friendly palette: peach, sky blue, soft pink, low saturation, gentle tones, bright airy lighting"
    ),
    "monochrome": (
        "black and white drama: deep blacks, mid grays, bright white highlights, high contrast, "
        "timeless noir lighting, sharp text separation"
    ),
    "cyberpunk": (
        "cyberpunk palette: electric cyan, hot magenta, void black background, neon rim lighting, "
        "glitch accents, chrome reflections, high contrast glow"
    ),
    "gaming": (
        "gaming RGB palette: neon green, electric purple, dark backdrop, lens flare, "
        "esports energy, saturated competitive contrast"
    ),
    "gold": (
        "luxury gold palette: rich gold, deep black depth, cream highlights, premium shine, "
        "elegant spotlight, high-end contrast"
    ),
    "arctic": (
        "arctic palette: ice blue, deep frost blue, snow white, crisp cold lighting, clean minimal contrast, "
        "fresh winter mood"
    ),
    "crimson": (
        "aggressive crimson palette: blood red, black depth, soft red highlight pops, intense dramatic shadows, "
        "urgent high-stakes mood"
    ),
    "vaporwave": (
        "vaporwave palette: hot pink, bright cyan, mint green, soft purple, retro sunset gradient, "
        "synth nostalgia, soft neon glow"
    ),
}


def get_style_block(style_label: str) -> str:
    return STYLE_PROMPTS.get(style_label, style_label)


def get_color_block(color_scheme_id: str) -> str:
    return COLOR_SCHEME_DESCRIPTIONS.get(color_scheme_id, color_scheme_id)


def build_base_prompt(
    title: str,
    style_block: str,
    color_block: str,
    extra: str,
    aspect_ratio: str,
) -> str:
    subject = extra.strip() if extra and extra.strip() else (
        "infer a strong central subject, relevant props, icons, and visual elements from the title topic"
    )
    return (
        f"YouTube thumbnail, aspect ratio {aspect_ratio}.\n"
        f'Main title (exact text): "{title}"\n'
        f"Subtitle: add a short supporting line on the image only if it fits the title topic; otherwise omit.\n"
        f"Visual style: {style_block}\n"
        f"Color palette: {color_block}\n"
        f"Scene and elements: {subject}"
    )
