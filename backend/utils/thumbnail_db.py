def thumbnail_row_to_dict(row):
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
