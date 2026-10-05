"""Extract the supplied PDF's product photos and logo without altering the PDF."""

from pathlib import Path
import json
import argparse
import pypdfium2 as pdfium
from PIL import Image, ImageDraw, ImageChops, ImageOps

root = Path(__file__).resolve().parent.parent
assets = root / "assets"
photos = assets / "products"
photos.mkdir(parents=True, exist_ok=True)
# Allow another source location without editing the extraction logic.
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument(
    "--pdf", type=Path, default=Path.home() / "Downloads" / "20 page.pdf"
)
source = parser.parse_args().pdf
pdf = pdfium.PdfDocument(source)
columns = [(33, 301), (313, 581), (593, 861)]
rows = [(23, 271), (340, 563), (632, 855), (924, 1147)]
count = 0


def save_photo(image, box, name):
    global count
    crop = image.crop(tuple(v * 2 for v in box)).convert("RGB")
    difference = ImageChops.difference(
        crop, Image.new("RGB", crop.size, "white")
    ).convert("L")
    bounds = difference.point(lambda value: 255 if value > 40 else 0).getbbox()
    if bounds:
        crop = crop.crop(bounds)
    canvas = Image.new("RGB", (480, 480), "white")
    crop = ImageOps.contain(crop, (420, 420), Image.Resampling.LANCZOS)
    canvas.paste(crop, ((480 - crop.width) // 2, (480 - crop.height) // 2))
    canvas.save(photos / (name + ".webp"), quality=88)
    count += 1


for number in range(2, 18):
    image = pdf[number - 1].render(scale=3).to_pil().convert("RGB")
    for row, (top, bottom) in enumerate(rows):
        for col, (left, right) in enumerate(columns):
            save_photo(
                image, (left, top, right, bottom), f"p{number:02}-{row*3+col+1:02}"
            )
special = {
    18: [
        (38, 28, 430, 419),
        (446, 28, 837, 419),
        (38, 535, 430, 1029),
        (463, 535, 855, 1029),
    ],
    19: [
        (30, 80, 446, 576),
        (462, 80, 869, 576),
        (30, 578, 446, 1190),
        (462, 578, 869, 1190),
    ],
}
for number, boxes in special.items():
    image = pdf[number - 1].render(scale=3).to_pil().convert("RGB")
    for slot, box in enumerate(boxes, 1):
        save_photo(image, box, f"p{number:02}-{slot:02}")
cover = pdf[0].render(scale=3).to_pil().convert("RGB")
logo = cover.crop((588, 436, 1200, 826)).convert("RGBA")
pixels = logo.load()
for y in range(logo.height):
    for x in range(logo.width):
        r, g, b, _ = pixels[x, y]
        alpha = max(0, min(255, int((180 - min(r, g, b)) * 255 / 125)))
        pixels[x, y] = (16, 31, 50, alpha)
logo.save(assets / "roshan-logo.png")
# The supplied scan is 33 MB, exceeding common per-asset hosting limits.
# Preserve all 20 pages in a smaller, readable web copy; leave the original untouched.
web_pages = [
    pdf[number].render(scale=2).to_pil().convert("RGB") for number in range(len(pdf))
]
web_pages[0].save(
    assets / "roshan-product-catalogue.pdf",
    "PDF",
    resolution=144,
    save_all=True,
    append_images=web_pages[1:],
    quality=86,
)
sheet = Image.new("RGB", (1200, 800), "white")
draw = ImageDraw.Draw(sheet)
for index, name in enumerate(
    [
        "p02-01",
        "p04-04",
        "p06-05",
        "p07-01",
        "p08-05",
        "p11-12",
        "p13-04",
        "p15-01",
        "p16-02",
        "p17-08",
        "p18-03",
        "p19-03",
    ]
):
    photo = Image.open(photos / (name + ".webp"))
    photo.thumbnail((260, 220))
    x, y = (index % 4) * 300, (index // 4) * 260
    sheet.paste(photo, (x + (300 - photo.width) // 2, y))
    draw.text((x + 20, y + 225), name, fill="black")
(root / "artifacts").mkdir(exist_ok=True)
sheet.save(root / "artifacts/extracted-products.jpg")
print(
    f"Extracted {count} product photos, the supplied Roshan Industries mark, and a web-optimized 20-page PDF."
)
