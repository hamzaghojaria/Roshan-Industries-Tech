"""Audit and repair the owner-supplied premium PDF while preserving its design."""
from pathlib import Path
from io import BytesIO
from collections import OrderedDict
import json, re, hashlib, shutil, os
from PIL import Image, ImageChops, ImageStat
from pypdf import PdfReader, PdfWriter
from pypdf.generic import NameObject, TextStringObject
from pypdf.annotations import Link
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT = Path(__file__).resolve().parent.parent
# Reference documents stay outside the Git repository and deployment assets.
SOURCE = Path(os.environ.get('ROSHAN_PREMIUM_SOURCE', str(ROOT.parent / 'reference-documents/roshan-premium-catalogue-source.pdf')))
if not SOURCE.is_file():
    raise FileNotFoundError('Set ROSHAN_PREMIUM_SOURCE to the owner-supplied premium PDF before running catalogue exports.')
OUTPUT = ROOT / 'Roshan-Industries-Catalogue-Premium-Verified.pdf'
reader = PdfReader(SOURCE)
products = json.loads((ROOT/'products.js').read_text(encoding='utf8').split('window.ROSHAN_PRODUCTS =', 1)[1].strip().rstrip(';'))
# Online enquiry additions are not panels in the verified source PDF.
products = [p for p in products if not p.get("onlineRange")]
by_sku = {p['sku']: p for p in products}
families = ['Watchmaking', 'Clockmaking', 'Jewellery', 'Workshop Essentials']
groups = {f: OrderedDict() for f in families}
for p in products:
    groups[p['family']].setdefault(p['category'], []).append(p)
normalize = lambda s: re.sub(r'[^a-z0-9]', '', s.lower())
sku_pages, category_pages, image_scores = {}, {}, {}
for number, page in enumerate(reader.pages):
    content = page.extract_text() or ''
    entries = list(re.finditer(r'RIT-\d{4}', content))
    if not entries:
        continue
    images = [i.image.convert('RGB').resize((32, 32)) for i in page.images]
    for entry in entries:
        sku = entry.group()
        assert sku in by_sku and sku not in sku_pages, ('Unknown or repeated SKU', sku)
        p = by_sku[sku]
        tail = content[entry.end():]
        end = re.search(r'RIT-\d{4}|Back to category index', tail)
        name = tail[:end.start()] if end else tail
        assert normalize(name) == normalize(p['name']), (sku, 'Name mismatch', name)
        assert p['category'] in content and p['family'] in content, (sku, 'Category mismatch')
        source_image = Image.open(ROOT/p['image']).convert('RGB').resize((32, 32))
        score = min(sum(ImageStat.Stat(ImageChops.difference(source_image, image)).mean)/3 for image in images)
        assert score < 5, (sku, 'Image mismatch', score)
        image_scores[sku] = round(score, 3)
        sku_pages[sku] = number+1
        category_pages.setdefault(p['category'], number)
assert set(sku_pages) == set(by_sku) and len(sku_pages) == 200

fonts = Path('C:/Windows/Fonts')
if (fonts/'segoeui.ttf').exists():
    regular, bold = fonts/'segoeui.ttf', fonts/'segoeuib.ttf'
else:
    fonts = Path('/usr/share/fonts/truetype/dejavu')
    regular, bold = fonts/'DejaVuSans.ttf', fonts/'DejaVuSans-Bold.ttf'
pdfmetrics.registerFont(TTFont('PremiumBody', str(regular)))
pdfmetrics.registerFont(TTFont('PremiumBold', str(bold)))
navy, blue, muted, line = map(HexColor, ['#111d30', '#315bd6', '#60718b', '#e4e9f2'])
W, H = float(reader.pages[0].mediabox.width), float(reader.pages[0].mediabox.height)
website = 'https://roshan-industries-tech.onrender.com'
writer = PdfWriter()

def label(c, value, x, y, size=9, color=navy, bold=False):
    c.setFillColor(color)
    c.setFont('PremiumBold' if bold else 'PremiumBody', size)
    c.drawString(x, y, value)

def footer(c, number, index=False):
    c.setFillColor(white)
    c.rect(0, 0, W, 51, fill=1, stroke=0)
    c.setStrokeColor(line)
    c.line(38, 49, W-38, 49)
    label(c, 'ROSHAN INDUSTRIES', 38, 31, 6.5, bold=True)
    label(c, 'SINCE 1900 / 125+ YEARS OF SERVICE', 38, 20, 5.5, muted)
    label(c, 'roshan-industries-tech.onrender.com', 225, 30, 6, blue)
    label(c, 'Call / WhatsApp: +91 98212 16170', 225, 17, 7, blue)
    if index:
        c.setFillColor(HexColor('#f1f5fc'))
        c.roundRect(W-169, 15, 91, 22, 3, fill=1, stroke=0)
        label(c, 'CATEGORY INDEX', W-159, 23, 6.5, blue, True)
    label(c, f'{number:02}', W-56, 25, 7, bold=True)

