"""Extract native-resolution product crops from the authoritative PDF scans.
No upscaling, recompression of the source PDF, or synthetic image changes.
"""

# Run directly from a working Python installation; see README for inputs and write effects.

from pathlib import Path
from io import BytesIO
import json, hashlib
import pymupdf as fitz
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT.parent / "reference-documents/roshan-high-resolution-source.pdf"
OUT = ROOT / "reports/high-resolution-audit"
products = json.loads((ROOT / "src/data/reviewed-products.json").read_text(encoding="utf8"))
pdf = fitz.open(SOURCE)
cols = [(58 / 774, 245 / 774), (294 / 774, 481 / 774), (531 / 774, 717 / 774)]
rows = [
    (59 / 1095, 223 / 1095),
    (305 / 1095, 469 / 1095),
    (551 / 1095, 715 / 1095),
    (797 / 1095, 961 / 1095),
]
compass = [
    (0.063, 0.067, 0.473, 0.482),
    (0.543, 0.092, 0.970, 0.488),
    (0.055, 0.558, 0.471, 0.920),
    (0.529, 0.601, 0.974, 0.921),
]
audit = []
for page_number in range(2, 21):
    page = pdf[page_number - 1]
    main = max(page.get_images(full=True), key=lambda i: i[2] * i[3])
    raw = pdf.extract_image(main[0])
    native = Image.open(BytesIO(raw["image"])).convert("RGB")
    entries = [p for p in products if p["page"] == page_number]
    sheet = Image.new("RGB", (1200, 1200), "white")
    draw = ImageDraw.Draw(sheet)
    for p in entries:
        slot = p["slot"]
        if page_number == 20:
            normalized = compass[slot - 1]
        else:
            x0, x1 = cols[(slot - 1) % 3]
            y0, y1 = rows[(slot - 1) // 3]
            normalized = (x0, y0, x1, y1)
        box = tuple(
            round(v * (native.width if i % 2 == 0 else native.height))
            for i, v in enumerate(normalized)
        )
        image = native.crop(box)
        # Suppress red document frame fragments confined to the four crop corners.
        # Products and their resolution are unchanged; no resampling is applied.
        if page_number != 20:
            pixels = image.load()
            cw = round(image.width * 0.12)
            ch = round(image.height * 0.12)
            for x0, y0 in [
                (0, 0),
                (image.width - cw, 0),
                (0, image.height - ch),
                (image.width - cw, image.height - ch),
            ]:
                for yy in range(y0, y0 + ch):
                    for xx in range(x0, x0 + cw):
                        rr, gg, bb = pixels[xx, yy]
                        if rr > 65 and rr > gg * 1.7 and rr > bb * 1.7:
                            pixels[xx, yy] = (255, 255, 255)
        target = ROOT / p["image"]
        target.parent.mkdir(exist_ok=True)
        image.save(target, "WEBP", lossless=True, method=6)
        p["imageWidth"], p["imageHeight"] = image.size
        p["sourceImageXref"] = main[0]
        p["sourceCrop"] = list(box)
        p["sourceNativeSize"] = list(native.size)
        audit.append(
            {
                "sku": p["sku"],
                "page": page_number,
                "slot": slot,
                "image": p["image"],
                "dimensions": list(image.size),
                "crop": list(box),
                "nativeScan": list(native.size),
                "imageXref": main[0],
                "sha256": hashlib.sha256(target.read_bytes()).hexdigest(),
            }
        )
        thumb = image.copy()
        thumb.thumbnail((340, 230))
        x = ((slot - 1) % 3) * 400
        y = ((slot - 1) // 3) * 300
        sheet.paste(thumb, (x + (400 - thumb.width) // 2, y + 12))
        draw.text((x + 15, y + 246), p["sku"] + " " + p["name"][:44], fill="black")
    sheet.save(OUT / f"products-page-{page_number:02}.jpg", quality=94)
(OUT / "image-provenance.json").write_text(
    json.dumps(
        {
            "sourceSha256": hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
            "pdfPages": len(pdf),
            "images": audit,
        },
        indent=2,
    ),
    encoding="utf8",
)
(ROOT / "src/data/reviewed-products.json").write_text(
    json.dumps(products, indent=2) + "\n", encoding="utf8"
)
print(
    f"Extracted {len(audit)} lossless native-resolution product images from {len(pdf)} PDF pages.",
    flush=True,
)
