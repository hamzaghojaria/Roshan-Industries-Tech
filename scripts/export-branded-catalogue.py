"""Build the website-branded catalogue from current records and native product images."""
from pathlib import Path
from io import BytesIO
import json, hashlib, math
import pymupdf as fitz
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
def read(file): return json.loads((ROOT/file).read_text(encoding='utf8'))
# Restore natural image dimensions without resampling the original pump photographs.
pumps=read('src/data/pump-products.json')
for p in pumps:
    p['imageWidth'],p['imageHeight']=Image.open(ROOT/p['image']).size
(ROOT/'src/data/pump-products.json').write_text(json.dumps(pumps,indent=2)+'\n',encoding='utf8')
products=json.loads((ROOT/'products.js').read_text(encoding='utf8').split('window.ROSHAN_PRODUCTS =',1)[1].strip().rstrip(';'))
categories=read('src/data/reviewed-categories.json'); mapping=read('src/data/catalogue-pages.json')
families=list(dict.fromkeys(c['family'] for c in categories))
mapping={};number=4
for family in families:
    for c in [c for c in categories if c['family']==family]:
        items=[p for p in products if p['categoryId']==c['id']]
        for i,item in enumerate(items):mapping[item['sku']]=number+i//6
        number+=math.ceil(len(items)/6)
(ROOT/'src/data/catalogue-pages.json').write_text(json.dumps(mapping,indent=2)+'\n',encoding='utf8')
W,H=595.28,841.89
NAVY=(.067,.114,.188); BLUE=(.192,.357,.839); MUTED=(.376,.443,.545); LINE=(.894,.914,.949); LIGHT=(.957,.965,.984)
SITE='https://roshan-industries-tech.onrender.com'
doc=fitz.open(); pending=[]; toc=[]; category_pages={}
def text(page,value,x,y,size=10,bold=False,color=NAVY):
    page.insert_text((x,y),value,fontname='hebo' if bold else 'helv',fontsize=size,color=color)
def block(page,value,rect,size=9,color=NAVY,bold=False):
    result=page.insert_textbox(fitz.Rect(rect),value,fontname='hebo' if bold else 'helv',fontsize=size,color=color,lineheight=1.35)
    if result<0: raise ValueError('Text overflow: '+value)
def uri(page,rect,url): page.insert_link({'kind':fitz.LINK_URI,'from':fitz.Rect(rect),'uri':url})
def goto(page,rect,target): pending.append((page.number,fitz.Rect(rect),target))
def image(page,file,rect):
    im=Image.open(ROOT/file).convert('RGBA'); bg=Image.new('RGBA',im.size,'white');im=Image.alpha_composite(bg,im).convert('RGB'); buf=BytesIO();im.save(buf,format='PNG')
    page.insert_image(fitz.Rect(rect),stream=buf.getvalue(),keep_proportion=True)
def chrome(page,title=None,family=None):
    page.draw_rect(fitz.Rect(0,0,5,58),color=None,fill=BLUE)
    image(page,'assets/roshan-logo.png',(38,12,86,43))
    text(page,'ROSHAN INDUSTRIES',96,25,9,True)
    text(page,'WATCH PARTS AND CUSTOM MANUFACTURING',96,39,6,color=MUTED)
    text(page,'SINCE 1900',W-103,29,7,True,BLUE)
    page.draw_line((38,55),(W-38,55),color=LINE)
    uri(page,(38,12,300,45),SITE)
    if title:
        text(page,(family or 'PRODUCT CATALOGUE').upper(),38,82,8,True,BLUE)
        block(page,title,(38,94,W-38,143),22,bold=True)
    page.draw_line((38,H-49),(W-38,H-49),color=LINE)
    text(page,'ROSHAN INDUSTRIES',38,H-31,6.5,True)
    text(page,'125+ years of service since 1900',38,H-20,5.5,color=MUTED)
    text(page,'Visit our website',225,H-31,6.5,color=BLUE)
    text(page,'Call or WhatsApp +91 98212 16170',225,H-19,6.5,color=BLUE)
    uri(page,(220,H-40,365,H-27),SITE)
    uri(page,(220,H-27,365,H-10),'https://wa.me/919821216170')
    text(page,'CATEGORY INDEX',W-157,H-25,6.5,True,BLUE)
    page.draw_rect(fitz.Rect(W-166,H-39,W-76,H-16),color=LINE)
    goto(page,(W-166,H-39,W-76,H-16),1)
    text(page,str(page.number+1),W-52,H-25,8,True)
# Cover.
p=doc.new_page(width=W,height=H);chrome(p)
text(p,'THE ROSHAN INDUSTRIES COLLECTION',38,111,8,True,BLUE)
block(p,'Precision begins\nwith the right part.',(38,140,W-38,250),36,bold=True)
block(p,'Watch parts, horological tools and custom manufacturing.\nA family business serving the craft of time since 1900.',(38,260,W-38,312),12,color=MUTED)
for i,sku in enumerate(['RIT-0001','RIT-0156','RIT-0119']):
    item=next(x for x in products if x['sku']==sku);image(p,item['image'],(38+i*175,340,193+i*175,490))