index_links = []
for number, page in enumerate(reader.pages):
    # Replace obsolete text in the content stream, rather than only covering it.
    stream = page.get_contents()
    replacements = {
        'Mumbai, India  |  Over 100 years of manufacturing heritage': 'Mumbai, India  |  Since 1900  |  125+ years of service',
        'Custom product manufacturing in Mumbai, backed by over 100 years of heritage.': 'Custom manufacturing in Mumbai. Since 1900. 125+ years of service.',
        '100+': '125+',
    }
    for operands, operator in stream.operations:
        if operator == b'Tj':
            value = str(operands[0])
            value = replacements.get(value, value)
            value = value.replace('Side bar selector ? ', 'Side bar selector - ')
            operands[0] = TextStringObject(value)
    page[NameObject('/Contents')] = stream
    if '/Annots' in page:
        del page['/Annots']  # Rebuild known links; remove stale, overlapping destinations.
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=(W, H))
    if number == 2:
        # Recreate the index as one clean text layer with all family/category links.
        c.setFillColor(white)
        c.rect(0, 0, W, H, fill=1, stroke=0)
        c.setFillColor(blue)
        c.rect(0, H-5, W, 5, fill=1, stroke=0)
        logo = Image.open(ROOT/'assets/roshan-logo.png').convert('RGBA')
        bg = Image.new('RGBA', logo.size, 'white')
        logo = Image.alpha_composite(bg, logo).convert('RGB')
        c.drawImage(ImageReader(logo), 38, H-55, 48, 31, preserveAspectRatio=True)
        label(c, 'ROSHAN INDUSTRIES', 94, H-33, 10, bold=True)
        label(c, 'WATCH PARTS & CUSTOM MANUFACTURING', 94, H-48, 6, muted)
        label(c, 'Find your category.', 40, H-100, 23, bold=True)
        label(c, 'Click a family, category name or VIEW to jump to its first product page.', 40, H-123, 8, muted)
        y = H-160
        for family in families:
            c.setFillColor(HexColor('#f4f6fb'))
            c.rect(40, y-9, W-80, 28, fill=1, stroke=0)
            label(c, family.upper(), 51, y, 8, blue, True)
            total = sum(map(len, groups[family].values()))
            label(c, f'{total} products', W-105, y, 7, muted)
            target = category_pages[next(iter(groups[family]))]
            index_links.append(((40, y-9, W-40, y+19), target))
            y -= 33
            for category, values in groups[family].items():
                label(c, category, 51, y, 9, bold=True)
                label(c, f'{len(values)} products', W-147, y, 7, muted)
                label(c, 'VIEW >', W-83, y, 7, blue, True)
                c.setStrokeColor(line)
                c.line(51, y-9, W-51, y-9)
                index_links.append(((40, y-9, W-40, y+14), category_pages[category]))
                y -= 26
            y -= 17
    footer(c, number+1, index=number >= 3)
    c.save()
    overlay = PdfReader(buffer).pages[0]
    if number == 2:
        # The new index replaces the old page so hidden duplicate content is removed.
        writer.add_page(overlay)
    else:
        page.merge_page(overlay)
        writer.add_page(page)

def jump(page, rect, target):
    writer.add_annotation(page, Link(rect=rect, target_page_index=target))

for rect, target in index_links:
    jump(2, rect, target)
for number in range(len(writer.pages)):
    writer.add_annotation(number, Link(rect=(225, 25, 411, 38), url=website))
    writer.add_annotation(number, Link(rect=(225, 9, 411, 23), url='https://wa.me/919821216170'))
    if number >= 3:
        jump(number, (W-169, 15, W-78, 37), 2)
writer.add_annotation(1, Link(rect=(44, 115, 285, 134), url='mailto:roshanindustriestech@gmail.com'))
writer.add_outline_item('Category index', 2)
for family in families:
    parent = writer.add_outline_item(family, category_pages[next(iter(groups[family]))])
    for category in groups[family]:
        writer.add_outline_item(category, category_pages[category], parent=parent)
writer.add_metadata({'/Title': 'Roshan Industries | Premium Product Catalogue', '/Author': 'Roshan Industries', '/Subject': 'Since 1900 / 125+ years of service / 200 verified products'})
with OUTPUT.open('wb') as output:
    writer.write(output)

# Reopen the final file and verify every SKU and every repaired destination.
final = PdfReader(OUTPUT)
content = '\n'.join(page.extract_text() or '' for page in final.pages)
assert not re.search(r'100\+|100 years', content)
assert 'Side bar selector ?' not in content
for sku in by_sku:
    assert content.count(sku) == 1, sku
checked = 0
for number, page in enumerate(final.pages):
    for ref in page.get('/Annots', []):
        action = ref.get_object().get('/A', {})
        destination = ref.get_object().get('/Dest') or action.get('/D')
        if isinstance(destination, list):
            dest = final.get_page_number(destination[0].get_object())
            assert 0 <= dest < len(final.pages)
            if number >= 3:
                assert dest == 2
            checked += 1
assert checked == len(index_links)+len(final.pages)-3
assert len(index_links) == 19
shutil.copyfile(OUTPUT, ROOT/'assets/roshan-updated-product-catalogue.pdf')
report = {'source_pdf_sha256': hashlib.sha256(SOURCE.read_bytes()).hexdigest(), 'verified_pdf_sha256': hashlib.sha256(OUTPUT.read_bytes()).hexdigest(), 'pages': len(final.pages), 'products': len(products), 'categories': len(category_pages), 'family_links': 4, 'category_links': 15, 'verified_internal_links': checked, 'sku_pages': sku_pages, 'category_pages': {key: value+1 for key, value in category_pages.items()}, 'image_comparison_errors': image_scores, 'heritage': 'Since 1900 / 125+ years of service'}
(ROOT/'reports/premium-catalogue-audit.json').write_text(json.dumps(report, indent=2), encoding='utf8')
print(json.dumps({'pdf': str(OUTPUT), 'pages': len(final.pages), 'products': len(products), 'verified_internal_links': checked, 'bytes': OUTPUT.stat().st_size}))
