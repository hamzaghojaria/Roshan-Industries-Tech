"""Create the branded, internally linked catalogue from the reviewed website data."""
from pathlib import Path
from io import BytesIO
from collections import OrderedDict
import json
import math
import shutil
from xml.sax.saxutils import escape
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / 'Roshan-Industries-Product-Catalogue.pdf'
products = json.loads((ROOT / 'products.js').read_text(encoding='utf8').split('window.ROSHAN_PRODUCTS =', 1)[1].strip().rstrip(';'))
assert len(products) == len({p['sku'] for p in products}) == 200
families = ['Watchmaking', 'Clockmaking', 'Jewellery', 'Workshop Essentials']
groups = {family: OrderedDict() for family in families}
for product in products:
    groups[product['family']].setdefault(product['category'], []).append(product)

# Embedded fonts keep product names readable, including symbols and punctuation.
font_root = Path('C:/Windows/Fonts')
if (font_root / 'segoeui.ttf').exists():
    pdfmetrics.registerFont(TTFont('Body', str(font_root / 'segoeui.ttf')))
    pdfmetrics.registerFont(TTFont('Bold', str(font_root / 'segoeuib.ttf')))
else:
    font_root = Path('/usr/share/fonts/truetype/dejavu')
    pdfmetrics.registerFont(TTFont('Body', str(font_root / 'DejaVuSans.ttf')))
    pdfmetrics.registerFont(TTFont('Bold', str(font_root / 'DejaVuSans-Bold.ttf')))
NAVY, BLUE, MUTED, LINE, PALE = map(HexColor, ['#111d30', '#315bd6', '#60718b', '#dce5f1', '#f1f5fc'])
W, H, M = 595.28, 841.89, 38
c = canvas.Canvas(str(OUTPUT), pagesize=(W, H), pageCompression=1)
c.setTitle('Roshan Industries | Product Catalogue')
c.setAuthor('Roshan Industries')
c.setSubject('200 products with SKUs, category families and clickable navigation')
style = ParagraphStyle('Body', fontName='Body', fontSize=10, leading=15, textColor=MUTED)
name_style = ParagraphStyle('Name', fontName='Bold', fontSize=11, leading=15, textColor=NAVY)

def text(value, x, y, size=10, color=NAVY, bold=False):
    c.setFillColor(color)
    c.setFont('Bold' if bold else 'Body', size)
    c.drawString(x, y, value)

def paragraph(value, x, top, width, custom_style=style):
    p = Paragraph(escape(value), custom_style)
    _, height = p.wrap(width, H)
    p.drawOn(c, x, top-height)
    return height

def image(path, x, y, width, height):
    with Image.open(path) as source:
        # Composite the transparent company logo onto white before JPEG encoding.
        rgba = source.convert('RGBA')
        background = Image.new('RGBA', rgba.size, 'white')
        img = Image.alpha_composite(background, rgba).convert('RGB')
        img.thumbnail((700, 700))
        buffer = BytesIO()
        img.save(buffer, format='JPEG', quality=90, optimize=True)
        c.drawImage(ImageReader(buffer), x, y, width, height, preserveAspectRatio=True, anchor='c', mask='auto')

def start(title, subtitle=''):
    c.setFillColor(white)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    text('ROSHAN INDUSTRIES', M, H-38, 11, NAVY, True)
    text('WATCH PARTS & CUSTOM MANUFACTURING', M, H-55, 8, MUTED)
    c.setStrokeColor(LINE)
    c.line(M, H-70, W-M, H-70)
    text(title, M, H-104, 23, NAVY, True)
    if subtitle:
        text(subtitle, M, H-126, 10, MUTED)

def footer():
    c.setStrokeColor(LINE)
    c.line(M, 49, W-M, 49)
    text('Back to category index', M, 32, 9, BLUE)
    c.linkRect('', 'index', (M, 25, M+125, 43), relative=0, thickness=0)
    text('Roshan Industries', 237, 32, 8, MUTED)
    text(str(c.getPageNumber()), W-M-15, 32, 9, MUTED)
    c.showPage()

def category_id(family, category):
    return 'category-' + families.index(family).__str__() + '-' + str(list(groups[family]).index(category))

# Cover and linked index precede family dividers and six-product category pages.
c.bookmarkPage('cover')
start('Precision for your craft.', 'Product catalogue | Updated October 2026')
image(ROOT / 'assets/roshan-logo.png', M, H-280, 165, 108)
text('Custom products.', M, 492, 31, NAVY, True)
text('Made for your needs.', M, 449, 31, BLUE, True)
paragraph('Watch parts manufacturing in Mumbai, backed by over 100 years of heritage. Explore our watchmaking, clockmaking, jewellery and workshop range.', M, 405, 440)
for i, product in enumerate([products[0], next(p for p in products if p['id']=='p15-01'), next(p for p in products if p['id']=='p11-12')]):
    image(ROOT / product['image'], M+i*177, 170, 162, 162)
