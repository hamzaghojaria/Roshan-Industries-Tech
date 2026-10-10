"""Prepare one workbook thumbnail per unique source photograph."""

import base64
import json
from io import BytesIO
from pathlib import Path

from PIL import Image
from export_data import load_products
from workbook_images import preview_bytes


def main():
    """Importing this module never creates thumbnails or writes files."""
    root = Path(__file__).resolve().parents[1]
    items = {}
    for image_path in dict.fromkeys(p["image"] for p in load_products(root)):
        data = preview_bytes(root / image_path)
        with Image.open(BytesIO(data)) as image:
            width, height = image.size
        items[image_path] = {
            "dataUrl": "data:image/jpeg;base64," + base64.b64encode(data).decode(),
            "width": width,
            "height": height,
        }
    output = root / "artifacts/workbook-previews.json"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(items), encoding="utf8")
    print(f"Prepared {len(items)} source-matched workbook thumbnails.")


if __name__ == "__main__":
    main()
