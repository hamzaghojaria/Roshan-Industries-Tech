"""Validate current product records, PDF photo pixels/page links and Excel category rows."""

# Run directly from a working Python installation; see README for inputs and write effects.

from pathlib import Path
from io import BytesIO
import json, hashlib
import pymupdf as fitz
from PIL import Image
from openpyxl import load_workbook

ROOT = Path(__file__).resolve().parents[1]


def read(p):
    return json.loads((ROOT / p).read_text(encoding="utf8"))


products = json.loads(
    (ROOT / "products.js")
    .read_text(encoding="utf8")
    .split("window.ROSHAN_PRODUCTS =", 1)[1]
    .strip()
    .rstrip(";")
)
categories = read("src/data/reviewed-categories.json")
report = read("reports/high-resolution-audit/branded-catalogue-validation.json")
selected = set(read("src/data/new-arrivals.json")["skus"])
doc = fitz.open(ROOT / "assets/roshan-industries-catalogue.pdf")
assert (ROOT / "Roshan-Industries-Catalogue.pdf").read_bytes() == (
    ROOT / "assets/roshan-industries-catalogue.pdf"
).read_bytes()
logo = doc[0].get_image_info()[0]["bbox"]
assert (
    abs((logo[0] + logo[2]) / 2 - doc[0].rect.width / 2) < 0.1
    and abs((logo[1] + logo[3]) / 2 - doc[0].rect.height / 2) < 0.1
)
assert "Our manufacturing experience." in doc[1].get_text()
for page in doc:
    for link in page.get_links():
        if link["kind"] == fitz.LINK_GOTO:
            assert 0 <= link["page"] < len(doc)
image_checks = 0
for number in sorted(set(report["skuPages"].values())):
    items = [p for p in products if report["skuPages"][p["sku"]] == number]
    page = doc[number - 1]
    photos = page.get_image_info(xrefs=True)[1:]
    assert len(photos) == len(items)
    for product, info in zip(items, photos):
        assert product["sku"] in page.get_text()
        assert " ".join(product["name"].split()) in " ".join(page.get_text().split())
        source = Image.open(ROOT / product["image"]).convert("RGBA")
        source = Image.alpha_composite(Image.new("RGBA", source.size, "white"), source).convert(
            "RGB"
        )
        embedded = Image.open(BytesIO(doc.extract_image(info["xref"])["image"])).convert("RGB")
        assert embedded.size == source.size and embedded.tobytes() == source.tobytes(), (
            product["sku"] + " PDF image pixels"
        )
        assert any(link.get("uri", "").endswith("/" + product["url"]) for link in page.get_links())
        image_checks += 1
wb = load_workbook(ROOT / "Roshan-Industries-Product-Catalogue.xlsx")
fields = [
    "sku",
    "name",
    "description",
    "category",
    "family",
    "cataloguePage",
    "slot",
    "image",
    "url",
]
rows_checked = 0
for title, items in [("All Products", products)] + [
    (c["name"].replace(" and ", " ")[:31], [p for p in products if p["categoryId"] == c["id"]])
    for c in categories
]:
    sheet = wb[title]
    assert sheet.max_row == len(items) + 5
    assert sheet.sheet_properties.tabColor is not None and "Family:" in sheet["A2"].value
    for row, product in enumerate(items, 6):
        assert [sheet.cell(row, col).value for col in range(1, 10)] == [product[k] for k in fields]
        assert sheet.cell(row, 10).value == ("Yes" if product["sku"] in selected else "No")
        assert sheet.cell(row, 6).hyperlink.target.endswith(
            "#page=" + str(product["cataloguePage"])
        )
        assert (
            sheet.cell(row, 8).hyperlink.target == product["image"]
            and sheet.cell(row, 9).hyperlink.target == product["url"]
        )
        source = Image.open(ROOT / product["image"]).convert("RGB")
        source.thumbnail((240, 210), Image.Resampling.LANCZOS)
        embedded = Image.open(BytesIO(sheet._images[row - 6]._data())).convert("RGB")
        assert source.size == embedded.size and source.tobytes() == embedded.tobytes(), (
            product["sku"] + " Excel thumbnail"
        )
        rows_checked += 1
result = dict(
    products=len(products),
    pdfPages=len(doc),
    pdfImagesMatched=image_checks,
    workbookRowsMatched=rows_checked,
    categorySheets=len(categories),
    newArrivalProducts=len(selected),
    allProductPageLinksValid=True,
    coverLogoCentered=True,
    allPhotosMatchWebsite=True,
    pdfSha256=hashlib.sha256(
        (ROOT / "assets/roshan-industries-catalogue.pdf").read_bytes()
    ).hexdigest(),
)
(ROOT / "reports/high-resolution-audit/synchronized-exports-validation.json").write_text(
    json.dumps(result, indent=2) + "\n"
)
print(
    f"PASS synchronized exports: {image_checks} full resolution PDF photos and {rows_checked} Excel rows/photos matched to website; category records and page links valid."
)
