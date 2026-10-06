"""Rebuild verified exports, then add the photographed pump enquiry range."""
from pathlib import Path
from io import BytesIO
from copy import copy
import json, runpy, hashlib
from PIL import Image
from pypdf import PdfReader, PdfWriter
from pypdf.annotations import Link
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from openpyxl import load_workbook
from openpyxl.drawing.image import Image as ExcelImage
from openpyxl.styles import Font, PatternFill
from openpyxl.worksheet.table import Table, TableStyleInfo

ROOT = Path(__file__).resolve().parent.parent
# Preserve the existing source-photo audit before extending the customer exports.
base = runpy.run_path(str(ROOT / 'scripts/prepare-premium-pdf.py'))
products = json.loads((ROOT / 'products.js').read_text(encoding='utf8').split('window.ROSHAN_PRODUCTS =')[1].strip().rstrip(';'))
pumps = [p for p in products if p.get('onlineRange')]
groups = {}
for p in pumps:
    groups.setdefault(p['category'], []).append(p)
# Keep each pump category together in the PDF without changing permanent SKUs.
pumps = [p for items in groups.values() for p in items]
pdf_path = base['OUTPUT']
reader = PdfReader(pdf_path)
W, H = base['W'], base['H']
first = len(reader.pages)
writer = PdfWriter()
writer.append(reader)
style = ParagraphStyle('PumpBody', fontName='PremiumBody', fontSize=10, leading=15, textColor=base['navy'])

def paragraph(c, text, x, y, width, size=10):
    para = Paragraph(text.replace('&', '&amp;'), ParagraphStyle('Body', parent=style, fontSize=size, leading=size*1.5))
    _, height = para.wrap(width, H)
    para.drawOn(c, x, y-height)
    return y-height

def heading(c, title):
    c.setFillColor(base['blue'])
    c.rect(0, H-6, W, 6, fill=1, stroke=0)
    base['label'](c, 'ROSHAN INDUSTRIES', 40, H-40, 12, bold=True)
    base['label'](c, 'SINCE 1900 / 125+ YEARS OF SERVICE', 40, H-57, 7, base['muted'])
    base['label'](c, title, 40, H-102, 21, bold=True)

buf = BytesIO()
c = canvas.Canvas(buf, pagesize=(W, H))
pump_annotations = []
heading(c, 'Explore pumps.')
paragraph(c, '200+ products across our catalogue and enquiry range. This section adds 12 pump entries. Photographs show reference equipment; specifications and availability are confirmed on enquiry.', 40, H-128, W-80)
y = H-210
category_targets = {}
for category, items in groups.items():
    target = first + 1 + pumps.index(items[0])
    category_targets[category] = target
    base['label'](c, category, 40, y, 12, bold=True)
    base['label'](c, f'{len(items)} entries / VIEW >', W-175, y, 9, base['blue'])
    y -= 49
base['footer'](c, first+1, index=True)
c.showPage()
for i, p in enumerate(pumps):
    heading(c, p['name'])
    base['label'](c, f"{p['sku']} / {p['category']}", 40, H-128, 10, base['blue'], True)
    base['label'](c, 'PUMP ENQUIRY RANGE', 40, H-149, 8, base['muted'])
    c.drawImage(ImageReader(str(ROOT/p['image'])), 50, H-485, W-100, 300, preserveAspectRatio=True, anchor='c', mask='auto')
    y = paragraph(c, p['description'], 40, H-510, W-80)
    y = paragraph(c, p['note'], 40, y-14, W-80, 8)
    y = paragraph(c, 'Photo: ' + p['imageCredit'] + '. ' + p['imageChanges'], 40, y-14, W-80, 7)
    for text, offset, url in [('Photo source',16,p['imageSource']), ('Photo licence',32,p['imageLicense']), ('View product online',50,base['website']+'/'+p['url'])]:
        base['label'](c, text, 40, y-offset, 8, base['blue'])
        pump_annotations.append((first+i+1,(40,y-offset-3,250,y-offset+10),url))
    base['footer'](c, first+i+2, index=True)
    c.showPage()
c.save()
extra = PdfReader(buf)
for page in extra.pages:
    writer.add_page(page)
# Connect the original category index to the pump section without disturbing its links.
overlay_buf = BytesIO()
overlay = canvas.Canvas(overlay_buf, pagesize=(W,H))
base['label'](overlay, 'PUMPS / 6 CATEGORIES / 12 ENQUIRY ENTRIES / VIEW >', 40, 66, 8, base['blue'], True)
overlay.save()
writer.pages[2].merge_page(PdfReader(overlay_buf).pages[0])
writer.add_annotation(2, Link(rect=(40,54,W-40,82), target_page_index=first))
parent = writer.add_outline_item('Pumps enquiry range', first)
for i, (category, target) in enumerate(category_targets.items()):
    y = H-210-49*i
    writer.add_annotation(first, Link(rect=(40,y-12,W-40,y+18), target_page_index=target))
    writer.add_outline_item(category, target, parent=parent)
report = json.loads((ROOT/'reports/premium-catalogue-audit.json').read_text())
for i, p in enumerate(pumps):
    number = first+i+1
    report['sku_pages'][p['sku']] = number+1
for number, rect, url in pump_annotations:
    writer.add_annotation(number, Link(rect=rect, url=url))
