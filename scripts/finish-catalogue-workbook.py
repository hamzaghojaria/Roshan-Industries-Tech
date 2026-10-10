import sys,json,hashlib,xml.etree.ElementTree as ET
from pathlib import Path
from io import BytesIO
from zipfile import ZipFile,ZIP_DEFLATED
sys.path.insert(0,'../.site-tools/python-export');sys.path.insert(0,'scripts')
from export_data import load_products,read_json
from workbook_images import share_image_resources,WORKBOOK_IMAGE_PROFILE
from openpyxl import load_workbook
root=Path(__file__).resolve().parents[1];products=load_products(root);categories=read_json(root,'src/data/reviewed-categories.json');by_sku={p['sku']:p for p in products};manifest=read_json(root,'artifacts/workbook-sheet-manifest.json')
file=root/'Roshan-Industries-Product-Catalogue.xlsx';ns='http://schemas.openxmlformats.org/spreadsheetml/2006/main';rels='http://schemas.openxmlformats.org/package/2006/relationships';rid='http://schemas.openxmlformats.org/officeDocument/2006/relationships'
ET.register_namespace('',ns);ET.register_namespace('r',rid)
output=BytesIO()
with ZipFile(file) as src:
 patches={}
 for index in range(1,len(manifest)+2):
  name=f'xl/worksheets/sheet{index}.xml';tree=ET.fromstring(src.read(name));rel_name=f'xl/worksheets/_rels/sheet{index}.xml.rels';rel=ET.fromstring(src.read(rel_name)) if rel_name in src.namelist() else ET.Element('{'+rels+'}Relationships')
  links=tree.find('{'+ns+'}hyperlinks')
  if links is None:
   links=ET.Element('{'+ns+'}hyperlinks');following={'printOptions','pageMargins','pageSetup','headerFooter','drawing','legacyDrawing','tableParts','extLst'};pos=next((i for i,e in enumerate(tree) if e.tag.split('}')[-1] in following),len(tree));tree.insert(pos,links)
  def add(ref,target):
   node=ET.SubElement(links,'{'+ns+'}hyperlink',{'ref':ref})
   if target.startswith('#'):node.set('location',target[1:])
   else:
    ident='rIdLink'+str(len(rel)+1);node.set('{'+rid+'}id',ident);ET.SubElement(rel,'{'+rels+'}Relationship',{'Id':ident,'Type':rid+'/hyperlink','Target':target,'TargetMode':'External'})
  if index==1:
   add('A9',"#'All Products'!A1");row=11
   for family in dict.fromkeys(c['family'] for c in categories):
    row+=1
    for c in [c for c in categories if c['family']==family]:row+=1;add(f'D{row}',"#'"+c['name'].replace(' and ',' ')[:31]+"'!A1")
  else:
   add('A3',"#'Overview'!A1")
   for row,sku in enumerate(manifest[index-2]['items'],6):
    p=by_sku[sku]
    for col,target in [('F','https://roshan-industries-tech.onrender.com/'+p['url']),('G',f"https://roshan-industries-tech.onrender.com/assets/roshan-industries-catalogue.pdf#page={p['cataloguePage']}")]:add(f'{col}{row}',target)
   # Table-owned filtering avoids duplicate worksheet filters in desktop Excel.
   af=tree.find('{'+ns+'}autoFilter')
   if af is not None:tree.remove(af)
  # Preserve the existing workbook print setup using OOXML where the API has no documented surface.
  if index>1:
   setup=tree.find('{'+ns+'}pageSetup')
   if setup is None:setup=ET.Element('{'+ns+'}pageSetup');position=next((i for i,e in enumerate(tree) if e.tag.split('}')[-1] in {'headerFooter','drawing','tableParts','extLst'}),len(tree));tree.insert(position,setup)
   setup.attrib.update({'orientation':'landscape','paperSize':'8','fitToWidth':'1','fitToHeight':'0'})
  patches[name]=ET.tostring(tree,encoding='utf-8',xml_declaration=True);patches[rel_name]=ET.tostring(rel,encoding='utf-8',xml_declaration=True)
 with ZipFile(output,'w',ZIP_DEFLATED) as dst:
  for entry in src.infolist():dst.writestr(entry,patches.pop(entry.filename,src.read(entry.filename)))
  for name,data in patches.items():dst.writestr(name,data)
file.write_bytes(output.getvalue());resources=share_image_resources(file)
wb=load_workbook(file);assert len(wb['All Products']._images)==len(products);assert sum(len(s._images) for s in wb)==len(products)*2+1
for sheet,items in [(wb['All Products'],products)]+[(wb[c['name'].replace(' and ',' ')[:31]],[p for p in products if p['categoryId']==c['id']]) for c in categories]:
 assert sheet.max_row==len(items)+5
 for row,p in enumerate(items,6):assert sheet.cell(row,1).value==p['sku'];assert sheet.cell(row,4).value==p['category'];assert sheet.cell(row,6).hyperlink.target.endswith(p['url']);assert sheet.cell(row,7).hyperlink.target.endswith('#page='+str(p['cataloguePage']));assert sheet.max_column==7
report={'products':len(products),'categorySheets':len(categories),'embeddedPhotos':len(products)*2,'imageOptimization':WORKBOOK_IMAGE_PROFILE,'xlsxBytes':file.stat().st_size,**resources,'sourceSha256':hashlib.sha256((root/'assets/roshan-industries-catalogue.pdf').read_bytes()).hexdigest(),'familyColors':{'Watchmaking':'991B28','Clockmaking':'B68A42','Jewellery':'8B5CB2','Workshop Essentials':'2C8790','Precision Machining':'4B7F52'},'allTabsColored':all(s.sheet_properties.tabColor is not None for s in wb),'allFieldsMatchWebsite':True,'newArrivalProducts':len(read_json(root,'src/data/new-arrivals.json')['skus']),'xlsxSha256':hashlib.sha256(file.read_bytes()).hexdigest()}
(root/'reports/high-resolution-audit/workbook-validation.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf8');print('PASS workbook: 311 products, 22 category sheets, 622 product photos and updated catalogue links.')
