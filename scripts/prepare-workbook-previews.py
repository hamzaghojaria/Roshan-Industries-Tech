import sys,json,base64
from pathlib import Path
sys.path.insert(0,'../.site-tools/python-export')
sys.path.insert(0,'scripts')
from export_data import load_products
from workbook_images import preview_bytes
from PIL import Image
root=Path.cwd();items={}
for p in load_products(root):
 data=preview_bytes(root/p['image'])
 from io import BytesIO
 with Image.open(BytesIO(data)) as image: width,height=image.size
 items[p['image']]={'dataUrl':'data:image/jpeg;base64,'+base64.b64encode(data).decode(),'width':width,'height':height}
(root/'artifacts/workbook-previews.json').write_text(json.dumps(items),encoding='utf8')
print('Prepared source-matched workbook thumbnails.')