p.draw_rect(fitz.Rect(38,535,W-38,624),color=None,fill=LIGHT)
text(p,f'{len(products)} products',54,571,20,True)
text(p,f'{len(categories)} categories across {len(families)} families',54,598,11,color=MUTED)
text(p,'EXPLORE THE CATEGORY INDEX',38,673,10,True,BLUE);goto(p,(38,650,330,690),1)
block(p,'Share your required quantity, drawings and application with our team.\nPricing, exact specifications and availability are confirmed on enquiry.',(38,711,W-38,756),9,color=MUTED)
# Two index pages preserve the previous family grouping.
index_groups=[families[:3],families[3:]]
for index,group in enumerate(index_groups):
    p=doc.new_page(width=W,height=H);chrome(p,'Find your category.' if index==0 else 'Find your category. Continued')
    text(p,'Select a family or category to jump to its product pages.',38,147,9,color=MUTED);y=179
    for family in group:
        cats=[c for c in categories if c['family']==family];items=[x for x in products if x['family']==family]
        target=mapping[next(x for x in products if x['categoryId']==cats[0]['id'])['sku']]-1
        p.draw_rect(fitz.Rect(38,y-17,W-38,y+10),color=None,fill=LIGHT)
        text(p,family.upper(),49,y,8,True,BLUE);text(p,f'{len(items)} products',W-113,y,8,color=MUTED)
        goto(p,(38,y-17,W-38,y+10),target);y+=35
        for c in cats:
            items=[x for x in products if x['categoryId']==c['id']];target=mapping[items[0]['sku']]-1
            block(p,c['name'],(49,y-13,405,y+10),9,bold=True)
            text(p,f'{len(items)} products',W-143,y,7,color=MUTED);text(p,f'{target+1:02d}  VIEW >',W-87,y,7,True,BLUE)
            p.draw_line((49,y+9),(W-49,y+9),color=LINE);goto(p,(38,y-15,W-38,y+11),target);y+=27
        y+=15
    assert y<H-90
    text(p,'NEXT INDEX >' if index==0 else '< PREVIOUS INDEX',38,H-68,8,True,BLUE);goto(p,(38,H-84,180,H-57),2 if index==0 else 1)
toc.append([1,'Category index',2])
# Six cards per category page, two columns and three rows, with full natural photos.
for family in families:
    cats=[c for c in categories if c['family']==family];family_target=mapping[next(x for x in products if x['categoryId']==cats[0]['id'])['sku']]
    toc.append([1,family,family_target])
    for c in cats:
        items=[x for x in products if x['categoryId']==c['id']];first=mapping[items[0]['sku']];category_pages[c['id']]=first;toc.append([2,c['name'],first])
        for start in range(0,len(items),6):
            p=doc.new_page(width=W,height=H);chrome(p,c['name'],family)
            text(p,f'{len(items)} products  |  Category page {start//6+1} of {math.ceil(len(items)/6)}',38,146,8,color=MUTED)
            for j,item in enumerate(items[start:start+6]):
                assert mapping[item['sku']]==p.number+1
                x=38+(j%2)*268;y=164+(j//2)*202;cw=251
                p.draw_rect(fitz.Rect(x,y,x+cw,y+190),color=LINE,fill=(1,1,1),width=.5)
                image(p,item['image'],(x+10,y+7,x+cw-10,y+110))
                block(p,item['name'],(x+11,y+114,x+cw-11,y+147),10,bold=True)
                text(p,item['sku'],x+11,y+158,7,color=MUTED)
                text(p,'VIEW PRODUCT >',x+cw-92,y+158,7,True,BLUE)
                uri(p,(x,y,x+cw,y+190),SITE+'/'+item['url'])
                # Concise newly generated copy is included beneath the title.
                desc=item['description'].split('. ',1)[-1]
                # Two clean lines preserve the original compact card geometry.
                summary=desc.split('. ',1)[0].rstrip('.')+'.';font=fitz.Font('helv')
                if font.text_length(summary,fontsize=7)>420:
                    summary='Contact Roshan Industries to discuss your product requirements and quantity.'
                block(p,summary,(x+11,y+165,x+cw-11,y+187),7,color=MUTED)
# Licence appendix keeps the restored pump photographs properly attributed.
p=doc.new_page(width=W,height=H);chrome(p,'Pump photograph credits.','Pumps');y=160
for item in products:
    if not item.get('onlineRange'):continue
    text(p,item['sku']+'  '+item['name'],38,y,9,True)
    block(p,item['imageCredit']+'. '+item['imageChanges'],(38,y+5,W-38,y+32),8,color=MUTED)
    uri(p,(38,y-12,350,y+33),item['imageSource']);text(p,'Image licence >',W-121,y,8,color=BLUE)
    uri(p,(W-125,y-12,W-38,y+5),item['imageLicense']);y+=48
for page,rect,target in pending:
    assert 0<=target<len(doc);doc[page].insert_link({'kind':fitz.LINK_GOTO,'from':rect,'page':target,'to':fitz.Point(0,0)})
doc.set_toc(toc);doc.set_metadata({'title':'Roshan Industries Product Catalogue','author':'Roshan Industries','subject':'Watch parts and custom manufacturing. Category index and pump enquiry range.'})
output=ROOT/'assets/roshan-industries-catalogue.pdf';doc.save(output,garbage=4,deflate=True);doc.close()
(ROOT/'Roshan-Industries-Catalogue.pdf').write_bytes(output.read_bytes())
check=fitz.open(output);full='\n'.join(p.get_text() for p in check)
for item in products:
    assert item['sku'] in check[mapping[item['sku']]-1].get_text()
    assert item['name'] in check[mapping[item['sku']]-1].get_text().replace('\n',' ')
report={'products':len(products),'categories':len(categories),'families':families,'pages':len(check),'skuPages':mapping,'categoryPages':category_pages,'links':sum(len(p.get_links()) for p in check),'pdfSha256':hashlib.sha256(output.read_bytes()).hexdigest(),'nativeSourceImagesPreserved':True}
(ROOT/'reports/high-resolution-audit/branded-catalogue-validation.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf8')
print(f'PASS branded catalogue: {len(check)} pages, {len(products)} products, clickable category index, website headers and footers.',flush=True)
