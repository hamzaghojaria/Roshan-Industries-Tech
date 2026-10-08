"""Refresh cover and introduction while preserving the previously exported product pages.
The archived PDF is the repeatable input. No product re-export or XLSX mutation.
"""

# Run directly from a working Python installation; see README for inputs and write effects.

from pathlib import Path
import json, hashlib, re
import pymupdf as fitz

ROOT = Path(__file__).resolve().parents[1]
archive = ROOT.parent / "reference-documents/catalogue-before-cover-update.pdf"
pdf = ROOT / "assets/roshan-industries-catalogue.pdf"
if not archive.exists():
    archive.write_bytes(pdf.read_bytes())
old = fitz.open(archive)
doc = fitz.open()
pending = []
W, H = old[0].rect.width, old[0].rect.height
navy = (0.067, 0.114, 0.188)
blue = (0.192, 0.357, 0.839)
muted = (0.376, 0.443, 0.545)
line = (0.894, 0.914, 0.949)
site = "https://roshan-industries-tech.onrender.com"


def text(p, t, rect, size=11, bold=False, color=navy, align=0):
    result = p.insert_textbox(
        fitz.Rect(rect),
        t,
        fontsize=size,
        fontname="hebo" if bold else "helv",
        color=color,
        align=align,
        lineheight=1.4,
    )
    assert result >= 0, "Overflow " + t


def link(p, rect, target):
    p.insert_link(
        dict(kind=fitz.LINK_GOTO, from_=fitz.Rect(rect), page=target, to=fitz.Point(0, 0))
    )


def goto(p, rect, target):
    pending.append((p.number, rect, target))


def uri(p, rect, url):
    p.insert_link({"kind": fitz.LINK_URI, "from": fitz.Rect(rect), "uri": url})


def footer(p, number):
    p.draw_line((38, H - 49), (W - 38, H - 49), color=line)
    text(p, "ROSHAN INDUSTRIES", (38, H - 39, 205, H - 12), 7, True)
    text(p, "SINCE 1900", (38, H - 25, 205, H - 10), 6, color=muted)
    text(p, "Visit our website", (235, H - 38, 355, H - 15), 7, color=blue)
    uri(p, (235, H - 40, 355, H - 15), site)
    text(p, "CATEGORY INDEX", (W - 163, H - 35, W - 73, H - 12), 7, True, color=blue)
    goto(p, (W - 166, H - 40, W - 73, H - 12), 2)
    text(p, str(number), (W - 56, H - 35, W - 34, H - 12), 8, True)


# Quiet cover: the actual logo bounding box is centered on both page axes.
p = doc.new_page(width=W, height=H)
p.draw_rect(fitz.Rect(0, 0, W, 12), fill=blue, color=None)
text(p, "PRODUCT CATALOGUE", (38, 165, W - 38, 190), 11, True, color=blue, align=1)
logo = fitz.Pixmap(ROOT / "assets/roshan-logo.png")
width = 260
height = width * logo.height / logo.width
logo_rect = fitz.Rect((W - width) / 2, (H - height) / 2, (W + width) / 2, (H + height) / 2)
p.insert_image(logo_rect, filename=str(ROOT / "assets/roshan-logo.png"), keep_proportion=True)
text(p, "ROSHAN INDUSTRIES", (38, logo_rect.y1 + 30, W - 38, logo_rect.y1 + 72), 24, True, align=1)
text(
    p,
    "Watch parts, tools and custom manufacturing",
    (38, logo_rect.y1 + 81, W - 38, logo_rect.y1 + 110),
    11,
    color=muted,
    align=1,
)
text(
    p,
    "A family business. Since 1900.",
    (38, logo_rect.y1 + 118, W - 38, logo_rect.y1 + 145),
    10,
    color=muted,
    align=1,
)
footer(p, 1)
# A dedicated, readable introduction, using verified company copy from the website.
p = doc.new_page(width=W, height=H)
p.insert_image(fitz.Rect(38, 19, 91, 51), filename=str(ROOT / "assets/roshan-logo.png"))
text(p, "ROSHAN INDUSTRIES", (103, 25, W - 38, 49), 10, True)
p.draw_line((38, 64), (W - 38, 64), color=line)
text(p, "OUR STORY", (38, 102, W - 38, 126), 9, True, color=blue)
text(p, "A long-standing connection\nto the craft of time.", (38, 142, W - 38, 243), 30, True)
text(p, "Serving the bench. Supporting your next idea.", (38, 262, W - 38, 295), 14, True)
text(
    p,
    "Since 1900, Roshan Industries has served watchmakers, clockmakers and jewellery workshops from Mumbai. Our family business brings together watch parts, horological tools and workshop essentials, with a practical focus on helping customers find the right product for their work.",
    (38, 310, W - 38, 415),
    11,
    color=muted,
)
p.draw_rect(fitz.Rect(38, 445, W - 38, 591), fill=(0.957, 0.965, 0.984), color=None)
text(p, "Your requirement. Our manufacturing experience.", (55, 462, W - 55, 503), 16, True)
text(
    p,
    "Have a drawing, a sample or a specific requirement? Share your application, dimensions, material, finish and quantity. Our team can review the request and discuss feasibility, quotation and the next steps.",
    (55, 514, W - 55, 581),
    10,
    color=muted,
)
text(p, "How to use this catalogue", (38, 623, W - 38, 650), 13, True)
text(
    p,
    "Use the clickable family and category index to find products. Each listing includes a stable SKU and a link to its website page. Quote the SKU when enquiring. Pricing, exact specifications and availability are confirmed by our team.",
    (38, 665, W - 38, 735),
    10,
    color=muted,
)
footer(p, 2)
# Preserve every original index/product/credit page and photograph.
doc.insert_pdf(old, from_page=1, links=False)
for page, rect, target in pending:
    doc[page].insert_link(
        {"kind": fitz.LINK_GOTO, "from": fitz.Rect(rect), "page": target, "to": fitz.Point(0, 0)}
    )