for number in range(first, len(writer.pages)):
    writer.add_annotation(number, Link(rect=(W-169,15,W-78,37), target_page_index=2))
    writer.add_annotation(number, Link(rect=(225,9,411,23), url='https://wa.me/919821216170'))
writer.add_metadata({'/Title': 'Roshan Industries | 200+ Products', '/Author': 'Roshan Industries', '/Subject': '200 verified catalogue products plus 12 pump enquiry entries'})
with pdf_path.open('wb') as out:
    writer.write(out)
final = PdfReader(pdf_path)
content = '\n'.join(page.extract_text() or '' for page in final.pages)
assert len(final.pages) == first+1+len(pumps)
for p in products:
    assert content.count(p['sku']) == 1, p['sku']
internal_links = 0
for page in final.pages:
    for ref in page.get('/Annots', []):
        annotation = ref.get_object()
        dest = annotation.get('/Dest') or annotation.get('/A', {}).get('/D')
        if isinstance(dest, list):
            assert 0 <= final.get_page_number(dest[0].get_object()) < len(final.pages)
            internal_links += 1
(ROOT/'assets/roshan-updated-product-catalogue.pdf').write_bytes(pdf_path.read_bytes())
report.update(pages=len(final.pages), products=len(products), verified_source_products=200, pump_enquiry_entries=len(pumps), categories=21, family_links=5, category_links=21, verified_internal_links=internal_links, verified_pdf_sha256=hashlib.sha256(pdf_path.read_bytes()).hexdigest())
report['category_pages'].update({k:v+1 for k,v in category_targets.items()})
(ROOT/'reports/premium-catalogue-audit.json').write_text(json.dumps(report, indent=2), encoding='utf8')

# Base workbook still independently audits the 200 original source panels.
workbook = runpy.run_path(str(ROOT/'scripts/export-workbook.py'))
destination = workbook['destination']
wb = load_workbook(destination)
master = wb['All Products']
template = wb[workbook['names'][next(iter(workbook['groups']))]]

def add_entry(ws, p, photo=False):
    ws.append(['', p['sku'], p['name'], p['category'], p['family'], '', '', p['id'], p['note'], 'Open product page', p['description'], 'Discuss requirements and feasibility with our team.', report['sku_pages'][p['sku']], 'Open premium catalogue'])
    row = ws.max_row
    for col in range(1,15):
        ws.cell(row,col)._style = copy(template.cell(6,col)._style)
    ws.row_dimensions[row].height = 110 if photo else 60
    ws.cell(row,10).hyperlink = p['url']
    ws.cell(row,14).hyperlink = 'assets/roshan-updated-product-catalogue.pdf#page='+str(report['sku_pages'][p['sku']])
    if photo:
        im = Image.open(ROOT/p['image']).convert('RGBA')
        bg = Image.new('RGBA', im.size, 'white')
        im = Image.alpha_composite(bg, im).convert('RGB')
        im.thumbnail((105,105))
        stream = BytesIO()
        im.save(stream,format='PNG'); stream.seek(0)
        ws.add_image(ExcelImage(stream),f'A{row}')

for category, items in groups.items():
    ws = wb.create_sheet(category)
    workbook['setup'](ws, category, [cell.value for cell in master[5]], [17,16,48,31,25,12,10,18,58,28,76,42,18,26])
    ws.cell(3,1,'Roshan Industries / Pump enquiry range / 06 October 2026')
    for p in items:
        add_entry(ws,p,True)
        add_entry(master,p)
    workbook['table'](ws,len(wb.worksheets))
for table in master.tables.values():
    table.ref=f'A5:N{master.max_row}'
summary=wb['Overview']
summary['A4']='200+ products / 21 categories / 200 verified source products + 12 pump enquiry entries'
for i, (category, items) in enumerate(groups.items(),43):
    summary.cell(i,1,category); summary.cell(i,2,len(items))
    summary.cell(i,3,'View products').hyperlink=f"#'{category}'!A1"
    summary.cell(i,3).style='Hyperlink'
credits=wb.create_sheet('Pump Photo Credits')
credits.append(['SKU','Product','Photographer / licence','Source URL','Licence URL','Image changes'])
for p in pumps:
    credits.append([p['sku'],p['name'],p['imageCredit'],p['imageSource'],p['imageLicense'],p['imageChanges']])
    credits.cell(credits.max_row,4).hyperlink=p['imageSource']
    credits.cell(credits.max_row,5).hyperlink=p['imageLicense']
for col in 'ABCDEF': credits.column_dimensions[col].width=45
credits.freeze_panes='A2'
wb.save(destination)
check=load_workbook(destination)
assert check['All Products'].max_row-5 == len(products)
assert sum(len(check[c]._images) for c in groups) == len(pumps)
assert all(p['sku'] in content for p in pumps)
for category in groups:
    for row in check[category].iter_rows(min_row=6):
        assert row[12].value == report['sku_pages'][row[1].value]
        assert (ROOT/row[9].hyperlink.target).is_file()
print(json.dumps({'pdf_pages':len(final.pages),'entries':len(products),'pump_photos':len(pumps),'xlsx':str(destination)}))
(ROOT/'reports/export-audit.json').write_text(json.dumps({'pdf_pages':len(final.pages),'entries':len(products),'categories':21,'embedded_category_photos':212,'verified_source_panels':200,'pump_reference_photos':12,'xlsx':destination.name},indent=2),encoding='utf8')
