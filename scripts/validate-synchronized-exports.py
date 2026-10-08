"""Validate compressed PDF photos, original workbook thumbnails and catalogue records."""

# Run directly from a working Python installation; see README for inputs and write effects.

from pathlib import Path
from io import BytesIO
import json, hashlib
import pymupdf as fitz
from PIL import Image, ImageChops
from openpyxl import load_workbook


def main():
    """Run this maintenance task explicitly; importing the module never writes files."""
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
    profile = report.get("imageOptimization")
    if profile:
        # The approved web profile changes PDF photos only, never source images or workbook photos.
        assert profile == {
            "name": "web",
            "maxImageEdge": 900,
            "jpegQuality": 85,
            "subsampling": 2,
            "logoLossless": True,
        }
    selected = set(read("src/data/new-arrivals.json")["skus"])
    doc = fitz.open(ROOT / "assets/roshan-industries-catalogue.pdf")
    assert (ROOT / "Roshan-Industries-Catalogue.pdf").read_bytes() == (
        ROOT / "assets/roshan-industries-catalogue.pdf"
    ).read_bytes()
    assert all(
        "Pump photograph credits" not in page.get_text() and "Image licence" not in page.get_text()
        for page in doc
    )
    # Verify the replacement range and retired pump SKUs in customer exports.
    assert not any(product["family"] == "Pumps" for product in products)
    machining = [product for product in products if product["family"] == "Precision Machining"]
    assert len(machining) == 54
    assert {product["sku"] for product in machining} == {
        f"RIT-{number:04d}" for number in range(272, 326)
    }
    # Every requested manufacturer product must be represented exactly once.
    coverage = read("reports/high-resolution-audit/precitech-website-coverage.json")
    expected_sources = set(coverage["expectedProductSourceUrls"])
    assert {product["sourceUrl"] for product in machining} == expected_sources
    assert len(expected_sources) == len(machining)
    export_text = "\n".join(page.get_text() for page in doc)
    assert all(product["name"] in export_text.replace("\n", " ") for product in machining)
    assert "pump" not in export_text.lower()
    for number in range(201, 213):
        assert f"RIT-{number:04d}" not in export_text
    logo_info = doc[0].get_image_info(xrefs=True)[0]
    logo = logo_info["bbox"]
    assert (
        abs((logo[0] + logo[2]) / 2 - doc[0].rect.width / 2) < 0.1
        and abs((logo[1] + logo[3]) / 2 - doc[0].rect.height / 2) < 0.1
    )
    with Image.open(ROOT / "assets/roshan-logo.png") as original_logo:
        rgba = original_logo.convert("RGBA")
        source_logo = Image.alpha_composite(Image.new("RGBA", rgba.size, "white"), rgba).convert(
            "RGB"
        )
    embedded_logo = Image.open(BytesIO(doc.extract_image(logo_info["xref"])["image"])).convert(
        "RGBA"
    )
    logo_mask = next(
        image[1] for image in doc[0].get_images(full=True) if image[0] == logo_info["xref"]
    )
    if logo_mask:
        embedded_logo.putalpha(
            Image.open(BytesIO(doc.extract_image(logo_mask)["image"])).convert("L")
        )
    embedded_logo = Image.alpha_composite(
        Image.new("RGBA", embedded_logo.size, "white"), embedded_logo
    ).convert("RGB")
    assert embedded_logo.size == source_logo.size
    # A PDF transparency mask can round alpha composition by one channel value.
    assert (
        max(high for low, high in ImageChops.difference(embedded_logo, source_logo).getextrema())
        <= 1
    )
    header_logo = doc[1].get_image_info(xrefs=True)[0]
    header_pixels = Image.open(BytesIO(doc.extract_image(header_logo["xref"])["image"])).convert(
        "RGB"
    )
    assert (
        header_pixels.size == source_logo.size and header_pixels.tobytes() == source_logo.tobytes()
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
            if profile:
                # Recompute independently from originals; don't trust the export cache or report alone.
                source.thumbnail((900, 900), Image.Resampling.LANCZOS)
                expected = BytesIO()
                source.save(expected, format="JPEG", quality=85, optimize=True, subsampling=2)
                source = Image.open(BytesIO(expected.getvalue())).convert("RGB")
            embedded = Image.open(BytesIO(doc.extract_image(info["xref"])["image"])).convert("RGB")
            assert embedded.size == source.size and embedded.tobytes() == source.tobytes(), (
                product["sku"] + " PDF image pixels"
            )
            assert any(
                link.get("uri", "").endswith("/" + product["url"]) for link in page.get_links()
            )
            image_checks += 1
    workbook_report = read("reports/high-resolution-audit/workbook-validation.json")
    workbook_profile = workbook_report["imageOptimization"]
    assert workbook_profile == {
        "format": "JPEG",
        "maxWidth": 240,
        "maxHeight": 210,
        "jpegQuality": 85,
        "subsampling": 2,
        "sharedImageResources": True,
    }
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
    # Customer workbook cells, comments and hyperlinks must not contain photo credits.
    for sheet in wb:
        for row in sheet:
            for cell in row:
                content = (
                    str(cell.value or "")
                    + str(cell.comment.text if cell.comment else "")
                    + str(cell.hyperlink.target if cell.hyperlink else "")
                )
                assert not any(
                    label in content.lower()
                    for label in (
                        "image licence",
                        "photo credits",
                        "creativecommons.org",
                        "wikimedia.org",
                        "cc by-sa",
                    )
                )
    rows_checked = 0
    for title, items in [("All Products", products)] + [
        (c["name"].replace(" and ", " ")[:31], [p for p in products if p["categoryId"] == c["id"]])
        for c in categories
    ]:
        sheet = wb[title]
        assert sheet.max_row == len(items) + 5
        assert sheet.sheet_properties.tabColor is not None and "Family:" in sheet["A2"].value
        for row, product in enumerate(items, 6):
            assert [sheet.cell(row, col).value for col in range(1, 10)] == [
                product[k] for k in fields
            ]
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
            expected = BytesIO()
            source.save(expected, format="JPEG", quality=85, subsampling=2, optimize=True)
            source = Image.open(BytesIO(expected.getvalue())).convert("RGB")
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
        pdfImageProfile=profile or "native",
        workbookImageProfile=workbook_profile,
        pdfSha256=hashlib.sha256(
            (ROOT / "assets/roshan-industries-catalogue.pdf").read_bytes()
        ).hexdigest(),
    )
    (ROOT / "reports/high-resolution-audit/synchronized-exports-validation.json").write_text(
        json.dumps(result, indent=2) + "\n"
    )
    print(
        f"PASS synchronized exports: {image_checks} PDF photos verified against their source "
        f"and export profile; {rows_checked} Excel rows/photos matched to their source and preview profile; "
        "category records and page links valid."
    )


if __name__ == "__main__":
    main()