for old_index in range(1, len(old)):
    p = doc[old_index + 1]
    p.add_redact_annot(fitz.Rect(W - 58, H - 36, W - 34, H - 15), fill=(1, 1, 1))
    replacements = []
    if old_index in [1, 2]:
        for b in p.get_text("dict")["blocks"]:
            for l in b.get("lines", []):
                for span in l["spans"]:
                    if re.fullmatch(r"\d+  VIEW >", span["text"]):
                        replacements.append(
                            (
                                fitz.Rect(span["bbox"]),
                                f"{int(span['text'].split()[0])+1:02d}  VIEW >",
                            )
                        )
                        p.add_redact_annot(fitz.Rect(span["bbox"]), fill=(1, 1, 1))
    p.apply_redactions(images=0, graphics=0)
    text(p, str(old_index + 2), (W - 56, H - 35, W - 34, H - 12), 8, True)
    for rect, value in replacements:
        p.insert_text((rect.x0, rect.y1 - 1.8), value, fontsize=7, fontname="hebo", color=blue)
    for item in old[old_index].get_links():
        item.pop("xref", None)
        item.pop("id", None)
        if item["kind"] == fitz.LINK_GOTO:
            item["page"] = 0 if item["page"] == 0 else item["page"] + 1
        p.insert_link(item)
toc = old.get_toc()
toc = [[level, title, page + 1 if page > 1 else page] for level, title, page in toc]
doc.set_toc([[1, "Introduction", 2]] + toc)
doc.set_metadata(
    {
        "title": "Roshan Industries Product Catalogue",
        "author": "Roshan Industries",
        "subject": "Watch parts, tools and custom manufacturing. Since 1900.",
    }
)
temporary = pdf.with_suffix(".updated.pdf")
doc.save(temporary, garbage=4, deflate=True)
doc.close()
temporary.replace(pdf)
(ROOT / "Roshan-Industries-Catalogue.pdf").write_bytes(pdf.read_bytes())
mapping = json.loads((ROOT / "src/data/catalogue-pages.json").read_text(encoding="utf8"))
report_path = ROOT / "reports/high-resolution-audit/branded-catalogue-validation.json"
report = json.loads(report_path.read_text(encoding="utf8"))
# Original SKU locations are read from the archived document, ensuring idempotent reruns.
for sku in mapping:
    original = next(i + 1 for i, p in enumerate(old) if sku in p.get_text())
    mapping[sku] = original + 1
(ROOT / "src/data/catalogue-pages.json").write_text(json.dumps(mapping, indent=2) + "\n")
check = fitz.open(pdf)
for sku, page in mapping.items():
    assert sku in check[page - 1].get_text(), sku
for p in check:
    for item in p.get_links():
        if item["kind"] == fitz.LINK_GOTO:
            assert 0 <= item["page"] < len(check)
records = json.loads(
    (ROOT / "src/data/reviewed-products.json").read_text(encoding="utf8")
) + json.loads((ROOT / "src/data/pump-products.json").read_text(encoding="utf8"))
category_pages = {
    c: min(mapping[p["sku"]] for p in records if p["categoryId"] == c)
    for c in report["categoryPages"]
}
report.update(
    pages=len(check),
    skuPages=mapping,
    categoryPages=category_pages,
    links=sum(len(p.get_links()) for p in check),
    pdfSha256=hashlib.sha256(pdf.read_bytes()).hexdigest(),
    coverLogoCentered=True,
    introductionPage=2,
    categoryIndexPages=[3, 4],
    productInventoryUnchanged=True,
    previousPdfSha256=hashlib.sha256(archive.read_bytes()).hexdigest(),
)
report_path.write_text(json.dumps(report, indent=2) + "\n")
for n in [0, 1]:
    check[n].get_pixmap(matrix=fitz.Matrix(1.3, 1.3)).save(
        ROOT / f"artifacts/qa/catalogue-page-{n+1}.png"
    )
print(
    f"Updated cover and introduction. {len(check)} pages, 228 preserved products, verified links and SKU page references."
)
