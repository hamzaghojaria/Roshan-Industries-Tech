"""Shared read-only inputs for catalogue exporters; browser records are intentionally smaller."""

import json
from pathlib import Path


def read_json(root: Path, relative: str):
    """Read an authoritative UTF-8 input from the project being exported."""
    return json.loads((root / relative).read_text(encoding="utf8"))


def load_products(root: Path):
    """Read complete generated records, retaining descriptions, images and PDF references."""
    contents = (root / "products.js").read_text(encoding="utf8")
    marker = "window.ROSHAN_PRODUCTS ="
    if marker not in contents:
        raise ValueError("Full catalogue records are missing; run the website build first.")
    products = json.loads(contents.split(marker, 1)[1].strip().rstrip(";"))
    if not isinstance(products, list) or not products:
        raise ValueError("The full catalogue must contain product records.")
    return products
