"""Build the compact website catalogue, preserving original product photographs."""

# Run directly from a working Python installation; see README for inputs and write effects.

from pathlib import Path
from io import BytesIO
import json, hashlib, math
from time import perf_counter
import pymupdf as fitz
from PIL import Image
from catalogue_images import (
    CatalogueImageCache, WEB_IMAGE_PROFILE, fit_image_rect, validate_image_proportions,
)

from export_data import load_products, read_json


def main():
    """Generate and validate one export using state confined to this run."""
    ROOT = Path(__file__).resolve().parents[1]
    started = perf_counter()
    image_cache = CatalogueImageCache(ROOT / "artifacts/catalogue-image-cache")
    image_xrefs = {}
    print(
        "[catalogue] Building compact PDF; reusing unchanged image encodings...",
        flush=True,
    )

    def read(file):
        """Read maintained JSON with the same UTF-8 encoding used by the website build."""
        return read_json(ROOT, file)

    products = load_products(ROOT)
    categories = read("src/data/reviewed-categories.json")
    families = list(dict.fromkeys(c["family"] for c in categories))
    mapping = {}
    number = 5
    for family in families:
        for c in [c for c in categories if c["family"] == family]:
            items = [p for p in products if p["categoryId"] == c["id"]]
            for i, item in enumerate(items):
                mapping[item["sku"]] = number + i // 6
            number += math.ceil(len(items) / 6)
    (ROOT / "src/data/catalogue-pages.json").write_text(
        json.dumps(mapping, indent=2) + "\n", encoding="utf8"
    )
    W, H = 595.28, 841.89
    NAVY = (0.125, 0.129, 0.141)
    BLUE = (0.600, 0.106, 0.157)
    MUTED = (0.376, 0.443, 0.545)
    LINE = (0.894, 0.914, 0.949)
    LIGHT = (0.988, 0.945, 0.949)
    SITE = "https://roshan-industries-tech.onrender.com"
    doc = fitz.open()
    pending = []
    toc = []
    category_pages = {}

    def text(page, value, x, y, size=10, bold=False, color=NAVY):
        page.insert_text(
            (x, y),
            value,
            fontname="hebo" if bold else "helv",
            fontsize=size,
            color=color,
        )

    def block(page, value, rect, size=9, color=NAVY, bold=False):
        """Fail the export if text would be silently clipped inside a PDF panel."""
        result = page.insert_textbox(
            fitz.Rect(rect),
            value,
            fontname="hebo" if bold else "helv",
            fontsize=size,
            color=color,
            lineheight=1.35,
        )
        if result < 0:
            raise ValueError("Text overflow: " + value)

    def uri(page, rect, url):
        page.insert_link({"kind": fitz.LINK_URI, "from": fitz.Rect(rect), "uri": url})

    def goto(page, rect, target):
        """Defer internal links until every destination page exists."""
        pending.append((page.number, fitz.Rect(rect), target))

    def image(page, file, rect, frame=None):
        """Reuse PDF objects for repeated logos and cached JPEGs for product photos."""
        if file in image_xrefs:
            xref, dimensions = image_xrefs[file]
            encoded = None
        else:
            encoded = image_cache.prepare(ROOT / file, lossless=file == "assets/roshan-logo-new.png")
            with Image.open(BytesIO(encoded)) as prepared:
                dimensions = prepared.size
            xref = 0
        fitted = fitz.Rect(fit_image_rect(rect, dimensions))
        clip = None
        if frame:
            # Match the website display frame using PDF clipping; retain the complete photograph.
            clip = fitz.Rect(fit_image_rect(rect, (frame["size"], frame["size"])))
            scale = clip.width / frame["size"]
            left = clip.x0 - frame["x"] * scale
            top = clip.y0 - frame["y"] * scale
            fitted = fitz.Rect(left, top, left + frame["width"] * scale,
                               top + frame["height"] * scale)
        if xref:
            page.insert_image(fitted, xref=xref, keep_proportion=False)
        else:
            xref = page.insert_image(fitted, stream=encoded, keep_proportion=False)
            image_xrefs[file] = (xref, dimensions)
        if clip:
            content = page.get_contents()[-1]
            prefix = (f"q\n{clip.x0:.6f} {page.rect.height-clip.y1:.6f} "
                      f"{clip.width:.6f} {clip.height:.6f} re W n\n").encode("ascii")
            doc.update_stream(content, prefix + doc.xref_stream(content) + b"\nQ\n")

    def chrome(page, title=None, family=None):
        page.draw_rect(fitz.Rect(0, 0, 5, 58), color=None, fill=BLUE)
        image(page, "assets/roshan-logo-new.png", (38, 8, 80, 50))
        text(page, "ROSHAN INDUSTRIES", 96, 25, 9, True)
        text(page, "WATCH PARTS AND CUSTOM MANUFACTURING", 96, 39, 6, color=MUTED)
        text(page, "SINCE 1900", W - 103, 29, 7, True, BLUE)
        page.draw_line((38, 55), (W - 38, 55), color=LINE)
        uri(page, (38, 12, 300, 45), SITE)
        if title:
            text(page, (family or "PRODUCT CATALOGUE").upper(), 38, 82, 8, True, BLUE)
            block(page, title, (38, 94, W - 38, 143), 22, bold=True)
        page.draw_line((38, H - 49), (W - 38, H - 49), color=LINE)
        text(page, "ROSHAN INDUSTRIES", 38, H - 31, 6.5, True)
        text(page, "125+ years of service since 1900", 38, H - 20, 5.5, color=MUTED)
        text(page, "Visit our website", 225, H - 31, 6.5, color=BLUE)
        text(page, "Call or WhatsApp +91 98212 16170", 225, H - 19, 6.5, color=BLUE)
        uri(page, (220, H - 40, 365, H - 27), SITE)
        uri(page, (220, H - 27, 365, H - 10), "https://wa.me/919821216170")
        text(page, "CATEGORY INDEX", W - 157, H - 25, 6.5, True, BLUE)
        page.draw_rect(fitz.Rect(W - 166, H - 39, W - 76, H - 16), color=LINE)
        goto(page, (W - 166, H - 39, W - 76, H - 16), 2)
        text(page, str(page.number + 1), W - 52, H - 25, 8, True)

    # Keep the requested centered logo cover and dedicated introductory page.
    p = doc.new_page(width=W, height=H)
    p.draw_rect(fitz.Rect(0, 0, W, 12), color=None, fill=BLUE)

    def centered(value, rect, size=11, bold=False, color=NAVY):
        assert (
            p.insert_textbox(
                fitz.Rect(rect),
                value,
                fontname="hebo" if bold else "helv",
                fontsize=size,
                color=color,
                align=1,
                lineheight=1.4,
            )
            >= 0
        )

    centered("PRODUCT CATALOGUE", (38, 165, W - 38, 190), 11, True, BLUE)
    centered("Your ideas. Our precision.", (38, 218, W - 38, 257), 21, True)
    logo = fitz.Pixmap(ROOT / "assets/roshan-logo-new.png")
    lw = 260
    lh = lw * logo.height / logo.width
    logo_rect = fitz.Rect((W - lw) / 2, (H - lh) / 2, (W + lw) / 2, (H + lh) / 2)
    p.insert_image(logo_rect, filename=str(ROOT / "assets/roshan-logo-new.png"), keep_proportion=True)
    centered(
        "ROSHAN INDUSTRIES",
        (38, logo_rect.y1 + 30, W - 38, logo_rect.y1 + 72),
        24,
        True,
    )
    centered(
        "Custom CNC & VMC - All Jobs",
        (38, logo_rect.y1 + 76, W - 38, logo_rect.y1 + 101),
        12,
        True,
        color=BLUE,
    )
    centered(
        "Watch parts, tools and custom manufacturing",
        (38, logo_rect.y1 + 105, W - 38, logo_rect.y1 + 130),
        11,
        color=MUTED,
    )
    centered(
        "A family business. Since 1900.",
        (38, logo_rect.y1 + 139, W - 38, logo_rect.y1 + 162),
        10,
        color=MUTED,
    )
    centered(
        f"{len(products)} products across {len(categories)} categories",
        (38, logo_rect.y1 + 172, W - 38, logo_rect.y1 + 195),
        10,
        color=BLUE,
    )
    goto(p, (38, H - 95, W - 38, H - 65), 2)
    centered("EXPLORE THE CATEGORY INDEX", (38, H - 94, W - 38, H - 65), 10, True, BLUE)
    p = doc.new_page(width=W, height=H)
    chrome(p)
    text(p, "A FAMILY BUSINESS SINCE 1900", 38, 100, 9, True, BLUE)
    block(
        p,
        "Generations of service.\nPrecision for your next idea.",
        (38, 122, W - 38, 205),
        27,
        bold=True,
    )
    block(
        p,
        "Since 1900, Roshan Industries has served watchmakers, clockmakers and jewellery workshops from Mumbai. Our family business brings together watch parts, horological tools and workshop essentials, with a practical focus on helping customers find the right product for their work.",
        (38, 218, W - 38, 300),
        11,
        color=MUTED,
    )
    for left, right, label, title, copy in [
        (38, 290, "PRODUCT RANGE", "For the workshop", "Watch and clock parts, tools, jewellery workshop essentials, trays, covers and storage. Browse by category to find what you need."),
        (305, W - 38, "CUSTOM MANUFACTURING", "Custom CNC & VMC - All Jobs", "Share a drawing, sample or requirement. Our team can discuss the application, material, dimensions, finish and quantity."),
    ]:
        p.draw_rect(fitz.Rect(left, 320, right, 486), color=None, fill=LIGHT)
        text(p, label, left + 16, 347, 8, True, BLUE)
        block(p, title, (left + 16, 363, right - 16, 408), 15, bold=True)
        block(p, copy, (left + 16, 418, right - 16, 476), 9.5, color=MUTED)
    block(
        p,
        "Your requirement. Our manufacturing experience.",
        (38, 514, W - 38, 549),
        15,
        bold=True,
    )
    for number, title, copy, y in [
        ("01", "Find your product", "Use the clickable category index. Open a product's website link for more details.", 571),
        ("02", "Share your requirement", "Quote the SKU and tell us the required variant, application and quantity.", 625),
        ("03", "Confirm with our team", "Contact us to confirm specifications, availability and your quotation.", 679),
    ]:
        text(p, number, 38, y, 18, True, BLUE)
        text(p, title, 78, y - 3, 11, True)
        block(p, copy, (78, y + 6, W - 38, y + 40), 9.5, color=MUTED)
    p.draw_rect(fitz.Rect(38, 741, W - 38, 772), color=None, fill=BLUE)
    block(p, "EXPLORE THE CATEGORY INDEX  >", (55, 750, W - 55, 769), 10, color=(1, 1, 1), bold=True)
    goto(p, (38, 741, W - 38, 772), 2)
    # Two index pages preserve the previous family grouping.
    index_groups = [families[:3], families[3:]]
    for index, group in enumerate(index_groups):
        p = doc.new_page(width=W, height=H)
        chrome(p, "Find your category." if index == 0 else "Find your category. Continued")
        text(
            p,
            "Select a family or category to jump to its product pages.",
            38,
            147,
            9,
            color=MUTED,
        )
        y = 179
        for family in group:
            cats = [c for c in categories if c["family"] == family]
            items = [x for x in products if x["family"] == family]
            target = (
                mapping[next(x for x in products if x["categoryId"] == cats[0]["id"])["sku"]] - 1
            )
            p.draw_rect(fitz.Rect(38, y - 17, W - 38, y + 10), color=None, fill=LIGHT)
            text(p, family.upper(), 49, y, 8, True, BLUE)
            text(p, f"{len(items)} products", W - 113, y, 8, color=MUTED)
            goto(p, (38, y - 17, W - 38, y + 10), target)
            y += 35
            for c in cats:
                items = [x for x in products if x["categoryId"] == c["id"]]
                target = mapping[items[0]["sku"]] - 1
                block(p, c["name"], (49, y - 13, 405, y + 10), 9, bold=True)
                text(p, f"{len(items)} products", W - 143, y, 7, color=MUTED)
                text(p, f"{target+1:02d}  VIEW >", W - 87, y, 7, True, BLUE)
                p.draw_line((49, y + 9), (W - 49, y + 9), color=LINE)
                goto(p, (38, y - 15, W - 38, y + 11), target)
                y += 27
            y += 15
        assert y < H - 90
        text(
            p,
            "NEXT INDEX >" if index == 0 else "< PREVIOUS INDEX",
            38,
            H - 68,
            8,
            True,
            BLUE,
        )
        goto(p, (38, H - 84, 180, H - 57), 3 if index == 0 else 2)
    toc.extend([[1, "Introduction", 2], [1, "Category index", 3]])
    # Six cards per category page, two columns and three rows, with full natural photos.
    for family in families:
        cats = [c for c in categories if c["family"] == family]
        family_target = mapping[
            next(x for x in products if x["categoryId"] == cats[0]["id"])["sku"]
        ]
        toc.append([1, family, family_target])
        for c in cats:
            items = [x for x in products if x["categoryId"] == c["id"]]
            first = mapping[items[0]["sku"]]
            category_pages[c["id"]] = first
            toc.append([2, c["name"], first])
            for start in range(0, len(items), 6):
                p = doc.new_page(width=W, height=H)
                chrome(p, c["name"], family)
                text(
                    p,
                    f"{len(items)} products  |  Category page {start//6+1} of {math.ceil(len(items)/6)}",
                    38,
                    146,
                    8,
                    color=MUTED,
                )
                for j, item in enumerate(items[start : start + 6]):
                    assert mapping[item["sku"]] == p.number + 1
                    x = 38 + (j % 2) * 268
                    y = 164 + (j // 2) * 202
                    cw = 251
                    p.draw_rect(
                        fitz.Rect(x, y, x + cw, y + 190),
                        color=LINE,
                        fill=(1, 1, 1),
                        width=0.5,
                    )
                    frame = None
                    if item.get("imageKind") == "owner-supplied-photograph" and item.get("imageFrame"):
                        frame = {**item["imageFrame"], "width": item["imageWidth"], "height": item["imageHeight"]}
                    image(p, item["image"], (x + 10, y + 7, x + cw - 10, y + 110), frame)
                    block(
                        p,
                        item["name"],
                        (x + 11, y + 114, x + cw - 11, y + 147),
                        10,
                        bold=True,
                    )
                    text(p, item["sku"], x + 11, y + 158, 7, color=MUTED)
                    text(p, "VIEW PRODUCT >", x + cw - 92, y + 158, 7, True, BLUE)
                    uri(p, (x, y, x + cw, y + 190), SITE + "/" + item["url"])
                    # Concise newly generated copy is included beneath the title.
                    desc = item["description"]
                    title_prefix = item["name"] + ". "
                    if desc.startswith(title_prefix):
                        desc = desc[len(title_prefix):]
                    # Two clean lines preserve the original compact card geometry.
                    summary = desc.split(". ", 1)[0].rstrip(".") + "."
                    font = fitz.Font("helv")
                    if font.text_length(summary, fontsize=7) > 420:
                        words = summary.rstrip(".").split()
                        while font.text_length(" ".join(words) + "...", fontsize=7) > 420:
                            words.pop()
                        summary = " ".join(words) + "..."
                    block(
                        p,
                        summary,
                        (x + 11, y + 165, x + cw - 11, y + 187),
                        7,
                        color=MUTED,
                    )
    for page, rect, target in pending:
        assert 0 <= target < len(doc)
        doc[page].insert_link(
            {
                "kind": fitz.LINK_GOTO,
                "from": rect,
                "page": target,
                "to": fitz.Point(0, 0),
            }
        )
    doc.set_toc(toc)
    doc.set_metadata(
        {
            "title": "Roshan Industries Product Catalogue",
            "author": "Roshan Industries",
            "subject": "Watch parts and custom manufacturing. Category index and CNC and VMC machining range.",
        }
    )
    output = ROOT / "assets/roshan-industries-catalogue.pdf"
    # Validate the actual PDF transformation matrices, not just matching image pixels.
    proportion_checks = validate_image_proportions(doc)
    doc.save(output, garbage=4, deflate=True, use_objstms=1, compression_effort=100)
    doc.close()
    (ROOT / "Roshan-Industries-Catalogue.pdf").write_bytes(output.read_bytes())
    check = fitz.open(output)
    full = "\n".join(p.get_text() for p in check)
    for item in products:
        assert item["sku"] in check[mapping[item["sku"]] - 1].get_text()
        assert item["name"] in check[mapping[item["sku"]] - 1].get_text().replace("\n", " ")
    report = {
        "products": len(products),
        "categories": len(categories),
        "families": families,
        "pages": len(check),
        "skuPages": mapping,
        "categoryPages": category_pages,
        "links": sum(len(p.get_links()) for p in check),
        "pdfSha256": hashlib.sha256(output.read_bytes()).hexdigest(),
        "nativeSourceImagesPreserved": False,
        "originalSourceFilesPreserved": True,
        "imageOptimization": dict(WEB_IMAGE_PROFILE),
        "pdfBytes": output.stat().st_size,
        "imageCacheHits": image_cache.hits,
        "imageCacheMisses": image_cache.misses,
        "exportSeconds": round(perf_counter() - started, 2),
        "coverLogoCentered": True,
        "introductionPage": 2,
        "categoryIndexPages": [3, 4],
        "allProductsSynchronized": True,
        "websiteImageOverridesIncluded": True,
        "imageProportionsPreserved": True,
        "imagePlacementsChecked": proportion_checks,
    }
    (ROOT / "reports/high-resolution-audit/branded-catalogue-validation.json").write_text(
        json.dumps(report, indent=2) + "\n", encoding="utf8"
    )
    print(
        f"PASS compact catalogue: {len(check)} pages, {len(products)} products, "
        f"{output.stat().st_size / 1024 / 1024:.1f} MB in {report['exportSeconds']:.2f}s; "
        f"{image_cache.hits} cached images, {image_cache.misses} newly encoded. "
        "Clickable index, product links and original source files preserved.",
        flush=True,
    )


if __name__ == "__main__":
    main()