text('200 PRODUCTS   /   15 CATEGORIES   /   4 FAMILIES', M, 124, 11, BLUE, True)
text('Explore the clickable category index', M, 90, 11, BLUE, True)
c.linkRect('', 'index', (M, 80, W-M, 109), thickness=0)
footer()

c.bookmarkPage('index')
c.addOutlineEntry('Category index', 'index', level=0)
start('Find your category.', 'Click a family or category to jump directly to its section.')
y = H-160
for family in families:
    items = groups[family]
    count = sum(len(values) for values in items.values())
    text(family, M, y, 15, BLUE, True)
    text(f'{len(items)} categories / {count} products', 325, y, 9, MUTED)
    c.linkRect('', 'family-'+family, (M, y-8, W-M, y+20), thickness=0)
    y -= 26
    for category, values in items.items():
        text(category, M+12, y, 10, NAVY)
        text(str(len(values)), W-M-25, y, 10, BLUE, True)
        c.linkRect('', category_id(family, category), (M, y-7, W-M, y+13), thickness=0)
        y -= 22
    y -= 22
footer()

for family in families:
    c.bookmarkPage('family-'+family)
    c.addOutlineEntry(family, 'family-'+family, level=0)
    start(family, f'{len(groups[family])} categories / {sum(map(len, groups[family].values()))} products')
    paragraph('Choose a category below. Every product has a unique SKU for clear enquiries and reference.', M, H-165, W-2*M)
    y = H-230
    for category, values in groups[family].items():
        c.setFillColor(PALE)
        c.roundRect(M, y-54, W-2*M, 64, 9, fill=1, stroke=0)
        text(category, M+16, y-12, 12, NAVY, True)
        text(f'{len(values)} products  /  View category', M+16, y-34, 9, BLUE)
        c.linkRect('', category_id(family, category), (M, y-54, W-M, y+10), thickness=0)
        y -= 80
    footer()
    for category, values in groups[family].items():
        values = sorted(values, key=lambda p: p['sku'])
        for offset in range(0, len(values), 6):
            if offset == 0:
                destination = category_id(family, category)
                c.bookmarkPage(destination)
                c.addOutlineEntry(category, destination, level=1)
            start(category, f'{family} / {len(values)} products / Category page {offset//6+1} of {math.ceil(len(values)/6)}')
            for slot, product in enumerate(values[offset:offset+6]):
                col, row = slot%2, slot//2
                x, top = M+col*269, H-150-row*203
                c.setStrokeColor(LINE)
                c.setFillColor(white)
                c.roundRect(x, top-192, 250, 184, 8, fill=1, stroke=1)
                image(ROOT / product['image'], x+55, top-118, 140, 110)
                text(product['sku'], x+12, top-129, 9, BLUE, True)
                height = paragraph(product['name'], x+12, top-137, 226, name_style)
                assert height <= 50, (product['sku'], 'Product name exceeds card bounds')
            footer()

c.bookmarkPage('contact')
c.addOutlineEntry('Custom manufacturing & contact', 'contact', level=0)
start('Made around your requirements.', 'Custom manufacturing / Enquiries')
paragraph('Have a drawing, sample or idea? Share your dimensions, preferred materials, finish and quantity. Our team will review your requirements and confirm feasibility.', M, H-174, W-2*M)
text('CONTACT ROSHAN INDUSTRIES', M, H-275, 11, BLUE, True)
text('roshanindustriestech@gmail.com', M, H-308, 14, NAVY, True)
c.linkURL('mailto:roshanindustriestech@gmail.com', (M, H-318, W-M, H-289), thickness=0)
paragraph('C-20, 1st Singh Industrial Estate, Ram Mandir Road, Near Movie Star Cinema, Goregaon (W), Mumbai - 400 104.', M, H-355, W-2*M)
paragraph('Please quote the product SKU when enquiring. Images show catalogue models; confirm dimensions, materials, available variants and lead times with our team.', M, H-445, W-2*M)
footer()
c.save()

# Verify completeness and internal destinations before making the PDF downloadable.
reader = PdfReader(OUTPUT)
content = '\n'.join(page.extract_text() for page in reader.pages)
for product in products:
    assert content.count(product['sku']) == 1, product['sku']
links = [annotation.get_object() for page in reader.pages for annotation in page.get('/Annots', [])]
assert all(link.get('/Dest') for link in links if not link.get('/A'))
assert len(reader.outline) >= 6
shutil.copyfile(OUTPUT, ROOT / 'assets/roshan-updated-product-catalogue.pdf')
print(json.dumps({'pdf': str(OUTPUT), 'pages': len(reader.pages), 'products': len(products), 'clickable_links': len(links), 'bytes': OUTPUT.stat().st_size}))
